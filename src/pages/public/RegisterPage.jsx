import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  User,
  ArrowRight,
} from 'lucide-react'
import { Button, Input, Alert } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'

export function RegisterPage() {
  const [role, setRole] = useState('student') // 'student' | 'recruiter'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [terms, setTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.')
      return
    }

    if (!terms) {
      setErrorMsg('You must agree to the Terms of Service and Privacy Policy to register.')
      return
    }

    setIsLoading(true)
    try {
      const result = await register({
        fullName,
        email,
        password,
        confirmPassword,
        role,
        companyName: role === 'recruiter' ? companyName : undefined,
        terms,
      })

      if (result.success) {
        navigate(`/${result.user.role}/dashboard`)
      } else {
        setErrorMsg(result.message)
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred during registration. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end text-xs">
        <span className="text-slate-500 dark:text-slate-400 mr-1.5">Already have an account?</span>
        <Link
          to="/login"
          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
        >
          <span>Sign in</span>
          <span>→</span>
        </Link>
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create your account.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Join thousands of students and high-growth teams on SkillBridge.
        </p>
      </div>

      {/* Role Picker (Student vs Recruiter) */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          I am joining as a
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('student')}
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
            onClick={() => setRole('recruiter')}
            className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              role === 'recruiter'
                ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-2xs ring-1 ring-indigo-500/20'
                : 'bg-white dark:bg-[#161928] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Hiring Company</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <Alert variant="danger" title="Registration Error">
          {errorMsg}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          leftIcon={User}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Alex Morgan"
          required
        />

        {role === 'recruiter' && (
          <Input
            label="Company Name"
            type="text"
            leftIcon={Building}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Linear, Razorpay, Notion"
            required
          />
        )}

        <Input
          label={role === 'recruiter' ? 'Company Work Email' : 'Email Address'}
          type="email"
          leftIcon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          required
        />

        {/* Password with toggle */}
        <div className="w-full flex flex-col">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Set Password <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-slate-400 flex items-center">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              className="w-full bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm transition-all focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password with toggle */}
        <div className="w-full flex flex-col">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-slate-400 flex items-center">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              minLength={6}
              className="w-full bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm transition-all focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              required
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
            />
            <span className="leading-relaxed">
              I agree to the SkillBridge{' '}
              <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Privacy Policy
              </a>
              .
            </span>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full justify-center"
          size="lg"
          rightIcon={ArrowRight}
          isLoading={isLoading}
        >
          Create {role === 'recruiter' ? 'Recruiter Account' : 'Student Profile'} →
        </Button>
      </form>
    </div>
  )
}
