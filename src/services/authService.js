import { apiClient } from './apiClient'

export const authService = {
  async register(data) {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  async getCurrentUser() {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  async logout() {
    try {
      const response = await apiClient.post('/auth/logout')
      return response.data
    } catch {
      // Ignore network errors on logout
      return { success: true }
    }
  },

  async deleteAccount(payload) {
    const response = await apiClient.delete('/auth/account', {
      data: payload,
    })
    return response.data
  },
}

