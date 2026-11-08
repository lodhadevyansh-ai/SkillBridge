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
    createdAt: new Date().toISOString(),
  },
]

let memoryUsers = null

function readUsers() {
  if (memoryUsers !== null) {
    return memoryUsers
  }
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(SEED_USERS, null, 2), 'utf-8')
      memoryUsers = [...SEED_USERS]
      return memoryUsers
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    memoryUsers = JSON.parse(raw)
    return memoryUsers
  } catch (err) {
    console.error('Error reading users store:', err)
    memoryUsers = [...SEED_USERS]
    return memoryUsers
  }
}

function writeUsers(users) {
  memoryUsers = users
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing users store:', err)
  }
}

export const userStore = {
  async syncFromMongo() {
    if (!isDatabaseConnected()) return
    try {
      const dbUsers = await User.find({}).lean()
      if (dbUsers && dbUsers.length > 0) {
        memoryUsers = dbUsers.map((u) => ({
          ...u,
          id: u.id || u._id.toString(),
          createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
        }))
        writeUsers(memoryUsers)
        console.log(`🔄 [userStore] Synchronized ${memoryUsers.length} users from MongoDB Atlas`)
      }
    } catch (err) {
      console.warn('⚠️ [userStore] Could not sync users from MongoDB Atlas:', err.message)
    }
  },

  findByEmail(email) {
    if (!email) return null
    const users = readUsers()
    return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null
  },

  findById(id) {
    if (!id) return null
    const users = readUsers()
    return users.find((u) => u.id === id) || null
  },

  createUser(userData) {
    const users = readUsers()
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

    users.push(newUser)
    writeUsers(users)

    // Asynchronously persist to MongoDB Atlas if connected
    if (isDatabaseConnected()) {
      User.create(newUser).catch((err) => {
        if (err.code !== 11000) {
          console.error('❌ [userStore] MongoDB user creation error:', err.message)
        }
      })
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
    const users = readUsers()
    return users.map((u) => this.sanitizeUser(u))
  },

  updateUser(id, updates) {
    const users = readUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) {
      const error = new Error(`User with ID '${id}' was not found.`)
      error.status = 404
      throw error
    }

    const current = users[index]
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    users[index] = updated
    writeUsers(users)

    if (isDatabaseConnected()) {
      User.updateOne({ id }, { $set: updates }).catch((err) => {
        console.error('❌ [userStore] MongoDB user update error:', err.message)
      })
    }

    return this.sanitizeUser(updated)
  },

  deleteUser(id) {
    const users = readUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) {
      const error = new Error(`User with ID '${id}' was not found.`)
      error.status = 404
      throw error
    }

    const [deleted] = users.splice(index, 1)
    writeUsers(users)

    if (isDatabaseConnected()) {
      User.deleteOne({ id }).catch((err) => {
        console.error('❌ [userStore] MongoDB user delete error:', err.message)
      })
    }

    return this.sanitizeUser(deleted)
  },

  countActiveAdmins() {
    const users = readUsers()
    return users.filter(
      (u) => u.role === 'admin' && (u.status || 'Active').toLowerCase() !== 'suspended'
    ).length
  },
}
