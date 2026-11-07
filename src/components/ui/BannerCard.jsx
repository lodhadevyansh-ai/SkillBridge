import { Sparkles } from 'lucide-react'
import { cn } from '../../utils/cn'

export function BannerCard({
  icon: Icon = Sparkles,
  title,
  description,
  progress,
  progressLabel = 'Profile strength',
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-indigo-50/60 dark:from-[#211E48] dark:via-[#1D1A3E] dark:to-[#171533]',
        'border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-5 sm:p-6 shadow-xs',
        className
      )}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-indigo-950/60 border border-indigo-100/80 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 shrink-0 shadow-2xs">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {typeof progress === 'number' && (
          <div className="w-full lg:w-64 shrink-0 bg-white/70 dark:bg-[#161928]/60 p-3.5 rounded-xl border border-indigo-100/60 dark:border-indigo-900/30">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-200 mb-1.5">
              <span>{progressLabel}</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            {actionLabel && (
              <button
                type="button"
                onClick={onAction}
                className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <span>{actionLabel}</span>
                <span>→</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

