import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  BookOpen, Zap, Clock, Brain, Bot, Globe, BarChart3,
  Palette, Terminal, Shield, ChevronRight, AlertCircle, Crown, CheckCircle2,
  Award, Route, Play,
} from 'lucide-react'
import { useCourses } from '../hooks/useCourses'
import { useAuth } from '../context/AuthContext'
import { useActiveCourse } from '../context/CourseContext'
import { supabase } from '../lib/supabase'
import EnrollModal from '../components/EnrollModal'
import CoursePreviewModal from '../components/CoursePreviewModal'
import CourseFilters from '../components/CourseFilters'
import RoadmapModal from '../components/RoadmapModal'
import RequireLoginModal from '../components/RequireLoginModal'
import SpotlightCard from '../components/SpotlightCard'
import { mlMajorCourse } from '../data/mlCourseData'
import {
  PRO_MAJOR_RICH_BY_UUID, PRO_MAJOR_CATALOG_BY_ID,
  resolveLocalCourse, localResumeLesson,
} from '../data/coursesData'
import {
  COMPLETED_KEY, CAPSTONE_STATUS_KEY, lsKey, loadJson,
  flatLessonsOf, computeUnlockedLessons, computeMajorProgress, nextLessonToDo,
} from '../utils/mlMajorProgress'

const CATEGORY_META = {
  'AI & Data':        { icon: BarChart3, glow: 'radial-gradient(ellipse at 50% 40%, rgba(6,182,212,0.40), transparent 70%)', iconColor: 'text-cyan-600 dark:text-cyan-300' },
  'Web Development':  { icon: Globe,     glow: 'radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.40), transparent 70%)', iconColor: 'text-indigo-400' },
  'Frontend':         { icon: Globe,     glow: 'radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.40), transparent 70%)', iconColor: 'text-indigo-400' },
  'Backend':          { icon: Terminal,  glow: 'radial-gradient(ellipse at 50% 40%, rgba(16,185,129,0.35), transparent 70%)', iconColor: 'text-emerald-400' },
  'Full-Stack':       { icon: Globe,     glow: 'radial-gradient(ellipse at 50% 40%, rgba(34,211,238,0.40), transparent 70%)', iconColor: 'text-cyan-600 dark:text-cyan-300' },
  'Design':           { icon: Palette,   glow: 'radial-gradient(ellipse at 50% 40%, rgba(129,140,248,0.35), transparent 70%)', iconColor: 'text-indigo-400' },
  'AI Fundamentals':  { icon: Brain,     glow: 'radial-gradient(ellipse at 50% 40%, rgba(6,182,212,0.35), transparent 70%)', iconColor: 'text-cyan-600 dark:text-cyan-300' },
  'AI Tools':         { icon: Bot,       glow: 'radial-gradient(ellipse at 50% 40%, rgba(52,211,153,0.35), transparent 70%)', iconColor: 'text-emerald-400' },
  'Tools':            { icon: Terminal,  glow: 'radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.35), transparent 70%)', iconColor: 'text-indigo-400' },
  'Fundamentals':     { icon: Shield,    glow: 'radial-gradient(ellipse at 50% 40%, rgba(6,182,212,0.35), transparent 70%)', iconColor: 'text-cyan-600 dark:text-cyan-300' },
}

const DEFAULT_META = { icon: BookOpen, glow: 'radial-gradient(ellipse at 50% 40%, rgba(6,182,212,0.25), transparent 70%)', iconColor: 'text-cyan-600 dark:text-cyan-300' }

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-[#1E2638] rounded-2xl overflow-hidden flex flex-col animate-pulse">
      <div className="h-44 bg-slate-200 dark:bg-[#0B0E14]" />
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-slate-200 dark:bg-white/5 rounded-full" />
          <div className="h-5 w-16 bg-slate-200 dark:bg-white/5 rounded-full" />
        </div>
        <div className="h-5 w-3/4 bg-slate-200 dark:bg-white/5 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-white/5 rounded" />
        <div className="h-4 w-2/3 bg-slate-200 dark:bg-white/5 rounded" />
        <div className="flex gap-4 mt-2">
          <div className="h-4 w-16 bg-slate-200 dark:bg-white/5 rounded" />
          <div className="h-4 w-16 bg-slate-200 dark:bg-white/5 rounded" />
          <div className="h-4 w-12 bg-slate-200 dark:bg-white/5 rounded" />
        </div>
        <div className="h-10 w-full bg-slate-200 dark:bg-white/5 rounded-xl mt-auto" />
      </div>
    </div>
  )
}

