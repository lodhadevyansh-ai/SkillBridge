import { Menu } from 'lucide-react'
import { Breadcrumb } from '../ui/Breadcrumb'
import { SearchInput } from '../ui/SearchInput'
import { ThemeToggle } from '../ui/ThemeToggle'
import { NotificationDropdown } from '../notifications/NotificationDropdown'
import { cn } from '../../utils/cn'

export function TopNav({
  breadcrumbItems = [],
  searchValue = '',
  onSearchChange,
  userInitials = 'AS',
  onUserMenuClick,
  onMobileMenuToggle,
  className,
}) {
  return (
    <header
      className={cn(
        'h-16 px-4 sm:px-8 border-b border-slate-200/80 dark:border-[#282D4A] bg-white/80 dark:bg-[#161928]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-4',
        className
      )}
    >
      {/* Left: Mobile hamburger + Breadcrumb */}
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Right: Search, Notifications, Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden sm:block">
          <SearchInput
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search anything..."
            className="w-52 lg:w-72"
          />
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <ThemeToggle />

        {/* Real Notification Dropdown */}
        <NotificationDropdown />

        {/* User Avatar Circle */}
        <button
          type="button"
          onClick={onUserMenuClick}
          className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs ring-2 ring-transparent hover:ring-indigo-300 dark:hover:ring-indigo-700 transition-all cursor-pointer"
        >
          {userInitials}
        </button>
      </div>
    </header>
  )
}

