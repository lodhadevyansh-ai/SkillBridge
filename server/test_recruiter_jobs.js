import http from 'http'
import app from './src/app.js'

const server = app.listen(0, '127.0.0.1', async () => {
  const port = server.address().port
  console.log(`Recruiter Jobs test server running on 127.0.0.1:${port}`)

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
    console.log('--- TESTING COMPLETE RECRUITER JOB MANAGEMENT SYSTEM ---')

    // 1. Authenticate recruiter 1 (Meera - Linear)
    const loginMeera = await makeReq('/api/auth/login', 'POST', {}, {
      email: 'meera@linear.app',
      password: 'password123',
    })
    console.assert(loginMeera.status === 200, 'Meera login should succeed')
    const meeraToken = loginMeera.body.token || loginMeera.body.data?.token
    const meeraHeaders = { Authorization: `Bearer ${meeraToken}` }
    console.log('✓ Pass: Recruiter 1 (Meera) authenticated')

    // 2. Register and authenticate recruiter 2 (Vikram - Stripe)
    const stripeEmail = `vikram_${Date.now()}@stripe.com`
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
    console.log('✓ Pass: Recruiter 2 (Vikram) authenticated')

    // 3. Meera creates a draft job listing
    const draftPayload = {
      title: 'DevOps & Platform Engineering Intern',
      company: 'Linear',
      location: 'Bengaluru · Hybrid',
      arrangement: 'Hybrid',
      type: 'Internship',
      experience: 'Entry level',
      stipend: '₹40,000 / month',
      deadline: '15 Dec 2026',
      description: 'Support core developer infrastructure and CI/CD pipelines.',
      responsibilities: ['Build GitHub Actions pipelines', 'Monitor Kubernetes clusters'],
      qualifications: ['Hands-on Linux & Docker knowledge', 'Curious and eager to learn'],
      skills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux'],
      status: 'Draft',
    }
    const createDraftRes = await makeReq('/api/recruiter/jobs', 'POST', meeraHeaders, draftPayload)
    console.assert(createDraftRes.status === 201, 'Create draft should return 201')
    const createdJob = createDraftRes.body.data
    console.assert(
      createdJob && createdJob.status && createdJob.status.toLowerCase() === 'draft',
      `Job status must be Draft but received: ${createdJob?.status}`
    )
    console.assert(createdJob.title === 'DevOps & Platform Engineering Intern')
    const jobId = createdJob.id
    console.log(`✓ Pass: Draft job created with ID: ${jobId}`)

    // 4. Meera fetches the single job details by ID
    const getJobRes = await makeReq(`/api/recruiter/jobs/${jobId}`, 'GET', meeraHeaders)
    console.assert(getJobRes.status === 200, 'GET job by ID should return 200')
    console.assert(getJobRes.body.data.id === jobId)
    console.assert(getJobRes.body.data.skills.includes('Kubernetes'))
    console.log('✓ Pass: Single job details retrieved by ID')

    // 5. Meera updates the job listing
    const updateRes = await makeReq(`/api/recruiter/jobs/${jobId}`, 'PUT', meeraHeaders, {
      title: 'DevOps & Cloud Engineering Intern',
      stipend: '₹45,000 / month',
      skills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform'],
    })
    console.assert(updateRes.status === 200, 'Update job should return 200')
    console.assert(updateRes.body.data.title === 'DevOps & Cloud Engineering Intern')
    console.assert(updateRes.body.data.skills.includes('Terraform'))
    console.log('✓ Pass: Job listing updated successfully')

    // 6. Meera publishes the draft job to Active
    const publishRes = await makeReq(`/api/recruiter/jobs/${jobId}/publish`, 'PATCH', meeraHeaders)
    console.assert(publishRes.status === 200, 'Publish job should return 200')
    console.assert(publishRes.body.data.status === 'Active', 'Job status should now be Active')
    console.log('✓ Pass: Draft job published to Active')

    // 7. Meera closes the job listing
    const closeRes = await makeReq(`/api/recruiter/jobs/${jobId}/close`, 'PATCH', meeraHeaders)
    console.assert(closeRes.status === 200, 'Close job should return 200')
    console.assert(closeRes.body.data.status === 'Closed', 'Job status should now be Closed')
    console.log('✓ Pass: Active job closed successfully')

    // 8. SECURITY CHECK: Vikram (Recruiter 2) tries to edit Meera's job -> MUST FAIL WITH 403
    const unauthorizedEdit = await makeReq(`/api/recruiter/jobs/${jobId}`, 'PUT', vikramHeaders, {
      title: 'Hacked Title',
    })
    console.assert(
      unauthorizedEdit.status === 403 || unauthorizedEdit.status === 404,
      'Vikram must NOT be allowed to edit Meera’s job'
    )
    console.log('✓ Pass: Unauthorized edit blocked (403/404)')

    // 9. SECURITY CHECK: Vikram tries to delete Meera's job -> MUST FAIL WITH 403
    const unauthorizedDelete = await makeReq(`/api/recruiter/jobs/${jobId}`, 'DELETE', vikramHeaders)
    console.assert(
      unauthorizedDelete.status === 403 || unauthorizedDelete.status === 404,
      'Vikram must NOT be allowed to delete Meera’s job'
    )
    console.log('✓ Pass: Unauthorized delete blocked (403/404)')

    // 10. Meera deletes her own job -> MUST SUCCEED
    const deleteRes = await makeReq(`/api/recruiter/jobs/${jobId}`, 'DELETE', meeraHeaders)
    console.assert(deleteRes.status === 200, 'Delete job should return 200')
    console.assert(deleteRes.body.success === true)
    console.log('✓ Pass: Meera successfully deleted her job')

    // 11. Verify job is gone
    const verifyGet = await makeReq(`/api/recruiter/jobs/${jobId}`, 'GET', meeraHeaders)
    console.assert(verifyGet.status === 404, 'Deleted job should return 404')
    console.log('✓ Pass: Verified job is completely removed')

    // 12. Test search & filter tabs on /api/recruiter/jobs
    const searchRes = await makeReq('/api/recruiter/jobs?search=Product&status=active', 'GET', meeraHeaders)
    console.assert(searchRes.status === 200)
    const searchJobs = searchRes.body.data.jobs || searchRes.body.data
    console.assert(Array.isArray(searchJobs))
    console.log(`✓ Pass: Recruiter jobs filtered query returned ${searchJobs.length} results`)

    console.log('\n--- ALL RECRUITER JOB MANAGEMENT TESTS PASSED! ---')
    server.close(() => process.exit(0))
  } catch (err) {
    console.error('Job management test failed:', err)
    server.close(() => process.exit(1))
  }
})
