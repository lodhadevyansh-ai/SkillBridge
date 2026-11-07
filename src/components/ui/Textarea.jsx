import { forwardRef } from 'react'
import { cn } from '../../utils/cn'
import { ErrorMessage } from './ErrorMessage'

export const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className,
      containerClassName,
      required,
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className={cn('w-full flex flex-col', containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            'w-full bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm transition-all resize-y',
            'focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
            error && 'border-red-500 focus:border-red-500 bg-red-50/20',
            props.disabled && 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800',
            className
          )}
          {...props}
        />
        <ErrorMessage message={error} />
        {helperText && !error && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

