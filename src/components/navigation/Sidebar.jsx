import { HelpCircle, Moon, Sparkles, Sun, Share2 } from 'lucide-react'
import { SidebarItem } from './SidebarItem'
import { useTheme } from '../../design-system/useTheme'
import { cn } from '../../utils/cn'

export function Sidebar({
  workspaceLabel,
  navItems = [],
  activePath = '',
  onNavigate,
  user,
  showMotivationalCard = true,
  motivationalCardProps = {
    title: 'Your next chapter starts here.',
    description: 'Complete your profile to get better matches.',
    linkText: 'Complete profile →',
    onLinkClick: () => {},
  },
  className,
}) {
  const { isDark, toggleTheme } = useTheme()

  // Dynamically resolve workspace label strictly from role if not explicitly passed
  const derivedRoleLabel = user?.role ? `${user.role.toUpperCase()} WORKSPACE` : 'SKILLBRIDGE WORKSPACE'
  const finalWorkspaceLabel = workspaceLabel || derivedRoleLabel

  return (
    <aside
      className={cn(
        'w-64 shrink-0 bg-white dark:bg-[#161928] border-r border-slate-200/80 dark:border-[#282D4A] flex flex-col justify-between select-none overflow-y-auto',
        className
      )}
    >
      {/* Top Brand Header */}
      <div>
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <Share2 className="w-4 h-4 transform rotate-45" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              SkillBridge
            </span>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-5 pt-5 pb-2">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            {finalWorkspaceLabel}
          </span>
        </div>

        {/* Navigation List */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <SidebarItem
              key={item.id || item.label}
              icon={item.icon}
              label={item.label}
              isActive={activePath === item.id}
              badge={item.badge}
              className={
                item.isDanger
                  ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300'
                  : undefined
              }
              onClick={() => onNavigate?.(item.id)}
            />
          ))}
        </nav>
      </div>

      {/* Bottom Area */}
      <div className="p-3 space-y-3">
        {/* Motivational Card */}
        {showMotivationalCard && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/90 to-purple-50/60 dark:from-[#211E48] dark:to-[#171533] border border-indigo-100/80 dark:border-indigo-900/40 text-left">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
              {motivationalCardProps.title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
              {motivationalCardProps.description}
            </p>
            <button
              type="button"
              onClick={motivationalCardProps.onLinkClick}
              className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 block cursor-pointer"
            >
              {motivationalCardProps.linkText}
            </button>
          </div>
        )}

        {/* Utilities: Help & Theme Toggle */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-0.5">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span>Help & support</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-400" />
              )}
              <span>{isDark ? 'Light appearance' : 'Dark appearance'}</span>
            </div>
          </button>
        </div>

        {/* User Profile Badge */}
        {user && (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
              {user.initials || 'SB'}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user.role}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