export default function Courses() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { markCourseStarted } = useActiveCourse()
  const { courses, enrollments, enrolledCourseIds, loading, enroll, getEnrollment } = useCourses()
  const [enrollingId, setEnrollingId] = useState(null)
  const [error, setError] = useState(null)
  const [modalCourse, setModalCourse] = useState(null)
  const [previewCourse, setPreviewCourse] = useState(null)
  const [roadmapCourse, setRoadmapCourse] = useState(null)
  const [requireLogin, setRequireLogin] = useState(null)
  const [filteredCourses, setFilteredCourses] = useState([])
  const [searchParams] = useSearchParams()

  // Guests may browse the catalog, but every protected action (enroll, start
  // learning, view roadmap, continue) is intercepted and sent to login.
  const requireLoginFor = (reason) => {
    setRequireLogin({ redirect: window.location.pathname + window.location.search, reason })
  }

  const openCourseCard = (course) => {
    if (!user) { requireLoginFor(course.is_free === true || course.price === 0 ? 'learn' : 'roadmap'); return }
    if (course.is_free === true || course.price === 0) setPreviewCourse(course)
    else setRoadmapCourse(PRO_MAJOR_RICH_BY_UUID[course.id] || course)
  }

  // Deep link from certification cards: /courses?courseId=<id> auto-opens the
  // Course Preview Modal for the matching course as soon as the list loads.
  useEffect(() => {
    const courseId = searchParams.get('courseId')
    if (!courseId || !user) return
    const foundCourse = courses.find((c) => c.id === courseId || c.slug === courseId)
    if (foundCourse) {
      setPreviewCourse(foundCourse)
    }
  }, [searchParams, courses, user])

  // Live per-course completion counts (lesson_completions) — the source of
  // truth for enrolled free courses where enrollment.progress_percent stays 0.
  const [completionsByCourse, setCompletionsByCourse] = useState({})

  useEffect(() => {
    let cancelled = false
    const loadCompletions = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const ids = enrollments.map((e) => e.course_id)
      if (!userData?.user || ids.length === 0) {
        if (!cancelled) setCompletionsByCourse({})
        return
      }
      const { data } = await supabase
        .from('lesson_completions')
        .select('course_id')
        .eq('user_id', userData.user.id)
        .in('course_id', ids)
      if (cancelled) return
      const counts = {}
      ;(data || []).forEach((row) => {
        if (row.course_id) counts[row.course_id] = (counts[row.course_id] || 0) + 1
      })
      setCompletionsByCourse(counts)
    }
    loadCompletions()
    return () => { cancelled = true }
  }, [enrollments])

  // Continue Learning with a 404-safe fallback chain:
  //   1. Local bundled content (PRO majors) — zero network, always works.
  //   2. Supabase `lessons` table — resume at the FIRST INCOMPLETE lesson
  //      (or the final assessment when everything is done).
  //   3. Nothing available — surface an error toast instead of a dead button.
  const handleContinueLearning = async (courseId) => {
    if (!user) { requireLoginFor('learn'); return }
    const rich = resolveLocalCourse(courseId)
    if (rich) {
      navigate(`/course/${rich.id}?lesson=${localResumeLesson(rich)}`)
      return
    }
    try {
      const { data: lessonRows } = await supabase
        .from('lessons')
        .select('id, module_order')
        .eq('course_id', courseId)
        .order('lesson_order', { ascending: true })
      if (!lessonRows || lessonRows.length === 0) throw new Error('No lessons')

      const { data: userData } = await supabase.auth.getUser()
      let done = new Set()
      if (userData?.user) {
        const { data: comps } = await supabase
          .from('lesson_completions')
          .select('lesson_id')
          .eq('user_id', userData.user.id)
          .eq('course_id', courseId)
        done = new Set((comps || []).map((c) => c.lesson_id))
      }

      const structured = lessonRows.some((l) => l.module_order)
      const firstIncomplete = lessonRows.find((l) => !done.has(l.id))
      const target = firstIncomplete || lessonRows[lessonRows.length - 1]
      navigate(
        structured
          ? `/courses/${courseId}/learn?lesson=${target.id}`
          : `/dashboard/learn/${courseId}/lesson/${target.id}`
      )
    } catch (err) {
      // 404 / table missing / network — fall through to the toast below.
      console.warn('Lesson fetch failed, no local content for this course:', err.message)
    }
    setError('Course content is temporarily unavailable — please try again shortly.')
    setTimeout(() => setError(null), 4000)
  }

  const handleFilteredCourses = useCallback((filtered) => {
    setFilteredCourses(filtered)
  }, [])

  const handleEnrollClick = (course) => {
    if (!user) { requireLoginFor('enroll'); return }
    setError(null)
    setModalCourse(course)
  }

  const handleEnrollConfirm = async () => {
    if (!modalCourse) return
    setEnrollingId(modalCourse.id)
    try {
      const c = modalCourse
      await enroll(c.id)
      setModalCourse(null)
      // Payment/enrollment confirmed in the DB — jump straight into the
      // track (0% start) so the user isn't left staring at a dead button.
      const rich = PRO_MAJOR_RICH_BY_UUID[c.id]
      if (c.is_free === true || c.price === 0) {
        navigate(`/courses/${c.id}/learn`)
      } else if (rich && rich.id === mlMajorCourse.id) {
        navigate('/ml-major-course')
      } else if (rich) {
        navigate(`/course/${rich.id}`)
      } else {
        navigate(`/courses/${c.id}/learn`)
      }
    } catch (err) {
      setError(err.message || 'Enrollment failed')
      setTimeout(() => setError(null), 3000)
    } finally {
      setEnrollingId(null)
    }
  }

  const handleEnrollCancel = () => {
    setModalCourse(null)
  }

  // PRO track "Continue Course": resume the ML Major viewer at the last active
  // lesson (deep link), open the generic local course viewer for tracks with
  // bundled lessons, and fall back to the DB player otherwise.
  const handleProContinue = (course) => {
    if (!user) { requireLoginFor('learn'); return }
    const rich = resolveLocalCourse(course)
    if (rich && rich.id === mlMajorCourse.id) {
      navigate(majorCta)
    } else if (rich) {
      navigate(`/course/${rich.id}?lesson=${localResumeLesson(rich)}`)
    } else {
      handleContinueLearning(course.id)
    }
  }

  // Roadmap modal "Start Module / Start Task / Start the Track":
  // close the modal, then open the interactive viewer at that module's first
  // lesson for enrolled users — or route through enrollment when not enrolled.
  const handleRoadmapStart = (c, opts) => {
    if (!user) { requireLoginFor('learn'); return }
    setRoadmapCourse(null)
    const rich = resolveLocalCourse(c)
    const catalog = rich ? PRO_MAJOR_CATALOG_BY_ID[rich.id] : c
    const enrolled = enrolledCourseIds.has(catalog?.id) || enrolledCourseIds.has(c?.id)
    if (enrolled && rich) {
      const lessonId = opts?.lessonId || localResumeLesson(rich)
      if (rich.id === mlMajorCourse.id) {
        // ML Major keeps its dedicated viewer (quiz + capstone + remote sync)
        navigate(`/ml-major-course?lesson=${lessonId}`)
      } else {
        navigate(`/course/${rich.id}?lesson=${lessonId}`)
      }
    } else if (rich) {
      setModalCourse(catalog || c)
    } else {
      setModalCourse(c)
    }
  }

  const displayCourses = filteredCourses

  // ML Major live progress (local snapshot; remote progress merges inside the viewer)
  const majorSnapshot = useMemo(() => {
    try {
      const completed = new Set(loadJson(COMPLETED_KEY, []))
      const quizSubmitted = loadJson(lsKey('quiz_submitted'), false)
      const capstoneStatuses = loadJson(CAPSTONE_STATUS_KEY, {})
      const flat = flatLessonsOf()
      const unlocked = computeUnlockedLessons(flat, completed)
      const progress = computeMajorProgress(flat, completed, quizSubmitted, capstoneStatuses, 0)
      const resume = nextLessonToDo(flat, completed, unlocked)
      const activeMod = mlMajorCourse.modules.find((m) => {
        const lessons = flat.filter((l) => l.moduleId === m.id)
        return lessons.some((l) => !completed.has(l.id)) && lessons.some((l) => unlocked.has(l.id))
      })
      return { progress, resume, activeMod, quizSubmitted }
    } catch {
      return { progress: null, resume: null, activeMod: null, quizSubmitted: false }
    }
  }, [])

  const majorCta = (() => {
    if (!majorSnapshot.progress) return '/ml-major-course'
    if (majorSnapshot.resume) return `/ml-major-course?lesson=${majorSnapshot.resume.id}`
    if (!majorSnapshot.quizSubmitted) return '/ml-major-course?tab=quiz'
    return '/ml-major-course?tab=capstone'
  })()

  // ---- Strict enrollment-state helpers (single matrix for every CTA) -------
  // Unenrolled PRO  → "Enroll Now · From $X"  → payment modal (EnrollModal).
  // Unenrolled FREE → "Start Course for Free" → enroll via DB + open player.
  // Enrolled        → "Start Course" (0%) / "Continue ..." (>0%) / "Review".
  const heroEnrolled = enrolledCourseIds.has(mlMajorCourse.id)
  const heroPct = majorSnapshot.progress?.overallProgress ?? 0
  const heroDone = !!majorSnapshot.progress?.certificateUnlocked

  // Hero price resolves against the merged catalog row (DB `price` wins over
  // the local snapshot) so the flagship card never shows "$undefined"/"Free".
  const heroCatalog = PRO_MAJOR_CATALOG_BY_ID[mlMajorCourse.id] || null
  const heroCourse = courses.find((c) => heroCatalog && c.id === heroCatalog.id) || heroCatalog || mlMajorCourse

  const proPriceLabel = (course) => {
    const p = course.price
    if (typeof p === 'string' && p.trim().toLowerCase().startsWith('from')) return p.trim()
    const num = typeof p === 'string' ? parseFloat(p) : p
    return num > 0 ? `From $${num}` : 'Free'
  }

  // Compact "$X" / "Free" label for price chips (no "From" prefix).
  const formatPrice = (course) => {
    const p = course.price
    const num = typeof p === 'string' ? parseFloat(p.replace(/[^0-9.]/g, '')) : p
    return num > 0 ? `$${num}` : 'Free'
  }

  const enrolledCta = (course, pct, done, pro) => {
    if (done) return 'Review Course'
    if (pct > 0) return pro ? `Continue Roadmap · ${pct}%` : `Continue Course · ${pct}%`
    return 'Start Course'
  }

  // Roadmap drawer data — resolve the selected course against rich local data
  // so the roadmap path + Enroll/Continue state are accurate for every card.
  const roadmapRich = roadmapCourse ? resolveLocalCourse(roadmapCourse) : null
  const roadmapCatalog = roadmapCourse
    ? (PRO_MAJOR_CATALOG_BY_ID[roadmapCourse.id] || PRO_MAJOR_CATALOG_BY_ID[roadmapRich?.id] || roadmapCourse)
    : null
  const roadmapEnrolledId = roadmapCatalog?.id || roadmapCourse?.id
  const roadmapIsEnrolled = roadmapCourse
    ? enrolledCourseIds.has(roadmapEnrolledId) || enrolledCourseIds.has(roadmapCourse.id)
    : false
  const roadmapEnrollment = roadmapCourse ? getEnrollment(roadmapEnrolledId) : null
  const roadmapIsCompleted = roadmapCourse ? roadmapEnrollment?.status === 'completed' : false
  const roadmapProgress = roadmapCourse
    ? roadmapRich?.id === mlMajorCourse.id
      ? (majorSnapshot.progress?.overallProgress ?? 0)
      : (roadmapEnrollment?.progress_percent || 0)
    : 0

  // Drawer footer CTAs: enroll opens the enrollment modal on top; continue
  // navigates to the viewer and closes the drawer.
  const handleRoadmapEnroll = () => {
    if (!roadmapCourse) return
    const target = roadmapCatalog && roadmapCatalog !== roadmapCourse ? roadmapCatalog : roadmapCourse
    handleEnrollClick(target)
  }

  const handleRoadmapContinue = () => {
    if (!roadmapCourse) return
    handleProContinue(roadmapCourse)
  }

  // Free course preview → Start Learning: close the modal, enroll (free), and
  // jump straight into the learning workspace for that course.
  const handlePreviewStart = async (c) => {
    if (!user) { requireLoginFor('learn'); return }
    setPreviewCourse(null)
    if (!enrolledCourseIds.has(c.id)) {
      try {
        await enroll(c.id)
      } catch {
        // enrollment is best-effort for free previews — learning still opens
      }
    }
    markCourseStarted(c)
    navigate(`/courses/${c.id}/learn`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="mb-8">
            <div className="h-8 w-64 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-40 bg-slate-200 dark:bg-white/5 rounded mt-2 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors duration-300 animate-in fade-in duration-300 slide-in-from-bottom-2">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Courses Catalog</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
            {courses.length} course{courses.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Major Course — Premium Pro Track Card (opens the Roadmap modal first) */}
        <div className="group mb-8 rounded-3xl bg-gradient-to-r from-slate-50 via-sky-50 to-slate-50 dark:from-slate-900 dark:via-sky-950/50 dark:to-slate-900 border border-slate-200/80 dark:border-sky-500/30 shadow-sm dark:shadow-lg dark:shadow-sky-950/40 hover:border-cyan-500/40 dark:hover:border-sky-400/70 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-cyan-500/5 relative">
          <div className="absolute inset-0 rounded-3xl bg-sky-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div
            role="button"
            tabIndex={0}
            onClick={() => openCourseCard(mlMajorCourse)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openCourseCard(mlMajorCourse) }}
            className="flex flex-col md:flex-row md:items-center gap-5 rounded-[22px] p-6 overflow-hidden relative cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-sky-500/20 to-transparent border border-sky-500/30 flex items-center justify-center shrink-0 relative z-10">
              <Brain className="w-7 h-7 text-sky-400" />
            </div>
            <div className="flex-1 relative z-10 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Pro Track
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-md border border-slate-300 dark:border-slate-700">
                  10 Modules · Grand Quiz · Capstone
                </span>
                <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
                  <Award className="w-3 h-3" /> Certificate Included
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">Machine Learning Engineering Major Course</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5 font-medium">Complete Beginner → Advanced Applied ML: Python, NumPy, Pandas, Scikit-Learn, PyTorch.</p>

              {/* Active enrolled-course progress banner — ONLY for logged-in users */}
              {user && majorSnapshot.progress && (
                <div className="mt-4 max-w-md">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      {majorSnapshot.progress.certificateUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Certificate Unlocked
                        </span>
                      ) : majorSnapshot.activeMod ? (
                        <>Module {majorSnapshot.activeMod.number} of {mlMajorCourse.modules.length} · {majorSnapshot.activeMod.title}</>
                      ) : (
                        <>Journey Complete</>
                      )}
                    </span>
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400">{majorSnapshot.progress.overallProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        majorSnapshot.progress.certificateUnlocked
                          ? 'bg-gradient-to-r from-sky-400 to-emerald-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                          : 'bg-gradient-to-r from-sky-400 to-cyan-400 shadow-[0_0_8px_rgba(14,165,233,0.4)]'
                      }`}
                      style={{ width: `${majorSnapshot.progress.overallProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="relative z-10 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (heroEnrolled) {
                    navigate(majorCta)
                  } else {
                    openCourseCard(mlMajorCourse)
                  }
                }}
                className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 rounded-xl transition-all active:scale-95 ${
                  heroEnrolled
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-cyan-400'
                    : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 hover:bg-sky-500/20'
                }`}
              >
                {heroEnrolled
                  ? heroDone
                    ? 'Review Course'
                    : heroPct > 0
                      ? `Continue Roadmap · ${heroPct}%`
                      : 'Start Course'
                  : `Enroll Now · ${proPriceLabel(heroCourse)}`}
                {heroEnrolled ? <Play className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mb-8 animate-[fadeIn_0.4s_ease-out_forwards]">
          <CourseFilters
            courses={courses}
            onFilteredCourses={handleFilteredCourses}
          />
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Course Grid */}
        {displayCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeIn_0.5s_ease-out_forwards]">
            {displayCourses.map((course) => {
              const isFree = course.is_free === true || course.price === 0
              const isPro = course.pro === true
              const isEnrolled = enrolledCourseIds.has(course.id)
              const meta = CATEGORY_META[course.category] || DEFAULT_META
              const IconComponent = meta.icon
              const enrollment = getEnrollment(course.id)
              const progress = enrollment?.progress_percent || 0
              const isCompleted = enrollment?.status === 'completed'

              // PRO tracks track real progress in local storage (major engine);
              // free courses use live lesson_completions counts — the
              // enrollment row stays at 0% until payment/DB sync.
              const totalLessons = course.total_lessons || 0
              const liveCount = completionsByCourse[course.id] || 0
              const livePct = totalLessons ? Math.round((liveCount / totalLessons) * 100) : 0
              const richCourse = PRO_MAJOR_RICH_BY_UUID[course.id]
              const displayProgress = richCourse?.id === mlMajorCourse.id
                ? (majorSnapshot.progress?.overallProgress ?? 0)
                : (livePct || progress)

              return (
                <SpotlightCard
                  key={course.id}
                  spotlightColor="rgba(6, 182, 212, 0.2)"
                  role="button"
                  tabIndex={0}
                  onClick={() => openCourseCard(course)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      openCourseCard(course)
                    }
                  }}
                  className={`cursor-pointer ${
                    isPro
                      ? 'rounded-2xl border border-sky-500/30 bg-white dark:bg-[#0f1420] shadow-sm dark:shadow-none transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-cyan-500/5 hover:border-cyan-500/40'
                      : 'group bg-white dark:bg-[#0f1420] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-cyan-500/5 hover:border-cyan-500/40 flex flex-col'
                  }`}
                >
                  <div className={`${isPro ? 'h-full flex flex-col overflow-hidden rounded-[14px]' : 'h-full flex flex-col'}`}>
{/* Thumbnail — image cover if provided, otherwise designed gradient cover */}
                    <div className="relative h-44 flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 to-blue-100/60 dark:from-slate-900 dark:to-[#0f1420]">
                      {course.thumbnail_url ? (
                        <>
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-90"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                        </>
                      ) : (
                        <>
                          {/* Category glow */}
                          <div
                            className="absolute inset-0 opacity-80"
                            style={{ background: meta.glow }}
                          />
                          {/* Clean dark overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 dark:from-slate-950/60 to-transparent pointer-events-none" />
                          {/* Bottom fade */}
                          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-50/80 dark:from-slate-900/80 to-transparent" />
                          {/* Glassmorphic icon */}
                          <div className={`relative backdrop-blur-md rounded-full p-4 ring-1 z-10 ${isPro ? 'bg-gradient-to-b from-sky-500/20 to-transparent ring-sky-500/30' : 'bg-white/60 ring-sky-200/60 dark:bg-white/10 dark:ring-white/10'}`}>
                            <IconComponent className={`w-12 h-12 ${meta.iconColor}`} />
                          </div>
                        </>
                      )}

                      {/* Price tag — prominent on the front of the card */}
                      {!isFree && (
                        <div className="absolute top-3 left-3 z-10 bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
                          {formatPrice(course)}
                        </div>
                      )}

                      {/* Free / Pro badge */}
                      <div className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider z-10 ${
                        isFree
                          ? 'border border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                          : 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/25'
                      }`}>
                        {isFree ? 'FREE' : <><Crown className="w-3 h-3" /> PRO</>}
                      </div>
                      {isPro && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider z-10 shadow-lg shadow-sky-500/30">
                          <Route className="w-3 h-3" /> Pro Track
                        </div>
                      )}
                    </div>

                    {/* Content area */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Level + Category pills */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 font-semibold px-2.5 py-1 rounded-md text-xs">
                          {course.level || 'Beginner'}
                        </span>
                        {course.category && (
                          <span className="text-[11px] text-slate-600 dark:text-slate-500 font-medium">{course.category}</span>
                        )}
                        {isPro && course.trackLabel && (
                          <span className="text-[11px] text-sky-500 dark:text-sky-400 font-bold uppercase tracking-wide">{course.trackLabel}</span>
                        )}
                      </div>

                      <h3 className="text-lg text-slate-900 dark:text-white font-bold leading-snug">{course.title}</h3>
                      <p className="text-slate-600 dark:text-slate-500 text-sm mt-1.5 line-clamp-2 leading-relaxed">
                        {course.description || 'No description available.'}
                      </p>

                      {isPro && (
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 dark:text-emerald-400">
                          <Award className="w-3.5 h-3.5" /> Certificate Included
                        </div>
                      )}

                      {/* Progress bar for enrolled courses */}
                      {isEnrolled && !isCompleted && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-cyan-600 dark:text-cyan-300">
                              {isPro ? `In Progress — ${displayProgress}%` : `${displayProgress}% complete`}
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-all duration-500"
                              style={{ width: `${displayProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {isEnrolled && isCompleted && (
                        <div className="mt-3">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </div>
                          <div className="mt-1.5 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                          </div>
                        </div>
                      )}

                      {/* Meta row */}
                      <div className="flex items-center gap-4 mt-3 text-slate-700 dark:text-slate-300 font-medium text-xs">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-500" />
                          {course.total_lessons} lesson{course.total_lessons !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-500" />
                          ~{course.total_lessons * 15} min
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-slate-500 dark:text-slate-500" />
                          {course.xp_reward} XP
                        </span>
                      </div>

                      {/* Bottom row — strict enrollment-state matrix:
                          PRO unenrolled → "Enroll Now · From $X" (payment modal)
                          FREE unenrolled → "Start Course for Free" (enroll + open)
                          Enrolled → "Start Course" (0%) / "Continue …" (>0%) / "Review" */}
                      {isFree ? (
                        <div className="mt-auto pt-4">
                          <button
                            onClick={() => openCourseCard(course)}
                            className={`w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer ${
                              isEnrolled
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            }`}
                          >
                            {isEnrolled ? <><Zap className="w-3.5 h-3.5" /> {enrolledCta(course, displayProgress, isCompleted, false)}</> : 'Start Course for Free'}
                          </button>
                        </div>
                      ) : isEnrolled ? (
                        <div className="mt-auto pt-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleProContinue(course) }}
                            className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white shadow-lg shadow-sky-500/25 transition-all active:scale-95 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" /> {enrolledCta(course, displayProgress, isCompleted, true)}
                          </button>
                        </div>
                      ) : (
                        <div className="mt-auto pt-4 space-y-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEnrollClick(course) }}
                            className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#5558E6] text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer"
                          >
                            <Crown className="w-3.5 h-3.5" /> Enroll Now · {proPriceLabel(course)}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openCourseCard(course) }}
                            className="w-full inline-flex items-center justify-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-500 hover:text-sky-400 transition-colors"
                          >
                            View Roadmap <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </SpotlightCard>
              )
            })}
          </div>
        ) : null}

        {roadmapCourse && (
          <RoadmapModal
            course={roadmapCourse}
            onClose={() => setRoadmapCourse(null)}
            onStart={handleRoadmapStart}
            isEnrolled={roadmapIsEnrolled}
            isCompleted={roadmapIsCompleted}
            progress={roadmapProgress}
            onEnroll={handleRoadmapEnroll}
            onContinue={handleRoadmapContinue}
          />
        )}

        {previewCourse && (
          <CoursePreviewModal
            course={previewCourse}
            onClose={() => setPreviewCourse(null)}
            onStart={handlePreviewStart}
          />
        )}

        {modalCourse && (
          <EnrollModal
            course={modalCourse}
            onConfirm={handleEnrollConfirm}
            onCancel={handleEnrollCancel}
            enrolling={enrollingId === modalCourse.id}
          />
        )}

        {requireLogin && (
          <RequireLoginModal
            redirect={requireLogin.redirect}
            reason={requireLogin.reason}
            onClose={() => setRequireLogin(null)}
          />
        )}
      </div>
    </div>
  )
}
