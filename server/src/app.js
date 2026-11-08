import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import { isDatabaseConnected, getConnectionState } from './config/database.js'

import authRoutes from './routes/auth.routes.js'
import studentRoutes from './routes/student.routes.js'
import jobRoutes from './routes/job.routes.js'
import applicationRoutes from './routes/application.routes.js'
import recruiterRoutes from './routes/recruiter.routes.js'
import adminRoutes from './routes/admin.routes.js'
import notificationRoutes from './routes/notification.routes.js'

const app = express()

// ==========================================
// 1. EXPRESS PROXY CONFIGURATION (RENDER)
// ==========================================

// Render acts as 1 reverse proxy in front of the application
app.set('trust proxy', 1)

// ==========================================
// 2. CORS & CSP ORIGINS NORMALIZATION
// ==========================================

const configuredFrontendOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean)

const devOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
]

const allowedOrigins = [
  ...configuredFrontendOrigins,
  ...(process.env.NODE_ENV !== 'production' ? devOrigins : []),
]

// ==========================================
// 3. SECURITY HEADERS (HELMET + CSP)
// ==========================================

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://res.cloudinary.com',
          'https://images.unsplash.com',
        ],
        connectSrc: [
          "'self'",
          ...configuredFrontendOrigins,
        ],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
)

// ==========================================
// 4. CORS CONFIGURATION
// ==========================================

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (curl, postman, server-to-server) without Origin header
    if (!origin) {
      return callback(null, true)
    }

    const normalized = origin.trim().replace(/\/+$/, '')

    if (allowedOrigins.includes(normalized)) {
      return callback(null, true)
    }

    // Allow localhost during non-production
    if (process.env.NODE_ENV !== 'production') {
      const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized)
      if (isLocal) {
        return callback(null, true)
      }
    }

    console.warn(`[CORS] Rejected unconfigured origin: ${origin}`)
    return callback(null, false)
  },

  credentials: true,

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],

  exposedHeaders: [
    'RateLimit-Limit',
    'RateLimit-Remaining',
    'RateLimit-Reset',
  ],

  maxAge: 86400,
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// ==========================================
// 5. BODY PARSING & COOKIES
// ==========================================

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(cookieParser())

// ==========================================
// 6. RATE LIMITING (RENDER COMPATIBLE)
// ==========================================

const safeRateLimitOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
}

// General API limiter
const generalLimiter = rateLimit({
  ...safeRateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.',
  },
})

// Authentication limiter
const authLimiter = rateLimit({
  ...safeRateLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Too many authentication attempts. Please try again later.',
  },
})

app.use('/api', generalLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// ==========================================
// 7. HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {
  const isConnected = isDatabaseConnected()
  const dbState = getConnectionState()
  const isProduction = process.env.NODE_ENV === 'production'

  // In production, MongoDB Atlas must be healthy. If disconnected, signal failure to Render health check
  if (isProduction && !isConnected) {
    return res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: dbState,
      service: 'SkillBridge API Server',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  }

  res.status(200).json({
    success: true,
    status: 'healthy',
    database: isConnected ? 'connected' : (isProduction ? 'unhealthy' : 'local_store_dev'),
    service: 'SkillBridge API Server',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  })
})

// ==========================================
// 8. API ROUTES
// ==========================================

// Authentication
app.use('/api/auth', authRoutes)

// Student
app.use('/api/student', studentRoutes)

// Jobs
app.use('/api/jobs', jobRoutes)

// Applications
app.use('/api/applications', applicationRoutes)

// Recruiter
app.use('/api/recruiter', recruiterRoutes)

// Admin
app.use('/api/admin', adminRoutes)

// Notifications
app.use('/api/notifications', notificationRoutes)

// ==========================================
// 9. API 404 HANDLER
// ==========================================

app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: `API endpoint '${req.originalUrl}' not found`,
  })
})

// ==========================================
// 10. GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500

  if (statusCode >= 500) {
    console.error(`[Server Error ${statusCode}]`, err.message || err)

    if (process.env.NODE_ENV !== 'production' && err.stack) {
      console.error(err.stack)
    }
  }

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? 'Internal Server Error. Please contact support.'
        : err.message,
    code:
      err.code ||
      (statusCode === 403
        ? 'FORBIDDEN'
        : statusCode === 401
          ? 'UNAUTHORIZED'
          : undefined),
  })
})

// ==========================================
// 11. EXPORT APPLICATION
// ==========================================

export default app
