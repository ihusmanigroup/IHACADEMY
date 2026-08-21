import { useState, useEffect } from 'react'

const getParts = (ms) => {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(totalSec / 86400)
  const h = Math.floor((totalSec % 86400) / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return { d, h, m, s }
}

const pad = (n) => String(n).padStart(2, '0')

export default function LiveCountdown({ target, labels = { d: 'days', h: 'hrs', m: 'min', s: 'sec' }, compact = false }) {
  const [ms, setMs] = useState(() => (target ? target.getTime() - Date.now() : 0))

  useEffect(() => {
    if (!target) return
    setMs(target.getTime() - Date.now())
    const id = setInterval(() => setMs(target.getTime() - Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])

  if (compact) {
    const { d, h, m, s } = getParts(ms)
    return (
      <span className="inline-flex items-center gap-1 font-mono font-bold tabular-nums text-slate-900 dark:text-white">
        <span className="rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs">{pad(d)}</span>
        <span className="text-[10px] text-slate-400">:</span>
        <span className="rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs">{pad(h)}</span>
        <span className="text-[10px] text-slate-400">:</span>
        <span className="rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs">{pad(m)}</span>
        <span className="text-[10px] text-slate-400">:</span>
        <span className="rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs">{pad(s)}</span>
      </span>
    )
  }

  const { d, h, m, s } = getParts(ms)
  const cells = [
    { value: pad(d), label: labels.d },
    { value: pad(h), label: labels.h },
    { value: pad(m), label: labels.m },
    { value: pad(s), label: labels.s },
  ]

  return (
    <div className="flex items-center gap-2">
      {cells.map((c) => (
        <div key={c.label} className="flex flex-col items-center">
          <span className="min-w-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1.5 text-center text-sm font-mono font-bold tabular-nums text-slate-900 dark:text-white">
            {c.value}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-1">{c.label}</span>
        </div>
      ))}
    </div>
  )
}
