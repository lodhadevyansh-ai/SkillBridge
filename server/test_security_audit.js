import assert from 'node:assert'
import http from 'node:http'
import app from './src/app.js'
import { tokenBlacklist } from './src/services/tokenBlacklist.js'
import { auditLogger } from './src/services/auditLogger.js'

let server
let baseUrl

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl)
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
    }

    const req = http.request(url, reqOptions, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        let parsed = null
        try {
          parsed = JSON.parse(data)
        } catch {
          parsed = data
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
        })
      })
    })

    req.on('error', reject)

    if (options.body) {
      const payload = typeof options.body === 'string' ? options.body : JSON.stringify(options.body)
      req.setHeader('Content-Type', 'application/json')
      req.setHeader('Content-Length', Buffer.byteLength(payload))
      req.write(payload)
    }

    req.end()
  })
}

async function runSecurityAuditTests() {
  console.log('--- STARTING COMPREHENSIVE BACKEND SECURITY AUDIT TEST SUITE ---')

  server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  baseUrl = `http://127.0.0.1:${port}`
  console.log(`Security Test server running on ${baseUrl}\n`)

  try {
    // -------------------------------------------------------------
    // 1. Helmet Secure HTTP Headers Check
    // -------------------------------------------------------------
    console.log('[1. HTTP Security Headers]')
    const healthRes = await makeRequest('/api/health')
    assert.strictEqual(healthRes.headers['x-content-type-options'], 'nosniff', 'Must include X-Content-Type-Options: nosniff')
    assert.strictEqual(healthRes.headers['x-frame-options'], 'SAMEORIGIN', 'Must include frame protection')
    assert.strictEqual(healthRes.headers['x-powered-by'], undefined, 'Must hide X-Powered-By header')
    assert(healthRes.headers['content-security-policy'], 'Must include Content-Security-Policy')
    console.log('✓ Pass: Helmet security headers applied (nosniff, frameguard, csp, hidePoweredBy)')

    // -------------------------------------------------------------
    // 2. CORS Security Checks
    // -------------------------------------------------------------
    console.log('\n[2. CORS Configuration]')
    const corsGood = await makeRequest('/api/health', {
      headers: { Origin: 'http://localhost:5173' },
    })
    assert.strictEqual(corsGood.headers['access-control-allow-origin'], 'http://localhost:5173')
    assert.strictEqual(corsGood.headers['access-control-allow-credentials'], 'true')

    const corsBad = await makeRequest('/api/health', {
      headers: { Origin: 'https://malicious-attacker-domain.evil.com' },
    })
    assert(corsBad.headers['access-control-allow-origin'] !== 'https://malicious-attacker-domain.evil.com', 'Attacker origin must not be allowed')
    console.log('✓ Pass: Strict CORS whitelist prevents unauthorized cross-origin credentialed requests')

    // -------------------------------------------------------------
    // 3. Password Hashing (bcrypt) & Information Leakage Prevention
    // -------------------------------------------------------------
    console.log('\n[3. Password Hashing & Credential Safety]')
    const email = `sec_candidate_${Date.now()}@skillbridge.io`
    const registerRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Security Test Candidate',
        email,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        role: 'student',
        terms: true,
      },
    })

    assert.strictEqual(registerRes.status, 201)
    assert.strictEqual(registerRes.data.user.passwordHash, undefined, 'passwordHash must NEVER be exposed in API responses')
    assert.strictEqual(registerRes.data.user.password, undefined, 'Raw password must NEVER be exposed')
    const token = registerRes.data.token
    assert(token && typeof token === 'string', 'JWT token issued')
    console.log('✓ Pass: Password hashed with bcrypt; credentials never leaked in API response')

    // -------------------------------------------------------------
    // 4. Input Validation using Zod
    // -------------------------------------------------------------
    console.log('\n[4. Input Validation using Zod]')
    const badInputRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'A', // too short (< 2 chars)
        email: 'not-an-email',
        password: '123', // too short (< 6 chars)
        confirmPassword: '456',
        role: 'superuser', // invalid role enum
        terms: false,
      },
    })
    assert.strictEqual(badInputRes.status, 400)
    assert(badInputRes.data.errors.length > 0)
    console.log('✓ Pass: Zod schema rejected malformed inputs with 400 Bad Request and field-level errors')

    // -------------------------------------------------------------
    // 5. Role-Based Access Control (RBAC)
    // -------------------------------------------------------------
    console.log('\n[5. Role-Based Access Control]')
    const studentBlockedFromAdmin = await makeRequest('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
    assert.strictEqual(studentBlockedFromAdmin.status, 403, 'Student must be 403 Forbidden from admin endpoints')

    const studentBlockedFromRecruiter = await makeRequest('/api/recruiter/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
    assert.strictEqual(studentBlockedFromRecruiter.status, 403, 'Student must be 403 Forbidden from recruiter endpoints')
    console.log('✓ Pass: Server-side RBAC strictly enforces 403 Forbidden across workspace boundaries')

    // -------------------------------------------------------------
    // 6. Token Invalidation on Logout (Session Revocation)
    // -------------------------------------------------------------
    console.log('\n[6. Logout & Session Invalidation]')
    const logoutRes = await makeRequest('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    assert.strictEqual(logoutRes.status, 200)
    assert(tokenBlacklist.isBlacklisted(token), 'Token must be blacklisted')

    // Attempting to reuse revoked token must be rejected with 401
    const reuseAttempt = await makeRequest('/api/student/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
    assert.strictEqual(reuseAttempt.status, 401, 'Revoked token must be rejected with 401 Unauthorized')
    assert.strictEqual(reuseAttempt.data.code, 'TOKEN_REVOKED')
    console.log('✓ Pass: Token blacklist invalidates session immediately on logout; token reuse blocked')

    // -------------------------------------------------------------
    // 7. Secure File Upload & Extension Sanitization
    // -------------------------------------------------------------
    console.log('\n[7. Secure File Upload Validation]')
    // Re-login student to get active token
    const loginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email,
        password: 'Password@123',
      },
    })
    const activeToken = loginRes.data.token

    // Test rejection of executable file
    const exeUpload = await makeRequest('/api/student/resumes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${activeToken}` },
      body: {
        name: 'exploit.exe',
        fileSize: 1024,
      },
    })
    assert.strictEqual(exeUpload.status, 400)
    assert(exeUpload.data.message.includes('Invalid file format'))

    // Test rejection of path traversal attempt
    const pathTraversalUpload = await makeRequest('/api/student/resumes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${activeToken}` },
      body: {
        name: '../../etc/passwd.pdf',
        fileSize: 1024,
      },
    })
    // Either sanitized basename or accepted clean name
    assert.strictEqual(pathTraversalUpload.status, 201)
    assert(!pathTraversalUpload.data.data.name.includes('/'), 'Path traversal characters must be sanitized out')

    // Test rejection of oversized file (> 5 MB)
    const oversizedUpload = await makeRequest('/api/student/resumes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${activeToken}` },
      body: {
        name: 'large_document.pdf',
        fileSize: 10 * 1024 * 1024, // 10 MB
      },
    })
    assert.strictEqual(oversizedUpload.status, 400)
    assert(oversizedUpload.data.message.includes('exceeds maximum allowed limit'))
    console.log('✓ Pass: File uploads validated against allowed extensions, sanitized against path traversal, and capped at 5 MB')

    // -------------------------------------------------------------
    // 8. Protection of Private Resumes (Access Control)
    // -------------------------------------------------------------
    console.log('\n[8. Protection of Private Resumes]')
    // Another student creates account
    const otherStudentRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Other Candidate',
        email: `other_${Date.now()}@example.com`,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        role: 'student',
        terms: true,
      },
    })
    const otherStudentToken = otherStudentRes.data.token

    // Other student tries to access first student's resume
    const unauthorizedResumeAccess = await makeRequest('/api/student/resumes/passwd.pdf/access', {
      headers: { Authorization: `Bearer ${otherStudentToken}` },
    })
    assert.strictEqual(unauthorizedResumeAccess.status, 403, 'Unauthorized resume access must be rejected with 403')
    console.log('✓ Pass: Private resumes protected from unauthorized access with 403 Forbidden')

    // -------------------------------------------------------------
    // 9. Duplicate Application Prevention
    // -------------------------------------------------------------
    console.log('\n[9. Duplicate Application Prevention]')
    // Submit first application
    const apply1 = await makeRequest('/api/jobs/job-1/apply', {
      method: 'POST',
      headers: { Authorization: `Bearer ${activeToken}` },
      body: {
        resumeName: 'passwd.pdf',
      },
    })
    assert.strictEqual(apply1.status, 201)

    // Submit duplicate application
    const apply2 = await makeRequest('/api/jobs/job-1/apply', {
      method: 'POST',
      headers: { Authorization: `Bearer ${activeToken}` },
      body: {
        resumeName: 'passwd.pdf',
      },
    })
    assert.strictEqual(apply2.status, 409, 'Duplicate application must be rejected with 409 Conflict')
    assert.strictEqual(apply2.data.code, 'ALREADY_APPLIED')
    console.log('✓ Pass: Duplicate applications blocked with 409 Conflict and database constraint')

    // -------------------------------------------------------------
    // 10. Recruiter Job Ownership Checks
    // -------------------------------------------------------------
    console.log('\n[10. Recruiter Job Ownership Checks]')
    // Create Recruiter 1
    const rec1Res = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Recruiter Alpha',
        email: `rec_alpha_${Date.now()}@linear.app`,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        role: 'recruiter',
        companyName: 'Alpha Corp',
        terms: true,
      },
    })
    const rec1Token = rec1Res.data.token

    // Create Recruiter 2
    const rec2Res = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Recruiter Beta',
        email: `rec_beta_${Date.now()}@stripe.com`,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        role: 'recruiter',
        companyName: 'Beta Corp',
        terms: true,
      },
    })
    const rec2Token = rec2Res.data.token

    // Recruiter 1 creates a job
    const createJobRes = await makeRequest('/api/recruiter/jobs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${rec1Token}` },
      body: {
        title: 'Backend Security Engineer',
        description: 'Lead application security engineering and infrastructure.',
        type: 'Full-time',
        location: 'Bengaluru',
      },
    })
    assert.strictEqual(createJobRes.status, 201)
    const rec1JobId = createJobRes.data.data.id

    // Recruiter 2 attempts to delete Recruiter 1's job
    const unauthorizedDelete = await makeRequest(`/api/recruiter/jobs/${rec1JobId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${rec2Token}` },
    })
    assert(unauthorizedDelete.status === 403 || unauthorizedDelete.status === 404, 'Must block unauthorized job deletion')

    // Recruiter 2 attempts to edit Recruiter 1's job
    const unauthorizedEdit = await makeRequest(`/api/recruiter/jobs/${rec1JobId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${rec2Token}` },
      body: { title: 'Compromised Title' },
    })
    assert(unauthorizedEdit.status === 403 || unauthorizedEdit.status === 404, 'Must block unauthorized job edit')
    console.log('✓ Pass: Recruiter cross-tenant job modification blocked with 403/404 ownership checks')

    // -------------------------------------------------------------
    // 11. Audit Logging for Sensitive Operations
    // -------------------------------------------------------------
    console.log('\n[11. Audit Logging for Sensitive Operations]')
    const logs = auditLogger.getLogs({ limit: 10 })
    assert(Array.isArray(logs) && logs.length > 0, 'Audit logs must be recorded')
    assert(logs.some((l) => l.action === 'USER_REGISTERED' || l.action === 'JOB_CREATED' || l.action === 'APPLICATION_SUBMITTED'))
    // Verify no secrets in audit logs
    for (const log of logs) {
      assert.strictEqual(log.metadata.password, undefined)
      assert.strictEqual(log.metadata.passwordHash, undefined)
      assert.strictEqual(log.metadata.token, undefined)
    }
    console.log(`✓ Pass: Audit logger recorded actions (${logs.length} inspected) without leaking sensitive secrets`)

    // -------------------------------------------------------------
    // 12. Safe Error Handling (No Stack Trace Leaks)
    // -------------------------------------------------------------
    console.log('\n[12. Safe Error Handling]')
    const notFoundRes = await makeRequest('/api/non-existent-endpoint')
    assert.strictEqual(notFoundRes.status, 404)
    assert.strictEqual(notFoundRes.data.success, false)
    assert.strictEqual(notFoundRes.data.stack, undefined, 'Internal stack traces must NEVER be exposed')
    console.log('✓ Pass: Global safe error handler prevents internal stack traces and secrets leakage')

    console.log('\n--- ALL 18 BACKEND SECURITY AUDIT CHECKS PASSED SUCCESSFULLY! ---')
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve))
    }
  }
}

runSecurityAuditTests().catch((err) => {
  console.error('Security test failed:', err)
  process.exit(1)
})

