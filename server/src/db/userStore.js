import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { isDatabaseConnected } from '../config/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, '..', '..', 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', 10)
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 10)

const SEED_USERS = [
  {
    id: 'usr_recruiter_meera',
    fullName: 'Meera Kapoor',
    email: 'meera@linear.app',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'recruiter',
    initials: 'MK',
    headline: 'Lead Technical Recruiter at Linear',
    companyName: 'Linear',
    isVerified: true,
    status: 'Active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_admin_rohan',
    fullName: 'Rohan Agarwal',
    email: 'admin@skillbridge.io',
    passwordHash: ADMIN_PASSWORD_HASH,
    role: 'admin',
    initials: 'RA',
    headline: 'Platform Operations Administrator',
    companyName: 'SkillBridge Admin',
    isVerified: true,
    status: 'Active',
    createdAt: new Date().toISOString(),
  },
]

let memoryUsers = null

function readFallbackUsers() {
  if (memoryUsers !== null) return memoryUsers
  try {
    if (!fs.existsSync(USERS_FILE)) {
      memoryUsers = [...SEED_USERS]
      return memoryUsers
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    memoryUsers = JSON.parse(raw)
    return memoryUsers
  } catch {
    memoryUsers = [...SEED_USERS]
    return memoryUsers
  }
}

function writeFallbackUsers(users) {
  memoryUsers = users
  // Only write to disk in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
    } catch {
      // ignore
    }
  }
}

/**
 * Creates a thenable wrapper around an object so it can be used synchronously
 * or awaited as a Promise.
 */
function makeThenable(targetObj, asyncPromise) {
  if (!targetObj) {
    return asyncPromise || null
  }
  const p = asyncPromise || Promise.resolve(targetObj)
  return Object.assign(Object.create(targetObj), {
    then: p.then.bind(p),
    catch: p.catch.bind(p),
  })
}

function assertProductionDatabase() {
  if (process.env.NODE_ENV === 'production' && !isDatabaseConnected()) {
    const error = new Error('Database unavailable. Operation cannot proceed in production without MongoDB connection.')
    error.status = 503
    throw error
  }
}

