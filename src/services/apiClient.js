import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Attach JWT token from localStorage if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillbridge_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: Handle session expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const code = error.response.data?.code
      if (code === 'TOKEN_EXPIRED') {
        localStorage.removeItem('skillbridge_token')
        localStorage.removeItem('skillbridge_user')
      }
    }
    return Promise.reject(error)
  }
)

