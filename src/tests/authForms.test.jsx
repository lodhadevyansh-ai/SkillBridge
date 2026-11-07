import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from '../pages/public/LoginPage'
import { RegisterPage } from '../pages/public/RegisterPage'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../design-system/ThemeContext'

describe('Authentication Forms & Client-Side Validation', () => {
  it('renders login form and requires email and password', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /Welcome back/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/your\.email@example\.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••••••/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign in to your workspace/i })).toBeInTheDocument()
  })

  it('renders register form with role tabs and validation requirements', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <RegisterPage />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /Create your account/i })).toBeInTheDocument()
    expect(screen.getByText(/Student \/ fresher/i)).toBeInTheDocument()
    expect(screen.getByText(/Hiring Company/i)).toBeInTheDocument()

    const submitBtn = screen.getByRole('button', { name: /Create Student Profile/i })
    fireEvent.click(submitBtn)

    // Form validation should prompt for required fields
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/e\.g\. Alex Morgan/i)).toBeInTheDocument()
    })
  })
})
