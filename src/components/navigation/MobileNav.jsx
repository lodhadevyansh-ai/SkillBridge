import { Bookmark, Briefcase, Compass, Home, User } from 'lucide-react'
import { cn } from '../../utils/cn'

const defaultMobileTabs = [
  { id: 'overview', label: 'Home', icon: Home },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'applications', label: 'Applied', icon: Briefcase },
  { id: 'profile', label: 'Profile', icon: User },
]

export function MobileNav({
  tabs = defaultMobileTabs,
  activeTab = 'overview',
  onTabChange,
  className,
}) {
  return (
    <nav
      className={cn(
        'md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-[#161928]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-[#282D4A] px-2 py-1.5 z-40 flex items-center justify-around shadow-lg',
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange?.(tab.id)}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer',
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            <div
              className={cn(
                'p-1 rounded-lg transition-colors',
                isActive && 'bg-indigo-50 dark:bg-indigo-950/60'
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

