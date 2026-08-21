import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, BellOff, ChevronRight } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'
import { NOTIFICATION_TYPE_STYLES, timeAgo } from '../lib/notificationHelpers'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'activity', label: 'Activity' },
]

function NotifCard({ notif, onClick }) {
  const style = NOTIFICATION_TYPE_STYLES[notif.type] || NOTIFICATION_TYPE_STYLES.general
  const Icon = style.icon
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 text-left px-3 py-3 transition-colors cursor-pointer ${
        notif.is_read
          ? 'opacity-60 hover:opacity-90'
          : 'bg-sky-500/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.04]'
      }`}
    >
      <span className={`mt-0.5 w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${style.iconBg}`}>
        <Icon className="w-4 h-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className={`text-xs font-bold ${notif.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
            {notif.title}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{timeAgo(notif.created_at)}</span>
        </span>
        <span className="block text-xs leading-relaxed text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</span>
      </span>
      {!notif.is_read && <span className="mt-1.5 w-2 h-2 shrink-0 rounded-full bg-sky-500" />}
    </button>
  )
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const wrapRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const visible = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.is_read)
    if (filter === 'activity') return notifications.filter((n) => ['activity', 'course', 'leaderboard'].includes(n.type))
    return notifications
  }, [notifications, filter])

  const openNotif = (notif) => {
    if (!notif.is_read) markAsRead(notif.id)
    setOpen(false)
    if (notif.link) navigate(notif.link)
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ring-2 ring-white dark:ring-[#090D16]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#0d1322]/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications &amp; Updates</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread` : 'You\'re all caught up'}
              </p>
            </div>
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all as read
            </button>
          </div>

          {/* Filter tabs */}
          <div className="px-3 pt-2.5 pb-1 flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filter === f.id
                    ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                    : 'text-slate-500 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
            {visible.length === 0 ? (
              <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
                <BellOff className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No notifications</p>
                <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                  {filter === 'unread' ? 'You have no unread notifications.' : 'New updates will appear here.'}
                </p>
              </div>
            ) : (
              visible.slice(0, 12).map((n) => (
                <NotifCard key={n.id} notif={n} onClick={() => openNotif(n)} />
              ))
            )}
          </div>

          {/* Footer */}
          <button
            onClick={() => { setOpen(false); navigate('/notifications') }}
            className="w-full flex items-center justify-center gap-1.5 border-t border-slate-200 dark:border-slate-800 px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            View All Notifications <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}