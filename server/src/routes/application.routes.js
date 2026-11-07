import express from 'express'
import {
  getStudentApplications,
  getApplicationDetails,
  withdrawApplication,
} from '../controllers/application.controller.js'
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js'
import { validateBody } from '../middleware/validate.middleware.js'
import { withdrawApplicationSchema } from '../validators/application.validator.js'

const router = express.Router()

// All routes require authenticated student role
router.get('/', authenticateToken, requireRole('student'), getStudentApplications)
router.get('/:id', authenticateToken, requireRole('student'), getApplicationDetails)
router.post(
  '/:id/withdraw',
  authenticateToken,
  requireRole('student'),
  validateBody(withdrawApplicationSchema),
  withdrawApplication
)

export default router
