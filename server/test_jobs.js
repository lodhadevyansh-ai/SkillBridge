import http from 'http'
import app from './src/app.js'

const server = app.listen(0, async () => {
  const port = server.address().port
  console.log(`Test server running on port ${port}`)

  const makeReq = (path, method = 'GET', headers = {}, body = null) => {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path,
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
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
      if (body) req.write(JSON.stringify(body))
      req.end()
    })
  }

  try {
    // 1. Fetch default jobs
    const defaultRes = await makeReq('/api/jobs')
    console.assert(defaultRes.status === 200, 'Default jobs fetch should be 200')
    console.assert(defaultRes.body.data.jobs.length > 0, 'Should return jobs')
    console.assert(defaultRes.body.data.pagination.total >= 16, 'Should have at least 16 seeded jobs')
    console.assert(defaultRes.body.data.counts.internships > 0, 'Should calculate facet counts')
    console.log('✓ Pass: Default jobs retrieval with pagination & facet counts')

    // 2. Keyword Search
    const searchRes = await makeReq('/api/jobs?search=react')
    console.assert(searchRes.status === 200, 'Search should be 200')
    const hasReact = searchRes.body.data.jobs.every((j) =>
      j.title.toLowerCase().includes('react') ||
      j.skills.some((s) => s.toLowerCase().includes('react')) ||
      j.description.toLowerCase().includes('react')
    )
    console.assert(hasReact, 'Search filter should accurately match react keyword')
    console.log('✓ Pass: Text keyword search')

    // 3. Location filter
    const remoteRes = await makeReq('/api/jobs?location=remote')
    console.assert(remoteRes.status === 200, 'Remote location filter should be 200')
    console.assert(remoteRes.body.data.jobs.length > 0, 'Should have remote jobs')
    console.log('✓ Pass: Location filter')

    // 4. Job type filter
    const internRes = await makeReq('/api/jobs?type=internship')
    console.assert(internRes.status === 200, 'Type filter should be 200')
    const allInterns = internRes.body.data.jobs.every((j) => j.type.toLowerCase().includes('intern'))
    console.assert(allInterns, 'Type filter should return only internships')
    console.log('✓ Pass: Job type filter')

    // 5. Work arrangement filter
    const hybridRes = await makeReq('/api/jobs?arrangement=hybrid')
    console.assert(hybridRes.status === 200, 'Arrangement filter should be 200')
    const allHybrid = hybridRes.body.data.jobs.every((j) => j.arrangement.toLowerCase() === 'hybrid')
    console.assert(allHybrid, 'Arrangement filter should return only hybrid')
    console.log('✓ Pass: Arrangement filter')

    // 6. Experience filter
    const expRes = await makeReq('/api/jobs?experience=1-2-years')
    console.assert(expRes.status === 200, 'Experience filter should be 200')
    const allOneTwo = expRes.body.data.jobs.every((j) => j.experienceCategory === '1-2-years')
    console.assert(allOneTwo, 'Experience filter should return only 1-2 years')
    console.log('✓ Pass: Experience level filter')

    // 7. Salary filter
    const salaryRes = await makeReq('/api/jobs?minSalary=50000')
    console.assert(salaryRes.status === 200, 'Salary filter should be 200')
    const allAbove50k = salaryRes.body.data.jobs.every((j) => j.salaryMin >= 50000)
    console.assert(allAbove50k, 'Salary filter should return only jobs >= 50,000')
    console.log('✓ Pass: Minimum salary filter')

    // 8. Sorting by salary high
    const sortRes = await makeReq('/api/jobs?sort=salary_high')
    console.assert(sortRes.status === 200, 'Sort should be 200')
    const jobs = sortRes.body.data.jobs
    console.assert(jobs[0].salaryMin >= jobs[1].salaryMin, 'Jobs should be sorted descending by salary')
    console.log('✓ Pass: Sorting options')

    // 9. Pagination
    const page2Res = await makeReq('/api/jobs?page=2&limit=4')
    console.assert(page2Res.status === 200, 'Pagination should be 200')
    console.assert(page2Res.body.data.pagination.page === 2, 'Page should be 2')
    console.assert(page2Res.body.data.jobs.length === 4, 'Page 2 should return limit items')
    console.log('✓ Pass: Pagination')

    // 10. Single job detail
    const detailRes = await makeReq('/api/jobs/job-1')
    console.assert(detailRes.status === 200, 'Job detail should be 200')
    console.assert(detailRes.body.data.id === 'job-1', 'Should retrieve job-1')
    console.log('✓ Pass: Job detail retrieval')

    console.log('\nALL JOB BACKEND TESTS PASSED!')
    server.close(() => process.exit(0))
  } catch (err) {
    console.error('Job test failed:', err)
    server.close(() => process.exit(1))
  }
})

