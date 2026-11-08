import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { AuditLog } from '../models/AuditLog.js'
import { isDatabaseConnected } from '../config/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, '..', '..', 'data')
const AUDIT_LOG_FILE = path.join(DATA_DIR, 'auditLogs.json')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

class AuditLoggerService {
  constructor() {
    this._initStore()
  }

  _initStore() {
    if (!fs.existsSync(AUDIT_LOG_FILE)) {
      fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify([], null, 2), 'utf-8')
    }
  }

  _getLogs() {
    try {
      const raw = fs.readFileSync(AUDIT_LOG_FILE, 'utf-8')
      return JSON.parse(raw)
    } catch {
      return []
    }
  }

  _saveLogs(logs) {
    fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify(logs, null, 2), 'utf-8')
  }

  /**
   * Record a security/administrative audit log
   * @param {Object} entry
   * @param {string} entry.actorId - ID of the user performing the action
   * @param {string} entry.actorRole - Role of the actor (admin, recruiter, student, system)
   * @param {string} entry.action - Action name (e.g., USER_SUSPENDED, JOB_APPROVED, APPLICATION_WITHDRAWN)
   * @param {string} entry.targetType - Target resource type (user, job, application, profile)
   * @param {string} [entry.targetId] - Target resource ID
   * @param {string} [entry.ipAddress] - IP address of the request
   * @param {Object} [entry.metadata] - Extra details (never sensitive credentials)
   */
  log({ actorId, actorRole, action, targetType, targetId = null, ipAddress = null, metadata = {} }) {
    const logs = this._getLogs()

    // Sanitize metadata to guarantee no password hashes or tokens are ever recorded
    const sanitizedMetadata = { ...metadata }
    delete sanitizedMetadata.password
    delete sanitizedMetadata.passwordHash
    delete sanitizedMetadata.token
    delete sanitizedMetadata.jwt
    delete sanitizedMetadata.secret

    const logEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      actorId,
      actorRole,
      action,
      targetType,
      targetId,
      ipAddress,
      metadata: sanitizedMetadata,
    }

    logs.unshift(logEntry)
    // Keep last 1000 logs in storage
    if (logs.length > 1000) {
      logs.length = 1000
    }

    this._saveLogs(logs)

    // Asynchronously persist to MongoDB Atlas if connected
    if (isDatabaseConnected()) {
      AuditLog.create({
        id: logEntry.id,
        actorId: logEntry.actorId,
        actorRole: logEntry.actorRole,
        action: logEntry.action,
        targetType: logEntry.targetType,
        targetId: logEntry.targetId,
        ipAddress: logEntry.ipAddress,
        metadata: logEntry.metadata,
        timestamp: new Date(logEntry.timestamp),
      }).catch((err) => {
        console.warn('⚠️ [AuditLogger] Failed to write log to MongoDB Atlas:', err.message)
      })
    }

    return logEntry
  }

  getLogs({ limit = 50, actorId, action } = {}) {
    let logs = this._getLogs()
    if (actorId) logs = logs.filter((l) => l.actorId === actorId)
    if (action) logs = logs.filter((l) => l.action === action)
    return logs.slice(0, limit)
  }
}

export const auditLogger = new AuditLoggerService()
