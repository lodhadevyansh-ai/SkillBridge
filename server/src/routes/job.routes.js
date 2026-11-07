import express from 'express'
import {
  getJobs,
  getJobById,
  getJobSkillMatch,
  toggleSaveJob,
  applyToJob,
  getApplicationStatus,
} from '../controllers/job.controller.js'
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js'
import { validateBody } from '../middleware/validate.middleware.js'
import { applyJobSchema } from '../validators/application.validator.js'

const router = express.Router()

// Optional authentication for public browsing & skill match widgets
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization || req.cookies?.token
  if (token) {
    return authenticateToken(req, res, next)
  }
  next()
}

router.get('/', optionalAuth, getJobs)
router.get('/:id', optionalAuth, getJobById)
router.get('/:id/skill-match', optionalAuth, getJobSkillMatch)

// Protected endpoints requiring authenticated student role
router.post('/:id/save', authenticateToken, requireRole('student'), toggleSaveJob)
router.post(
  '/:id/apply',
  authenticateToken,
  requireRole('student'),
  validateBody(applyJobSchema),
  applyToJob
)
router.get('/:id/application-status', authenticateToken, requireRole('student'), getApplicationStatus)

export default router
