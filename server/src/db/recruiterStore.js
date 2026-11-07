import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { jobStore } from './jobStore.js'
import { userStore } from './userStore.js'
import { notificationStore } from './notificationStore.js'
import { emailService } from '../services/emailService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, '..', '..', 'data')
const RECRUITER_DATA_FILE = path.join(DATA_DIR, 'recruiterData.json')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const LINEAR_OPEN_ROLES = [
  {
    id: 'job-1',
    title: 'Product Design Intern',
    company: 'Linear',
    recruiterId: 'usr_recruiter_meera',
    type: 'Internship',
    location: 'Bengaluru · Hybrid',
    arrangement: 'Hybrid',
    closesOn: '02 Nov 2026',
    status: 'Active',
    applicantsCount: 84,
    shortlistedCount: 12,
    stipend: '₹30,000 / month',
  },
  {
    id: 'job-17',
    title: 'Frontend Engineer',
    company: 'Linear',
    recruiterId: 'usr_recruiter_meera',
    type: 'Full-time',
    location: 'Remote · India',
    arrangement: 'Remote',
    closesOn: '10 Nov 2026',
    status: 'Active',
    applicantsCount: 126,
    shortlistedCount: 18,
    stipend: '₹14–22 LPA',
  },
  {
    id: 'job-18',
    title: 'Design Systems Intern',
    company: 'Linear',
    recruiterId: 'usr_recruiter_meera',
    type: 'Internship',
    location: 'Bengaluru · On-site',
    arrangement: 'On-site',
    closesOn: '30 Oct 2026',
    status: 'Active',
    applicantsCount: 48,
    shortlistedCount: 6,
    stipend: '₹35,000 / month',
  },
  {
    id: 'job-19',
    title: 'Senior Product Designer',
    company: 'Linear',
    recruiterId: 'usr_recruiter_meera',
    type: 'Full-time',
    location: 'Remote · India',
    arrangement: 'Remote',
    closesOn: '15 Nov 2026',
    status: 'Active',
    applicantsCount: 36,
    shortlistedCount: 5,
    stipend: '₹24–36 LPA',
  },
  {
    id: 'job-20',
    title: 'DevOps / Platform Engineer',
    company: 'Linear',
    recruiterId: 'usr_recruiter_meera',
    type: 'Full-time',
    location: 'Bengaluru · Hybrid',
    arrangement: 'Hybrid',
    closesOn: '20 Nov 2026',
    status: 'Active',
    applicantsCount: 28,
    shortlistedCount: 4,
    stipend: '₹18–28 LPA',
  },
  {
    id: 'job-21',
    title: 'Product Operations Specialist',
    company: 'Linear',
    recruiterId: 'usr_recruiter_meera',
    type: 'Full-time',
    location: 'Bengaluru · Hybrid',
    arrangement: 'Hybrid',
    closesOn: '25 Nov 2026',
    status: 'Active',
    applicantsCount: 20,
    shortlistedCount: 3,
    stipend: '₹12–16 LPA',
  },
]

const LINEAR_APPLICATIONS = [
  {
    id: 'app-rec-1',
    candidateId: 'cand-1',
    candidateName: 'Nisha Khanna',
    initials: 'NK',
    email: 'nisha.khanna@nid.ac.in',
    college: 'NID Ahmedabad · B.Des',
    graduationYear: 2026,
    location: 'Bengaluru, India',
    roleApplied: 'Product Design Intern',
    jobId: 'job-1',
    appliedDate: '24 Oct 2026',
    matchScore: 96,
    stage: 'interview',
    stageLabel: 'Interview',
    interviewTime: '10:30 AM',
    interviewDate: 'Today',
    meetingUrl: 'https://meet.google.com/sb-linear-nisha',
    skills: ['Figma', 'UI design', 'Prototyping', 'User research'],
    resumeUrl: 'https://res.cloudinary.com/skillbridge/raw/upload/v1730485920/resumes/cand-1/Nisha_Khanna_Design_CV.pdf',
  },
  {
    id: 'app-rec-2',
    candidateId: 'cand-2',
    candidateName: 'Arjun Verma',
    initials: 'AV',
    email: 'arjun.verma@iitd.ac.in',
    college: 'IIT Delhi · B.Tech CS',
    graduationYear: 2026,
    location: 'New Delhi / Remote',
    roleApplied: 'Frontend Engineer',
    jobId: 'job-17',
    appliedDate: '22 Oct 2026',
    matchScore: 95,
    stage: 'interview',
    stageLabel: 'Interview',
    interviewTime: '2:00 PM',
    interviewDate: 'Today',
    meetingUrl: 'https://meet.google.com/sb-linear-arjun',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    resumeUrl: 'https://res.cloudinary.com/skillbridge/raw/upload/v1730485920/resumes/cand-2/Arjun_Verma_Resume.pdf',
  },
  {
    id: 'app-rec-3',
    candidateId: 'cand-3',
    candidateName: 'Rohan Mehta',
    initials: 'RM',
    email: 'rohan.mehta@iitg.ac.in',
    college: 'IIT Guwahati · B.Des',
    graduationYear: 2026,
    location: 'Guwahati, India',
    roleApplied: 'Product Design Intern',
    jobId: 'job-1',
    appliedDate: '21 Oct 2026',
    matchScore: 94,
    stage: 'shortlisted',
    stageLabel: 'Shortlisted',
    skills: ['Figma', 'Interaction Design', 'Wireframing'],
    resumeUrl: 'https://res.cloudinary.com/skillbridge/raw/upload/v1730485920/resumes/cand-3/Rohan_Mehta_Portfolio.pdf',
  },
  {
    id: 'app-rec-4',
    candidateId: 'cand-4',
    candidateName: 'Ishita Patel',
    initials: 'IP',
    email: 'ishita.patel@srishti.ac.in',
    college: 'Srishti Manipal · B.Des',
    graduationYear: 2027,
    location: 'Bengaluru, India',
    roleApplied: 'Design Systems Intern',
    jobId: 'job-18',
    appliedDate: '20 Oct 2026',
    matchScore: 92,
    stage: 'shortlisted',
    stageLabel: 'Shortlisted',
    skills: ['Design Systems', 'Figma Tokens', 'Prototyping'],
    resumeUrl: 'https://res.cloudinary.com/skillbridge/raw/upload/v1730485920/resumes/cand-4/Ishita_Patel_CV.pdf',
  },
  {
    id: 'app-rec-5',
    candidateId: 'cand-5',
    candidateName: 'Aditi Sharma',
    initials: 'AS',
    email: 'aditi.sharma@nift.ac.in',
    college: 'NIFT Bengaluru · B.Des 2027',
    graduationYear: 2027,
    location: 'Bengaluru, India',
    roleApplied: 'Product Design Intern',
    jobId: 'job-1',
    appliedDate: '18 Oct 2026',
    matchScore: 98,
    stage: 'shortlisted',
    stageLabel: 'Shortlisted',
    skills: ['Figma', 'UI design', 'Prototyping', 'Design systems'],
    resumeUrl: 'https://res.cloudinary.com/skillbridge/raw/upload/v1730485920/resumes/cand-5/Aditi_Sharma_Resume.pdf',
  },
  {
    id: 'app-rec-6',
    candidateId: 'cand-6',
    candidateName: 'Kabir Sen',
    initials: 'KS',
    email: 'kabir.sen@pilani.bits-pilani.ac.in',
    college: 'BITS Pilani · CS',
    graduationYear: 2026,
    location: 'Pilani / Bengaluru',
    roleApplied: 'Frontend Engineer',
    jobId: 'job-17',
    appliedDate: '25 Oct 2026',
    matchScore: 91,
    stage: 'in-review',
    stageLabel: 'In review',
    skills: ['React', 'JavaScript', 'CSS'],
    resumeUrl: 'https://res.cloudinary.com/skillbridge/raw/upload/v1730485920/resumes/cand-6/Kabir_Sen_Resume.pdf',
  },
  {
    id: 'app-rec-7',
    candidateId: 'cand-7',
    candidateName: 'Devika Nair',
    initials: 'DN',
    email: 'devika.nair@dtu.ac.in',
    college: 'DTU Delhi · Software Eng',
    graduationYear: 2026,
    location: 'New Delhi, India',
    roleApplied: 'Frontend Engineer',
    jobId: 'job-17',
    appliedDate: '26 Oct 2026',
    matchScore: 89,
    stage: 'in-review',
    stageLabel: 'In review',
    skills: ['Vue.js', 'React', 'JavaScript'],
    resumeUrl: 'https://res.cloudinary.com/skillbridge/raw/upload/v1730485920/resumes/cand-7/Devika_Nair_Resume.pdf',
  },
  {
    id: 'app-rec-8',
    candidateId: 'cand-8',
    candidateName: 'Aditya Rao',
    initials: 'AR',
    email: 'aditya.rao@iiit.ac.in',
    college: 'IIIT Hyderabad · B.Tech CS',
    graduationYear: 2025,
    location: 'Hyderabad, India',
    roleApplied: 'Product Operations Specialist',
    jobId: 'job-21',
    appliedDate: '15 Oct 2026',
    matchScore: 90,
    stage: 'offer',
    stageLabel: 'Offer Extended',
    skills: ['Operations', 'SQL', 'Project Management'],
    resumeUrl: 'https://res.cloudinary.com/skillbridge/raw/upload/v1730485920/resumes/cand-8/Aditya_Rao_CV.pdf',
  },
]

