/** Simple CSS-only skeleton loader for CMS-driven sections. */
export default function Skeleton({ className = '', lines = 1 }) {
  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    )
  }
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 dark:bg-slate-800 ${className}`}
      aria-hidden="true"
    />
  )
}
