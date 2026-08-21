import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import {
  ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, CheckCircle2, Circle,
  Clock, Code2, PlayCircle, Zap, Award, FileText, BookOpen, Lock,
  ClipboardCheck, Copy, Check,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useActiveCourse } from '../context/CourseContext'
import CourseWorkspaceShell from '../components/CourseWorkspaceShell'
import AssignmentSubmissionPanel from '../components/AssignmentSubmissionPanel'
// Progress keys are scoped per user + course so progress can never leak between
// accounts sharing a browser. Guests use an anonymous `guest` bucket; signed-in
// users are scoped to their user id (DB lesson_completions is the source of truth).
const progressKey = (userId, courseId) => `ih_learn_progress_${userId || 'guest'}_${courseId}`

const loadCompleted = (userId, courseId) => {
  try {
    return new Set(JSON.parse(localStorage.getItem(progressKey(userId, courseId)) || '[]'))
  } catch {
    return new Set()
  }
}

const saveCompleted = (userId, courseId, set) => {
  try {
    localStorage.setItem(progressKey(userId, courseId), JSON.stringify([...set]))
  } catch {
    // storage unavailable — in-memory progress still works
  }
}

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 shadow-lg shadow-slate-950/20">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-800/80 px-4 py-2">
        <span className="flex items-center gap-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
          </span>
          <span className="ml-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{lang || 'code'}</span>
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-600/60 px-2 py-1 text-[11px] font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="overflow-x-auto p-4">
        <pre className="text-[13px] leading-relaxed font-mono text-slate-100 whitespace-pre">{code}</pre>
      </div>
    </div>
  )
}

const MarkdownComponents = {
  h1: (props) => <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-10 mb-4 leading-snug" {...props} />,
  h2: (props) => <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-9 mb-4 leading-snug" {...props} />,
  h3: (props) => <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-7 mb-3 leading-snug" {...props} />,
  h4: (props) => <h4 className="text-base font-bold text-slate-900 dark:text-white mt-6 mb-2 leading-snug" {...props} />,
  p: (props) => <p className="text-slate-700 dark:text-slate-300 leading-relaxed my-4 text-[15px]" {...props} />,
  strong: (props) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
  em: (props) => <em className="text-slate-800 dark:text-slate-200" {...props} />,
  ul: (props) => <ul className="list-disc pl-6 my-4 space-y-2 text-slate-700 dark:text-slate-300" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 my-4 space-y-2 text-slate-700 dark:text-slate-300" {...props} />,
  li: (props) => <li className="leading-relaxed pl-1 marker:text-slate-400" {...props} />,
  a: (props) => <a className="text-sky-600 dark:text-cyan-400 hover:underline font-medium break-words" target="_blank" rel="noreferrer" {...props} />,
  hr: (props) => <hr className="my-8 border-slate-200 dark:border-slate-800" {...props} />,
  blockquote: (props) => (
    <blockquote className="border-l-4 border-sky-500/60 bg-sky-500/5 dark:bg-sky-500/10 rounded-r-xl px-4 py-3 my-5 text-slate-700 dark:text-slate-300 italic" {...props} />
  ),
  code({ _node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const codeStr = String(children).replace(/\n$/, '')
    if (!inline && match) {
      return <CodeBlock lang={match[1]} code={codeStr} />
    }
    if (!inline) {
      return (
        <div className="my-6 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 shadow-lg shadow-slate-950/20">
          <div className="overflow-x-auto p-4">
            <pre className="text-[13px] leading-relaxed font-mono text-slate-100 whitespace-pre">
              <code {...props}>{codeStr}</code>
            </pre>
          </div>
        </div>
      )
    }
    return (
      <code
        className="rounded-md px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-slate-800 bg-slate-100 dark:text-sky-300 dark:bg-slate-800"
        {...props}
      >
        {children}
      </code>
    )
  },
}

function CodeLesson({ code }) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 shadow-lg shadow-slate-950/20">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/80 px-4 py-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Code2 className="w-3.5 h-3.5" /> Code Playground
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-600/60 px-2 py-1 text-[11px] font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white cursor-pointer"
        >
          <Copy className="w-3 h-3" /> Copy
        </button>
      </div>
      <div className="overflow-x-auto p-4">
        <pre className="text-[13px] leading-relaxed font-mono text-slate-100 whitespace-pre">{code}</pre>
      </div>
    </div>
  )
}

