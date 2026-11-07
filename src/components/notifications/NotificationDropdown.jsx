import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  Sparkles,
  Briefcase,
  UserCheck,
  ShieldCheck,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { notificationService } from '../../services/notificationService'
import { cn } from '../../utils/cn'

function formatTimeAgo(isoString) {
  if (!isoString) return 'Just now'
  const date = new Date(isoString)
  const now = new Date()
  const diffInSeconds = Math.max(0, Math.floor((now - date) / 1000))

  if (diffInSeconds < 60) return 'Just now'
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function getNotificationIcon(type) {
  switch (type) {
    case 'interview_scheduled':
    case 'interview_updated':
      return <Calendar className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
    case 'candidate_shortlisted':
      return <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
    case 'application_submitted':
    case 'new_application':
      return <Briefcase className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
    case 'job_approved':
      return <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
    case 'recruiter_activity':
      return <UserCheck className="w-4 h-4 text-blue-500 dark:text-blue-400" />
    default:
      return <Bell className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
  }
}

export function NotificationDropdown({ className }) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState('all') // 'all' | 'unread'
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    async function loadNotifications() {
      try {
        const data = await notificationService.getNotifications()
        if (isMounted && data && Array.isArray(data.notifications)) {
          setNotifications(data.notifications)
          setUnreadCount(data.unreadCount ?? data.notifications.filter((n) => !n.read).length)
        }
      } catch (err) {
        console.warn('Failed to fetch notifications:', err)
      }
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleMarkAsRead = async (e, notif) => {
    e.stopPropagation()
    if (notif.read) return
    try {
      await notificationService.markAsRead(notif.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleItemClick = async (notif) => {
    if (!notif.read) {
      try {
        await notificationService.markAsRead(notif.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (err) {
        console.error('Failed to mark notification as read on click:', err)
      }
    }
    setIsOpen(false)
    if (notif.link) {
      navigate(notif.link)
    }
  }

  const displayedNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer',
          isOpen && 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
        )}
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-[#161928]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#161928] border border-slate-200/80 dark:border-[#282D4A] shadow-xl shadow-slate-900/10 dark:shadow-black/40 z-50 overflow-hidden flex flex-col max-h-[540px] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-100 dark:border-[#282D4A]/60 flex items-center justify-between bg-slate-50/50 dark:bg-[#1A1D2E]/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="px-4 py-2 border-b border-slate-100 dark:border-[#282D4A]/60 flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer',
                filter === 'all'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer',
                filter === 'unread'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-[#282D4A]/40">
            {displayedNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  {filter === 'unread'
                    ? 'You have read all your recent notifications.'
                    : 'We will notify you about application updates, interview schedules, and recruiter activity.'}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={cn(
                    'p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-[#1A1D2E]/60 transition-colors cursor-pointer group relative',
                    !notif.read && 'bg-indigo-50/30 dark:bg-indigo-950/20'
                  )}
                >
                  {/* Status Indicator Icon */}
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-[#282D4A] flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5">
                      <p className={cn(
                        'text-xs font-semibold truncate',
                        notif.read
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-900 dark:text-white font-bold'
                      )}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(notif.createdAt)}</span>
                      {notif.link && (
                        <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mark single as read button */}
                  {!notif.read && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkAsRead(e, notif)}
                      title="Mark as read"
                      className="absolute right-3 top-3 p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 border-t border-slate-100 dark:border-[#282D4A]/60 bg-slate-50/50 dark:bg-[#1A1D2E]/50 text-center">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Notifications update automatically in real-time
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
