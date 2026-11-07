import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../design-system/ThemeContext'
import { useTheme } from '../design-system/useTheme'
import { AuthContext } from '../context/authContextInstance'
import { StudentLayout } from '../layouts/StudentLayout'
import { Routes, Route } from 'react-router-dom'

// Component to test theme toggle hook directly
function ThemeTester() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="current-theme">{isDark ? 'dark' : 'light'}</span>
      <button onClick={toggleTheme}>Toggle Mode</button>
    </div>
  )
}

describe('Theme Mode and Responsive Layout Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  it('toggles dark mode and persists theme selection', () => {
    render(
      <ThemeProvider>
        <ThemeTester />
      </ThemeProvider>
    )

    const toggleButton = screen.getByRole('button', { name: /Toggle Mode/i })
    const themeSpan = screen.getByTestId('current-theme')

    // Initial theme defaults to light
    expect(themeSpan.textContent).toBe('light')

    // Click toggle
    fireEvent.click(toggleButton)
    expect(themeSpan.textContent).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('skillbridge-theme')).toBe('dark')

    // Click toggle again
    fireEvent.click(toggleButton)
    expect(themeSpan.textContent).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('skillbridge-theme')).toBe('light')
  })

  it('renders student layout with responsive sidebar and navigation elements', async () => {
    const mockAuthContext = {
      user: { id: 'std-1', fullName: 'Alex Johnson', role: 'student', email: 'alex@example.com' },
      logout: vi.fn(),
      isAuthenticated: true
    }

    render(
      <MemoryRouter initialEntries={['/student']}>
        <AuthContext.Provider value={mockAuthContext}>
          <ThemeProvider>
            <Routes>
              <Route path="/student" element={<StudentLayout />}>
                <Route index element={<div data-testid="child-content">Main Page Content Area</div>} />
              </Route>
            </Routes>
          </ThemeProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    )

    // Verify main content is rendered
    expect(screen.getByTestId('child-content')).toBeInTheDocument()

    // Verify responsive navigation elements exist
    expect(screen.getAllByText(/SkillBridge/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Overview/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Find Jobs/i).length).toBeGreaterThan(0)

    // Await notification resolution to avoid unhandled async act warnings
    expect(await screen.findByText('1')).toBeInTheDocument()
  })
})
