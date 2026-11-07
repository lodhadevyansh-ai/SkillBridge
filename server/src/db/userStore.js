import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, '..', '..', 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Pre-hashed passwords for seed users
// 'password123' -> $2a$10$wT0o3qBgnq5wY7vQhK9PquQn6l3u1A5EaF.fO6zWnS3bK7a4tG5tq
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

function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(SEED_USERS, null, 2), 'utf-8')
      return [...SEED_USERS]
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('Error reading users store:', err)
    return [...SEED_USERS]
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing users store:', err)
  }
}

export const userStore = {
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
      isVerified: userData.role === 'student', // students verified by default; recruiters can undergo company verification
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    writeUsers(users)
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
    return this.sanitizeUser(deleted)
  },

  countActiveAdmins() {
    const users = readUsers()
    return users.filter(
      (u) => u.role === 'admin' && (u.status || 'Active').toLowerCase() !== 'suspended'
    ).length
  },
}

