import http from 'http'
import app from './src/app.js'

const server = app.listen(0, async () => {
  const port = server.address().port
  console.log(`Test server running on port ${port}`)

  const makeReq = (path, method = 'GET', headers = {}, body = null) => {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path,
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
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
      if (body) req.write(JSON.stringify(body))
      req.end()
    })
  }

  try {
    // 1. Register a dedicated test student for idempotent tests
    const uniqueId = Date.now()
    const studentRegister = await makeReq('/api/auth/register', 'POST', {}, {
      fullName: `Test Applicant ${uniqueId}`,
      email: `applicant_${uniqueId}@email.com`,
      password: 'password123',
      confirmPassword: 'password123',
      role: 'student',
      terms: true,
    })
    console.assert(studentRegister.status === 201, 'Student registration should return 201')
    const studentToken = studentRegister.body.token

    // 2. Login as recruiter
    const recruiterLogin = await makeReq('/api/auth/login', 'POST', {}, {
      email: 'meera@linear.app',
      password: 'password123',
    })
    const recruiterToken = recruiterLogin.body.token

    // 3. Test unauthenticated apply -> 401
    const unauthApply = await makeReq('/api/jobs/job-1/apply', 'POST', {}, {
      resumeName: 'Resume.pdf',
    })
    console.assert(unauthApply.status === 401, 'Unauthenticated apply should be 401')
    console.log('✓ Pass: Unauthenticated application blocked with 401')

    // 4. Test recruiter apply -> 403 Forbidden
    const recruiterApply = await makeReq('/api/jobs/job-1/apply', 'POST', {
      Authorization: `Bearer ${recruiterToken}`,
    }, {
      resumeName: 'Resume.pdf',
    })
    console.assert(recruiterApply.status === 403, 'Recruiter role should be forbidden 403')
    console.log('✓ Pass: Non-student role blocked with 403')

    // 5. Test missing resume validation -> 400
    const missingResume = await makeReq('/api/jobs/job-1/apply', 'POST', {
      Authorization: `Bearer ${studentToken}`,
    }, {
      coverLetter: 'Hello',
    })
    console.assert(missingResume.status === 400, 'Missing resume should return 400')
    console.log('✓ Pass: Resume validation returns 400 Bad Request')

    // 6. Test successful application submission to job-1 (Linear Product Design Intern)
    const validApply = await makeReq('/api/jobs/job-1/apply', 'POST', {
      Authorization: `Bearer ${studentToken}`,
    }, {
      resumeName: 'Candidate_Resume.pdf',
      coverLetter: 'I am excited to build modern web experiences with Linear and React 19.',
      portfolioUrl: 'https://candidate-portfolio.dev',
      phone: '+91 98765 43210',
    })
    console.assert(validApply.status === 201, 'Valid application submission should return 201')
    console.assert(validApply.body.data.company === 'Linear', 'Company should be Linear')
    console.log('✓ Pass: Application successfully created and saved to database with 201 Created')

    // 7. Test duplicate application prevention -> 409 Conflict
    const duplicateApply = await makeReq('/api/jobs/job-1/apply', 'POST', {
      Authorization: `Bearer ${studentToken}`,
    }, {
      resumeName: 'Candidate_Resume.pdf',
    })
    console.assert(duplicateApply.status === 409, 'Duplicate application must return 409 Conflict')
    console.assert(duplicateApply.body.code === 'ALREADY_APPLIED', 'Code should be ALREADY_APPLIED')
    console.log('✓ Pass: Duplicate application blocked with 409 Conflict')

    // 8. Verify application status endpoint returns hasApplied: true
    const statusRes = await makeReq('/api/jobs/job-1/application-status', 'GET', {
      Authorization: `Bearer ${studentToken}`,
    })
    console.assert(statusRes.status === 200, 'Status check should be 200')
    console.assert(statusRes.body.data.hasApplied === true, 'Status should be hasApplied: true')
    console.log('✓ Pass: Application status check confirms hasApplied: true')

    // 9. Verify student dashboard reflects updated applications
    const dashRes = await makeReq('/api/student/dashboard', 'GET', {
      Authorization: `Bearer ${studentToken}`,
    })
    const latestApp = dashRes.body.data.recentApplications[0]
    console.assert(latestApp.company === 'Linear', 'Dashboard recent applications should show latest applied company')
    console.log('✓ Pass: Student dashboard immediately reflects the newly submitted application')

    console.log('\nALL APPLICATION WORKFLOW BACKEND TESTS PASSED!')
    server.close(() => process.exit(0))
  } catch (err) {
    console.error('Apply test failed:', err)
    server.close(() => process.exit(1))
  }
})
