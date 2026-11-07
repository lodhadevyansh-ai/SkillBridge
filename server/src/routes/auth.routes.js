import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  register,
  login,
  getCurrentUser,
  logout,
  deleteAccount,
} from '../controllers/auth.controller.js'
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js'

const router = Router()

// Rate limiter for account deletion attempts
const deleteAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many account deletion attempts. Please try again in 15 minutes.',
  },
})

// Public Auth Endpoints
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)

// Authenticated Session Endpoint
router.get('/me', authenticateToken, getCurrentUser)

// Permanent Account Deletion
router.delete('/account', deleteAccountLimiter, authenticateToken, deleteAccount)

// Role Authorization Verification Endpoints
router.get(
  '/student-only',
  authenticateToken,
  requireRole('student'),
  (req, res) => {
    res.json({
      success: true,
      message: `Access granted to student workspace for ${req.user.fullName}`,
      user: req.user,
    })
  }
)

router.get(
  '/recruiter-only',
  authenticateToken,
  requireRole('recruiter'),
  (req, res) => {
    res.json({
      success: true,
      message: `Access granted to recruiter workspace for ${req.user.fullName} (${req.user.companyName})`,
      user: req.user,
    })
  }
)

router.get(
  '/admin-only',
  authenticateToken,
  requireRole('admin'),
  (req, res) => {
    res.json({
      success: true,
      message: `Access granted to admin workspace for ${req.user.fullName}`,
      user: req.user,
    })
  }
)

export default router

