import bcrypt from 'bcryptjs'
import { registerSchema, loginSchema, deleteAccountSchema } from '../validators/auth.validator.js'
import { userStore } from '../db/userStore.js'
import { studentStore } from '../db/studentStore.js'
import { recruiterStore } from '../db/recruiterStore.js'
import { notificationStore } from '../db/notificationStore.js'
import { signToken } from '../config/jwt.js'
import { emailService } from '../services/emailService.js'
import { tokenBlacklist } from '../services/tokenBlacklist.js'
import { auditLogger } from '../services/auditLogger.js'
import { cloudinaryService } from '../services/cloudinaryService.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
}

export async function register(req, res) {
  try {
    // 1. Zod schema validation
    const validationResult = registerSchema.safeParse(req.body)
    if (!validationResult.success) {
      const issues = validationResult.error.issues || validationResult.error.errors || []
      const errors = issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return res.status(400).json({
        success: false,
        message: errors[0]?.message || 'Validation failed',
        errors,
      })
    }

    const { fullName, email, password, role, companyName } = validationResult.data

    // 2. Prevent duplicate email registration
    const existingUser = await userStore.findByEmail(email)
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered. Please sign in.',
      })
    }

    // 3. Hash password using bcrypt (12 rounds)
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    // 4. Create user in database (awaits MongoDB persistence)
    const newUser = await userStore.createUser({
      fullName,
      email,
      passwordHash,
      role,
      companyName,
    })

    const sanitizedUser = userStore.sanitizeUser(newUser)

    // 5. Generate secure JWT token
    const token = signToken({
      id: sanitizedUser.id,
      email: sanitizedUser.email,
      role: sanitizedUser.role,
    })

    // 6. Set HTTP-only cookie
    res.cookie('token', token, COOKIE_OPTIONS)

    // 7. Audit log registration
    auditLogger.log({
      actorId: sanitizedUser.id,
      actorRole: sanitizedUser.role,
      action: 'USER_REGISTERED',
      targetType: 'user',
      targetId: sanitizedUser.id,
      ipAddress: req.ip,
      metadata: { role: sanitizedUser.role, email: sanitizedUser.email },
    })

    // 8. Dispatch welcome confirmation email (failures contained)
    emailService
      .sendRegistrationConfirmation({
        name: sanitizedUser.fullName,
        email: sanitizedUser.email,
        role: sanitizedUser.role,
      })
      .catch((err) => console.warn('Could not dispatch registration email:', err.message))

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to SkillBridge.',
      token,
      user: sanitizedUser,
    })
  } catch (err) {
    if (err.code === 11000 || (err.name === 'MongoServerError' && err.code === 11000)) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered. Please sign in.',
      })
    }
    console.error('Registration error:', err)
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred during registration. Please try again.',
    })
  }
}

export async function login(req, res) {
  try {
    // 1. Zod schema validation
    const validationResult = loginSchema.safeParse(req.body)
    if (!validationResult.success) {
      const issues = validationResult.error.issues || validationResult.error.errors || []
      const errors = issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return res.status(400).json({
        success: false,
        message: errors[0]?.message || 'Validation failed',
        errors,
      })
    }

    const { email, password, role } = validationResult.data

    // 2. Find user by email (reads from MongoDB)
    const user = await userStore.findByEmail(email)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account does not exist.',
      })
    }

    // 3. Verify password hash using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.',
      })
    }

    // 3.1 Check if account is suspended
    if (user.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message: `Your account has been suspended: ${user.suspensionReason || 'Violation of platform terms'}. Please contact administrator support.`,
      })
    }

    // 4. Check role compatibility if role was explicitly selected in the login tab
    if (role && user.role !== role && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `This account is registered as a ${user.role}. Please switch to the ${user.role} tab to sign in.`,
      })
    }

    const sanitizedUser = userStore.sanitizeUser(user)

    // 5. Generate secure JWT token
    const token = signToken({
      id: sanitizedUser.id,
      email: sanitizedUser.email,
      role: sanitizedUser.role,
    })

    // 6. Set HTTP-only cookie
    res.cookie('token', token, COOKIE_OPTIONS)

    // 7. Audit log successful sign in
    auditLogger.log({
      actorId: sanitizedUser.id,
      actorRole: sanitizedUser.role,
      action: 'USER_LOGIN',
      targetType: 'user',
      targetId: sanitizedUser.id,
      ipAddress: req.ip,
      metadata: { email: sanitizedUser.email },
    })

    // 8. Dispatch login/welcome email if appropriate
    emailService
      .sendRegistrationConfirmation({
        name: sanitizedUser.fullName,
        email: sanitizedUser.email,
        role: sanitizedUser.role,
      })
      .catch((err) => console.warn('Could not dispatch login confirmation email:', err.message))

    return res.status(200).json({
      success: true,
      message: 'Welcome back to SkillBridge!',
      token,
      user: sanitizedUser,
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred during login. Please try again.',
    })
  }
}

