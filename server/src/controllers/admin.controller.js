import { adminStore } from '../db/adminStore.js'
import { auditLogger } from '../services/auditLogger.js'

export async function getAdminDashboard(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const dashboard = adminStore.getDashboard()
    return res.status(200).json({
      success: true,
      data: dashboard,
    })
  } catch (err) {
    next(err)
  }
}

export async function getAdminUsers(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const { role, status, search, page, limit } = req.query
    const result = adminStore.getUsers({ role, status, search, page, limit })

    return res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination,
      counts: result.counts,
    })
  } catch (err) {
    next(err)
  }
}

export async function suspendUser(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const adminId = req.user.id
    const { id: userId } = req.params
    const { reason } = req.body

    const updated = adminStore.suspendUser(adminId, userId, reason)

    // Audit log
    auditLogger.log({
      actorId: adminId,
      actorRole: req.user.role,
      action: 'ADMIN_USER_SUSPENDED',
      targetType: 'user',
      targetId: userId,
      ipAddress: req.ip,
      metadata: { reason, targetName: updated.fullName },
    })

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Account for ${updated.fullName} has been suspended.`,
    })
  } catch (err) {
    next(err)
  }
}

export async function activateUser(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const adminId = req.user.id
    const { id: userId } = req.params

    const updated = adminStore.activateUser(adminId, userId)

    // Audit log
    auditLogger.log({
      actorId: adminId,
      actorRole: req.user.role,
      action: 'ADMIN_USER_ACTIVATED',
      targetType: 'user',
      targetId: userId,
      ipAddress: req.ip,
      metadata: { targetName: updated.fullName },
    })

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Account for ${updated.fullName} has been reactivated.`,
    })
  } catch (err) {
    next(err)
  }
}

export async function getAdminJobs(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const { status, search, page, limit } = req.query
    const result = adminStore.getJobs({ status, search, page, limit })

    return res.status(200).json({
      success: true,
      data: result.jobs,
      pagination: result.pagination,
    })
  } catch (err) {
    next(err)
  }
}

export async function approveJob(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const adminId = req.user.id
    const { id: jobId } = req.params

    const result = adminStore.approveJob(adminId, jobId)

    auditLogger.log({
      actorId: adminId,
      actorRole: req.user.role,
      action: 'ADMIN_JOB_APPROVED',
      targetType: 'job',
      targetId: jobId,
      ipAddress: req.ip,
    })

    return res.status(200).json({
      success: true,
      message: result.message,
    })
  } catch (err) {
    next(err)
  }
}

export async function removeJob(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const adminId = req.user.id
    const { id: jobId } = req.params
    const { reason } = req.body

    const result = adminStore.removeJob(adminId, jobId, reason)

    auditLogger.log({
      actorId: adminId,
      actorRole: req.user.role,
      action: 'ADMIN_JOB_REMOVED',
      targetType: 'job',
      targetId: jobId,
      ipAddress: req.ip,
      metadata: { reason },
    })

    return res.status(200).json({
      success: true,
      message: result.message,
    })
  } catch (err) {
    next(err)
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const logs = adminStore.getAuditLogs()
    return res.status(200).json({
      success: true,
      data: logs,
    })
  } catch (err) {
    next(err)
  }
}

export async function getAdminSettings(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const settings = adminStore.getSettings()
    return res.status(200).json({
      success: true,
      data: settings,
    })
  } catch (err) {
    next(err)
  }
}

export async function updateAdminSettings(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const adminId = req.user.id
    const updated = adminStore.updateSettings(adminId, req.body)

    auditLogger.log({
      actorId: adminId,
      actorRole: req.user.role,
      action: 'ADMIN_SETTINGS_UPDATED',
      targetType: 'settings',
      targetId: 'global',
      ipAddress: req.ip,
      metadata: req.body,
    })

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Platform settings updated successfully',
    })
  } catch (err) {
    next(err)
  }
}
