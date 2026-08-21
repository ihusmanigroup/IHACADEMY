import { useState, useEffect, useMemo, useId } from 'react'
import { Flame, Zap, ChevronRight, ArrowRight, Trophy, Loader2, BookOpen, Brain, Award, Timer, Crown, CheckCircle2, Play, RotateCcw, Route, Globe, Terminal, Bot, Shield, Code2, Palette, BarChart3, Sword, Sparkles, Sprout, Layers, Ticket, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { mlMajorCourse } from '../data/mlCourseData'
import { resolveLocalCourse, localLessonList, localProgressKey, MAJOR_COURSE_DB_ID } from '../data/coursesData'
import RoadmapModal from '../components/RoadmapModal'
import SyllabusModal from '../components/SyllabusModal'
import {
  COMPLETED_KEY, CAPSTONE_STATUS_KEY, lsKey, loadJson,
  flatLessonsOf, computeUnlockedLessons, computeMajorProgress, nextLessonToDo,
  MODULE_XP_REWARD, resetMajorProgress,
} from '../utils/mlMajorProgress'
import { getPlanTier, vouchersForTier } from '../utils/subscription'

// DB row id of the ML Engineering Major course (enrollments table FK).
const ML_MAJOR_DB_ID = '00000000-0000-4000-8000-000000000001'

// Free DB courses persist their progress in the SAME localStorage key the
// LearnView player writes (`ih_learn_progress_<courseId>`). Mirroring it here
// keeps the dashboard cards and the player in lock-step.
const learnProgressKey = (userId, courseId) => `ih_learn_progress_${userId || 'guest'}_${courseId}`

const CATEGORY_ICON = {
  'Frontend': { icon: Globe, cls: 'from-blue-500/20 to-cyan-500/10 text-cyan-300' },
  'Web Development': { icon: Globe, cls: 'from-blue-500/20 to-cyan-500/10 text-cyan-300' },
  'Backend': { icon: Terminal, cls: 'from-emerald-500/20 to-teal-500/10 text-emerald-300' },
  'AI Fundamentals': { icon: Brain, cls: 'from-cyan-500/20 to-sky-500/10 text-cyan-300' },
  'AI Tools': { icon: Bot, cls: 'from-violet-500/20 to-fuchsia-500/10 text-violet-300' },
  'AI & Data': { icon: BarChart3, cls: 'from-cyan-500/20 to-blue-500/10 text-cyan-300' },
  'Fundamentals': { icon: Shield, cls: 'from-indigo-500/20 to-blue-500/10 text-indigo-300' },
  'Tools': { icon: Code2, cls: 'from-slate-500/20 to-slate-400/10 text-slate-300' },
  'Design': { icon: Palette, cls: 'from-pink-500/20 to-rose-500/10 text-pink-300' },
  'Full-Stack': { icon: Route, cls: 'from-blue-500/20 to-emerald-500/10 text-blue-300' },
}
const DEFAULT_ICON = { icon: BookOpen, cls: 'from-slate-500/20 to-slate-400/10 text-slate-300' }

// Central per-course progress resolver shared by the dashboard cards and the
// Syllabus Drawer. `userProgress` is keyed by courseId and carries either the
// full completed-lesson id list (local rich courses / ML Major) or a plain
// completed count (free DB courses via lesson_completions).
const getCourseProgress = (userProgress, courseId, totalLessons) => {
  const entry = userProgress?.[courseId]
  const list = entry?.completedLessons
  const completedCount = Array.isArray(list) && list.length > 0
    ? list.length
    : (entry?.completedCount || 0)
  const percentage = totalLessons > 0
    ? Math.min(100, Math.round((completedCount / totalLessons) * 100))
    : 0
  return { completedCount, percentage }
}

function ProgressRing({ pct, size = 88, stroke = 8 }) {
  const gid = 'ringGrad' + useId().replace(/:/g, '')
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-slate-200 dark:stroke-slate-700/50" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          stroke={`url(#${gid})`} strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(pct, 100) / 100)}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-extrabold text-slate-900 dark:text-white">{pct}%</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PremiumTrackCard — glassmorphism card for the VVIP Pro / Major section.
// Gradient-border wrapper + ambient glow + large lesson metrics + CTA.
// ---------------------------------------------------------------------------
function PremiumTrackCard({
  row, resumeRoute, ctaLabel, onSyllabus,
  isMajor, majorProgress, statusPill, showRoadmap, onRoadmap, onReset,
}) {
  const meta = CATEGORY_ICON[row.category] || DEFAULT_ICON
  const Icon = meta.icon
  return (
    <div className="group relative overflow-hidden rounded-2xl p-[1.5px] bg-gradient-to-br from-amber-400/80 via-cyan-400/60 to-indigo-500/80 dark:from-amber-400/50 dark:via-cyan-500/40 dark:to-indigo-500/50 shadow-xl shadow-cyan-500/10 transition-transform duration-300 hover:-translate-y-0.5">
      <div className="relative rounded-[15px] bg-white/90 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950/90 backdrop-blur-xl p-6 overflow-hidden h-full transition-all duration-300 dark:hover:shadow-[0_0_30px_rgba(34,211,238,0.12)]">
        {/* Ambient glow blobs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-400/20 transition-colors duration-500" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col h-full">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.cls} border border-white/40 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-md`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-white shadow-sm ${
                  isMajor ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-sky-600'
                }`}>
                  <Crown className="w-3 h-3" /> {isMajor ? 'Major Program' : 'Pro Track'}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 truncate max-w-[220px] lg:max-w-none">
                  {row.title}
                </h4>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {row.category}{row.level ? ` · ${row.level}` : ''}
                </p>
              </div>
            </div>
            <ProgressRing pct={row.progress} size={64} stroke={6} />
          </div>

          {/* Large lesson metrics */}
          <div className="mt-5">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                {row.completedLessonsCount}
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500"> / {row.totalLessonsCount} Lessons Completed</span>
              </p>
              <p className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400">{row.progress}%</p>
            </div>
            <div className="mt-2.5 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-400 to-indigo-500 shadow-[0_0_12px_rgba(6,182,212,0.45)] transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(0, row.progress))}%` }}
              />
            </div>

            {isMajor && majorProgress && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {statusPill && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusPill.cls}`}>
                    <statusPill.icon className="w-3 h-3" /> {statusPill.label}
                  </span>
                )}
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Lessons {majorProgress.lessonPercent}% · Quiz {majorProgress.quizPercent}% · Capstone {majorProgress.capstonePercent}% · +{MODULE_XP_REWARD} XP per module
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-wrap">
            <Link
              to={resumeRoute}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              <Play className="w-4 h-4" /> {ctaLabel}
            </Link>
            <button
              onClick={onSyllabus}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 dark:hover:bg-slate-700/80 transition-all cursor-pointer active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5" /> View Syllabus
            </button>
            {showRoadmap && onRoadmap && (
              <button
                onClick={onRoadmap}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Route className="w-3.5 h-3.5" /> Roadmap
              </button>
            )}
          </div>

          {isMajor && onReset && majorProgress && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={onReset}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-500/80 hover:text-red-500 dark:text-red-400/80 dark:hover:text-red-400 transition-colors cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3 h-3" /> Reset Progress
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardHome() {
  const { user, profile } = useAuth()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [completionsByCourse, setCompletionsByCourse] = useState({})
  const [lastAccessByCourse, setLastAccessByCourse] = useState({})
  const [dbMajorCourse, setDbMajorCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [majorProgress, setMajorProgress] = useState(null)
  const [majorUpdatedAt, setMajorUpdatedAt] = useState(null)
  const [majorResume, setMajorResume] = useState(null)
  // TRUE only when the ML Major has REAL progress persisted in Supabase
  // (user_course_progress). Browser localStorage is NEVER a source of truth
  // for the dashboard — stale local caches must not resurrect progress cards.
  const [majorRemoteExists, setMajorRemoteExists] = useState(false)
  const [roadmapOpen, setRoadmapOpen] = useState(false)
  const [syllabusCourse, setSyllabusCourse] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [copiedVoucher, setCopiedVoucher] = useState(null)
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Hassanullah'

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) { setLoading(false); return }

      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*, courses(*)')
        .eq('user_id', user.id)

      if (enrollments) setEnrolledCourses(enrollments)

      const { data: majorRow } = await supabase
        .from('courses')
        .select('id, title, category, total_lessons, xp_reward')
        .eq('id', ML_MAJOR_DB_ID)
        .maybeSingle()
      if (majorRow) setDbMajorCourse(majorRow)

      // Live per-course completion counts + last access time from
      // lesson_completions — the enrollment row's progress_percent stays
      // 0 for structured courses.
      const ids = (enrollments || []).map((e) => e.course_id)
      if (ids.length > 0) {
        const { data: comps } = await supabase
          .from('lesson_completions')
          .select('course_id, completed_at')
          .eq('user_id', user.id)
          .in('course_id', ids)
        const counts = {}
        const access = {}
        ;(comps || []).forEach((row) => {
          if (!row.course_id) return
          counts[row.course_id] = (counts[row.course_id] || 0) + 1
          if (!access[row.course_id] || new Date(row.completed_at) > new Date(access[row.course_id])) {
            access[row.course_id] = row.completed_at
          }
        })
        setCompletionsByCourse(counts)
        setLastAccessByCourse(access)
      }
      setLoading(false)
    }
    fetchEnrollments()
  }, [user])

  const flatLessons = useMemo(() => flatLessonsOf(), [])

  useEffect(() => {
    const loadMajorProgress = async () => {
      try {
        const localLessons = new Set(loadJson(COMPLETED_KEY, []))
        const localCapstoneStatuses = loadJson(CAPSTONE_STATUS_KEY, {})
        const localQuizSubmitted = loadJson(lsKey('quiz_submitted'), false)

        let remote = { lessons_completed: [], quiz_submitted: false, capstone_status: 'pending' }
        if (user) {
          const { data } = await supabase
            .from('user_course_progress')
            .select('lessons_completed, quiz_submitted, capstone_status, updated_at')
            .eq('user_id', user.id)
            .eq('course_id', MAJOR_COURSE_DB_ID)
            .maybeSingle()
          if (data) remote = data
          // Dashboard visibility is DB-only: the ML Major card may only appear
          // when Supabase itself holds real progress. Local-only caches are
          // ignored here (they are wiped on sign-out via clearLocalLearningState).
          setMajorRemoteExists(
            !!data &&
            ((Array.isArray(data.lessons_completed) && data.lessons_completed.length > 0) ||
              data.quiz_submitted ||
              (data.capstone_status && data.capstone_status !== 'pending'))
          )
        } else {
          setMajorRemoteExists(false)
        }
        setMajorUpdatedAt(remote.updated_at || null)

        const lessons = new Set([...localLessons, ...(remote.lessons_completed || [])])
        const quizSubmitted = localQuizSubmitted || remote.quiz_submitted
        const capstoneStatuses = { ...localCapstoneStatuses }
        if (remote.capstone_status && remote.capstone_status !== 'pending') {
          for (const cap of mlMajorCourse.capstones) {
            if (!capstoneStatuses[cap.id]) capstoneStatuses[cap.id] = remote.capstone_status
          }
        }

        const unlocked = computeUnlockedLessons(flatLessons, lessons)
        const progress = computeMajorProgress(flatLessons, lessons, quizSubmitted, capstoneStatuses, 0)
        const resume = nextLessonToDo(flatLessons, lessons, unlocked)

        const activeMod = mlMajorCourse.modules.find((m) => {
          const modLessons = flatLessons.filter((l) => l.moduleId === m.id)
          return modLessons.some((l) => !lessons.has(l.id)) && modLessons.some((l) => unlocked.has(l.id))
        })

        setMajorProgress({
          ...progress,
          lessonsDone: lessons.size,
          quizSubmitted,
          activeMod,
          xpPerModule: MODULE_XP_REWARD,
        })
        setMajorResume(resume)
      } catch (_) {
        setMajorProgress(null)
        setMajorResume(null)
      }
    }
    loadMajorProgress()
  }, [user, flatLessons, reloadKey])

  // ---- Centralized dynamic progress -------------------------------------------
  // One source of truth for EVERY enrolled course, derived from the exact same
  // storage the viewers + Syllabus Drawer read, so the dashboard cards can
  // never drift from the drawer:
  //   • PRO rich courses (Backend / GenAI / …) -> localStorage `ih_local_progress_<slug>`
  //   • ML Major                                -> local COMPLETED_KEY + remote user_course_progress
  //   • Free DB courses                         -> Supabase lesson_completions counts
  const userProgress = useMemo(() => {
    const map = {}
    const setList = (courseId, ids) => {
      const prev = map[courseId] || {}
      map[courseId] = {
        ...prev,
        completedLessons: ids,
        completedCount: Math.max(prev.completedCount || 0, ids.length),
      }
    }
    const setCount = (courseId, count) => {
      const prev = map[courseId] || {}
      map[courseId] = { ...prev, completedCount: Math.max(prev.completedCount || 0, count || 0) }
    }

    enrolledCourses.forEach((enrollment) => {
      const rich = resolveLocalCourse(enrollment.course_id)
      if (rich) {
        // PRO rich courses (Backend / GenAI / …) — Viewer's localStorage list.
        const ids = loadJson(localProgressKey(rich.id), [])
        setList(enrollment.course_id, Array.isArray(ids) ? ids : [])
      } else {
        // Free DB courses — LearnView mirrors progress to localStorage too, so
        // the dashboard reflects progress even before Supabase sync completes.
        const ids = loadJson(learnProgressKey(user?.id, enrollment.course_id), [])
        setList(enrollment.course_id, Array.isArray(ids) ? ids : [])
      }
    })

    // ML Major: local + remote merged lesson count.
    if (majorProgress) setCount(ML_MAJOR_DB_ID, majorProgress.lessonsDone || 0)

    // Free DB courses: live lesson_completions counts (covers cross-device and
    // cases where the localStorage list has not been written yet).
    Object.entries(completionsByCourse).forEach(([courseId, count]) => setCount(courseId, count))

    return map
  }, [enrolledCourses, completionsByCourse, majorProgress, user?.id])

  // ---- Single source of truth ------------------------------------------------
  // Every enrolled course is normalized ONCE into dashboardData.enrolledCourses.
  // The VVIP "Pro & Major Tracks" section and the "Free & Foundational" section
  // both consume this exact array, so they can never disagree on progress. Each row:
  //   { courseId, title, category, level, xpReward, isPro,
  //     totalLessonsCount, completedLessonsCount, progress, done, status,
  //     lastActivity }
  const dashboardData = useMemo(() => {
    const rows = enrolledCourses.map((enrollment) => {
      const course = enrollment.courses || {}
      const rich = resolveLocalCourse(enrollment.course_id)
      // Local rich courses know their exact lesson count; DB rows fall back to
      // their seeded total_lessons. This matches the Syllabus Drawer's total.
      const total = rich
        ? localLessonList(rich).length || course.total_lessons || 0
        : course.total_lessons || 0
      const { completedCount, percentage } = getCourseProgress(userProgress, enrollment.course_id, total)
      const progress = Math.min(100, Math.max(percentage, enrollment.progress_percent || enrollment.progress || 0))
      return {
        courseId: enrollment.course_id,
        title: course.title || 'Untitled Course',
        category: course.category || '',
        level: course.level || '',
        xpReward: course.xp_reward || 0,
        isPro: course.is_free === false,
        totalLessonsCount: total,
        completedLessonsCount: completedCount,
        progress,
        done: enrollment.status === 'completed' || progress >= 100,
        status: enrollment.status || 'active',
        lastActivity: lastAccessByCourse[enrollment.course_id] || enrollment.enrolled_at || '',
      }
    })
    return { enrolledCourses: rows }
  }, [enrolledCourses, lastAccessByCourse, userProgress])

  // ---- Dynamic aggregates (computed from the same unified rows) ---------------
  const activeCourses = dashboardData.enrolledCourses.filter((r) => r.status === 'active' && !r.done).length
  const completedCourses = dashboardData.enrolledCourses.filter((r) => r.done).length
  const certificationsCount = completedCourses
  const globalRank = profile?.global_rank

  // STRICT DB-only gate: the ML Major card may only appear when Supabase
  // itself has persisted real progress (user_course_progress row with actual
  // activity). Stale browser localStorage can never fabricate it.
  const hasMajorRealProgress = majorRemoteExists

  // PRO majors play in their rich viewers (/ml-major-course or /course/:id);
  // free DB courses use the DB-backed player. Never route a major to the DB
  // route /courses/:id/learn — it has no lessons row there.
  const courseRoute = (row) =>
    row.courseId === ML_MAJOR_DB_ID || row.isMajor
      ? '/ml-major-course'
      : row.isPro
        ? `/course/${row.courseId}`
        : `/courses/${row.courseId}/learn`

  const handleResetProgress = async () => {
    if (!window.confirm('Reset ALL ML Major Course progress? Lessons, Grand Quiz and capstone status return to 0% — Module 1, Lesson 1.1 will become active.')) return
    await resetMajorProgress(user)
    setMajorProgress(null)
    setMajorResume(null)
    setMajorUpdatedAt(null)
    setMajorRemoteExists(false)
    setReloadKey((k) => k + 1)
  }

  const majorOverall = majorProgress?.overallProgress ?? 0
  const majorStatusPill = majorProgress
    ? majorProgress.certificateUnlocked
      ? { icon: Award, label: 'Certificate Unlocked — 100%', cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' }
      : majorProgress.pendingCapstone
        ? { icon: Timer, label: 'Pending / In Progress (90%) — Submit Capstone', cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' }
        : { icon: Zap, label: `In Progress · ${majorOverall}%`, cls: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' }
    : null

  // ---- VVIP section data ------------------------------------------------------
  // The ML Major track card. Visibility requires a real DB enrollment OR real
  // Supabase progress; progress is always overlaid live from user_course_progress.
  const enrolledMajor = dashboardData.enrolledCourses.find((r) => r.courseId === ML_MAJOR_DB_ID)
  const showMajorTrack = hasMajorRealProgress || !!enrolledMajor
  const majorTrackRow = showMajorTrack
    ? {
        courseId: ML_MAJOR_DB_ID,
        title: dbMajorCourse?.title || enrolledMajor?.title || mlMajorCourse.title,
        category: dbMajorCourse?.category || 'AI & Data',
        level: '',
        xpReward: dbMajorCourse?.xp_reward || enrolledMajor?.xpReward || 0,
        isPro: true,
        isMajor: true,
        totalLessonsCount: flatLessons.length,
        completedLessonsCount: majorProgress?.lessonsDone ?? enrolledMajor?.completedLessonsCount ?? 0,
        progress: majorProgress?.overallProgress ?? enrolledMajor?.progress ?? 0,
        done: majorProgress?.certificateUnlocked ?? enrolledMajor?.done ?? false,
        status: 'active',
        lastActivity: majorUpdatedAt || enrolledMajor?.lastActivity || '',
      }
    : null

  // Paid & major tracks (top priority section) — newest access first.
  const paidTracks = dashboardData.enrolledCourses
    .filter((r) => r.isPro && r.courseId !== ML_MAJOR_DB_ID)
    .concat(majorTrackRow ? [majorTrackRow] : [])
    .sort((a, b) => new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0))

  // Free & foundational courses (secondary section) — newest access first.
  const freeTracks = [...dashboardData.enrolledCourses]
    .filter((r) => !r.isPro)
    .sort((a, b) => new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0))

  const ctaLabelFor = (row) => (row.done ? 'Review Course' : row.progress > 0 ? 'Continue Learning' : 'Start Course')

  const resumeRouteFor = (row) => {
    if (!row.isMajor) return courseRoute(row)
    if (majorProgress?.pendingCapstone) return '/ml-major-course?tab=capstone'
    if (majorResume) return `/ml-major-course?lesson=${majorResume.id}`
    return '/ml-major-course'
  }

  const openToFor = (row) => (row.isMajor ? '/ml-major-course' : courseRoute(row))

  // Fresh-slate state: no DB enrollments AND no real ML Major progress. In
  // this state we render a clean Empty State instead of any 0% progress cards.
  const isEmptyState =
    dashboardData.enrolledCourses.length === 0 && !hasMajorRealProgress

  return (
    <div className="space-y-6 animate-in fade-in duration-300 slide-in-from-bottom-2">
      {/* ============ HERO — VVIP Glass Banner ============ */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 dark:rounded-3xl p-6 shadow-sm dark:shadow-2xl transition-colors duration-300">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -left-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Developer Command Center
            </p>
            <h2 className="text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:via-slate-200 dark:to-cyan-400 dark:bg-clip-text dark:text-3xl text-2xl font-extrabold tracking-tight leading-snug">
              Welcome back, {displayName} 👋
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5">
              Ready to push your code to the next level today?
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:border dark:border-amber-500/30 dark:text-amber-300 dark:font-bold dark:px-4 dark:py-1.5 dark:rounded-full dark:shadow-[0_0_12px_rgba(245,158,11,0.2)] border border-amber-500/30 font-semibold shadow-sm shadow-amber-500/20 px-4 py-2 rounded-xl text-sm">
              <Flame className="w-4 h-4" />
              {profile?.streak_count ?? 0} Day Streak
            </span>
            <span className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:border dark:border-cyan-500/30 dark:text-cyan-300 dark:font-bold dark:px-4 dark:py-1.5 dark:rounded-full dark:shadow-[0_0_12px_rgba(34,211,238,0.2)] border border-cyan-500/30 font-semibold shadow-sm shadow-cyan-500/20 px-4 py-2 rounded-xl text-sm">
              <Zap className="w-4 h-4" />
              {profile?.xp ?? 0} XP Earned
            </span>
          </div>
        </div>
      </div>

      {/* ============ STATS GRID — 4 Glass Cards ============ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 dark:shadow-2xl rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 shadow-sm">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-3 rounded-xl shadow-md shadow-blue-500/20 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{activeCourses}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5">Active Courses</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{activeCourses} Track{activeCourses !== 1 ? 's' : ''} in progress</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 dark:shadow-2xl rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 shadow-sm">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-3 rounded-xl shadow-md shadow-purple-500/20 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{certificationsCount}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5">Certifications</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Earned on course completion</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 dark:shadow-2xl rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 shadow-sm">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-3 rounded-xl shadow-md shadow-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{completedCourses}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5">Completed</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{completedCourses} of {dashboardData.enrolledCourses.length} enrolled</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 dark:shadow-2xl rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 shadow-sm">
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-3 rounded-xl shadow-md shadow-amber-500/20 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {globalRank ? `#${globalRank}` : '--'}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5">Global Rank</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Position on the XP leaderboard</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400 dark:text-slate-300" />
        </div>
      ) : isEmptyState ? (
        /* ============ EMPTY STATE — fresh user, nothing enrolled ============ */
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl p-10 text-center">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-5">
              <Route className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No Active Courses
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              You haven&apos;t enrolled in any courses yet. Pick a track (Paid or Free) to start learning.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                Browse Courses Catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ============ 👑 VVIP PREMIUM SECTION — Pro & Major Enrolled Tracks ============ */}
          {paidTracks.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-lg dark:text-xl font-bold tracking-wide text-slate-900 dark:text-white dark:drop-shadow-sm flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0 dark:shadow-[0_0_18px_rgba(251,191,36,0.35)]">
                      <Crown className="w-5 h-5" />
                    </span>
                    Pro &amp; Major Enrolled Tracks
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Your premium tracks — resume exactly where you left off.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-3 h-3" /> VVIP
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {paidTracks.map((row) => (
                  <PremiumTrackCard
                    key={row.courseId}
                    row={row}
                    isMajor={!!row.isMajor}
                    resumeRoute={resumeRouteFor(row)}
                    ctaLabel={ctaLabelFor(row)}
                    onSyllabus={() => setSyllabusCourse(row)}
                    majorProgress={row.isMajor ? majorProgress : null}
                    statusPill={row.isMajor ? majorStatusPill : null}
                    showRoadmap={row.isMajor && !!majorProgress}
                    onRoadmap={row.isMajor ? () => setRoadmapOpen(true) : null}
                    onReset={row.isMajor ? handleResetProgress : null}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ============ 🌱 SECONDARY SECTION — Free & Foundational Courses ============ */}
          {freeTracks.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-lg dark:text-xl font-bold tracking-wide text-slate-900 dark:text-white dark:drop-shadow-sm flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0 dark:shadow-[0_0_18px_rgba(52,211,153,0.35)]">
                      <Sprout className="w-5 h-5" />
                    </span>
                    Free &amp; Foundational Courses
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Quick wins and building blocks to round out your skillset.
                  </p>
                </div>
                <Link to="/courses" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 transition-colors">
                  View All Courses <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {freeTracks.map((row) => {
                  const meta = CATEGORY_ICON[row.category] || DEFAULT_ICON
                  const Icon = meta.icon
                  return (
                    <div
                      key={row.courseId}
                      className="group flex items-center gap-3 bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950/90 border border-slate-200 dark:border-slate-800 dark:hover:border-cyan-500/40 rounded-xl dark:rounded-2xl p-4 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-500/5 dark:hover:shadow-[0_0_30px_rgba(34,211,238,0.12)]"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${meta.cls} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate flex-1">
                            {row.title}
                          </p>
                          {row.done && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                          {row.completedLessonsCount} / {row.totalLessonsCount} lessons completed · {row.progress}%
                        </p>
                        <div className="mt-1.5 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              row.done
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, row.progress))}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Link
                          to={courseRoute(row)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-3 py-1.5 rounded-lg shadow-md shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
                        >
                          <Play className="w-3 h-3" /> {row.done ? 'Review Course' : row.progress > 0 ? 'Continue Learning' : 'Start Course'}
                        </Link>
                        <button
                          onClick={() => setSyllabusCourse(row)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                        >
                          <Layers className="w-3 h-3" /> View Syllabus
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}

      {/* ============ CODING ARENA / Daily Challenge — always visible ============ */}
      <div className="bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 dark:rounded-2xl dark:shadow-2xl rounded-2xl p-6 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sword className="w-4 h-4 text-violet-500 dark:text-violet-400" /> Coding Arena
          </h3>
          <Link to="/arena" className="text-sm text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 transition-colors">
            Visit Arena <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-cyan-500/10 p-5">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400">
                  <Sparkles className="w-3 h-3" /> Today&apos;s Challenge
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/20">
                  <Zap className="w-3 h-3" /> +50 XP Reward
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                Daily Algorithm Challenge: Binary Tree Traversal
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                Solve today&apos;s problem in the Coding Arena — beat the clock, climb the leaderboard, and bank the XP before midnight.
              </p>
            </div>
            <Link
              to="/arena"
              className="shrink-0 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              Enter Arena <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ============ IH USMANI GROUP PERK VOUCHERS — Pro & Exclusive ============ */}
      {getPlanTier(profile) !== 'free' && vouchersForTier(profile).length > 0 && (
        <section className="bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl border border-slate-200 dark:border-slate-800 dark:rounded-2xl dark:shadow-2xl rounded-2xl p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-amber-500 dark:text-amber-400" /> IH Usmani Group Perk Coupons
            </h3>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Sparkles className="w-3 h-3" /> {getPlanTier(profile) === 'exclusive' ? 'Exclusive Member' : 'Pro Member'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vouchersForTier(profile).map((v) => (
              <div
                key={v.id}
                className={`rounded-xl border p-4 transition-all duration-300 ${
                  v.status === 'soon'
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-white/[0.02] opacity-80'
                    : 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-white to-white dark:from-amber-500/10 dark:via-transparent dark:to-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{v.title}</p>
                      {v.status === 'exclusive' && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">Exclusive</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{v.description}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {v.expiry}
                    </p>
                  </div>
                  {v.status !== 'soon' ? (
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(v.code).catch(() => {})
                        setCopiedVoucher(v.id)
                        setTimeout(() => setCopiedVoucher(null), 2000)
                      }}
                      className="shrink-0 inline-flex flex-col items-center gap-1 rounded-lg border border-dashed border-amber-500/50 bg-white/80 dark:bg-white/5 px-3 py-2 transition-all duration-200 hover:border-amber-400 hover:bg-amber-500/10"
                      title="Click to copy"
                    >
                      <code className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{v.code}</code>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {copiedVoucher === v.id ? 'Copied!' : 'Tap to copy'}
                      </span>
                    </button>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5">
                      <Clock className="w-3 h-3" /> Soon
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {roadmapOpen && (
        <RoadmapModal
          course={mlMajorCourse}
          onClose={() => setRoadmapOpen(false)}
        />
      )}

      {syllabusCourse && (
        <SyllabusModal
          course={syllabusCourse}
          onClose={() => setSyllabusCourse(null)}
          resumeTo={resumeRouteFor(syllabusCourse)}
          resumeLabel={ctaLabelFor(syllabusCourse)}
          openTo={openToFor(syllabusCourse)}
        />
      )}
    </div>
  )
}
