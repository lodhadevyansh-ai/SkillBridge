import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from '../components/navigation/Sidebar'
import { TopNav } from '../components/navigation/TopNav'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../design-system/ThemeContext'
import { LayoutDashboard, Compass, Briefcase, Bookmark, User } from 'lucide-react'
import { notificationService } from '../services/notificationService'
import { mockNotifications, mockEmptyNotifications } from './mocks/mockData'

describe('Frontend Navigation Links & Header Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(notificationService.getNotifications).mockResolvedValue(mockNotifications)
  })

  it('renders student sidebar with primary navigation destinations', () => {
    const studentNav = [
      { id: '/student/dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: '/student/jobs', label: 'Find Jobs', icon: Compass },
      { id: '/student/applications', label: 'My Applications', icon: Briefcase },
      { id: '/student/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
      { id: '/student/profile', label: 'My Profile', icon: User },
    ]

    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <Sidebar navItems={studentNav} activePath="/student/dashboard" />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    )

    // Verify brand and primary nav links
    expect(screen.getByText('SkillBridge')).toBeInTheDocument()
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Find Jobs')).toBeInTheDocument()
    expect(screen.getByText('My Applications')).toBeInTheDocument()
    expect(screen.getByText('Saved Jobs')).toBeInTheDocument()
    expect(screen.getByText('My Profile')).toBeInTheDocument()
  })

  it('renders TopNav with search, notification trigger and theme toggle', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <TopNav breadcrumbItems={[{ label: 'My workspace' }, { label: 'Overview' }]} />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    )

    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Search anything/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Switch to/i })).toBeInTheDocument()

    // Await notification unread badge to ensure all async state updates are flushed
    expect(await screen.findByText('1')).toBeInTheDocument()
  })

  it('opens notification dropdown and renders notification items on click', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <TopNav breadcrumbItems={[{ label: 'My workspace' }, { label: 'Overview' }]} />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    )

    // Await notification trigger badge
    const bellBtn = await screen.findByRole('button', { name: /View notifications/i })
    expect(bellBtn).toBeInTheDocument()

    // Click bell button to toggle open dropdown
    fireEvent.click(bellBtn)

    expect(await screen.findByText(/Interview Scheduled 📅/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Your interview for UX Research Intern at Notion is confirmed/i)
    ).toBeInTheDocument()
  })

  it('renders empty notification state when there are no alerts', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValueOnce(mockEmptyNotifications)

    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <TopNav breadcrumbItems={[{ label: 'My workspace' }, { label: 'Overview' }]} />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    )

    const bellBtn = await screen.findByRole('button', { name: /View notifications/i })
    fireEvent.click(bellBtn)

    expect(await screen.findByText(/No notifications/i)).toBeInTheDocument()
  })
})
