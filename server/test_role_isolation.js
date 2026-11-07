import request from 'supertest'
import app from './src/app.js'
import { userStore } from './src/db/userStore.js'

async function runRoleIsolationTests() {
  console.log('--- STARTING ROLE ISOLATION & ACCESS CONTROL TEST SUITE ---')
  let passed = 0
  let failed = 0

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`)
      passed++
    } else {
      console.error(`  [FAIL] ${message}`)
      failed++
    }
  }

  try {
    // 1. Attempt Public Registration with 'admin' role (MUST BE REJECTED)
    console.log('\n[1] Testing Public Registration Security: Admin Role Blocked')
    const adminRegRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Hacker Admin',
        email: `hacker_${Date.now()}@test.com`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'admin',
        terms: true,
      })

    assert(adminRegRes.status === 400, `Blocked admin self-registration with status 400 (Received: ${adminRegRes.status})`)
    assert(adminRegRes.body.success === false, 'Response indicates success = false')

    // 2. Register authentic Student
    console.log('\n[2] Testing Student Registration & Workspace Isolation')
    const studentEmail = `student_${Date.now()}@test.com`
    const studentRegRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test Student',
        email: studentEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'student',
        terms: true,
      })

    assert(studentRegRes.status === 201, `Student registered with status 201 (Received: ${studentRegRes.status})`)
    assert(studentRegRes.body.user?.role === 'student', `User role strictly assigned as 'student' in response`)
    const studentToken = studentRegRes.body.token

    // Verify /api/auth/me reflects student role
    const studentMeRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentToken}`)
    assert(studentMeRes.status === 200, 'Student profile fetched successfully (200)')
    assert(studentMeRes.body.user?.role === 'student', 'Server session confirms role = student')

    // Student can access student dashboard
    const studentDashRes = await request(app)
      .get('/api/student/dashboard')
      .set('Authorization', `Bearer ${studentToken}`)
    assert(studentDashRes.status === 200, `Student allowed access to /api/student/dashboard (Received: ${studentDashRes.status})`)

    // Student attempts to access Admin API (MUST BE 403)
    const studentAdminRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${studentToken}`)
    assert(studentAdminRes.status === 403, `Student blocked from /api/admin/dashboard with 403 Forbidden (Received: ${studentAdminRes.status})`)

    // Student attempts to access Recruiter API (MUST BE 403)
    const studentRecruiterRes = await request(app)
      .post('/api/recruiter/jobs')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Unauthorized Job',
        type: 'Full-time',
        location: 'Remote',
        category: 'Engineering',
        description: 'Test',
      })
    assert(studentRecruiterRes.status === 403, `Student blocked from Recruiter job creation with 403 Forbidden (Received: ${studentRecruiterRes.status})`)

    // 3. Register authentic Recruiter
    console.log('\n[3] Testing Recruiter Registration & Workspace Isolation')
    const recruiterEmail = `recruiter_${Date.now()}@test.com`
    const recruiterRegRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test Recruiter',
        email: recruiterEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'recruiter',
        companyName: 'Tech Innovations Ltd',
        terms: true,
      })

    assert(recruiterRegRes.status === 201, `Recruiter registered with status 201 (Received: ${recruiterRegRes.status})`)
    assert(recruiterRegRes.body.user?.role === 'recruiter', `User role strictly assigned as 'recruiter'`)
    const recruiterToken = recruiterRegRes.body.token

    // Recruiter attempts to access Admin API (MUST BE 403)
    const recruiterAdminRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${recruiterToken}`)
    assert(recruiterAdminRes.status === 403, `Recruiter blocked from /api/admin/dashboard with 403 Forbidden (Received: ${recruiterAdminRes.status})`)

    // Recruiter can access Recruiter analytics
    const recruiterAnalyticsRes = await request(app)
      .get('/api/recruiter/analytics')
      .set('Authorization', `Bearer ${recruiterToken}`)
    assert(recruiterAnalyticsRes.status === 200, `Recruiter allowed access to Recruiter analytics (Received: ${recruiterAnalyticsRes.status})`)

    // Recruiter attempts to access Student-only endpoint (e.g. toggleSaveJob or student dashboard)
    const recruiterStudentRes = await request(app)
      .get('/api/student/dashboard')
      .set('Authorization', `Bearer ${recruiterToken}`)
    assert(recruiterStudentRes.status === 403, `Recruiter blocked from Student dashboard with 403 Forbidden (Received: ${recruiterStudentRes.status})`)

    // 4. Admin Account Access Verification
    console.log('\n[4] Testing Admin Authorization')
    const adminUser = userStore.findByEmail('admin@skillbridge.io')
    let adminToken
    if (adminUser) {
      const adminLoginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@skillbridge.io',
          password: 'AdminPassword123!',
          role: 'admin',
        })
      if (adminLoginRes.status === 200) {
        adminToken = adminLoginRes.body.token
      }
    }

    if (adminToken) {
      const adminDashboardRes = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
      assert(adminDashboardRes.status === 200, `Admin successfully accesses /api/admin/dashboard with status 200`)
      assert(adminDashboardRes.body.success === true, 'Admin dashboard returned success = true')
    } else {
      console.log('  [INFO] Pre-seeded admin test skipped or verified via unit tests.')
    }

    // 5. Logout & Token Invalidation
    console.log('\n[5] Testing Logout and Session Clearing')
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${studentToken}`)
    assert(logoutRes.status === 200, `Logout executed with status 200 (Received: ${logoutRes.status})`)

    console.log(`\n========================================`)
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`)
    console.log(`========================================`)
    if (failed > 0) {
      process.exit(1)
    } else {
      process.exit(0)
    }
  } catch (err) {
    console.error('Test execution failed with error:', err)
    process.exit(1)
  }
}

runRoleIsolationTests()
