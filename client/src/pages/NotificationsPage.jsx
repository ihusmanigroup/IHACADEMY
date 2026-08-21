import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Trophy, Briefcase, Bot, Bell, Sparkles, CheckCircle2, ArrowLeft,
  CheckCheck, BellOff,
} from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'
import { timeAgo } from '../lib/notificationHelpers'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'activity', label: 'Activity' },
]

// Safe icon resolver — unknown types fall back to a neutral Bell icon so a
// missing mapping can never crash the page again.
const renderIcon = (type) => {
  switch (type) {
    case 'leaderboard':
      return <Trophy className="w-5 h-5 text-amber-400" />
    case 'course':
      return <BookOpen className="w-5 h-5 text-blue-400" />
    case 'internship':
      return <Briefcase className="w-5 h-5 text-emerald-400" />
    case 'ai':
      return <Bot className="w-5 h-5 text-purple-400" />
    default:
      return <Bell className="w-5 h-5 text-slate-400" />
  }
}

function PageCard({ notif, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer text-left ${
        notif.is_read
          ? 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-60 hover:opacity-100'
          : 'bg-white dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800/60 shadow-sm hover:border-sky-400/50 dark:hover:border-sky-500/40'
      }`}
    >
      <span className="mt-0.5 w-11 h-11 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center">
        {renderIcon(notif.type)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className={`text-sm font-bold truncate ${notif.is_read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
            {notif.title}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">{timeAgo(notif.created_at)}</span>
        </span>
        <span className="block text-sm leading-relaxed text-slate-600 dark:text-slate-400 mt-1">{notif.message}</span>
        {notif.link && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 mt-2">
            Open <span className="text-sky-400">→</span>
          </span>
        )}
      </span>
      {!notif.is_read && <span className="mt-1 w-2.5 h-2.5 shrink-0 rounded-full bg-sky-500" />}
    </button>
  )
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  const visible = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.is_read)
    if (filter === 'activity') return notifications.filter((n) => ['activity', 'course', 'leaderboard'].includes(n.type))
    return notifications
  }, [notifications, filter])

  const openNotif = (notif) => {
    if (!notif.is_read) markAsRead(notif.id)
    if (notif.link) navigate(notif.link)
  }

  const typeCounts = useMemo(() => {
    const counts = {}
    notifications.forEach((n) => { counts[n.type] = (counts[n.type] || 0) + 1 })
    return counts
  }, [notifications])

  return (
    // Theme-aware wrapper — matches the DashboardLayout content area exactly
    // (light: bg-slate-50 / dark: #090d16) so the page melts into the layout
    // with no white gaps regardless of the active theme.
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 p-6 md:p-8 transition-colors duration-200">
      <div className="max-w-3xl mx-auto">
        {/* Back + Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer mb-3"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-sky-500 dark:text-sky-400" /> Notifications &amp; Updates
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Your activity hub — course progress, internships, leaderboard ranks and announcements.
            </p>
          </div>
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold transition-all shadow-md shadow-sky-500/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </button>
        </div>

        {/* Stats — glassmorphism cards matching the dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: notifications.length, icon: Bell, cls: 'text-slate-600 dark:text-slate-300' },
            { label: 'Unread', value: unreadCount, icon: Bell, cls: 'text-red-500 dark:text-red-400' },
            { label: 'Course', value: typeCounts.course || 0, icon: BookOpen, cls: 'text-sky-500 dark:text-sky-400' },
            { label: 'Internship', value: typeCounts.internship || 0, icon: Briefcase, cls: 'text-emerald-500 dark:text-emerald-400' },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
              <div className={`flex items-center gap-2 ${s.cls}`}>
                <s.icon className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                filter === f.id
                  ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                  : 'text-slate-500 dark:text-slate-500 border border-transparent hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {visible.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl py-16 flex flex-col items-center justify-center text-center">
            {unreadCount === 0 && filter !== 'all' ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mb-3" />
            ) : (
              <BellOff className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-3" />
            )}
            <p className="text-base font-bold text-slate-700 dark:text-white">No notifications here</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 max-w-sm">
              {filter === 'unread' ? 'You have no unread notifications — nice work!' : 'New updates will show up here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((n) => (
              <PageCard key={n.id} notif={n} onClick={() => openNotif(n)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}