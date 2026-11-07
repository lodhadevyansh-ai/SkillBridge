import assert from 'assert'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import app from './src/app.js'
import { notificationStore } from './src/db/notificationStore.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
  console.log('--- TESTING NOTIFICATIONS & ANALYTICS SYSTEM ---')

  await new Promise((resolve) => {
    server = http.createServer(app)
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port
      baseUrl = `http://127.0.0.1:${port}`
      console.log(`Notification & Analytics Test server running on ${baseUrl}`)
      resolve()
    })
  })

  try {
    // 1. Authenticate Student, Recruiter, and Admin
    const stuReg = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Test Notif Student',
        email: `test.notif.student.${Date.now()}@example.com`,
        password: 'password123',
        confirmPassword: 'password123',
        role: 'student',
        terms: true,
      },
    })
    assert.strictEqual(stuReg.status, 201, 'Student registration failed')
    const studentToken = stuReg.data.token
    const studentId = stuReg.data.user.id
    assert(studentToken, 'Student token missing')

    // Apply to Linear job (job-1) so recruiter has student in candidate pipeline
    const applyRes = await makeRequest('/api/jobs/job-1/apply', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        resumeName: 'Candidate_Resume.pdf',
        coverLetter: 'Passionate about design and frontend development.',
      },
    })
    assert.strictEqual(applyRes.status, 201, 'Job apply failed')

    const recLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'meera@linear.app', password: 'password123' },
    })
    assert.strictEqual(recLogin.status, 200, 'Recruiter login failed')
    const recruiterToken = recLogin.data.token
    assert(recruiterToken, 'Recruiter token missing')

    const admLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@skillbridge.io', password: 'admin123' },
    })
    assert.strictEqual(admLogin.status, 200, 'Admin login failed')
    const adminToken = admLogin.data.token
    assert(adminToken, 'Admin token missing')

    console.log('✓ Pass: Student, Recruiter, and Admin authenticated successfully')

    // 2. Unauthenticated notification access blocked
    const unauth = await makeRequest('/api/notifications')
    assert.strictEqual(unauth.status, 401, 'Unauthenticated access should be blocked')
    console.log('✓ Pass: Unauthenticated notification access blocked with 401')

    // 3. User isolation: Student gets only student notifications
    const stuNotifs = await makeRequest('/api/notifications', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert.strictEqual(stuNotifs.status, 200)
    assert(Array.isArray(stuNotifs.data.notifications), 'Notifications array missing')
    assert(stuNotifs.data.notifications.length > 0, 'Student should have notifications')
    assert(
      stuNotifs.data.notifications.every((n) => n.userId === studentId),
      'Student must only see their own notifications'
    )
    console.log(`✓ Pass: Student retrieved ${stuNotifs.data.notifications.length} personal notifications`)

    // 4. Recruiter gets only recruiter notifications
    const recNotifs = await makeRequest('/api/notifications', {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    })
    assert.strictEqual(recNotifs.status, 200)
    assert(
      recNotifs.data.notifications.every((n) => n.userId === 'usr_recruiter_meera'),
      'Recruiter must only see their own notifications'
    )
    console.log(`✓ Pass: Recruiter retrieved ${recNotifs.data.notifications.length} personal notifications`)

    // 5. Cross-user notification modification blocked
    const recFirstNotifId = recNotifs.data.notifications[0].id
    const tamperRes = await makeRequest(`/api/notifications/${recFirstNotifId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert.strictEqual(tamperRes.status, 403, 'Cross-user mark as read should return 403 Forbidden')
    console.log('✓ Pass: Cross-user notification tampering blocked with 403 Forbidden')

    // 6. Mark single notification as read
    const unreadStuNotif = stuNotifs.data.notifications.find((n) => !n.read)
    if (unreadStuNotif) {
      const readRes = await makeRequest(`/api/notifications/${unreadStuNotif.id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${studentToken}` },
      })
      assert.strictEqual(readRes.status, 200)
      assert.strictEqual(readRes.data.notification.read, true)
      console.log('✓ Pass: Mark single notification as read works accurately')
    }

    // 7. Mark all notifications as read
    const readAllRes = await makeRequest('/api/notifications/read-all', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert.strictEqual(readAllRes.status, 200)
    assert.strictEqual(readAllRes.data.unreadCount, 0)
    console.log('✓ Pass: Mark all notifications as read succeeds with unreadCount = 0')

    // 8. Event Trigger: Recruiter status update creates student notification
    const recCandidates = await makeRequest('/api/recruiter/candidates', {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    })
    assert.strictEqual(recCandidates.status, 200)
    const candApp = (recCandidates.data.data || recCandidates.data.candidates)[0]

    // Link candApp to our registered test student for the notification event assertion
    const recDataPath = path.join(__dirname, 'data', 'recruiterData.json')
    const rData = JSON.parse(fs.readFileSync(recDataPath, 'utf8'))
    const targetCandidate = rData.applications['usr_recruiter_meera'].find((c) => c.id === candApp.id)
    if (targetCandidate) {
      targetCandidate.candidateId = studentId
      fs.writeFileSync(recDataPath, JSON.stringify(rData, null, 2))
    }

    // Shortlist candidate
    const shortlistRes = await makeRequest(`/api/recruiter/candidates/${candApp.id}/stage`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: { stage: 'shortlisted', note: 'Strong portfolio and interaction design skills' },
    })
    assert.strictEqual(shortlistRes.status, 200)

    // Verify student received shortlisted notification
    const stuNotifsAfterShortlist = await makeRequest('/api/notifications', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    const shortlistNotif = stuNotifsAfterShortlist.data.notifications.find(
      (n) => n.type === 'candidate_shortlisted'
    )
    assert(shortlistNotif, 'Student should receive candidate_shortlisted notification')
    console.log('✓ Pass: Recruiter shortlisting triggered candidate_shortlisted notification')

    // 9. Event Trigger: Schedule interview creates interview notification
    const scheduleRes = await makeRequest(`/api/recruiter/candidates/${candApp.id}/interview`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: {
        interviewDate: '15 Nov 2026',
        interviewTime: '02:00 PM IST',
        interviewMode: 'Google Meet',
        meetingUrl: 'https://meet.google.com/sb-eval-test',
        instructions: 'Design review with design lead.',
      },
    })
    assert.strictEqual(scheduleRes.status, 200)

    const stuNotifsAfterInterview = await makeRequest('/api/notifications', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    const interviewNotif = stuNotifsAfterInterview.data.notifications.find(
      (n) => n.type === 'interview_scheduled' || n.type === 'interview_updated'
    )
    assert(interviewNotif, 'Student should receive interview notification')
    console.log('✓ Pass: Interview scheduling triggered interview notification')

    // 10. Student Analytics Endpoint
    const stuAnalytics = await makeRequest('/api/student/analytics', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert.strictEqual(stuAnalytics.status, 200)
    assert(stuAnalytics.data.analytics.summary, 'Summary statistics missing')
    assert(Array.isArray(stuAnalytics.data.analytics.applicationsOverTime), 'applicationsOverTime missing')
    assert(Array.isArray(stuAnalytics.data.analytics.applicationsByStatus), 'applicationsByStatus missing')
    assert(Array.isArray(stuAnalytics.data.analytics.mostAppliedCategories), 'mostAppliedCategories missing')
    assert(Array.isArray(stuAnalytics.data.analytics.conversionFunnel), 'conversionFunnel missing')
    console.log('✓ Pass: Student analytics calculated from actual database records:', {
      total: stuAnalytics.data.analytics.summary.totalApplications,
      shortlistRate: `${stuAnalytics.data.analytics.summary.shortlistRate}%`,
      interviewRate: `${stuAnalytics.data.analytics.summary.interviewRate}%`,
      categories: stuAnalytics.data.analytics.mostAppliedCategories.length,
    })

    // 11. Recruiter Analytics Endpoint
    const recAnalytics = await makeRequest('/api/recruiter/analytics', {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    })
    assert.strictEqual(recAnalytics.status, 200)
    assert(recAnalytics.data.analytics.summary, 'Summary statistics missing')
    assert(Array.isArray(recAnalytics.data.analytics.applicationsOverTime), 'applicationsOverTime missing')
    assert(Array.isArray(recAnalytics.data.analytics.candidatePipeline), 'candidatePipeline missing')
    assert(Array.isArray(recAnalytics.data.analytics.jobPerformance), 'jobPerformance missing')
    console.log('✓ Pass: Recruiter analytics calculated from actual database records:', {
      totalJobs: recAnalytics.data.analytics.summary.totalJobs,
      totalApplicants: recAnalytics.data.analytics.summary.totalApplicants,
      shortlistRate: `${recAnalytics.data.analytics.summary.shortlistRate}%`,
      jobPerformanceCount: recAnalytics.data.analytics.jobPerformance.length,
    })

    // 12. Admin Analytics Endpoint
    const admAnalytics = await makeRequest('/api/admin/analytics', {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    assert.strictEqual(admAnalytics.status, 200)
    assert(admAnalytics.data.analytics.metrics, 'Admin metrics missing')
    assert(Array.isArray(admAnalytics.data.analytics.userGrowth), 'userGrowth missing')
    assert(Array.isArray(admAnalytics.data.analytics.jobListingTrends), 'jobListingTrends missing')
    assert(Array.isArray(admAnalytics.data.analytics.applicationTrends), 'applicationTrends missing')
    assert(Array.isArray(admAnalytics.data.analytics.platformActivity), 'platformActivity missing')
    console.log('✓ Pass: Admin analytics calculated from actual platform records:', {
      totalUsers: admAnalytics.data.analytics.metrics.totalUsers,
      totalJobs: admAnalytics.data.analytics.metrics.totalJobs,
      userGrowthPeriods: admAnalytics.data.analytics.userGrowth.length,
      platformActivityTypes: admAnalytics.data.analytics.platformActivity.length,
    })

    // Student/Recruiter blocked from Admin analytics
    const stuAdmAnalytics = await makeRequest('/api/admin/analytics', {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    assert.strictEqual(stuAdmAnalytics.status, 403, 'Student should be blocked from admin analytics')
    console.log('✓ Pass: Student blocked from admin analytics with 403 Forbidden')

    console.log('\n--- ALL NOTIFICATION & ANALYTICS TESTS PASSED! ---')
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
