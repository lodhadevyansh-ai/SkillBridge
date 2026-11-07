import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'
import { ErrorMessage } from './ErrorMessage'

export const Select = forwardRef(
  (
    {
      label,
      options = [],
      error,
      helperText,
      leftIcon: LeftIcon,
      className,
      containerClassName,
      required,
      id,
      placeholder = 'Select option...',
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className={cn('w-full flex flex-col', containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {LeftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-400 dark:text-slate-500 flex items-center">
              <LeftIcon className="w-4 h-4" />
            </div>
          )}
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100',
              'border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm appearance-none transition-all cursor-pointer',
              'focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
              LeftIcon && 'pl-10',
              'pr-10',
              error && 'border-red-500 focus:border-red-500',
              props.disabled && 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.length > 0
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3.5 pointer-events-none text-slate-400 dark:text-slate-500 flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        <ErrorMessage message={error} />
        {helperText && !error && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

