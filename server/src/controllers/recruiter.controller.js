import { recruiterStore } from '../db/recruiterStore.js'
import { auditLogger } from '../services/auditLogger.js'

export async function getRecruiterDashboard(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const recruiterId = req.user.id
    const dashboardData = recruiterStore.getDashboard(recruiterId)

    return res.status(200).json({
      success: true,
      data: dashboardData,
    })
  } catch (err) {
    next(err)
  }
}

export async function getRecruiterDashboardStats(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const recruiterId = req.user.id
    const dashboardData = recruiterStore.getDashboard(recruiterId)
    const pipeline = dashboardData.candidatePipeline || { applied: 0, inReview: 0, shortlisted: 0, interview: 0, offer: 0 }

    return res.status(200).json({
      success: true,
      data: {
        openRoles: dashboardData.stats?.openRoles?.value ?? 0,
        totalApplicants: dashboardData.stats?.totalApplicants?.value ?? 0,
        shortlisted: dashboardData.stats?.shortlisted?.value ?? 0,
        interviewsThisWeek: dashboardData.stats?.interviewsThisWeek?.value ?? 0,
        pipeline: {
          applied: pipeline.applied ?? 0,
          inReview: pipeline.inReview ?? 0,
          shortlisted: pipeline.shortlisted ?? 0,
          interview: pipeline.interview ?? 0,
          offer: pipeline.offer ?? 0,
        },
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getRecruiterProfile(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const recruiterId = req.user.id
    const profile = recruiterStore.getCompanyProfile(recruiterId)
    return res.status(200).json({
      success: true,
      data: profile,
    })
  } catch (err) {
    next(err)
  }
}

export async function updateRecruiterProfile(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const recruiterId = req.user.id
    const updated = recruiterStore.updateCompanyProfile(recruiterId, req.body)

    try {
      auditLogger.log({
        actorId: recruiterId,
        actorRole: req.user.role,
        action: 'UPDATE_COMPANY_PROFILE',
        targetType: 'company',
        targetId: recruiterId,
        metadata: { companyName: updated.companyName },
      })
    } catch {
      // ignore
    }

    return res.status(200).json({
      success: true,
      message: 'Company profile updated successfully.',
      data: updated,
    })
  } catch (err) {
    next(err)
  }
}

export async function getRecruiterJobs(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const recruiterId = req.user.id
    const { search = '', status = 'all', page = 1, limit = 10 } = req.query
    const result = recruiterStore.getRecruiterJobs(recruiterId, { search, status, page, limit })

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

export async function getRecruiterJobById(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const recruiterId = req.user.id
    const { id: jobId } = req.params

    const result = recruiterStore.getRecruiterJobById(recruiterId, jobId)

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

export async function createJob(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const recruiterId = req.user.id
    const { title, description } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required',
      })
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required',
      })
    }

    const newJob = recruiterStore.createJob(recruiterId, req.body)

    // Audit log job creation
    auditLogger.log({
      actorId: recruiterId,
      actorRole: req.user.role,
      action: 'JOB_CREATED',
      targetType: 'job',
      targetId: newJob.id,
      ipAddress: req.ip,
      metadata: { title: newJob.title, status: newJob.status },
    })

    return res.status(201).json({
      success: true,
      data: newJob,
      message:
        newJob.status === 'Draft'
          ? 'Job saved as draft successfully'
          : 'Job published successfully to candidate marketplace',
    })
  } catch (err) {
    next(err)
  }
}

export async function updateJob(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const recruiterId = req.user.id
    const { id: jobId } = req.params

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required',
      })
    }

    const updatedJob = recruiterStore.updateJob(recruiterId, jobId, req.body)

    // Audit log update
    auditLogger.log({
      actorId: recruiterId,
      actorRole: req.user.role,
      action: 'JOB_UPDATED',
      targetType: 'job',
      targetId: jobId,
      ipAddress: req.ip,
      metadata: { title: updatedJob.title },
    })

    return res.status(200).json({
      success: true,
      data: updatedJob,
      message: 'Job details updated successfully',
    })
  } catch (err) {
    next(err)
  }
}

export async function publishJob(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const recruiterId = req.user.id
    const { id: jobId } = req.params

    const publishedJob = recruiterStore.publishJob(recruiterId, jobId)

    auditLogger.log({
      actorId: recruiterId,
      actorRole: req.user.role,
      action: 'JOB_PUBLISHED',
      targetType: 'job',
      targetId: jobId,
      ipAddress: req.ip,
    })

    return res.status(200).json({
      success: true,
      data: publishedJob,
      message: `Job '${publishedJob.title}' has been published and is now Active.`,
    })
  } catch (err) {
    next(err)
  }
}

