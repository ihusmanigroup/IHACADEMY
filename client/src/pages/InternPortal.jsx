import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { usePortalStore } from '../context/PortalContext'
import {
  ArrowRight, ChevronRight, CheckCircle2, GitBranch, Paperclip,
  BadgeCheck, AlertTriangle, ExternalLink,
  Target, Lock, Award, FileCheck, LayoutDashboard, UploadCloud,
  BarChart3, FileText, Hourglass, BookOpen, UserCheck, AlertCircle, XCircle,
} from 'lucide-react'
import CertificateView from '../components/Certificate'
import FreeCoursesView from './FreeCourses'
import { LoadingPortal, ErrorPortal } from '../components/PortalStatus'

const TAB_META = {
  overview: { title: 'Overview', icon: LayoutDashboard },
  assignments: { title: 'Assignments', icon: FileText },
  courses: { title: 'Free Courses', icon: BookOpen },
  submissions: { title: 'Submissions', icon: UploadCloud },
  progress: { title: 'Progress', icon: BarChart3 },
  certificate: { title: 'Certificate', icon: Award },
  lor: { title: 'LOR', icon: FileCheck },
}

function Card({ className = '', children }) {
  return (
    <div className={`bg-white dark:bg-[#0f1420] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs ${className}`}>
      {children}
    </div>
  )
}

function ScoreRing({ value, label }) {
  const { isDark } = useTheme()
  const ringColor = isDark ? '#2563EB' : '#0EA5E9'
  return (
    <div
      className="relative w-32 h-32 rounded-full"
      style={{ background: `conic-gradient(${ringColor} ${value * 3.6}deg, rgba(148,163,184,0.25) 0deg)` }}
    >
      <div className="absolute inset-3 rounded-full bg-white dark:bg-[#0f1420]/80 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-950 dark:text-white">{value}%</span>
        <span className="text-xs text-slate-600 dark:text-slate-500 mt-0.5">{label}</span>
      </div>
    </div>
  )
}

const STATUS_BADGE = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  submitted: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  under_review: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  pending: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  changes_requested: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30',
  draft: 'bg-slate-50 text-slate-600 border-slate-200/60 dark:bg-white/5 dark:text-slate-500 dark:border-white/10',
}

const STATUS_DOT = {
  approved: 'bg-emerald-400',
  submitted: 'bg-amber-400',
  under_review: 'bg-amber-400',
  pending: 'bg-amber-400',
  changes_requested: 'bg-rose-400',
  rejected: 'bg-rose-400',
  draft: 'bg-slate-400',
}

const STATUS_TEXT = {
  approved: 'Approved',
  submitted: 'Under Review',
  under_review: 'Under Review',
  pending: 'Under Review',
  changes_requested: 'Changes Requested',
  rejected: 'Changes Requested',
  draft: 'Draft',
}