const LINEAR_APPLICATION_TRENDS = [
  { date: '01 Oct', current: 22, previous: 14 },
  { date: '04 Oct', current: 34, previous: 20 },
  { date: '07 Oct', current: 28, previous: 18 },
  { date: '10 Oct', current: 46, previous: 30 },
  { date: '13 Oct', current: 40, previous: 26 },
  { date: '16 Oct', current: 58, previous: 38 },
  { date: '19 Oct', current: 65, prev: 42, previous: 42 },
  { date: '22 Oct', current: 72, previous: 48 },
]

function getInitialData() {
  return {
    jobs: {
      usr_recruiter_meera: LINEAR_OPEN_ROLES,
    },
    applications: {
      usr_recruiter_meera: LINEAR_APPLICATIONS,
    },
    trends: {
      usr_recruiter_meera: LINEAR_APPLICATION_TRENDS,
    },
    companyProfiles: {
      usr_recruiter_meera: {
        companyName: 'Linear Software Inc.',
        website: 'https://linear.app',
        headquarters: 'San Francisco, USA',
        companySize: '51–200 employees',
        description: "Linear is the issue tracking tool you'll enjoy using. We are building a better way to plan and build products, powering high-caliber design and engineering teams worldwide.",
        industry: 'Software Development',
        logo: 'L',
        initials: 'L',
        leadRecruiter: 'Meera Kapoor',
        workEmail: 'meera@linear.app',
        isVerified: true,
      },
    },
  }
}

