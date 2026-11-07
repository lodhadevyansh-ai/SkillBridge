import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button, Input, Alert } from '../../components/ui'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 400)
  }

  return (
    <div className="space-y-6">
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to login</span>
      </Link>

      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reset your password.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Enter your registered email address and we will send you instructions to reset your password.
        </p>
      </div>

      {isSubmitted ? (
        <div className="space-y-4">
          <Alert variant="success" title="Reset Link Dispatched">
            We’ve sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folders.
          </Alert>
          <Link to="/login" className="block">
            <Button variant="outline" className="w-full justify-center">
              Return to Login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            leftIcon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <Button
            type="submit"
            className="w-full justify-center"
            size="lg"
            isLoading={isLoading}
          >
            Send Reset Instructions →
          </Button>
        </form>
      )}
    </div>
  )
}
