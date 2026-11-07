import assert from 'assert'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import app from './src/app.js'
import { userStore } from './src/db/userStore.js'
import { studentStore } from './src/db/studentStore.js'
import { recruiterStore } from './src/db/recruiterStore.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let server
let baseUrl

async function makeRequest(endpoint, { method = 'GET', headers = {}, body = null } = {}) {
  const url = `${baseUrl}${endpoint}`
  const reqHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  }

  const res = await fetch(url, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  return { status: res.status, body: data }
}

async function runTests() {
  console.log('--- STARTING PERMANENT DELETE ACCOUNT AUTOMATED TEST SUITE ---')

  await new Promise((resolve) => {
    server = http.createServer(app)
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port
      baseUrl = `http://127.0.0.1:${port}`
      console.log(`Test server running on ${baseUrl}`)
      resolve()
    })
  })

  try {
    const timestamp = Date.now()
    const studentEmail = `delete.student.${timestamp}@example.com`
    const studentPassword = 'SecurePassword123!'

    // =========================================================================
    // TEST CASE 1: Create a new student account
    // =========================================================================
    console.log('\n[TEST CASE 1]: Creating new student account...')
    const regRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Candidate To Delete',
        email: studentEmail,
        password: studentPassword,
        confirmPassword: studentPassword,
        role: 'student',
        terms: true,
      },
    })

    assert.strictEqual(regRes.status, 201, 'Student registration should return 201')
    assert(regRes.body.token, 'Registration should return an authentication token')
    const studentToken = regRes.body.token
    const studentId = regRes.body.user.id
    console.log(`✓ Pass: Student registered successfully with ID: ${studentId}`)

    // =========================================================================
    // TEST CASE 2: Add profile information, save jobs, and submit a job application
    // =========================================================================
    console.log('\n[TEST CASE 2]: Adding profile info, saved jobs, resumes, and submitting job application...')
    
    // Update profile
    const profileUpdate = await makeRequest('/api/student/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        headline: 'Aspiring Product Designer',
        phone: '+91 99887 76655',
        skills: ['Figma', 'UI Design', 'Prototyping'],
      },
    })
    assert.strictEqual(profileUpdate.status, 200, 'Profile update should return 200')

    // Upload resume
    const resumeUpload = await makeRequest('/api/student/resumes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        name: 'Candidate_Portfolio_Resume.pdf',
        fileSize: 240000,
        fileType: 'application/pdf',
      },
    })
    assert.strictEqual(resumeUpload.status, 201, 'Resume upload should return 201')

    // Bookmark / save a job
    const saveJob = await makeRequest('/api/student/jobs/job-1/save', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert.strictEqual(saveJob.status, 200, 'Saving job should return 200')

    // Apply to job-1 (Linear Product Design Intern)
    const applyRes = await makeRequest('/api/jobs/job-1/apply', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        resumeName: 'Candidate_Portfolio_Resume.pdf',
        coverLetter: 'Excited about the product design opportunity.',
      },
    })
    assert.strictEqual(applyRes.status, 201, 'Job application should return 201')
    console.log('✓ Pass: Student profile, resume, saved job, and application successfully established')

    // =========================================================================
    // TEST CASE 3: Navigate to Settings & verify delete endpoint requires authentication
    // =========================================================================
    console.log('\n[TEST CASE 3]: Checking authentication requirement on DELETE /api/auth/account...')
    const unauthDelete = await makeRequest('/api/auth/account', {
      method: 'DELETE',
      body: { password: studentPassword, confirmation: 'DELETE' },
    })
    assert.strictEqual(unauthDelete.status, 401, 'Unauthenticated deletion request must be rejected with 401')
    console.log('✓ Pass: Unauthenticated deletion blocked with 401 Unauthorized')

    // =========================================================================
    // TEST CASE 4: Enter an incorrect password
    // =========================================================================
    console.log('\n[TEST CASE 4]: Testing deletion with incorrect password...')
    const wrongPasswordRes = await makeRequest('/api/auth/account', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        password: 'IncorrectPassword999!',
        confirmation: 'DELETE',
      },
    })
    assert.strictEqual(wrongPasswordRes.status, 401, 'Incorrect password must be rejected with 401')
    assert.strictEqual(wrongPasswordRes.body.message, 'Incorrect password. Please try again.')
    assert(userStore.findById(studentId), 'Account must NOT be deleted after wrong password attempt')
    console.log('✓ Pass: Incorrect password rejected with exact message: "Incorrect password. Please try again."')

    // =========================================================================
    // TEST CASE 5: Enter correct password but incorrect confirmation text
    // =========================================================================
    console.log('\n[TEST CASE 5]: Testing deletion with invalid confirmation text...')
    const wrongConfirmRes = await makeRequest('/api/auth/account', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        password: studentPassword,
        confirmation: 'delete_me_please',
      },
    })
    assert.strictEqual(wrongConfirmRes.status, 400, 'Invalid confirmation text must return 400 Bad Request')
    assert(userStore.findById(studentId), 'Account must NOT be deleted after invalid confirmation text')
    console.log('✓ Pass: Invalid confirmation text rejected with 400 Bad Request')

    // =========================================================================
    // TEST CASE 6: Enter correct password and type DELETE
    // =========================================================================
    console.log('\n[TEST CASE 6]: Executing permanent account deletion with correct credentials & DELETE confirmation...')
    const validDeleteRes = await makeRequest('/api/auth/account', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        password: studentPassword,
        confirmation: 'DELETE',
      },
    })
    assert.strictEqual(validDeleteRes.status, 200, 'Valid account deletion must return 200 OK')
    assert.strictEqual(
      validDeleteRes.body.message,
      'Your SkillBridge account has been permanently deleted.'
    )

    // Verify database records are genuinely purged
    assert.strictEqual(userStore.findById(studentId), null, 'User record must be removed from userStore')
    const studentData = studentStore.readData()
    assert(!studentData.profiles[studentId], 'Student profile must be purged')
    assert(!studentData.applications[studentId], 'Student applications must be purged')
    assert(!studentData.savedJobs[studentId], 'Student saved jobs must be purged')
    assert(!studentData.resumes[studentId], 'Student resumes must be purged')
    console.log('✓ Pass: Account and all associated records permanently purged from database')

    // =========================================================================
    // TEST CASE 7: Try logging in again with the deleted email and password
    // =========================================================================
    console.log('\n[TEST CASE 7]: Attempting login with deleted credentials...')
    const deletedLoginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: studentEmail,
        password: studentPassword,
      },
    })
    assert.strictEqual(deletedLoginRes.status, 401, 'Login for deleted account must return 401')
    assert.strictEqual(
      deletedLoginRes.body.message,
      'Account does not exist.',
      'Backend must return exact message: "Account does not exist."'
    )
    console.log('✓ Pass: Deleted user login rejected with exact message: "Account does not exist."')

    // =========================================================================
    // TEST CASE 8: Try accessing protected routes using the previous session/token
    // =========================================================================
    console.log('\n[TEST CASE 8]: Attempting protected route access with invalidated token...')
    const protectedRes = await makeRequest('/api/student/dashboard', {
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert.strictEqual(protectedRes.status, 401, 'Invalidated token must be blocked with 401')
    console.log('✓ Pass: Access denied for invalidated token on protected routes')

    // =========================================================================
    // TEST CASE 9: Register again using the same email address
    // =========================================================================
    console.log('\n[TEST CASE 9]: Re-registering with the previously deleted email address...')
    const reregisterRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Re-registered Candidate',
        email: studentEmail,
        password: 'NewBrandPassword456!',
        confirmPassword: 'NewBrandPassword456!',
        role: 'student',
        terms: true,
      },
    })
    assert.strictEqual(reregisterRes.status, 201, 'Re-registration with freed email address must succeed with 201')
    assert(reregisterRes.body.user.id !== studentId, 'New registration must have a distinct new user ID')
    console.log('✓ Pass: Email address successfully reusable for fresh registration')

    // Clean up re-registered account
    userStore.deleteUser(reregisterRes.body.user.id)

    // =========================================================================
    // TEST CASE 10: Repeat process with a Recruiter account
    // =========================================================================
    console.log('\n[TEST CASE 10]: Testing recruiter account deletion and cascade cleanup...')
    const recEmail = `delete.recruiter.${timestamp}@example.com`
    const recPassword = 'RecruiterPassword123!'

    const recReg = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Hiring Lead To Delete',
        email: recEmail,
        password: recPassword,
        confirmPassword: recPassword,
        role: 'recruiter',
        companyName: `TestCorp_${timestamp}`,
        terms: true,
      },
    })
    assert.strictEqual(recReg.status, 201)
    const recToken = recReg.body.token
    const recId = recReg.body.user.id

    // Post a recruiter job
    const jobRes = await makeRequest('/api/recruiter/jobs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${recToken}` },
      body: {
        title: 'Backend Systems Engineer',
        location: 'Bengaluru, India',
        arrangement: 'Remote',
        type: 'Full-time',
        experience: 'Fresher',
        description: 'Design robust distributed backend architectures.',
        skills: ['Node.js', 'PostgreSQL', 'Express'],
        status: 'Active',
      },
    })
    assert.strictEqual(jobRes.status, 201)
    const createdJobId = jobRes.body.data.id

    // Delete recruiter account
    const recDeleteRes = await makeRequest('/api/auth/account', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${recToken}` },
      body: {
        password: recPassword,
        confirmation: 'DELETE',
      },
    })
    assert.strictEqual(recDeleteRes.status, 200, 'Recruiter deletion must succeed with 200')

    // Verify recruiter record and owned jobs are purged
    assert.strictEqual(userStore.findById(recId), null, 'Recruiter user record must be purged')
    const allJobs = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'jobs.json'), 'utf-8'))
    const foundJob = allJobs.find((j) => j.id === createdJobId)
    assert(!foundJob, 'Recruiter-owned job must be purged from master jobs.json')

    // Verify recruiter login returns "Account does not exist."
    const recDeletedLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: recEmail, password: recPassword },
    })
    assert.strictEqual(recDeletedLogin.status, 401)
    assert.strictEqual(recDeletedLogin.body.message, 'Account does not exist.')
    console.log('✓ Pass: Recruiter account, owned jobs, and pipeline cascade-deleted cleanly')

    // =========================================================================
    // TEST CASE 11: Verify administrator cannot accidentally delete last active admin
    // =========================================================================
    console.log('\n[TEST CASE 11]: Testing administrative protection against deleting last active admin...')
    
    // Login as the existing admin Rohan
    const adminLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@skillbridge.io',
        password: 'admin123',
      },
    })
    assert.strictEqual(adminLogin.status, 200, 'Admin login should succeed')
    const adminToken = adminLogin.body.token

    // Try to delete the single active admin account
    const deleteLastAdminRes = await makeRequest('/api/auth/account', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        password: 'admin123',
        confirmation: 'DELETE',
      },
    })
    assert.strictEqual(deleteLastAdminRes.status, 403, 'Deleting last active admin must be blocked with 403')
    assert(
      deleteLastAdminRes.body.message.includes('last active administrator'),
      'Must explain that last active administrator cannot be deleted'
    )
    console.log('✓ Pass: Last active administrator deletion blocked with 403 Forbidden')

    console.log('\n=================================================================')
    console.log('ALL 11 ACCOUNT DELETION TEST CASES PASSED SUCCESSFULLY!')
    console.log('=================================================================')
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve))
    }
  }
}

runTests().catch((err) => {
  console.error('\n❌ Account deletion test failed:', err)
  process.exit(1)
})
