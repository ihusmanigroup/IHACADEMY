import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, BookOpen, BookMarked, Zap, CheckCircle2, Circle, ChevronDown, ChevronLeft,
  ChevronRight, Code2, Lock, Play, Layers, FileText, Award, Crown,
  AlertTriangle, Trophy, Rocket, X, Sparkles, GraduationCap,
} from 'lucide-react'
import {
  resolveLocalCourse, localLessonList, localResumeLesson, localProgressKey,
  localQuizKey, localCapstoneKey,
} from '../data/coursesData'
import { computeUnlockedLessons, loadJson, saveJson } from '../utils/mlMajorProgress'
import { useActiveCourse } from '../context/CourseContext'
import { useAuth } from '../context/AuthContext'
import { useEnrollmentGuard } from '../hooks/useEnrollmentGuard'
import { getPlanTier } from '../utils/subscription'
import AiLessonChat from './AiLessonChat'
import CourseMasterNotes from './CourseMasterNotes'
import CourseEbook from './CourseEbook'
import CourseWorkspaceShell from './CourseWorkspaceShell'
import CapstoneSubmissionPanel from './CapstoneSubmissionPanel'
import MultiLangCodeBlock from './MultiLangCodeBlock'

// ---------------------------------------------------------------------------
// CourseViewer — generic interactive player for ANY PRO major that ships its
// lessons locally (src/data). Rendered at /course/:courseId (or /learn/:courseId).
//
// Module tree = 10 content modules + Section 11 (Grand Quiz & Final
// Assessment, 20 MCQs) + Section 12 (Final Capstone Certification Project,
// 3 options with submission form). Quiz pass (>= 80%) unlocks the capstone
// submission. Per-course progress/quiz/capstone state lives in localStorage.
//
// The Machine Learning Major keeps its dedicated viewer (MajorCourseViewer —
// quiz + capstone + remote sync); every other local track (Generative AI)
// plays here.
// ---------------------------------------------------------------------------

const QUIZ_PASS_PERCENT = 80

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

