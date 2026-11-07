import { useState, useEffect } from 'react'
import { AuthContext } from './authContextInstance'
import { authService } from '../services/authService'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('skillbridge_user')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Guard against obsolete demo student data in localStorage
        if (parsed?.id === 'usr_student_aanya' || parsed?.email === 'aanya.sharma@email.com') {
          localStorage.removeItem('skillbridge_user')
          localStorage.removeItem('skillbridge_token')
          return null
        }
        return parsed
      }
    } catch {
      // invalid json
    }
    // New visitors MUST start as unauthenticated (null)
    return null
  })

  const [loading, setLoading] = useState(false)

  // Verify active session with backend API on mount
  useEffect(() => {
    let isMounted = true
    const token = localStorage.getItem('skillbridge_token')
    if (token) {
      authService
        .getCurrentUser()
        .then((res) => {
          if (isMounted && res.success && res.user) {
            // Guard against obsolete demo student
            if (res.user.id === 'usr_student_aanya' || res.user.email === 'aanya.sharma@email.com') {
              localStorage.removeItem('skillbridge_token')
              localStorage.removeItem('skillbridge_user')
              setUser(null)
            } else {
              setUser(res.user)
              localStorage.setItem('skillbridge_user', JSON.stringify(res.user))
            }
          }
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            localStorage.removeItem('skillbridge_token')
            localStorage.removeItem('skillbridge_user')
            setUser(null)
          }
        })
    }
    return () => {
      isMounted = false
    }
  }, [])

  // Real backend login with error propagation to UI
  const login = async (credentials, rememberMe = true) => {
    setLoading(true)
    try {
      const res = await authService.login(credentials)
      if (res.success && res.user) {
        setUser(res.user)
        if (rememberMe) {
          localStorage.setItem('skillbridge_token', res.token)
          localStorage.setItem('skillbridge_user', JSON.stringify(res.user))
        } else {
          sessionStorage.setItem('skillbridge_token', res.token)
          sessionStorage.setItem('skillbridge_user', JSON.stringify(res.user))
        }
        return { success: true, user: res.user }
      }
      return { success: false, message: res.message || 'Login failed' }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to connect to authentication server'
      return { success: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  // Real backend registration
  const register = async (userData) => {
    setLoading(true)
    try {
      const res = await authService.register(userData)
      if (res.success && res.user) {
        setUser(res.user)
        localStorage.setItem('skillbridge_token', res.token)
        localStorage.setItem('skillbridge_user', JSON.stringify(res.user))
        return { success: true, user: res.user }
      }
      return { success: false, message: res.message || 'Registration failed' }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed'
      return { success: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await authService.logout()
    } finally {
      localStorage.removeItem('skillbridge_token')
      localStorage.removeItem('skillbridge_user')
      sessionStorage.removeItem('skillbridge_token')
      sessionStorage.removeItem('skillbridge_user')
      setUser(null)
      setLoading(false)
    }
  }

  const deleteAccount = async ({ password, confirmation }) => {
    setLoading(true)
    try {
      const res = await authService.deleteAccount({ password, confirmation })
      localStorage.removeItem('skillbridge_token')
      localStorage.removeItem('skillbridge_user')
      sessionStorage.removeItem('skillbridge_token')
      sessionStorage.removeItem('skillbridge_user')
      setUser(null)
      return {
        success: true,
        message: res.message || 'Your SkillBridge account has been permanently deleted.',
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Unable to delete your account right now. Please try again later.'
      return { success: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  // Role switching is strictly disabled; roles are server-verified from DB
  const switchRole = (role) => {
    if (role === 'logout') {
      logout()
    } else {
      console.warn('Manual role switching has been disabled for security. Roles are strictly bound to server-authenticated sessions.')
    }
  }

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isStudent: user?.role === 'student',
    isRecruiter: user?.role === 'recruiter',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    deleteAccount,
    switchRole,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
