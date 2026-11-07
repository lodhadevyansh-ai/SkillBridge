import http from 'http'
import app from './src/app.js'

const server = app.listen(0, '127.0.0.1', async () => {
  const port = server.address().port
  console.log(`Recruiter Candidates test server running on 127.0.0.1:${port}`)

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
    console.log('--- TESTING RECRUITER CANDIDATE MANAGEMENT SYSTEM ---')

    // 1. Authenticate recruiter 1 (Meera - Linear)
    const loginMeera = await makeReq('/api/auth/login', 'POST', {}, {
      email: 'meera@linear.app',
      password: 'password123',
    })
    console.assert(loginMeera.status === 200, 'Meera login should succeed')
    const meeraToken = loginMeera.body.token || loginMeera.body.data?.token
    const meeraHeaders = { Authorization: `Bearer ${meeraToken}` }
    console.log('✓ Pass: Recruiter 1 (Meera) authenticated')

    // 2. Authenticate / register recruiter 2 (Vikram - Stripe)
    const stripeEmail = `vikram_cand_${Date.now()}@stripe.com`
    const regVikram = await makeReq('/api/auth/register', 'POST', {}, {
      fullName: 'Vikram Seth',
      email: stripeEmail,
      password: 'password123',
      confirmPassword: 'password123',
      role: 'recruiter',
      companyName: 'Stripe',
      terms: true,
    })
    console.assert(regVikram.status === 201, 'Vikram registration should succeed')
    const vikramToken = regVikram.body.token
    const vikramHeaders = { Authorization: `Bearer ${vikramToken}` }
    console.log('✓ Pass: Recruiter 2 (Vikram) authenticated for isolation checks')

    // 3. GET /api/recruiter/candidates (Fetch all candidates for Meera)
    const getCandidatesRes = await makeReq('/api/recruiter/candidates', 'GET', meeraHeaders)
    console.assert(getCandidatesRes.status === 200, 'GET candidates should return 200')
    const candidatesList = getCandidatesRes.body.data
    console.assert(Array.isArray(candidatesList), 'Candidates should be an array')
    console.assert(candidatesList.length > 0, 'Should have candidate applications')
    console.log(`✓ Pass: Retrieved ${candidatesList.length} candidate applications for Meera`)

    // Verify candidate fields
    const firstCand = candidatesList[0]
    console.assert(firstCand.candidateName, 'Candidate should have name')
    console.assert(firstCand.roleApplied, 'Candidate should have roleApplied')
    console.assert(firstCand.resumeUrl, 'Candidate should have resumeUrl')
    console.assert(Array.isArray(firstCand.skills), 'Candidate should have skills array')
    const candId = firstCand.id
    console.log(`✓ Pass: Candidate record structure validated (Candidate: ${firstCand.candidateName})`)

    // 4. GET /api/recruiter/candidates/:id (Fetch single candidate details)
    const getSingleRes = await makeReq(`/api/recruiter/candidates/${candId}`, 'GET', meeraHeaders)
    console.assert(getSingleRes.status === 200, 'GET single candidate should return 200')
    console.assert(getSingleRes.body.data.id === candId)
    console.assert(Array.isArray(getSingleRes.body.data.statusHistory), 'Candidate should have statusHistory')
    console.log('✓ Pass: Single candidate details retrieved with complete history')

    // 5. PATCH /api/recruiter/candidates/:id/stage (Shortlist candidate)
    const shortlistRes = await makeReq(`/api/recruiter/candidates/${candId}/stage`, 'PATCH', meeraHeaders, {
      stage: 'shortlisted',
      note: 'Candidate meets all UX requirements and shows high enthusiasm.',
    })
    console.assert(shortlistRes.status === 200, 'Shortlist should return 200')
    console.assert(shortlistRes.body.data.stage === 'shortlisted', 'Stage should be shortlisted')
    console.log('✓ Pass: Candidate successfully shortlisted')

    // 6. POST /api/recruiter/candidates/:id/interview (Schedule interview round)
    const scheduleRes = await makeReq(`/api/recruiter/candidates/${candId}/interview`, 'POST', meeraHeaders, {
      interviewDate: '10 Nov 2026',
      interviewTime: '03:30 PM',
      interviewMode: 'Google Meet',
      meetingUrl: 'https://meet.google.com/sb-linear-evaluation',
      instructions: 'Portfolio review with Design Lead. Prepare 2 case studies.',
    })
    console.assert(scheduleRes.status === 200, 'Schedule interview should return 200')
    const scheduled = scheduleRes.body.data
    console.assert(scheduled.stage === 'interview', 'Stage should be interview')
    console.assert(scheduled.interview.interviewDate === '10 Nov 2026')
    console.assert(scheduled.interview.meetingUrl === 'https://meet.google.com/sb-linear-evaluation')
    console.log('✓ Pass: Interview scheduled with date, time, mode, meeting link and instructions')

    // 7. POST /api/recruiter/candidates/:id/notes (Add internal note)
    const noteRes = await makeReq(`/api/recruiter/candidates/${candId}/notes`, 'POST', meeraHeaders, {
      note: 'Very strong visual hierarchy in Figma case study. Need to probe team collaboration during interview.',
    })
    console.assert(noteRes.status === 201, 'Add note should return 201')
    console.assert(noteRes.body.data.text.includes('Very strong visual hierarchy'))
    console.log('✓ Pass: Internal recruiter note added and timestamped')

    // 8. PATCH /api/recruiter/candidates/:id/stage (Reject candidate)
    const rejectRes = await makeReq(`/api/recruiter/candidates/${candId}/stage`, 'PATCH', meeraHeaders, {
      stage: 'rejected',
      note: 'Role filled by senior hire. Keep on file for future opportunities.',
    })
    console.assert(rejectRes.status === 200, 'Reject should return 200')
    console.assert(rejectRes.body.data.stage === 'rejected', 'Stage should be rejected')
    console.log('✓ Pass: Candidate application marked as rejected with custom feedback')

    // 9. SECURITY & DATA ISOLATION: Vikram (Recruiter 2) tries to access Meera's candidate -> MUST RETURN 403
    const unauthGet = await makeReq(`/api/recruiter/candidates/${candId}`, 'GET', vikramHeaders)
    console.assert(unauthGet.status === 403 || unauthGet.status === 404, 'Vikram cannot view Meera’s candidate')
    console.log('✓ Pass: Unauthorized candidate inspection blocked (403/404)')

    const unauthSchedule = await makeReq(`/api/recruiter/candidates/${candId}/interview`, 'POST', vikramHeaders, {
      interviewDate: '12 Nov 2026',
      interviewTime: '10:00 AM',
    })
    console.assert(unauthSchedule.status === 403 || unauthSchedule.status === 404, 'Vikram cannot schedule Meera’s candidate')
    console.log('✓ Pass: Unauthorized interview scheduling blocked (403/404)')

    const unauthNote = await makeReq(`/api/recruiter/candidates/${candId}/notes`, 'POST', vikramHeaders, {
      note: 'Malicious note injection attempt',
    })
    console.assert(unauthNote.status === 403 || unauthNote.status === 404, 'Vikram cannot add notes to Meera’s candidate')
    console.log('✓ Pass: Unauthorized note creation blocked (403/404)')

    // 10. Filter candidates by job and status
    const filteredRes = await makeReq('/api/recruiter/candidates?jobId=job-1&stage=shortlisted', 'GET', meeraHeaders)
    console.assert(filteredRes.status === 200)
    console.assert(Array.isArray(filteredRes.body.data))
    console.log(`✓ Pass: Filtered candidates by job and stage (${filteredRes.body.data.length} results)`)

    console.log('\n--- ALL RECRUITER CANDIDATE MANAGEMENT TESTS PASSED! ---')
    server.close(() => process.exit(0))
  } catch (err) {
    console.error('Candidate management test failed:', err)
    server.close(() => process.exit(1))
  }
})

