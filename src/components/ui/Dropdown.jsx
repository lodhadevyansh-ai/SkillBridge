import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

export function Dropdown({
  trigger,
  label = 'Select',
  items = [],
  align = 'right',
  className,
  menuClassName,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      {trigger ? (
        <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-2xs"
        >
          <span>{label}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 min-w-[180px] rounded-xl bg-white dark:bg-[#161928] border border-slate-200 dark:border-[#282D4A] shadow-lg py-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-100',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName
          )}
        >
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div
                  key={`div-${index}`}
                  className="my-1 border-t border-slate-100 dark:border-slate-800"
                />
              )
            }

            const Icon = item.icon
            return (
              <button
                key={item.id || index}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.()
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-left transition-colors cursor-pointer',
                  item.danger
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80',
                  item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                )}
              >
                {Icon && <Icon className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" />}
                <span className="flex-1">{item.label}</span>
                {item.badge && <span className="text-[10px] text-slate-400">{item.badge}</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

