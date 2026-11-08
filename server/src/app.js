
import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'

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

app.set('trust proxy', 1)

// ==========================================
// 2. SECURITY HEADERS
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
          'https://res.cloudinary.com',
          'https://images.unsplash.com'
        ],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
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
// 3. CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  'https://skillbridge-1-1n4n.onrender.com',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',

  // Additional origins from Render environment variables
  ...(process.env.FRONTEND_URL || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
]

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      if (!origin) {
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      // Allow localhost origins in development only
      if (process.env.NODE_ENV !== 'production') {
        const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)

        if (isLocal) {
          return callback(null, true)
        }
      }

      console.error('CORS rejected origin:', origin)

      const error = new Error(
        `CORS blocked request from origin: ${origin}`
      )

      error.status = 403
      error.code = 'CORS_ORIGIN_NOT_ALLOWED'

      return callback(error)
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
    ],

    exposedHeaders: [
      'RateLimit-Limit',
      'RateLimit-Remaining',
      'RateLimit-Reset',
    ],

    maxAge: 86400,
  })
)

// ==========================================
// 4. BODY PARSING & COOKIES
// ==========================================

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(cookieParser())

// ==========================================
// 5. RATE LIMITING
// ==========================================

// General API limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.',
  },
})

// Authentication limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Too many authentication attempts. Please try again later.',
  },
})

// Apply rate limiters
app.use('/api', generalLimiter)

app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// ==========================================
// 6. HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'SkillBridge API Server',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  })
})

// ==========================================
// 7. API ROUTES
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
// 8. API 404 HANDLER
// ==========================================

app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`,
  })
})

// ==========================================
// 9. GLOBAL ERROR HANDLER
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
// 10. EXPORT APPLICATION
// ==========================================

export default app
