import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingState } from '../components/ui/Loading'

export function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingState message="Verifying authentication..." className="min-h-screen" />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to user's assigned workspace if they lack role permissions
    const defaultWorkspace = `/${user.role}/dashboard`
    return <Navigate to={defaultWorkspace} replace />
  }

  return children
}

