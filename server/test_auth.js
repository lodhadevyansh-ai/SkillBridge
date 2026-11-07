import app from './src/app.js'

async function runTests() {
  console.log('--- Starting SkillBridge Backend Auth Test Suite ---')
  const server = app.listen(5099)
  const baseUrl = 'http://localhost:5099/api/auth'

  let passed = 0
  let failed = 0

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`)
      passed++
    } else {
      console.error(`❌ FAIL: ${message}`)
      failed++
    }
  }

  try {
    const testEmail = `test.student.${Date.now()}@example.com`

    // Test 1: Register new student
    const regRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Candidate',
        email: testEmail,
        password: 'securePassword123',
        confirmPassword: 'securePassword123',
        role: 'student',
        terms: true,
      }),
    })
    const regData = await regRes.json()
    assert(regRes.status === 201 && regData.success && regData.token, 'Student registration succeeds with 201 and token')
    assert(regData.user.fullName === 'Test Candidate' && !regData.user.passwordHash, 'Password hash is NEVER returned in response')

    const studentToken = regData.token

    // Test 2: Prevent duplicate registration
    const dupRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Candidate 2',
        email: testEmail,
        password: 'securePassword123',
        confirmPassword: 'securePassword123',
        role: 'student',
        terms: true,
      }),
    })
    const dupData = await dupRes.json()
    assert(dupRes.status === 409 && !dupData.success, 'Duplicate email registration is blocked with 409 Conflict')

    // Test 3: Password mismatch validation
    const mismatchRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Mismatch User',
        email: 'mismatch@example.com',
        password: 'password123',
        confirmPassword: 'differentPassword',
        role: 'student',
        terms: true,
      }),
    })
    assert(mismatchRes.status === 400, 'Mismatched passwords rejected with 400 Bad Request')

    // Test 4: Login with valid credentials
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'securePassword123',
      }),
    })
    const loginData = await loginRes.json()
    assert(loginRes.status === 200 && loginData.success && loginData.token, 'Login with valid credentials succeeds with 200')

    // Test 5: Login with wrong password
    const badLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrongPassword!',
      }),
    })
    assert(badLoginRes.status === 401, 'Login with invalid password rejected with 401')

    // Test 6: Authenticated /me endpoint
    const meRes = await fetch(`${baseUrl}/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    const meData = await meRes.json()
    assert(meRes.status === 200 && meData.user.email === testEmail, 'GET /api/auth/me returns authenticated user details')

    // Test 7: Role Authorization - Student can access student endpoint
    const studentAccessRes = await fetch(`${baseUrl}/student-only`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(studentAccessRes.status === 200, 'Student token can access /student-only')

    // Test 8: Role Authorization - Student cannot access recruiter endpoint
    const recruiterAccessRes = await fetch(`${baseUrl}/recruiter-only`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert(recruiterAccessRes.status === 403, 'Student token blocked from /recruiter-only with 403 Forbidden')

    // Test 9: Register Recruiter (requires companyName)
    const recruiterEmail = `recruiter.${Date.now()}@linear.app`
    const recRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Linear Recruiter',
        email: recruiterEmail,
        password: 'securePassword123',
        confirmPassword: 'securePassword123',
        role: 'recruiter',
        companyName: 'Linear',
        terms: true,
      }),
    })
    const recData = await recRes.json()
    assert(recRes.status === 201 && recData.user.companyName === 'Linear', 'Recruiter registered with company name')

    // Test 10: Recruiter token can access /recruiter-only
    const recAccessRes = await fetch(`${baseUrl}/recruiter-only`, {
      headers: { Authorization: `Bearer ${recData.token}` },
    })
    assert(recAccessRes.status === 200, 'Recruiter token can access /recruiter-only')

    // Test 11: Unauthenticated request rejected
    const unauthRes = await fetch(`${baseUrl}/me`)
    assert(unauthRes.status === 401, 'Unauthenticated request to protected endpoint rejected with 401')

    console.log(`\nResults: ${passed} passed, ${failed} failed.`)
  } finally {
    server.close()
  }
}

runTests().catch(console.error)

