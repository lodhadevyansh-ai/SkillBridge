import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes.js'
import studentRoutes from './routes/student.routes.js'
import jobRoutes from './routes/job.routes.js'
import applicationRoutes from './routes/application.routes.js'
import recruiterRoutes from './routes/recruiter.routes.js'
import adminRoutes from './routes/admin.routes.js'
import notificationRoutes from './routes/notification.routes.js'

dotenv.config()

const app = express()

// 1. Secure HTTP Headers using Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://images.unsplash.com'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)

// 2. Strict CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
]

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl, internal tests)
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      if (process.env.NODE_ENV !== 'production') {
        // In local development, check localhost variants
        const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        if (isLocal) return callback(null, true)
      }
      return callback(new Error(`CORS blocked request from origin: ${origin}`), false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
    maxAge: 86400, // 24 hours preflight cache
  })
)

// 3. Rate Limiting
// General API Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP address, please try again in 15 minutes.',
  },
})

// Strict Auth Limiter to prevent brute-force attacks on login and register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // 60 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
})

app.use('/api', generalLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SkillBridge API Server',
    time: new Date().toISOString(),
  })
})

// Authentication Routes
app.use('/api/auth', authRoutes)

// Student Routes
app.use('/api/student', studentRoutes)

// Job Opportunities Routes
app.use('/api/jobs', jobRoutes)

// Applications Routes
app.use('/api/applications', applicationRoutes)

// Recruiter Routes
app.use('/api/recruiter', recruiterRoutes)

// Admin Routes
app.use('/api/admin', adminRoutes)

// Notification Routes
app.use('/api/notifications', notificationRoutes)

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`,
  })
})

// Global Safe Error Handler: never leak stack traces or raw server internals
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500

  // Log error details safely on server
  if (statusCode >= 500) {
    console.error(`[Server Error ${statusCode}]`, err.message || err)
    if (process.env.NODE_ENV !== 'production' && err.stack) {
      console.error(err.stack)
    }
  }

  // Safe client response (no internal stack traces exposed to clients)
  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? 'Internal Server Error. Please contact support.' : err.message,
    code: err.code || (statusCode === 403 ? 'FORBIDDEN' : statusCode === 401 ? 'UNAUTHORIZED' : undefined),
  })
})

export default app
