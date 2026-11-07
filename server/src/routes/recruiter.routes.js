import express from 'express'
import {
  getRecruiterDashboard,
  getRecruiterDashboardStats,
  getRecruiterProfile,
  updateRecruiterProfile,
  getRecruiterJobs,
  getRecruiterJobById,
  createJob,
  updateJob,
  publishJob,
  closeJob,
  deleteJob,
  getRecruiterCandidates,
  getRecruiterCandidateById,
  updateCandidateStage,
  scheduleInterview,
  addCandidateNote,
} from '../controllers/recruiter.controller.js'
import { getRecruiterAnalytics } from '../controllers/analytics.controller.js'
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js'
import { validateBody } from '../middleware/validate.middleware.js'
import { createJobSchema, updateJobSchema } from '../validators/job.validator.js'
import {
  updateCandidateStageSchema,
  scheduleInterviewSchema,
  addNoteSchema,
} from '../validators/recruiter.validator.js'

const router = express.Router()

// All recruiter routes require authenticated recruiter role
router.get('/dashboard', authenticateToken, requireRole('recruiter'), getRecruiterDashboard)
router.get('/dashboard/stats', authenticateToken, requireRole('recruiter'), getRecruiterDashboardStats)
router.get('/profile', authenticateToken, requireRole('recruiter'), getRecruiterProfile)
router.put('/profile', authenticateToken, requireRole('recruiter'), updateRecruiterProfile)
router.get('/analytics', authenticateToken, requireRole('recruiter'), getRecruiterAnalytics)
router.get('/jobs', authenticateToken, requireRole('recruiter'), getRecruiterJobs)
router.post('/jobs', authenticateToken, requireRole('recruiter'), validateBody(createJobSchema), createJob)
router.get('/jobs/:id', authenticateToken, requireRole('recruiter'), getRecruiterJobById)
router.put('/jobs/:id', authenticateToken, requireRole('recruiter'), validateBody(updateJobSchema), updateJob)
router.patch('/jobs/:id/publish', authenticateToken, requireRole('recruiter'), publishJob)
router.patch('/jobs/:id/close', authenticateToken, requireRole('recruiter'), closeJob)
router.delete('/jobs/:id', authenticateToken, requireRole('recruiter'), deleteJob)

router.get('/candidates', authenticateToken, requireRole('recruiter'), getRecruiterCandidates)
router.get('/applications', authenticateToken, requireRole('recruiter'), getRecruiterCandidates)
router.get('/candidates/:id', authenticateToken, requireRole('recruiter'), getRecruiterCandidateById)
router.patch(
  '/candidates/:id/stage',
  authenticateToken,
  requireRole('recruiter'),
  validateBody(updateCandidateStageSchema),
  updateCandidateStage
)
router.post(
  '/candidates/:id/interview',
  authenticateToken,
  requireRole('recruiter'),
  validateBody(scheduleInterviewSchema),
  scheduleInterview
)
router.post(
  '/candidates/:id/notes',
  authenticateToken,
  requireRole('recruiter'),
  validateBody(addNoteSchema),
  addCandidateNote
)

export default router
