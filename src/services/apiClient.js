import axios from 'axios'

/**
 * Standardized API base URL resolution.
 * In production (Single-Service Render Deployment), all frontend requests use the relative '/api' endpoint
 * on the exact same domain, eliminating separate origin dependencies and CORS overhead.
 * In development, defaults to 'http://localhost:5000/api' or custom VITE_API_URL.
 */
const resolveApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    return '/api'
  }

  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl) {
    const cleaned = envUrl.trim().replace(/\/+$/, '')
    return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`
  }

  return 'http://localhost:5000/api'
}

const API_BASE_URL = resolveApiBaseUrl()

// Create centralized Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
  },

  timeout: 30000,
})

// Request interceptor: attach bearer token from localStorage
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

// Response interceptor: handle 401 token expiration and session invalidation
apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      const code = error.response.data?.code

      if (code === 'TOKEN_EXPIRED' || code === 'TOKEN_REVOKED') {
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
