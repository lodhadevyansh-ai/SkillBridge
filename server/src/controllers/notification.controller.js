import { notificationStore } from '../db/notificationStore.js'

export const getNotifications = (req, res, next) => {
  try {
    const userId = req.user.id
    const data = notificationStore.getNotifications(userId)
    res.json({
      success: true,
      notifications: data.notifications,
      unreadCount: data.unreadCount,
    })
  } catch (err) {
    next(err)
  }
}

export const markNotificationAsRead = (req, res, next) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const updated = notificationStore.markAsRead(userId, id)
    const { unreadCount } = notificationStore.getNotifications(userId)

    res.json({
      success: true,
      notification: updated,
      unreadCount,
    })
  } catch (err) {
    next(err)
  }
}

export const markAllNotificationsAsRead = (req, res, next) => {
  try {
    const userId = req.user.id
    const updatedCount = notificationStore.markAllAsRead(userId)
    res.json({
      success: true,
      message: 'All notifications marked as read',
      updatedCount,
      unreadCount: 0,
    })
  } catch (err) {
    next(err)
  }
}

