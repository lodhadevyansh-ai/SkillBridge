import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, '..', '..', 'data')
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notificationsData.json')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const INITIAL_NOTIFICATIONS = [
  // Recruiter Notifications (usr_recruiter_meera)
  {
    id: 'notif-rec-1',
    userId: 'usr_recruiter_meera',
    type: 'new_application',
    title: 'New Candidate Application',
    message: 'Nisha Khanna applied for Product Design Intern with 96% match score.',
    link: '/recruiter/candidates?jobId=job-1',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    metadata: { jobId: 'job-1', candidateName: 'Nisha Khanna' },
  },
  {
    id: 'notif-rec-2',
    userId: 'usr_recruiter_meera',
    type: 'job_approved',
    title: 'Job Listing Approved',
    message: 'Your listing "Senior Frontend Architect" has passed platform moderation.',
    link: '/recruiter/jobs',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    metadata: { jobId: 'job-17' },
  },
  {
    id: 'notif-rec-3',
    userId: 'usr_recruiter_meera',
    type: 'interview_updated',
    title: 'Interview Confirmed',
    message: 'Video meeting room generated for Nisha Khanna on 10 Nov at 03:30 PM.',
    link: '/recruiter/candidates?jobId=job-1',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    metadata: { candidateName: 'Nisha Khanna' },
  },

  // Admin Notifications (usr_admin_rohan)
  {
    id: 'notif-adm-1',
    userId: 'usr_admin_rohan',
    type: 'new_application',
    title: 'Listing Submitted for Moderation',
    message: 'Linear submitted "Senior Frontend Architect" for compliance check.',
    link: '/admin/jobs',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    metadata: { jobId: 'job-17' },
  },
  {
    id: 'notif-adm-2',
    userId: 'usr_admin_rohan',
    type: 'recruiter_activity',
    title: 'New Recruiter Verified',
    message: 'Meera Kapoor at Linear verified company domain and workspace credentials.',
    link: '/admin/users',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    metadata: { userId: 'usr_recruiter_meera' },
  },
]

function readData() {
  try {
    if (!fs.existsSync(NOTIFICATIONS_FILE)) {
      writeData(INITIAL_NOTIFICATIONS)
      return INITIAL_NOTIFICATIONS
    }
    const raw = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_NOTIFICATIONS
  } catch (err) {
    console.error('Error reading notifications data, resetting to seed:', err)
    writeData(INITIAL_NOTIFICATIONS)
    return INITIAL_NOTIFICATIONS
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing notifications data:', err)
  }
}

export const notificationStore = {
  /**
   * Get all notifications for an authenticated user
   */
  getNotifications(userId) {
    if (!userId) return { notifications: [], unreadCount: 0 }
    const all = readData()
    const userNotifs = all
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const unreadCount = userNotifs.filter((n) => !n.read).length
    return {
      notifications: userNotifs,
      unreadCount,
    }
  },

  /**
   * Mark a single notification as read
   */
  markAsRead(userId, notificationId) {
    const all = readData()
    const item = all.find((n) => n.id === notificationId)
    if (!item) {
      const err = new Error('Notification not found')
      err.status = 404
      throw err
    }
    if (item.userId !== userId) {
      const err = new Error('Access denied. You can only manage your own notifications.')
      err.status = 403
      throw err
    }

    item.read = true
    item.readAt = new Date().toISOString()
    writeData(all)
    return item
  },

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead(userId) {
    if (!userId) return 0
    const all = readData()
    let updatedCount = 0
    const now = new Date().toISOString()

    all.forEach((n) => {
      if (n.userId === userId && !n.read) {
        n.read = true
        n.readAt = now
        updatedCount++
      }
    })

    if (updatedCount > 0) {
      writeData(all)
    }
    return updatedCount
  },

  /**
   * Create a new notification
   */
  createNotification({ userId, type, title, message, link = null, metadata = {} }) {
    if (!userId || !title || !message) {
      throw new Error('userId, title, and message are required to create a notification')
    }

    const all = readData()
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      type: type || 'general',
      title,
      message,
      link,
      read: false,
      createdAt: new Date().toISOString(),
      metadata,
    }

    all.unshift(newNotif)
    writeData(all)
    return newNotif
  },

  /**
   * Delete all notifications belonging to a specific user permanently
   */
  deleteUserNotifications(userId) {
    if (!userId) return 0
    const all = readData()
    const remaining = all.filter((n) => n.userId !== userId)
    const removedCount = all.length - remaining.length
    if (removedCount > 0) {
      writeData(remaining)
    }
    return removedCount
  },

  /**
   * Clear all or reset for tests
   */
  reset() {
    writeData(INITIAL_NOTIFICATIONS)
  },
}

