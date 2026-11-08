import { verifyToken } from '../config/jwt.js'
import { userStore } from '../db/userStore.js'
import { tokenBlacklist } from '../services/tokenBlacklist.js'

export async function authenticateToken(req, res, next) {
  let token = null

  // 1. Check Authorization Bearer header
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }

  // 2. Check HTTP-only cookie
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to access your workspace.',
    })
  }

  // 3. Verify token hasn't been blacklisted / invalidated on logout
  if (tokenBlacklist.isBlacklisted(token)) {
    return res.status(401).json({
      success: false,
      code: 'TOKEN_REVOKED',
      message: 'Session has been invalidated or signed out. Please sign in again.',
    })
  }

  try {
    const decoded = verifyToken(token)
    const user = await userStore.findById(decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account associated with this session no longer exists.',
      })
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message: `Your account has been suspended: ${user.suspensionReason || 'Violation of platform terms'}. Please contact administrator support.`,
      })
    }

    // Attach sanitized user to request and the raw token for potential logout invalidation
    req.user = userStore.sanitizeUser(user)
    req.token = token
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Your session has expired. Please sign in again.',
      })
    }
    return res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: 'Invalid session token. Please sign in again.',
    })
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires ${allowedRoles.join(' or ')} privileges.`,
      })
    }

    next()
  }
}
