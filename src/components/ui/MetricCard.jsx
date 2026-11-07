import { cn } from '../../utils/cn'

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up',
  className,
  iconColor = 'text-indigo-600 dark:text-indigo-400',
  iconBg = 'bg-indigo-50 dark:bg-indigo-950/40',
}) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-[#161928] border border-slate-200/80 dark:border-[#282D4A] rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-xs hover:shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          {title}
        </span>
        {Icon && (
          <div className={cn('p-2 rounded-xl flex items-center justify-center', iconBg)}>
            <Icon className={cn('w-4 h-4', iconColor)} />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {trend && (
              <span
                className={cn(
                  'font-medium',
                  trendDirection === 'up' && 'text-emerald-600 dark:text-emerald-400',
                  trendDirection === 'down' && 'text-red-600 dark:text-red-400'
                )}
              >
                {trend}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