export function getCurrentUser(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user,
  })
}

export function logout(req, res) {
  // 1. Extract token from header or cookie
  let token = req.token
  if (!token) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else if (req.cookies?.token) {
      token = req.cookies.token
    }
  }

  // 2. Invalidate token in blacklist
  if (token) {
    tokenBlacklist.invalidate(token)
  }

  // 3. Clear cookie cleanly
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  // 4. Audit log sign out
  if (req.user?.id) {
    auditLogger.log({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'USER_LOGOUT',
      targetType: 'user',
      targetId: req.user.id,
      ipAddress: req.ip,
    })
  }

  return res.status(200).json({
    success: true,
    message: 'Signed out successfully. Session has been invalidated.',
  })
}

/**
 * Permanent Account Deletion Endpoint
 * Strictly authenticated; validates password and confirmation text 'DELETE'.
 * Cascades deletion across all database collections, files, notifications, and invalidates session.
 */
export async function deleteAccount(req, res) {
  try {
    // 1. Authenticate user strictly using authenticated request user (never accept ID from body/params)
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to delete account.',
      })
    }

    // 2. Validate input schema (current password and confirmation: 'DELETE')
    const validationResult = deleteAccountSchema.safeParse(req.body)
    if (!validationResult.success) {
      const issues = validationResult.error.issues || validationResult.error.errors || []
      const errors = issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return res.status(400).json({
        success: false,
        message: errors[0]?.message || 'Invalid deletion confirmation payload',
        errors,
      })
    }

    const { password } = validationResult.data

    // 3. Retrieve user record from database (awaits MongoDB)
    const user = await userStore.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account does not exist.',
      })
    }

    // 4. Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.',
      })
    }

    // 5. Administrator protection: Cannot delete the last active administrator account
    if (user.role === 'admin') {
      const activeAdminsCount = await userStore.countActiveAdmins()
      if (activeAdminsCount <= 1) {
        return res.status(403).json({
          success: false,
          code: 'LAST_ADMIN_PROTECTED',
          message:
            'Cannot delete the last active administrator account. Transfer administrative privileges or retain at least one administrator.',
        })
      }
    }

    // 6. Role-specific database cleanup & cascade deletions
    let cleanupFiles = { resumes: [], avatarUrl: user.avatarUrl || null }

    if (user.role === 'student') {
      const studentCleanup = studentStore.deleteStudentData(user.id, user.email)
      cleanupFiles.resumes = studentCleanup.resumes || []
      if (studentCleanup.avatarUrl) cleanupFiles.avatarUrl = studentCleanup.avatarUrl
    } else if (user.role === 'recruiter') {
      recruiterStore.deleteRecruiterData(user.id)
    }

    // 7. Clean up notifications addressed to this user
    notificationStore.deleteUserNotifications(user.id)

    // 8. Clean up user's files from Cloudinary storage (contained, never touches other users)
    await cloudinaryService.cleanupUserFiles(user.id, cleanupFiles).catch((err) => {
      console.warn('Cloudinary file cleanup warning:', err.message)
    })

    // 9. Delete user record reliably from MongoDB
    await userStore.deleteUser(user.id)

    // 10. Invalidate authentication session & JWT token
    let token = req.token
    if (!token) {
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      } else if (req.cookies?.token) {
        token = req.cookies.token
      }
    }
    if (token) {
      tokenBlacklist.invalidate(token)
    }

    // Clear session cookies
    res.clearCookie('token', CLEAR_COOKIE_OPTIONS)

    // 11. Audit log the permanent account deletion
    auditLogger.log({
      actorId: user.id,
      actorRole: user.role,
      action: 'USER_ACCOUNT_PERMANENTLY_DELETED',
      targetType: 'user',
      targetId: user.id,
      ipAddress: req.ip,
      metadata: {
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Your SkillBridge account has been permanently deleted.',
    })
  } catch (err) {
    console.error('Account deletion error:', err)
    return res.status(500).json({
      success: false,
      message: 'Unable to delete your account right now. Please try again later.',
    })
  }
}
