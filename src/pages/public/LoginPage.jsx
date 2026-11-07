import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Building,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
} from 'lucide-react'
import { Button, Input, Alert } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'

export function LoginPage() {
  const [role, setRole] = useState('student') // 'student' | 'recruiter'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    setErrorMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    const result = await login({ email, password, role }, rememberMe)
    setIsLoading(false)

    if (result.success) {
      const fromPath = location.state?.from?.pathname
      // Ensure target destination strictly belongs to the user's authentic role
      const target =
        fromPath && fromPath.startsWith(`/${result.user.role}`)
          ? fromPath
          : `/${result.user.role}/dashboard`
      navigate(target, { replace: true })
    } else {
      setErrorMsg(result.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top switch link */}
      <div className="flex justify-end text-xs">
        <span className="text-slate-500 dark:text-slate-400 mr-1.5">New to SkillBridge?</span>
        <Link
          to="/register"
          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
        >
          <span>Create an account</span>
          <span>→</span>
        </Link>
      </div>

      {/* Main Title */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome back.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your next opportunity is waiting. Let's get you in.
        </p>
      </div>

      {/* Role Picker (Student vs Recruiter) */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          I'm here as a
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              role === 'student'
                ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-2xs ring-1 ring-indigo-500/20'
                : 'bg-white dark:bg-[#161928] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Student / fresher</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('recruiter')}
            className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              role === 'recruiter'
                ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-2xs ring-1 ring-indigo-500/20'
                : 'bg-white dark:bg-[#161928] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Recruiter</span>
          </button>
        </div>
      </div>

      {/* Permanent Deletion Success Alert */}
      {location.state?.deletedSuccessMessage && !errorMsg && (
        <Alert variant="success" title="Account Deleted">
          {location.state.deletedSuccessMessage}
        </Alert>
      )}

      {/* Error Feedback Alert */}
      {errorMsg && (
        <Alert variant="danger" title="Authentication Error">
          {errorMsg}
        </Alert>
      )}

      {/* Social Google Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full justify-center"
        onClick={() => {
          setErrorMsg('Single Sign-On (Google) is currently undergoing campus domain verification. Please sign in with your email.')
        }}
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Fill Demo {role === 'recruiter' ? 'Recruiter' : 'Student'} Credentials</span>
      </Button>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
        <span className="bg-white dark:bg-[#0B0D14] px-3 text-xs text-slate-400 uppercase tracking-wider relative">
          or with email
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          leftIcon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          required
        />

        {/* Password input with show/hide toggle */}
        <div className="w-full flex flex-col">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-slate-400 flex items-center">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm transition-all focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full justify-center"
          size="lg"
          rightIcon={ArrowRight}
          isLoading={isLoading}
        >
          Sign in to your workspace →
        </Button>
      </form>
    </div>
  )
}
