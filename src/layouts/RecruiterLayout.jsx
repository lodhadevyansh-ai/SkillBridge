import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Building,
  FileText,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Settings,
  Users,
  TrendingUp,
  X,
} from 'lucide-react'
import { Sidebar, TopNav, MobileNav } from '../components/navigation'
import { WorkspaceHeader } from '../components/shared/WorkspaceHeader'
import { useAuth } from '../hooks/useAuth'
import { recruiterService } from '../services/recruiterService'

export function RecruiterLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [liveStats, setLiveStats] = useState(null)

  // Fetch authentic live recruiter statistics to drive sidebar counts dynamically
  useEffect(() => {
    let isMounted = true
    recruiterService
      .getDashboard()
      .then((data) => {
        if (isMounted && data?.stats) {
          setLiveStats(data.stats)
        }
      })
      .catch(() => {
        // Safe fallback - zero or empty counts, never fake hardcoded data
      })
    return () => {
      isMounted = false
    }
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Logout error:', err)
      navigate('/', { replace: true })
    }
  }

  // Derive dynamic counts from real database stats
  const jobsCount = liveStats?.openRoles?.value ?? 0
  const appsCount = liveStats?.totalApplicants?.value ?? 0
  const shortlistedCount = liveStats?.shortlisted?.value ?? 0

  const navItems = [
    { id: '/recruiter/dashboard', label: 'Overview', icon: LayoutDashboard },
    {
      id: '/recruiter/jobs',
      label: 'My Jobs',
      icon: Briefcase,
      badge: jobsCount > 0 ? String(jobsCount) : undefined,
    },
    { id: '/recruiter/jobs/create', label: 'Post a Job', icon: PlusCircle },
    {
      id: '/recruiter/applications',
      label: 'Applications',
      icon: FileText,
      badge: appsCount > 0 ? String(appsCount) : undefined,
    },
    {
      id: '/recruiter/candidates',
      label: 'Candidates',
      icon: Users,
      badge: shortlistedCount > 0 ? String(shortlistedCount) : undefined,
    },
    { id: '/recruiter/analytics', label: 'Analytics', icon: TrendingUp },
    { id: '/recruiter/profile', label: 'Profile', icon: Building },
    { id: '/recruiter/settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut, isDanger: true },
  ]

  const mobileTabs = [
    { id: '/recruiter/dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: '/recruiter/jobs', label: 'Jobs', icon: Briefcase },
    { id: '/recruiter/candidates', label: 'Candidates', icon: Users },
    { id: '/recruiter/applications', label: 'Apps', icon: FileText },
    { id: '/recruiter/profile', label: 'Profile', icon: Building },
  ]

  const handleNavigate = (path) => {
    if (path === 'logout') {
      handleLogout()
    } else {
      navigate(path)
    }
  }

  const currentTitle =
    navItems.find((item) => item.id === location.pathname)?.label || 'Recruiter Workspace'

  const companyName = user?.companyName || user?.company || 'Company'
  const recruiterUserObj = user
    ? {
        name: user.fullName || user.name || 'Recruiter',
        role: `Recruiter · ${companyName}`,
        initials: user.initials || 'RC',
      }
    : null

  const motivationalCardProps = jobsCount > 0
    ? {
        title: 'Review your candidate pipeline.',
        description: appsCount > 0
          ? `${appsCount} candidate application${appsCount === 1 ? '' : 's'} received across your roles.`
          : 'Your job postings are live and accepting candidate applications.',
        linkText: 'Review candidates →',
        onLinkClick: () => navigate('/recruiter/candidates'),
      }
    : {
        title: 'Your next great hire is waiting.',
        description: 'Post your open positions to start receiving qualified student applications.',
        linkText: 'Post a role →',
        onLinkClick: () => navigate('/recruiter/jobs/create'),
      }

  return (
    <div className="h-screen bg-[#F8FAFC] dark:bg-[#0B0D14] flex flex-col font-sans transition-colors overflow-hidden">
      <WorkspaceHeader />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar
          workspaceLabel="RECRUITER WORKSPACE"
          navItems={navItems}
          activePath={location.pathname}
          onNavigate={handleNavigate}
          user={recruiterUserObj}
          showMotivationalCard={true}
          motivationalCardProps={motivationalCardProps}
          className="hidden md:flex h-full shrink-0 z-30"
        />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto pb-20 md:pb-10">
          <TopNav
            breadcrumbItems={[
              { label: 'Recruiter workspace', href: '/recruiter/dashboard' },
              { label: currentTitle },
            ]}
            userInitials={user?.initials || 'RC'}
            onUserMenuClick={() => navigate('/recruiter/profile')}
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
              workspaceLabel="RECRUITER WORKSPACE"
              navItems={navItems}
              activePath={location.pathname}
              onNavigate={(path) => {
                setIsMobileDrawerOpen(false)
                handleNavigate(path)
              }}
              user={recruiterUserObj}
              showMotivationalCard={true}
              motivationalCardProps={{
                ...motivationalCardProps,
                onLinkClick: () => {
                  setIsMobileDrawerOpen(false)
                  motivationalCardProps.onLinkClick()
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
