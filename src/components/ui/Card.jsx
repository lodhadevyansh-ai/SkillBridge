import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

export const Card = forwardRef(
  (
    {
      children,
      className,
      hoverable = false,
      padding = 'default',
      ...props
    },
    ref
  ) => {
    const paddings = {
      none: '',
      sm: 'p-4',
      default: 'p-5 sm:p-6',
      lg: 'p-6 sm:p-8',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white dark:bg-[#161928] border border-slate-200/80 dark:border-[#282D4A] rounded-2xl transition-all duration-200 shadow-xs',
          hoverable && 'hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md cursor-pointer',
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div>
        {title && (
          <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

