import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Briefcase,
  Compass,
  LogOut,
  Menu,
  Share2,
  X,
} from 'lucide-react'
import { Button } from '../components/ui'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { useAuth } from '../hooks/useAuth'

export function PublicLayout() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const scrollToSection = (id) => {
    setMobileMenuOpen(false)
    if (location.pathname !== '/') {
      navigate(`/#${id}`)
      setTimeout(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
      return
    }

    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Centralized job navigation check
  const handleExploreJobs = () => {
    setMobileMenuOpen(false)
    if (!user) {
      // Unauthenticated visitor -> Redirect to login with return target
      navigate('/login', { state: { from: { pathname: '/student/jobs' } } })
      return
    }

    if (user.role === 'student') {
      navigate('/student/jobs')
    } else if (user.role === 'recruiter') {
      navigate('/recruiter/jobs')
    } else if (user.role === 'admin') {
      navigate('/admin/jobs')
    }
  }

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    await logout()
    navigate('/')
  }

  const displayName = user?.fullName || user?.name || 'User'
  const displayInitials = user?.initials || (displayName ? displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'U')

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0D14] flex flex-col font-sans transition-colors">
      {/* Public Top Navbar - Modern, High-End Recruitment Header */}
      <header className="h-16 px-4 sm:px-8 lg:px-12 border-b border-slate-200/80 dark:border-[#282D4A] bg-white/95 dark:bg-[#161928]/95 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between transition-colors">
        {/* LEFT: SkillBridge Logo & Branding */}
        <Link to="/" className="flex items-center gap-2.5 no-underline group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Share2 className="w-4 h-4 transform rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              SkillBridge
            </span>
          </div>
        </Link>

        {/* CENTER: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={handleExploreJobs}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1"
          >
            Explore Jobs
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('companies')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1"
          >
            Companies
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('benefits-students')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1"
          >
            For Students
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('benefits-recruiters')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1"
          >
            For Recruiters
          </button>
        </nav>

        {/* RIGHT: Theme Toggle & Auth State Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Light/Dark Mode Toggle */}
          <ThemeToggle />

          {!user ? (
            /* Logged Out State: Login and Register buttons */
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-xs"
                >
                  Register
                </Button>
              </Link>
            </div>
          ) : (
            /* Authenticated State: User Account Badge, Workspace shortcut, and Logout */
            <div className="hidden sm:flex items-center gap-2.5">
              <Link to={`/${user.role}/dashboard`}>
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {displayInitials}
                  </div>
                  <span className="truncate max-w-[120px]">{displayName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold uppercase">
                    {user.role}
                  </span>
                </button>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                title="Logout from SkillBridge"
                aria-label="Logout"
                className="p-2 rounded-xl text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-900/50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bg-white dark:bg-[#161928] border-b border-slate-200 dark:border-[#282D4A] shadow-xl z-30 p-5 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <button
              type="button"
              onClick={handleExploreJobs}
              className="text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer text-indigo-600 dark:text-indigo-400"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Jobs</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('companies')}
              className="text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>Companies</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('benefits-students')}
              className="text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              For Students
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('benefits-recruiters')}
              className="text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              For Recruiters
            </button>
          </nav>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            {!user ? (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="primary"
                    className="w-full justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-bold">
                    {displayInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">{user.role} workspace</p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate(`/${user.role}/dashboard`)
                  }}
                >
                  Open {user.role} workspace →
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Page Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Complete Professional Footer */}
      <footer className="border-t border-slate-200/80 dark:border-[#282D4A] bg-white dark:bg-[#161928] pt-14 pb-8 px-6 lg:px-12 transition-colors">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2.5 no-underline">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
                  <Share2 className="w-4 h-4 transform rotate-45" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  SkillBridge
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Empowering the next generation of builders, thinkers, and designers to transition from campus ambition to career reality.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All systems operational · Zero unpaid internships guarantee</span>
              </div>
            </div>

            {/* Col 2: Candidates */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                For Students
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <button type="button" onClick={handleExploreJobs} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                    Explore Opportunities
                  </button>
                </li>
                <li>
                  <button type="button" onClick={handleExploreJobs} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                    Verified Internships
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollToSection('benefits-students')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                    Student Benefits
                  </button>
                </li>
                <li>
                  <Link to="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Create Student Profile
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Employers */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                For Employers
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <button type="button" onClick={() => scrollToSection('benefits-recruiters')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                    Post an Internship
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollToSection('benefits-recruiters')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                    Campus Talent Pipelines
                  </button>
                </li>
                <li>
                  <Link to="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Recruiter Sign Up
                  </Link>
                </li>
                <li>
                  <button type="button" onClick={() => scrollToSection('companies')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                    Hiring Partners
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Platform & Trust */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <button type="button" onClick={() => scrollToSection('how-it-works')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                    How it Works
                  </button>
                </li>
                <li>
                  <a href="#compliance" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Security & Trust
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} SkillBridge Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#terms" className="hover:underline">
                Terms
              </a>
              <a href="#privacy" className="hover:underline">
                Privacy
              </a>
              <a href="#cookies" className="hover:underline">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
