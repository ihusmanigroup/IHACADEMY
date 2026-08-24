import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, BookOpen, BookMarked, Zap, Brain, CheckCircle2, Circle, ChevronDown,
  Award, Rocket, GraduationCap, FileText, Trophy, Sparkles,
  CheckCircle, Code2, Layers, AlertTriangle, X, Lock, Play, ArrowRight,
  ChevronLeft, Target, Timer, Clock, RotateCcw,
} from 'lucide-react'
import { mlMajorCourse } from '../data/mlCourseData'
import { MAJOR_COURSE_DB_ID } from '../data/coursesData'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useCourseSubmissionGate } from '../hooks/useCourseSubmissionGate'
import { useActiveCourse } from '../context/CourseContext'
import { useEnrollmentGuard } from '../hooks/useEnrollmentGuard'
import { getPlanTier } from '../utils/subscription'
import AiLessonChat from './AiLessonChat'
import CourseMasterNotes from './CourseMasterNotes'
import CourseEbook from './CourseEbook'
import MultiLangCodeBlock from './MultiLangCodeBlock'
import { RoadmapContent } from './MLMajorRoadmap'
import CourseWorkspaceShell from './CourseWorkspaceShell'
import TopicSubmissionPanel from './TopicSubmissionPanel'
import {
  LESSON_WEIGHT, QUIZ_WEIGHT, CAPSTONE_WEIGHT, MODULE_XP_REWARD,
  COMPLETED_KEY, CAPSTONE_STATUS_KEY, XP_AWARDED_KEY, lsKey, loadJson, saveJson,
  flatLessonsOf, computeUnlockedLessons, computeMajorProgress, resetMajorProgress,
} from '../utils/mlMajorProgress'
import { isPracticalLesson } from '../utils/topicUtils'

// ---------------------------------------------------------------------------
// Progress weighting (strict course completion):
//   Lessons + Modules  : 90%  (must be 100% done to unlock quiz)
//   Grand Quiz         : 5%   (earned on submission)
//   Capstone           : 5%   (earned only when >= 1 capstone is 'submitted')
// 100% + "Certificate Unlocked" requires ALL THREE to be complete.
// ---------------------------------------------------------------------------

const DIFFICULTY_BADGE = {
  Beginner: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
  Intermediate: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
  'Intermediate → Advanced': 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30',
  Advanced: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
  'Professional / Capstone': 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30',
}

function ProgressBar({ percent, slim }) {
  return (
    <div className={`${slim ? 'h-1.5' : 'h-2'} bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden`}>
      <div
        className="h-full bg-sky-500 rounded-full shadow-[0_0_8px_rgba(14,165,233,0.5)] transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  )
}

function RichText({ text }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-2.5 whitespace-pre-wrap">
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={i} className="h-1" />
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          return (
            <div key={i} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 shrink-0" />
              <p className="text-sm md:text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed flex-1">
                {renderInline(trimmed.replace(/^[-•] /, ''))}
              </p>
            </div>
          )
        }
        return (
          <p key={i} className="text-sm md:text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed tracking-[0.01em]">
            {renderInline(trimmed)}
          </p>
        )
      })}
    </div>
  )
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-slate-900 dark:text-white font-bold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

// Universal dark syntax theme for code blocks (identical in light + dark mode)
function TabButton({ active, onClick, icon: Icon, label, badge, locked, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors w-full ${
        locked
          ? 'opacity-60 text-slate-400 dark:text-slate-500 cursor-not-allowed'
          : active
            ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-500/10'
            : 'text-slate-500 dark:text-slate-500 border border-transparent hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {badge != null && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500">{badge}</span>
      )}
      {locked && <Lock className="w-3 h-3 text-slate-500 dark:text-slate-500 shrink-0" />}
    </button>
  )
}

function LockedTab({ completed, total, percent, onGoBack }) {
  return (
    <div className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 shadow-sm flex flex-col items-center justify-center text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
        <Lock className="w-7 h-7 text-slate-500 dark:text-slate-500" />
      </div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Locked</h2>
      <p className="text-sm text-slate-600 dark:text-slate-500 mt-2 max-w-md leading-relaxed">
        Complete all modules and lessons to unlock the Grand Quiz. Capstone projects are open — start them anytime.
      </p>
      <p className="text-xs text-slate-500 mt-2 font-medium">
        {completed}/{total} lessons · {percent}% complete
      </p>
      <button
        onClick={onGoBack}
        className="mt-6 inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-sky-500/20 cursor-pointer"
      >
        <BookOpen className="w-4 h-4" /> Back to Curriculum
      </button>
    </div>
  )
}

const CAPSTONE_BADGE = {
  pending: {
    label: 'Pending',
    cls: 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-500 border border-slate-200 dark:border-slate-700',
    icon: Timer,
  },
  in_review: {
    label: 'In Review',
    cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30',
    icon: Clock,
  },
  submitted: {
    label: 'Submitted',
    cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
    icon: CheckCircle2,
  },
}

