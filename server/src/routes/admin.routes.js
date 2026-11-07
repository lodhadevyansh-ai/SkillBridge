import express from 'express'
import {
  getAdminDashboard,
  getAdminUsers,
  suspendUser,
  activateUser,
  getAdminJobs,
  approveJob,
  removeJob,
  getAuditLogs,
  getAdminSettings,
  updateAdminSettings,
} from '../controllers/admin.controller.js'
import { getAdminAnalytics } from '../controllers/analytics.controller.js'
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js'
import { validateBody } from '../middleware/validate.middleware.js'
import { suspendUserSchema, removeJobSchema } from '../validators/admin.validator.js'

const router = express.Router()

// All routes require authenticated admin role
router.get('/dashboard', authenticateToken, requireRole('admin'), getAdminDashboard)
router.get('/analytics', authenticateToken, requireRole('admin'), getAdminAnalytics)
router.get('/users', authenticateToken, requireRole('admin'), getAdminUsers)
router.patch('/users/:id/suspend', authenticateToken, requireRole('admin'), validateBody(suspendUserSchema), suspendUser)
router.patch('/users/:id/activate', authenticateToken, requireRole('admin'), activateUser)

router.get('/jobs', authenticateToken, requireRole('admin'), getAdminJobs)
router.patch('/jobs/:id/approve', authenticateToken, requireRole('admin'), approveJob)
router.delete('/jobs/:id', authenticateToken, requireRole('admin'), validateBody(removeJobSchema), removeJob)

// Settings endpoints
router.get('/settings', authenticateToken, requireRole('admin'), getAdminSettings)
router.put('/settings', authenticateToken, requireRole('admin'), updateAdminSettings)

// Audit logs endpoint
router.get('/audit-logs', authenticateToken, requireRole('admin'), getAuditLogs)

export default router
