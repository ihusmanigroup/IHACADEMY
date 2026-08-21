import { useState } from 'react'
import { X, Check, Loader2, Zap, BookOpen, Clock, Crown, Rocket } from 'lucide-react'
import { PAID_PLANS } from '../data/pricingData'
// Tier options for paid unlocks — derived straight from the central pricing
// source so checkout amounts always stay in sync ($30 / $60 / $100).
const TIER_ICONS = { pro: Rocket, exclusive: Crown }

const TIER_STYLES = {
  pro: { active: 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', dot: 'bg-cyan-500' },
  exclusive: { active: 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
}

function generateLearningOutcomes(course) {
  const level = course.level || 'Beginner'
  const prefix = level === 'Beginner' ? 'Understand' : level === 'Intermediate' ? 'Master' : 'Deep-dive into'
  return [
    `${prefix} core ${course.category || 'subject'} concepts and terminology`,
    `Apply best practices in ${course.title.toLowerCase()} to real-world projects`,
    `Build hands-on experience with practical exercises and examples`,
    `Develop confidence to independently solve complex problems`,
  ]
}

export default function EnrollModal({ course, onConfirm, onCancel, enrolling }) {
  const [closing, setClosing] = useState(false)
  const [tierId, setTierId] = useState(PAID_PLANS[0]?.id || 'pro')
  const isFree = course.price === 0 || course.is_free === true
  const selectedTier = PAID_PLANS.find((p) => p.id === tierId) || PAID_PLANS[0]
  const learnings = generateLearningOutcomes(course)

  const handleClose = () => {
    setClosing(true)
    setTimeout(onCancel, 200)
  }

  const handleConfirm = () => {
    setClosing(true)
    setTimeout(() => onConfirm(), 200)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className={`relative w-full max-w-lg bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 ${closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        {/* Gradient accent bar */}
        <div className={`h-1.5 w-full ${isFree ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gradient-to-r from-indigo-500 to-cyan-500'}`} />

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Badge */}
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            isFree
              ? 'border border-emerald-400/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
              : 'bg-[#6366F1] text-white'
          }`}>
            {isFree ? 'FREE COURSE' : 'PREMIUM COURSE'}
          </span>

          {/* Title */}
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-3">{course.title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            {course.description || 'No description available.'}
          </p>

          {/* Quick stats */}
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {course.total_lessons} lesson{course.total_lessons !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Est. {course.total_lessons * 15} min
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              {course.xp_reward} XP
            </span>
          </div>

          {/* What you'll learn */}
          <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">What you'll learn</h3>
            <ul className="space-y-2.5">
              {learnings.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-900 dark:text-slate-300">
                  <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/15 text-sky-600 dark:text-cyan-400 shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Plan picker — only for paid courses, sourced from pricingData */}
          {!isFree && (
            <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Choose your plan</h3>
              <div className="grid grid-cols-3 gap-2">
                {PAID_PLANS.map((plan) => {
                  const Icon = TIER_ICONS[plan.id] || Zap
                  const active = plan.id === tierId
                  const style = TIER_STYLES[plan.id] || TIER_STYLES.pro
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setTierId(plan.id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all duration-150 active:scale-95 ${
                        active ? style.active : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-semibold capitalize">{plan.uiName || plan.id}</span>
                      <span className="text-xs font-bold">{plan.price}</span>
                      <span className={`h-1.5 w-1.5 rounded-full ${active ? style.dot : 'bg-slate-300 dark:bg-slate-700'}`} />
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-[#0f1420]/80 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleClose}
            disabled={enrolling}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={enrolling}
            className={`relative overflow-hidden px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-150 active:scale-95 ${
              isFree
                ? 'bg-blue-500 hover:bg-cyan-400 text-black shadow-sm shadow-cyan-500/25'
                : 'bg-[#6366F1] hover:bg-[#5558E6] text-white shadow-lg shadow-indigo-500/25'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {enrolling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {enrolling ? 'Enrolling...' : isFree ? 'Start Learning' : `Unlock — ${selectedTier.price}`}
          </button>
        </div>
      </div>
    </div>
  )
}
