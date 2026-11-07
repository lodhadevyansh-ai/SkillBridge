import dotenv from 'dotenv'

dotenv.config()

/**
 * Validate critical environment variables and enforce security invariants.
 */
export function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production'

  // Require strong JWT_SECRET in production
  if (isProd) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error(
        'CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing or insufficiently long (< 32 chars) for production.'
      )
    }
  }

  return {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET || 'skillbridge_jwt_secret_key_production_grade_2026',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  }
}

export const env = validateEnv()

