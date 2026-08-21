import { useNavigate } from 'react-router-dom'
import { Hourglass, XCircle, RotateCcw, ArrowRight, FileQuestion } from 'lucide-react'

/**
 * Applicant gatekeeper for the Intern Portal. Rendered in place of the portal
 * content while an application has not been approved:
 *   - pending  → "Application Under Review" (blocks week materials)
 *   - rejected → "Not Selected" with a direct "Re-apply for Cohort" action
 * Approved applicants are never gated and see the normal portal.
 */
export default function InternApplicationGate({ status }) {
  const navigate = useNavigate()

  const goReapply = () => navigate('/internship')

  if (status === 'none') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-500/10 ring-1 ring-inset ring-slate-500/25">
          <FileQuestion className="w-8 h-8 text-slate-500" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">No Application Found</h1>
          <p className="mt-1.5 max-w-md text-sm text-slate-500">
            We couldn't find an internship application for this account. Apply for a cohort to unlock
            your Intern Portal.
          </p>
        </div>
        <button
          onClick={goReapply}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition hover:from-sky-400 hover:to-blue-500"
        >
          <ArrowRight className="w-4 h-4" /> Browse Internships
        </button>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-inset ring-rose-500/25">
          <XCircle className="w-8 h-8 text-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Not Selected</h1>
          <p className="mt-1.5 max-w-md text-sm text-slate-500">
            Thank you for your interest in the Winter Internship 2026-27. Your application was not
            selected for this cohort — but you are welcome to re-apply for the next one.
          </p>
        </div>
        <button
          onClick={goReapply}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-teal-400"
        >
          <RotateCcw className="w-4 h-4" /> Re-apply for Cohort
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-inset ring-amber-500/25">
        <Hourglass className="w-8 h-8 text-amber-500" />
      </div>
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Application Under Review</h1>
        <p className="mt-1.5 max-w-md text-sm text-slate-500">
          Your profile is being reviewed by our team. Once approved, all weeks of assignments, required
          courses, and progress tracking will unlock right here.
        </p>
      </div>
      <button
        onClick={() => navigate('/internship')}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-sky-500 hover:text-sky-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:text-sky-400"
      >
        Back to Internships <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
