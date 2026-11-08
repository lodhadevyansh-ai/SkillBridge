
import axios from 'axios'

// Standardized API base URL resolution with robust trailing slash and /api normalization
const resolveApiBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL

  if (!envUrl) {
    return import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'
  }

  // Strip trailing slashes
  envUrl = envUrl.trim().replace(/\/+$/, '')

  // If provided URL does not already end with /api, append /api for clean endpoint resolution
  if (!envUrl.endsWith('/api')) {
    return `${envUrl}/api`
  }

  return envUrl
}

const API_BASE_URL = resolveApiBaseUrl()

// Create Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
  },

  timeout: 30000,
})

// Request interceptor
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

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      const code = error.response.data?.code

      if (code === 'TOKEN_EXPIRED') {
        localStorage.removeItem('skillbridge_token')
        localStorage.removeItem('skillbridge_user')
      }
    }

    console.error(
      'API Error:',
      error.response?.status,
      error.config?.url,
      error.response?.data || error.message
    )

    return Promise.reject(error)
  }
)

export default apiClient
