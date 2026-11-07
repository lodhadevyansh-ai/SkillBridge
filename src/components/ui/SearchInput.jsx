import { forwardRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../utils/cn'

export const SearchInput = forwardRef(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = 'Search anything...',
      shortcut = '⌘ K',
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('relative flex items-center w-full max-w-md', containerClassName)}>
        <div className="absolute left-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            'w-full bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-14 py-2 text-sm transition-all',
            'focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
            className
          )}
          {...props}
        />
        <div className="absolute right-3 flex items-center gap-1.5">
          {value && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            shortcut && (
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
                {shortcut}
              </kbd>
            )
          )}
        </div>
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'

