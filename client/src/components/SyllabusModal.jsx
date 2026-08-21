import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  X, Lock, CheckCircle2, Circle, BookOpen, Trophy, Rocket, Play,
  ChevronDown, Crown, Layers, GraduationCap, MapPin,
} from 'lucide-react'
import { mlMajorCourse } from '../data/mlCourseData'
import {
  resolveLocalCourse, localLessonList, localProgressKey,
  localQuizKey, localCapstoneKey, localSections,
} from '../data/coursesData'
import {
  COMPLETED_KEY, CAPSTONE_STATUS_KEY, lsKey, loadJson, flatLessonsOf,
} from '../utils/mlMajorProgress'

// ---------------------------------------------------------------------------
// SyllabusModal — interactive slide-over syllabus drawer for ANY enrolled
// course (dashboard entry point). Opens from the "View Syllabus" actions.
//
// Rich local tracks (PRO majors like Generative AI / Backend / ML Major) get a
// full module-by-module breakdown with per-lesson progress + completion
// checkmarks, plus the Grand Quiz & Capstone sections. Free DB-only courses
// get a clean, functional summary + resume CTA — never a broken navigation.
// ---------------------------------------------------------------------------

function buildSyllabus(course) {
  const courseId = course?.courseId
  const rich = courseId ? resolveLocalCourse(courseId) : null

  if (!rich) {
    return {
      kind: 'fallback',
      title: course?.title || 'Course',
      category: course?.category || '',
      totalLessons: course?.totalLessonsCount || 0,
      completedLessons: course?.completedLessonsCount || 0,
      progress: course?.progress || 0,
      done: !!course?.done,
    }
  }

  const isMl = rich.id === mlMajorCourse.id
  const flat = isMl ? flatLessonsOf(rich) : localLessonList(rich)
  const completed = new Set(
    isMl
      ? loadJson(COMPLETED_KEY, [])
      : loadJson(localProgressKey(rich.id), [])
  )

  const modules = rich.modules.map((m) => {
    const modLessons = flat.filter((l) => l.moduleId === m.id)
    const doneCount = modLessons.filter((l) => completed.has(l.id)).length
    return {
      id: m.id,
      number: m.number,
      title: m.title,
      difficulty: m.difficulty || '',
      total: modLessons.length,
      doneCount,
      done: modLessons.length > 0 && doneCount === modLessons.length,
      lessons: modLessons.map((l) => ({ id: l.id, title: l.title, done: completed.has(l.id) })),
    }
  })

  const specials = localSections(rich).slice(rich.modules.length)
  const quizDone = isMl
    ? !!loadJson(lsKey('quiz_submitted'), false)
    : !!loadJson(localQuizKey(rich.id), false)
  const capStatuses = isMl
    ? loadJson(CAPSTONE_STATUS_KEY, {})
    : loadJson(localCapstoneKey(rich.id), {})
  const capstoneDone = Object.values(capStatuses || {}).some((s) => s && s !== 'pending')

  return {
    kind: 'rich',
    title: rich.title,
    category: course?.category || rich.category || '',
    totalLessons: flat.length,
    completedLessons: completed.size,
    modules,
    specials,
    quizDone,
    capstoneDone,
  }
}

