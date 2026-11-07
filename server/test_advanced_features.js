import assert from 'assert'
import http from 'http'
import app from './src/app.js'
import { emailService } from './src/services/emailService.js'
import { normalizeSkill, calculateSkillMatch } from './src/utils/skillMatcher.js'

let server
let baseUrl

async function makeRequest(path, options = {}) {
  const url = `${baseUrl}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  return { status: res.status, data, headers: res.headers }
}

async function runTests() {
  console.log('--- TESTING ADVANCED FEATURES: EMAIL NOTIFICATIONS & SKILL MATCHING ---')

  await new Promise((resolve) => {
    server = http.createServer(app)
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port
      baseUrl = `http://127.0.0.1:${port}`
      console.log(`Advanced Features test server running on ${baseUrl}`)
      resolve()
    })
  })

  try {
    // ==========================================
    // FEATURE 1: EMAIL NOTIFICATIONS
    // ==========================================
    console.log('\n[Feature 1: Email Notifications Testing]')

    // 1. Send registration confirmation email
    emailService.clearCache()
    const regEmail = await emailService.sendRegistrationConfirmation({
      name: 'Pooja Nair',
      email: 'pooja.nair@example.com',
      role: 'student',
    })
    assert(regEmail.success, 'Registration email should succeed')
    console.log('✓ Pass: Registration confirmation email dispatched successfully')

    // 2. Deduplication check: duplicate call within cooldown is suppressed
    const duplicateRegEmail = await emailService.sendRegistrationConfirmation({
      name: 'Pooja Nair',
      email: 'pooja.nair@example.com',
      role: 'student',
    })
    assert(duplicateRegEmail.success, 'Duplicate should succeed cleanly')
    assert.strictEqual(duplicateRegEmail.skipped, true, 'Duplicate email must be skipped')
    console.log('✓ Pass: Duplicate email notification suppressed by deduplication cache')

    // 3. Application submission confirmation email
    const appEmail = await emailService.sendApplicationSubmissionEmail({
      studentName: 'Devina Patel',
      email: 'devina.patel@example.com',
      role: 'Product Design Intern',
      company: 'Linear',
      appliedDate: '01 Nov 2026',
      resumeName: 'Devina_Patel_CV.pdf',
      applicationId: 'app-linear-test-101',
    })
    assert(appEmail.success, 'Application submission email should succeed')
    console.log('✓ Pass: Application submission confirmation email dispatched')

    // 4. Status change & Shortlisting email
    const statusEmail = await emailService.sendStatusChangeEmail({
      candidateName: 'Devina Patel',
      email: 'devina.patel@example.com',
      role: 'Product Design Intern',
      company: 'Linear',
      newStage: 'shortlisted',
      stageLabel: 'Shortlisted',
      note: 'Outstanding portfolio and design system knowledge.',
      applicationId: 'app-linear-test-101',
    })
    assert(statusEmail.success, 'Status change email should succeed')
    console.log('✓ Pass: Shortlisting email dispatched with custom notes')

    // 5. Interview scheduling email
    const interviewEmail = await emailService.sendInterviewScheduledEmail({
      candidateName: 'Devina Patel',
      email: 'devina.patel@example.com',
      role: 'Product Design Intern',
      company: 'Linear',
      interviewDate: '12 Nov 2026',
      interviewTime: '04:00 PM IST',
      interviewMode: 'Google Meet',
      meetingUrl: 'https://meet.google.com/sb-linear-test',
      instructions: 'Please prepare 2 Figma design case studies.',
      applicationId: 'app-linear-test-101',
    })
    assert(interviewEmail.success, 'Interview scheduling email should succeed')
    console.log('✓ Pass: Interview scheduled email dispatched with meeting link')

    // 6. Interview update email
    const interviewUpdateEmail = await emailService.sendInterviewUpdatedEmail({
      candidateName: 'Devina Patel',
      email: 'devina.patel@example.com',
      role: 'Product Design Intern',
      company: 'Linear',
      interviewDate: '14 Nov 2026',
      interviewTime: '05:00 PM IST',
      interviewMode: 'Google Meet',
      meetingUrl: 'https://meet.google.com/sb-linear-test',
      instructions: 'Time shifted per design lead request.',
      applicationId: 'app-linear-test-101',
    })
    assert(interviewUpdateEmail.success, 'Interview update email should succeed')
    console.log('✓ Pass: Interview updated email dispatched with revised details')

    // 7. Verify sent emails audit trail
    const logs = emailService.getDeliveryLogs()
    assert(Array.isArray(logs) && logs.length >= 4, 'Delivery audit logs should be stored')
    console.log(`✓ Pass: Sent emails audit trail contains ${logs.length} logged dispatches`)

    // ==========================================
    // FEATURE 2: SKILL MATCHING
    // ==========================================
    console.log('\n[Feature 2: Resume-to-Job Skill Matching Testing]')

    // 8. Skill normalization tests
    assert.strictEqual(normalizeSkill('React.js'), 'react')
    assert.strictEqual(normalizeSkill('ReactJS'), 'react')
    assert.strictEqual(normalizeSkill('TypeScript'), 'typescript')
    assert.strictEqual(normalizeSkill('TS'), 'typescript')
    assert.strictEqual(normalizeSkill('Tailwind CSS'), 'tailwindcss')
    assert.strictEqual(normalizeSkill('UI/UX Design'), 'ui/ux design')
    assert.strictEqual(normalizeSkill('Postgres'), 'postgresql')
    console.log('✓ Pass: Skill normalization and synonym dictionary mapped accurately')

    // 9. Calculate transparent skill match
    const studentSkills = ['Figma', 'UI/UX Design', 'User Research', 'Prototyping', 'Design Systems', 'HTML/CSS']
    const jobSkills = ['Figma', 'Design Systems', 'User Research', 'TypeScript', 'Tailwind CSS']

    const matchResult = calculateSkillMatch(studentSkills, jobSkills)
    assert.strictEqual(typeof matchResult.matchScore, 'number')
    assert(matchResult.matchScore >= 0 && matchResult.matchScore <= 100)
    assert.strictEqual(matchResult.totalRequired, 5)
    assert.strictEqual(matchResult.matchingCount, 3) // Figma, Design Systems, User Research
    assert.strictEqual(matchResult.missingCount, 2)  // TypeScript, Tailwind CSS
    assert.strictEqual(matchResult.matchScore, 60)   // (3 / 5) * 100 = 60%
    assert.strictEqual(matchResult.matchLevel, 'Moderate Match')
    assert(matchResult.suggestedImprovements.length > 0)
    assert(matchResult.disclaimer.includes('algorithmic estimate'))
    assert.strictEqual(matchResult.calculationDetails.isAI, false)
    console.log('✓ Pass: Transparent rule-based skill match computed correctly:', {
      score: `${matchResult.matchScore}%`,
      matching: matchResult.matchingSkills,
      missing: matchResult.missingSkills,
      suggestions: matchResult.suggestedImprovements.length,
    })

    // 10. Test API endpoint GET /api/jobs/:id/skill-match
    const skillMatchApiRes = await makeRequest('/api/jobs/job-1/skill-match')
    assert.strictEqual(skillMatchApiRes.status, 200)
    assert(skillMatchApiRes.data.success)
    assert(skillMatchApiRes.data.data.matchScore !== undefined)
    assert(Array.isArray(skillMatchApiRes.data.data.matchingSkills))
    assert(Array.isArray(skillMatchApiRes.data.data.missingSkills))
    console.log('✓ Pass: GET /api/jobs/:id/skill-match returned 200 with skill match analysis')

    // 11. Test job detail includes skillMatch
    const jobDetailRes = await makeRequest('/api/jobs/job-1')
    assert.strictEqual(jobDetailRes.status, 200)
    assert(jobDetailRes.data.data.skillMatch, 'Job detail must include computed skillMatch')
    console.log('✓ Pass: GET /api/jobs/:id includes enriched skillMatch data')

    console.log('\n--- ALL ADVANCED FEATURES BACKEND TESTS PASSED! ---')
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve))
    }
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err)
  process.exit(1)
})