export async function closeJob(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const recruiterId = req.user.id
    const { id: jobId } = req.params

    const closedJob = recruiterStore.closeJob(recruiterId, jobId)

    auditLogger.log({
      actorId: recruiterId,
      actorRole: req.user.role,
      action: 'JOB_CLOSED',
      targetType: 'job',
      targetId: jobId,
      ipAddress: req.ip,
    })

    return res.status(200).json({
      success: true,
      data: closedJob,
      message: `Job '${closedJob.title}' has been closed for new applications.`,
    })
  } catch (err) {
    next(err)
  }
}

export async function deleteJob(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const recruiterId = req.user.id
    const { id: jobId } = req.params

    const result = recruiterStore.deleteJob(recruiterId, jobId)

    auditLogger.log({
      actorId: recruiterId,
      actorRole: req.user.role,
      action: 'JOB_DELETED',
      targetType: 'job',
      targetId: jobId,
      ipAddress: req.ip,
    })

    return res.status(200).json({
      success: true,
      data: result,
      message: result.message,
    })
  } catch (err) {
    next(err)
  }
}

export async function getRecruiterCandidates(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const recruiterId = req.user.id
    const { jobId, stage, search } = req.query
    const candidates = recruiterStore.getRecruiterApplications(recruiterId, { jobId, stage, search })

    return res.status(200).json({
      success: true,
      data: candidates,
    })
  } catch (err) {
    next(err)
  }
}

export async function getRecruiterCandidateById(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const recruiterId = req.user.id
    const { id: applicationId } = req.params

    const candidate = recruiterStore.getCandidateById(recruiterId, applicationId)

    return res.status(200).json({
      success: true,
      data: candidate,
    })
  } catch (err) {
    next(err)
  }
}

export async function updateCandidateStage(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const recruiterId = req.user.id
    const authorName = req.user.fullName || req.user.name || 'Recruiter'
    const { id: applicationId } = req.params
    const { stage, note } = req.body

    if (!stage) {
      return res.status(400).json({
        success: false,
        message: 'Candidate stage is required',
      })
    }

    const updated = recruiterStore.updateCandidateStage(recruiterId, applicationId, stage, note, authorName)

    auditLogger.log({
      actorId: recruiterId,
      actorRole: req.user.role,
      action: 'CANDIDATE_STAGE_UPDATED',
      targetType: 'application',
      targetId: applicationId,
      ipAddress: req.ip,
      metadata: { stage: updated.stageLabel, candidate: updated.candidateName },
    })

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Candidate stage moved to ${updated.stageLabel}`,
    })
  } catch (err) {
    next(err)
  }
}

export async function scheduleInterview(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const recruiterId = req.user.id
    const authorName = req.user.fullName || req.user.name || 'Recruiter'
    const { id: applicationId } = req.params
    const { interviewDate, interviewTime, interviewMode, meetingUrl, instructions } = req.body

    if (!interviewDate || !interviewDate.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Interview date is required',
      })
    }

    if (!interviewTime || !interviewTime.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Interview time is required',
      })
    }

    const updated = recruiterStore.scheduleInterview(
      recruiterId,
      applicationId,
      { interviewDate, interviewTime, interviewMode, meetingUrl, instructions },
      authorName
    )

    auditLogger.log({
      actorId: recruiterId,
      actorRole: req.user.role,
      action: 'INTERVIEW_SCHEDULED',
      targetType: 'application',
      targetId: applicationId,
      ipAddress: req.ip,
      metadata: { interviewDate, interviewTime, candidate: updated.candidateName },
    })

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Interview scheduled successfully for ${updated.candidateName}`,
    })
  } catch (err) {
    next(err)
  }
}

export async function addCandidateNote(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const recruiterId = req.user.id
    const authorName = req.user.fullName || req.user.name || 'Recruiter'
    const { id: applicationId } = req.params
    const noteText = req.body.text || req.body.note

    if (!noteText || !noteText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note content cannot be blank',
      })
    }

    const result = recruiterStore.addCandidateNote(recruiterId, applicationId, noteText, authorName)

    return res.status(201).json({
      success: true,
      data: result.note,
      application: result.application,
      message: 'Internal note saved successfully',
    })
  } catch (err) {
    next(err)
  }
}