function ModuleRow({ module, open, onToggle }) {
  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        open
          ? 'border-cyan-500/40 bg-white dark:bg-slate-800/50 shadow-sm shadow-cyan-500/5'
          : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/20 hover:border-cyan-500/30'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer"
      >
        <span
          className={`w-8 h-8 rounded-lg text-xs font-black flex items-center justify-center shrink-0 transition-colors ${
            module.done
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
          }`}
        >
          {module.done ? <CheckCircle2 className="w-4 h-4" /> : module.number}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-bold text-slate-900 dark:text-white truncate">
            {module.title}
          </span>
          <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            {module.doneCount}/{module.total} lessons
            {module.done ? ' · Complete' : ''}
            {module.difficulty ? ` · ${module.difficulty}` : ''}
          </span>
        </span>
        {module.done ? (
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-emerald-500 dark:text-emerald-400">
            Done
          </span>
        ) : (
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {open && (
        <div className="px-4 pb-3 border-t border-slate-200 dark:border-slate-700/60 pt-2 space-y-1">
          {module.lessons.map((l) => (
            <div key={l.id} className="flex items-center gap-2.5 py-1.5">
              {l.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
              )}
              <span className={`text-xs font-medium truncate ${l.done ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                {l.id} · {l.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SyllabusModal({ course, onClose, resumeTo, resumeLabel, openTo }) {
  const syllabus = useMemo(() => buildSyllabus(course), [course])
  const [openId, setOpenId] = useState(() => {
    if (syllabus.kind !== 'rich') return null
    const firstIncomplete = syllabus.modules.find((m) => !m.done)
    return firstIncomplete ? firstIncomplete.id : syllabus.modules[0]?.id || null
  })

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const progress = syllabus.kind === 'rich'
    ? syllabus.totalLessons > 0
      ? Math.round((syllabus.completedLessons / syllabus.totalLessons) * 100)
      : 0
    : syllabus.progress

  const isMajor = !!course?.isMajor
  const badge = isMajor
    ? { text: 'MAJOR PROGRAM', cls: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' }
    : course?.isPro
      ? { text: 'PRO TRACK', cls: 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white' }
      : { text: 'FREE COURSE', cls: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' }

  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id))

  return createPortal(
    <div className="fixed inset-0 z-50" onClick={onClose} role="dialog" aria-modal="true" aria-label={`${syllabus.title} syllabus`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" />

      {/* Slide-over panel — follows the app theme */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-y-0 right-0 w-full max-w-2xl flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-l border-slate-200 dark:border-slate-800 shadow-2xl shadow-cyan-500/10 animate-slide-in-right transition-colors duration-300"
      >
        {/* Top accent line + ambient glow */}
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative shrink-0 px-6 pt-6">
          <div className="max-w-xl mx-auto p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 mb-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${badge.cls} shadow-sm`}>
                <Crown className="w-3 h-3" /> {badge.text}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {syllabus.kind === 'rich'
                    ? `${syllabus.modules.length} Modules • ${syllabus.totalLessons} Lessons`
                    : `${syllabus.totalLessons} Lessons`}
                </span>
                <button
                  onClick={onClose}
                  aria-label="Close syllabus"
                  className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/60 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">
              {syllabus.title}
            </h2>

            {/* Progress summary */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-sky-500/10 border border-cyan-500/25 flex items-center justify-center shrink-0">
                <span className="text-lg font-black text-cyan-600 dark:text-cyan-400">{progress}%</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {syllabus.completedLessons} of {syllabus.totalLessons} lessons completed
                </p>
                <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module / syllabus body */}
        <div className="relative flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
          <div className="max-w-xl mx-auto space-y-3">
            {syllabus.kind === 'rich' ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Module Breakdown
                  </span>
                </div>

                {syllabus.modules.map((m) => (
                  <ModuleRow key={m.id} module={m} open={openId === m.id} onToggle={() => toggle(m.id)} />
                ))}

                {/* Grand Quiz + Capstone sections */}
                {syllabus.specials.map((s) => {
                  const isQuiz = s.kind === 'QUIZ'
                  const done = isQuiz ? syllabus.quizDone : syllabus.capstoneDone
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                        done
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/20'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        done
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                          : 'bg-slate-200/80 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
                      }`}>
                        {isQuiz ? <Trophy className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-slate-900 dark:text-white">
                          {isQuiz ? 'Grand Quiz & Final Assessment' : 'Final Capstone Certification Project'}
                        </span>
                        <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                          {isQuiz ? '20-question grand assessment' : 'Choose & submit your capstone project'}
                        </span>
                      </span>
                      {done ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-500 dark:text-emerald-400 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                        </span>
                      ) : (
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                  )
                })}
              </>
            ) : (
              /* Free DB-only course fallback — always functional, never broken */
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/20 p-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/25 flex items-center justify-center mb-4">
                  <GraduationCap className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {syllabus.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  {syllabus.totalLessons > 0
                    ? `You've completed ${syllabus.completedLessons} of ${syllabus.totalLessons} lessons (${progress}%).`
                    : 'This course is delivered through the IH Academy lesson player.'}
                  {syllabus.category ? ` · ${syllabus.category}` : ''}
                </p>
                <div className="mt-5 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  />
                </div>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5" /> Open the course to see its full lesson-by-lesson syllabus.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="relative shrink-0 px-6 pb-6">
          <div className="max-w-xl mx-auto pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
            {resumeTo ? (
              <Link
                to={resumeTo}
                onClick={onClose}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                <Play className="w-4 h-4" /> {resumeLabel || 'Resume Learning'}
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            {openTo && (
              <Link
                to={openTo}
                onClick={onClose}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
              >
                <BookOpen className="w-4 h-4" /> Open Full Course
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
