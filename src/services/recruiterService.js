import { apiClient } from './apiClient'

export const recruiterService = {
  /**
   * Fetches aggregated dashboard metrics, trends, pipeline, jobs, and candidates for current recruiter
   */
  async getDashboard() {
    try {
      const response = await apiClient.get('/recruiter/dashboard')
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to load recruiter dashboard')
    } catch (err) {
      console.error('Error fetching recruiter dashboard:', err)
      throw err
    }
  },

  /**
   * Fetches jobs owned by current recruiter with optional search, status filtering, and pagination
   */
  async getJobs({ search = '', status = 'all', page = 1, limit = 10 } = {}) {
    try {
      const params = new URLSearchParams()
      if (search && search.trim()) params.set('search', search.trim())
      if (status && status !== 'all') params.set('status', status)
      if (page) params.set('page', page)
      if (limit) params.set('limit', limit)

      const response = await apiClient.get(`/recruiter/jobs?${params.toString()}`)
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to fetch recruiter jobs')
    } catch (err) {
      console.error('Error fetching recruiter jobs:', err)
      throw err
    }
  },

  /**
   * Fetches single recruiter job by ID with candidate applications
   */
  async getJobById(jobId) {
    try {
      const response = await apiClient.get(`/recruiter/jobs/${jobId}`)
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to fetch job details')
    } catch (err) {
      console.error('Error fetching job details:', err)
      throw err
    }
  },

  /**
   * Creates a new job posting for current recruiter
   */
  async createJob(jobData) {
    try {
      const response = await apiClient.post('/recruiter/jobs', jobData)
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to create job posting')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create job posting'
      const error = new Error(msg)
      error.status = err.response?.status
      throw error
    }
  },

  /**
   * Updates an existing job posting
   */
  async updateJob(jobId, jobData) {
    try {
      const response = await apiClient.put(`/recruiter/jobs/${jobId}`, jobData)
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to update job posting')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update job posting'
      const error = new Error(msg)
      error.status = err.response?.status
      throw error
    }
  },

  /**
   * Publishes a draft or closed job
   */
  async publishJob(jobId) {
    try {
      const response = await apiClient.patch(`/recruiter/jobs/${jobId}/publish`)
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to publish job')
    } catch (err) {
      console.error('Error publishing job:', err)
      throw err
    }
  },

  /**
   * Closes an active job
   */
  async closeJob(jobId) {
    try {
      const response = await apiClient.patch(`/recruiter/jobs/${jobId}/close`)
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to close job')
    } catch (err) {
      console.error('Error closing job:', err)
      throw err
    }
  },

  /**
   * Deletes a recruiter job
   */
  async deleteJob(jobId) {
    try {
      const response = await apiClient.delete(`/recruiter/jobs/${jobId}`)
      return response.data
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete job'
      const error = new Error(msg)
      error.status = err.response?.status
      throw error
    }
  },

  /**
   * Fetches candidates applying to recruiter's jobs
   */
  async getCandidates({ jobId, stage, search } = {}) {
    try {
      const params = new URLSearchParams()
      if (jobId && jobId !== 'all') params.set('jobId', jobId)
      if (stage && stage !== 'all') params.set('stage', stage)
      if (search && search.trim()) params.set('search', search.trim())

      const response = await apiClient.get(`/recruiter/candidates?${params.toString()}`)
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to fetch candidates')
    } catch (err) {
      console.error('Error fetching candidates:', err)
      throw err
    }
  },

  /**
   * Fetches single candidate application by ID
   */
  async getCandidateById(applicationId) {
    try {
      const response = await apiClient.get(`/recruiter/candidates/${applicationId}`)
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to fetch candidate details')
    } catch (err) {
      console.error('Error fetching candidate by id:', err)
      throw err
    }
  },

  /**
   * Moves candidate to a new stage in recruiter's pipeline with optional note
   */
  async updateCandidateStage(applicationId, stage, note = '') {
    try {
      const response = await apiClient.patch(`/recruiter/candidates/${applicationId}/stage`, { stage, note })
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to update candidate stage')
    } catch (err) {
      console.error('Error updating candidate stage:', err)
      throw err
    }
  },

  /**
   * Schedules or updates an interview for a candidate
   */
  async scheduleInterview(applicationId, interviewData) {
    try {
      const response = await apiClient.post(`/recruiter/candidates/${applicationId}/interview`, interviewData)
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to schedule interview')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to schedule interview'
      const error = new Error(msg)
      error.status = err.response?.status
      throw error
    }
  },

  /**
   * Adds an internal recruiter note to a candidate
   */
  async addCandidateNote(applicationId, note) {
    try {
      const response = await apiClient.post(`/recruiter/candidates/${applicationId}/notes`, { note })
      if (response.data && response.data.success) {
        return response.data
      }
      throw new Error(response.data?.message || 'Failed to add note')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to add note'
      const error = new Error(msg)
      error.status = err.response?.status
      throw error
    }
  },

  /**
   * Fetches dedicated dashboard stats for current recruiter
   */
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/recruiter/dashboard/stats')
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to fetch dashboard stats')
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      throw err
    }
  },

  /**
   * Fetches candidate applications for current recruiter (alias of getCandidates)
   */
  async getApplications(params = {}) {
    return this.getCandidates(params)
  },

  /**
   * Fetches authenticated recruiter's company profile
   */
  async getProfile() {
    try {
      const response = await apiClient.get('/recruiter/profile')
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to fetch company profile')
    } catch (err) {
      console.error('Error fetching company profile:', err)
      throw err
    }
  },

  /**
   * Updates authenticated recruiter's company profile
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/recruiter/profile', profileData)
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to update company profile')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update company profile'
      const error = new Error(msg)
      error.status = err.response?.status
      throw error
    }
  },
}
