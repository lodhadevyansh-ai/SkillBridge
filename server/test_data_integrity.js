import http from 'http'
import app from './src/app.js'

const server = app.listen(0, '127.0.0.1', async () => {
  const port = server.address().port
  console.log(`Data integrity test server running on 127.0.0.1:${port}`)

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
    console.log('--- STARTING COMPREHENSIVE DATA INTEGRITY & ISOLATION TEST SUITE ---')
    const timestamp = Date.now()

    // ==========================================
    // TEST A: Register new recruiter -> dashboard stats are all 0
    // ==========================================
    console.log('\n[TEST A]: Register new recruiter -> Verify fresh account stats are all 0')
    const recEmail = `recruiter_${timestamp}@innovate.co`
    const recRegRes = await makeReq('/api/auth/register', 'POST', {}, {
      fullName: 'Vikram Mehta',
      email: recEmail,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      terms: true,
      role: 'recruiter',
      companyName: 'Innovate Tech',
    })

    if (recRegRes.status !== 201 && recRegRes.status !== 200) {
      throw new Error(`Failed to register recruiter: ${JSON.stringify(recRegRes.body)}`)
    }
    const recToken = recRegRes.body.token || recRegRes.body.data?.token
    const recAuthHeader = { Authorization: `Bearer ${recToken}` }

    const recDashRes = await makeReq('/api/recruiter/dashboard', 'GET', recAuthHeader)
    if (recDashRes.status !== 200) {
      throw new Error(`Failed to fetch recruiter dashboard: ${JSON.stringify(recDashRes.body)}`)
    }
    const dashStats = recDashRes.body.data.stats
    const pipeline = recDashRes.body.data.candidatePipeline

    console.log('Recruiter Dashboard Stats:', {
      openRoles: dashStats.openRoles.value,
      totalApplicants: dashStats.totalApplicants.value,
      shortlisted: dashStats.shortlisted.value,
      interviewsThisWeek: dashStats.interviewsThisWeek.value,
      pipeline,
    })

    if (
      dashStats.openRoles.value !== 0 ||
      dashStats.totalApplicants.value !== 0 ||
      dashStats.shortlisted.value !== 0 ||
      dashStats.interviewsThisWeek.value !== 0 ||
      pipeline.applied !== 0 ||
      pipeline.inReview !== 0 ||
      pipeline.shortlisted !== 0 ||
      pipeline.interview !== 0 ||
      pipeline.offer !== 0
    ) {
      throw new Error('TEST A FAILED: Newly registered recruiter stats must all be 0!')
    }
    console.log('✓ TEST A PASSED: New recruiter starts with completely 0 stats and pipeline.')

    // ==========================================
    // TEST B: New recruiter applications -> empty list
    // ==========================================
    console.log('\n[TEST B]: New recruiter applications -> verify empty list')
    const recAppsRes = await makeReq('/api/recruiter/applications', 'GET', recAuthHeader)
    if (recAppsRes.status !== 200) {
      throw new Error(`Failed to fetch recruiter applications: ${JSON.stringify(recAppsRes.body)}`)
    }
    if (!Array.isArray(recAppsRes.body.data) || recAppsRes.body.data.length !== 0) {
      throw new Error(`TEST B FAILED: Expected 0 applications, got ${recAppsRes.body.data?.length}`)
    }
    console.log('✓ TEST B PASSED: New recruiter applications list is empty [].')

    // ==========================================
    // TEST C: New recruiter candidates -> empty list
    // ==========================================
    console.log('\n[TEST C]: New recruiter candidates -> verify empty list')
    const recCandsRes = await makeReq('/api/recruiter/candidates', 'GET', recAuthHeader)
    if (recCandsRes.status !== 200) {
      throw new Error(`Failed to fetch recruiter candidates: ${JSON.stringify(recCandsRes.body)}`)
    }
    if (!Array.isArray(recCandsRes.body.data) || recCandsRes.body.data.length !== 0) {
      throw new Error(`TEST C FAILED: Expected 0 candidates, got ${recCandsRes.body.data?.length}`)
    }
    console.log('✓ TEST C PASSED: New recruiter candidates list is empty [].')

    // ==========================================
    // TEST D: New recruiter analytics -> all 0s, no hardcoded 84, 22.4%, 11.2%, 4.5%
    // ==========================================
    console.log('\n[TEST D]: New recruiter analytics -> verify dynamic 0s and no hardcoded values')
    const recAnalyticsRes = await makeReq('/api/recruiter/analytics', 'GET', recAuthHeader)
    if (recAnalyticsRes.status !== 200) {
      throw new Error(`Failed to fetch recruiter analytics: ${JSON.stringify(recAnalyticsRes.body)}`)
    }
    const analyticsSummary = (recAnalyticsRes.body.data || recAnalyticsRes.body.analytics).summary
    console.log('Recruiter Analytics Summary:', analyticsSummary)

    if (
      analyticsSummary.totalApplicants !== 0 ||
      analyticsSummary.shortlistRate !== 0 ||
      analyticsSummary.interviewRate !== 0 ||
      analyticsSummary.offerRate !== 0 ||
      analyticsSummary.shortlistedCandidates !== 0 ||
      analyticsSummary.interviewCandidates !== 0 ||
      analyticsSummary.offerCandidates !== 0
    ) {
      throw new Error(
        `TEST D FAILED: Recruiter analytics returned non-zero or hardcoded fallback values: ${JSON.stringify(analyticsSummary)}`
      )
    }
    console.log('✓ TEST D PASSED: Recruiter analytics cleanly calculated from real DB (all 0s).')

    // ==========================================
    // TEST E: Register new student -> dashboard stats are all 0
    // ==========================================
    console.log('\n[TEST E]: Register new student -> verify dashboard stats are all 0')
    const stEmail = `student_${timestamp}@university.edu`
    const stRegRes = await makeReq('/api/auth/register', 'POST', {}, {
      fullName: 'Aarav Patel',
      email: stEmail,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      terms: true,
      role: 'student',
    })

    if (stRegRes.status !== 201 && stRegRes.status !== 200) {
      throw new Error(`Failed to register student: ${JSON.stringify(stRegRes.body)}`)
    }
    const stToken = stRegRes.body.token || stRegRes.body.data?.token
    const stAuthHeader = { Authorization: `Bearer ${stToken}` }

    const stDashRes = await makeReq('/api/student/dashboard', 'GET', stAuthHeader)
    if (stDashRes.status !== 200) {
      throw new Error(`Failed to fetch student dashboard: ${JSON.stringify(stDashRes.body)}`)
    }
    const stStats = stDashRes.body.data.stats
    console.log('Student Dashboard Stats:', {
      applicationsSent: stStats.applicationsSent.value,
      inReview: stStats.inReview.value,
      interviews: stStats.interviews.value,
      savedJobs: stStats.savedJobs.value,
    })

    if (
      stStats.applicationsSent.value !== 0 ||
      stStats.inReview.value !== 0 ||
      stStats.interviews.value !== 0 ||
      stStats.savedJobs.value !== 0
    ) {
      throw new Error('TEST E FAILED: Newly registered student stats must all be 0!')
    }
    console.log('✓ TEST E PASSED: New student starts with completely 0 stats.')

    // ==========================================
    // TEST F: New student applications -> empty list
    // ==========================================
    console.log('\n[TEST F]: New student applications -> verify empty list')
    const stAppsRes = await makeReq('/api/student/applications', 'GET', stAuthHeader)
    if (stAppsRes.status !== 200) {
      throw new Error(`Failed to fetch student applications: ${JSON.stringify(stAppsRes.body)}`)
    }
    const stAppsList = stAppsRes.body.data?.applications || stAppsRes.body.data || []
    if (!Array.isArray(stAppsList) || stAppsList.length !== 0) {
      throw new Error(`TEST F FAILED: Expected 0 applications, got ${stAppsList.length}`)
    }
    console.log('✓ TEST F PASSED: New student applications list is empty [].')

    // ==========================================
    // TEST G: Recruiter posts job -> appears in recruiter's jobs only, not other recruiters
    // ==========================================
    console.log('\n[TEST G]: Recruiter posts job -> verify strict ownership isolation')
    const createJobRes = await makeReq('/api/recruiter/jobs', 'POST', recAuthHeader, {
      title: 'Senior Cloud Architect',
      description: 'Designing distributed microservices on AWS/GCP.',
      type: 'Full-time',
      location: 'Bengaluru · Hybrid',
      arrangement: 'Hybrid',
      stipend: '₹28–38 LPA',
      skills: ['AWS', 'Kubernetes', 'Go', 'Docker'],
      deadline: '15 Dec 2026',
    })
    if (createJobRes.status !== 201) {
      throw new Error(`Failed to create job: ${JSON.stringify(createJobRes.body)}`)
    }
    const createdJob = createJobRes.body.data
    console.log(`Created job ID: ${createdJob.id} under recruiter ${createdJob.recruiterId}`)

    // Check recruiter's jobs
    const recJobsRes = await makeReq('/api/recruiter/jobs', 'GET', recAuthHeader)
    if (!recJobsRes.body.data?.jobs?.some((j) => j.id === createdJob.id)) {
      throw new Error('TEST G FAILED: Job did not appear in authoring recruiter list!')
    }

    // Register a second recruiter and verify job does NOT appear in their list
    const rec2Email = `recruiter2_${timestamp}@othercorp.io`
    const rec2RegRes = await makeReq('/api/auth/register', 'POST', {}, {
      fullName: 'Sneha Sharma',
      email: rec2Email,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      terms: true,
      role: 'recruiter',
      companyName: 'OtherCorp',
    })
    const rec2Token = rec2RegRes.body.token || rec2RegRes.body.data?.token
    const rec2AuthHeader = { Authorization: `Bearer ${rec2Token}` }

    const rec2JobsRes = await makeReq('/api/recruiter/jobs', 'GET', rec2AuthHeader)
    if (rec2JobsRes.body.data?.jobs?.some((j) => j.id === createdJob.id)) {
      throw new Error('TEST G FAILED: Job leaked to unassociated second recruiter!')
    }
    console.log('✓ TEST G PASSED: Job strictly isolated to authoring recruiter.')

    // ==========================================
    // TEST H: Student applies to recruiter's job -> appears in that recruiter's applications only
    // ==========================================
    console.log('\n[TEST H]: Student applies to job -> appears in recruiter candidate pool')
    const applyRes = await makeReq(`/api/jobs/${createdJob.id}/apply`, 'POST', stAuthHeader, {
      resumeName: 'Aarav_Patel_Resume.pdf',
      coverLetter: 'Passionate about cloud architecture and distributed systems.',
    })
    if (applyRes.status !== 200 && applyRes.status !== 201) {
      throw new Error(`Failed to apply for job: ${JSON.stringify(applyRes.body)}`)
    }
    const appliedAppId = applyRes.body.data?.id
    console.log(`Application submitted with ID: ${appliedAppId}`)

    // Verify recruiter sees this applicant
    const rec1CandidatesRes = await makeReq('/api/recruiter/candidates', 'GET', recAuthHeader)
    const foundInRec1 = rec1CandidatesRes.body.data.find((c) => c.jobId === createdJob.id)
    if (!foundInRec1) {
      throw new Error('TEST H FAILED: Application did not appear in owning recruiter candidate list!')
    }

    // Verify recruiter 2 DOES NOT see this applicant
    const rec2CandidatesRes = await makeReq('/api/recruiter/candidates', 'GET', rec2AuthHeader)
    const foundInRec2 = rec2CandidatesRes.body.data.find((c) => c.jobId === createdJob.id)
    if (foundInRec2) {
      throw new Error('TEST H FAILED: Application leaked to unassociated second recruiter!')
    }
    console.log('✓ TEST H PASSED: Application appeared strictly in the owning recruiter’s candidate pool.')

    // ==========================================
    // TEST I: Recruiter updates application status -> reflects in student's application status
    // ==========================================
    console.log('\n[TEST I]: Recruiter updates candidate stage -> verifies student sees real-time status update')
    const updateStageRes = await makeReq(
      `/api/recruiter/candidates/${appliedAppId}/stage`,
      'PATCH',
      recAuthHeader,
      {
        stage: 'shortlisted',
        note: 'Candidate shortlisted for strong technical depth in distributed computing.',
      }
    )
    if (updateStageRes.status !== 200) {
      throw new Error(`Failed to update candidate stage: ${JSON.stringify(updateStageRes.body)}`)
    }

    // Check student's application status
    const stVerifyAppsRes = await makeReq('/api/student/applications', 'GET', stAuthHeader)
    const stApps = stVerifyAppsRes.body.data?.applications || stVerifyAppsRes.body.data || []
    const updatedStApp = stApps.find((a) => a.id === appliedAppId)

    console.log('Student application record after recruiter update:', {
      id: updatedStApp?.id,
      status: updatedStApp?.status,
      statusLabel: updatedStApp?.statusLabel,
      latestUpdate: updatedStApp?.latestUpdate,
    })

    if (!updatedStApp || updatedStApp.status !== 'shortlisted') {
      throw new Error(
        `TEST I FAILED: Expected student application status to be 'shortlisted', got '${updatedStApp?.status}'`
      )
    }
    console.log('✓ TEST I PASSED: Recruiter stage change synchronized to student application in real time.')

    // ==========================================
    // TEST J: Centralized Dashboard Statistics Endpoints
    // ==========================================
    console.log('\n[TEST J]: Centralized dashboard statistics endpoints')
    const recStatsRes = await makeReq('/api/recruiter/dashboard/stats', 'GET', recAuthHeader)
    if (recStatsRes.status !== 200) {
      throw new Error(`Failed to fetch /api/recruiter/dashboard/stats: ${JSON.stringify(recStatsRes.body)}`)
    }
    console.log('/api/recruiter/dashboard/stats response:', recStatsRes.body.data)

    const stStatsRes = await makeReq('/api/student/dashboard/stats', 'GET', stAuthHeader)
    if (stStatsRes.status !== 200) {
      throw new Error(`Failed to fetch /api/student/dashboard/stats: ${JSON.stringify(stStatsRes.body)}`)
    }
    console.log('/api/student/dashboard/stats response:', stStatsRes.body.data)

    if (
      recStatsRes.body.data.openRoles !== 1 ||
      recStatsRes.body.data.totalApplicants !== 1 ||
      recStatsRes.body.data.shortlisted !== 1 ||
      stStatsRes.body.data.totalApplications !== 1 ||
      stStatsRes.body.data.shortlisted !== 1
    ) {
      throw new Error('TEST J FAILED: Centralized dashboard stats mismatch actual database records!')
    }
    console.log('✓ TEST J PASSED: Centralized dashboard stats match database records perfectly.')

    // ==========================================
    // TEST K: Student Analytics Funnel & Response Time Calculation
    // ==========================================
    console.log('\n[TEST K]: Fresh student analytics -> 0% funnel & null response time')
    const freshStEmail = `freshstudent_${timestamp}@campus.edu`
    const freshStRegRes = await makeReq('/api/auth/register', 'POST', {}, {
      fullName: 'Tara Verma',
      email: freshStEmail,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      terms: true,
      role: 'student',
    })
    const freshStToken = freshStRegRes.body.token || freshStRegRes.body.data?.token
    const freshStAuthHeader = { Authorization: `Bearer ${freshStToken}` }

    const freshStAnalyticsRes = await makeReq('/api/student/analytics', 'GET', freshStAuthHeader)
    if (freshStAnalyticsRes.status !== 200) {
      throw new Error(`Failed to fetch student analytics: ${JSON.stringify(freshStAnalyticsRes.body)}`)
    }
    const freshAnalytics = freshStAnalyticsRes.body.data?.analytics || freshStAnalyticsRes.body.analytics
    console.log('Fresh student analytics summary:', freshAnalytics.summary)
    console.log('Fresh student conversion funnel:', freshAnalytics.conversionFunnel)

    if (freshAnalytics.summary.totalApplications !== 0) {
      throw new Error(`TEST K FAILED: Expected 0 totalApplications, got ${freshAnalytics.summary.totalApplications}`)
    }
    if (freshAnalytics.summary.avgResponseDays !== null) {
      throw new Error(`TEST K FAILED: Expected null avgResponseDays for 0 applications, got ${freshAnalytics.summary.avgResponseDays}`)
    }
    for (const step of freshAnalytics.conversionFunnel) {
      if (step.count !== 0 || step.rate !== 0) {
        throw new Error(`TEST K FAILED: Step ${step.stage} has non-zero count/rate: count=${step.count}, rate=${step.rate}`)
      }
    }
    console.log('✓ TEST K PASSED: Fresh student analytics has 0% across all funnel stages and null response time.')

    // ==========================================
    // TEST L: Recruiter Company Profile initialized with registered company name (not Linear)
    // ==========================================
    console.log('\n[TEST L]: Recruiter company profile dynamic initialization')
    const rec1ProfileRes = await makeReq('/api/recruiter/profile', 'GET', recAuthHeader)
    if (rec1ProfileRes.status !== 200) {
      throw new Error(`Failed to fetch recruiter profile: ${JSON.stringify(rec1ProfileRes.body)}`)
    }
    const rec1Profile = rec1ProfileRes.body.data
    console.log('Recruiter 1 Profile:', rec1Profile)

    if (rec1Profile.companyName !== 'Innovate Tech') {
      throw new Error(`TEST L FAILED: Expected companyName 'Innovate Tech', got '${rec1Profile.companyName}'`)
    }
    if (rec1Profile.companyName.toLowerCase().includes('linear')) {
      throw new Error(`TEST L FAILED: Company profile leaked hardcoded Linear data!`)
    }
    console.log('✓ TEST L PASSED: Recruiter profile accurately initialized with registered company name.')

    // ==========================================
    // TEST M: Recruiter Company Profile update, persistence, and isolation
    // ==========================================
    console.log('\n[TEST M]: Recruiter company profile update, persistence, and cross-recruiter isolation')
    const updateProfileRes = await makeReq('/api/recruiter/profile', 'PUT', recAuthHeader, {
      companyName: 'Apex Robotics',
      website: 'https://apexrobotics.ai',
      headquarters: 'Bengaluru, India',
      companySize: '11–50 employees',
      industry: 'Robotics & AI',
      description: 'Next-generation intelligent automation and robotics.',
    })
    if (updateProfileRes.status !== 200) {
      throw new Error(`Failed to update recruiter profile: ${JSON.stringify(updateProfileRes.body)}`)
    }

    // Verify Recruiter 1 sees updated profile
    const rec1UpdatedProfileRes = await makeReq('/api/recruiter/profile', 'GET', recAuthHeader)
    const rec1Updated = rec1UpdatedProfileRes.body.data
    if (rec1Updated.companyName !== 'Apex Robotics' || rec1Updated.website !== 'https://apexrobotics.ai') {
      throw new Error(`TEST M FAILED: Profile update did not persist for Recruiter 1!`)
    }

    // Verify Recruiter 2 (OtherCorp) is strictly isolated and still has OtherCorp
    const rec2ProfileRes = await makeReq('/api/recruiter/profile', 'GET', rec2AuthHeader)
    const rec2Profile = rec2ProfileRes.body.data
    console.log('Recruiter 2 Profile (should be OtherCorp):', rec2Profile)
    if (rec2Profile.companyName !== 'OtherCorp') {
      throw new Error(`TEST M FAILED: Recruiter 2 company profile leaked or overwritten: '${rec2Profile.companyName}'`)
    }
    if (rec2Profile.website === 'https://apexrobotics.ai') {
      throw new Error(`TEST M FAILED: Recruiter 1 website leaked to Recruiter 2!`)
    }
    console.log('✓ TEST M PASSED: Recruiter profile persists and is strictly isolated between recruiters.')

    console.log('\n======================================================')
    console.log('ALL TESTS A THROUGH M PASSED WITH 100% SUCCESS!')
    console.log('======================================================')

    server.close(() => {
      process.exit(0)
    })
  } catch (error) {
    console.error('\n❌ DATA INTEGRITY TEST FAILED:', error)
    server.close(() => {
      process.exit(1)
    })
  }
})
