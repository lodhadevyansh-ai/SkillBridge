import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '../../utils/cn'

const alertStyles = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200',
    iconColor: 'text-blue-600 dark:text-blue-400',
    icon: Info,
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200',
    iconColor: 'text-amber-600 dark:text-amber-400',
    icon: AlertTriangle,
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-200',
    iconColor: 'text-red-600 dark:text-red-400',
    icon: AlertCircle,
  },
}

export function Alert({
  variant = 'info',
  title,
  children,
  onDismiss,
  className,
}) {
  const style = alertStyles[variant] || alertStyles.info
  const Icon = style.icon

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border text-xs',
        style.bg,
        className
      )}
    >
      <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', style.iconColor)} />
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div className="leading-relaxed opacity-90">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-current opacity-60 hover:opacity-100 p-0.5 rounded cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

