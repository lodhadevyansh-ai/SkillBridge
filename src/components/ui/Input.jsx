import { forwardRef } from 'react'
import { cn } from '../../utils/cn'
import { ErrorMessage } from './ErrorMessage'

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className,
      containerClassName,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className={cn('w-full flex flex-col', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
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
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm transition-all',
              'focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
              LeftIcon && 'pl-10',
              RightIcon && 'pr-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20',
              props.disabled && 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800',
              className
            )}
            {...props}
          />
          {RightIcon && (
            <div className="absolute right-3.5 pointer-events-none text-slate-400 dark:text-slate-500 flex items-center">
              <RightIcon className="w-4 h-4" />
            </div>
          )}
        </div>
        <ErrorMessage message={error} />
        {helperText && !error && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

