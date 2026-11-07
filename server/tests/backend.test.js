import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'

describe('SkillBridge Backend Professional Test Suite (Vitest + Supertest)', () => {
  let studentToken
  let studentEmail
  let recruiterToken
  let recruiterEmail
  let otherRecruiterToken
  let adminToken
  let createdJobId
  let candidateAppId

  beforeAll(async () => {
    studentEmail = `vitest.student.${Date.now()}@skillbridge.io`
    recruiterEmail = `vitest.recruiter.${Date.now()}@linear.app`
  })

  // --------------------------------------------------------------------------
  // 1. REGISTRATION & LOGIN
  // --------------------------------------------------------------------------
  describe('Authentication & User Registration', () => {
    it('should register a new student successfully with 201', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Vitest Student Candidate',
          email: studentEmail,
          password: 'Password@123',
          confirmPassword: 'Password@123',
          role: 'student',
          terms: true,
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.token).toBeDefined()
      expect(res.body.user).toBeDefined()
      expect(res.body.user.passwordHash).toBeUndefined()
      expect(res.body.user.role).toBe('student')

      studentToken = res.body.token
    })

    it('should register a new recruiter with company name successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Linear Hiring Lead',
          email: recruiterEmail,
          password: 'Password@123',
          confirmPassword: 'Password@123',
          role: 'recruiter',
          companyName: 'Linear Technologies',
          terms: true,
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.token).toBeDefined()
      recruiterToken = res.body.token
    })

    it('should register a second recruiter for tenant isolation testing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Stripe Hiring Lead',
          email: `stripe.recruiter.${Date.now()}@stripe.com`,
          password: 'Password@123',
          confirmPassword: 'Password@123',
          role: 'recruiter',
          companyName: 'Stripe Payments',
          terms: true,
        })

      expect(res.status).toBe(201)
      otherRecruiterToken = res.body.token
    })

    it('should log in admin account successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@skillbridge.io',
          password: 'admin123',
        })

      expect(res.status).toBe(200)
      expect(res.body.token).toBeDefined()
      adminToken = res.body.token
    })

    it('should block duplicate email registration with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Duplicate Test',
          email: studentEmail,
          password: 'Password@123',
          confirmPassword: 'Password@123',
          role: 'student',
          terms: true,
        })

      expect(res.status).toBe(409)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('already registered')
    })

    it('should reject invalid credentials with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: studentEmail,
          password: 'WrongPassword!',
        })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('should reject non-existent user login with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent.user@skillbridge.io',
          password: 'Password@123',
        })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })

  // --------------------------------------------------------------------------
  // 2. INPUT VALIDATION (ZOD)
  // --------------------------------------------------------------------------
  describe('Input Validation via Zod Schemas', () => {
    it('should reject password mismatch on registration with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Mismatch Tester',
          email: `mismatch.${Date.now()}@skillbridge.io`,
          password: 'Password@123',
          confirmPassword: 'DifferentPassword@456',
          role: 'student',
          terms: true,
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.errors).toBeDefined()
    })

    it('should reject malformed email on registration with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Bad Email Tester',
          email: 'invalid-email-format',
          password: 'Password@123',
          confirmPassword: 'Password@123',
          role: 'student',
          terms: true,
        })

      expect(res.status).toBe(400)
    })

    it('should reject recruiter registration missing company name with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Recruiter No Company',
          email: `recruiter.nocompany.${Date.now()}@example.com`,
          password: 'Password@123',
          confirmPassword: 'Password@123',
          role: 'recruiter',
          companyName: '',
          terms: true,
        })

      expect(res.status).toBe(400)
    })
  })

  // --------------------------------------------------------------------------
  // 3. PROTECTED ROUTES & ROLE-BASED AUTHORIZATION (RBAC)
  // --------------------------------------------------------------------------
  describe('Protected Routes & RBAC Enforcement', () => {
    it('should reject unauthenticated request to student dashboard with 401', async () => {
      const res = await request(app).get('/api/student/dashboard')
      expect(res.status).toBe(401)
    })

    it('should reject unauthenticated request to recruiter dashboard with 401', async () => {
      const res = await request(app).get('/api/recruiter/dashboard')
      expect(res.status).toBe(401)
    })

    it('should reject unauthenticated request to admin dashboard with 401', async () => {
      const res = await request(app).get('/api/admin/dashboard')
      expect(res.status).toBe(401)
    })

    it('should forbid student from accessing recruiter dashboard with 403', async () => {
      const res = await request(app)
        .get('/api/recruiter/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)

      expect(res.status).toBe(403)
      expect(res.body.message).toContain('Forbidden')
    })

    it('should forbid student from accessing admin endpoints with 403', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)

      expect(res.status).toBe(403)
    })

    it('should forbid recruiter from accessing admin endpoints with 403', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${recruiterToken}`)

      expect(res.status).toBe(403)
    })

    it('should allow student to access their own dashboard with 200', async () => {
      const res = await request(app)
        .get('/api/student/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.greeting).toBeDefined()
    })

    it('should allow recruiter to access their own dashboard with 200', async () => {
      const res = await request(app)
        .get('/api/recruiter/dashboard')
        .set('Authorization', `Bearer ${recruiterToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('should allow admin to access administration dashboard with 200', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.stats).toBeDefined()
    })
  })

  // --------------------------------------------------------------------------
  // 4. RECRUITER JOB MANAGEMENT SYSTEM
  // --------------------------------------------------------------------------
  describe('Recruiter Job Management Lifecycle', () => {
    it('should allow recruiter to create a draft job listing', async () => {
      const res = await request(app)
        .post('/api/recruiter/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Staff Platform Engineer',
          description: 'Architect scalable cloud infrastructure, kubernetes, and CI/CD pipelines.',
          type: 'Full-time',
          location: 'Bengaluru · Hybrid',
          arrangement: 'Hybrid',
          experience: '2-4 years',
          stipend: '₹24–36 LPA',
          skills: ['Node.js', 'PostgreSQL', 'Docker', 'Kubernetes'],
          status: 'Draft',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBeDefined()
      createdJobId = res.body.data.id
    })

    it('should allow recruiter to retrieve their created job by ID', async () => {
      const res = await request(app)
        .get(`/api/recruiter/jobs/${createdJobId}`)
        .set('Authorization', `Bearer ${recruiterToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data.id).toBe(createdJobId)
      expect(res.body.data.title).toBe('Staff Platform Engineer')
    })

    it('should allow recruiter to edit their job listing', async () => {
      const res = await request(app)
        .put(`/api/recruiter/jobs/${createdJobId}`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Principal Platform Engineer',
          stipend: '₹28–42 LPA',
        })

      expect(res.status).toBe(200)
      expect(res.body.data.title).toBe('Principal Platform Engineer')
    })

    it('should allow recruiter to publish the job to Active', async () => {
      const res = await request(app)
        .patch(`/api/recruiter/jobs/${createdJobId}/publish`)
        .set('Authorization', `Bearer ${recruiterToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('Active')
    })

    it('should prevent other recruiters from editing the job (Tenant Isolation)', async () => {
      const res = await request(app)
        .put(`/api/recruiter/jobs/${createdJobId}`)
        .set('Authorization', `Bearer ${otherRecruiterToken}`)
        .send({ title: 'Tampered Title' })

      expect([403, 404]).toContain(res.status)
    })

    it('should prevent other recruiters from deleting the job (Tenant Isolation)', async () => {
      const res = await request(app)
        .delete(`/api/recruiter/jobs/${createdJobId}`)
        .set('Authorization', `Bearer ${otherRecruiterToken}`)

      expect([403, 404]).toContain(res.status)
    })

    it('should allow recruiter to close the job listing', async () => {
      const res = await request(app)
        .patch(`/api/recruiter/jobs/${createdJobId}/close`)
        .set('Authorization', `Bearer ${recruiterToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('Closed')
    })
  })

  // --------------------------------------------------------------------------
  // 5. JOB SEARCH, FILTERING & PUBLIC CATALOG
  // --------------------------------------------------------------------------
  describe('Job Search & Filtering Capabilities', () => {
    it('should retrieve job opportunities with default pagination and facet counts', async () => {
      const res = await request(app).get('/api/jobs')
      expect(res.status).toBe(200)
      expect(res.body.data.jobs).toBeDefined()
      expect(res.body.data.pagination).toBeDefined()
      expect(res.body.data.counts).toBeDefined()
    })

    it('should filter jobs by search keyword', async () => {
      const res = await request(app).get('/api/jobs?search=react')
      expect(res.status).toBe(200)
      expect(res.body.data.jobs.length).toBeGreaterThan(0)
      expect(res.body.data.jobs.every((j) => 
        j.title.toLowerCase().includes('react') || 
        (j.skills && j.skills.some(s => s.toLowerCase().includes('react'))) ||
        (j.description && j.description.toLowerCase().includes('react'))
      )).toBe(true)
    })

    it('should filter jobs by location arrangement', async () => {
      const res = await request(app).get('/api/jobs?arrangement=Remote')
      expect(res.status).toBe(200)
      expect(res.body.data.jobs.every((j) => j.arrangement.toLowerCase() === 'remote')).toBe(true)
    })
  })

  // --------------------------------------------------------------------------
  // 6. STUDENT JOB APPLICATION & DUPLICATE PREVENTION
  // --------------------------------------------------------------------------
  describe('Application Workflow & Duplicate Prevention', () => {
    it('should allow student to upload a valid resume', async () => {
      const res = await request(app)
        .post('/api/student/resumes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Vitest_Candidate_Resume.pdf',
          fileSize: 1024 * 350,
          fileType: 'application/pdf',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.name).toContain('Resume.pdf')
    })

    it('should submit an application for an active job', async () => {
      const res = await request(app)
        .post('/api/jobs/job-1/apply')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          resumeName: 'Vitest_Candidate_Resume.pdf',
          coverLetter: 'I am excited to apply for this design role.',
          portfolioUrl: 'https://portfolio.example.com',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(['in-review', 'Applied']).toContain(res.body.data.status)
      candidateAppId = res.body.data.id
    })

    it('should block duplicate application for the same job with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/jobs/job-1/apply')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          resumeName: 'Vitest_Candidate_Resume.pdf',
        })

      expect(res.status).toBe(409)
      expect(res.body.code).toBe('ALREADY_APPLIED')
    })

    it('should reflect the application in student application dashboard', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${studentToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data.applications.some((a) => a.jobId === 'job-1')).toBe(true)
    })
  })

  // --------------------------------------------------------------------------
  // 7. CANDIDATE PIPELINE & APPLICATION STATUS UPDATES
  // --------------------------------------------------------------------------
  describe('Candidate Pipeline & Application Updates', () => {
    let meeraAppId

    it('should retrieve candidates for job owner recruiter', async () => {
      // Meera owns job-1
      const loginMeera = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'meera@linear.app',
          password: 'password123',
        })
      expect(loginMeera.status).toBe(200)
      const meeraToken = loginMeera.body.token

      const res = await request(app)
        .get('/api/recruiter/candidates?jobId=job-1')
        .set('Authorization', `Bearer ${meeraToken}`)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
      meeraAppId = res.body.data[0].id

      // Update candidate stage to Shortlisted
      const stageRes = await request(app)
        .patch(`/api/recruiter/candidates/${meeraAppId}/stage`)
        .set('Authorization', `Bearer ${meeraToken}`)
        .send({
          stage: 'Shortlisted',
          note: 'Top tier portfolio and relevant systems design experience.',
        })

      expect(stageRes.status).toBe(200)
      expect(['Shortlisted', 'shortlisted']).toContain(stageRes.body.data.stageLabel || stageRes.body.data.status)

      // Schedule interview
      const intRes = await request(app)
        .post(`/api/recruiter/candidates/${meeraAppId}/interview`)
        .set('Authorization', `Bearer ${meeraToken}`)
        .send({
          interviewDate: '2026-11-15',
          interviewTime: '14:30 IST',
          interviewMode: 'Google Meet',
          meetingUrl: 'https://meet.google.com/xyz-test',
          instructions: 'Prepare portfolio walkthrough.',
        })

      expect(intRes.status).toBe(200)
      expect(intRes.body.data.stageLabel || intRes.body.data.status).toBeDefined()
    })
  })

  // --------------------------------------------------------------------------
  // 8. UNAUTHORIZED RESOURCE ACCESS & DATA ISOLATION
  // --------------------------------------------------------------------------
  describe('Resource Isolation & Access Control Protection', () => {
    it('should forbid student from accessing another candidate private resume', async () => {
      // Second student
      const reg2 = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Second Student',
          email: `student2.${Date.now()}@example.com`,
          password: 'Password@123',
          confirmPassword: 'Password@123',
          role: 'student',
          terms: true,
        })
      const student2Token = reg2.body.token

      // Attempt to access student 1's resume
      const res = await request(app)
        .get('/api/student/resumes/Vitest_Candidate_Resume.pdf/access')
        .set('Authorization', `Bearer ${student2Token}`)

      expect(res.status).toBe(403)
      expect(res.body.code).toBe('FORBIDDEN')
    })
  })
})