function StatusBadge({ status }) {
  if (!status) return null
  const cls = STATUS_BADGE[status] || STATUS_BADGE.submitted
  const dot = STATUS_DOT[status] || 'bg-amber-400'
  const text = STATUS_TEXT[status] || status
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold whitespace-nowrap ${cls}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot}`} /> {text}
    </span>
  )
}

function NeedsEnrollment() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 shadow-2xs">
      <p className="font-bold flex items-center gap-2">
        <Hourglass className="w-4 h-4" /> No Winter 2026-27 enrollment yet
      </p>
      <p className="mt-1.5 text-amber-600/80 dark:text-amber-300/80">
        Your application is approved, but an admin has not placed you in the Winter 2026-27 cohort.
        Contact IH Academy support to activate your enrollment.
      </p>
    </div>
  )
}

/* --------------------------------- Overview -------------------------------- */

function OverviewView({ name }) {
  const navigate = useNavigate()
  const { userTrack, submissions, totals, overallPct, nextAssignment, combinedProgress } = usePortalStore()

  const trackLabel = userTrack || 'Intern'

  const metrics = [
    { icon: <Target className="w-4 h-4 text-sky-500" />, label: 'Overall Progress', value: `${overallPct}%`, sub: 'assignments + mandatory free courses' },
    { icon: <BadgeCheck className="w-4 h-4 text-emerald-500" />, label: 'Approved', value: combinedProgress?.approved ?? totals.approved, sub: `${combinedProgress?.total ?? totals.total} total items (incl. free courses)` },
    { icon: <Hourglass className="w-4 h-4 text-amber-500" />, label: 'Under Review', value: totals.pending, sub: 'awaiting mentor decision' },
    { icon: <AlertTriangle className="w-4 h-4 text-rose-500" />, label: 'Changes Requested', value: totals.revision, sub: 'resubmit to continue' },
  ]

  const recent = submissions.slice(0, 3)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white">Welcome back, {name}</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Winter Internship 2026-27 · Your {trackLabel} roadmap.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1.5 text-sm font-semibold text-cyan-600 dark:text-cyan-300">
            {trackLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/25">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> ACTIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all duration-300 hover:border-sky-300 hover:shadow-md dark:border-slate-800/80 dark:bg-[#0b0f19] dark:hover:border-sky-500/50"
          >
            {/* Subtle background glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-transparent transition-colors duration-500 group-hover:from-cyan-500/5 dark:group-hover:from-cyan-500/10" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-cyan-500 dark:text-cyan-400">{m.icon}</span>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                  {m.label}
                </h3>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {m.value}
                </span>
              </div>

              {m.sub && (
                <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {m.sub}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {nextAssignment ? (
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/20">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Next up</p>
                <p className="text-lg font-bold text-slate-950 dark:text-white">{nextAssignment.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-500 mt-0.5">
                  Week {nextAssignment.week_number} · {nextAssignment.difficulty} · {nextAssignment.hours_label || `${nextAssignment.estimated_hours}h`}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/intern-portal/assignments/${nextAssignment.id}`)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-blue-500 hover:to-cyan-400"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </Card>
      ) : null}

      {recent.length > 0 && (
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-3">Recent submissions</h2>
          <div className="space-y-2.5">
            {recent.map((s) => (
              <button
                key={s.taskId}
                onClick={() => navigate(`/intern-portal/assignments/${s.taskId}`)}
                className="w-full flex items-center gap-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0f1420] px-4 py-3 text-left shadow-2xs transition hover:border-sky-300 dark:hover:border-sky-500/50"
              >
                <FileText className="w-4 h-4 shrink-0 text-sky-500 dark:text-cyan-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{s.taskTitle}</p>
                  <p className="text-[11px] text-slate-500">{s.week} · {s.track}</p>
                </div>
                <StatusBadge status={s.statusKey} />
                <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------------------- Assignments ------------------------------- */

function AssignmentCard({ assignment, locked, weekNumber }) {
  const navigate = useNavigate()
  const { getSubmission, userTrack } = usePortalStore()
  const submission = locked ? null : getSubmission(assignment.id)
  const status = submission?.status || null
  const typeLabel = weekNumber === 4 ? 'Capstone' : 'Task'
  const duration = assignment.hours_label || `${assignment.estimated_hours || 9}h`

  const handleClick = () => {
    if (!locked) {
      navigate(`/intern-portal/assignments/${assignment.id}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={locked}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xs transition-all hover:border-sky-300 hover:shadow-md sm:p-5 dark:border-slate-700/80 dark:bg-[#0b0f19] dark:hover:border-sky-500/50"
    >
      {/* Top Metadata Badges */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Type: {typeLabel}
        </span>
        <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800 dark:bg-sky-500/15 dark:text-sky-300">
          Track: {userTrack || '—'}
        </span>
        <span className="ml-auto text-[11px] font-medium text-slate-400">{duration}</span>
      </div>

      {/* Title & Level */}
      <h4 className="mt-1 text-base font-bold tracking-tight text-slate-900 transition-colors group-hover:text-sky-700 dark:text-white dark:group-hover:text-sky-400">
        {assignment.title}
      </h4>
      <span className="mt-1.5 inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        {assignment.difficulty}
      </span>

      {/* Footer: Status + Action */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        {status ? (
          <StatusBadge status={status} />
        ) : (
          <span className="text-xs font-medium text-slate-400">{locked ? 'Locked' : 'Not Started'}</span>
        )}
        <span
          className={`flex items-center gap-1 text-xs font-bold transition-colors ${
            locked
              ? 'text-slate-300 dark:text-slate-600'
              : 'cursor-pointer text-sky-600 hover:text-sky-700 hover:underline dark:text-sky-400 dark:hover:text-sky-300'
          }`}
        >
          {locked ? 'Locked' : submission?.status ? 'Continue' : 'Start Task'}
          {!locked && <span className="text-base leading-none">→</span>}
        </span>
      </div>
    </button>
  )
}

function WeekBlock({ week, unlockedWeek }) {
  const locked = week.week_number > unlockedWeek
  const isCurrent = week.week_number === unlockedWeek
  const assignmentCount = (week.assignments || []).length
  return (
    <Card className={`p-5 sm:p-6 ${locked ? 'opacity-90' : ''}`}>
      {/* Section Heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            Week {week.week_number}
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1 dark:text-slate-400">
            {week.title} · {assignmentCount} assignments
          </p>
        </div>
        {locked ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/25">
            <Lock className="w-3.5 h-3.5" /> Locks until the previous week is fully approved
          </span>
        ) : isCurrent ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100/80 px-3 py-1.5 text-xs font-bold text-sky-700 ring-1 ring-inset ring-sky-200/70 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30">
            Current week
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-200/70 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10">
            <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
          </span>
        )}
      </div>

      <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {(week.assignments || []).map((a) => (
          <AssignmentCard key={a.id} assignment={a} locked={locked} weekNumber={week.week_number} />
        ))}
      </div>
    </Card>
  )
}

function AssignmentsView() {
  const navigate = useNavigate()
  const { context, weeks, unlockedWeek, getSubmission, nextAssignment, userTrack } = usePortalStore()
  const [view, setViewMode] = useState('all')
  const [activeWeek, setActiveWeek] = useState(null)
  const [lockMessage, setLockMessage] = useState(null)
  const gridRef = useRef(null)

  if (!context) return null

  const sortedWeeks = [...weeks].sort((a, b) => a.week_number - b.week_number)

  const countApproved = (week) => {
    let approved = 0
    for (const a of week?.assignments || []) {
      const s = getSubmission(a.id)
      if (s && s.status === 'approved') approved += 1
    }
    return approved
  }

  const currentWeek = sortedWeeks.find((w) => w.week_number === unlockedWeek) || sortedWeeks[0]
  const nextWeek = sortedWeeks.find((w) => w.week_number === unlockedWeek + 1)
  const capstoneWeek = sortedWeeks[sortedWeeks.length - 1]
  const currentCount = (currentWeek?.assignments || []).length

  const tasksTotal = sortedWeeks.reduce((sum, w) => sum + (w.assignments || []).length, 0)
  const approvedAll = sortedWeeks.reduce((sum, w) => sum + countApproved(w), 0)

  const capstoneWeekNum = capstoneWeek?.week_number ?? null

  const visibleWeeks = sortedWeeks.filter((w) => {
    if (view === 'plan') return w.week_number !== capstoneWeekNum
    if (view === 'capstones') return w.week_number === capstoneWeekNum
    if (view === 'week') return activeWeek === null || w.week_number === activeWeek
    return true
  })

  const metricCards = [
    {
      title: 'Current Week',
      desc: `Week ${unlockedWeek} · ${currentWeek?.title || 'Foundation & Workflow'}`,
      badge: `${countApproved(currentWeek)}/${currentCount}`,
    },
    {
      title: 'Next Phase',
      desc: nextWeek ? `Week ${nextWeek.week_number} · ${nextWeek.title}` : 'You are on the final week',
      badge: `${countApproved(nextWeek)}/${(nextWeek?.assignments || []).length}`,
    },
    {
      title: 'Capstone',
      desc: 'Final showcase project required to complete your track.',
      badge: `${countApproved(capstoneWeek)}/${(capstoneWeek?.assignments || []).length} required`,
    },
    {
      title: 'Overall Progress',
      desc: 'All weekly assignments across the roadmap.',
      badge: `${approvedAll}/${tasksTotal} completed`,
    },
  ]

  const selectWeek = (week) => {
    if (week.week_number > unlockedWeek) {
      setLockMessage("Complete and get approval for all previous week's courses and assignments to unlock this week.")
      return
    }
    setLockMessage(null)
    setActiveWeek(week.week_number)
    setViewMode('week')
  }

  const setView = (nextView) => {
    setLockMessage(null)
    setActiveWeek(null)
    setViewMode(nextView)
  }

  const openCapstones = () => {
    setView('capstones')
    requestAnimationFrame(() => {
      gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const openCurrentAssignment = () => {
    const pending =
      (currentWeek?.assignments || []).find((a) => {
        const s = getSubmission(a.id)
        return !s || s.status !== 'approved'
      }) || (currentWeek?.assignments || [])[0]
    if (pending) {
      navigate(`/intern-portal/assignments/${pending.id}`)
    } else if (nextAssignment) {
      navigate(`/intern-portal/assignments/${nextAssignment.id}`)
    }
  }

  const togglePills = [
    { id: 'plan', label: 'Plan' },
    { id: 'capstones', label: 'Capstones' },
    { id: 'all', label: 'All' },
  ]

  const weekPillBase =
    'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400/40'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white">Assignments · {userTrack || 'Winter Internship'}</h1>
        <p className="mt-1 mb-6 text-sm font-medium text-slate-500 dark:text-slate-400">
          Plan shows your standard roadmap weeks, Capstones the final showcase week, and All weeks the full map.
        </p>
      </div>

      {weeks.length === 0 ? (
        <Card className="py-14 text-center">
          <FileText className="w-10 h-10 mx-auto text-slate-400" />
          <p className="mt-3 font-semibold text-slate-900 dark:text-slate-100">No assignments yet</p>
          <p className="mt-1 text-sm text-slate-500">Assignments will appear here once your enrollment is active.</p>
        </Card>
      ) : (
        <>
          {/* View Toggle */}
          <div className="inline-flex flex-wrap items-center gap-2">
            {togglePills.map((t) => (
              <button
                key={t.id}
                onClick={() => setView(t.id)}
                className={`inline-flex items-center rounded-lg px-4 py-1.5 text-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400/40 ${
                  view === t.id
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold dark:bg-white/[0.06] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-white/[0.1]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Hero: Current Week */}
          <div className="flex flex-col gap-4 rounded-2xl border border-sky-200/80 bg-sky-50/80 p-5 shadow-2xs md:flex-row md:items-center md:justify-between dark:border-sky-500/30 dark:bg-sky-500/10">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                  My Assignment Plan
                </span>
                <span className="rounded-full bg-sky-100/80 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                  Current week: Week {unlockedWeek}
                </span>
              </div>
              <h2 className="mt-1 mb-1 text-2xl font-bold text-slate-900 dark:text-white">Week {unlockedWeek}</h2>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {currentWeek?.title} · {currentCount} assignments
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={openCurrentAssignment}
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-sky-700"
              >
                Open assignment <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={openCapstones}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/[0.05]"
              >
                Capstones <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Row 1: Week Tabs */}
          <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Weeks">
            <button
              role="tab"
              aria-selected={view === 'all'}
              onClick={() => setView('all')}
              className={`${weekPillBase} ${
                view === 'all'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold dark:bg-white/[0.06] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-white/[0.1]'
              }`}
            >
              All weeks ({tasksTotal})
            </button>
            {sortedWeeks.map((week) => {
              const locked = week.week_number > unlockedWeek
              const isActive =
                (view === 'week' && week.week_number === activeWeek) ||
                (view === 'capstones' && week.week_number === capstoneWeekNum)
              const isCurrent = week.week_number === unlockedWeek
              const count = (week.assignments || []).length
              return (
                <button
                  key={week.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => selectWeek(week)}
                  className={`${weekPillBase} ${
                    isActive
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : locked
                        ? 'bg-white/80 border border-slate-200 text-slate-400 font-semibold opacity-60 cursor-not-allowed dark:bg-white/[0.03] dark:border-white/10 dark:text-slate-500'
                        : isCurrent
                          ? 'bg-sky-50/80 border border-sky-300 text-sky-700 font-bold dark:bg-sky-500/10 dark:border-sky-500/40 dark:text-sky-300'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold dark:bg-white/[0.06] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-white/[0.1]'
                  }`}
                >
                  Week {week.week_number}
                  {isCurrent && <span className="text-[10px] font-bold opacity-80">Now</span>}
                  <span className={isActive ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}>({count})</span>
                </button>
              )
            })}
          </div>

          {/* Metric Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metricCards.map((card) => (
              <div
                key={card.title}
                className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-sky-300 hover:shadow-xs dark:border-slate-700/80 dark:bg-[#0f1420] dark:hover:border-sky-500/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{card.title}</p>
                  <span className="whitespace-nowrap rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                    {card.badge}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{card.desc}</p>
              </div>
            ))}
          </div>

          {lockMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              {lockMessage}
            </div>
          )}

          <div ref={gridRef} className="scroll-mt-24 space-y-6">
            {visibleWeeks.map((week) => (
              <WeekBlock key={week.id} week={week} unlockedWeek={unlockedWeek} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ------------------------------- Submissions ------------------------------- */

function SubmissionsView() {
  const navigate = useNavigate()
  const { submissions } = usePortalStore()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white">Submissions</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 mb-6">Your submitted solutions and their review status.</p>
      </div>
      {submissions.length === 0 ? (
        <Card className="py-14 text-center">
          <UploadCloud className="w-10 h-10 mx-auto text-slate-400" />
          <p className="mt-3 font-semibold text-slate-900 dark:text-slate-200">No submissions yet</p>
          <p className="mt-1 text-sm text-slate-500">Submit your first assignment from the Assignments tab.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0f1420] shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-[11px] uppercase tracking-widest text-slate-500">
                  <th className="px-4 py-3.5 font-semibold">Assignment</th>
                  <th className="px-4 py-3.5 font-semibold">Week</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 font-semibold">Score</th>
                  <th className="px-4 py-3.5 font-semibold">Submitted</th>
                  <th className="px-4 py-3.5 font-semibold">Links</th>
                  <th className="px-4 py-3.5 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {submissions.map((s) => (
                  <tr key={s.taskId} className="transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">{s.taskTitle}</td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{s.week}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={s.statusKey} /></td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{s.score != null ? s.score : '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {s.submitDate ? new Date(s.submitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {s.githubUrl && (
                          <a href={s.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 dark:border-white/10 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:border-sky-400/50">
                            <GitBranch className="w-3 h-3" /> Repo
                          </a>
                        )}
                        {s.liveUrl && (
                          <a href={s.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 dark:border-white/10 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:border-sky-400/50">
                            <ExternalLink className="w-3 h-3" /> Live
                          </a>
                        )}
                        {s.pdfName && (
                          <span className="inline-flex items-center gap-1 rounded-lg border border-rose-300/50 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10 px-2 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-300">
                            <Paperclip className="w-3 h-3" /> PDF
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => navigate(`/intern-portal/assignments/${s.taskId}`)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 dark:text-cyan-400 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* --------------------------------- Progress --------------------------------- */

function ProgressView() {
  const navigate = useNavigate()
  const { overallPct, weekProgress, combinedProgress, freeCourseStats } = usePortalStore()
  const freeDone = freeCourseStats?.total > 0 && freeCourseStats?.approved >= freeCourseStats?.total

  return (
    <div className="space-y-6">
      {/* Mandatory requirement banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/30 dark:bg-amber-500/10">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">⚠️ Internship Completion Notice</p>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-amber-700 dark:text-amber-400/90">
              Completing all {freeCourseStats?.total || 8} IH Academy free courses and having your certificates approved is mandatory. Your final Internship Certificate and Letter of Recommendation (LOR) will not be issued without 100% course certificate approval.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/intern-portal/courses')}
          className="shrink-0 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition-all hover:bg-amber-700"
        >
          Go to Free Courses
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white">Progress</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Approval-based progress across the four-week roadmap and mandatory IH Academy free courses.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center py-8">
          <ScoreRing value={overallPct} label="Overall" />
          <p className="mt-4 text-xs text-slate-500">
            {combinedProgress?.approved ?? 0} of {combinedProgress?.total ?? 0} items approved
          </p>
        </Card>
        <div className="lg:col-span-2 space-y-4">
          {weekProgress.map((w) => (
            <Card key={w.weekNum}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{w.label} · {w.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {w.approved} of {w.total} items approved
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${
                  w.complete
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/25'
                    : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 ring-slate-300 dark:ring-white/10'
                }`}>
                  {w.complete ? 'Complete' : 'In progress'}
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all"
                  style={{ width: `${w.total ? Math.round((w.approved / w.total) * 100) : 0}%` }}
                />
              </div>
            </Card>
          ))}

          {/* Mandatory Free Courses breakdown card */}
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Mandatory IH Academy Free Courses</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {freeCourseStats?.approved ?? 0} of {freeCourseStats?.total ?? 8} certificates approved
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                {freeDone ? 'Required' : 'In Progress'}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-sky-500 transition-all"
                style={{ width: `${freeCourseStats?.pct ?? 0}%` }}
              />
            </div>
            <button
              type="button"
              onClick={() => navigate('/intern-portal/courses')}
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline dark:text-sky-400"
            >
              Upload Certificates <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------- LOR ----------------------------------- */

function LORView() {
  const { allApproved, overallPct, totals, userTrack, combinedProgress } = usePortalStore()
  const trackName = userTrack || 'Winter Internship'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white">Letter of Recommendation</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 mb-6">Winter Internship 2026-27 · {trackName}</p>
      </div>

      {!allApproved ? (
        <Card className="p-8 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-5">
            <Lock className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Letter of Recommendation Locked</h2>
          <p className="mt-2 max-w-lg mx-auto text-sm text-slate-600 dark:text-slate-400">
            Complete 100% of your roadmap assignments and all mandatory IH Academy free courses to unlock your personalized Letter of Recommendation.
          </p>
          <div className="mt-6 max-w-md mx-auto">
            <div className="h-3 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
              {overallPct}% Complete · {combinedProgress?.approved ?? totals.approved} of {combinedProgress?.total ?? totals.total} items approved
            </p>
          </div>
          <p className="mt-4 max-w-lg mx-auto text-xs text-slate-500 dark:text-slate-400">
            LORs are awarded to top performers who complete the entire roadmap. The letter is personalized based on your track, performance, and mentor feedback.
          </p>
        </Card>
      ) : (
        <Card className="p-8">
          <div className="bg-white dark:bg-[#0f1420] rounded-2xl border-2 border-purple-500/30 p-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/10 rounded-full flex items-center justify-center">
                <FileCheck className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400">Letter of Recommendation Unlocked!</h2>
                <p className="text-sm text-purple-600 dark:text-purple-400">Eligible for personalized LOR</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-6 text-left space-y-3">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Intern Name</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{trackName} Intern</p>
              </div>
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Track</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{trackName}</p>
              </div>
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Program</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">Winter Internship 2026-27</p>
              </div>
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Overall Score</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{overallPct}%</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Items Approved</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{combinedProgress?.approved ?? totals.approved} of {combinedProgress?.total ?? totals.total}</p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition hover:from-purple-400 hover:to-indigo-400">
                <FileCheck className="w-4 h-4" /> Request LOR
              </button>
              <button className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                <FileText className="w-4 h-4" /> View Template
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center">
              LORs are issued by IH Usmani Group after cohort completion. Requests are reviewed by mentors.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

/* ---------------------------------- Portal ---------------------------------- */

// Minimum time between silent background refreshes when switching tabs, so
// rapid tab toggling preserves the cached data instead of firing an RPC per
// click. A later switch (past the window) still silently refreshes in place.
const REFRESH_MIN_INTERVAL = 15_000

function PortalView({ name }) {
  const { tab = 'overview' } = useParams()
  const { context, loading, error, refresh } = usePortalStore()
  const hasMountedRef = useRef(false)
  const lastRefreshAtRef = useRef(Date.now())

  // Silent background refresh on tab switch: the cached data stays on screen
  // while `refresh()` (silent once data exists) swaps in fresh results in
  // place — never a skeleton. Skipped on first render because the store
  // already performs the initial load, and throttled so back-to-back switches
  // within REFRESH_MIN_INTERVAL reuse the data instead of refetching.
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    const now = Date.now()
    if (now - lastRefreshAtRef.current < REFRESH_MIN_INTERVAL) return
    lastRefreshAtRef.current = now
    refresh()
  }, [tab, refresh])

  // Show the full-page skeleton only on the very first load. Once cached
  // context exists, render the tab immediately — background refreshes update
  // the data in place instead of blanking the page.
  const showSkeleton = loading && !context
  if (showSkeleton) return <LoadingPortal />
  if (error && !context) return <ErrorPortal message={error} />
  if (!context) return null
  if (context.needs_enrollment) return <NeedsEnrollment />

  const meta = TAB_META[tab] || TAB_META.overview
  const Icon = meta.icon

  return (
    <>
      <div className="mb-5 flex items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500/10 to-cyan-400/10 px-3.5 py-1.5 text-xs font-bold text-sky-600 dark:text-cyan-300 ring-1 ring-inset ring-sky-500/25">
          <Icon className="w-3.5 h-3.5" /> Winter Internship 2026-27
        </span>
      </div>
      {(() => {
        switch (tab) {
          case 'assignments':
            return <AssignmentsView />
          case 'courses':
            return <FreeCoursesView />
          case 'submissions':
            return <SubmissionsView />
          case 'progress':
            return <ProgressView />
          case 'certificate':
            return <CertificateView />
          case 'lor':
            return <LORView />
          default:
            return <OverviewView name={name} />
        }
      })()}
    </>
  )
}

/**
 * Rendered inside the /intern-portal layout (<Outlet />) so only the active
 * tab content changes on navigation — the shell and PortalProvider stay
 * mounted in InternPortalLayout.
 */
export default function InternPortal() {
  const { context, applicationStatus } = usePortalStore()
  const app = context?.application || {}
  const name = (app.full_name || app.email || 'Intern').split(' ')[0] || 'Intern'

  // Gate the portal behind application approval
  if (applicationStatus === 'pending' || applicationStatus === 'shortlisted') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#090d16] px-6 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
            <Hourglass className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Application Under Review</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Your application is currently being reviewed by the IH Academy Admissions Team.
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">
            Once approved, you will unlock your onboarding step here and gain access to the internship portal.
          </p>
          <div className="mt-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Status: <span className="font-semibold text-amber-600 dark:text-amber-400 capitalize">{applicationStatus}</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (applicationStatus === 'rejected') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#090d16] px-6 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-rose-600 dark:text-rose-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Application Status: Not Selected</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Thank you for applying to the IH Academy Winter Internship 2026-27.
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">
            After careful review, we regret to inform you that your application was not selected for this cohort.
          </p>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">
            We encourage you to apply for future cohorts and continue building your skills with IH Academy courses.
          </p>
        </div>
      </div>
    )
  }

  // applicationStatus === 'approved' or null (fallback to approved behavior)
  return <PortalView name={name} />
}
