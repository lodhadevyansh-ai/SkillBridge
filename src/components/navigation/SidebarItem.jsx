import { cn } from '../../utils/cn'

export function SidebarItem({
  icon: Icon,
  label,
  isActive = false,
  badge,
  onClick,
  href,
  className,
}) {
  const content = (
    <div
      onClick={onClick}
      className={cn(
        'group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none',
        isActive
          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/50',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <Icon
            className={cn(
              'w-4 h-4 shrink-0 transition-colors',
              isActive
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
            )}
          />
        )}
        <span className="truncate">{label}</span>
      </div>
      {badge !== undefined && (
        <span
          className={cn(
            'ml-2 px-1.5 py-0.5 text-[10px] rounded-md font-semibold',
            isActive
              ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          )}
        >
          {badge}
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block no-underline">
        {content}
      </a>
    )
  }

  return content
}

