import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Building,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { Sidebar, TopNav, MobileNav } from '../components/navigation'
import { WorkspaceHeader } from '../components/shared/WorkspaceHeader'
import { useAuth } from '../hooks/useAuth'

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  const navItems = [
    { id: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: '/admin/users', label: 'User Management', icon: Users },
    { id: '/admin/students', label: 'Student Management', icon: GraduationCap },
    { id: '/admin/recruiters', label: 'Recruiter Management', icon: Building },
    { id: '/admin/jobs', label: 'Job Management', icon: ShieldCheck },
    { id: '/admin/reports', label: 'Reports', icon: FileText },
    { id: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { id: '/admin/settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut, isDanger: true },
  ]

  const mobileTabs = [
    { id: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: '/admin/users', label: 'Users', icon: Users },
    { id: '/admin/jobs', label: 'Jobs', icon: ShieldCheck },
    { id: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { id: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  const handleNavigate = async (path) => {
    if (path === 'logout') {
      try {
        await logout()
        navigate('/', { replace: true })
      } catch {
        navigate('/', { replace: true })
      }
      return
    }
    navigate(path)
  }

  const currentTitle =
    navItems.find((item) => item.id === location.pathname)?.label || 'Administration'

  const adminUserObj = user
    ? {
        name: user.fullName || user.name || 'Platform Administrator',
        role: 'Platform Admin',
        initials: user.initials || 'PA',
      }
    : null

  return (
    <div className="h-screen bg-[#F8FAFC] dark:bg-[#0B0D14] flex flex-col font-sans transition-colors overflow-hidden">
      <WorkspaceHeader />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar
          workspaceLabel="ADMIN WORKSPACE"
          navItems={navItems}
          activePath={location.pathname}
          onNavigate={handleNavigate}
          user={adminUserObj}
          showMotivationalCard={true}
          motivationalCardProps={{
            title: 'Platform moderation active',
            description: 'Monitor user integrity, audit activity logs and moderate listings.',
            linkText: 'Moderate listings →',
            onLinkClick: () => navigate('/admin/jobs'),
          }}
          className="hidden md:flex h-full shrink-0 z-30"
        />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto pb-20 md:pb-10">
          <TopNav
            breadcrumbItems={[
              { label: 'Admin workspace', href: '/admin/dashboard' },
              { label: currentTitle },
            ]}
            userInitials={user?.initials || 'PA'}
            onUserMenuClick={() => navigate('/admin/settings')}
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
              workspaceLabel="ADMIN WORKSPACE"
              navItems={navItems}
              activePath={location.pathname}
              onNavigate={(path) => {
                setIsMobileDrawerOpen(false)
                handleNavigate(path)
              }}
              user={adminUserObj}
              showMotivationalCard={true}
              motivationalCardProps={{
                title: 'Platform moderation active',
                description: 'Monitor user integrity, audit activity logs and moderate listings.',
                linkText: 'Moderate listings →',
                onLinkClick: () => {
                  setIsMobileDrawerOpen(false)
                  navigate('/admin/jobs')
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
        onTabChange={(path) => navigate(path)}
      />
    </div>
  )
}
