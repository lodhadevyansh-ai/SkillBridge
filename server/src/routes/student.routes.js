import express from 'express'
import {
  getStudentDashboard,
  getStudentDashboardStats,
  toggleSaveJob,
  getStudentApplications,
  getSavedJobs,
  removeSavedJob,
  getProfile,
  updateProfile,
  getResumes,
  uploadResume,
  deleteResume,
  setDefaultResume,
  getResumeAccess,
} from '../controllers/student.controller.js'
import { getStudentAnalytics } from '../controllers/analytics.controller.js'
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js'
import { validateBody } from '../middleware/validate.middleware.js'
import { updateProfileSchema, uploadResumeSchema } from '../validators/student.validator.js'

const router = express.Router()

// All routes require authenticated student role
router.get('/dashboard', authenticateToken, requireRole('student'), getStudentDashboard)
router.get('/dashboard/stats', authenticateToken, requireRole('student'), getStudentDashboardStats)
router.get('/analytics', authenticateToken, requireRole('student'), getStudentAnalytics)
router.post('/jobs/:id/save', authenticateToken, requireRole('student'), toggleSaveJob)
router.get('/saved-jobs', authenticateToken, requireRole('student'), getSavedJobs)
router.delete('/saved-jobs/:id', authenticateToken, requireRole('student'), removeSavedJob)
router.get('/applications', authenticateToken, requireRole('student'), getStudentApplications)

// Profile endpoints
router.get('/profile', authenticateToken, requireRole('student'), getProfile)
router.put('/profile', authenticateToken, requireRole('student'), validateBody(updateProfileSchema), updateProfile)

// Resumes endpoints
router.get('/resumes', authenticateToken, requireRole('student'), getResumes)
router.post('/resumes', authenticateToken, requireRole('student'), validateBody(uploadResumeSchema), uploadResume)
router.delete('/resumes/:id', authenticateToken, requireRole('student'), deleteResume)
router.patch('/resumes/:id/default', authenticateToken, requireRole('student'), setDefaultResume)

// Protected resume download/access check (accessible to student owner, job recruiter, or admin)
router.get('/resumes/:id/access', authenticateToken, getResumeAccess)

export default router
