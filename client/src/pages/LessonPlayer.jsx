import { useState, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle, Circle, Loader2, BookOpen,
  ChevronLeft, ChevronRight, Menu, X, Clock,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const LABELS = ['A', 'B', 'C', 'D']

function FinalExam({ questions, onPass }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)
  const [passed, setPassed] = useState(false)

  const allAnswered = Object.keys(answers).length === questions.length

  const handleSelect = (qIdx, optIdx) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }))
  }

  const handleSubmit = () => {
    let correct = 0
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].answer) correct++
    }
    const pct = Math.round((correct / questions.length) * 100)
    setScore({ correct, total: questions.length, pct })
    setSubmitted(true)
    if (pct >= 75) {
      setPassed(true)
      if (onPass) onPass(pct)
    }
  }

  const handleRetry = () => {
    setAnswers({})
    setSubmitted(false)
    setScore(null)
    setPassed(false)
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
        <p>No assessment questions available for this lesson.</p>
      </div>
    )
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
          Final Course Assessment
        </h2>
        {!submitted && (
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {Object.keys(answers).length}/{questions.length} answered
          </span>
        )}
      </div>

      {/* Passed state — success screen */}
      {submitted && passed ? (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-10 text-center">
          <div className="text-5xl mb-4">{'\u{1F389}'}</div>
          <h3 className="text-2xl font-bold text-emerald-400 mb-2">Congratulations!</h3>
          <p className="text-emerald-300/80 text-lg mb-2">
            You scored <span className="font-bold text-emerald-300">{score.correct}/{score.total}</span> ({score.pct}%)
          </p>
          <p className="text-emerald-300/60 text-sm mb-6">
            Course completion confirmed &mdash; XP has been awarded to your profile!
          </p>
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-5 py-2.5 rounded-xl font-semibold">
            <CheckCircle className="w-5 h-5" />
            Assessment Passed
          </div>
        </div>
      ) : submitted && !passed ? (
        /* Failed state — retry */
        <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-10 text-center">
          <div className="text-5xl mb-4">{'\u{1F914}'}</div>
          <h3 className="text-2xl font-bold text-red-400 mb-2">Not Quite There Yet</h3>
          <p className="text-red-300/80 text-lg mb-2">
            You scored <span className="font-bold text-red-300">{score.correct}/{score.total}</span> ({score.pct}%)
          </p>
          <p className="text-red-300/60 text-sm mb-6">
            You need at least 75% to pass. Review the lesson material and try again.
          </p>
          <button
            onClick={handleRetry}
            className="bg-red-500 hover:bg-red-400 text-white font-semibold px-8 py-3 rounded-xl transition-all active:scale-[0.97]"
          >
            Retake Assessment
          </button>
        </div>
      ) : (
        /* Active exam — show questions */
        <>
          <div className="space-y-6">
            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-[#0f1420]/80"
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/15 text-sky-600 dark:text-cyan-400 text-xs font-bold shrink-0 mt-0.5">
                    {qIdx + 1}
                  </span>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">{q.q}</p>
                </div>
                <div className="space-y-2 ml-10">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = answers[qIdx] === oIdx
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelect(qIdx, oIdx)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 border ${
                          isSelected
                            ? 'bg-indigo-500/20 border-indigo-500 ring-2 ring-indigo-500'
                            : 'bg-slate-50 dark:bg-[#1E1E22] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-200/50 dark:hover:bg-[#25252B]'
                        }`}
                      >
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${
                          isSelected
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500'
                        }`}>
                          {LABELS[oIdx]}
                        </span>
                        <span className={isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-slate-300'}>
                          {opt}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="bg-[#6366F1] hover:bg-[#5558E6] text-white font-semibold px-10 py-3 rounded-xl transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-base"
            >
              {allAnswered ? 'Submit Exam' : `Answer all questions to submit (${Object.keys(answers).length}/${questions.length})`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const MarkdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const codeStr = String(children).replace(/\n$/, '')

    if (!inline && match) {
      return (
        <div className="rounded-xl overflow-hidden border border-[#27272A] my-6 shadow-lg">
          <div className="flex items-center justify-between px-4 py-2 bg-[#1E1E22] border-b border-[#27272A]">
            <span className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">{match[1]}</span>
            <button
              onClick={() => navigator.clipboard.writeText(codeStr)}
              className="text-xs text-[#A1A1AA] hover:text-white transition-colors"
            >
              Copy
            </button>
          </div>
          <div className="p-4 bg-[#131316] overflow-x-auto">
            <code className={`text-sm leading-relaxed font-mono text-[#E4E4E7] ${className}`} {...props}>
              {children}
            </code>
          </div>
        </div>
      )
    }

    if (!inline) {
      return (
        <pre className="bg-[#131316] border border-[#27272A] rounded-xl p-4 overflow-x-auto my-6">
          <code className="text-sm font-mono text-[#E4E4E7]" {...props}>{children}</code>
        </pre>
      )
    }

    return (
      <code className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#1E1E22] text-sky-600 dark:text-cyan-400 text-sm font-mono" {...props}>
        {children}
      </code>
    )
  }
}

export default function LessonPlayer() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, refreshProfile, addXp } = useAuth()

  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [lesson, setLesson] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [showExam, setShowExam] = useState(() => {
    try { return localStorage.getItem(`exam_showing_course_${courseId}`) === 'true' } catch (_) { return false }
  })
  const [examPassed, setExamPassed] = useState(() => {
    try { return localStorage.getItem(`exam_passed_course_${courseId}`) === 'true' } catch (_) { return false }
  })
  const [examScore, setExamScore] = useState(null)
  const [examStarted, setExamStarted] = useState(() => {
    try { return localStorage.getItem(`exam_started_course_${courseId}`) === 'true' } catch (_) { return false }
  })
  const [quizQuestions, setQuizQuestions] = useState([])
  const [activeTopicIndex, setActiveTopicIndex] = useState(0)
  const [highestUnlockedIndex, setHighestUnlockedIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(`lesson_progress_${lessonId}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed.highestUnlockedIndex === 'number') return parsed.highestUnlockedIndex
      }
    } catch (_) {}
    return 0
  })

  useEffect(() => {
    const fetchData = async () => {
      const [courseRes, lessonsRes, lessonRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('lessons').select('*').eq('course_id', courseId).order('lesson_order', { ascending: true }),
        supabase.from('lessons').select('*').eq('id', lessonId).single(),
      ])

      // Fetch quizzes for ALL course lessons (course-wide assessment)
      const lessonIds = (lessonsRes.data || []).map(l => l.id)
      let mergedQuestions = []
      if (lessonIds.length > 0) {
        const { data: quizzesData } = await supabase
          .from('quizzes')
          .select('questions')
          .in('lesson_id', lessonIds)
        mergedQuestions = (quizzesData || []).flatMap(q => {
          const qs = q.questions
          if (Array.isArray(qs)) return qs
          if (qs && Array.isArray(qs.items)) return qs.items
          return []
        })
      }

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

      setCourse(courseRes.data)
      setLessons(lessonsRes.data || [])
      setLesson(lessonRes.data)
      setEnrollment(enrollmentData)
      setQuizQuestions(mergedQuestions)
      setLoading(false)

      if (enrollmentData && lessonRes.data) {
        const idx = (lessonsRes.data || []).findIndex((l) => l.id === lessonId)
        setCompleted(idx < (enrollmentData.lessons_completed || 0))
      }

      try {
        const saved = localStorage.getItem(`lesson_progress_${lessonId}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (typeof parsed.highestUnlockedIndex === 'number') {
            setHighestUnlockedIndex(parsed.highestUnlockedIndex)
          }
        }
      } catch (_) {}

      try {
        const topicIndexFromState = location?.state?.topicIndex
        if (typeof topicIndexFromState === 'number') {
          setActiveTopicIndex(topicIndexFromState)
        }
      } catch (_) {}
    }
    fetchData()
  }, [courseId, lessonId, user, location])

  const lessonIndex = lessons.findIndex((l) => l.id === lessonId)
  const prevLesson = lessonIndex > 0 ? lessons[lessonIndex - 1] : null
  const nextLesson = lessonIndex < lessons.length - 1 ? lessons[lessonIndex + 1] : null
  const totalLessons = lessons.length
  const completedCount = enrollment?.lessons_completed ?? 0

  const parseTopics = (content) => {
    if (!content) return null
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content
      if (parsed && Array.isArray(parsed.topics)) return parsed.topics
    } catch (e) {
      return null
    }
    return null
  }

  const topics = useMemo(() => parseTopics(lesson?.content), [lesson])
  const hasExam = quizQuestions.length > 0
  const isLastTopic = topics ? activeTopicIndex === topics.length - 1 : false
  const isLastLesson = lessonIndex === lessons.length - 1
  const allTopicsCompleted = useMemo(() => {
    return lessons.every(l => {
      const t = parseTopics(l.content)
      if (!t || t.length === 0) return true
      try {
        const saved = localStorage.getItem(`lesson_progress_${l.id}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          return parsed.highestUnlockedIndex >= t.length
        }
      } catch (_) {}
      return false
    })
  }, [lessons])

  const handleExamPass = async (pct) => {
    setExamPassed(true)
    setExamScore(pct)
    setExamStarted(true)
    try {
      localStorage.setItem(`exam_passed_course_${courseId}`, 'true')
      localStorage.setItem(`exam_started_course_${courseId}`, 'true')
    } catch (_) {}

    if (user && !completed) {
      setCompleting(true)
      try {
        const totalXp = course?.xp_reward || 50
        try {
          await addXp(totalXp, 'course_completion')
        } catch (xpErr) {
          console.error('addXp failed, falling back to direct update:', xpErr)
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('xp')
            .eq('id', user.id)
            .maybeSingle()
          await supabase
            .from('profiles')
            .update({ xp: (profileRow?.xp || 0) + totalXp })
            .eq('id', user.id)
        }

        await supabase
          .from('enrollments')
          .update({ progress_percent: 100, lessons_completed: totalLessons, status: 'completed' })
          .eq('user_id', user.id)
          .eq('course_id', courseId)

        for (const l of lessons) {
          await supabase
            .from('lesson_completions')
            .upsert({ user_id: user.id, lesson_id: l.id, course_id: courseId }, { onConflict: 'user_id, lesson_id' })
        }

        setEnrollment((prev) => ({
          ...prev,
          progress_percent: 100,
          lessons_completed: totalLessons,
          status: 'completed',
        }))
        setCompleted(true)
        refreshProfile()
      } catch (err) {
        console.error('Failed to complete course:', err)
      }
      setCompleting(false)
    }
  }

  const handleTopicComplete = () => {
    if (activeTopicIndex < topics.length - 1) {
      const nextIdx = activeTopicIndex + 1
      const newHighest = Math.max(highestUnlockedIndex, nextIdx)
      setHighestUnlockedIndex(newHighest)
      setActiveTopicIndex(nextIdx)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      try {
        localStorage.setItem(`lesson_progress_${lessonId}`, JSON.stringify({ highestUnlockedIndex: newHighest }))
      } catch (_) {}
    }
  }

  const saveTopicProgress = () => {
    const newHighest = Math.max(highestUnlockedIndex, activeTopicIndex + 1)
    setHighestUnlockedIndex(newHighest)
    try {
      localStorage.setItem(`lesson_progress_${lessonId}`, JSON.stringify({ highestUnlockedIndex: newHighest }))
    } catch (_) {}
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#07090e] flex items-center justify-center transition-colors duration-300">
        <Loader2 className="w-6 h-6 animate-spin text-slate-600 dark:text-slate-300" />
      </div>
    )
  }

  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#07090e] flex items-center justify-center transition-colors duration-300">
        <p className="text-slate-600 dark:text-slate-300">Lesson not found.</p>
      </div>
    )
  }

  const isEnrolled = !!enrollment

  return (
    <div className="h-[calc(100vh-4rem)] bg-white dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors duration-300 flex">
      {/* Sidebar Toggle (mobile) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-[#6366F1] hover:bg-[#5558E6] text-white p-3 rounded-full shadow-lg transition-colors"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Curriculum Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-80 h-full bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 flex flex-col overflow-y-auto transition-all duration-200`}>
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 min-w-0">
          <Link to={`/dashboard/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 leading-tight truncate">{course.title}</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {completedCount}/{totalLessons} lessons</p>
        </div>

        <div className="flex-1 p-3 space-y-1 min-w-0">
          {lessons.map((l, idx) => {
            const isCurrent = l.id === lessonId
            const isCompletedLesson = idx < completedCount
            const isLessonLocked = !isCurrent && idx > completedCount
            const topicsForLesson = parseTopics(l.content)

            return (
              <div key={l.id}>
                <Link
                  to={isLessonLocked ? '#' : `/dashboard/learn/${courseId}/lesson/${l.id}`}
                  onClick={(e) => { if (isLessonLocked) e.preventDefault() }}
                  className={`flex items-center justify-between gap-2 p-3 rounded-lg mb-2 min-w-0 transition-all duration-200 ${
                    isLessonLocked
                      ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/40'
                      : isCurrent
                        ? 'bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-500 dark:border-indigo-500/80 shadow-sm text-indigo-600 dark:text-indigo-300'
                        : 'bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/80 shadow-sm text-slate-800 dark:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  {isCompletedLesson ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-500 dark:border-indigo-400 shrink-0" />
                  ) : isLessonLocked ? (
                    <Circle className="w-4 h-4 text-slate-500 dark:text-zinc-600 shrink-0 opacity-40" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 dark:text-zinc-600 shrink-0" />
                  )}
                  <span className={`flex-1 min-w-0 truncate text-sm font-semibold tracking-wide ${isLessonLocked ? 'text-slate-500 dark:text-zinc-500' : ''}`}>{l.title}</span>
                  <span className="shrink-0 text-xs text-slate-500 dark:text-zinc-500">{l.duration_mins}min</span>
                </Link>

                {/* Nested topics under lesson */}
                  {Array.isArray(topicsForLesson) && (
                  <ul className="pl-3 my-1 space-y-1 border-l-2 border-slate-200 dark:border-zinc-800/60 ml-2 min-w-0">
                    {topicsForLesson.map((t, ti) => {
                      const isActiveTopic = isCurrent && ti === activeTopicIndex
                      const isTopicCompleted = isCurrent && ti < highestUnlockedIndex
                      const isTopicLocked = isCurrent && ti > highestUnlockedIndex
                      return (
                        <li key={t.topic_id || ti}>
                          {isLessonLocked || isTopicLocked ? (
                            <span className="w-full text-left text-xs px-3 py-1.5 flex items-center gap-2 text-slate-500 dark:text-zinc-500 opacity-40 pointer-events-none">
                              {t.title}
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                if (isCurrent) {
                                  setActiveTopicIndex(ti)
                                  window.scrollTo({ top: 0, behavior: 'smooth' })
                                } else {
                                  navigate(`/dashboard/learn/${courseId}/lesson/${l.id}`, { state: { topicIndex: ti } })
                                }
                              }}
                              className={`w-full text-left transition-all ${
                                isActiveTopic
                                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium border-l-2 border-indigo-500 rounded-r-md px-3 py-2 text-xs flex items-center gap-2'
                                  : isTopicCompleted
                                    ? 'text-slate-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 text-xs px-3 py-1.5 flex items-center gap-2'
                                    : 'text-slate-500 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 text-xs px-3 py-1.5 flex items-center gap-2'
                              }`}
                            >
                              {isTopicCompleted ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                              ) : (
                                <Circle className="w-1.5 h-1.5 fill-current shrink-0" />
                              )}
                              <span className="min-w-0 truncate">{t.title}</span>
                            </button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}

          {/* Global Final Course Assessment — bottom of sidebar */}
          {hasExam && (
            <div className="p-3 pt-4 mt-2 border-t border-slate-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  setShowExam(true)
                  setExamStarted(true)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  try { localStorage.setItem(`exam_showing_course_${courseId}`, 'true'); localStorage.setItem(`exam_started_course_${courseId}`, 'true') } catch (_) {}
                }}
                disabled={!allTopicsCompleted}
                className={`w-full text-left rounded-lg px-4 py-3 flex items-center gap-3 transition-all ${
                  !allTopicsCompleted
                    ? 'opacity-40 pointer-events-none bg-slate-100 dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-500'
                    : showExam
                      ? 'bg-indigo-100 dark:bg-indigo-950/40 border border-indigo-400 dark:border-indigo-500/60 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-600/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/30 hover:border-amber-400 dark:hover:border-amber-500/50 shadow-sm'
                }`}
              >
                <span className="text-lg shrink-0">{'\u{1F4DD}'}</span>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm leading-tight">Final Course Assessment</span>
                  <span className="text-[11px] opacity-70 leading-tight mt-0.5">
                    {!allTopicsCompleted
                      ? 'Complete all topics in all lessons to unlock'
                      : showExam ? 'Review your answers' : `${quizQuestions.length} questions · 75% to pass`}
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/30 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Lesson {lessonIndex + 1} of {totalLessons}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-sm text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-cyan-400 transition-colors"
            >
              Exit
            </Link>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full">
          {showExam && hasExam ? (
            <div className="mb-8">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">
                <span>{'\u{1F4DD}'}</span>
                <span>Final Assessment</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Final Course Assessment
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Course Final Exam &mdash; 75% score required to pass & unlock certification.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 mb-4">
                <Clock className="w-4 h-4" />
                {lesson.duration_mins} min
                {completed && (
                  <span className="flex items-center gap-1 text-sky-600 dark:text-cyan-400 ml-3">
                    <CheckCircle className="w-4 h-4" /> Completed
                  </span>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">{lesson.title}</h1>
            </>
          )}

          {/* Lesson body — topics mode */}
          {topics && Array.isArray(topics) ? (
            <div className="mb-8">
              {!showExam && (
                <>
                  <div className="max-w-none mb-6 text-slate-900 dark:text-slate-300 leading-relaxed">
                    <ReactMarkdown components={MarkdownComponents}>{topics[activeTopicIndex]?.content || ''}</ReactMarkdown>
                  </div>

                  {/* STRICT BOTTOM NAV MATRIX */}
                  {!isLastTopic && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={handleTopicComplete}
                        className="w-full bg-[#6366F1] hover:bg-[#5558E6] text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 text-base"
                      >
                        Complete Topic & Continue →
                      </button>
                    </div>
                  )}

                  {isLastTopic && !isLastLesson && nextLesson && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => { saveTopicProgress(); navigate(`/dashboard/learn/${courseId}/lesson/${nextLesson.id}`) }}
                        className="w-full bg-[#6366F1] hover:bg-[#5558E6] text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 text-base"
                      >
                        Next Lesson <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {isLastTopic && isLastLesson && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => { saveTopicProgress(); setShowExam(true); setExamStarted(true); window.scrollTo({ top: 0, behavior: 'smooth' }); try { localStorage.setItem(`exam_showing_course_${courseId}`, 'true'); localStorage.setItem(`exam_started_course_${courseId}`, 'true') } catch (_) {} }}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-indigo-400 text-black font-semibold px-6 py-3 rounded-lg transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 text-base"
                      >
                        Proceed to Final Course Assessment <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Final Exam Section */}
              {showExam && hasExam && (
                <FinalExam questions={quizQuestions} onPass={handleExamPass} />
              )}
            </div>
          ) : null}

          {/* Bottom Navigation — lesson-level Previous / Next only */}
          {isEnrolled && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {prevLesson && (
                    <Link
                      to={`/dashboard/learn/${courseId}/lesson/${prevLesson.id}`}
                      className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-cyan-400 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {isLastTopic && !isLastLesson && nextLesson && (
                    <button
                      onClick={() => { saveTopicProgress(); navigate(`/dashboard/learn/${courseId}/lesson/${nextLesson.id}`) }}
                      className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#5558E6] text-white font-semibold px-6 py-3 rounded-lg transition"
                    >
                      Next Lesson <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {isLastTopic && isLastLesson && !showExam && (
                    <button
                      onClick={() => { saveTopicProgress(); setShowExam(true); setExamStarted(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition"
                    >
                      Proceed to Final Course Assessment <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {showExam && examPassed && (
                    <Link
                      to={`/dashboard/courses/${courseId}`}
                      className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition"
                    >
                      <CheckCircle className="w-4 h-4" /> Back to Course
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {!isEnrolled && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
              <Link
                to={`/dashboard/courses/${courseId}`}
                className="text-sm text-sky-600 dark:text-cyan-400 hover:underline"
              >
                Enroll in this course to track progress
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
