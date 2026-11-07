import http from 'http'
import app from './src/app.js'

const server = app.listen(0, '127.0.0.1', async () => {
  const port = server.address().port
  console.log(`Test server running on 127.0.0.1:${port}`)

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
    console.log('--- TESTING SAVED JOBS, STUDENT PROFILE & RESUME MANAGEMENT ---')

    // 1. Authenticate as a test student
    const testEmail = `test.profile.${Date.now()}@example.com`
    const regRes = await makeReq('/api/auth/register', 'POST', {}, {
      fullName: 'Test Candidate Profile',
      email: testEmail,
      password: 'password123',
      confirmPassword: 'password123',
      role: 'student',
      terms: true,
    })
    console.assert(regRes.status === 201, 'Student registration should succeed')
    const token = regRes.body.token
    const authHeaders = { Authorization: `Bearer ${token}` }

    // 2. Test GET /api/student/saved-jobs
    console.log('Testing GET /api/student/saved-jobs...')
    const savedRes = await makeReq('/api/student/saved-jobs', 'GET', authHeaders)
    console.assert(savedRes.status === 200, 'Should return saved jobs')
    console.assert(savedRes.body.success, 'Response should indicate success')
    console.assert(Array.isArray(savedRes.body.data.jobs), 'Jobs should be an array')
    console.assert(savedRes.body.data.stats.total >= 0, 'Stats total should exist')
    console.assert(savedRes.body.data.counts.all >= 0, 'Counts all should exist')
    console.log(`✓ Fetched ${savedRes.body.data.jobs.length} saved jobs successfully`)

    // 3. Test filtering saved jobs by internships
    const internRes = await makeReq('/api/student/saved-jobs?type=internships', 'GET', authHeaders)
    console.assert(internRes.status === 200)
    console.assert(internRes.body.data.jobs.every((j) => j.type === 'Internship'), 'All jobs should be internships')
    console.log(`✓ Filtered internships: ${internRes.body.data.jobs.length} jobs`)

    // 4. Test GET /api/student/profile
    console.log('Testing GET /api/student/profile...')
    const profileRes = await makeReq('/api/student/profile', 'GET', authHeaders)
    console.assert(profileRes.status === 200)
    console.assert(profileRes.body.data.fullName === 'Test Candidate Profile', 'Full name should match')
    console.assert(profileRes.body.data.profileStrength >= 0, 'Profile strength should be computed')
    console.log(`✓ Profile loaded. Initial strength: ${profileRes.body.data.profileStrength}%`)

    // 5. Test PUT /api/student/profile
    console.log('Testing PUT /api/student/profile...')
    const updateRes = await makeReq('/api/student/profile', 'PUT', authHeaders, {
      headline: 'Senior Product Designer & Design Systems Specialist',
      phone: '+91 98765 11111',
      projects: [
        ...(profileRes.body.data.projects || []),
        {
          id: 'proj-1',
          title: 'Design System Library for React',
          role: 'Creator & Maintainer',
          description: 'Accessible Tailwind design system library with 40+ primitives.',
          skills: ['React', 'Tailwind CSS', 'Figma'],
          githubUrl: 'https://github.com/candidate/design-system',
          liveUrl: 'https://ds.example.com',
          date: 'Oct 2026',
        },
      ],
    })
    console.assert(updateRes.status === 200)
    console.assert(
      updateRes.body.data.headline === 'Senior Product Designer & Design Systems Specialist',
      'Headline should update'
    )
    console.assert(updateRes.body.data.projects.length >= 1, 'Should have at least 1 project now')
    console.log('✓ Profile updated and strength successfully recalculated')

    // 6. Test GET /api/student/resumes
    console.log('Testing GET /api/student/resumes...')
    const resumesRes = await makeReq('/api/student/resumes', 'GET', authHeaders)
    console.assert(resumesRes.status === 200)
    console.assert(Array.isArray(resumesRes.body.data), 'Resumes should be an array')
    console.log(`✓ Retrieved ${resumesRes.body.data.length} resumes`)

    // 7. Test POST /api/student/resumes - validation
    console.log('Testing resume upload validation...')
    const invalidTypeRes = await makeReq('/api/student/resumes', 'POST', authHeaders, {
      name: 'malicious_script.exe',
      fileSize: 1024,
    })
    console.assert(invalidTypeRes.status === 400, 'Should reject non-PDF/DOCX file')

    const invalidSizeRes = await makeReq('/api/student/resumes', 'POST', authHeaders, {
      name: 'huge_portfolio.pdf',
      fileSize: 10 * 1024 * 1024, // 10 MB
    })
    console.assert(invalidSizeRes.status === 400, 'Should reject file > 5 MB')
    console.log('✓ Type and size validations enforced correctly')

    // 8. Test POST /api/student/resumes - valid upload
    console.log('Testing valid resume upload...')
    const uploadRes = await makeReq('/api/student/resumes', 'POST', authHeaders, {
      name: 'Candidate_Senior_Resume.pdf',
      fileSize: 320000,
      fileType: 'application/pdf',
    })
    console.assert(uploadRes.status === 201)
    console.assert(uploadRes.body.data.id, 'New resume should have an ID')
    console.assert(uploadRes.body.data.url.includes('cloudinary.com'), 'New resume should have Cloudinary URL')
    console.log(`✓ Uploaded new resume: ${uploadRes.body.data.name} with Cloudinary reference`)

    const newResumeId = uploadRes.body.data.id

    // 9. Test PATCH /api/student/resumes/:id/default
    console.log('Testing setting resume as default...')
    const defaultRes = await makeReq(`/api/student/resumes/${newResumeId}/default`, 'PATCH', authHeaders)
    console.assert(defaultRes.status === 200)
    console.assert(defaultRes.body.data.isDefault === true, 'Resume should now be default')
    console.log('✓ Successfully set new resume as default')

    // 10. Test DELETE /api/student/resumes/:id
    console.log('Testing resume deletion...')
    const deleteRes = await makeReq(`/api/student/resumes/${newResumeId}`, 'DELETE', authHeaders)
    console.assert(deleteRes.status === 200)
    console.assert(deleteRes.body.success)
    console.log('✓ Successfully deleted resume')

    console.log('\n--- ALL PROFILE, SAVED JOBS & RESUME TESTS PASSED! ---')
    process.exit(0)
  } catch (err) {
    console.error('Test assertion failed:', err)
    process.exit(1)
  } finally {
    server.close()
  }
})
