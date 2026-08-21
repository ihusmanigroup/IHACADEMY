import { Bell, Trophy, BookOpen, Briefcase, Sparkles, Megaphone, Zap } from 'lucide-react'

// Shared visuals for notification types — used by the header dropdown and the
// /notifications activity hub so both surfaces stay in sync.
export const NOTIFICATION_TYPE_STYLES = {
  leaderboard: { icon: Trophy, iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', ring: 'border-amber-500/30' },
  course: { icon: BookOpen, iconBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400', ring: 'border-sky-500/30' },
  internship: { icon: Briefcase, iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', ring: 'border-emerald-500/30' },
  ai: { icon: Sparkles, iconBg: 'bg-violet-500/15 text-violet-600 dark:text-violet-400', ring: 'border-violet-500/30' },
  system: { icon: Megaphone, iconBg: 'bg-slate-500/15 text-slate-600 dark:text-slate-400', ring: 'border-slate-500/30' },
  activity: { icon: Zap, iconBg: 'bg-orange-500/15 text-orange-600 dark:text-orange-400', ring: 'border-orange-500/30' },
  general: { icon: Bell, iconBg: 'bg-slate-500/15 text-slate-600 dark:text-slate-400', ring: 'border-slate-500/30' },
}

export function timeAgo(iso) {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}