export default function MajorCourseViewer() {
  const { user, addXp, profile } = useAuth()
  const { markCourseStarted, refreshActiveCourse } = useActiveCourse()
  const { checking: guardChecking, denied: guardDenied } = useEnrollmentGuard(mlMajorCourse.id)
  // Practical-submission gate: certificate only unlocks once every practical
  // lesson in this course has an approved submission.
  const { isGateSatisfied } = useCourseSubmissionGate(user?.id, [mlMajorCourse])
  const [searchParams] = useSearchParams()

  // Full-screen workspace: refs to the scrollable content area + AI tutor block
  const contentRef = useRef(null)
  const aiTutorRef = useRef(null)
  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab')
    return tab === 'quiz' || tab === 'capstone' || tab === 'notes' || tab === 'ebook' ? tab : 'curriculum'
  })
  const [openModules, setOpenModules] = useState(() => new Set([mlMajorCourse.modules[0].id]))
  const [completedLessons, setCompletedLessons] = useState(
    () => new Set(loadJson(COMPLETED_KEY, []))
  )
  const [activeLessonId, setActiveLessonId] = useState(() => {
    const stored = new Set(loadJson(COMPLETED_KEY, []))
    return stored.has('1.1') ? null : '1.1'
  })
  const [quizAnswers, setQuizAnswers] = useState(() => loadJson(lsKey('quiz_answers'), {}))
  const [quizSubmitted, setQuizSubmitted] = useState(() => loadJson(lsKey('quiz_submitted'), false))
  const [capstoneStatuses, setCapstoneStatuses] = useState(
    () => loadJson(CAPSTONE_STATUS_KEY, {})
  )
  const [showObjectives, setShowObjectives] = useState(false)
  const [notesLockHint, setNotesLockHint] = useState(false)
  const [quizLockHint, setQuizLockHint] = useState(false)

  // Opening the ML Major player makes it the globally active course.
  useEffect(() => {
    markCourseStarted(mlMajorCourse)
  }, [markCourseStarted])

  // Flattened lesson sequence (single lock-step order across all modules)
  const flatLessons = useMemo(() => flatLessonsOf(), [])

  const totalLessons = flatLessons.length

  // Course Master Notes unlock condition: ALL lessons must be complete.
  const notesUnlocked = completedLessons.size >= totalLessons

  // eBook access: the "Exclusive PDF eBooks access" perk is Pro/Exclusive only.
  const ebookLocked = getPlanTier(profile) === 'free'

  // Dynamic progress unlock (shared engine — same as the roadmap)
  const unlockedLessons = useMemo(
    () => computeUnlockedLessons(flatLessons, completedLessons),
    [flatLessons, completedLessons]
  )

  const isLessonUnlocked = (id) => unlockedLessons.has(id)
  const isLessonCompleted = (id) => completedLessons.has(id)

  const currentIndex = flatLessons.findIndex((l) => l.id === activeLessonId)
  const activeLesson = flatLessons[Math.max(0, currentIndex)]
  const activeModule = mlMajorCourse.modules.find((m) => m.id === activeLesson?.moduleId)
  const nextLesson = currentIndex >= 0 && currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null

  // -------------------------------------------------------------------------
  // Strict completion: lessons 90% · quiz 5% · capstone 5% (shared engine)
  // -------------------------------------------------------------------------
  const answeredCount = Object.keys(quizAnswers).length
  const {
    lessonPercent,
    overallProgress,
    courseComplete,
    certificateUnlocked,
    capstoneSubmittedCount,
  } = computeMajorProgress(flatLessons, completedLessons, quizSubmitted, capstoneStatuses, answeredCount)

  const certUnlockedGated = certificateUnlocked && isGateSatisfied(mlMajorCourse.id)

  const courseStatus = certUnlockedGated
    ? { label: 'Certificate Unlocked', chip: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30', icon: Award }
    : certificateUnlocked
      ? { label: 'Awaiting submission approval', chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30', icon: Timer }
      : courseComplete && quizSubmitted
        ? { label: 'Pending / In Progress (90%) — Submit Capstone', chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30', icon: Timer }
        : { label: `In Progress · ${overallProgress}%`, chip: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30', icon: Zap }

  const moduleLessons = (moduleId) => flatLessons.filter((l) => l.moduleId === moduleId)
  const moduleCompleted = (moduleId) => {
    const lessons = moduleLessons(moduleId)
    return lessons.length > 0 && lessons.every((l) => completedLessons.has(l.id))
  }

  const syncSupabase = useCallback(
    async (completed, submitted, capStatus) => {
      if (!user) return
      const { error } = await supabase
        .from('user_course_progress')
        .upsert(
          {
            user_id: user.id,
            course_id: MAJOR_COURSE_DB_ID,
            lessons_completed: completed,
            quiz_submitted: submitted,
            capstone_status: capStatus,
          },
          { onConflict: 'user_id,course_id' }
        )
      if (error) {
        console.warn('user_course_progress table unavailable (run schema migration):', error.message)
      }
    },
    [user]
  )

  // Load remote progress once on mount and merge
  useEffect(() => {
    if (!user) return
    let cancelled = false
    const loadRemote = async () => {
      const { data } = await supabase
        .from('user_course_progress')
        .select('lessons_completed, quiz_submitted, capstone_status')
        .eq('user_id', user.id)
        .eq('course_id', MAJOR_COURSE_DB_ID)
        .maybeSingle()
      if (cancelled || !data) return
      const remote = new Set(Array.isArray(data.lessons_completed) ? data.lessons_completed : [])
      setCompletedLessons((prev) => {
        const merged = new Set([...prev, ...remote])
        saveJson(COMPLETED_KEY, Array.from(merged))
        return merged
      })
      if (data.quiz_submitted) {
        setQuizSubmitted((prev) => prev || data.quiz_submitted)
        saveJson(lsKey('quiz_submitted'), true)
      }
      if (data.capstone_status && data.capstone_status !== 'pending' && capstoneSubmittedCount === 0) {
        setCapstoneStatuses((prev) => {
          const next = { ...prev }
          for (const cap of mlMajorCourse.capstones) {
            if (!next[cap.id] || next[cap.id] === 'pending') next[cap.id] = data.capstone_status
          }
          saveJson(CAPSTONE_STATUS_KEY, next)
          return next
        })
      }
      setActiveLessonId((prev) => {
        if (prev) return prev
        const firstIncomplete = flatLessons.find((l) => !remote.has(l.id))
        return (firstIncomplete || flatLessons[flatLessons.length - 1]).id
      })
    }
    loadRemote()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, flatLessons])

  // Deep link support: /ml-major-course?lesson=2.3 or ?tab=quiz|capstone
  useEffect(() => {
    const lessonParam = searchParams.get('lesson')
    if (lessonParam) {
      const target = flatLessons.find((l) => l.id === lessonParam)
      if (target && unlockedLessons.has(target.id)) {
        setActiveLessonId(target.id)
        setActiveTab('curriculum')
        setOpenModules((prev) => new Set(prev).add(target.moduleId))
        scrollToTop()
      }
    }
    const tabParam = searchParams.get('tab')
    if (tabParam === 'quiz') {
      if (courseComplete) setActiveTab('quiz')
      else setActiveTab('curriculum')
    } else if (tabParam === 'capstone') {
      setActiveTab(tabParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Award +50 XP once per completed major module (dashboard streak/XP sync)
  const [xpToast, setXpToast] = useState(null)
  useEffect(() => {
    if (!user) return
    const awarded = new Set(loadJson(XP_AWARDED_KEY, []))
    let changed = false
    for (const mod of mlMajorCourse.modules) {
      const lessons = flatLessons.filter((l) => l.moduleId === mod.id)
      const complete = lessons.length > 0 && lessons.every((l) => completedLessons.has(l.id))
      if (complete && !awarded.has(mod.id)) {
        awarded.add(mod.id)
        changed = true
        setXpToast(`+${MODULE_XP_REWARD} XP · Module ${mod.number} complete!`)
        setTimeout(() => setXpToast(null), 3500)
      }
    }
    if (changed) {
      saveJson(XP_AWARDED_KEY, Array.from(awarded))
      addXp(MODULE_XP_REWARD, `major_module_complete`).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedLessons])

  // Dev / user reset — wipe local + remote progress back to 0% (Lesson 1.1)
  const handleResetProgress = async () => {
    if (!window.confirm('Reset ALL ML Major Course progress? Lessons, Grand Quiz and capstone status return to 0% — Module 1, Lesson 1.1 will become active.')) return
    await resetMajorProgress(user)
    setCompletedLessons(new Set())
    setQuizSubmitted(false)
    setCapstoneStatuses({})
    setCheckedExercises(new Set())
    setQuizAnswers({})
    setActiveLessonId('1.1')
    setOpenModules(new Set([mlMajorCourse.modules[0].id]))
    setActiveTab('curriculum')
    saveJson(XP_AWARDED_KEY, [])
    scrollToTop()
  }

  const markCompletedAndContinue = () => {
    if (!activeLesson || courseComplete) return
    const next = new Set(completedLessons).add(activeLesson.id)
    setCompletedLessons(next)
    saveJson(COMPLETED_KEY, Array.from(next))
    refreshActiveCourse()
    syncSupabase(Array.from(next), quizSubmitted, capstoneSubmittedCount >= 1 ? 'submitted' : 'pending')
    if (nextLesson) {
      setActiveLessonId(nextLesson.id)
      setOpenModules((prev) => new Set(prev).add(nextLesson.moduleId))
      scrollToTop()
    } else {
      setActiveLessonId(null)
    }
  }

  const goPrevious = () => {
    if (currentIndex <= 0) return
    const prev = flatLessons[currentIndex - 1]
    setActiveLessonId(prev.id)
    setOpenModules((prevMods) => new Set(prevMods).add(prev.moduleId))
    scrollToTop()
  }

  const goNext = () => {
    if (!nextLesson) return
    setActiveLessonId(nextLesson.id)
    setOpenModules((prevMods) => new Set(prevMods).add(nextLesson.moduleId))
    scrollToTop()
  }

  const toggleModule = (moduleId) => {
    setOpenModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  const openLesson = (lessonId) => {
    if (!isLessonUnlocked(lessonId)) return
    setActiveLessonId(lessonId)
    setActiveTab('curriculum')
    scrollToTop()
  }

  const openNotes = () => {
    if (!notesUnlocked) {
      setNotesLockHint(true)
      setTimeout(() => setNotesLockHint(false), 3000)
      return
    }
    setActiveTab('notes')
    scrollToTop()
  }

  const openQuiz = () => {
    if (!courseComplete) {
      setQuizLockHint(true)
      setTimeout(() => setQuizLockHint(false), 3000)
      return
    }
    setActiveTab('quiz')
    scrollToTop()
  }

  const selectAnswer = (questionId, optionIndex) => {
    if (quizSubmitted) return
    setQuizAnswers((prev) => {
      const next = { ...prev, [questionId]: optionIndex }
      saveJson(lsKey('quiz_answers'), next)
      return next
    })
  }

  const submitQuiz = () => {
    setQuizSubmitted(true)
    saveJson(lsKey('quiz_submitted'), true)
    syncSupabase(Array.from(completedLessons), true, capstoneSubmittedCount >= 1 ? 'submitted' : 'pending')
  }

  const retakeQuiz = () => {
    setQuizAnswers({})
    setQuizSubmitted(false)
    saveJson(lsKey('quiz_answers'), {})
    saveJson(lsKey('quiz_submitted'), false)
    syncSupabase(Array.from(completedLessons), false, capstoneSubmittedCount >= 1 ? 'submitted' : 'pending')
  }

  // Capstone workflow: pending -> in_review -> submitted
  const setCapstoneStatus = (capstoneId, status) => {
    setCapstoneStatuses((prev) => {
      const next = { ...prev, [capstoneId]: status }
      saveJson(CAPSTONE_STATUS_KEY, next)
      const anySubmitted = Object.values(next).filter((s) => s === 'submitted').length >= 1
      syncSupabase(Array.from(completedLessons), quizSubmitted, anySubmitted ? 'submitted' : status)
      return next
    })
  }

  const quizScore = mlMajorCourse.grandQuiz.filter((q) => quizAnswers[q.id] === q.answer).length
  const quizScorePercent = Math.round((quizScore / mlMajorCourse.grandQuiz.length) * 100)
  const quizVerdict =
    quizScorePercent >= 90 ? 'Outstanding — you are capstone ready!'
    : quizScorePercent >= 70 ? 'Great work — review a few modules and try again.'
    : quizScorePercent >= 50 ? 'Solid start — revisit the modules you missed.'
    : 'Keep practicing — go back through the curriculum and retake.'

  // Lesson content strictly from `lesson.content` (PDF-extracted textbook + expert deep dives) with fallback
  const lessonText =
    activeLesson && activeLesson.content && activeLesson.content.trim().length > 0
      ? activeLesson.content
      : `[Textbook excerpt unavailable for "${activeLesson.title}" (${activeLesson.id})] Module ${activeModule.number} — ${activeModule.title}: ${activeModule.summary}`

  const lessonStateIcon = (lessonId) => {
    if (isLessonCompleted(lessonId)) return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
    if (isLessonUnlocked(lessonId)) {
      return activeLessonId === lessonId
        ? <Play className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
        : <Circle className="w-3 h-3 text-slate-500 dark:text-slate-500 shrink-0" />
    }
    return <Lock className="w-3 h-3 text-slate-500 dark:text-slate-600 shrink-0" />
  }

  if (guardChecking) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-500">
          <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          Checking enrollment…
        </div>
      </div>
    )
  }

  if (guardDenied) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
          <Lock className="w-6 h-6 text-sky-500" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold">Enrollment required</h1>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 max-w-md">
            This track is for enrolled students only. Enroll from the course catalog to unlock the full lesson content.
          </p>
        </div>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg shadow-sky-500/25 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>
      </div>
    )
  }

  return (
    <CourseWorkspaceShell
      title={mlMajorCourse.title}
      backTo="/courses"
      backLabel="Back to Courses"
      progressLabel={`${completedLessons.size}/${totalLessons} lessons · ${overallProgress}%`}
      progressPct={overallProgress}
      aiTutorRef={aiTutorRef}
      contentRef={contentRef}
      badges={
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <Layers className="w-3 h-3" /> {mlMajorCourse.modules.length} Modules
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <FileText className="w-3 h-3" /> {totalLessons} Lessons
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Trophy className="w-3 h-3" /> {mlMajorCourse.grandQuiz.length} MCQs
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Rocket className="w-3 h-3" /> {mlMajorCourse.capstones.length} Capstones
          </span>
        </div>
      }
      drawer={
        <div className="space-y-4 p-3">
            <div className="relative overflow-hidden rounded-2xl p-5 shadow-xl shadow-slate-900/10 border border-cyan-400/20 bg-gradient-to-br from-[#0B2A4F] via-[#0F3D6E] to-[#081E3B]">
              <div aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" />
              <div aria-hidden className="pointer-events-none absolute -left-6 -bottom-10 h-28 w-28 rounded-full bg-sky-500/20 blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-cyan-300/30 flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-sm font-bold text-white leading-snug drop-shadow-sm">{mlMajorCourse.title}</h1>
                    <p className="text-[11px] text-cyan-100/70 font-medium">{mlMajorCourse.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-cyan-200 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-300" /> Overall Progress
                  </span>
                  <span className="text-[11px] font-bold text-white">
                    {completedLessons.size}/{totalLessons} lessons · {overallProgress}%
                  </span>
                </div>
                <div className="h-2 bg-white/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-300 to-sky-400 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.6)] transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, overallProgress))}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${courseStatus.chip}`}>
                    <courseStatus.icon className="w-3 h-3" /> {courseStatus.label}
                  </span>
                </div>
                <p className="mt-2 text-[10px] text-cyan-100/70 font-medium tracking-wide">
                  Lessons {LESSON_WEIGHT}% · Quiz {QUIZ_WEIGHT}% · Capstone {CAPSTONE_WEIGHT}% — 100% required for your certificate.
                </p>
                <button
                  onClick={handleResetProgress}
                  title="Reset Course Progress (Dev / user utility)"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-rose-200 border border-rose-300/30 hover:bg-white/20 transition-colors cursor-pointer text-[10px] font-bold"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Progress
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm">
              <div className="grid grid-cols-1 gap-1.5">
                <TabButton active={activeTab === 'curriculum'} onClick={() => setActiveTab('curriculum')} icon={BookOpen} label="📚 Curriculum" />
                <TabButton
                  active={activeTab === 'quiz'}
                  onClick={openQuiz}
                  icon={Trophy}
                  label={courseComplete ? '🏆 Grand Quiz' : '🔒 Grand Quiz (Locked)'}
                  badge={courseComplete ? `${answeredCount}/${mlMajorCourse.grandQuiz.length}` : undefined}
                  locked={!courseComplete}
                  title={courseComplete ? 'Take the Grand Quiz' : 'Locked: You must complete 100% of the Curriculum lessons before unlocking the Grand Quiz!'}
                />
                <TabButton
                  active={activeTab === 'capstone'}
                  onClick={() => setActiveTab('capstone')}
                  icon={Rocket}
                  label="🏆 Capstone Projects"
                  badge={`${capstoneSubmittedCount}/${mlMajorCourse.capstones.length}`}
                />
                <TabButton
                  active={activeTab === 'notes'}
                  onClick={openNotes}
                  icon={notesUnlocked ? FileText : Lock}
                  label={notesUnlocked ? '📝 Course Master Notes' : '🔒 Course Master Notes'}
                  badge={notesUnlocked ? '100%' : 'Locked'}
                  locked={!notesUnlocked}
                  title={notesUnlocked ? 'Open Course Master Notes' : 'Unlocks once you complete 100% of the course lessons!'}
                />
                <TabButton
                  active={activeTab === 'ebook'}
                  onClick={() => { setActiveTab('ebook'); scrollToTop() }}
                  icon={BookMarked}
                  label={ebookLocked ? '📖 Course eBook (Pro)' : '📖 Course eBook (PDF)'}
                  badge={ebookLocked ? 'Pro' : 'PDF'}
                  locked={ebookLocked}
                  title={ebookLocked ? 'Pro feature — upgrade to Pro to unlock the downloadable eBook/PDF' : 'Read and download the course eBook (PDF)'}
                />
              </div>
            </div>

            {notesLockHint && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300 animate-fade-in">
                🔒 Unlocks once you complete 100% of the course lessons!
              </div>
            )}

            {quizLockHint && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300 animate-fade-in">
                🔒 Locked: You must complete 100% of the Curriculum lessons before unlocking the Grand Quiz!
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                {/* Animated Roadmap — compact inline version above module tree */}
                <div className="border-b border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Visual Roadmap
                    </span>
                    <span className="text-[10px] text-slate-400">Tap nodes to preview</span>
                  </div>
                  <RoadmapContent course={mlMajorCourse} inModal onStart={null} />
                </div>

                {/* Module Tree */}
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Module Tree</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-600 font-medium">{unlockedLessons.size}/{totalLessons} unlocked</span>
                </div>
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {mlMajorCourse.modules.map((mod) => {
                    const lessons = moduleLessons(mod.id)
                    const done = lessons.filter((l) => completedLessons.has(l.id)).length
                    const unlockedCount = lessons.filter((l) => isLessonUnlocked(l.id)).length
                    const modPercent = Math.round((done / lessons.length) * 100)
                    const isOpen = openModules.has(mod.id)
                    const isComplete = moduleCompleted(mod.id)
                    const isActiveModule = activeLesson?.moduleId === mod.id
                    return (
                      <div key={mod.id} className="border-b border-slate-200 dark:border-slate-800/60 last:border-b-0">
                        <button
                          onClick={() => toggleModule(mod.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors cursor-pointer ${
                            isActiveModule ? 'bg-sky-500/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                          }`}
                        >
                          <span className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                            isComplete
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : isActiveModule
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500'
                          }`}>
                            {isComplete ? <CheckCircle2 className="w-4 h-4" /> : mod.number}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className={`block text-xs font-bold leading-snug truncate ${isActiveModule ? 'text-sky-600 dark:text-sky-300' : unlockedCount === 0 ? 'text-slate-500 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                              {mod.title}
                            </span>
                            <span className="flex items-center gap-2 mt-1">
                              <ProgressBar percent={modPercent} slim />
                              {unlockedCount === 0 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-500 shrink-0">
                                  <Lock className="w-3 h-3" /> Locked
                                </span>
                              ) : (
                                <span className={`text-[10px] font-bold shrink-0 ${
                                  isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                                }`}>
                                  {modPercent}%
                                </span>
                              )}
                            </span>
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-sky-500 dark:text-sky-400' : ''}`} />
                        </button>

                        {isOpen && (
                          <div className="px-2.5 pb-2.5 space-y-0.5">
                            {lessons.map((l) => {
                              const unlocked = isLessonUnlocked(l.id)
                              const isActive = activeLessonId === l.id
                              const isDone = isLessonCompleted(l.id)
                              return (
                                <button
                                  key={l.id}
                                  onClick={() => openLesson(l.id)}
                                  disabled={!unlocked}
                                  title={unlocked ? `Open ${l.id} — ${l.title}` : 'Keep completing lessons to unlock the next ones'}
                                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${
                                    unlocked ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50' : 'cursor-not-allowed opacity-50'
                                  } ${isActive ? 'bg-sky-500/15 border border-sky-500/40 shadow-[0_0_12px_rgba(14,165,233,0.15)]' : 'border border-transparent'}`}
                                >
                                  {lessonStateIcon(l.id)}
                                  <span className={`flex-1 min-w-0 truncate text-xs font-semibold ${
                                    isActive ? 'text-sky-600 dark:text-sky-300' : isDone ? 'text-slate-500 dark:text-slate-500 line-through' : unlocked ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-600'
                                  }`}>
                                    {l.id} · {l.title}
                                  </span>
                                  {isActive && <span className="text-[9px] font-bold uppercase tracking-wide text-sky-600 dark:text-sky-400 shrink-0">Now</span>}
                                </button>
                              )
                            })}
                          </div>
)}
                      </div>
                    )
                  })}
                </div>
              </div>
              )}{activeTab === 'quiz' && (
              <div className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Grand Machine Learning Quiz</p>
                    <p className="text-[11px] text-slate-500">20 MCQs · 2 from each module</p>
                  </div>
                  {!courseComplete && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-500 border border-slate-200 dark:border-slate-700 shrink-0">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>
                <ProgressBar percent={Math.round((answeredCount / mlMajorCourse.grandQuiz.length) * 100)} slim />
                <p className="text-[11px] text-slate-500 font-medium">
                  {answeredCount}/{mlMajorCourse.grandQuiz.length} answered
                  {quizSubmitted && ` · Score: ${quizScore}/20 (${quizScorePercent}%)`}
                </p>
              </div>
            )}

            {activeTab === 'capstone' && (
              <div className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-600 dark:text-slate-500 leading-relaxed">{mlMajorCourse.certificateRule}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Submitted</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{capstoneSubmittedCount}/{mlMajorCourse.capstones.length}</span>
                  </div>
                </div>
                <ProgressBar percent={Math.round((capstoneSubmittedCount / mlMajorCourse.capstones.length) * 100)} slim />
              </div>
            )}
      </div>
      }
    >
      {/* RIGHT PANEL — reader */}
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6 space-y-5">
        {xpToast && (
          <div className="fixed top-20 right-5 z-50 flex items-center gap-2 bg-emerald-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl shadow-emerald-500/30 animate-fade-in">
            <Sparkles className="w-4 h-4" /> {xpToast}
          </div>
        )}
        {activeTab === 'curriculum' && activeLesson && activeModule && (
              <div key={activeLesson.id} className="space-y-5 animate-fade-in">
                {/* Reader header */}
                <div className="bg-gradient-to-r from-white via-slate-50 to-sky-100/60 dark:from-[#111827] dark:via-[#0F172A] dark:to-[#0369A1]/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-md">
                      Module {activeLesson.moduleNumber} · Lesson {currentIndex + 1} of {totalLessons}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${DIFFICULTY_BADGE[activeModule.difficulty] || DIFFICULTY_BADGE.Beginner}`}>
                      {activeModule.difficulty}
                    </span>
                    {isLessonCompleted(activeLesson.id) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    )}
                    {moduleCompleted(activeModule.id) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <Award className="w-3 h-3" /> Module Complete
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{activeLesson.id} · {activeModule.title}</p>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-snug mt-1">{activeLesson.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <button
                      onClick={markCompletedAndContinue}
                      disabled={courseComplete}
                      className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isLessonCompleted(activeLesson.id) ? (
                        <><ArrowRight className="w-4 h-4" /> Next Lesson</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" /> Mark Completed & Continue</>
                      )}
                    </button>
                    {nextLesson && isLessonCompleted(activeLesson.id) && (
                      <button
                        onClick={goNext}
                        className="px-4 py-2 text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      >
                        Skip to {nextLesson.id} →
                      </button>
                    )}
                  </div>
                </div>

                {/* Module unlocked banner */}
                {activeModule.number > 1 && moduleCompleted(mlMajorCourse.modules[activeModule.number - 2]) && (
                  <div className="rounded-2xl px-5 py-4 bg-emerald-500/5 border border-emerald-500/30 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-200/90 leading-relaxed">
                      <strong className="text-emerald-600 dark:text-emerald-300">Module {activeModule.number - 1} complete!</strong> You have unlocked Module {activeModule.number} — {activeModule.title}.
                    </p>
                  </div>
                )}

                {/* Course complete + certificate banners */}
                {courseComplete && !certificateUnlocked && (
                  <div className="rounded-2xl px-5 py-4 bg-amber-500/5 border border-amber-500/30 flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-200/90 leading-relaxed">
                      <strong className="text-amber-600 dark:text-amber-300">Curriculum complete — {overallProgress}%.</strong> Finish the Grand Quiz and submit a Capstone project (Pending / In Progress (90%)) to unlock your IH Academy certificate.
                    </p>
                  </div>
                )}
                {certUnlockedGated && (
                  <div className="rounded-2xl px-5 py-4 bg-emerald-500/10 border border-emerald-500/40 flex items-center gap-3 animate-fade-in">
                    <Award className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-200/90 leading-relaxed">
                      <strong className="text-emerald-600 dark:text-emerald-300">Certificate Unlocked — 100%!</strong> Congratulations: all lessons, the Grand Quiz, and a Capstone project are complete. Your IH Academy certificate is ready.
                    </p>
                  </div>
                )}
                {certificateUnlocked && !certUnlockedGated && (
                  <div className="rounded-2xl px-5 py-4 bg-amber-500/5 border border-amber-500/30 flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-200/90 leading-relaxed">
                      <strong className="text-amber-600 dark:text-amber-300">Curriculum complete — {overallProgress}%.</strong> Your certificate unlocks once every practical topic submission is reviewed and approved.
                    </p>
                  </div>
                )}

                {/* Module objectives (collapsible) */}
                <div className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setShowObjectives(!showObjectives)}
                    className="w-full flex items-center gap-2.5 px-5 py-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <Target className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
                    <span className="flex-1 text-left text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wide">Module Objectives</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-500 transition-transform duration-200 ${showObjectives ? 'rotate-180' : ''}`} />
                  </button>
                  {showObjectives && (
                    <ul className="px-5 pb-5 space-y-2 border-t border-slate-200 dark:border-slate-800/80 pt-4">
                      {activeModule.objectives.map((obj) => (
                        <li key={obj} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-100 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 dark:text-sky-500 mt-0.5 shrink-0" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Lesson content — strictly lesson.content (textbook + deep dive) */}
                <div className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${
                      activeLesson.type === 'code'
                        ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-500 border border-slate-200 dark:border-slate-700/60'
                    }`}>
                      {activeLesson.type === 'code' ? <Code2 className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                      {activeLesson.type === 'code' ? 'Code Lesson · Code Snippet' : 'Theory Lesson · Textbook Content'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-wide">{activeLesson.id}</span>
                  </div>
                  <RichText text={lessonText} />
                  
                  {/* AI Tutor - Topic Explanation */}
                  <div ref={aiTutorRef}>
                    <AiLessonChat
                      courseTitle={mlMajorCourse.title}
                      topicId={activeLesson.id}
                      topicTitle={activeLesson.title}
                      lessons={flatLessons}
                      currentLessonIndex={currentIndex}
                    />
                  </div>

                  {activeLesson.codeSnippet && (
                    <div className="mt-5">
                      <MultiLangCodeBlock code={activeLesson.codeSnippet} title="Lesson Code" />
                    </div>
                  )}

                  {/* Topic Submission Panel — only for practical (code) lessons */}
                  {isPracticalLesson(activeLesson) && (
                    <div className="mt-5">
                      <TopicSubmissionPanel
                        courseId={mlMajorCourse.id}
                        lessonId={activeLesson.id}
                        topicId={activeLesson.id}
                        topicTitle={activeLesson.title}
                        courseType="pro"
                      />
                    </div>
                  )}
                </div>

                {/* Sticky bottom navigation — floating, lifted, centered */}
                <div className="sticky bottom-4 z-20 flex justify-center px-3">
                  <div className="flex w-full max-w-2xl items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white/95 dark:bg-[#0f1420]/95 px-3 py-2.5 shadow-2xl shadow-slate-900/15 backdrop-blur-md sm:gap-4">
                    <button
                      onClick={goPrevious}
                      disabled={currentIndex <= 0}
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-400 dark:hover:border-slate-600 transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed sm:gap-2 sm:px-4"
                    >
                      <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Previous</span> Lesson
                    </button>
                    <div className="hidden text-center shrink-0 sm:block">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Lesson {currentIndex + 1} of {totalLessons}</p>
                      <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 mt-0.5">{lessonPercent}% lessons · {overallProgress}%</p>
                    </div>
                    <button
                      onClick={markCompletedAndContinue}
                      disabled={courseComplete}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed sm:gap-2 sm:px-5"
                    >
                      {isLessonCompleted(activeLesson.id) ? (
                        <>Next Lesson <ArrowRight className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Mark Completed & Next <ArrowRight className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              notesUnlocked ? (
                <div className="animate-fade-in">
                  <CourseMasterNotes
                    courseTitle={mlMajorCourse.title}
                    modules={mlMajorCourse.modules}
                    lessons={flatLessons}
                  />
                </div>
              ) : (
                <div className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 shadow-sm flex flex-col items-center justify-center text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
                    <Lock className="w-7 h-7 text-slate-500 dark:text-slate-500" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Course Master Notes — Locked</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-500 mt-2 max-w-md leading-relaxed">
                    Complete all {totalLessons} lessons ({completedLessons.size} done · {overallProgress}%) to unlock
                    comprehensive course notes, cheat sheets and exam-ready material.
                  </p>
                  <button
                    onClick={() => setActiveTab('curriculum')}
                    className="mt-6 inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-sky-500/20 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" /> Back to Curriculum
                  </button>
                </div>
              )
            )}

            {activeTab === 'ebook' && (
              <CourseEbook course={mlMajorCourse} flatLessons={flatLessons} locked={ebookLocked} />
            )}

            {activeTab === 'quiz' && (
              !courseComplete ? (
                <LockedTab
                  completed={completedLessons.size}
                  total={totalLessons}
                  percent={lessonPercent}
                  onGoBack={() => setActiveTab('curriculum')}
                />
              ) : (
              <div className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Grand Machine Learning Quiz</h2>
                      <p className="text-xs text-slate-500 font-medium">20 questions · 2 from each module, mixed order</p>
                    </div>
                  </div>
                  {quizSubmitted && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                      quizScorePercent >= 70 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}>
                      <Sparkles className="w-3.5 h-3.5" /> Score: {quizScore}/20 ({quizScorePercent}%)
                    </span>
                  )}
                </div>

                {!quizSubmitted && (
                  <div className="space-y-6">
                    {mlMajorCourse.grandQuiz.map((q) => {
                      const selected = quizAnswers[q.id]
                      return (
                        <div key={q.id} className="bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5">
                          <div className="flex items-start gap-3 mb-3">
                            <span className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-center shrink-0">
                              {q.id}
                            </span>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">{q.question}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options.map((opt, i) => {
                              const isSelected = selected === i
                              return (
                                <button
                                  key={i}
                                  onClick={() => selectAnswer(q.id, i)}
                                  className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-sky-500/10 border-sky-500/50 text-sky-600 dark:text-sky-300'
                                      : 'bg-white dark:bg-[#0f1420]/80 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                                  }`}
                                >
                                  <span className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                  }`}>
                                    {String.fromCharCode(65 + i)}
                                  </span>
                                  {opt}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}

                    <button
                      onClick={submitQuiz}
                      disabled={answeredCount < mlMajorCourse.grandQuiz.length}
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FileText className="w-4 h-4" />
                      Submit Quiz ({answeredCount}/{mlMajorCourse.grandQuiz.length} answered)
                    </button>
                  </div>
                )}

                {quizSubmitted && (
                  <div className="space-y-6">
                    <div className={`rounded-xl p-5 border flex items-center gap-4 ${
                      quizScorePercent >= 70 ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-amber-500/5 border-amber-500/30'
                    }`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        quizScorePercent >= 70 ? 'bg-emerald-500/15' : 'bg-amber-500/15'
                      }`}>
                        {quizScorePercent >= 70 ? (
                          <CheckCircle className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                        ) : (
                          <FileText className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{quizScore}/{mlMajorCourse.grandQuiz.length} correct ({quizScorePercent}%)</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{quizVerdict}</p>
                      </div>
                      <button
                        onClick={retakeQuiz}
                        className="px-4 py-2 text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0"
                      >
                        Retake Quiz
                      </button>
                    </div>

                    <div className="space-y-4">
                      {mlMajorCourse.grandQuiz.map((q) => {
                        const selected = quizAnswers[q.id]
                        const isCorrect = selected === q.answer
                        return (
                          <div key={q.id} className="bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5">
                            <div className="flex items-start gap-3 mb-3">
                              <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                isCorrect ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              }`}>
                                {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                              </span>
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">{q.question}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {q.options.map((opt, i) => {
                                const isAnswer = i === q.answer
                                const isWrongPick = i === selected && !isAnswer
  return (
                                  <div
                                    key={i}
                                    className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs ${
                                      isAnswer
                                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-300'
                                        : isWrongPick
                                          ? 'bg-rose-500/10 border-rose-500/50 text-rose-600 dark:text-rose-300'
                                          : 'bg-white dark:bg-[#0f1420]/80 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500'
                                    }`}
                                  >
                                    <span className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                      isAnswer ? 'bg-emerald-500 text-white' : isWrongPick ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                    }`}>
                                      {String.fromCharCode(65 + i)}
                                    </span>
                                    {opt}
                                    {isAnswer && <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0" />}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              )
            )}

            {activeTab === 'capstone' && (
              <div className="space-y-5 animate-fade-in">
                <div className="bg-gradient-to-r from-white via-slate-50 to-sky-100/60 dark:from-[#111827] dark:via-[#0F172A] dark:to-[#0369A1]/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
                      <Rocket className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Final Mega Project — Choose One Capstone</h2>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Required for the IH Academy certificate</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/30 rounded-xl px-4 py-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-200/90 leading-relaxed">{mlMajorCourse.certificateRule}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {mlMajorCourse.capstones.map((cap) => {
                    const status = capstoneStatuses[cap.id] || 'pending'
                    const badge = CAPSTONE_BADGE[status]
                    const BadgeIcon = badge.icon
                    return (
                      <div
                        key={cap.id}
                        className={`bg-white dark:bg-[#0f1420]/80/90 border rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${
                          status === 'submitted'
                            ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/5'
                            : status === 'in_review'
                              ? 'border-amber-500/40'
                              : 'border-slate-200 dark:border-slate-800 hover:border-sky-500/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
                              <GraduationCap className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                            </div>
                            <h3 className="text-slate-900 dark:text-white font-bold text-sm md:text-base leading-snug">{cap.title}</h3>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0 ${badge.cls}`}>
                            <BadgeIcon className={`w-3 h-3 ${status === 'in_review' ? 'animate-pulse' : ''}`} /> {badge.label}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-500 text-xs leading-relaxed mb-4">{cap.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-sky-600 dark:text-sky-400 mb-2">
                              <Award className="w-3.5 h-3.5" /> Technical Requirements
                            </div>
                            <ul className="space-y-1.5">
                              {cap.requirements.map((req) => (
                                <li key={req} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                  <CheckCircle2 className="w-3 h-3 text-sky-500 mt-0.5 shrink-0" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-sky-600 dark:text-sky-400 mb-2">
                              <FileText className="w-3.5 h-3.5" /> Deliverables
                            </div>
                            <ul className="space-y-1.5">
                              {cap.deliverables.map((del) => (
                                <li key={del} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                  <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
                                  {del}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          {status === 'pending' && (
                            <button
                              onClick={() => setCapstoneStatus(cap.id, 'in_review')}
                              className="flex-1 sm:flex-none bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Rocket className="w-4 h-4" /> Submit Capstone
                            </button>
                          )}
                          {status === 'in_review' && (
                            <>
                              <span className="flex-1 sm:flex-none text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                                <Timer className="w-3.5 h-3.5 animate-pulse" /> Under review — pass it to complete the course
                              </span>
                              <button
                                onClick={() => setCapstoneStatus(cap.id, 'submitted')}
                                className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" /> Mark Reviewed & Passed
                              </button>
                            </>
                          )}
                          {status === 'submitted' && (
                            <span className="flex-1 sm:flex-none inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4" /> Capstone submitted — certificate unlocked when quiz is complete
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
        </div>
    </CourseWorkspaceShell>
  )
}
