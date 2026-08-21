import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swords, Zap, CheckCircle2, ArrowRight, Code2, Globe, Cpu, Flame, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getDailyChallenges, DIFFICULTY_META } from '../data/arenaChallenges'

const DAILY_TASK_COUNT = 6

const categoryIcon = (category) => {
  if (category === 'Web Architecture') return { Icon: Globe, cls: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' }
  if (category === 'System Optimization') return { Icon: Cpu, cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' }
  return { Icon: Code2, cls: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' }
}

const getLocalDateStr = () => {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

const msUntilMidnight = () => {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return midnight.getTime() - now.getTime()
}

const formatCountdown = (ms) => {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function CodingArena() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [dateStr, setDateStr] = useState(getLocalDateStr)
  const [countdown, setCountdown] = useState(msUntilMidnight())
  const [completedChallengeIds, setCompletedChallengeIds] = useState([])
  const [dailyXp, setDailyXp] = useState(0)

  // Daily solved state — written by ChallengeWorkspace on submit, read here.
  // Keys (per-day): arena_completed_tasks_{YYYY-MM-DD} + arena_daily_xp_{YYYY-MM-DD}
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`arena_completed_tasks_${dateStr}`)
      const parsed = raw ? JSON.parse(raw) : []
      setCompletedChallengeIds(Array.isArray(parsed) ? parsed : [])
    } catch (_) {
      setCompletedChallengeIds([])
    }
    try {
      setDailyXp(Number(localStorage.getItem(`arena_daily_xp_${dateStr}`) || 0))
    } catch (_) {
      setDailyXp(0)
    }
  }, [dateStr])

  // Live reset countdown (1s tick) + auto day-flip at midnight → new 6 tasks
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(msUntilMidnight())
      setDateStr((prev) => {
        const next = getLocalDateStr()
        return prev === next ? prev : next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Deterministic date-seeded rotation — exactly 6 tasks, rotates at midnight
  const dailyChallenges = useMemo(() => getDailyChallenges(dateStr), [dateStr])

  // Permanent completion lock — source of truth is the DB (profiles.solved_challenges)
  const permanentCompleted = Array.isArray(profile?.solved_challenges) ? profile.solved_challenges : []

  const solvedCount = completedChallengeIds.length
  const xpEarnedToday = dailyXp
  const totalCompleted = permanentCompleted.length
  const streak = profile?.streak_count ?? 0

  const statCards = [
    { icon: CheckCircle2, label: 'Solved Today', value: solvedCount, grad: 'from-emerald-500 to-green-600', glow: 'shadow-emerald-500/30' },
    { icon: Flame, label: 'Arena Streak', value: `${streak} 🔥`, grad: 'from-amber-400 to-orange-600', glow: 'shadow-amber-500/40' },
    { icon: Zap, label: 'XP Earned Today', value: `+${xpEarnedToday}`, grad: 'from-cyan-500 to-blue-600', glow: 'shadow-cyan-500/30' },
    { icon: Trophy, label: 'Total Completed', value: totalCompleted, grad: 'from-purple-500 to-violet-600', glow: 'shadow-purple-500/30' },
  ]

  return (
    <div className="space-y-6">
      {/* Banner — sleek & compact */}
      <div className="rounded-2xl px-5 py-4 shadow-lg bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-cyan-500/10 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-cyan-950/30 border border-blue-500/20 backdrop-blur-xl flex flex-col md:flex-row md:items-center gap-3.5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-300 bg-clip-text text-transparent whitespace-nowrap overflow-hidden text-ellipsis">
              🔥 Today's Arena Battles <span className="text-sm font-bold opacity-80">(6 Daily Tasks)</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              2 Easy · 2 Medium · 2 Hard/Insane — new battles drop at midnight
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.2)] tabular-nums">
            <CheckCircle2 className="w-3.5 h-3.5" /> Progress: {solvedCount} / {DAILY_TASK_COUNT} Solved
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 shadow-[0_0_16px_rgba(59,130,246,0.25)] tabular-nums">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Resets in {formatCountdown(countdown)}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-3.5"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-lg ${s.glow} shrink-0`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{s.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums leading-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Daily task grid — exactly 6 cards, 3x2 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {dailyChallenges.map((c) => {
          const isCompleted = completedChallengeIds.includes(c.id) || permanentCompleted.includes(c.id)
          const { Icon, cls } = categoryIcon(c.category)
          return (
            <div
              key={c.id}
              onClick={() => { if (!isCompleted) navigate(`/challenges/${c.id}`) }}
              className={`h-[220px] border rounded-2xl p-4 shadow-md transition-all duration-300 flex flex-col justify-between ${
                isCompleted
                  ? 'bg-slate-900/90 border-emerald-500/40 cursor-not-allowed'
                  : `bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md ${DIFFICULTY_META[c.difficulty].glow} hover:-translate-y-1 hover:shadow-xl cursor-pointer`
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cls}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> ✓ Solved
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 truncate">{c.title}</h3>
                <p className="text-[13px] text-slate-600 dark:text-slate-400 mb-2 leading-5 line-clamp-2">{c.desc}</p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-semibold px-2.5 py-1 rounded-full text-xs ${DIFFICULTY_META[c.difficulty].cls}`}>
                    {c.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                    <Zap className="w-3 h-3" /> +{c.xp} XP
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!isCompleted) navigate(`/challenges/${c.id}`)
                  }}
                  disabled={isCompleted}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-center font-semibold transition-all duration-200 focus:outline-none ${
                    isCompleted
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 cursor-not-allowed opacity-80 pointer-events-none'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-md shadow-cyan-500/20 focus:ring-2 focus:ring-cyan-500/50'
                  }`}
                >
                  {isCompleted ? '✓ Completed' : 'Solve Challenge'} {!isCompleted && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
