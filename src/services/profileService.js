import { apiClient } from './apiClient'

export const profileService = {
  /**
   * Fetches saved jobs with query parameters (search, tab type, sort)
   */
  async getSavedJobs({ search = '', type = 'all', sort = 'recent' } = {}) {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (type && type !== 'all') params.set('type', type)
      if (sort && sort !== 'recent') params.set('sort', sort)

      const response = await apiClient.get(`/student/saved-jobs?${params.toString()}`)
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to fetch saved opportunities')
    } catch (err) {
      console.error('Error fetching saved jobs:', err)
      throw err
    }
  },

  /**
   * Removes a job from saved jobs
   */
  async removeSavedJob(jobId) {
    try {
      const response = await apiClient.delete(`/student/saved-jobs/${jobId}`)
      return response.data
    } catch (err) {
      console.error('Error removing saved job:', err)
      throw err
    }
  },

  /**
   * Toggles save state for a job
   */
  async toggleSaveJob(jobId) {
    try {
      const response = await apiClient.post(`/student/jobs/${jobId}/save`)
      return response.data
    } catch (err) {
      console.error('Error toggling save job:', err)
      throw err
    }
  },

  /**
   * Fetches the complete student profile
   */
  async getProfile() {
    try {
      const response = await apiClient.get('/student/profile')
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to fetch student profile')
    } catch (err) {
      console.error('Error fetching student profile:', err)
      throw err
    }
  },

  /**
   * Updates student profile fields
   */
  async updateProfile(updates) {
    try {
      const response = await apiClient.put('/student/profile', updates)
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to update profile')
    } catch (err) {
      console.error('Error updating profile:', err)
      throw err
    }
  },

  /**
   * Fetches uploaded resumes
   */
  async getResumes() {
    try {
      const response = await apiClient.get('/student/resumes')
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to fetch resumes')
    } catch (err) {
      console.error('Error fetching resumes:', err)
      throw err
    }
  },

  /**
   * Uploads a new resume to Cloudinary storage
   */
  async uploadResume({ name, fileSize, fileType, fileData, isDefault }) {
    try {
      const response = await apiClient.post('/student/resumes', {
        name,
        fileSize,
        fileType,
        fileData,
        isDefault,
      })
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to upload resume')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Resume upload failed'
      const error = new Error(message)
      error.status = err.response?.status
      throw error
    }
  },

  /**
   * Deletes an uploaded resume
   */
  async deleteResume(resumeId) {
    try {
      const response = await apiClient.delete(`/student/resumes/${resumeId}`)
      return response.data
    } catch (err) {
      console.error('Error deleting resume:', err)
      throw err
    }
  },

  /**
   * Sets a resume as the default
   */
  async setDefaultResume(resumeId) {
    try {
      const response = await apiClient.patch(`/student/resumes/${resumeId}/default`)
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to set default resume')
    } catch (err) {
      console.error('Error setting default resume:', err)
      throw err
    }
  },
}

