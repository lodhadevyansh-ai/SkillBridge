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
    // 1. Try unauthenticated dashboard without headers -> Expect 401
    const unauth = await makeReq('/api/student/dashboard')
    console.assert(unauth.status === 401, 'Unauthenticated access should be 401')
    console.log('✓ Pass: Unauthenticated 401')

    // 2. Register fresh student to get real JWT token
    const testEmail = `test.student.${Date.now()}@example.com`
    const regRes = await makeReq('/api/auth/register', 'POST', {}, {
      fullName: 'Test Candidate',
      email: testEmail,
      password: 'password123',
      confirmPassword: 'password123',
      role: 'student',
      terms: true,
    })
    console.assert(regRes.status === 201, 'Student registration failed')
    const token = regRes.body.token
    console.log('✓ Pass: Student registration successful')

    // 3. Fetch dashboard with real JWT token
    const dashRes = await makeReq('/api/student/dashboard', 'GET', {
      Authorization: `Bearer ${token}`,
    })
    console.assert(dashRes.status === 200, 'Student dashboard should return 200')
    console.assert(dashRes.body.data.stats.applicationsSent.value === 0, 'Initial applications sent should be 0')
    console.assert(dashRes.body.data.stats.inReview.value === 0, 'Initial in review should be 0')
    console.assert(dashRes.body.data.stats.interviews.value === 0, 'Initial interviews should be 0')
    console.assert(dashRes.body.data.stats.savedJobs.value === 0, 'Initial saved jobs should be 0')
    console.log('✓ Pass: Student dashboard returned clean initial data for newly registered candidate')

    // 4. Toggle bookmark/save job
    const saveRes = await makeReq('/api/student/jobs/job-1/save', 'POST', {
      Authorization: `Bearer ${token}`,
    })
    console.assert(saveRes.status === 200, 'Save job should return 200')
    console.log('✓ Pass: Toggle save job works cleanly:', saveRes.body.message)

    // 5. Verify saved jobs count updated in dashboard
    const updatedDash = await makeReq('/api/student/dashboard', 'GET', {
      Authorization: `Bearer ${token}`,
    })
    console.assert(updatedDash.body.data.stats.savedJobs.value === 1, 'Saved jobs count should now be 1')
    console.log('✓ Pass: Dashboard reflects saved job persistence')

    console.log('\nALL STUDENT BACKEND TESTS PASSED!')
    server.close(() => process.exit(0))
  } catch (err) {
    console.error('Test failed:', err)
    server.close(() => process.exit(1))
  }
})