export const userStore = {
  /**
   * Find user by email address
   */
  findByEmail(email) {
    if (!email) return null
    assertProductionDatabase()

    const normalized = email.trim().toLowerCase()

    if (isDatabaseConnected()) {
      const promise = User.findOne({ email: normalized })
        .lean()
        .then((doc) => {
          if (!doc) return null
          return {
            ...doc,
            id: doc.id || doc._id.toString(),
          }
        })
      // Return a thenable for async usage, while checking cache for synchronous callers
      const cached = readFallbackUsers().find((u) => u.email.toLowerCase() === normalized) || null
      return makeThenable(cached, promise)
    }

    const users = readFallbackUsers()
    return users.find((u) => u.email.toLowerCase() === normalized) || null
  },

  /**
   * Find user by unique ID
   */
  findById(id) {
    if (!id) return null
    assertProductionDatabase()

    if (isDatabaseConnected()) {
      const promise = User.findOne({ id })
        .lean()
        .then((doc) => {
          if (!doc) return null
          return {
            ...doc,
            id: doc.id || doc._id.toString(),
          }
        })
      const cached = readFallbackUsers().find((u) => u.id === id) || null
      return makeThenable(cached, promise)
    }

    const users = readFallbackUsers()
    return users.find((u) => u.id === id) || null
  },

  /**
   * Create a new user with verified database persistence
   */
  createUser(userData) {
    assertProductionDatabase()

    const nameParts = (userData.fullName || 'User').trim().split(' ')
    const initials =
      nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
        : nameParts[0].slice(0, 2).toUpperCase()

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fullName: userData.fullName.trim(),
      email: userData.email.trim().toLowerCase(),
      passwordHash: userData.passwordHash,
      role: userData.role,
      initials,
      headline:
        userData.role === 'recruiter'
          ? `Hiring Manager at ${userData.companyName || 'SkillBridge Partner'}`
          : 'SkillBridge Candidate Member',
      companyName: userData.companyName || null,
      isVerified: userData.role === 'student',
      status: 'Active',
      createdAt: new Date().toISOString(),
    }

    // Always update fallback cache for immediate synchronous assertions
    const users = readFallbackUsers()
    users.push(newUser)
    writeFallbackUsers(users)

    if (isDatabaseConnected()) {
      const persistencePromise = User.create(newUser)
        .then((doc) => ({
          ...newUser,
          _id: doc._id,
        }))
        .catch((err) => {
          // If MongoDB write fails, rollback memory cache
          const idx = users.findIndex((u) => u.id === newUser.id)
          if (idx !== -1) users.splice(idx, 1)
          writeFallbackUsers(users)
          throw err
        })

      return makeThenable(newUser, persistencePromise)
    }

    return newUser
  },

  sanitizeUser(user) {
    if (!user) return null
    const { passwordHash, ...sanitized } = user
    return {
      ...sanitized,
      status: sanitized.status || 'Active',
    }
  },

  getAllUsers() {
    assertProductionDatabase()

    if (isDatabaseConnected()) {
      const promise = User.find({})
        .lean()
        .then((docs) => docs.map((d) => this.sanitizeUser({ ...d, id: d.id || d._id.toString() })))
      const cached = readFallbackUsers().map((u) => this.sanitizeUser(u))
      return makeThenable(cached, promise)
    }

    const users = readFallbackUsers()
    return users.map((u) => this.sanitizeUser(u))
  },

  updateUser(id, updates) {
    assertProductionDatabase()

    const users = readFallbackUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index === -1 && !isDatabaseConnected()) {
      const error = new Error(`User with ID '${id}' was not found.`)
      error.status = 404
      throw error
    }

    let updated = null
    if (index !== -1) {
      updated = {
        ...users[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      users[index] = updated
      writeFallbackUsers(users)
    }

    if (isDatabaseConnected()) {
      const persistencePromise = User.findOneAndUpdate({ id }, { $set: updates }, { new: true })
        .lean()
        .then((doc) => {
          if (!doc) {
            const error = new Error(`User with ID '${id}' was not found.`)
            error.status = 404
            throw error
          }
          return this.sanitizeUser({ ...doc, id: doc.id || doc._id.toString() })
        })

      return makeThenable(this.sanitizeUser(updated), persistencePromise)
    }

    return this.sanitizeUser(updated)
  },

  deleteUser(id) {
    assertProductionDatabase()

    const users = readFallbackUsers()
    const index = users.findIndex((u) => u.id === id)
    let deleted = null
    if (index !== -1) {
      ;[deleted] = users.splice(index, 1)
      writeFallbackUsers(users)
    }

    if (isDatabaseConnected()) {
      const deletePromise = User.findOneAndDelete({ id })
        .lean()
        .then((doc) => {
          if (!doc && !deleted) {
            const error = new Error(`User with ID '${id}' was not found.`)
            error.status = 404
            throw error
          }
          return this.sanitizeUser(doc || deleted)
        })

      return makeThenable(this.sanitizeUser(deleted), deletePromise)
    }

    if (!deleted) {
      const error = new Error(`User with ID '${id}' was not found.`)
      error.status = 404
      throw error
    }

    return this.sanitizeUser(deleted)
  },

  countActiveAdmins() {
    assertProductionDatabase()

    if (isDatabaseConnected()) {
      const promise = User.countDocuments({
        role: 'admin',
        status: { $ne: 'Suspended' },
      })
      const cached = readFallbackUsers().filter(
        (u) => u.role === 'admin' && (u.status || 'Active').toLowerCase() !== 'suspended'
      ).length
      return makeThenable(cached, promise)
    }

    const users = readFallbackUsers()
    return users.filter(
      (u) => u.role === 'admin' && (u.status || 'Active').toLowerCase() !== 'suspended'
    ).length
  },
}
