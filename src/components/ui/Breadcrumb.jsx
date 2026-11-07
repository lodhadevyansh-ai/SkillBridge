import { ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

export function Breadcrumb({ items = [], className }) {
  if (!items.length) return null

  return (
    <nav className={cn('flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <div key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-300 dark:text-slate-600" />}
            {item.href && !isLast ? (
              <a
                href={item.href}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className={cn(isLast && 'text-slate-800 dark:text-slate-200 font-semibold')}>
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}

