import { jobStore } from '../db/jobStore.js'
import { studentStore } from '../db/studentStore.js'
import { calculateSkillMatch } from '../utils/skillMatcher.js'
import { auditLogger } from '../services/auditLogger.js'

export async function getJobs(req, res, next) {
  try {
    const studentId = req.user?.id || null
    const {
      search,
      location,
      type,
      arrangement,
      experience,
      minSalary,
      postedWithin,
      sort,
      page,
      limit,
    } = req.query

    const result = jobStore.filterJobs({
      search: search || '',
      location: location || 'all',
      type: type || 'all',
      arrangement: arrangement || 'all',
      experience: experience || 'all',
      minSalary: minSalary ? Number(minSalary) : 0,
      postedWithin: postedWithin || 'all',
      sort: sort || 'recommended',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 6,
      studentId: studentId || null,
    })

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

export async function getJobById(req, res, next) {
  try {
    const studentId = req.user?.id || null
    const { id } = req.params

    const job = jobStore.getJobById(id, studentId)
    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Opportunity with ID '${id}' was not found.`,
      })
    }

    // Attach skill match calculation if profile exists or default profile
    try {
      const profile = studentStore.getProfile(studentId)
      const profileSkills = profile?.skills || [
        'Figma',
        'UI/UX Design',
        'User Research',
        'Prototyping',
        'Design Systems',
        'HTML/CSS',
      ]
      const jobSkills = job.skills && job.skills.length > 0 ? job.skills : job.tags || []
      job.skillMatch = calculateSkillMatch(profileSkills, jobSkills)
    } catch (e) {
      console.warn('Could not compute skill match for job:', e.message)
    }

    return res.status(200).json({
      success: true,
      data: job,
    })
  } catch (err) {
    next(err)
  }
}

export async function getJobSkillMatch(req, res, next) {
  try {
    const studentId = req.user?.id || 'usr_student_aanya'
    const { id } = req.params

    const job = jobStore.getJobById(id, studentId)
    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Opportunity with ID '${id}' was not found.`,
      })
    }

    const profile = studentStore.getProfile(studentId)
    const profileSkills = profile?.skills || [
      'Figma',
      'UI/UX Design',
      'User Research',
      'Prototyping',
      'Design Systems',
      'HTML/CSS',
    ]
    const jobSkills = job.skills && job.skills.length > 0 ? job.skills : job.tags || []

    const skillMatch = calculateSkillMatch(profileSkills, jobSkills)

    return res.status(200).json({
      success: true,
      data: skillMatch,
    })
  } catch (err) {
    next(err)
  }
}

export async function toggleSaveJob(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const studentId = req.user.id
    const { id: jobId } = req.params

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required.',
      })
    }

    const result = studentStore.toggleSaveJob(studentId, jobId)
    return res.status(200).json({
      success: true,
      data: result,
      message: result.isSaved ? 'Opportunity saved to your bookmarks' : 'Opportunity removed from bookmarks',
    })
  } catch (err) {
    next(err)
  }
}

export async function applyToJob(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required to apply.' })
    }
    const studentId = req.user.id
    const { id: jobId } = req.params
    const { resumeName, coverLetter, portfolioUrl, phone } = req.body

    // Ensure valid job
    const job = jobStore.getJobById(jobId, studentId)
    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Opportunity with ID '${jobId}' does not exist.`,
      })
    }

    // Validation: resume is required
    if (!resumeName || typeof resumeName !== 'string' || !resumeName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid resume selection or upload is required to submit an application.',
      })
    }

    // Requirement 14: Check duplicate application
    if (studentStore.hasApplied(studentId, jobId)) {
      return res.status(409).json({
        success: false,
        code: 'ALREADY_APPLIED',
        message: `You have already applied for ${job.title} at ${job.company}. You can view the real-time status in My Applications.`,
      })
    }

    const application = studentStore.applyToJob(studentId, job, {
      resumeName: resumeName.trim(),
      coverLetter: coverLetter ? coverLetter.trim() : null,
      portfolioUrl: portfolioUrl ? portfolioUrl.trim() : null,
      phone: phone ? phone.trim() : null,
    })

    // Audit log application submission
    auditLogger.log({
      actorId: studentId,
      actorRole: req.user.role,
      action: 'APPLICATION_SUBMITTED',
      targetType: 'job',
      targetId: jobId,
      ipAddress: req.ip,
      metadata: { company: job.company, title: job.title },
    })

    return res.status(201).json({
      success: true,
      message: `Your application for ${job.title} at ${job.company} has been successfully submitted!`,
      data: application,
    })
  } catch (err) {
    if (err.code === 'ALREADY_APPLIED') {
      return res.status(409).json({
        success: false,
        code: 'ALREADY_APPLIED',
        message: err.message,
      })
    }
    next(err)
  }
}

export async function getApplicationStatus(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const studentId = req.user.id
    const { id: jobId } = req.params

    const hasApplied = studentStore.hasApplied(studentId, jobId)
    const applications = studentStore.getApplications(studentId)
    const application = applications.find((a) => a.jobId === jobId) || null

    return res.status(200).json({
      success: true,
      data: {
        hasApplied,
        application,
      },
    })
  } catch (err) {
    next(err)
  }
}
