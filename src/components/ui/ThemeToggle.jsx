import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../design-system/useTheme'
import { cn } from '../../utils/cn'

export function ThemeToggle({ className, showLabel = false }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer flex items-center gap-2 select-none shadow-2xs',
        className
      )}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform duration-200" />
      )}
      {showLabel && (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
          {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </span>
      )}
    </button>
  )
}
