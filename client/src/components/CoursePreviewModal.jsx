import { useState, useEffect } from 'react'
import {
  Zap, X, CheckCircle2, Clock, BookOpen, Loader2, GraduationCap,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const FALLBACK_POINTS = [
  'Core concepts explained step by step — no prior experience needed',
  'Hands-on practice exercises to build real confidence',
  'Practical examples you can apply immediately',
  'Progress tracking with XP rewards on completion',
]

function SkeletonLine() {
  return <div className="h-3.5 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
}

export default function CoursePreviewModal({ course, onClose, onStart }) {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('lessons')
      .select('id, title, duration_mins')
      .eq('course_id', course.id)
      .order('lesson_order', { ascending: true })
      .limit(8)
      .then(({ data }) => {
        if (!cancelled) {
          setLessons(data || [])
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLessons([])
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [course.id])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const lessonCount = lessons.length || course.total_lessons || 0
  const durationMin = lessons.reduce((a, l) => a + (l.duration_mins || 15), 0) || lessonCount * 15
  const checklist = lessons.length
    ? lessons.slice(0, 6).map((l) => l.title)
    : FALLBACK_POINTS

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar bg-white dark:bg-[#0f1420] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl shadow-slate-950/30 dark:shadow-black/60 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-2xl px-6 pt-6 pb-5 bg-gradient-to-br from-slate-50 via-sky-50/60 to-slate-50 dark:from-[#0f1420] dark:via-sky-950/30 dark:to-[#0f1420] border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer z-10"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-cyan-400 mb-1.5">Course Preview</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug pr-8">{course.title}</h3>
          <div className="flex items-center gap-2 mt-3 flex-wrap relative z-10">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <GraduationCap className="w-3 h-3" /> {course.level || 'Beginner'}
            </span>
            {course.category && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                {course.category}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <Clock className="w-3 h-3" /> ~{durationMin} min
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <BookOpen className="w-3 h-3" /> {lessonCount} lessons
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <Zap className="w-3 h-3" /> {course.xp_reward || 50} XP
            </span>
          </div>
        </div>

        {/* Body — what you'll learn */}
        <div className="px-6 py-5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">What you&apos;ll learn</h4>
          {loading ? (
            <div className="space-y-2.5">
              <SkeletonLine />
              <SkeletonLine />
              <SkeletonLine />
              <div className="w-2/3"><SkeletonLine /></div>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {checklist.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-cyan-500 dark:text-cyan-400" />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — primary CTA */}
        <div className="px-6 py-5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0d1220]/80 rounded-b-2xl">
          <button
            onClick={() => onStart(course)}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-wait"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Start Learning
          </button>
        </div>
      </div>
    </div>
  )
}
