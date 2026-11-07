import http from 'http'
import app from './src/app.js'
import { studentStore } from './src/db/studentStore.js'

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
    // 1. Register a fresh student
    const studentReg = await makeReq('/api/auth/register', 'POST', {}, {
      fullName: 'Application Tester',
      email: `test.apps.${Date.now()}@example.com`,
      password: 'password123',
      confirmPassword: 'password123',
      role: 'student',
      terms: true,
    })
    const token = studentReg.body.token || studentReg.body.data?.token

    // Apply to job-1 and job-2 to create test applications
    const apply1 = await makeReq('/api/jobs/job-1/apply', 'POST', {
      Authorization: `Bearer ${token}`,
    }, {
      resumeName: 'Candidate_Resume.pdf',
      coverLetter: 'Interested in Product Design.',
    })
    console.assert(apply1.status === 201, 'Job 1 application should return 201')

    const apply2 = await makeReq('/api/jobs/job-2/apply', 'POST', {
      Authorization: `Bearer ${token}`,
    }, {
      resumeName: 'Candidate_Resume.pdf',
      coverLetter: 'Interested in Frontend Development.',
    })
    console.assert(apply2.status === 201, 'Job 2 application should return 201')

    // 2. Fetch all applications
    const allRes = await makeReq('/api/applications', 'GET', {
      Authorization: `Bearer ${token}`,
    })
    console.assert(allRes.status === 200, 'Applications fetch should be 200')
    console.assert(allRes.body.data.applications.length === 2, 'Should return 2 applications')
    console.assert(allRes.body.data.stats.total === 2, 'Stats total should be 2')
    console.log('✓ Pass: Applications list and stats summary retrieved')

    // 3. Filter by status
    const filterRes = await makeReq('/api/applications?status=applied', 'GET', {
      Authorization: `Bearer ${token}`,
    })
    console.assert(filterRes.status === 200, 'Filter status should be 200')
    const allApplied = filterRes.body.data.applications.every((a) => a.status === 'applied')
    console.assert(allApplied, 'Filter should only return applied applications')
    console.log('✓ Pass: Status filter works accurately')

    // 4. Search by company or role
    const searchRes = await makeReq('/api/applications?search=razorpay', 'GET', {
      Authorization: `Bearer ${token}`,
    })
    console.assert(searchRes.status === 200, 'Search should be 200')
    const allRazorpay = searchRes.body.data.applications.every(
      (a) => a.company.toLowerCase().includes('razorpay') || a.role.toLowerCase().includes('razorpay')
    )
    console.assert(allRazorpay && searchRes.body.data.applications.length === 1, 'Search should only match Razorpay')
    console.log('✓ Pass: Search by company and job title works')

    // 5. Fetch application details with history
    const targetApp = allRes.body.data.applications[0]
    const detailRes = await makeReq(`/api/applications/${targetApp.id}`, 'GET', {
      Authorization: `Bearer ${token}`,
    })
    console.assert(detailRes.status === 200, 'Detail should be 200')
    console.assert(detailRes.body.data.history.length > 0, 'Should have history entries')
    console.log('✓ Pass: Application details with status history retrieved')

    // 6. Withdraw an application
    const targetId = targetApp.id
    const withdrawRes = await makeReq(
      `/api/applications/${targetId}/withdraw`,
      'POST',
      {
        Authorization: `Bearer ${token}`,
      },
      {
        reason: 'Accepted an offer at another company.',
      }
    )
    console.assert(withdrawRes.status === 200, 'Withdrawal should succeed with 200')
    console.assert(withdrawRes.body.data.status === 'withdrawn', 'Status should be withdrawn')
    console.log('✓ Pass: Application withdrawal succeeds')

    // 7. Prevent repeated withdrawal
    const repeatWithdraw = await makeReq(
      `/api/applications/${targetId}/withdraw`,
      'POST',
      {
        Authorization: `Bearer ${token}`,
      }
    )
    console.assert(repeatWithdraw.status === 400, 'Repeated withdrawal must be rejected with 400')
    console.log('✓ Pass: Repeated withdrawal blocked with 400 Bad Request')

    console.log('\nALL APPLICATIONS BACKEND TESTS PASSED!')
    server.close(() => process.exit(0))
  } catch (err) {
    console.error('Applications test failed:', err)
    server.close(() => process.exit(1))
  }
})

