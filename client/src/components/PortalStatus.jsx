import { AlertTriangle } from 'lucide-react'

/**
 * Shared loading / error states for the Intern Portal. Kept in a standalone
 * module (instead of InternPortal.jsx) so InternPortalLayout can reuse them
 * without pulling the lazy-loaded InternPortal page into the main bundle.
 */

export function LoadingPortal() {
  return (
    <div className="space-y-5" aria-busy="true">
      <div className="h-6 w-48 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/5" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/5" />
    </div>
  )
}

export function ErrorPortal({ message }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10">
        <AlertTriangle className="w-8 h-8 text-rose-500" />
      </div>
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Portal unavailable</h1>
        <p className="mt-1.5 max-w-md text-sm text-slate-500">{message}</p>
      </div>
    </div>
  )
}
