import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LogOut, Sparkles } from 'lucide-react'

export function WorkspaceHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Dynamically determine workspace title based strictly on authenticated role
  const roleTitleMap = {
    student: 'Student Workspace',
    recruiter: 'Recruiter Workspace',
    admin: 'Admin Workspace',
  }

  const normalizedRole = (user?.role || '').toLowerCase()
  const workspaceTitle = roleTitleMap[normalizedRole] || (normalizedRole ? `${normalizedRole.toUpperCase()} Workspace` : 'SkillBridge Workspace')
  const displayName = user ? (user.fullName || user.name || (user.email ? user.email.split('@')[0] : 'User')) : 'User'

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/', { replace: true })
    } catch {
      navigate('/', { replace: true })
    }
  }

  return (
    <header className="bg-slate-900 text-white text-xs px-4 sm:px-6 h-10 border-b border-slate-800 flex items-center justify-between gap-3 sticky top-0 z-40 shrink-0 shadow-xs">
      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-200 tracking-tight">SkillBridge Workspace</span>
        </div>

        <span className="text-slate-600 font-light select-none">|</span>

        <span className="font-semibold text-indigo-300 shrink-0">
          {workspaceTitle}
        </span>

        {user && (
          <>
            <span className="text-slate-600 font-light select-none">|</span>
            <span className="text-slate-400 truncate">
              Signed in as <span className="font-medium text-slate-200">{displayName}</span>
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-slate-600 font-light select-none hidden sm:inline">|</span>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-red-950/60 text-red-300 hover:bg-red-900/60 hover:text-white border border-red-800/50 transition-colors cursor-pointer"
          title="Sign out of your workspace"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  )
}

// Export DevRoleSwitcher as alias for backward compatibility
export const DevRoleSwitcher = WorkspaceHeader
