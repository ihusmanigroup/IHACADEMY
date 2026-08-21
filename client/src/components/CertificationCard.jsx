import {
  Lock, Award, Eye, BookOpen, Clock, Zap, Trophy, CheckCircle2, Shield, BadgeCheck, AlertCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function CertificationCard({
  course,
  status, // 'unlocked' | 'pending' | 'locked'
  progress,
  lessonsDone,
  template,
  meta,
  issueDate,
  credentialId,
  onView,
}) {
  const navigate = useNavigate()
  const IconComponent = meta.icon
  const hours = course.duration_hours || Math.round((course.total_lessons || 0) / 2)
  const unlocked = status === 'unlocked'
  const pending = status === 'pending'

  const handleContinueCourse = () => {
    navigate(`/courses?courseId=${course.id}`)
  }

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 transition-colors duration-300 hover:border-cyan-500/40 shadow-sm overflow-hidden">
      {/* Top Thumbnail / Lock Section */}
      <div className="h-40 relative rounded-t-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0" style={{ background: meta.glow }} />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {unlocked ? (
          <>
            {template?.template_url ? (
              <img
                src={template.template_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
            ) : null}
            <div className="relative bg-white/10 backdrop-blur-md rounded-full p-4 ring-1 ring-cyan-400/30 z-10">
              <Award className="w-10 h-10 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.45)]" />
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider z-10 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.45)]">
              <Trophy className="w-3 h-3" /> Unlocked / Verified
            </div>
          </>
        ) : pending ? (
          <>
            <div className="relative bg-white/5 backdrop-blur-md rounded-full p-4 ring-1 ring-white/5 z-0 opacity-30 grayscale">
              <IconComponent className={`w-10 h-10 ${meta.iconColor}`} />
            </div>
            <div className="absolute inset-0 bg-slate-950/75 flex flex-col items-center justify-center z-10 px-4 text-center">
              <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-full text-amber-300">
                <AlertCircle className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-slate-200 mt-3 leading-snug">
                Course Completed (100%)<br />— Pending Admin Certificate Release
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="relative bg-white/5 backdrop-blur-md rounded-full p-4 ring-1 ring-white/5 z-0 opacity-30">
              <IconComponent className={`w-10 h-10 ${meta.iconColor}`} />
            </div>
            <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center z-10">
              <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-full text-slate-300 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                <Lock className="w-6 h-6" />
              </div>
              <span className="tracking-widest text-xs font-bold text-slate-300 mt-3">LOCKED</span>
            </div>
          </>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          {course.category && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400 border border-cyan-500/20">
              {course.category}
            </span>
          )}
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {course.level || 'Beginner'}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors leading-snug">{course.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
          {course.description || 'No description available.'}
        </p>

        {unlocked ? (
          <>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Complete
            </div>
            <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Earned on {issueDate}
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-600 dark:text-cyan-400">
                <Shield className="w-3.5 h-3.5" /> {credentialId}
              </div>
            </div>
          </>
        ) : pending ? (
          <div className="mt-3 flex items-start gap-2 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Completed at 100% — awaiting academy to release your certificate.</span>
          </div>
        ) : (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 tabular-nums">{progress}% Complete</span>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                {lessonsDone}/{course.total_lessons} Lessons Completed
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Meta Info Row */}
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-500" /> {course.total_lessons} lessons
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> {hours} hrs
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-slate-500" /> {course.xp_reward} XP
          </span>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-4">
          {unlocked ? (
            <button
              onClick={onView}
              className="w-full py-3 rounded-xl text-sm transition-all duration-200 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4" /> View &amp; Download Certificate
            </button>
          ) : pending ? (
            <button
              disabled
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
            >
              <Lock className="w-4 h-4" /> Pending Admin Release
            </button>
          ) : (
            <button
              onClick={handleContinueCourse}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" /> Continue Course <span className="text-lg leading-none">→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
