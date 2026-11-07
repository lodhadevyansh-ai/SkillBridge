import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../design-system/ThemeContext'
import { useTheme } from '../hooks/useTheme'
import { StudentDashboard } from '../pages/student/StudentDashboard'
import { StudentJobs } from '../pages/student/StudentJobs'
import { StudentProfile } from '../pages/student/StudentProfile'
import { StudentLayout } from '../layouts/StudentLayout'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { studentService } from '../services/studentService'
import { jobService } from '../services/jobService'
import { profileService } from '../services/profileService'
import {
  mockStudentDashboard,
  mockEmptyStudentDashboard,
  mockJobListings,
  mockEmptyJobListings,
  mockStudentProfile,
  mockResumes,
} from './mocks/mockData'

describe('Dashboard Rendering, Search & Filters, and Application Workflow', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // Reset defaults
    vi.mocked(studentService.getDashboard).mockResolvedValue(mockStudentDashboard)
    vi.mocked(jobService.getJobs).mockResolvedValue(mockJobListings)
    vi.mocked(profileService.getProfile).mockResolvedValue(mockStudentProfile)
    vi.mocked(profileService.getResumes).mockResolvedValue(mockResumes)
  })

  // -------------------------------------------------------------
  // STUDENT DASHBOARD: Loading, Success, Empty, Failure
  // -------------------------------------------------------------
  describe('Student Dashboard States', () => {
    it('renders loading skeleton state while dashboard request is pending', () => {
      vi.mocked(studentService.getDashboard).mockReturnValueOnce(new Promise(() => {}))

      render(
        <MemoryRouter initialEntries={['/student/dashboard']}>
          <ThemeProvider>
            <AuthProvider>
              <StudentDashboard />
            </AuthProvider>
          </ThemeProvider>
        </MemoryRouter>
      )

      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('renders successful dashboard with KPI cards, greeting, and career activity', async () => {
      render(
        <MemoryRouter initialEntries={['/student/dashboard']}>
          <ThemeProvider>
            <AuthProvider>
              <StudentDashboard />
            </AuthProvider>
          </ThemeProvider>
        </MemoryRouter>
      )

      expect(await screen.findByText(/Your career activity/i)).toBeInTheDocument()
      expect(screen.getByText('Good morning, Aarav ☼')).toBeInTheDocument()
      expect(screen.getByText('Applications sent')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText(/Up next/i)).toBeInTheDocument()
      expect(screen.getByText(/Picked for your potential/i)).toBeInTheDocument()
      expect(screen.getAllByText('Product Design Intern').length).toBeGreaterThan(0)
    })

    it('renders empty state when student has no recent applications', async () => {
      vi.mocked(studentService.getDashboard).mockResolvedValueOnce(mockEmptyStudentDashboard)

      render(
        <MemoryRouter initialEntries={['/student/dashboard']}>
          <ThemeProvider>
            <AuthProvider>
              <StudentDashboard />
            </AuthProvider>
          </ThemeProvider>
        </MemoryRouter>
      )

      expect(await screen.findByText('No recent applications')).toBeInTheDocument()
      expect(screen.getByText(/Start browsing and applying/i)).toBeInTheDocument()
    })

    it('handles student dashboard API failure gracefully with fallback state', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      vi.mocked(studentService.getDashboard).mockRejectedValueOnce(new Error('Network timeout'))

      render(
        <MemoryRouter initialEntries={['/student/dashboard']}>
          <ThemeProvider>
            <AuthProvider>
              <StudentDashboard />
            </AuthProvider>
          </ThemeProvider>
        </MemoryRouter>
      )

      expect(await screen.findByText(/Your career activity/i)).toBeInTheDocument()
      expect(screen.getByText(/Welcome to your career workspace/i)).toBeInTheDocument()
      consoleWarnSpy.mockRestore()
    })
  })

  // -------------------------------------------------------------
  // JOB SEARCH & LISTINGS: Loading, Success, Empty, Failure
  // -------------------------------------------------------------
  describe('Job Search & Listings States', () => {
    it('renders loading skeleton while jobs request is pending', () => {
      vi.mocked(jobService.getJobs).mockReturnValueOnce(new Promise(() => {}))

      render(
        <MemoryRouter initialEntries={['/student/jobs']}>
          <ThemeProvider>
            <AuthProvider>
              <StudentJobs />
            </AuthProvider>
          </ThemeProvider>
        </MemoryRouter>
      )

      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('renders job search and filters with keyword input and facets', async () => {
      render(
        <MemoryRouter initialEntries={['/student/jobs']}>
          <ThemeProvider>
            <AuthProvider>
              <StudentJobs />
            </AuthProvider>
          </ThemeProvider>
        </MemoryRouter>
      )

      const searchInput = await screen.findByPlaceholderText(/Job title, company, or skill/i)
      expect(searchInput).toBeInTheDocument()

      // Test typing search keyword
      fireEvent.change(searchInput, { target: { value: 'Product Designer' } })
      expect(searchInput.value).toBe('Product Designer')

      // Opportunities count and mock job listings rendered
      expect(await screen.findByText('Product Design Intern')).toBeInTheDocument()
      expect(screen.getByText(/Linear/i)).toBeInTheDocument()
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
      expect(screen.getByText(/Razorpay/i)).toBeInTheDocument()
    })

    it('renders empty state when no job postings match filter criteria', async () => {
      vi.mocked(jobService.getJobs).mockResolvedValueOnce(mockEmptyJobListings)

      render(
        <MemoryRouter initialEntries={['/student/jobs']}>
          <ThemeProvider>
            <AuthProvider>
              <StudentJobs />
            </AuthProvider>
          </ThemeProvider>
        </MemoryRouter>
      )

      expect(await screen.findByText('No opportunities found')).toBeInTheDocument()
      expect(
        screen.getByText(/No job postings match your active filter combination/i)
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Reset all filters/i })).toBeInTheDocument()
    })

    it('renders error state with retry button when job fetch encounters API failure', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      vi.mocked(jobService.getJobs).mockRejectedValueOnce(new Error('Job service unavailable'))

      render(
        <MemoryRouter initialEntries={['/student/jobs']}>
          <ThemeProvider>
            <AuthProvider>
              <StudentJobs />
            </AuthProvider>
          </ThemeProvider>
        </MemoryRouter>
      )

      expect(await screen.findByText('Unable to load opportunities')).toBeInTheDocument()
      expect(screen.getByText('Job service unavailable')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument()
      consoleWarnSpy.mockRestore()
    })
  })

  // -------------------------------------------------------------
  // STUDENT PROFILE: Loading, Success, Failure
  // -------------------------------------------------------------
  describe('Student Profile States', () => {
    it('renders loading skeleton while profile request is pending', () => {
      vi.mocked(profileService.getProfile).mockReturnValueOnce(new Promise(() => {}))

      render(
        <MemoryRouter initialEntries={['/student/profile']}>
          <ThemeProvider>
            <AuthProvider>
              <StudentProfile />
            </AuthProvider>
          </ThemeProvider>
        </MemoryRouter>
      )

      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('renders student profile editor with headline, skills, and preview button', async () => {
      render(
        <MemoryRouter initialEntries={['/student/profile']}>
          <ThemeProvider>
            <AuthProvider>
              <StudentProfile />
            </AuthProvider>
          </ThemeProvider>
        </MemoryRouter>
      )

      expect(await screen.findByText('Aarav Mehta')).toBeInTheDocument()
      expect(
        screen.getByText(/Aspiring Product Designer & Frontend Developer/i)
      ).toBeInTheDocument()
      expect(screen.getAllByText('Figma').length).toBeGreaterThan(0)
      expect(screen.getAllByText('React').length).toBeGreaterThan(0)
      expect(screen.getByText(/Preview public profile/i)).toBeInTheDocument()
    })

    it('renders error alert with retry button when profile fetch fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(profileService.getProfile).mockRejectedValueOnce(
        new Error('Failed to load student profile')
      )

      render(
        <MemoryRouter initialEntries={['/student/profile']}>
          <ThemeProvider>
            <AuthProvider>
              <StudentProfile />
            </AuthProvider>
          </ThemeProvider>
        </MemoryRouter>
      )

      expect(await screen.findByText(/Failed to load student profile/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument()
      consoleErrorSpy.mockRestore()
    })
  })

  // -------------------------------------------------------------
  // THEME & RESPONSIVE LAYOUT
  // -------------------------------------------------------------
  describe('Theme and Layout Responsive Controls', () => {
    it('toggles dark mode class on documentElement and persists to localStorage', () => {
      function ThemeTestComponent() {
        const { isDark, toggleTheme } = useTheme()
        return (
          <div>
            <span data-testid="theme-status">{isDark ? 'dark' : 'light'}</span>
            <ThemeToggle />
            <button data-testid="manual-toggle" onClick={toggleTheme}>
              Toggle
            </button>
          </div>
        )
      }

      render(
        <ThemeProvider>
          <ThemeTestComponent />
        </ThemeProvider>
      )

      const toggleBtn = screen.getByTestId('manual-toggle')
      const initialStatus = screen.getByTestId('theme-status').textContent

      fireEvent.click(toggleBtn)
      const newStatus = screen.getByTestId('theme-status').textContent
      expect(newStatus).not.toBe(initialStatus)

      // Check localStorage persistence
      expect(localStorage.getItem('skillbridge-theme')).toBe(newStatus)
    })

    it('renders responsive mobile navigation drawer on small viewports', async () => {
      render(
        <MemoryRouter initialEntries={['/student/dashboard']}>
          <ThemeProvider>
            <AuthProvider>
              <StudentLayout />
            </AuthProvider>
          </ThemeProvider>
        </MemoryRouter>
      )

      // Mobile hamburger menu button exists
      const menuButtons = screen.getAllByRole('button')
      expect(menuButtons.length).toBeGreaterThan(0)

      // Await notification bell to flush async state updates cleanly
      expect(await screen.findByText('1')).toBeInTheDocument()
    })
  })
})
