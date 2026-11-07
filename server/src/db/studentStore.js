import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { jobStore } from './jobStore.js'
import { userStore } from './userStore.js'
import { recruiterStore } from './recruiterStore.js'
import { notificationStore } from './notificationStore.js'
import { emailService } from '../services/emailService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, '..', '..', 'data')
const STUDENT_DATA_FILE = path.join(DATA_DIR, 'studentData.json')

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function calculateProfileStrength(profile) {
  if (!profile) return 0
  let score = 0
  if (profile.fullName && profile.email && profile.phone && profile.location) score += 20
  if (profile.headline && profile.about) score += 20
  if (profile.education && profile.education.length > 0) score += 20
  if (profile.skills && profile.skills.length >= 3) score += 15
  if (profile.experience && profile.experience.length > 0) score += 10
  if (profile.projects && profile.projects.length >= 2) {
    score += 15
  } else if (profile.projects && profile.projects.length === 1) {
    score += 10
  }
  return Math.min(100, Math.max(0, score))
}

export function createDefaultProfile(studentId) {
  const user = studentId ? (userStore.findById ? userStore.findById(studentId) : userStore.getUserById?.(studentId)) : null
  const fullName = user?.fullName || ''
  const email = user?.email || ''
  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'ST'

  return {
    fullName,
    email,
    phone: '',
    location: '',
    college: user?.college || '',
    degree: '',
    classOf: '',
    headline: user?.headline || 'SkillBridge Candidate',
    about: '',
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    openToWork: true,
    avatarUrl: null,
    initials,
    title: 'Start your career journey with SkillBridge.',
    description: 'Complete your profile sections to stand out to verified recruiters.',
    resumeUploaded: false,
    resumeFileName: null,
    resumeUpdatedAt: null,
    skills: [],
    education: [],
    experience: [],
    projects: [],
    resumes: [],
    profileStrength: 20,
  }
}

function getInitialData() {
  return {
    savedJobs: {},
    applications: {},
    profiles: {},
    activity: {},
    resumes: {},
    jobs: jobStore.getAllJobs(),
  }
}

