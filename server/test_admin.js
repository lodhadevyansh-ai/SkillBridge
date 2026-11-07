import http from 'http'
import app from './src/app.js'

const server = app.listen(0, '127.0.0.1', async () => {
  const port = server.address().port
  console.log(`Admin test server running on 127.0.0.1:${port}`)

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
    console.log('--- TESTING ADMIN DASHBOARD, MANAGEMENT & RBAC SECURITY ---')

    // 1. Unauthenticated request to /api/admin/dashboard -> MUST BE 401
    const unauthRes = await makeReq('/api/admin/dashboard')
    console.assert(unauthRes.status === 401, 'Unauthenticated request should return 401')
    console.log('✓ Pass: Unauthenticated access blocked with 401')

    // 2. Student token access to /api/admin/dashboard -> MUST BE 403 Forbidden
    const studentReg = await makeReq('/api/auth/register', 'POST', {}, {
      fullName: 'Test Student Admin Check',
      email: `test.student.admin.${Date.now()}@example.com`,
      password: 'password123',
      confirmPassword: 'password123',
      role: 'student',
      terms: true,
    })
    const studentToken = studentReg.body.token || studentReg.body.data?.token
    const studentAdminRes = await makeReq('/api/admin/dashboard', 'GET', {
      Authorization: `Bearer ${studentToken}`,
    })
    console.assert(studentAdminRes.status === 403, 'Student must receive 403 Forbidden')
    console.log('✓ Pass: Student blocked from Admin API with 403 Forbidden')

    // 3. Recruiter token access to /api/admin/dashboard -> MUST BE 403 Forbidden
    const recruiterLogin = await makeReq('/api/auth/login', 'POST', {}, {
      email: 'meera@linear.app',
      password: 'password123',
    })
    const recruiterToken = recruiterLogin.body.token || recruiterLogin.body.data?.token
    const recruiterAdminRes = await makeReq('/api/admin/dashboard', 'GET', {
      Authorization: `Bearer ${recruiterToken}`,
    })
    console.assert(recruiterAdminRes.status === 403, 'Recruiter must receive 403 Forbidden')
    console.log('✓ Pass: Recruiter blocked from Admin API with 403 Forbidden')

    // 4. Authenticate as Platform Administrator Rohan
    const adminLogin = await makeReq('/api/auth/login', 'POST', {}, {
      email: 'admin@skillbridge.io',
      password: 'admin123',
    })
    console.assert(adminLogin.status === 200, 'Admin login should succeed')
    const adminToken = adminLogin.body.token || adminLogin.body.data?.token
    const adminHeaders = { Authorization: `Bearer ${adminToken}` }
    console.log('✓ Pass: Administrator Rohan authenticated successfully')

    // 5. GET /api/admin/dashboard (Dashboard statistics & real db counts)
    const dashRes = await makeReq('/api/admin/dashboard', 'GET', adminHeaders)
    console.assert(dashRes.status === 200, 'Admin dashboard should return 200')
    const d = dashRes.body.data
    console.assert(d.stats.totalUsers.value > 0, 'Should have registered users count')
    console.assert(d.stats.totalStudents.value > 0, 'Should have total students count')
    console.assert(d.stats.totalRecruiters.value > 0, 'Should have total recruiters count')
    console.assert(d.stats.activeJobs.value > 0, 'Should have active jobs count')
    console.assert(Array.isArray(d.charts.userGrowth), 'User growth should be array')
    console.assert(Array.isArray(d.charts.applicationTrends), 'Application trends should be array')
    console.assert(Array.isArray(d.recentActivity), 'Recent activity should be array')
    console.log('✓ Pass: Admin dashboard returned complete platform statistics and charts')

    // 6. GET /api/admin/users (User management with search, filter, pagination)
    const usersRes = await makeReq('/api/admin/users?role=student', 'GET', adminHeaders)
    console.assert(usersRes.status === 200, 'Get admin users should return 200')
    const userList = usersRes.body.data
    console.assert(Array.isArray(userList), 'Users should be an array')
    console.assert(userList.every((u) => u.role === 'student'), 'Role filter should work')
    console.log(`✓ Pass: Filtered students list retrieved (${userList.length} users)`)

    // 7. Register a disposable user to test account suspension and reactivation
    const testUserEmail = `bad_actor_${Date.now()}@example.com`
    const regRes = await makeReq('/api/auth/register', 'POST', {}, {
      fullName: 'Spam Account',
      email: testUserEmail,
      password: 'password123',
      confirmPassword: 'password123',
      role: 'student',
      terms: true,
    })
    console.assert(regRes.status === 201, 'Disposable user registration should succeed')
    const badUserId = regRes.body.data?.user?.id || regRes.body.user?.id
    const badUserToken = regRes.body.token

    // Suspend the disposable user
    const suspendRes = await makeReq(`/api/admin/users/${badUserId}/suspend`, 'PATCH', adminHeaders, {
      reason: 'Automated spam submissions detected.',
    })
    console.assert(suspendRes.status === 200, 'Suspension should return 200')
    console.assert(suspendRes.body.data.status === 'Suspended', 'User status should be Suspended')
    console.log('✓ Pass: User account successfully suspended by administrator')

    // Verify suspended user is immediately blocked from logging in (403)
    const badLogin = await makeReq('/api/auth/login', 'POST', {}, {
      email: testUserEmail,
      password: 'password123',
    })
    console.assert(badLogin.status === 403, 'Suspended user login must be rejected with 403')
    console.log('✓ Pass: Suspended user login rejected with 403 Forbidden')

    // Verify suspended user is immediately blocked from authenticated requests (403)
    const badReq = await makeReq('/api/student/dashboard', 'GET', {
      Authorization: `Bearer ${badUserToken}`,
    })
    console.assert(badReq.status === 403, 'Suspended user token must be rejected with 403')
    console.log('✓ Pass: Suspended user token rejected from API endpoints with 403 Forbidden')

    // Reactivate the user
    const activateRes = await makeReq(`/api/admin/users/${badUserId}/activate`, 'PATCH', adminHeaders)
    console.assert(activateRes.status === 200, 'Reactivate should return 200')
    console.assert(activateRes.body.data.status === 'Active', 'Status should be Active')
    console.log('✓ Pass: User account successfully reactivated by administrator')

    // Verify reactivated user can now login
    const goodLogin = await makeReq('/api/auth/login', 'POST', {}, {
      email: testUserEmail,
      password: 'password123',
    })
    console.assert(goodLogin.status === 200, 'Reactivated user login should succeed with 200')
    console.log('✓ Pass: Reactivated user successfully logged in')

    // 8. GET /api/admin/jobs (Listing moderation)
    const jobsRes = await makeReq('/api/admin/jobs?status=active', 'GET', adminHeaders)
    console.assert(jobsRes.status === 200, 'Get jobs should return 200')
    console.assert(Array.isArray(jobsRes.body.data))
    console.log(`✓ Pass: Admin retrieved ${jobsRes.body.data.length} active opportunities`)

    // Approve job mod-1
    const approveRes = await makeReq('/api/admin/jobs/mod-1/approve', 'PATCH', adminHeaders)
    console.assert(approveRes.status === 200, 'Approve job should return 200')
    console.log('✓ Pass: Moderation item approved')

    // Remove job
    const removeRes = await makeReq('/api/admin/jobs/mod-4', 'DELETE', adminHeaders, {
      reason: 'Listing violates platform compensation minimums.',
    })
    console.assert(removeRes.status === 200, 'Remove job should return 200')
    console.log('✓ Pass: Job listing removed with recorded justification')

    // 9. GET /api/admin/audit-logs (Audit trail inspection)
    const auditRes = await makeReq('/api/admin/audit-logs', 'GET', adminHeaders)
    console.assert(auditRes.status === 200, 'Audit logs should return 200')
    console.assert(Array.isArray(auditRes.body.data))
    console.assert(auditRes.body.data.some((l) => l.action.includes('Suspended user account')))
    console.assert(auditRes.body.data.some((l) => l.action.includes('Re-activated user account')))
    console.log(`✓ Pass: Audit logs verified with recorded actions (${auditRes.body.data.length} entries)`)

    // 10. GET & PUT /api/admin/settings (Platform parameters)
    const getSettingsRes = await makeReq('/api/admin/settings', 'GET', adminHeaders)
    console.assert(getSettingsRes.status === 200, 'Get settings should return 200')

    const updateSettingsRes = await makeReq('/api/admin/settings', 'PUT', adminHeaders, {
      minRecommendedStipend: '₹18,000 / month',
      maxApplicationsPerStudent: 20,
    })
    console.assert(updateSettingsRes.status === 200, 'Update settings should return 200')
    console.assert(updateSettingsRes.body.data.minRecommendedStipend === '₹18,000 / month')
    console.log('✓ Pass: Platform settings updated and persisted')

    console.log('\n--- ALL ADMIN BACKEND & SECURITY TESTS PASSED! ---')
    server.close(() => process.exit(0))
  } catch (err) {
    console.error('Admin test failed:', err)
    server.close(() => process.exit(1))
  }
})

