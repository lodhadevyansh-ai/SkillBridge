import { AlertCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

export function ErrorMessage({ message, className }) {
  if (!message) return null

  return (
    <div className={cn('flex items-center gap-1.5 mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium', className)}>
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

