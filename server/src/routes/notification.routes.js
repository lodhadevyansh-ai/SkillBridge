import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.middleware.js'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notification.controller.js'

const router = Router()

// All notification routes require authentication
router.use(authenticateToken)

router.get('/', getNotifications)
router.patch('/read-all', markAllNotificationsAsRead)
router.patch('/:id/read', markNotificationAsRead)

export default router

