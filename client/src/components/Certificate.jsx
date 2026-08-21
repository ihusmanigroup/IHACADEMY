import { AlertTriangle, CheckCircle2, FileText, Lock } from 'lucide-react'
import { usePortalStore } from '../context/PortalContext'
import { useCertificateTemplate, useCertificateCanvas } from './InternCertificate'

/**
 * Intern Portal — Certificate tab (dual-card layout).
 *
 * Card 1: Entry / Offer Letter — always unlocked; downloads the track's
 *         'entry' template with the intern's full name overlaid.
 * Card 2: Certificate of Completion — locked below 100% progress, unlocks
 *         and downloads the track's 'completion' template at 100%.
 *
 * Both templates come from Supabase `certificate_templates`; nothing is mocked.
 */

function StatusBadge({ unlocked }) {
  return unlocked ? (
    <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/25">
      <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
    </span>
  ) : (
    <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/25">
      <Lock className="w-3.5 h-3.5" /> In Progress
    </span>
  )
}

function Meta({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5 text-left">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  )
}

function TemplatePreview({ template, canvas, loading, error, altText }) {
  if (loading) {
    return <div className="h-52 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
  }
  if (!template?.template_url) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/10 px-6 py-10 text-center">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Template not uploaded yet</p>
        <p className="mt-1 text-xs text-slate-500">
          {error ? `The certificate service reported an error (${error}).` : altText}
        </p>
      </div>
    )
  }
  return (
    <div>
      <canvas ref={canvas.canvasRef} className="w-full h-auto rounded-xl border border-slate-200 dark:border-white/10" />
      {canvas.status === 'error' && (
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            The template image could not be loaded.{' '}
            <a href={template.template_url} target="_blank" rel="noreferrer" className="font-semibold underline">Open template directly</a>.
          </span>
        </p>
      )}
    </div>
  )
}

export default function CertificateView() {
  const { allApproved, overallPct, totals, userTrack, context } = usePortalStore()
  const trackName = userTrack || 'Winter Internship'
  const trackSlug = context?.track?.slug || context?.application?.track || null
  const internName = context?.application?.full_name || ''
  const joinedDate = context?.enrollment?.joined_at ? new Date(context.enrollment.joined_at) : new Date()
  const completionDate = context?.enrollment?.completed_at ? new Date(context.enrollment.completed_at) : new Date()

  // Entry offer letter is always unlocked; the completion template is only
  // fetched once the roadmap hits 100% approval.
  const entry = useCertificateTemplate(trackSlug, 'entry')
  const completion = useCertificateTemplate(allApproved ? trackSlug : null, 'completion')

  const entryCanvas = useCertificateCanvas({
    templateUrl: entry.template?.template_url || '',
    internName,
    nameOffsetX: entry.template?.name_offset_x,
    nameOffsetY: entry.template?.name_offset_y,
    nameFontSize: entry.template?.name_font_size,
    nameColor: entry.template?.name_color,
  })
  const completionCanvas = useCertificateCanvas({
    templateUrl: completion.template?.template_url || '',
    internName,
    nameOffsetX: completion.template?.name_offset_x,
    nameOffsetY: completion.template?.name_offset_y,
    nameFontSize: completion.template?.name_font_size,
    nameColor: completion.template?.name_color,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white">Certificates &amp; Offers</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 mb-6">Winter Internship 2026-27 · {trackName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Card 1 — Entry Offer Letter (always unlocked) */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs dark:border-slate-800 dark:bg-[#0f1420]">
          <div className="border-b border-slate-200 dark:border-white/10 px-6 py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Entry Offer Letter / Journey Start</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Official selection offer letter for your internship cohort.
                </p>
              </div>
              <StatusBadge unlocked />
            </div>
          </div>

          <div className="flex-1 px-6 py-6">
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Meta label="Intern" value={internName || trackName} />
              <Meta label="Track" value={trackName} />
              <Meta label="Issued" value={joinedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
            </div>
            <TemplatePreview
              template={entry.template}
              canvas={entryCanvas}
              loading={entry.loading}
              error={entry.error}
              altText="Your offer letter template is being prepared by IH Academy."
            />
          </div>

          <div className="border-t border-slate-200 dark:border-white/10 px-6 py-5">
            <button
              onClick={entryCanvas.download}
              disabled={entryCanvas.status !== 'ready'}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition hover:from-sky-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileText className="w-4 h-4" /> Download Offer Letter
            </button>
          </div>
        </div>

        {/* Card 2 — Certificate of Completion (progress locked) */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs dark:border-slate-800 dark:bg-[#0f1420]">
          <div className="border-b border-slate-200 dark:border-white/10 px-6 py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Certificate of Completion</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Official completion certificate issued at 100% approval.
                </p>
              </div>
              <StatusBadge unlocked={allApproved} />
            </div>
          </div>

          <div className="flex-1 px-6 py-6">
            {!allApproved ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Certificate Locked</h3>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                  Complete 100% of your roadmap to unlock the official certificate.
                </p>
                <div className="mt-5 w-full max-w-sm">
                  <div className="h-3 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${overallPct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                    {overallPct}% Complete · {totals.approved} of {totals.total} assignments approved
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Meta label="Intern" value={internName || trackName} />
                  <Meta label="Track" value={trackName} />
                  <Meta
                    label="Completed"
                    value={completionDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                </div>
                <TemplatePreview
                  template={completion.template}
                  canvas={completionCanvas}
                  loading={completion.loading}
                  error={completion.error}
                  altText="Your completion certificate template is being prepared by IH Academy."
                />
              </>
            )}
          </div>

          <div className="border-t border-slate-200 dark:border-white/10 px-6 py-5">
            {allApproved ? (
              <button
                onClick={completionCanvas.download}
                disabled={completionCanvas.status !== 'ready'}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FileText className="w-4 h-4" /> Download Official Certificate
              </button>
            ) : (
              <button
                disabled
                className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-3 text-sm font-semibold text-slate-400 dark:text-slate-500"
              >
                <Lock className="w-4 h-4" /> Unlocks at 100%
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
        Documents are issued by IH Usmani Group. Verify at ihacademy.com/verify
      </p>
    </div>
  )
}
