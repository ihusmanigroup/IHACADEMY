import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { RoadmapContent } from './MLMajorRoadmap'
import { PRO_MAJOR_CATALOG_BY_ID, localResumeLesson } from '../data/coursesData'
import { useActiveCourse } from '../context/CourseContext'

// ---------------------------------------------------------------------------
// RoadmapModal — slide-over drawer (right side) with the single clean roadmap
// header (badge / meta / title / description / price + CTA) and the
// interactive vertical winding roadmap path below it. Every surface uses
// light/dark Tailwind variants so the drawer follows the app theme.
// ---------------------------------------------------------------------------
export default function RoadmapModal({
  course,
  onClose,
  onStart = null,
  isEnrolled = false,
  isCompleted = false,
  progress = 0,
  onEnroll = null,
  onContinue = null,
}) {
  const { markCourseStarted } = useActiveCourse()

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

  // Course metadata: rich course objects don't carry price / counts — those
  // live on the catalog entry. Fall back to the course itself for standalone
  // usage (e.g. DashboardHome).
  const catalog = PRO_MAJOR_CATALOG_BY_ID[course.id] || course
  const price = catalog?.price || '—'
  const priceLabel = String(price).replace(/^From\s+/i, '').trim()
  const totalLessons =
    catalog?.total_lessons ||
    course.roadmap?.modules?.reduce((n, m) => n + (m.lessons || 0), 0) ||
    course.modules?.reduce((n, m) => n + (m.lessons?.length || 0), 0) ||
    0
  const moduleCount =
    catalog?.modulesCount ||
    course.modulesCount ||
    course.roadmap?.modules?.length ||
    course.modules?.length ||
    0

  const showCta = isEnrolled || !!onEnroll || !!onStart
  const ctaLabel = isEnrolled
    ? isCompleted
      ? `Review Course · ${progress}%`
      : progress > 0
        ? `Continue Roadmap · ${progress}%`
        : 'Start Course'
    : onEnroll
      ? `Enroll Now · ${price}`
      : 'Start Course'

  const handleCta = () => {
    markCourseStarted(course)
    if (isEnrolled) {
      if (onContinue) onContinue()
      else if (onStart) onStart(course, { lessonId: localResumeLesson(course) })
    } else if (onEnroll) {
      onEnroll()
    } else if (onStart) {
      onStart(course, { lessonId: localResumeLesson(course) })
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50" onClick={onClose} role="dialog" aria-modal="true" aria-label={course.title}>
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
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Single clean header */}
        <div className="relative shrink-0 px-6 pt-6">
          <div className="max-w-xl mx-auto p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 mb-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold rounded-full border border-cyan-500/20">
                PRO TRACK ROADMAP
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {moduleCount} Modules • {totalLessons} Lessons
                </span>
                <button
                  onClick={onClose}
                  aria-label="Close roadmap"
                  className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/60 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
              {course.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {course.description || 'No description available.'}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700/60 gap-3">
              <span className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400">
                Included in Pro ({priceLabel})
              </span>
              {showCta && (
                <button
                  onClick={handleCta}
                  className="shrink-0 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  {ctaLabel}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Interactive vertical winding roadmap path */}
        <div className="relative flex-1 overflow-y-auto custom-scrollbar">
          <RoadmapContent course={course} inModal onStart={onStart} />
        </div>
      </div>
    </div>,
    document.body
  )
}
