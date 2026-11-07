import { cn } from '../../utils/cn'

export function Spinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  }

  return (
    <div
      className={cn(
        'rounded-full border-slate-200 dark:border-slate-800 border-t-indigo-600 dark:border-t-indigo-500 animate-spin',
        sizes[size] || sizes.md,
        className
      )}
    />
  )
}

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-800/80',
        className
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#161928] border border-slate-200/80 dark:border-[#282D4A] rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-20 h-5" />
      </div>
      <Skeleton className="w-3/4 h-5" />
      <Skeleton className="w-1/2 h-4" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="w-16 h-6 rounded-md" />
        <Skeleton className="w-20 h-6 rounded-md" />
      </div>
    </div>
  )
}

export function LoadingState({ message = 'Loading opportunities...', className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center', className)}>
      <Spinner size="lg" className="mb-3" />
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{message}</p>
    </div>
  )
}