// 4-tab navigation (Curriculum / Grand Quiz / Capstone / Course Master Notes)
// — matches the ml-major-course viewer architecture.
function TabButton({ active, onClick, icon: Icon, label, badge, locked, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all w-full ${
        locked
          ? 'opacity-60 text-slate-400 dark:text-slate-500 cursor-not-allowed'
          : active
            ? 'bg-sky-500/20 text-sky-400 border-l-4 border-sky-500'
            : 'text-slate-500 dark:text-slate-500 border-l-4 border-transparent hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
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

// ---------------------------------------------------------------------------
// Section 11 — Grand Quiz & Final Assessment (interactive, 20 MCQs)
// ---------------------------------------------------------------------------
function QuizSection({ course, quizState, updateQuiz, onBack, onProceed }) {
  const questions = course.grandQuiz || []
  const { answers, submitted, score } = quizState
  const answeredCount = Object.keys(answers).length
  const scorePct = questions.length > 0 ? Math.round(((score ?? 0) / questions.length) * 100) : 0
  const passed = scorePct >= QUIZ_PASS_PERCENT
  const quizTitle = `Grand ${course.title.replace(/ (Engineering )?Major Course$/, '')} Quiz`

  const selectAnswer = (qid, optionIndex) => {
    if (submitted) return
    updateQuiz({ ...quizState, answers: { ...answers, [qid]: optionIndex } })
  }

  const submitQuiz = () => {
    if (answeredCount < questions.length) return
    const correct = questions.filter((q) => answers[q.id] === q.answer).length
    updateQuiz({ ...quizState, submitted: true, score: correct })
    scrollToTop()
  }

  const retakeQuiz = () => {
    updateQuiz({ answers: {}, submitted: false, score: null })
    scrollToTop()
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-white via-slate-50 to-sky-100/60 dark:from-[#111827] dark:via-[#0F172A] dark:to-[#0369A1]/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-md">
            Grand Quiz · Final Assessment
          </span>
          <span className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-md">
            {questions.length} MCQs · {QUIZ_PASS_PERCENT}% to pass
          </span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-snug">{quizTitle}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 leading-relaxed">
          Covers the entire syllabus — transformers, self-attention, decoding temperature, few-shot prompting,
          cosine similarity, chunking, LoRA, ReAct, hallucination, BLEU/ROUGE, quantization, prompt injection,
          vector databases, streaming, and caching. Score {QUIZ_PASS_PERCENT}%+ to unlock the Capstone submission.
        </p>
      </div>

      {/* Result banner after submission */}
      {submitted && (
        <div className={`rounded-2xl px-5 py-4 border flex items-center gap-4 flex-wrap ${
          passed ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-amber-500/5 border-amber-500/30'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            passed ? 'bg-emerald-500/15' : 'bg-amber-500/15'
          }`}>
            {passed
              ? <CheckCircle2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
              : <X className="w-6 h-6 text-amber-500 dark:text-amber-400" />}
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {score}/{questions.length} correct · {scorePct}%
              </p>
              {passed ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-3 h-3" /> Passed — Capstone Unlocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <Lock className="w-3 h-3" /> Below {QUIZ_PASS_PERCENT}% — Capstone Locked
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              {passed
                ? 'Excellent work — you are ready for the Final Capstone Certification Project.'
                : 'Review the explanations below and retake the quiz — you can retry as many times as you need.'}
            </p>
          </div>
          <button
            onClick={retakeQuiz}
            className="px-4 py-2 text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0"
          >
            Retake Quiz
          </button>
        </div>
      )}

      {/* Question list */}
      {!submitted ? (
        <div className="space-y-6">
          {questions.map((q, qIdx) => {
            const selected = answers[q.id]
            return (
              <div key={q.id} className="bg-white dark:bg-[#0f1420] border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-sm dark:shadow-none">
                <div className="flex items-start gap-3 mb-3">
                  <span className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {qIdx + 1}
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
            disabled={answeredCount < questions.length}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            Submit Quiz ({answeredCount}/{questions.length} answered)
          </button>
        </div>
      ) : (
        /* Score breakdown + correct answers with explanations */
        <div className="space-y-4">
          {questions.map((q, qIdx) => {
            const selected = answers[q.id]
            const isCorrect = selected === q.answer
            return (
              <div key={q.id} className="bg-white dark:bg-[#0f1420] border border-slate-200/80 dark:border-slate-800/80/80 rounded-xl p-5 shadow-sm dark:shadow-none">
                <div className="flex items-start gap-3 mb-3">
                  <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                    isCorrect ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  }`}>
                    {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                    <span className="text-slate-500 mr-1">{qIdx + 1}.</span>{q.question}
                  </p>
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
                <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-2 flex items-start gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-sky-500 mt-0.5 shrink-0" />
                  <span><strong className="text-slate-700 dark:text-slate-300">Correct answer:</strong> {q.options[q.answer]}</span>
                </p>
              </div>
            )
          })}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={retakeQuiz}
              className="px-5 py-2.5 text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Retake Quiz
            </button>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-sky-500/20 cursor-pointer"
            >
              <><BookOpen className="w-4 h-4" /> Back to Curriculum</>
            </button>
            {passed && (
              <button
                onClick={onProceed}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <><Rocket className="w-4 h-4" /> Proceed to Capstone Projects</>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section 12 — Final Capstone Certification Project (choose + submit)
// ---------------------------------------------------------------------------
function CapstoneSection({ course, capstoneState, updateCapstone, quizPassed, onQuiz }) {
  const capstones = course.capstones || []
  const submitted = capstoneState?.submittedAt != null
  const [selectedId, setSelectedId] = useState(capstoneState?.capstoneId || '')

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-white via-slate-50 to-sky-100/60 dark:from-[#111827] dark:via-[#0F172A] dark:to-[#0369A1]/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-md">
            Capstone Projects · Certification Gate
          </span>
          {submitted && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" /> Submission Recorded
            </span>
          )}
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-snug">Choose &amp; Submit Your Capstone Project</h2>
        <div className="mt-3 flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/30 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-200/90 leading-relaxed">{course.certificateRule}</p>
        </div>
      </div>

      {/* Capstone option cards */}
      <div className="space-y-4">
        {capstones.map((cap, idx) => {
          const isSelected = selectedId === cap.id
          const isSubmittedCap = submitted && capstoneState.capstoneId === cap.id
          return (
            <div
              key={cap.id}
              className={`rounded-2xl border p-5 transition-all duration-300 ${
                isSelected
                  ? 'border-sky-500/60 bg-sky-500/5 shadow-lg shadow-sky-500/10'
                  : 'bg-white dark:bg-[#0f1420]/80/90 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              } ${isSubmittedCap ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/5' : ''}`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => setSelectedId(cap.id)}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    isSelected ? 'border-sky-500' : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                      <Rocket className="w-3 h-3" /> Capstone {idx + 1}
                    </span>
                    {isSubmittedCap && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Your Submission
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mt-1.5">{cap.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 leading-relaxed">{cap.description}</p>

                  {cap.requirements?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-sky-600 dark:text-sky-400 mb-1.5">Requirements</p>
                      <ul className="space-y-1">
                        {cap.requirements.map((r) => (
                          <li key={r} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <CheckCircle2 className="w-3 h-3 text-sky-500 mt-0.5 shrink-0" /> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {cap.deliverables?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">Deliverables</p>
                      <ul className="space-y-1">
                        {cap.deliverables.map((d) => (
                          <li key={d} className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed">
                            <FileText className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" /> {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* DB-backed submission form + status cards (also renders the quiz lock gate) */}
      <CapstoneSubmissionPanel
        course={course}
        quizPassed={quizPassed}
        onQuiz={onQuiz}
        capstoneState={capstoneState}
        updateCapstone={updateCapstone}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// CourseViewer — main component
// ---------------------------------------------------------------------------
export default function CourseViewer() {
  const { courseId } = useParams()
  const [searchParams] = useSearchParams()
  const { markCourseStarted, refreshActiveCourse } = useActiveCourse()
  const { profile } = useAuth()
  const { checking: guardChecking, denied: guardDenied } = useEnrollmentGuard(courseId)

  // Full-screen workspace: refs to the scrollable content area + AI tutor block
  const contentRef = useRef(null)
  const aiTutorRef = useRef(null)
  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const course = useMemo(() => resolveLocalCourse(courseId), [courseId])
  const flatLessons = useMemo(() => localLessonList(course), [course])

  // Opening a PRO major player makes it the globally active course.
  useEffect(() => {
    if (course) markCourseStarted(course)
  }, [course, markCourseStarted])

  const progressKey = localProgressKey(course?.id || courseId)
  const quizKey = localQuizKey(course?.id || courseId)
  const capstoneKey = localCapstoneKey(course?.id || courseId)

  const [completedLessons, setCompletedLessons] = useState(() => new Set(loadJson(progressKey, [])))
  const [quizState, setQuizState] = useState(() =>
    loadJson(quizKey, { answers: {}, submitted: false, score: null })
  )
  const [capstoneState, setCapstoneState] = useState(() => loadJson(capstoneKey, null))
  const [openModules, setOpenModules] = useState(() => {
    if (course?.modules?.length) return new Set([course.modules[0].id])
    return new Set()
  })

  const updateQuiz = (next) => {
    setQuizState(next)
    saveJson(quizKey, next)
  }
  const updateCapstone = (next) => {
    setCapstoneState(next)
    saveJson(capstoneKey, next)
  }

  // Resume deep link: /course/:id?lesson=1.5 (falls back to local resume)
  const initialLessonId = useMemo(() => {
    const lessonParam = searchParams.get('lesson')
    if (lessonParam && flatLessons.some((l) => l.id === lessonParam)) return lessonParam
    return localResumeLesson(course)
  }, [course, flatLessons, searchParams])

  const [activeLessonId, setActiveLessonId] = useState(initialLessonId)

  // 3-Tab navigation state, synced with the URL (?tab=quiz|capstone|curriculum)
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab')
    return tab === 'quiz' || tab === 'capstone' || tab === 'notes' || tab === 'ebook' ? tab : 'curriculum'
  })
  const [notesLockHint, setNotesLockHint] = useState(false)
  const [quizLockHint, setQuizLockHint] = useState(false)

  // ?lesson= / ?tab= navigation (Start Module / Continue Course deep links)
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'quiz') {
      if (courseComplete) setActiveTab('quiz')
      else setActiveTab('curriculum')
    } else if (tabParam === 'capstone') {
      setActiveTab(tabParam)
    }
    const lessonParam = searchParams.get('lesson')
    if (lessonParam && flatLessons.some((l) => l.id === lessonParam)) {
      setActiveLessonId(lessonParam)
      setActiveTab('curriculum')
      const target = flatLessons.find((l) => l.id === lessonParam)
      if (target) setOpenModules((prev) => new Set(prev).add(target.moduleId))
      scrollToTop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, flatLessons])

  const unlockedLessons = useMemo(
    () => computeUnlockedLessons(flatLessons, completedLessons),
    [flatLessons, completedLessons]
  )

  const currentIndex = flatLessons.findIndex((l) => l.id === activeLessonId)
  const activeLesson = flatLessons.find((l) => l.id === activeLessonId)
  const activeModule = course?.modules?.find((m) => m.id === activeLesson?.moduleId)
  const nextLesson = currentIndex >= 0 && currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null
  const courseComplete = flatLessons.length > 0 && completedLessons.size >= flatLessons.length
  const overallProgress = flatLessons.length > 0 ? Math.round((completedLessons.size / flatLessons.length) * 100) : 0

  // Course Master Notes unlock condition: ALL lessons must be complete.
  const notesUnlocked = completedLessons.size >= flatLessons.length

  // eBook access: the "Exclusive PDF eBooks access" perk is Pro/Exclusive only.
  const ebookLocked = getPlanTier(profile) === 'free'

  // Section 11 quiz state helpers
  const quizQuestions = course?.grandQuiz || []
  const quizAnsweredCount = Object.keys(quizState.answers).length
  const quizScorePct = quizQuestions.length > 0 && quizState.score != null
    ? Math.round((quizState.score / quizQuestions.length) * 100)
    : 0
  const quizPassed = quizState.submitted && quizScorePct >= QUIZ_PASS_PERCENT

  const capstoneSubmitted = capstoneState?.submittedAt != null

  if (!course || flatLessons.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors duration-300 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm dark:shadow-none">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-bold">Course content is not available yet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 leading-relaxed">
            This course has no bundled local lessons, and the server content could not be loaded.
            Please try again later.
          </p>
          <Link
            to="/courses"
            className="mt-6 inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-sky-500/20 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  const isRegularLesson = (lessonId) => flatLessons.some((l) => l.id === lessonId)

  const lessonStateIcon = (lesson) => {
    if (completedLessons.has(lesson.id)) return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
    if (unlockedLessons.has(lesson.id)) {
      return activeLessonId === lesson.id
        ? <Play className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
        : <Circle className="w-3 h-3 text-slate-500 dark:text-slate-500 shrink-0" />
    }
    return <Lock className="w-3 h-3 text-slate-500 dark:text-slate-600 shrink-0" />
  }

  const canOpenLesson = (lesson) => unlockedLessons.has(lesson.id)

  const openLesson = (lessonId) => {
    const lesson = flatLessons.find((l) => l.id === lessonId)
    if (!lesson || !canOpenLesson(lesson)) return
    setActiveLessonId(lessonId)
    setActiveTab('curriculum')
    setOpenModules((prev) => new Set(prev).add(lesson.moduleId))
    scrollToTop()
  }

  // Quick-jump to the Grand Quiz: strictly locked until 100% of the curriculum
  // lessons are complete. A locked attempt keeps the learner on the curriculum
  // view and shows an alert instead of opening the quiz.
  const goToGrandQuiz = () => {
    if (!courseComplete) {
      setQuizLockHint(true)
      setTimeout(() => setQuizLockHint(false), 3000)
      return
    }
    setActiveTab('quiz')
    scrollToTop()
  }

  const goToCapstone = () => {
    setActiveTab('capstone')
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

  const moduleLessons = (moduleId) => flatLessons.filter((l) => l.moduleId === moduleId)
  const moduleCompleted = (moduleId) => {
    const lessons = moduleLessons(moduleId)
    return lessons.length > 0 && lessons.every((l) => completedLessons.has(l.id))
  }

  const markCompletedAndContinue = () => {
    if (!activeLesson || courseComplete || !isRegularLesson(activeLesson.id)) return
    const next = new Set(completedLessons).add(activeLesson.id)
    setCompletedLessons(next)
    saveJson(progressKey, Array.from(next))
    refreshActiveCourse()
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

  const lessonText =
    activeLesson && activeLesson.content && activeLesson.content.trim().length > 0
      ? activeLesson.content
      : `[Textbook excerpt unavailable for "${activeLesson.title}" (${activeLesson.id})] Module ${activeSection?.number} — ${activeSection?.title}: ${activeSection?.summary || course.description}`

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
      title={course.title}
      subtitle={course.subtitle}
      backTo="/courses"
      backLabel="Back to Courses"
      progressLabel={`${completedLessons.size}/${flatLessons.length} lessons · ${overallProgress}%`}
      progressPct={overallProgress}
      aiTutorRef={aiTutorRef}
      contentRef={contentRef}
      badges={
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <Layers className="w-3.5 h-3.5" /> {course.modules?.length || 0} Modules
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <FileText className="w-3.5 h-3.5" /> {flatLessons.length} Lessons
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Trophy className="w-3.5 h-3.5" /> {quizQuestions.length} MCQ Quiz
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Rocket className="w-3.5 h-3.5" /> {course.capstones?.length || 0} Capstones
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <Crown className="w-3.5 h-3.5" /> Pro Track
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
                    <BookOpen className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-sm font-bold text-white leading-snug drop-shadow-sm">{course.title}</h1>
                    <p className="text-[11px] text-cyan-100/70 font-medium">{course.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-cyan-200 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-300" /> Overall Progress
                  </span>
                  <span className="text-[11px] font-bold text-white">
                    {completedLessons.size}/{flatLessons.length} lessons · {overallProgress}%
                  </span>
                </div>
                <div className="h-2 bg-white/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-300 to-sky-400 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.6)] transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, overallProgress))}%` }}
                  />
                </div>
                {courseComplete && (
                  <button
                    onClick={goToGrandQuiz}
                    className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-cyan-200 cursor-pointer hover:underline"
                  >
                    <Award className="w-3.5 h-3.5" /> Curriculum complete — take the Grand Quiz!
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f1420] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3 shadow-sm dark:shadow-none space-y-1">
              <TabButton
                active={activeTab === 'curriculum'}
                onClick={() => setActiveTab('curriculum')}
                icon={BookOpen}
                label="Curriculum"
                badge={`${completedLessons.size}/${flatLessons.length}`}
              />
              <TabButton
                active={activeTab === 'quiz'}
                onClick={goToGrandQuiz}
                icon={Trophy}
                label={courseComplete ? '🏆 Grand Quiz' : '🔒 Grand Quiz (Locked)'}
                badge={courseComplete ? `${quizAnsweredCount}/${quizQuestions.length}` : undefined}
                locked={!courseComplete}
                title={courseComplete ? 'Take the Grand Quiz' : 'Locked: You must complete 100% of the Curriculum lessons before unlocking the Grand Quiz!'}
              />
              <TabButton
                active={activeTab === 'capstone'}
                onClick={goToCapstone}
                icon={Rocket}
                label="Capstone Projects"
                badge={capstoneSubmitted ? `1/${course.capstones?.length || 0}` : `0/${course.capstones?.length || 0}`}
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
              <div className="bg-white dark:bg-[#0f1420] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Module Tree</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-600 font-medium">{course.modules?.length || 0} modules</span>
                </div>
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {course.modules.map((section) => {
                    const lessons = flatLessons.filter((l) => l.moduleId === section.id)
                    const done = lessons.filter((l) => completedLessons.has(l.id)).length
                    const unlockedCount = lessons.filter((l) => unlockedLessons.has(l.id)).length
                    const sectionPercent = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0
                    const isComplete = moduleCompleted(section.id)
                    const isOpen = openModules.has(section.id)
                    const isActiveSection = activeLesson?.moduleId === section.id

                    return (
                      <div key={section.id} className="border-b border-slate-200 dark:border-slate-800/60 last:border-b-0">
                        <button
                          onClick={() => toggleModule(section.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors cursor-pointer ${
                            isActiveSection ? 'bg-sky-500/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                          }`}
                        >
                          <span className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                            isComplete
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : isActiveSection
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500'
                          }`}>
                            {isComplete ? <CheckCircle2 className="w-4 h-4" /> : section.number}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className={`block text-xs font-bold leading-snug truncate ${isActiveSection ? 'text-sky-600 dark:text-sky-300' : unlockedCount === 0 ? 'text-slate-500 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                              {section.title}
                            </span>
                            <span className="flex items-center gap-2 mt-1">
                              <ProgressBar percent={sectionPercent} slim />
                              <span className={`text-[10px] font-bold shrink-0 ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                                {sectionPercent}%
                              </span>
                            </span>
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-sky-500 dark:text-sky-400' : ''}`} />
                        </button>

                        {isOpen && (
                          <div className="px-2.5 pb-2.5 space-y-0.5">
                            {lessons.map((l) => {
                              const unlocked = canOpenLesson(l)
                              const isActive = activeLessonId === l.id
                              const isDone = completedLessons.has(l.id)
  return (
                                <button
                                  key={l.id}
                                  onClick={() => openLesson(l.id)}
                                  disabled={!unlocked}
                                  title={unlocked ? `Open ${l.id} — ${l.title}` : 'Complete the previous module to unlock'}
                                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${
                                    unlocked ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50' : 'cursor-not-allowed opacity-50'
                                  } ${isActive ? 'bg-sky-500/15 border border-sky-500/40 shadow-[0_0_12px_rgba(14,165,233,0.15)]' : 'border border-transparent'}`}
                                >
                                  {lessonStateIcon(l)}
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
            )}

            {activeTab === 'quiz' && (
              <div className="bg-white dark:bg-[#0f1420] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Grand Quiz</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
                  {quizState.submitted
                    ? `Final score ${quizScorePct}% — ${quizPassed ? 'Passed! The Capstone Projects are now unlocked.' : 'retake the quiz to unlock the Capstone Projects.'}`
                    : courseComplete
                      ? `${quizAnsweredCount}/${quizQuestions.length} questions answered. Score at least ${QUIZ_PASS_PERCENT}% to pass and unlock the Capstone Projects.`
                      : `Complete all ${flatLessons.length} curriculum lessons (${overallProgress}% done) to unlock the Grand Quiz.`}
                </p>
                <button
                  onClick={goToGrandQuiz}
                  className={`mt-4 w-full inline-flex items-center justify-center gap-2 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    courseComplete
                      ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {courseComplete ? (
                    <>
                      <Trophy className="w-3.5 h-3.5" /> {quizState.submitted ? 'Retake the Quiz' : 'Start the Quiz'}
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Grand Quiz Locked
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'capstone' && (
              <div className="bg-white dark:bg-[#0f1420] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 mb-3">
                  <Rocket className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Capstone Projects</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
                  {capstoneSubmitted
                    ? 'Submission sent for review — the certificate becomes available once approved.'
                    : quizPassed
                      ? `Pick one of the ${course.capstones?.length || 3} projects, build it, and submit your work for review.`
                      : 'Pass the Grand Quiz (score at least 80%) to unlock the Capstone Projects.'}
                </p>
                <button
                  onClick={goToCapstone}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <Rocket className="w-3.5 h-3.5" /> {capstoneSubmitted ? 'View Submission' : quizPassed ? 'Start Your Capstone' : 'Locked'}
                </button>
              </div>
            )}
          </div>
      }
    >
      {/* RIGHT PANEL — reader */}
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6 space-y-5">
        {activeTab === 'quiz' && (
              courseComplete ? (
                <QuizSection
                  course={course}
                  quizState={quizState}
                  updateQuiz={updateQuiz}
                  onBack={() => setActiveTab('curriculum')}
                  onProceed={goToCapstone}
                />
              ) : (
                <div className="bg-white dark:bg-[#0f1420] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-10 shadow-sm dark:shadow-none flex flex-col items-center justify-center text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
                    <Lock className="w-7 h-7 text-slate-500 dark:text-slate-500" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Grand Quiz — Locked</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-500 mt-2 max-w-md leading-relaxed">
                    Complete all {flatLessons.length} curriculum lessons ({completedLessons.size} done · {overallProgress}%) to
                    unlock the Grand Quiz.
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

            {activeTab === 'capstone' && (
              <CapstoneSection
                course={course}
                capstoneState={capstoneState}
                updateCapstone={updateCapstone}
                quizPassed={quizPassed}
                onQuiz={goToGrandQuiz}
              />
            )}

            {activeTab === 'curriculum' && isRegularLesson(activeLesson?.id) && activeModule && (
              <div key={activeLesson.id} className="space-y-5 animate-fade-in">
                {/* Reader header */}
                <div className="bg-gradient-to-r from-white via-slate-50 to-sky-100/60 dark:from-[#111827] dark:via-[#0F172A] dark:to-[#0369A1]/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-md">
                      Module {activeLesson.moduleNumber} · Lesson {currentIndex + 1} of {flatLessons.length}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${DIFFICULTY_BADGE[activeModule.difficulty] || DIFFICULTY_BADGE.Beginner}`}>
                      {activeModule.difficulty}
                    </span>
                    {completedLessons.has(activeLesson.id) && (
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
                      {completedLessons.has(activeLesson.id) ? (
                        <><ChevronRight className="w-4 h-4" /> Next Lesson</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" /> Mark Completed & Continue</>
                      )}
                    </button>
                    {nextLesson && completedLessons.has(activeLesson.id) && (
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
                {activeModule.number > 1 && moduleCompleted(course.modules[activeModule.number - 2]) && (
                  <div className="rounded-2xl px-5 py-4 bg-emerald-500/5 border border-emerald-500/30 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-200/90 leading-relaxed">
                      <strong className="text-emerald-600 dark:text-emerald-300">Module {activeModule.number - 1} complete!</strong> You have unlocked Module {activeModule.number} — {activeModule.title}.
                    </p>
                  </div>
                )}

                {/* Course complete banner */}
                {courseComplete && (
                  <div className="rounded-2xl px-5 py-4 bg-emerald-500/10 border border-emerald-500/40 flex items-center gap-3 animate-fade-in">
                    <Award className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-200/90 leading-relaxed">
                      <strong className="text-emerald-600 dark:text-emerald-300">Curriculum complete — {overallProgress}%!</strong> All {flatLessons.length} lessons are done. Next:{' '}
                      <button
                        onClick={goToGrandQuiz}
                        className="inline font-bold text-emerald-600 dark:text-emerald-300 cursor-pointer hover:underline hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                      >
                        the Grand Quiz ({quizQuestions.length} MCQs)
                      </button>
                      , then your Capstone submission.
                    </p>
                  </div>
                )}

                {/* Lesson content */}
                <div className="bg-white dark:bg-[#0f1420] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-none">
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
                      courseTitle={course.title}
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
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Lesson {currentIndex + 1} of {flatLessons.length}</p>
                      <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 mt-0.5">{overallProgress}% complete</p>
                    </div>
                    <button
                      onClick={markCompletedAndContinue}
                      disabled={courseComplete}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed sm:gap-2 sm:px-5"
                    >
                      {completedLessons.has(activeLesson.id) ? (
                        <>Next Lesson <ChevronRight className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Mark Completed & Next <ChevronRight className="w-3.5 h-3.5" /></>
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
                    courseTitle={course.title}
                    modules={course.modules}
                    lessons={flatLessons}
                  />
                </div>
              ) : (
                <div className="bg-white dark:bg-[#0f1420] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-10 shadow-sm dark:shadow-none flex flex-col items-center justify-center text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
                    <Lock className="w-7 h-7 text-slate-500 dark:text-slate-500" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Course Master Notes — Locked</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 max-w-md leading-relaxed">
                    Complete all {flatLessons.length} lessons ({completedLessons.size} done · {overallProgress}%) to unlock
                    comprehensive course notes, cheat sheets and exam-ready material.
                  </p>
                  <button
                    onClick={goToGrandQuiz}
                    className="mt-6 inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-sky-500/20 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" /> Back to Grand Quiz
                  </button>
                </div>
              )
            )}

            {activeTab === 'ebook' && (
              <CourseEbook course={course} flatLessons={flatLessons} locked={ebookLocked} />
            )}

            {!activeLesson && courseComplete && (
              <div className="bg-white dark:bg-[#0f1420] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-10 shadow-sm dark:shadow-none flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Curriculum Complete!</h2>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 max-w-md leading-relaxed">
                  You finished all {flatLessons.length} lessons. Switch to the Grand Quiz tab to take the {quizQuestions.length}-question Grand Quiz, then submit your capstone to claim your certificate.
                </p>
                <div className="flex items-center gap-3 mt-6 flex-wrap justify-center">
                  <button
                    onClick={goToGrandQuiz}
                    className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-sky-500/20 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" /> Take the Grand Quiz
                  </button>
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" /> Back to Courses
                  </Link>
                </div>
              </div>
            )}
        </div>
    </CourseWorkspaceShell>
  )
}
