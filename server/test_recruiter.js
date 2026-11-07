import http from 'http'
import app from './src/app.js'

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

const server = app.listen(0, '127.0.0.1', async () => {
  const port = server.address().port
  console.log(`Recruiter test server running on 127.0.0.1:${port}`)

  const makeReq = (path, method = 'GET', headers = {}, body = null) => {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null
      const reqHeaders = {
        'Content-Type': 'application/json',
        ...headers,
      }
      if (payload) {
        reqHeaders['Content-Length'] = Buffer.byteLength(payload)
      }

      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path,
          method,
          headers: reqHeaders,
        },
        (res) => {
          let data = ''
          res.on('data', (chunk) => (data += chunk))
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, body: JSON.parse(data) })
            } catch {
              resolve({ status: res.statusCode, body: data })
            }
          })
        }
      )
      req.on('error', reject)
      if (payload) req.write(payload)
      req.end()
    })
  }

  try {
    console.log('--- TESTING RECRUITER DASHBOARD, JOBS & PIPELINE ISOLATION ---')

    // 1. Authenticate as recruiter Meera (Linear)
    const loginRes = await makeReq('/api/auth/login', 'POST', {}, {
      email: 'meera@linear.app',
      password: 'password123',
    })
    assert(loginRes.status === 200, `Recruiter login should succeed (Got: ${loginRes.status})`)
    const token = loginRes.body.token || loginRes.body.data?.token
    const authHeaders = { Authorization: `Bearer ${token}` }
    console.log('✓ Pass: Recruiter Meera logged in successfully')

    // 2. Student token blocked with 403 Forbidden
    const studentReg = await makeReq('/api/auth/register', 'POST', {}, {
      fullName: 'Test Student Recruiter Check',
      email: `test.student.recruiter.${Date.now()}@example.com`,
      password: 'password123',
      confirmPassword: 'password123',
      role: 'student',
      terms: true,
    })
    const studentToken = studentReg.body.token || studentReg.body.data?.token
    const forbiddenRes = await makeReq('/api/recruiter/dashboard', 'GET', {
      Authorization: `Bearer ${studentToken}`,
    })
    assert(forbiddenRes.status === 403, `Student should be forbidden from recruiter dashboard (Got: ${forbiddenRes.status})`)
    console.log('✓ Pass: Role-based protection blocks students with 403')

    // 3. GET /api/recruiter/dashboard
    console.log('Testing GET /api/recruiter/dashboard...')
    const dashRes = await makeReq('/api/recruiter/dashboard', 'GET', authHeaders)
    assert(dashRes.status === 200, `Recruiter dashboard should return 200 (Got: ${dashRes.status})`)
    const d = dashRes.body.data
    assert(d.recruiter.companyName === 'Linear', `Company should be Linear (Got: ${d.recruiter.companyName})`)

    // Independently query recruiter's jobs and candidates to calculate expected statistics from database
    const [jobsRes, candidatesRes] = await Promise.all([
      makeReq('/api/recruiter/jobs?limit=100', 'GET', authHeaders),
      makeReq('/api/recruiter/candidates', 'GET', authHeaders),
    ])
    assert(jobsRes.status === 200, `Jobs list fetch should succeed (Got: ${jobsRes.status})`)
    assert(candidatesRes.status === 200, `Candidates list fetch should succeed (Got: ${candidatesRes.status})`)

    const jobsData = jobsRes.body.data || {}
    const jobsList = Array.isArray(jobsData) ? jobsData : (jobsData.jobs || [])
    const candidatesList = Array.isArray(candidatesRes.body.data) ? candidatesRes.body.data : []

    const expectedOpenRoles = jobsData.counts?.active ?? jobsList.filter((j) => (j.status || 'Active').toLowerCase() !== 'closed').length
    const expectedTotalApplicants = candidatesList.length
    const expectedShortlisted = candidatesList.filter((c) => c.stage === 'shortlisted').length
    const expectedInterviews = candidatesList.filter((c) => c.stage === 'interview').length
    const expectedInReview = candidatesList.filter((c) => c.stage === 'in-review' || c.stage === 'applied').length
    const expectedOffer = candidatesList.filter((c) => c.stage === 'offer').length

    // Verify non-trivial database test fixtures exist for seed recruiter Meera
    assert(expectedTotalApplicants > 0, `Expected non-zero applicants for seed recruiter Meera, got ${expectedTotalApplicants}`)
    assert(expectedOpenRoles > 0, `Expected non-zero open roles for seed recruiter Meera, got ${expectedOpenRoles}`)

    // Verify dashboard KPI statistics match actual database records
    assert(
      d.stats.openRoles.value === expectedOpenRoles,
      `Open roles mismatch: dashboard=${d.stats.openRoles.value}, expected=${expectedOpenRoles}`
    )
    assert(
      d.stats.totalApplicants.value === expectedTotalApplicants,
      `Total applicants mismatch: dashboard=${d.stats.totalApplicants.value}, expected=${expectedTotalApplicants}`
    )
    assert(
      d.stats.shortlisted.value === expectedShortlisted,
      `Shortlisted count mismatch: dashboard=${d.stats.shortlisted.value}, expected=${expectedShortlisted}`
    )
    assert(
      d.stats.interviewsThisWeek.value === expectedInterviews,
      `Interviews mismatch: dashboard=${d.stats.interviewsThisWeek.value}, expected=${expectedInterviews}`
    )

    // Verify candidate pipeline funnel breakdown matches actual database records
    assert(
      d.candidatePipeline.applied === expectedTotalApplicants,
      `Pipeline applied mismatch: dashboard=${d.candidatePipeline.applied}, expected=${expectedTotalApplicants}`
    )
    assert(
      d.candidatePipeline.inReview === expectedInReview,
      `Pipeline inReview mismatch: dashboard=${d.candidatePipeline.inReview}, expected=${expectedInReview}`
    )
    assert(
      d.candidatePipeline.shortlisted === expectedShortlisted,
      `Pipeline shortlisted mismatch: dashboard=${d.candidatePipeline.shortlisted}, expected=${expectedShortlisted}`
    )
    assert(
      d.candidatePipeline.interview === expectedInterviews,
      `Pipeline interview mismatch: dashboard=${d.candidatePipeline.interview}, expected=${expectedInterviews}`
    )
    assert(
      d.candidatePipeline.offer === expectedOffer,
      `Pipeline offer mismatch: dashboard=${d.candidatePipeline.offer}, expected=${expectedOffer}`
    )

    // Verify array structures
    assert(Array.isArray(d.openRoles), 'Open roles must be an array')
    assert(d.openRoles.length === Math.min(5, expectedOpenRoles), `Open roles preview length mismatch: got ${d.openRoles.length}`)
    assert(Array.isArray(d.todaysInterviews), 'Today interviews must be an array')
    assert(d.todaysInterviews.length > 0, 'Today interviews should have scheduled items')
    assert(Array.isArray(d.recentApplications), 'Recent applications must be an array')
    assert(d.recentApplications.length === Math.min(6, expectedTotalApplicants), `Recent applications length mismatch: got ${d.recentApplications.length}`)
    console.log(`✓ Pass: Recruiter dashboard accurately verified against database records (${expectedTotalApplicants} applicants, ${expectedOpenRoles} roles, ${expectedShortlisted} shortlisted, ${expectedInterviews} interviews)`)

    // 4. GET /api/recruiter/jobs
    assert(Array.isArray(jobsList), 'Jobs should be an array')
    console.log(`✓ Pass: Recruiter jobs list retrieved (${jobsList.length} jobs)`)

    // 5. POST /api/recruiter/jobs (Create new job)
    const createJobRes = await makeReq('/api/recruiter/jobs', 'POST', authHeaders, {
      title: 'Senior Frontend Architect',
      description: 'Lead modern design system implementation at Linear.',
      location: 'Remote · India',
      type: 'Full-time',
      stipend: '₹30–45 LPA',
    })
    assert(createJobRes.status === 201, `Create job should return 201 (Got: ${createJobRes.status})`)
    assert(createJobRes.body.data.recruiterId === 'usr_recruiter_meera', 'Job should belong to Meera')
    console.log('✓ Pass: Job posted successfully and attached to recruiter ID')

    // 6. GET /api/recruiter/candidates
    assert(candidatesList.length > 0, 'Should return candidates')
    console.log(`✓ Pass: Retrieved ${candidatesList.length} candidate applications`)

    // 7. PATCH /api/recruiter/candidates/:id/stage
    const stageRes = await makeReq('/api/recruiter/candidates/app-rec-1/stage', 'PATCH', authHeaders, {
      stage: 'shortlisted',
    })
    assert(stageRes.status === 200, `Stage update should return 200 (Got: ${stageRes.status})`)
    assert(stageRes.body.data.stage === 'shortlisted', 'Stage should be updated to shortlisted')
    console.log('✓ Pass: Candidate stage successfully updated')

    // 8. DATA ISOLATION TEST: Register another recruiter from a different company
    const newRecruiterEmail = `recruiter_${Date.now()}@stripe.com`
    const registerOther = await makeReq('/api/auth/register', 'POST', {}, {
      fullName: 'Vikram Seth',
      email: newRecruiterEmail,
      password: 'password123',
      confirmPassword: 'password123',
      role: 'recruiter',
      companyName: 'Stripe',
      terms: true,
    })
    assert(registerOther.status === 201, `Other recruiter registration should succeed (Got: ${registerOther.status})`)
    const otherToken = registerOther.body.token
    const otherAuthHeaders = { Authorization: `Bearer ${otherToken}` }

    const otherDash = await makeReq('/api/recruiter/dashboard', 'GET', otherAuthHeaders)
    assert(otherDash.status === 200, `Other recruiter dashboard should return 200 (Got: ${otherDash.status})`)
    assert(otherDash.body.data.recruiter.companyName === 'Stripe', 'Other recruiter company must be Stripe')

    // Verify fresh recruiter starts with clean zero statistics
    assert(otherDash.body.data.stats.openRoles.value === 0, 'Fresh recruiter must have 0 open roles')
    assert(otherDash.body.data.stats.totalApplicants.value === 0, 'Fresh recruiter must have 0 applicants')
    assert(otherDash.body.data.stats.shortlisted.value === 0, 'Fresh recruiter must have 0 shortlisted')
    assert(otherDash.body.data.stats.interviewsThisWeek.value === 0, 'Fresh recruiter must have 0 interviews')
    assert(otherDash.body.data.candidatePipeline.applied === 0, 'Fresh recruiter pipeline applied must be 0')
    assert(otherDash.body.data.openRoles.length === 0, 'Fresh recruiter must have empty open roles list')
    assert(otherDash.body.data.recentApplications.length === 0, 'Fresh recruiter must have empty recent applications')

    // Crucial: other recruiter must NOT see Linear's jobs or candidates!
    assert(
      otherDash.body.data.openRoles.every((j) => j.company === 'Stripe'),
      'Other recruiter must only see their own company jobs'
    )
    console.log('✓ Pass: Strict data isolation verified. Other recruiter sees zero Linear data.')

    console.log('\n--- ALL RECRUITER BACKEND TESTS PASSED! ---')
    server.close(() => process.exit(0))
  } catch (err) {
    console.error('❌ Recruiter test failed:', err.message || err)
    server.close(() => process.exit(1))
  }
})
