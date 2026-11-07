import { apiClient } from './apiClient'

export const studentService = {
  /**
   * Fetches the complete aggregated dashboard payload for the current authenticated student
   */
  async getDashboard() {
    try {
      const response = await apiClient.get('/student/dashboard')
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to load dashboard data')
    } catch (err) {
      // In development fallback, if server is completely offline or no network
      if (err.code === 'ERR_NETWORK' || !err.response) {
        console.warn('Backend server unreachable; fallback to initial state', err.message)
      }
      throw err
    }
  },

  /**
   * Toggles bookmark / save state for a job
   */
  async toggleSaveJob(jobId) {
    try {
      const response = await apiClient.post(`/student/jobs/${jobId}/save`)
      return response.data
    } catch (err) {
      console.error('Error toggling job bookmark:', err)
      throw err
    }
  },

  /**
   * Fetches applications for the student
   */
  async getApplications() {
    try {
      const response = await apiClient.get('/student/applications')
      return response.data?.data || []
    } catch (err) {
      console.error('Error fetching applications:', err)
      throw err
    }
  },

  /**
   * Fetches centralized dashboard stats for the current student
   */
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/student/dashboard/stats')
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to load student stats')
    } catch (err) {
      console.error('Error fetching student stats:', err)
      throw err
    }
  },
}

