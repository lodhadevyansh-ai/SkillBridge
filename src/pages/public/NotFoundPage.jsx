import { Link } from 'react-router-dom'
import { Compass, Home, MoveLeft } from 'lucide-react'
import { Button } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'

export function NotFoundPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 shadow-sm">
        <Compass className="w-8 h-8 animate-spin-slow" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
        404 Error
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
        The link you followed may be broken, or the page may have been moved or removed.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        {user ? (
          <Link to={`/${user.role}/dashboard`}>
            <Button leftIcon={Home}>
              Return to Your Workspace
            </Button>
          </Link>
        ) : (
          <Link to="/">
            <Button leftIcon={Home}>
              Back to SkillBridge Home
            </Button>
          </Link>
        )}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          <MoveLeft className="w-4 h-4" />
          <span>Go back</span>
        </button>
      </div>
    </div>
  )
}

