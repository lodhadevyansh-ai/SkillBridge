import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { WorkspaceHeader } from '../components/shared/WorkspaceHeader'
import { StudentLayout } from '../layouts/StudentLayout'
import { RecruiterLayout } from '../layouts/RecruiterLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { RecruiterDashboard } from '../pages/recruiter/RecruiterDashboard'
import { AuthContext } from '../context/authContextInstance'
import { ThemeProvider } from '../design-system/ThemeContext'
import { recruiterService } from '../services/recruiterService'
import { mockRecruiterDashboard, mockEmptyRecruiterDashboard } from './mocks/mockData'

describe('Role-Based Workspaces & Header Isolation Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(recruiterService.getDashboard).mockResolvedValue(mockRecruiterDashboard)
  })
  it('renders student workspace header with correct role and no cross-portal controls', () => {
    const studentAuth = {
      user: { id: 'std-1', fullName: 'Aarav Mehta', role: 'student', email: 'aarav@univ.edu' },
      logout: vi.fn(),
      isAuthenticated: true,
    }

    render(
      <MemoryRouter>
        <AuthContext.Provider value={studentAuth}>
          <WorkspaceHeader />
        </AuthContext.Provider>
      </MemoryRouter>
    )

    // Verify correct header structure
    expect(screen.getByText('SkillBridge Workspace')).toBeInTheDocument()
    expect(screen.getByText('Student Workspace')).toBeInTheDocument()
    expect(screen.getByText(/Signed in as/i)).toBeInTheDocument()
    expect(screen.getByText('Aarav Mehta')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument()

    // Ensure NO cross-role switching buttons exist
    expect(screen.queryByText(/Recruiter View/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Admin View/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Recruiter Workspace/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Admin Workspace/i)).not.toBeInTheDocument()
  })

  it('renders recruiter workspace header with correct role and no cross-portal controls', () => {
    const recruiterAuth = {
      user: { id: 'rec-1', fullName: 'Tanvi Shah', role: 'recruiter', companyName: 'Nvidia', email: 'tanvi@nvidia.com' },
      logout: vi.fn(),
      isAuthenticated: true,
    }

    render(
      <MemoryRouter>
        <AuthContext.Provider value={recruiterAuth}>
          <WorkspaceHeader />
        </AuthContext.Provider>
      </MemoryRouter>
    )

    // Verify correct header structure
    expect(screen.getByText('SkillBridge Workspace')).toBeInTheDocument()
    expect(screen.getByText('Recruiter Workspace')).toBeInTheDocument()
    expect(screen.getByText('Tanvi Shah')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument()

    // Ensure NO cross-role switching buttons exist
    expect(screen.queryByText(/Student View/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Admin View/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Student Workspace/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Admin Workspace/i)).not.toBeInTheDocument()
  })

  it('renders admin workspace header with correct role and no cross-portal controls', () => {
    const adminAuth = {
      user: { id: 'adm-1', fullName: 'Vikram Joshi', role: 'admin', email: 'admin@skillbridge.io' },
      logout: vi.fn(),
      isAuthenticated: true,
    }

    render(
      <MemoryRouter>
        <AuthContext.Provider value={adminAuth}>
          <WorkspaceHeader />
        </AuthContext.Provider>
      </MemoryRouter>
    )

    // Verify correct header structure
    expect(screen.getByText('SkillBridge Workspace')).toBeInTheDocument()
    expect(screen.getByText('Admin Workspace')).toBeInTheDocument()
    expect(screen.getByText('Vikram Joshi')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument()

    // Ensure NO cross-role switching buttons exist
    expect(screen.queryByText(/Student View/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Recruiter View/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Student Workspace/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Recruiter Workspace/i)).not.toBeInTheDocument()
  })

  it('renders RecruiterLayout with RECRUITER WORKSPACE sidebar label (not NVIDIA WORKSPACE)', async () => {
    const recruiterAuth = {
      user: { id: 'rec-1', fullName: 'Tanvi Shah', role: 'recruiter', companyName: 'Nvidia', email: 'tanvi@nvidia.com' },
      logout: vi.fn(),
      isAuthenticated: true,
    }

    render(
      <MemoryRouter initialEntries={['/recruiter/dashboard']}>
        <AuthContext.Provider value={recruiterAuth}>
          <ThemeProvider>
            <Routes>
              <Route path="/recruiter/*" element={<RecruiterLayout />}>
                <Route path="dashboard" element={<div>Recruiter Dashboard Content</div>} />
              </Route>
            </Routes>
          </ThemeProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    )

    // Verify content and await async stats and notification resolution
    expect(await screen.findByText('Recruiter Dashboard Content')).toBeInTheDocument()
    expect(await screen.findByText('1')).toBeInTheDocument()

    // Verify RECRUITER WORKSPACE is displayed
    const sidebarLabels = screen.getAllByText('RECRUITER WORKSPACE')
    expect(sidebarLabels.length).toBeGreaterThan(0)

    // Verify NVIDIA WORKSPACE does NOT appear
    expect(screen.queryByText('NVIDIA WORKSPACE')).not.toBeInTheDocument()

    // Verify NO cross-role switching options appear
    expect(screen.queryByText(/Student View/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Admin View/i)).not.toBeInTheDocument()
  })

  it('renders StudentLayout with STUDENT WORKSPACE sidebar label', async () => {
    const studentAuth = {
      user: { id: 'std-1', fullName: 'Aarav Mehta', role: 'student', email: 'aarav@univ.edu' },
      logout: vi.fn(),
      isAuthenticated: true,
    }

    render(
      <MemoryRouter initialEntries={['/student/dashboard']}>
        <AuthContext.Provider value={studentAuth}>
          <ThemeProvider>
            <Routes>
              <Route path="/student/*" element={<StudentLayout />}>
                <Route path="dashboard" element={<div>Student Dashboard Content</div>} />
              </Route>
            </Routes>
          </ThemeProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    )

    // Verify content and await async state updates
    expect(await screen.findByText('Student Dashboard Content')).toBeInTheDocument()
    expect(await screen.findByText('1')).toBeInTheDocument()

    // Verify STUDENT WORKSPACE is displayed
    const sidebarLabels = screen.getAllByText('STUDENT WORKSPACE')
    expect(sidebarLabels.length).toBeGreaterThan(0)

    // Verify NO cross-role switching options appear
    expect(screen.queryByText(/Recruiter View/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Admin View/i)).not.toBeInTheDocument()
  })

  it('renders AdminLayout with ADMIN WORKSPACE sidebar label and complete admin nav destinations', async () => {
    const adminAuth = {
      user: { id: 'adm-1', fullName: 'Vikram Joshi', role: 'admin', email: 'admin@skillbridge.io' },
      logout: vi.fn(),
      isAuthenticated: true,
    }

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AuthContext.Provider value={adminAuth}>
          <ThemeProvider>
            <Routes>
              <Route path="/admin/*" element={<AdminLayout />}>
                <Route path="dashboard" element={<div>Admin Dashboard Content</div>} />
              </Route>
            </Routes>
          </ThemeProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    )

    // Verify content and await async notifications
    expect(await screen.findByText('Admin Dashboard Content')).toBeInTheDocument()
    expect(await screen.findByText('1')).toBeInTheDocument()

    // Verify ADMIN WORKSPACE is displayed
    const sidebarLabels = screen.getAllByText('ADMIN WORKSPACE')
    expect(sidebarLabels.length).toBeGreaterThan(0)

    // Verify complete admin nav items are present
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0)
    expect(screen.getAllByText('User Management').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Student Management').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Recruiter Management').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Job Management').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Reports').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Analytics').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0)

    // Verify NO cross-role switching options appear
    expect(screen.queryByText(/Student View/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Recruiter View/i)).not.toBeInTheDocument()
  })

  describe('Recruiter Dashboard Lifecycle & Error States', () => {
    it('renders loading skeleton while recruiter dashboard data is pending', () => {
      vi.mocked(recruiterService.getDashboard).mockReturnValueOnce(new Promise(() => {}))

      render(
        <MemoryRouter>
          <ThemeProvider>
            <RecruiterDashboard />
          </ThemeProvider>
        </MemoryRouter>
      )

      expect(screen.getByText(/Loading your live hiring workspace.../i)).toBeInTheDocument()
    })

    it('renders recruiter dashboard with KPI metric cards, pipeline and active jobs', async () => {
      render(
        <MemoryRouter>
          <ThemeProvider>
            <RecruiterDashboard />
          </ThemeProvider>
        </MemoryRouter>
      )

      expect(await screen.findAllByText('Senior Product Designer')).not.toHaveLength(0)
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument()
      expect(screen.getByText('Total Applicants')).toBeInTheDocument()
      expect(screen.getByText('Active Jobs')).toBeInTheDocument()
    })

    it('renders empty state when recruiter has no active jobs or applications', async () => {
      vi.mocked(recruiterService.getDashboard).mockResolvedValueOnce(mockEmptyRecruiterDashboard)

      render(
        <MemoryRouter>
          <ThemeProvider>
            <RecruiterDashboard />
          </ThemeProvider>
        </MemoryRouter>
      )

      expect(await screen.findByText('No open roles posted yet')).toBeInTheDocument()
      expect(screen.getByText('No candidate applications received yet.')).toBeInTheDocument()
    })

    it('renders error banner with retry button on API failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(recruiterService.getDashboard).mockRejectedValueOnce(
        new Error('Recruiter API server down')
      )

      render(
        <MemoryRouter>
          <ThemeProvider>
            <RecruiterDashboard />
          </ThemeProvider>
        </MemoryRouter>
      )

      expect(await screen.findByText('Unable to load recruitment data')).toBeInTheDocument()
      expect(screen.getByText('Recruiter API server down')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument()
      consoleErrorSpy.mockRestore()
    })
  })
})