function readData() {
  try {
    if (!fs.existsSync(STUDENT_DATA_FILE)) {
      const initial = getInitialData()
      fs.writeFileSync(STUDENT_DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8')
      return initial
    }
    const raw = fs.readFileSync(STUDENT_DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    if (!parsed.savedJobs) parsed.savedJobs = {}
    if (!parsed.applications) parsed.applications = {}
    if (!parsed.profiles) parsed.profiles = {}
    if (!parsed.activity) parsed.activity = {}
    if (!parsed.resumes) parsed.resumes = {}
    return parsed
  } catch (err) {
    console.error('Error reading student data store:', err)
    return getInitialData()
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(STUDENT_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing student data store:', err)
  }
}

export const studentStore = {
  readData,

  getStudentDashboard(studentId) {
    if (!studentId) {
      return {
        stats: {
          applicationsSent: { value: 0, trend: 'Get started', trendDirection: 'up', label: 'Applications sent' },
          inReview: { value: 0, subtitle: 'No pending reviews', label: 'In review' },
          interviews: { value: 0, subtitle: 'No upcoming interviews', label: 'Interviews' },
          savedJobs: { value: 0, subtitle: 'No saved opportunities', label: 'Saved opportunities' },
        },
        profile: {
          profileStrength: 20,
          resumeUploaded: false,
          resumeFileName: null,
          resumeUpdatedAt: null,
          title: 'Welcome to SkillBridge.',
          description: 'Complete your profile to get discovered by verified recruiters.',
        },
        careerActivity: [],
        upcomingInterview: null,
        recommendedJobs: [],
        recentApplications: [],
        learningResource: {
          tag: 'CAREER GUIDE',
          title: 'Start your application journey',
          description: 'Explore verified roles and connect with hiring partners.',
          badges: ['Free guide', '3 min read'],
          actionText: 'Explore opportunities →',
          href: '/student/jobs',
        },
      }
    }

    const data = readData()
    const studentApps = data.applications[studentId] || []
    const studentSaved = data.savedJobs[studentId] || []
    const profile = data.profiles[studentId] || createDefaultProfile(studentId)
    const activity = data.activity[studentId] || []

    const totalAppsCount = studentApps.length
    const inReviewCount = studentApps.filter((a) => a.status === 'in-review' || a.status === 'shortlisted').length
    const interviewsCount = studentApps.filter((a) => a.status === 'interview').length
    const savedJobsCount = studentSaved.length

    const interviewApp = studentApps.find((a) => a.interview) || null
    const allJobs = jobStore.getAllJobs()
    const recommendedJobs = allJobs.slice(0, 4).map((job) => ({
      ...job,
      isSaved: studentSaved.includes(job.id),
    }))

    return {
      stats: {
        applicationsSent: {
          value: totalAppsCount,
          trend: totalAppsCount > 0 ? `${totalAppsCount} active` : 'Start applying today',
          trendDirection: 'up',
          label: 'Applications sent',
        },
        inReview: {
          value: inReviewCount,
          subtitle: inReviewCount > 0 ? `${inReviewCount} under review` : 'No pending reviews',
          label: 'In review',
        },
        interviews: {
          value: interviewsCount,
          subtitle: interviewApp?.interview?.date ? `Next on ${interviewApp.interview.date}` : 'No upcoming interviews',
          label: 'Interviews',
        },
        savedJobs: {
          value: savedJobsCount,
          subtitle: savedJobsCount > 0 ? `${savedJobsCount} saved` : 'Save jobs to track them',
          label: 'Saved opportunities',
        },
      },
      profile: {
        ...profile,
        profileStrength: calculateProfileStrength(profile),
      },
      careerActivity: activity,
      upcomingInterview: interviewApp?.interview || null,
      recommendedJobs,
      recentApplications: studentApps.slice(0, 5),
      learningResource: {
        tag: 'KEEP GROWING',
        title: 'Build your career edge',
        description: 'Explore opportunities, connect with top companies, and launch your career.',
        badges: ['Verified roles', 'Direct hiring'],
        actionText: 'Find opportunities →',
        href: '/student/jobs',
      },
    }
  },

  hasSavedJob(studentId, jobId) {
    if (!studentId) return false
    const data = readData()
    return (data.savedJobs[studentId] || []).includes(jobId)
  },

  getSavedJobIds(studentId) {
    if (!studentId) return []
    const data = readData()
    return data.savedJobs[studentId] || []
  },

  toggleSaveJob(studentId, jobId) {
    if (!studentId) {
      const err = new Error('Authentication required')
      err.status = 401
      throw err
    }
    const data = readData()
    if (!data.savedJobs[studentId]) {
      data.savedJobs[studentId] = []
    }

    const idx = data.savedJobs[studentId].indexOf(jobId)
    let isSaved = false

    if (idx > -1) {
      data.savedJobs[studentId].splice(idx, 1)
      isSaved = false
    } else {
      data.savedJobs[studentId].push(jobId)
      isSaved = true
    }

    writeData(data)
    return {
      jobId,
      isSaved,
      savedCount: data.savedJobs[studentId].length,
    }
  },

  getApplications(studentId, { status = 'all', search = '' } = {}) {
    if (!studentId) return []
    const data = readData()
    let apps = data.applications[studentId] || []

    // Search filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase()
      apps = apps.filter(
        (a) => a.role.toLowerCase().includes(q) || a.company.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (status && status !== 'all') {
      const s = status.toLowerCase()
      apps = apps.filter((a) => {
        if (s === 'applied') return a.status === 'applied'
        if (s === 'in-review' || s === 'under review') return a.status === 'in-review'
        if (s === 'shortlisted') return a.status === 'shortlisted'
        if (s === 'interview' || s === 'interview scheduled') return a.status === 'interview'
        if (s === 'selected' || s === 'offer') return a.status === 'selected' || a.status === 'offer'
        if (s === 'rejected') return a.status === 'rejected'
        if (s === 'withdrawn') return a.status === 'withdrawn'
        return a.status === s
      })
    }

    return apps
  },

  getApplicationById(studentId, applicationId) {
    if (!studentId) return null
    const data = readData()
    const apps = data.applications[studentId] || []
    const app = apps.find((a) => a.id === applicationId)
    if (!app) return null

    if (!app.history || app.history.length === 0) {
      app.history = [
        { status: 'Applied', date: app.appliedOn, note: 'Application submitted with verified credentials' },
        { status: app.statusLabel || app.status, date: app.appliedOn, note: app.latestUpdate || 'Status update logged' },
      ]
    }

    return app
  },

  withdrawApplication(studentId, applicationId, reason = '') {
    if (!studentId) {
      const error = new Error('Authentication required')
      error.status = 401
      throw error
    }
    const data = readData()
    if (!data.applications[studentId]) {
      data.applications[studentId] = []
    }

    const app = data.applications[studentId].find((a) => a.id === applicationId)
    if (!app) {
      const error = new Error(`Application with ID '${applicationId}' was not found.`)
      error.status = 404
      throw error
    }

    if (app.status === 'withdrawn') {
      const error = new Error('This application has already been withdrawn.')
      error.status = 400
      throw error
    }

    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    app.status = 'withdrawn'
    app.statusLabel = 'Withdrawn'
    app.withdrawnAt = today
    app.withdrawnReason = reason || 'Withdrawn by candidate'
    app.latestUpdate = `Withdrawn: ${app.withdrawnReason}`

    if (!app.history) app.history = []
    app.history.push({
      status: 'Withdrawn',
      date: today,
      note: app.withdrawnReason,
    })

    writeData(data)
    return app
  },

  resetApplicationStatus(studentId, applicationId, status = 'applied') {
    if (!studentId) return null
    const data = readData()
    if (!data.applications[studentId]) return null
    const app = data.applications[studentId].find((a) => a.id === applicationId)
    if (app) {
      app.status = status
      app.statusLabel = status === 'applied' ? 'Applied' : status
      writeData(data)
    }
    return app
  },

  getApplicationStats(studentId) {
    if (!studentId) {
      return { total: 0, underReview: 0, shortlisted: 0, interviews: 0, selected: 0, rejected: 0, withdrawn: 0 }
    }
    const data = readData()
    const all = data.applications[studentId] || []

    return {
      total: all.length,
      underReview: all.filter((a) => a.status === 'in-review').length,
      shortlisted: all.filter((a) => a.status === 'shortlisted').length,
      interviews: all.filter((a) => a.status === 'interview').length,
      selected: all.filter((a) => a.status === 'selected' || a.status === 'offer').length,
      rejected: all.filter((a) => a.status === 'rejected').length,
      withdrawn: all.filter((a) => a.status === 'withdrawn').length,
    }
  },

  getStudentDashboardStats(studentId) {
    if (!studentId) {
      return {
        totalApplications: 0,
        underReview: 0,
        shortlisted: 0,
        interviews: 0,
        savedJobs: 0,
      }
    }
    const data = readData()
    const studentApps = data.applications[studentId] || []
    const studentSaved = data.savedJobs[studentId] || []

    return {
      totalApplications: studentApps.length,
      underReview: studentApps.filter((a) => a.status === 'in-review').length,
      shortlisted: studentApps.filter((a) => a.status === 'shortlisted').length,
      interviews: studentApps.filter((a) => a.status === 'interview').length,
      savedJobs: studentSaved.length,
    }
  },

  updateApplicationStage(studentId, applicationId, newStage, note = '', changedBy = 'Recruiter') {
    if (!studentId) return null
    const data = readData()
    if (!data.applications[studentId]) return null
    const app = data.applications[studentId].find((a) => a.id === applicationId)
    if (!app) return null

    const stageMap = {
      applied: { status: 'applied', label: 'Applied' },
      'in-review': { status: 'in-review', label: 'Under Review' },
      shortlisted: { status: 'shortlisted', label: 'Shortlisted' },
      interview: { status: 'interview', label: 'Interview Scheduled' },
      offer: { status: 'offer', label: 'Offer Extended' },
      rejected: { status: 'rejected', label: 'Rejected' },
    }

    const stageInfo = stageMap[newStage.toLowerCase()] || { status: newStage, label: newStage }
    app.status = stageInfo.status
    app.statusLabel = stageInfo.label
    app.latestUpdate = note || `Status updated to ${stageInfo.label}`

    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    if (!Array.isArray(app.history)) app.history = []
    app.history.push({
      status: stageInfo.label,
      date: today,
      note: note || `Updated by ${changedBy}`,
    })

    writeData(data)
    return app
  },

  hasApplied(studentId, jobId) {
    if (!studentId) return false
    const data = readData()
    const studentApps = data.applications[studentId] || []
    return studentApps.some((a) => a.jobId === jobId && a.status !== 'withdrawn')
  },

  applyToJob(studentId, job, payload = {}) {
    if (!studentId) {
      const err = new Error('Authentication required')
      err.status = 401
      throw err
    }
    const data = readData()
    if (!data.applications[studentId]) {
      data.applications[studentId] = []
    }

    // Check duplicate application
    const existing = data.applications[studentId].find((a) => a.jobId === job.id && a.status !== 'withdrawn')
    if (existing) {
      const error = new Error('You have already submitted an application for this position.')
      error.code = 'ALREADY_APPLIED'
      error.status = 409
      throw error
    }

    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    const newApp = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      role: job.title,
      company: job.company,
      logo: job.logo || (job.company ? job.company[0] : 'S'),
      appliedOn: today,
      status: 'in-review',
      statusLabel: 'Under Review',
      latestUpdate: 'Application submitted · Under initial screening',
      matchScore: job.matchScore || 90,
      stipend: job.stipend || 'Competitive',
      resumeName: payload.resumeName || 'Resume.pdf',
      coverLetter: payload.coverLetter || null,
      portfolioUrl: payload.portfolioUrl || null,
      phone: payload.phone || null,
      timeline: [
        { step: 'Applied', date: today, done: true, current: true },
        { step: 'In review', date: 'Pending', done: false },
        { step: 'Interview', date: 'Pending', done: false },
        { step: 'Decision', date: 'Pending', done: false },
      ],
      history: [
        { status: 'Applied', date: today, note: `Submitted with ${payload.resumeName || 'primary resume'}` },
        { status: 'Under Review', date: today, note: 'Queued for recruiter review' },
      ],
      createdAt: new Date().toISOString(),
    }

    data.applications[studentId].unshift(newApp)

    if (!data.activity[studentId]) data.activity[studentId] = []
    if (data.activity[studentId].length > 0) {
      const last = data.activity[studentId][data.activity[studentId].length - 1]
      last.applications = (last.applications || 0) + 1
    }

    writeData(data)

    // Sync candidate record to recruiter store if role is owned by a recruiter
    try {
      if (job.recruiterId) {
        const studentProfile = this.getProfile(studentId)
        const studentUser = userStore.findById ? userStore.findById(studentId) : null
        recruiterStore.recordApplication(job.recruiterId, {
          id: newApp.id,
          studentId,
          candidateId: studentId,
          candidateName: studentUser?.fullName || studentProfile.fullName || 'Candidate',
          initials: studentProfile.initials || 'ST',
          email: studentUser?.email || studentProfile.email || 'student@university.edu',
          college: studentProfile.college || 'Engineering Institute',
          graduationYear: studentProfile.classOf || 2026,
          location: studentProfile.location || 'India',
          roleApplied: job.title,
          jobId: job.id,
          appliedDate: today,
          matchScore: job.matchScore || 90,
          stage: 'applied',
          stageLabel: 'Applied',
          skills: studentProfile.skills?.map((s) => (typeof s === 'string' ? s : s.name)) || [],
          resumeUrl: payload.resumeUrl || null,
          resumeName: payload.resumeName || 'Resume.pdf',
          notes: [],
          statusHistory: [
            {
              stage: 'applied',
              stageLabel: 'Applied',
              changedAt: `${today}, 10:00 AM`,
              changedBy: 'Candidate (Self)',
              note: 'Application submitted with verified credentials.',
            },
          ],
        })
      }
    } catch (recErr) {
      console.warn('Could not record application in recruiter store:', recErr.message)
    }

    // Send notifications for successful application submission
    try {
      notificationStore.createNotification({
        userId: studentId,
        type: 'application_submitted',
        title: 'Application Submitted',
        message: `Your application for ${job.title} at ${job.company} was submitted successfully.`,
        link: '/student/applications',
        metadata: { jobId: job.id, role: job.title, company: job.company },
      })

      if (job.recruiterId) {
        notificationStore.createNotification({
          userId: job.recruiterId,
          type: 'new_application',
          title: 'New Candidate Application',
          message: `A candidate submitted an application for ${job.title}.`,
          link: `/recruiter/candidates?jobId=${job.id}`,
          metadata: { jobId: job.id, role: job.title },
        })
      }

      // Dispatch confirmation email to applicant
      const studentUser = userStore.findById ? userStore.findById(studentId) : null
      const studentEmail = studentUser?.email || payload.email || 'candidate@skillbridge.io'
      const studentName = studentUser?.fullName || payload.name || 'Candidate'

      emailService.sendApplicationSubmissionEmail({
        studentName,
        email: studentEmail,
        role: job.title,
        company: job.company,
        appliedDate: today,
        resumeName: payload.resumeName || 'Verified_Resume.pdf',
        applicationId: newApp.id,
      }).catch((err) => console.warn('Could not dispatch application confirmation email:', err.message))
    } catch (e) {
      console.error('Error triggering application notification:', e)
    }

    return newApp
  },

  getSavedJobs(studentId, { search = '', type = 'all', sort = 'recent' } = {}) {
    if (!studentId) {
      return {
        jobs: [],
        stats: { total: 0, newSinceLastVisit: 0, closingThisWeek: 0 },
        counts: { all: 0, internships: 0, jobs: 0 },
      }
    }
    const data = readData()
    const savedJobIds = data.savedJobs[studentId] || []
    const allJobs = jobStore.getAllJobs()

    const refDate = new Date('2026-11-01T00:00:00Z').getTime()

    let jobs = savedJobIds
      .map((id) => {
        const job = allJobs.find((j) => j.id === id)
        if (!job) return null

        let deadlineStatus = 'active'
        let statusBadge = 'Active'
        let isExpired = false
        let isClosingSoon = false

        if (job.deadline) {
          const deadlineTime = new Date(job.deadline).getTime()
          const diffDays = Math.round((deadlineTime - refDate) / (1000 * 60 * 60 * 24))

          if (diffDays < 0) {
            deadlineStatus = 'closed'
            statusBadge = 'Applications closed'
            isExpired = true
          } else if (diffDays <= 4) {
            deadlineStatus = 'closing-soon'
            statusBadge = 'Closing soon'
            isClosingSoon = true
          }
        }

        return {
          ...job,
          isSaved: true,
          deadlineStatus,
          statusBadge,
          isExpired,
          isClosingSoon,
        }
      })
      .filter(Boolean)

    const totalCount = jobs.length
    const internshipCount = jobs.filter((j) => j.type === 'Internship').length
    const jobCount = jobs.filter((j) => j.type === 'Full-time' || j.type === 'Part-time').length
    const closingThisWeekCount = jobs.filter((j) => j.isClosingSoon).length

    // Tab filtering
    if (type === 'internships') {
      jobs = jobs.filter((j) => j.type === 'Internship')
    } else if (type === 'jobs') {
      jobs = jobs.filter((j) => j.type === 'Full-time' || j.type === 'Part-time')
    }

    // Search query
    if (search && search.trim()) {
      const q = search.trim().toLowerCase()
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          (j.skills && j.skills.some((s) => s.toLowerCase().includes(q)))
      )
    }

    // Sorting
    if (sort === 'deadline') {
      jobs.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    } else if (sort === 'match') {
      jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    }

    return {
      jobs,
      stats: {
        total: totalCount,
        newSinceLastVisit: 0,
        closingThisWeek: closingThisWeekCount,
      },
      counts: {
        all: totalCount,
        internships: internshipCount,
        jobs: jobCount,
      },
    }
  },

  removeSavedJob(studentId, jobId) {
    if (!studentId) return { jobId, isSaved: false, savedCount: 0 }
    const data = readData()
    if (!data.savedJobs[studentId]) {
      data.savedJobs[studentId] = []
    }
    const idx = data.savedJobs[studentId].indexOf(jobId)
    if (idx > -1) {
      data.savedJobs[studentId].splice(idx, 1)
      writeData(data)
    }
    return {
      jobId,
      isSaved: false,
      savedCount: data.savedJobs[studentId].length,
    }
  },

  getProfile(studentId) {
    if (!studentId) return createDefaultProfile(null)
    const data = readData()
    let profile = data.profiles[studentId]

    if (!profile || !profile.skills) {
      profile = createDefaultProfile(studentId)
      data.profiles[studentId] = profile
      writeData(data)
    }

    profile.profileStrength = calculateProfileStrength(profile)
    return profile
  },

  updateProfile(studentId, updates = {}) {
    if (!studentId) {
      const err = new Error('Authentication required')
      err.status = 401
      throw err
    }
    const data = readData()
    const current = data.profiles[studentId] || createDefaultProfile(studentId)

    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    updated.profileStrength = calculateProfileStrength(updated)
    data.profiles[studentId] = updated
    writeData(data)
    return updated
  },

  getResumes(studentId) {
    if (!studentId) return []
    const profile = this.getProfile(studentId)
    return profile.resumes || []
  },

  addResume(studentId, resumeData) {
    if (!studentId) {
      const err = new Error('Authentication required')
      err.status = 401
      throw err
    }
    const data = readData()
    const profile = this.getProfile(studentId)

    if (!profile.resumes) {
      profile.resumes = []
    }

    const isFirst = profile.resumes.length === 0
    const isDefault = resumeData.isDefault || isFirst

    if (isDefault) {
      profile.resumes.forEach((r) => {
        r.isDefault = false
      })
    }

    const newResume = {
      id: `res-${Date.now()}`,
      name: resumeData.name,
      originalName: resumeData.originalName || resumeData.name,
      fileSize: resumeData.fileSize || 102400,
      fileSizeFormatted: resumeData.fileSizeFormatted || '100 KB',
      fileType: resumeData.fileType || 'application/pdf',
      uploadedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      url: resumeData.url || '',
      publicId: resumeData.publicId || '',
      isDefault,
    }

    profile.resumes.unshift(newResume)
    profile.resumeUploaded = true
    profile.resumeFileName = newResume.name
    profile.resumeUpdatedAt = `Updated ${newResume.uploadedAt} · ${newResume.fileSizeFormatted}`
    profile.profileStrength = calculateProfileStrength(profile)

    data.profiles[studentId] = profile
    writeData(data)
    return newResume
  },

  deleteResume(studentId, resumeId) {
    if (!studentId) {
      const err = new Error('Authentication required')
      err.status = 401
      throw err
    }
    const data = readData()
    const profile = this.getProfile(studentId)

    if (!profile.resumes || profile.resumes.length === 0) {
      const err = new Error('Resume not found')
      err.status = 404
      throw err
    }

    const index = profile.resumes.findIndex((r) => r.id === resumeId)
    if (index === -1) {
      const err = new Error('Resume not found')
      err.status = 404
      throw err
    }

    const deleted = profile.resumes.splice(index, 1)[0]

    if (deleted.isDefault && profile.resumes.length > 0) {
      profile.resumes[0].isDefault = true
      profile.resumeFileName = profile.resumes[0].name
      profile.resumeUpdatedAt = `Updated ${profile.resumes[0].uploadedAt} · ${profile.resumes[0].fileSizeFormatted}`
    } else if (profile.resumes.length === 0) {
      profile.resumeUploaded = false
      profile.resumeFileName = null
      profile.resumeUpdatedAt = null
    }

    profile.profileStrength = calculateProfileStrength(profile)
    data.profiles[studentId] = profile
    writeData(data)
    return { success: true, deletedResumeId: resumeId }
  },

  setDefaultResume(studentId, resumeId) {
    if (!studentId) {
      const err = new Error('Authentication required')
      err.status = 401
      throw err
    }
    const data = readData()
    const profile = this.getProfile(studentId)

    if (!profile.resumes) {
      const err = new Error('Resume not found')
      err.status = 404
      throw err
    }

    const target = profile.resumes.find((r) => r.id === resumeId)
    if (!target) {
      const err = new Error('Resume not found')
      err.status = 404
      throw err
    }

    profile.resumes.forEach((r) => {
      r.isDefault = r.id === resumeId
    })

    profile.resumeFileName = target.name
    profile.resumeUpdatedAt = `Updated ${target.uploadedAt} · ${target.fileSizeFormatted}`

    data.profiles[studentId] = profile
    writeData(data)
    return target
  },

  /**
   * Permanently delete all student personal records, applications, saved jobs, and resumes
   */
  deleteStudentData(studentId, email = null) {
    if (!studentId) return { resumes: [], avatarUrl: null }
    const data = readData()

    // 1. Collect resumes and avatar for Cloudinary cleanup
    const profile = data.profiles[studentId] || {}
    const studentResumes = data.resumes?.[studentId] || profile.resumes || []
    const avatarUrl = profile.avatarUrl || null

    // 2. Remove all personal student records from student data store
    delete data.savedJobs[studentId]
    delete data.applications[studentId]
    delete data.profiles[studentId]
    delete data.activity[studentId]
    delete data.resumes[studentId]
    writeData(data)

    // 3. Clean up candidate records in recruiter pipelines to ensure no orphaned personal records
    try {
      const RECRUITER_DATA_FILE = path.join(DATA_DIR, 'recruiterData.json')
      if (fs.existsSync(RECRUITER_DATA_FILE)) {
        const recRaw = fs.readFileSync(RECRUITER_DATA_FILE, 'utf-8')
        const recData = JSON.parse(recRaw)
        let changed = false

        if (recData.applications) {
          for (const recId in recData.applications) {
            if (Array.isArray(recData.applications[recId])) {
              const beforeCount = recData.applications[recId].length
              recData.applications[recId] = recData.applications[recId].filter((cand) => {
                const isMatch =
                  cand.candidateId === studentId ||
                  cand.studentId === studentId ||
                  cand.userId === studentId ||
                  (email && cand.email && cand.email.toLowerCase() === email.toLowerCase())
                return !isMatch
              })
              if (recData.applications[recId].length !== beforeCount) {
                changed = true
              }
            }
          }
        }

        if (changed) {
          fs.writeFileSync(RECRUITER_DATA_FILE, JSON.stringify(recData, null, 2), 'utf-8')
        }
      }
    } catch (err) {
      console.warn('Could not clean up candidate records from recruiterData.json:', err.message)
    }

    return {
      resumes: studentResumes,
      avatarUrl,
    }
  },
}
