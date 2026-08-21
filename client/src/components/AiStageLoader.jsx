import { Loader2 } from 'lucide-react'

// Dynamic multi-stage loading states (exact copy from the Paid Course AI spec).
const AI_STAGES = {
  0: { pct: 0, msg: 'Initializing AI engine & scanning course context...', icon: '⚡' },
  50: { pct: 50, msg: '50% completed... structuring key concepts and points...', icon: '🧠' },
  90: { pct: 90, msg: 'Almost there! Finalizing your response...', icon: '🚀' },
  100: { pct: 100, msg: 'Response ready!', icon: '✅' },
}

export default function AiStageLoader({ stage = 0, compact = false }) {
  const s = AI_STAGES[stage] || AI_STAGES[0]

  if (compact) {
    return (
      <div className="flex items-center gap-2.5 pt-3">
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-sky-500" />
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-700"
            style={{ width: `${s.pct}%` }}
          />
        </div>
        <span className="shrink-0 text-[11px] font-bold text-sky-600 dark:text-sky-400">{s.pct}%</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-md shadow-sky-500/25">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
          <span className="absolute -bottom-1 -right-1 text-sm">{s.icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.msg}</p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {s.pct}% completed
          </p>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 transition-all duration-700"
          style={{ width: `${s.pct}%` }}
        >
          <span className="absolute inset-0 animate-pulse bg-white/20" />
        </div>
      </div>
    </div>
  )
}
