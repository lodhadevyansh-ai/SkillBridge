import { studentStore } from '../db/studentStore.js'
import { auditLogger } from '../services/auditLogger.js'

export async function getStudentApplications(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const studentId = req.user.id
    const { status, search } = req.query

    const applications = studentStore.getApplications(studentId, {
      status: status || 'all',
      search: search || '',
    })
    const stats = studentStore.getApplicationStats(studentId)

    return res.status(200).json({
      success: true,
      data: {
        applications,
        stats,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getApplicationDetails(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const studentId = req.user.id
    const { id } = req.params

    const application = studentStore.getApplicationById(studentId, id)
    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Application with ID '${id}' was not found.`,
      })
    }

    return res.status(200).json({
      success: true,
      data: application,
    })
  } catch (err) {
    next(err)
  }
}

export async function withdrawApplication(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const studentId = req.user.id
    const { id } = req.params
    const { reason } = req.body || {}

    const updated = studentStore.withdrawApplication(studentId, id, reason)

    // Audit log withdrawal
    auditLogger.log({
      actorId: studentId,
      actorRole: req.user.role,
      action: 'APPLICATION_WITHDRAWN',
      targetType: 'application',
      targetId: id,
      ipAddress: req.ip,
      metadata: { reason },
    })

    return res.status(200).json({
      success: true,
      message: 'Application has been successfully withdrawn.',
      data: updated,
    })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({
        success: false,
        message: err.message,
      })
    }
    next(err)
  }
}
