import { apiClient } from './apiClient'

export const notificationService = {
  /**
   * Fetch all notifications and unread count for current user
   */
  async getNotifications() {
    try {
      const res = await apiClient.get('/notifications')
      return res.data
    } catch (err) {
      console.warn('API error fetching notifications, fallback:', err.message)
      return {
        notifications: [
          {
            id: 'notif-fallback-1',
            type: 'interview_scheduled',
            title: 'Interview Scheduled 📅',
            message: 'Your interview for UX Research Intern at Notion is confirmed.',
            link: '/student/applications',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ],
        unreadCount: 1,
      }
    }
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id) {
    const res = await apiClient.patch(`/notifications/${id}/read`)
    return res.data
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const res = await apiClient.patch('/notifications/read-all')
    return res.data
  },
}