function VideoLesson({ url }) {
  if (!url) return null
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-[#27272A] shadow-lg my-6 aspect-video">
      <iframe src={url} className="w-full h-full" title="Lesson video" allowFullScreen />
    </div>
  )
}

function LessonTypeBadge({ type }) {
  const config = {
    reading: { label: 'Reading', icon: FileText, cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    theory: { label: 'Reading', icon: FileText, cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    code: { label: 'Code', icon: Code2, cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    video: { label: 'Video', icon: PlayCircle, cls: 'bg-rose-50 text-rose-700 border-rose-200' },
    quiz: { label: 'Quiz', icon: ClipboardCheck, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  }
  const c = config[type] || config.reading
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${c.cls}`}>
      <Icon className="w-3 h-3" /> {c.label}
    </span>
  )
}

const QUIZ_LABELS = ['A', 'B', 'C', 'D']

function ModuleQuiz({ quiz, onPass, onSubmit, onRetry }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)

  const questions = quiz?.questions || []
  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length
  const passed = score ? score.pct >= 75 : false

  const handleSelect = (qIdx, optIdx) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
  }

  const handleSubmit = () => {
    let correct = 0
    questions.forEach((q, qi) => {
      if (answers[qi] === q.answer) correct++
    })
    const pct = Math.round((correct / questions.length) * 100)
    const newScore = { correct, total: questions.length, pct }
    setScore(newScore)
    setSubmitted(true)
    if (onSubmit) onSubmit(newScore)
    if (pct >= 75 && onPass) onPass()
  }

  const handleRetry = () => {
    setAnswers({})
    setSubmitted(false)
    setScore(null)
    if (onRetry) onRetry()
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
        No assessment questions available for this module yet.
      </div>
    )
  }

  return (
    <div className="mt-8 rounded-2xl border border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10 p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          {quiz.title || 'Module Assessment'}
        </h2>
        {!submitted && (
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {Object.keys(answers).length}/{questions.length} answered · 75% to pass
          </span>
        )}
      </div>

      {submitted ? (
        passed ? (
          <div className="text-center py-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
            <p className="text-3xl mb-2">{'\u{1F389}'}</p>
            <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-1">Assessment passed!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              You scored {score.correct}/{score.total} ({score.pct}%). The next lesson is now unlocked.
            </p>
          </div>
        ) : (
          <div className="text-center py-6 rounded-xl border border-red-500/30 bg-red-500/10">
            <p className="text-3xl mb-2">{'\u{1F914}'}</p>
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">Not quite — {score.pct}%</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              You need at least 75%. Review the module topics and try again.
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 shadow-lg shadow-red-500/25 transition-all active:scale-95 cursor-pointer"
            >
              Retake Assessment
            </button>
          </div>
        )
      ) : (
        <>
          <div className="space-y-5">
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="rounded-xl border border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0B0E14] p-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed mb-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold mr-2">
                    {qIdx + 1}
                  </span>
                  {q.q}
                </p>
                <div className="space-y-2 ml-8">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = answers[qIdx] === oIdx
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelect(qIdx, oIdx)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 border cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 text-amber-900 dark:text-amber-200'
                            : 'bg-slate-50 dark:bg-[#0f1420] border-slate-200 dark:border-[#1E2638] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 ${
                          isSelected
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500'
                        }`}>
                          {QUIZ_LABELS[oIdx]}
                        </span>
                        <span>{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/25 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {allAnswered ? 'Submit Assessment' : `Answer all questions to submit (${Object.keys(answers).length}/${questions.length})`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function LearnView() {
  const { courseId } = useParams()
  const contentRef = useRef(null)
  const { user, profile } = useAuth()
  const { markCourseStarted } = useActiveCourse()
  const [searchParams] = useSearchParams()
  const deepLinkId = searchParams.get('lesson')

  const [course, setCourse] = useState(null)
  const [curriculum, setCurriculum] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [completed, setCompleted] = useState(() => loadCompleted(user?.id, courseId))
  const [progressHydrated, setProgressHydrated] = useState(false)
  const [collapsed, setCollapsed] = useState(() => new Set())
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [enrollment, setEnrollment] = useState(null)
  const [quizByLesson, setQuizByLesson] = useState({})
  const [quizPassed, setQuizPassed] = useState(false)
  const [quizState, setQuizState] = useState({ submitted: false, passed: false, score: null })
  const [toast, setToast] = useState(null)

  const flatLessons = useMemo(
    () => curriculum.flatMap((m) => m.lessons),
    [curriculum]
  )

  // Access model (mirrors the server-side RLS gate for `lessons`):
  //  - Free courses                                     -> everything unlocked
  //  - Enrolled users / PRO subscribers                 -> everything unlocked
  //  - Everyone else                                    -> only `is_preview` lessons
  const isFree = !!(course && (Number(course.price) === 0 || course.is_free === true))
  const isEnrolled = !!enrollment
  const isPro = profile?.is_pro === true
  const hasAccess = isFree || isEnrolled || isPro

  const lockedIds = useMemo(() => {
    const set = new Set()
    if (!hasAccess && flatLessons.length > 0) {
      flatLessons.forEach((l) => {
        if (l.isPreview !== true) set.add(l.id)
      })
    }
    return set
  }, [flatLessons, hasAccess])

  useEffect(() => {
    let cancelled = false
    // Session-change guard: never let a different user or a fresh account see
    // the previous session's completed lessons while the new progress loads.
    setCompleted(new Set())
    setProgressHydrated(false)
    const load = async () => {
      // Enrollment + profile.is_pro decide paid-lesson access.
      let enrollmentData = null
      if (user) {
        const { data } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle()
        enrollmentData = data
      }
      if (cancelled) return
      setEnrollment(enrollmentData)

      const loadFromDb = async () => {
        const { data: c } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .maybeSingle()
        const { data: ls } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('module_order', { ascending: true })
          .order('lesson_order', { ascending: true })

        if (cancelled) return
        if (!c) {
          setNotFound(true)
          setLoading(false)
          return
        }
        setCourse(c)

        const rows = (ls || []).map((l) => ({
          id: l.id,
          title: l.title,
          content: l.content || '',
          type: l.lesson_type || 'reading',
          lessonType: l.lesson_type || 'reading',
          codeSnippet: l.codeSnippet || null,
          videoUrl: l.video_url || null,
          durationMins: l.duration_mins || null,
          isLocked: !!l.is_locked,
          isAssessment: !!l.is_assessment,
          isPreview: !!l.is_preview,
          moduleOrder: l.module_order || null,
          moduleTitle: l.module_title || null,
          lessonOrder: l.lesson_order || null,
        }))

        const mods = []
        if (rows.length === 0) {
          mods.push({ key: '1. Course Content', moduleOrder: 1, moduleTitle: 'Course Content', lessons: [] })
        } else {
          const byModule = new Map()
          rows.forEach((l) => {
            const order = l.moduleOrder || Math.ceil((l.lessonOrder || 1) / 4)
            if (!byModule.has(order)) {
              byModule.set(order, { moduleTitle: l.moduleTitle || `Module ${order}`, lessons: [] })
            }
            byModule.get(order).lessons.push(l)
          })
          ;[...byModule.keys()]
            .sort((a, b) => a - b)
            .forEach((order) => {
              const m = byModule.get(order)
              m.lessons.forEach((lesson, i) => {
                // DB `lesson_order` is the global course position (1..N); the
                // sidebar/label index shown to students is per-module (1.1, 1.2).
                lesson.moduleOrder = order
                lesson.lessonOrder = i + 1
                lesson.topicLabel = `${order}.${i + 1}`
              })
              mods.push({
                key: `${order}. ${m.moduleTitle}`,
                moduleOrder: order,
                moduleTitle: m.moduleTitle,
                lessons: m.lessons,
              })
            })
        }
        setCurriculum(mods)

        // Module assessments carry their quiz questions in public.quizzes
        const lessonIds = rows.map((l) => l.id)
        if (lessonIds.length > 0) {
          const { data: quizzesData } = await supabase
            .from('quizzes')
            .select('lesson_id, title, questions')
            .in('lesson_id', lessonIds)
          const byLesson = {}
          ;(quizzesData || []).forEach((q) => {
            if (q.lesson_id) byLesson[q.lesson_id] = q
          })
          setQuizByLesson(byLesson)
        }

        // Progress hydration: DB completions are the ONLY source of truth for
        // signed-in users (scoped by user_id + course_id). localStorage is never
        // merged in, so another account's progress can't leak onto a fresh user.
        // Guests keep an anonymous, course-scoped local bucket.
        if (user) {
          const { data: comps } = await supabase
            .from('lesson_completions')
            .select('lesson_id')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
          const dbDone = new Set()
          ;(comps || []).forEach((c) => {
            if (c.lesson_id) dbDone.add(c.lesson_id)
          })
          setCompleted(dbDone)
          saveCompleted(user.id, courseId, dbDone)
          // Drop any legacy un-scoped key so stale data can't resurface.
          try { localStorage.removeItem(`ih_learn_progress_${courseId}`) } catch { /* ignore */ }
        } else {
          setCompleted(loadCompleted(null, courseId))
        }
        setProgressHydrated(true)
      }

      try {
        await loadFromDb()
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [courseId, user])

  // Opening any course in the player makes it the globally active course.
  useEffect(() => {
    if (course) markCourseStarted(course)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id])

  // Auto-resume: once progress is hydrated, land on the ?lesson= deep link
  // when one is given (smart Continue Learning), otherwise the first
  // incomplete topic. Runs only on hydration so manual navigation is never
  // overridden.
  useEffect(() => {
    if (!progressHydrated || flatLessons.length === 0) return
    setActiveId((prev) => {
      if (prev && flatLessons.some((l) => l.id === prev)) return prev
      if (deepLinkId) {
        const target = flatLessons.find((l) => l.id === deepLinkId)
        if (target) return target.id
      }
      const firstOpen = flatLessons.find((l) => !lockedIds.has(l.id))
      return (firstOpen || flatLessons[0]).id
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressHydrated, flatLessons.length, courseId, deepLinkId])

  useEffect(() => {
    setQuizPassed(false)
    setQuizState({ submitted: false, passed: false, score: null })
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeId])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const activeIndex = flatLessons.findIndex((l) => l.id === activeId)
  const activeLesson = flatLessons[activeIndex] || null
  const activeIsLocked = activeLesson ? lockedIds.has(activeLesson.id) : false
  const prevLesson = activeIndex > 0 ? flatLessons[activeIndex - 1] : null
  const nextLesson = activeIndex < flatLessons.length - 1 ? flatLessons[activeIndex + 1] : null
  const total = flatLessons.length
  const completedCount = completed.size
  const progressPct = total ? Math.round((completedCount / total) * 100) : 0
  const isComplete = total > 0 && completedCount === total

  const activeMo = activeLesson?.moduleOrder || 1
  const activeLo = activeLesson?.lessonOrder || activeIndex + 1
  const activeTopic = activeLesson?.topicLabel || `${activeMo}.${activeLo}`

  const selectLesson = (id) => {
    if (lockedIds.has(id)) return
    setActiveId(id)
  }

  const toggleComplete = async (id) => {
    const next = new Set(completed)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setCompleted(next)
    saveCompleted(user?.id, courseId, next)

    if (!user) return
    try {
      if (next.has(id)) {
        await supabase
          .from('lesson_completions')
          .upsert({ user_id: user.id, lesson_id: id, course_id: courseId }, { onConflict: 'user_id, lesson_id' })
      } else {
        await supabase
          .from('lesson_completions')
          .delete()
          .eq('user_id', user.id)
          .eq('lesson_id', id)
      }
    } catch (err) {
      console.warn('Failed to sync lesson completion:', err.message)
    }
  }

  const activeIsDone = !!(activeLesson && completed.has(activeLesson.id))
  const isAssessmentLesson = !!(activeLesson && activeLesson.isAssessment && quizByLesson[activeLesson.id])
  const quizBlocked = isAssessmentLesson && !quizPassed && !activeIsDone

  const showToast = (message, type = 'error') => setToast({ message, type })

  const handleCompleteAndContinue = async () => {
    if (quizBlocked) {
      showToast('Please complete and pass the MCQ Assessment to proceed to the next module.')
      return
    }
    if (activeLesson && !completed.has(activeLesson.id)) {
      await toggleComplete(activeLesson.id)
    }
    if (nextLesson && !lockedIds.has(nextLesson.id)) {
      selectLesson(nextLesson.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#07090e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 animate-pulse shadow-[0_0_30px_rgba(37,99,235,0.4)]" />
          <div className="w-40 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-blue-600 animate-[ih-progress_1.4s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !course) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#07090e] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Course not found</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">This course may have been removed or is not available yet.</p>
          <Link
            to="/courses"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  const enrollHref = `/dashboard/courses/${courseId}`
  const isActiveDone = !!(activeLesson && completed.has(activeLesson.id))

  return (
    <CourseWorkspaceShell
      title={course.title}
      backTo="/courses"
      backLabel="Back to Courses"
      progressLabel={`${completedCount}/${total} lessons · ${progressPct}%`}
      progressPct={progressPct}
      contentRef={contentRef}
      drawer={
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-[#1E2638] shrink-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{completedCount}/{total} lessons</span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">{course.title}</h3>
          <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{progressPct}% complete</span>
            {isComplete && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <Award className="w-3 h-3" /> Course complete
              </span>
            )}
          </div>
        </div>

        {/* ─── Curriculum tree: collapsible module accordions ─── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
          {curriculum.map((mod) => {
            const isCollapsed = collapsed.has(mod.key)
            const modDone = mod.lessons.filter((l) => completed.has(l.id)).length
            return (
              <div key={mod.key} className="mb-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/60">
                <button
                  onClick={() => {
                    const next = new Set(collapsed)
                    if (next.has(mod.key)) next.delete(mod.key)
                    else next.add(mod.key)
                    setCollapsed(next)
                  }}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
                >
                  <span className="text-sm font-bold tracking-wide text-slate-900 dark:text-slate-100 truncate">
                    {mod.moduleOrder}. {mod.moduleTitle}
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {modDone}/{mod.lessons.length}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="p-2 flex flex-col gap-1">
                    {mod.lessons.length === 0 && (
                      <p className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">Lessons coming soon.</p>
                    )}
                    {mod.lessons.map((lesson) => {
                      const isActive = lesson.id === activeId
                      const isDone = completed.has(lesson.id)
                      const isLocked = lockedIds.has(lesson.id)
                      const isPreview = lesson.isPreview === true
                      const lessonType = lesson.lessonType || 'reading'
                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-all duration-200 border-l-2 ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 cursor-pointer'
                              : isLocked
                                ? 'border-transparent cursor-not-allowed'
                                : 'border-transparent cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5'
                          }`}
                          onClick={() => selectLesson(lesson.id)}
                        >
                          {isLocked ? (
                            <Lock className="w-[18px] h-[18px] text-slate-400 dark:text-slate-500 shrink-0" />
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleComplete(lesson.id)
                              }}
                              className="shrink-0 cursor-pointer"
                              aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500 dark:text-emerald-400" />
                              ) : isActive ? (
                                <Circle className="w-[18px] h-[18px] text-blue-600 dark:text-blue-400" />
                              ) : (
                                <Circle className="w-[18px] h-[18px] text-slate-300 dark:text-slate-600" />
                              )}
                            </button>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs truncate transition-colors ${
                              isActive
                                ? 'text-blue-700 dark:text-blue-300 font-semibold'
                                : isLocked
                                  ? 'text-slate-400 dark:text-slate-500 font-normal'
                                  : 'text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium'
                            }`}>
                              <span className="font-semibold text-slate-400 dark:text-slate-500 mr-1.5">{lesson.topicLabel}</span>
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <LessonTypeBadge type={lessonType} />
                              {isPreview && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                  Preview
                                </span>
                              )}
                              {lesson.isAssessment && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                  <ClipboardCheck className="w-2.5 h-2.5" /> MCQ
                                </span>
                              )}
                              {!lesson.isAssessment && lesson.durationMins && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                                  <Clock className="w-2.5 h-2.5" /> {lesson.durationMins} min
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      }
    >
      {/* ─── Main content: the lesson itself ─── */}
      <div className="h-full flex flex-col">
        {/* Top breadcrumb bar */}
        <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 border-b border-slate-200 dark:border-[#1E2638] bg-white dark:bg-[#0B0E14] shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {activeLesson
              ? `MODULE ${activeMo} - LESSON ${activeLo} OF ${total}`
              : 'Course content'}
          </p>
          {isActiveDone && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="shrink-0 h-1 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 pt-6">
          {activeLesson ? (
            activeIsLocked ? (
              <div className="py-16 text-center">
                <Lock className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lesson locked</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto">
                  {hasAccess
                    ? 'Complete the previous lesson to continue in this module.'
                    : 'This lesson is part of a paid module. Enroll in the course to unlock the full curriculum.'}
                </p>
                    {hasAccess && prevLesson ? (
                      <button
                        onClick={() => selectLesson(prevLesson.id)}
                        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back to previous lesson
                      </button>
                    ) : (
                      <Link
                        to={enrollHref}
                        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all active:scale-95"
                      >
                        Enroll to Unlock
                      </Link>
                    )}
              </div>
            ) : (
              <>
                {/* Breadcrumb / type badge */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                    MODULE {activeMo} - LESSON {activeLo} OF {total}
                  </span>
                  <LessonTypeBadge type={activeLesson.lessonType} />
                  {activeLesson.isPreview && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      Preview
                    </span>
                  )}
                  {activeLesson.isAssessment && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      <ClipboardCheck className="w-3 h-3" /> MCQ Assessment
                    </span>
                  )}
                  {course.level && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {course.level}
                    </span>
                  )}
                  {!activeLesson.isAssessment && activeLesson.durationMins && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3" /> {activeLesson.durationMins} min read
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    <Zap className="w-3 h-3" /> {Math.round((course.xp_reward || 50) / Math.max(total, 1))} XP
                  </span>
                </div>

                {/* Main title */}
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-snug mb-6">
                  <span className="text-blue-600 dark:text-blue-400">{activeTopic} - </span>
                  {activeLesson.title}
                </h1>

                {/* Lesson content body */}
                {activeLesson.type === 'video' && activeLesson.videoUrl ? (
                  <VideoLesson url={activeLesson.videoUrl} />
                ) : (
                  <div className="max-w-none">
                    <ReactMarkdown components={MarkdownComponents}>
                      {activeLesson.content || '_No content available for this lesson yet._'}
                    </ReactMarkdown>
                  </div>
                )}

                {activeLesson.type === 'code' && activeLesson.codeSnippet && (
                  <CodeLesson code={activeLesson.codeSnippet} />
                )}

                {activeLesson.isAssessment && quizByLesson[activeLesson.id] && (
                  <ModuleQuiz
                    quiz={quizByLesson[activeLesson.id]}
                    onPass={() => {
                      setQuizPassed(true)
                      setQuizState({ submitted: true, passed: true, score: quizState.score })
                      if (!completed.has(activeLesson.id)) toggleComplete(activeLesson.id)
                    }}
                    onSubmit={(score) => setQuizState({ submitted: true, passed: score.pct >= 75, score })}
                    onRetry={() => setQuizState({ submitted: false, passed: false, score: null })}
                  />
                )}

                {isComplete && (
                  <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 p-5 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Course complete — great work!</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        You finished all {total} lessons of {course.title}. Keep building — your {course.xp_reward || 50} XP is on the way.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <AssignmentSubmissionPanel
                    courseId={courseId}
                    assignmentTitle={course?.title || 'Course Assignment'}
                    courseTitle={course?.title}
                  />
                </div>

                {/* Bottom Navigation — embedded at end of content */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-8">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => prevLesson && selectLesson(prevLesson.id)}
                      disabled={!prevLesson}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-400 dark:hover:border-slate-600 transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous Lesson
                    </button>

                    {(!activeLesson.isAssessment || quizState.submitted && quizState.passed) && (
                      <button
                        onClick={handleCompleteAndContinue}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {isActiveDone
                          ? nextLesson ? 'Continue' : 'Lesson Complete'
                          : nextLesson ? 'Mark Completed & Continue' : 'Mark Lesson Complete'}
                        {nextLesson && <ChevronRight className="w-4 h-4" />}
                      </button>
                    )}
                    {activeLesson.isAssessment && quizState.submitted && !quizState.passed && (
                      <div className="text-center text-red-600 dark:text-red-400 text-sm font-medium">
                        You need at least 75% to pass and unlock the next lesson.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )
          ) : (
            <div className="py-20 text-center">
              <BookOpen className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Course content is on its way</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto">
                The lessons for {course.title} are being prepared. Check back soon to start learning.
              </p>
              <Link
                to="/courses"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Courses
              </Link>
            </div>
          )}
        </div>
      </div>
    </CourseWorkspaceShell>
  )
}