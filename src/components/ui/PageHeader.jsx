import { Breadcrumb } from './Breadcrumb'
import { cn } from '../../utils/cn'

export { Breadcrumb }

export function PageHeader({
  title,
  subtitle,
  action,
  breadcrumbItems,
  className,
}) {
  return (
    <div className={cn('mb-6 sm:mb-8 space-y-3', className)}>
      {breadcrumbItems && <Breadcrumb items={breadcrumbItems} className="mb-2" />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}