function readData() {
  try {
    if (!fs.existsSync(RECRUITER_DATA_FILE)) {
      const initial = getInitialData()
      fs.writeFileSync(RECRUITER_DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8')
      return initial
    }
    const raw = fs.readFileSync(RECRUITER_DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    if (!parsed.companyProfiles) parsed.companyProfiles = {}
    return parsed
  } catch (err) {
    console.error('Error reading recruiter data:', err)
    return getInitialData()
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(RECRUITER_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing recruiter data:', err)
  }
}

export const recruiterStore = {
  /**
   * Get authenticated recruiter's company profile
   */
  getCompanyProfile(recruiterId) {
    if (!recruiterId) return null
    const data = readData()
    if (!data.companyProfiles) data.companyProfiles = {}

    if (data.companyProfiles[recruiterId]) {
      return data.companyProfiles[recruiterId]
    }

    const user = userStore.findById(recruiterId)
    const companyName = (user?.companyName || 'My Company').trim()
    const initials = companyName ? companyName[0].toUpperCase() : 'C'

    const newProfile = {
      companyName,
      website: '',
      headquarters: '',
      companySize: '',
      description: '',
      industry: 'Technology',
      logo: initials,
      initials,
      leadRecruiter: user?.fullName || 'Recruiter',
      workEmail: user?.email || '',
      isVerified: user?.isVerified || false,
      createdAt: new Date().toISOString(),
    }

    data.companyProfiles[recruiterId] = newProfile
    writeData(data)
    return newProfile
  },

  /**
   * Update authenticated recruiter's company profile with authorization and persistence
   */
  updateCompanyProfile(recruiterId, updates = {}) {
    if (!recruiterId) {
      const err = new Error('Authentication required')
      err.status = 401
      throw err
    }

    const data = readData()
    if (!data.companyProfiles) data.companyProfiles = {}

    const current = this.getCompanyProfile(recruiterId)
    const companyName = (updates.companyName !== undefined ? updates.companyName : current.companyName).trim()
    const initials = companyName ? companyName[0].toUpperCase() : (current.initials || 'C')

    const updated = {
      ...current,
      ...updates,
      companyName,
      website: updates.website !== undefined ? updates.website.trim() : current.website,
      headquarters: updates.headquarters !== undefined ? updates.headquarters.trim() : current.headquarters,
      companySize: updates.companySize !== undefined ? updates.companySize.trim() : current.companySize,
      description: updates.description !== undefined ? updates.description.trim() : current.description,
      industry: updates.industry !== undefined ? updates.industry.trim() : (current.industry || 'Technology'),
      logo: initials,
      initials,
      leadRecruiter: updates.leadRecruiter !== undefined ? updates.leadRecruiter.trim() : current.leadRecruiter,
      workEmail: updates.workEmail !== undefined ? updates.workEmail.trim() : current.workEmail,
      updatedAt: new Date().toISOString(),
    }

    data.companyProfiles[recruiterId] = updated
    writeData(data)

    // Sync updated companyName to user record in userStore
    try {
      if (companyName && companyName !== current.companyName) {
        userStore.updateUser(recruiterId, { companyName })
      }
    } catch (e) {
      console.warn('Could not sync companyName to userStore:', e.message)
    }

    return updated
  },

  /**
   * Get all jobs owned strictly by the recruiter with optional search, status filter, and pagination
   */
  getRecruiterJobs(recruiterId, { search = '', status = 'all', page = 1, limit = 10 } = {}) {
    const data = readData()
    // 1. Check in recruiter data store
    let jobs = data.jobs[recruiterId] || []

    // 2. Fallback check in master jobStore strictly by recruiterId
    if (jobs.length === 0) {
      const allJobs = jobStore.getAllJobs()
      jobs = allJobs.filter((j) => j.recruiterId === recruiterId)
    }

    // Compute status counts across all recruiter jobs
    const counts = {
      all: jobs.length,
      active: jobs.filter((j) => (j.status || 'Active').toLowerCase() === 'active').length,
      draft: jobs.filter((j) => (j.status || '').toLowerCase() === 'draft').length,
      closed: jobs.filter((j) => (j.status || '').toLowerCase() === 'closed').length,
    }

    // Filter by status tab
    if (status && status !== 'all') {
      const s = status.toLowerCase()
      jobs = jobs.filter((j) => (j.status || 'Active').toLowerCase() === s)
    }

    // Filter by search query
    if (search && search.trim()) {
      const q = search.trim().toLowerCase()
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          (j.skills && j.skills.some((sk) => sk.toLowerCase().includes(q)))
      )
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.max(1, parseInt(limit, 10) || 10)
    const total = jobs.length
    const totalPages = Math.ceil(total / limitNum) || 1
    const startIndex = (pageNum - 1) * limitNum
    const paginated = jobs.slice(startIndex, startIndex + limitNum)

    return {
      jobs: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasPrev: pageNum > 1,
        hasNext: pageNum < totalPages,
      },
      counts,
    }
  },

  /**
   * Get single recruiter job by ID with ownership verification and candidate application stats
   */
  getRecruiterJobById(recruiterId, jobId) {
    const data = readData()
    const jobs = data.jobs[recruiterId] || []
    const job = jobs.find((j) => j.id === jobId)

    if (!job) {
      // Check if job exists in master store under another recruiter -> 403 Forbidden
      const allJobs = jobStore.getAllJobs()
      const otherJob = allJobs.find((j) => j.id === jobId)
      if (otherJob && otherJob.recruiterId && otherJob.recruiterId !== recruiterId) {
        const error = new Error('Access denied. You do not have permission to view or manage another recruiter’s job listing.')
        error.status = 403
        throw error
      }
      const error = new Error(`Job listing '${jobId}' was not found.`)
      error.status = 404
      throw error
    }

    // Fetch live applications for this specific job
    const applications = this.getRecruiterApplications(recruiterId, { jobId })

    return {
      ...job,
      job,
      applications,
      applicantsCount: applications.length || job.applicantsCount || 0,
      shortlistedCount: applications.filter((a) => a.stage === 'shortlisted').length || job.shortlistedCount || 0,
    }
  },

  /**
   * Post a new role by this recruiter (or save as Draft)
   */
  createJob(recruiterId, jobData) {
    const user = userStore.findById(recruiterId)
    const company = user?.companyName || jobData.company || 'Company'
    const status = jobData.status || (jobData.isDraft ? 'Draft' : 'Active')

    let formattedStipend = jobData.stipend
    if (!formattedStipend && jobData.salaryMin) {
      const min = Number(jobData.salaryMin).toLocaleString('en-IN')
      const max = jobData.salaryMax ? Number(jobData.salaryMax).toLocaleString('en-IN') : null
      const period = jobData.salaryPeriod === 'month' ? '/ month' : 'LPA'
      formattedStipend = max ? `₹${min}–${max} ${period}` : `₹${min} ${period}`
    }

    const newJob = {
      id: `job-${Date.now()}`,
      title: jobData.title,
      company,
      companySlug: company.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      companyAbout: jobData.companyAbout || `${company} is an industry-leading product team.`,
      logo: company[0].toUpperCase(),
      location: jobData.location || 'Bengaluru · Hybrid',
      arrangement: jobData.arrangement || 'Hybrid',
      type: jobData.type || 'Full-time',
      duration: jobData.duration || (jobData.type === 'Internship' ? '6 months' : 'Permanent'),
      stipend: formattedStipend || 'Competitive',
      salaryMin: Number(jobData.salaryMin) || 0,
      salaryMax: Number(jobData.salaryMax) || 0,
      salaryPeriod: jobData.salaryPeriod || 'year',
      experience: jobData.experience || 'Entry level',
      deadline: jobData.deadline || '30 Nov 2026',
      postedDaysAgo: 'Just now',
      postedHoursAgo: 0,
      matchScore: 95,
      isVerified: true,
      recruiterId,
      headline: jobData.headline || jobData.title,
      description: jobData.description,
      responsibilities: Array.isArray(jobData.responsibilities)
        ? jobData.responsibilities
        : (jobData.responsibilities || '').split('\n').map((s) => s.trim()).filter(Boolean),
      qualifications: Array.isArray(jobData.qualifications)
        ? jobData.qualifications
        : (jobData.qualifications || '').split('\n').map((s) => s.trim()).filter(Boolean),
      skills: Array.isArray(jobData.skills)
        ? jobData.skills
        : (jobData.skills || '').split(',').map((s) => s.trim()).filter(Boolean),
      perks: Array.isArray(jobData.perks) ? jobData.perks : ['Competitive compensation', 'Mentorship', 'Flexible schedule'],
      applicantsCount: 0,
      shortlistedCount: 0,
      closesOn: jobData.deadline || '30 Nov 2026',
      status,
      createdAt: new Date().toISOString(),
    }

    const data = readData()
    if (!data.jobs[recruiterId]) {
      data.jobs[recruiterId] = []
    }
    data.jobs[recruiterId].unshift(newJob)
    writeData(data)

    // Also persist to master jobs file so students can discover active jobs
    try {
      const JOBS_FILE = path.join(DATA_DIR, 'jobs.json')
      if (fs.existsSync(JOBS_FILE)) {
        const rawJobs = fs.readFileSync(JOBS_FILE, 'utf-8')
        const allJobs = JSON.parse(rawJobs)
        allJobs.unshift(newJob)
        fs.writeFileSync(JOBS_FILE, JSON.stringify(allJobs, null, 2), 'utf-8')
      }
    } catch (e) {
      console.warn('Could not sync to master jobs.json:', e.message)
    }

    return newJob
  },

  /**
   * Update an existing job owned by the recruiter
   */
  updateJob(recruiterId, jobId, updates) {
    const data = readData()
    if (!data.jobs[recruiterId]) {
      data.jobs[recruiterId] = []
    }

    const index = data.jobs[recruiterId].findIndex((j) => j.id === jobId)
    if (index === -1) {
      const allJobs = jobStore.getAllJobs()
      const otherJob = allJobs.find((j) => j.id === jobId)
      if (otherJob && otherJob.recruiterId && otherJob.recruiterId !== recruiterId) {
        const error = new Error('Access denied. You are not authorized to edit another recruiter’s job listing.')
        error.status = 403
        throw error
      }
      const error = new Error(`Job listing '${jobId}' was not found.`)
      error.status = 404
      throw error
    }

    const current = data.jobs[recruiterId][index]
    const updated = {
      ...current,
      ...updates,
      skills: Array.isArray(updates.skills)
        ? updates.skills
        : updates.skills !== undefined
        ? (updates.skills || '').split(',').map((s) => s.trim()).filter(Boolean)
        : current.skills,
      responsibilities: Array.isArray(updates.responsibilities)
        ? updates.responsibilities
        : updates.responsibilities !== undefined
        ? (updates.responsibilities || '').split('\n').map((s) => s.trim()).filter(Boolean)
        : current.responsibilities,
      qualifications: Array.isArray(updates.qualifications)
        ? updates.qualifications
        : updates.qualifications !== undefined
        ? (updates.qualifications || '').split('\n').map((s) => s.trim()).filter(Boolean)
        : current.qualifications,
      updatedAt: new Date().toISOString(),
    }

    data.jobs[recruiterId][index] = updated
    writeData(data)

    // Sync update to master jobs.json
    try {
      const JOBS_FILE = path.join(DATA_DIR, 'jobs.json')
      if (fs.existsSync(JOBS_FILE)) {
        const rawJobs = fs.readFileSync(JOBS_FILE, 'utf-8')
        const allJobs = JSON.parse(rawJobs)
        const masterIdx = allJobs.findIndex((j) => j.id === jobId)
        if (masterIdx > -1) {
          allJobs[masterIdx] = { ...allJobs[masterIdx], ...updated }
          fs.writeFileSync(JOBS_FILE, JSON.stringify(allJobs, null, 2), 'utf-8')
        }
      }
    } catch (e) {
      console.warn('Could not sync update to master jobs.json:', e.message)
    }

    return updated
  },

  /**
   * Publish a draft or closed job to Active status
   */
  publishJob(recruiterId, jobId) {
    return this.updateJob(recruiterId, jobId, { status: 'Active' })
  },

  /**
   * Close an active job
   */
  closeJob(recruiterId, jobId) {
    return this.updateJob(recruiterId, jobId, { status: 'Closed' })
  },

  /**
   * Delete a job owned by the recruiter
   */
  deleteJob(recruiterId, jobId) {
    const data = readData()
    if (!data.jobs[recruiterId]) {
      data.jobs[recruiterId] = []
    }

    const index = data.jobs[recruiterId].findIndex((j) => j.id === jobId)
    if (index === -1) {
      const allJobs = jobStore.getAllJobs()
      const otherJob = allJobs.find((j) => j.id === jobId)
      if (otherJob && otherJob.recruiterId && otherJob.recruiterId !== recruiterId) {
        const error = new Error('Access denied. You are not authorized to delete another recruiter’s job listing.')
        error.status = 403
        throw error
      }
      const error = new Error(`Job listing '${jobId}' was not found.`)
      error.status = 404
      throw error
    }

    const deleted = data.jobs[recruiterId].splice(index, 1)[0]
    writeData(data)

    // Delete from master jobs.json
    try {
      const JOBS_FILE = path.join(DATA_DIR, 'jobs.json')
      if (fs.existsSync(JOBS_FILE)) {
        const rawJobs = fs.readFileSync(JOBS_FILE, 'utf-8')
        let allJobs = JSON.parse(rawJobs)
        allJobs = allJobs.filter((j) => j.id !== jobId)
        fs.writeFileSync(JOBS_FILE, JSON.stringify(allJobs, null, 2), 'utf-8')
      }
    } catch (e) {
      console.warn('Could not sync delete to master jobs.json:', e.message)
    }

    return {
      success: true,
      message: `Job '${deleted.title}' was successfully deleted.`,
    }
  },

  /**
   * Helper to normalize candidate fields for consistent display and mutations
   */
  _normalizeCandidate(app) {
    if (!app) return null

    const stageMap = {
      applied: 'Applied',
      'in-review': 'In review',
      shortlisted: 'Shortlisted',
      interview: 'Interview Scheduled',
      offer: 'Offer Extended',
      rejected: 'Rejected',
    }

    const currentStage = (app.stage || 'applied').toLowerCase()
    const stageLabel = stageMap[currentStage] || app.stageLabel || 'Applied'

    const initials =
      app.initials ||
      (app.candidateName
        ? app.candidateName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'CA')

    const defaultHistory = [
      {
        stage: 'applied',
        stageLabel: 'Applied',
        changedAt: app.appliedDate ? `${app.appliedDate}, 10:00 AM` : '24 Oct 2026, 10:00 AM',
        changedBy: 'Candidate (Self)',
        note: 'Application submitted with portfolio and verified credentials.',
      },
    ]

    if (currentStage === 'shortlisted' || currentStage === 'interview' || currentStage === 'offer') {
      defaultHistory.push({
        stage: 'shortlisted',
        stageLabel: 'Shortlisted',
        changedAt: '25 Oct 2026, 11:30 AM',
        changedBy: 'Meera Kapoor',
        note: 'Candidate shortlisted for visual craft and strong problem solving skills.',
      })
    }

    if (currentStage === 'interview') {
      defaultHistory.push({
        stage: 'interview',
        stageLabel: 'Interview Scheduled',
        changedAt: '26 Oct 2026, 02:00 PM',
        changedBy: 'Meera Kapoor',
        note: `Interview scheduled on ${app.interviewDate || 'Upcoming'} at ${app.interviewTime || '10:30 AM'}.`,
      })
    }

    const interviewObj =
      app.interview ||
      (app.interviewDate || app.interviewTime
        ? {
            interviewDate: app.interviewDate || 'Upcoming',
            interviewTime: app.interviewTime || '10:30 AM',
            interviewMode: app.interviewMode || 'Google Meet',
            meetingUrl: app.meetingUrl || 'https://meet.google.com/sb-interview',
            instructions: app.instructions || 'Technical portfolio and design walk-through.',
            scheduledAt: new Date().toISOString(),
            scheduledBy: 'Meera Kapoor',
          }
        : null)

    return {
      ...app,
      initials,
      stage: currentStage,
      stageLabel,
      headline: app.headline || `${app.roleApplied} Candidate · ${app.college}`,
      college: app.college || 'Engineering & Design Institute',
      graduationYear: app.graduationYear || 2026,
      experience: app.experience || 'Entry level (0–1 years)',
      location: app.location || 'Bengaluru, India',
      email: app.email || 'candidate@university.edu',
      phone: app.phone || '+91 98765 43210',
      matchScore: app.matchScore || 92,
      skills: Array.isArray(app.skills) ? app.skills : ['Figma', 'UI design', 'Prototyping'],
      resumeUrl:
        app.resumeUrl ||
        'https://res.cloudinary.com/skillbridge/raw/upload/v1730485920/resumes/default_resume.pdf',
      resumeName: app.resumeName || `${app.candidateName.replace(/\s+/g, '_')}_Resume.pdf`,
      notes: Array.isArray(app.notes) ? app.notes : [],
      statusHistory: Array.isArray(app.statusHistory) && app.statusHistory.length > 0 ? app.statusHistory : defaultHistory,
      interview: interviewObj,
    }
  },

  /**
   * Helper to verify candidate ownership across recruiters
   */
  _verifyCandidateOwnership(data, recruiterId, applicationId) {
    if (!data.applications[recruiterId]) {
      data.applications[recruiterId] = []
    }

    let app = data.applications[recruiterId].find((a) => a.id === applicationId)
    if (app) return app

    // Also check if candidate applied to any role owned by this recruiter
    const allRecApps = this.getRecruiterApplications(recruiterId)
    const matched = allRecApps.find((a) => a.id === applicationId)
    if (matched) {
      data.applications[recruiterId].unshift(matched)
      writeData(data)
      return matched
    }

    // Check if another recruiter owns this application -> 403 Forbidden
    for (const [otherId, otherApps] of Object.entries(data.applications)) {
      if (otherId !== recruiterId && Array.isArray(otherApps) && otherApps.some((a) => a.id === applicationId)) {
        const error = new Error('Access denied. You do not have permission to view or manage another recruiter’s candidate application.')
        error.status = 403
        throw error
      }
    }

    const error = new Error(`Candidate application '${applicationId}' was not found.`)
    error.status = 404
    throw error
  },

  /**
   * Record a new candidate application submitted for one of this recruiter's jobs
   */
  recordApplication(recruiterId, candidate) {
    if (!recruiterId || !candidate) return
    const data = readData()
    if (!data.applications[recruiterId]) {
      data.applications[recruiterId] = []
    }
    const exists = data.applications[recruiterId].some(
      (a) =>
        a.id === candidate.id ||
        (a.studentId && candidate.studentId && a.studentId === candidate.studentId && a.jobId === candidate.jobId)
    )
    if (!exists) {
      data.applications[recruiterId].unshift(candidate)

      // Increment applicantsCount on recruiter job
      if (data.jobs[recruiterId]) {
        const targetJob = data.jobs[recruiterId].find((j) => j.id === candidate.jobId)
        if (targetJob) {
          targetJob.applicantsCount = (targetJob.applicantsCount || 0) + 1
        }
      }

      writeData(data)

      // Also sync count to master jobs.json
      try {
        const JOBS_FILE = path.join(DATA_DIR, 'jobs.json')
        if (fs.existsSync(JOBS_FILE)) {
          const rawJobs = fs.readFileSync(JOBS_FILE, 'utf-8')
          const allJobs = JSON.parse(rawJobs)
          const mJob = allJobs.find((j) => j.id === candidate.jobId)
          if (mJob) {
            mJob.applicantsCount = (mJob.applicantsCount || 0) + 1
            fs.writeFileSync(JOBS_FILE, JSON.stringify(allJobs, null, 2), 'utf-8')
          }
        }
      } catch (e) {
        console.warn('Could not sync applicantsCount to master jobs.json:', e.message)
      }
    }
  },

  /**
   * Get all candidates / applications belonging strictly to jobs owned by this recruiter
   */
  getRecruiterApplications(recruiterId, { jobId, stage, search } = {}) {
    const data = readData()
    let apps = data.applications[recruiterId] ? [...data.applications[recruiterId]] : []

    // Also collect any student applications submitted for jobs owned by this recruiter
    try {
      const STUDENT_FILE = path.join(DATA_DIR, 'studentData.json')
      if (fs.existsSync(STUDENT_FILE)) {
        const studentRaw = fs.readFileSync(STUDENT_FILE, 'utf-8')
        const studentData = JSON.parse(studentRaw)
        const myJobsRes = this.getRecruiterJobs(recruiterId, { limit: 1000 })
        const myJobIds = new Set((myJobsRes.jobs || []).map((j) => j.id))

        if (myJobIds.size > 0 && studentData.applications) {
          for (const [stId, stApps] of Object.entries(studentData.applications)) {
            if (Array.isArray(stApps)) {
              for (const stApp of stApps) {
                if (myJobIds.has(stApp.jobId)) {
                  const alreadyPresent = apps.some(
                    (a) => a.id === stApp.id || (a.studentId === stId && a.jobId === stApp.jobId)
                  )
                  if (!alreadyPresent) {
                    const stProfile = studentData.profiles?.[stId] || {}
                    const user = userStore.findById(stId)
                    apps.unshift({
                      id: stApp.id,
                      studentId: stId,
                      candidateId: stId,
                      candidateName: user?.fullName || stProfile.fullName || 'Candidate',
                      roleApplied: stApp.role,
                      jobId: stApp.jobId,
                      appliedDate: stApp.appliedOn,
                      stage: stApp.status || 'applied',
                      stageLabel: stApp.statusLabel || 'Applied',
                      matchScore: stApp.matchScore || 90,
                      resumeName: stApp.resumeName || 'Resume.pdf',
                      statusHistory: stApp.history || [],
                      college: stProfile.college || 'Engineering Institute',
                      skills: stProfile.skills?.map((s) => (typeof s === 'string' ? s : s.name)) || [],
                    })
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not cross-reference student applications:', e.message)
    }

    if (jobId && jobId !== 'all') {
      apps = apps.filter((a) => a.jobId === jobId)
    }

    if (stage && stage !== 'all') {
      apps = apps.filter((a) => (a.stage || '').toLowerCase() === stage.toLowerCase())
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase()
      apps = apps.filter(
        (a) =>
          (a.candidateName && a.candidateName.toLowerCase().includes(q)) ||
          (a.roleApplied && a.roleApplied.toLowerCase().includes(q)) ||
          (a.college && a.college.toLowerCase().includes(q)) ||
          (a.skills && a.skills.some((s) => (typeof s === 'string' ? s : s.name).toLowerCase().includes(q)))
      )
    }

    return apps.map((a) => this._normalizeCandidate(a))
  },

  /**
   * Get a single candidate application by ID with ownership verification
   */
  getCandidateById(recruiterId, applicationId) {
    const data = readData()
    const app = this._verifyCandidateOwnership(data, recruiterId, applicationId)
    return this._normalizeCandidate(app)
  },

  /**
   * Returns complete aggregated dashboard for the recruiter
   */
  getDashboard(recruiterId) {
    const profile = this.getCompanyProfile(recruiterId)
    const user = userStore.findById(recruiterId) || {
      fullName: 'Recruiter',
      companyName: profile?.companyName || 'Company',
      initials: 'RC',
    }
    const companyName = profile?.companyName || user.companyName || 'Company'

    const jobsResponse = this.getRecruiterJobs(recruiterId, { limit: 100 })
    const recruiterJobs = jobsResponse.jobs || []
    const data = readData()
    const recruiterApps = this.getRecruiterApplications(recruiterId) || []
    const userTrends = data.trends[recruiterId]

    // Total applicants across recruiter's jobs
    const totalApplicantsCount = recruiterApps.length > 0
      ? recruiterApps.length
      : recruiterJobs.reduce((sum, job) => sum + (job.applicantsCount || 0), 0)

    // Shortlisted count
    const shortlistedApps = recruiterApps.filter((a) => a.stage === 'shortlisted')
    const shortlistedCount = recruiterApps.length > 0
      ? shortlistedApps.length
      : recruiterJobs.reduce((sum, job) => sum + (job.shortlistedCount || 0), 0)

    // Active open roles
    const openRolesCount = recruiterJobs.filter((j) => (j.status || 'Active').toLowerCase() !== 'closed').length

    // Interviews scheduled
    const interviewApps = recruiterApps.filter((a) => a.stage === 'interview')
    const interviewsCount = interviewApps.length

    // Pipeline funnel calculations - accurate to real data
    const inReviewCount = recruiterApps.filter((a) => a.stage === 'in-review' || a.stage === 'applied').length
    const offerCount = recruiterApps.filter((a) => a.stage === 'offer').length

    const pipeline = {
      applied: totalApplicantsCount,
      inReview: inReviewCount,
      shortlisted: shortlistedCount,
      interview: interviewsCount,
      offer: offerCount,
    }

    // Time-aware greeting
    const hour = new Date().getHours()
    let timeOfDay = 'morning'
    let emoji = '☼'
    if (hour >= 12 && hour < 17) {
      timeOfDay = 'afternoon'
      emoji = '☀'
    } else if (hour >= 17) {
      timeOfDay = 'evening'
      emoji = '☽'
    }

    const firstName = (user.fullName || 'Recruiter').split(' ')[0]
    const greeting = `Great teams start with potential.`
    const subGreeting = `Welcome back, ${firstName}. Here’s your hiring snapshot at ${companyName}.`

    // Today's scheduled interviews
    const todaysInterviews = recruiterApps
      .filter((a) => a.stage === 'interview' && a.interviewTime)
      .slice(0, 3)

    return {
      recruiter: {
        id: recruiterId,
        fullName: user.fullName || 'Recruiter',
        firstName,
        companyName,
        initials: user.initials || 'RC',
        email: user.email,
        role: 'Recruiter',
      },
      greeting,
      subGreeting,
      timeOfDayGreeting: `Good ${timeOfDay}, ${firstName} ${emoji}`,
      stats: {
        openRoles: {
          value: openRolesCount,
          subtitle: openRolesCount > 0 ? `${openRolesCount} active role${openRolesCount === 1 ? '' : 's'}` : 'No active roles',
          label: 'Open roles',
        },
        totalApplicants: {
          value: totalApplicantsCount,
          trend: totalApplicantsCount > 0 ? 'Live applicant count' : 'No applicants yet',
          trendDirection: 'up',
          label: 'Total applicants',
        },
        shortlisted: {
          value: shortlistedCount,
          subtitle: shortlistedCount > 0 ? `${shortlistedCount} candidate${shortlistedCount === 1 ? '' : 's'} shortlisted` : '0 shortlisted',
          label: 'Shortlisted',
        },
        interviewsThisWeek: {
          value: interviewsCount,
          subtitle: interviewsCount > 0 ? `${interviewsCount} scheduled` : 'No upcoming interviews',
          label: 'Interviews this week',
        },
      },
      applicationTrends: {
        month: 'October 2026',
        comparisonText: totalApplicantsCount > 0
          ? `${totalApplicantsCount} application${totalApplicantsCount === 1 ? '' : 's'} recorded`
          : 'No applications recorded yet',
        data: totalApplicantsCount > 0 ? (userTrends || LINEAR_APPLICATION_TRENDS) : [],
      },
      candidatePipeline: pipeline,
      openRoles: recruiterJobs.slice(0, 5),
      recentApplications: recruiterApps.slice(0, 6),
      todaysInterviews,
      quickInsights: {
        title: totalApplicantsCount > 0 ? 'Review your incoming candidate pool.' : 'Post your roles to start hiring.',
        description: totalApplicantsCount > 0
          ? `${totalApplicantsCount} candidate applications received. Prompt review improves candidate engagement.`
          : 'Once you post an open position, matching candidates will appear here.',
        actionLabel: totalApplicantsCount > 0 ? 'Review candidates' : 'Post a role',
        actionHref: totalApplicantsCount > 0 ? '/recruiter/candidates' : '/recruiter/jobs/create',
      },
    }
  },



  /**
   * Update candidate stage in recruiter pipeline with status history logging
   */
  updateCandidateStage(recruiterId, applicationId, newStage, note = '', authorName = 'Recruiter') {
    const data = readData()
    const app = this._verifyCandidateOwnership(data, recruiterId, applicationId)

    const stageMap = {
      applied: 'Applied',
      'in-review': 'In review',
      shortlisted: 'Shortlisted',
      interview: 'Interview Scheduled',
      offer: 'Offer Extended',
      rejected: 'Rejected',
    }

    const normalizedStage = newStage.toLowerCase()
    app.stage = normalizedStage
    app.stageLabel = stageMap[normalizedStage] || newStage

    const now = new Date()
    const timestamp =
      now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' +
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

    if (!Array.isArray(app.statusHistory)) {
      app.statusHistory = []
    }

    const defaultNotes = {
      shortlisted: 'Candidate has been moved to shortlist based on role qualifications.',
      rejected: 'Application declined after evaluation.',
      interview: 'Interview round scheduled.',
      offer: 'Offer extended to candidate.',
      'in-review': 'Application marked for technical review.',
      applied: 'Application status reset to Applied.',
    }

    app.statusHistory.push({
      stage: normalizedStage,
      stageLabel: app.stageLabel,
      changedAt: timestamp,
      changedBy: authorName,
      note: note && note.trim() ? note.trim() : defaultNotes[normalizedStage] || `Status updated to ${app.stageLabel}`,
    })

    writeData(data)

    // Trigger notification for candidate
    try {
      const candidateStudentId = app.studentId || app.userId || app.candidateId
      const roleName = app.roleApplied || app.role || 'your application'
      const isShortlist = normalizedStage === 'shortlisted'

      // Sync stage update to student store
      try {
        const STUDENT_FILE = path.join(DATA_DIR, 'studentData.json')
        if (fs.existsSync(STUDENT_FILE)) {
          const sRaw = fs.readFileSync(STUDENT_FILE, 'utf-8')
          const sData = JSON.parse(sRaw)
          let studentUpdated = false
          if (sData.applications) {
            for (const sId in sData.applications) {
              const sApp = sData.applications[sId]?.find(
                (a) => a.id === applicationId || (a.jobId === app.jobId && (sId === app.studentId || sId === app.candidateId))
              )
              if (sApp) {
                const sStageMap = {
                  applied: { status: 'applied', label: 'Applied' },
                  'in-review': { status: 'in-review', label: 'Under Review' },
                  shortlisted: { status: 'shortlisted', label: 'Shortlisted' },
                  interview: { status: 'interview', label: 'Interview Scheduled' },
                  offer: { status: 'offer', label: 'Offer Extended' },
                  rejected: { status: 'rejected', label: 'Rejected' },
                }
                const info = sStageMap[normalizedStage] || { status: normalizedStage, label: app.stageLabel }
                sApp.status = info.status
                sApp.statusLabel = info.label
                sApp.latestUpdate = note && note.trim() ? note.trim() : `Status updated to ${info.label}`
                if (!Array.isArray(sApp.history)) sApp.history = []
                sApp.history.push({
                  status: info.label,
                  date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                  note: sApp.latestUpdate,
                })
                studentUpdated = true
              }
            }
          }
          if (studentUpdated) {
            fs.writeFileSync(STUDENT_FILE, JSON.stringify(sData, null, 2), 'utf-8')
          }
        }
      } catch (err) {
        console.warn('Could not sync stage change to studentData.json:', err.message)
      }

      if (candidateStudentId) {
        notificationStore.createNotification({
          userId: candidateStudentId,
          type: isShortlist ? 'candidate_shortlisted' : 'status_change',
          title: isShortlist ? "You've Been Shortlisted! 🎉" : 'Application Status Updated',
          message: isShortlist
            ? `Congratulations! ${app.company || 'The recruiter'} shortlisted your profile for ${roleName}.`
            : `Your application for ${roleName} has moved to "${app.stageLabel}".`,
          link: '/student/applications',
          metadata: { applicationId, stage: normalizedStage },
        })
      }

      // Dispatch status change / shortlist email to candidate
      const candidateEmail = app.email || (candidateStudentId ? userStore.findById(candidateStudentId)?.email : null)
      const candidateName = app.candidateName || 'Candidate'

      emailService.sendStatusChangeEmail({
        candidateName,
        email: candidateEmail,
        role: roleName,
        company: app.company || 'SkillBridge Hiring Partner',
        newStage: normalizedStage,
        stageLabel: app.stageLabel,
        note,
        applicationId,
      }).catch((err) => console.warn('Could not dispatch status change email:', err.message))
    } catch (e) {
      console.error('Error triggering candidate status notification:', e)
    }

    return this._normalizeCandidate(app)
  },

  /**
   * Schedule or update an interview for candidate
   */
  scheduleInterview(recruiterId, applicationId, interviewData, authorName = 'Recruiter') {
    const data = readData()
    const app = this._verifyCandidateOwnership(data, recruiterId, applicationId)

    const now = new Date()
    const timestamp =
      now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' +
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

    const interviewObj = {
      interviewDate: interviewData.interviewDate,
      interviewTime: interviewData.interviewTime,
      interviewMode: interviewData.interviewMode || 'Google Meet',
      meetingUrl:
        interviewData.meetingUrl && interviewData.meetingUrl.trim()
          ? interviewData.meetingUrl.trim()
          : `https://meet.google.com/sb-interview-${applicationId.toLowerCase()}`,
      instructions: interviewData.instructions || '',
      scheduledAt: now.toISOString(),
      scheduledBy: authorName,
    }

    const isUpdate = !!app.interviewDate

    app.interview = interviewObj
    app.interviewDate = interviewData.interviewDate
    app.interviewTime = interviewData.interviewTime
    app.meetingUrl = interviewObj.meetingUrl
    app.stage = 'interview'
    app.stageLabel = 'Interview Scheduled'

    if (!Array.isArray(app.statusHistory)) {
      app.statusHistory = []
    }

    app.statusHistory.push({
      stage: 'interview',
      stageLabel: 'Interview Scheduled',
      changedAt: timestamp,
      changedBy: authorName,
      note: `Interview scheduled on ${interviewData.interviewDate} at ${interviewData.interviewTime} via ${interviewObj.interviewMode}. ${
        interviewData.instructions ? `Notes: ${interviewData.instructions}` : ''
      }`.trim(),
    })

    writeData(data)

    // Trigger notification and email for candidate
    try {
      const candidateStudentId = app.studentId || app.userId || app.candidateId
      const roleName = app.roleApplied || app.role || 'your application'

      // Sync interview details to student store
      try {
        const STUDENT_FILE = path.join(DATA_DIR, 'studentData.json')
        if (fs.existsSync(STUDENT_FILE)) {
          const sRaw = fs.readFileSync(STUDENT_FILE, 'utf-8')
          const sData = JSON.parse(sRaw)
          let studentUpdated = false
          if (sData.applications) {
            for (const sId in sData.applications) {
              const sApp = sData.applications[sId]?.find(
                (a) => a.id === applicationId || (a.jobId === app.jobId && (sId === app.studentId || sId === app.candidateId))
              )
              if (sApp) {
                sApp.status = 'interview'
                sApp.statusLabel = 'Interview Scheduled'
                sApp.latestUpdate = `Interview scheduled on ${interviewData.interviewDate} at ${interviewData.interviewTime}`
                sApp.interview = interviewObj
                if (!Array.isArray(sApp.history)) sApp.history = []
                sApp.history.push({
                  status: 'Interview Scheduled',
                  date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                  note: `Interview scheduled on ${interviewData.interviewDate} at ${interviewData.interviewTime} via ${interviewObj.interviewMode}.`,
                })
                studentUpdated = true
              }
            }
          }
          if (studentUpdated) {
            fs.writeFileSync(STUDENT_FILE, JSON.stringify(sData, null, 2), 'utf-8')
          }
        }
      } catch (err) {
        console.warn('Could not sync interview to studentData.json:', err.message)
      }

      if (candidateStudentId) {
        notificationStore.createNotification({
          userId: candidateStudentId,
          type: isUpdate ? 'interview_updated' : 'interview_scheduled',
          title: isUpdate ? 'Interview Details Updated 📅' : 'Interview Scheduled 📅',
          message: `Interview scheduled for ${roleName} on ${interviewData.interviewDate} at ${interviewData.interviewTime} via ${interviewObj.interviewMode}.`,
          link: '/student/applications',
          metadata: { applicationId, interview: interviewObj },
        })
      }

      // Dispatch interview email to candidate
      const candidateEmail = app.email || (candidateStudentId ? userStore.findById(candidateStudentId)?.email : null)
      const candidateName = app.candidateName || 'Candidate'

      if (isUpdate) {
        emailService.sendInterviewUpdatedEmail({
          candidateName,
          email: candidateEmail,
          role: roleName,
          company: app.company || 'Linear',
          interviewDate: interviewData.interviewDate,
          interviewTime: interviewData.interviewTime,
          interviewMode: interviewObj.interviewMode,
          meetingUrl: interviewObj.meetingUrl,
          instructions: interviewData.instructions,
          applicationId,
        }).catch((err) => console.warn('Could not dispatch interview update email:', err.message))
      } else {
        emailService.sendInterviewScheduledEmail({
          candidateName,
          email: candidateEmail,
          role: roleName,
          company: app.company || 'Linear',
          interviewDate: interviewData.interviewDate,
          interviewTime: interviewData.interviewTime,
          interviewMode: interviewObj.interviewMode,
          meetingUrl: interviewObj.meetingUrl,
          instructions: interviewData.instructions,
          applicationId,
        }).catch((err) => console.warn('Could not dispatch interview scheduled email:', err.message))
      }
    } catch (e) {
      console.error('Error triggering interview notification/email:', e)
    }

    return this._normalizeCandidate(app)
  },

  /**
   * Add internal recruiter note to candidate
   */
  addCandidateNote(recruiterId, applicationId, noteText, authorName = 'Recruiter') {
    const data = readData()
    const app = this._verifyCandidateOwnership(data, recruiterId, applicationId)

    const now = new Date()
    const timestamp =
      now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' +
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

    if (!Array.isArray(app.notes)) {
      app.notes = []
    }

    const newNote = {
      id: `note-${Date.now()}`,
      text: noteText.trim(),
      author: authorName,
      createdAt: timestamp,
    }

    app.notes.unshift(newNote)
    writeData(data)

    // Trigger notification for candidate on relevant recruiter activity
    try {
      const candidateStudentId = app.studentId || app.userId || app.candidateId
      const roleName = app.roleApplied || app.role || 'your application'

      if (candidateStudentId) {
        notificationStore.createNotification({
          userId: candidateStudentId,
          type: 'recruiter_activity',
          title: 'Application Activity',
          message: `Recruiter reviewed your profile for ${roleName}.`,
          link: '/student/applications',
          metadata: { applicationId },
        })
      }
    } catch (e) {
      console.error('Error triggering recruiter activity notification:', e)
    }

    return {
      note: newNote,
      application: this._normalizeCandidate(app),
    }
  },

  /**
   * Permanently delete all recruiter data, owned jobs, candidate applications, and clean up references
   */
  deleteRecruiterData(recruiterId) {
    if (!recruiterId) return { deletedJobsCount: 0 }
    const data = readData()

    // 1. Identify recruiter's jobs from recruiter store and master job list
    const recruiterJobs = data.jobs[recruiterId] || []
    const ownedJobIds = new Set(recruiterJobs.map((j) => j.id))

    const JOBS_FILE = path.join(DATA_DIR, 'jobs.json')
    try {
      if (fs.existsSync(JOBS_FILE)) {
        const rawJobs = fs.readFileSync(JOBS_FILE, 'utf-8')
        const allJobs = JSON.parse(rawJobs)
        allJobs.forEach((j) => {
          if (j.recruiterId === recruiterId) {
            ownedJobIds.add(j.id)
          }
        })
        const remainingJobs = allJobs.filter((j) => !ownedJobIds.has(j.id))
        fs.writeFileSync(JOBS_FILE, JSON.stringify(remainingJobs, null, 2), 'utf-8')
      }
    } catch (err) {
      console.warn('Could not clean up master jobs.json for recruiter deletion:', err.message)
    }

    // 2. Remove candidate pipeline and owned jobs from recruiterData
    delete data.jobs[recruiterId]
    delete data.applications[recruiterId]
    writeData(data)

    // 3. Clean up applications referencing these deleted jobs in studentData.json
    try {
      const STUDENT_DATA_FILE = path.join(DATA_DIR, 'studentData.json')
      if (fs.existsSync(STUDENT_DATA_FILE)) {
        const rawStudent = fs.readFileSync(STUDENT_DATA_FILE, 'utf-8')
        const studentData = JSON.parse(rawStudent)
        let changed = false

        if (studentData.applications) {
          for (const sId in studentData.applications) {
            if (Array.isArray(studentData.applications[sId])) {
              studentData.applications[sId].forEach((app) => {
                if (ownedJobIds.has(app.jobId)) {
                  app.status = 'withdrawn'
                  app.statusLabel = 'Position Closed'
                  app.latestUpdate = 'Position closed - Recruiter account deleted'
                  changed = true
                }
              })
            }
          }
        }

        if (studentData.savedJobs) {
          for (const sId in studentData.savedJobs) {
            if (Array.isArray(studentData.savedJobs[sId])) {
              const before = studentData.savedJobs[sId].length
              studentData.savedJobs[sId] = studentData.savedJobs[sId].filter(
                (sj) => !ownedJobIds.has(sj.id) && !ownedJobIds.has(sj.jobId)
              )
              if (studentData.savedJobs[sId].length !== before) changed = true
            }
          }
        }

        if (changed) {
          fs.writeFileSync(STUDENT_DATA_FILE, JSON.stringify(studentData, null, 2), 'utf-8')
        }
      }
    } catch (err) {
      console.warn('Could not clean up student applications referencing recruiter jobs:', err.message)
    }

    return {
      deletedJobsCount: ownedJobIds.size,
    }
  },
}

