import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { env } from './env.js'

export function signToken(payload) {
  // Attach unique JWT identifier (jti) to prevent collision and support precise revocation
  const jti = crypto.randomUUID()
  return jwt.sign({ ...payload, jti }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN })
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET)
}
