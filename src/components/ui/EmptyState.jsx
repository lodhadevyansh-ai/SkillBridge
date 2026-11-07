import { Inbox } from 'lucide-react'
import { Button } from './Button'
import { cn } from '../../utils/cn'

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = "There are no records matching your current filter criteria. Try adjusting your search.",
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-[#161928] border border-dashed border-slate-200 dark:border-[#282D4A]',
        className
      )}
    >
      <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-3.5">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        <Button size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

