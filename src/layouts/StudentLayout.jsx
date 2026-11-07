import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bookmark,
  Briefcase,
  Compass,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  BarChart3,
  X,
} from 'lucide-react'
import { Sidebar, TopNav, MobileNav } from '../components/navigation'
import { WorkspaceHeader } from '../components/shared/WorkspaceHeader'
import { useAuth } from '../hooks/useAuth'

export function StudentLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  const navItems = [
    { id: '/student/dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: '/student/jobs', label: 'Find Jobs', icon: Compass },
    { id: '/student/applications', label: 'My Applications', icon: Briefcase },
    { id: '/student/analytics', label: 'Analytics', icon: BarChart3 },
    { id: '/student/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
    { id: '/student/profile', label: 'My Profile', icon: User },
    { id: '/student/settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut, isDanger: true },
  ]

  const mobileTabs = [
    { id: '/student/dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: '/student/jobs', label: 'Find Jobs', icon: Compass },
    { id: '/student/applications', label: 'Applications', icon: Briefcase },
    { id: '/student/saved-jobs', label: 'Saved', icon: Bookmark },
    { id: '/student/profile', label: 'Profile', icon: User },
  ]

  const handleNavigate = (path) => {
    if (path === 'logout') {
      logout()
      navigate('/', { replace: true })
      return
    }
    navigate(path)
  }

  // Compute breadcrumbs dynamically
  const pathSegments = location.pathname.split('/').filter(Boolean)
  const currentTitle =
    navItems.find((item) => item.id === location.pathname)?.label ||
    (pathSegments.length > 1 ? pathSegments[pathSegments.length - 1].replace(/-/g, ' ') : 'Workspace')

  return (
    <div className="h-screen bg-[#F8FAFC] dark:bg-[#0B0D14] flex flex-col font-sans transition-colors overflow-hidden">
      <WorkspaceHeader />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar
          workspaceLabel="STUDENT WORKSPACE"
          navItems={navItems}
          activePath={location.pathname}
          onNavigate={handleNavigate}
          user={user ? { name: user.fullName || user.name || 'Student', role: 'Student account', initials: user.initials || 'ST' } : null}
          showMotivationalCard={true}
          motivationalCardProps={{
            title: 'Your next chapter starts here.',
            description: 'Complete your profile to get better matches.',
            linkText: 'Complete profile →',
            onLinkClick: () => navigate('/student/profile'),
          }}
          className="hidden md:flex h-full shrink-0 z-30"
        />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto pb-20 md:pb-10">
          <TopNav
            breadcrumbItems={[
              { label: 'Student workspace', href: '/student/dashboard' },
              { label: currentTitle },
            ]}
            userInitials={user?.initials || 'AS'}
            onUserMenuClick={() => navigate('/student/profile')}
            onMobileMenuToggle={() => setIsMobileDrawerOpen(true)}
            className="shrink-0 sticky top-0 z-20"
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-[#161928] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="absolute top-4 right-3 z-20">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              workspaceLabel="STUDENT WORKSPACE"
              navItems={navItems}
              activePath={location.pathname}
              onNavigate={(path) => {
                setIsMobileDrawerOpen(false)
                handleNavigate(path)
              }}
              user={user ? { name: user.fullName || user.name || 'Student', role: 'Student account', initials: user.initials || 'ST' } : null}
              showMotivationalCard={true}
              motivationalCardProps={{
                title: 'Your next chapter starts here.',
                description: 'Complete your profile to get better matches.',
                linkText: 'Complete profile →',
                onLinkClick: () => {
                  setIsMobileDrawerOpen(false)
                  navigate('/student/profile')
                },
              }}
              className="w-full h-full flex"
            />
          </div>
        </div>
      )}

      <MobileNav
        tabs={mobileTabs}
        activeTab={location.pathname}
        onTabChange={handleNavigate}
      />
    </div>
  )
}

