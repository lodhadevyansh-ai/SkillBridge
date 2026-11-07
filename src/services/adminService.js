import { apiClient } from './apiClient'

export const adminService = {
  /**
   * Fetch aggregated platform statistics, charts, and activity for admin dashboard
   */
  async getDashboard() {
    try {
      const response = await apiClient.get('/admin/dashboard')
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to load admin dashboard')
    } catch (err) {
      console.error('Error fetching admin dashboard:', err)
      throw err
    }
  },

  /**
   * Fetch all users with search, role/status filtering, and pagination
   */
  async getUsers({ role = 'all', status = 'all', search = '', page = 1, limit = 10 } = {}) {
    try {
      const params = new URLSearchParams()
      if (role && role !== 'all') params.set('role', role)
      if (status && status !== 'all') params.set('status', status)
      if (search && search.trim()) params.set('search', search.trim())
      if (page) params.set('page', page)
      if (limit) params.set('limit', limit)

      const response = await apiClient.get(`/admin/users?${params.toString()}`)
      if (response.data && response.data.success) {
        return {
          users: response.data.data,
          pagination: response.data.pagination,
          counts: response.data.counts,
        }
      }
      throw new Error(response.data?.message || 'Failed to fetch platform users')
    } catch (err) {
      console.error('Error fetching admin users:', err)
      throw err
    }
  },

  /**
   * Suspend a user account with a reason
   */
  async suspendUser(userId, reason) {
    try {
      const response = await apiClient.patch(`/admin/users/${userId}/suspend`, { reason })
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to suspend account')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to suspend account'
      const error = new Error(msg)
      error.status = err.response?.status
      throw error
    }
  },

  /**
   * Reactivate a suspended user account
   */
  async activateUser(userId) {
    try {
      const response = await apiClient.patch(`/admin/users/${userId}/activate`)
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to reactivate account')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reactivate account'
      const error = new Error(msg)
      error.status = err.response?.status
      throw error
    }
  },

  /**
   * Fetch job listings for moderation with status filter, search, and pagination
   */
  async getJobs({ status = 'all', search = '', page = 1, limit = 10 } = {}) {
    try {
      const params = new URLSearchParams()
      if (status && status !== 'all') params.set('status', status)
      if (search && search.trim()) params.set('search', search.trim())
      if (page) params.set('page', page)
      if (limit) params.set('limit', limit)

      const response = await apiClient.get(`/admin/jobs?${params.toString()}`)
      if (response.data && response.data.success) {
        return {
          jobs: response.data.data,
          pagination: response.data.pagination,
        }
      }
      throw new Error(response.data?.message || 'Failed to fetch job moderation queue')
    } catch (err) {
      console.error('Error fetching admin jobs:', err)
      throw err
    }
  },

  /**
   * Approve a job listing in the moderation queue
   */
  async approveJob(jobId) {
    try {
      const response = await apiClient.patch(`/admin/jobs/${jobId}/approve`)
      return response.data
    } catch (err) {
      console.error('Error approving job:', err)
      throw err
    }
  },

  /**
   * Remove a job listing
   */
  async removeJob(jobId, reason) {
    try {
      const response = await apiClient.delete(`/admin/jobs/${jobId}`, {
        data: { reason },
      })
      return response.data
    } catch (err) {
      console.error('Error removing job:', err)
      throw err
    }
  },

  /**
   * Fetch platform administrative audit logs
   */
  async getAuditLogs() {
    try {
      const response = await apiClient.get('/admin/audit-logs')
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to fetch audit logs')
    } catch (err) {
      console.error('Error fetching audit logs:', err)
      throw err
    }
  },

  /**
   * Fetch platform settings
   */
  async getSettings() {
    try {
      const response = await apiClient.get('/admin/settings')
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to fetch platform settings')
    } catch (err) {
      console.error('Error fetching settings:', err)
      throw err
    }
  },

  /**
   * Update platform parameters and moderation policies
   */
  async updateSettings(settings) {
    try {
      const response = await apiClient.put('/admin/settings', settings)
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to update platform settings')
    } catch (err) {
      console.error('Error updating settings:', err)
      throw err
    }
  },
}

