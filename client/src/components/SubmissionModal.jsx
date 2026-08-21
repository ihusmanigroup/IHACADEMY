import { useState, useEffect, useCallback } from 'react'
import { X, CheckCircle, Loader2, GitBranch, FileText, AlertTriangle } from 'lucide-react'

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 3500)
    return () => clearTimeout(id)
  }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all animate-[fadeIn_0.2s_ease-out] ${
      type === 'success'
        ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
        : 'bg-red-950/90 border-red-500/30 text-red-300'
    }`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
      {message}
    </div>
  )
}

export default function SubmissionModal({
  assignment,
  submission,
  onClose,
  onSubmit,
  onSaveDraft,
}) {
  const [githubUrl, setGithubUrl] = useState(submission?.githubUrl || '')
  const [liveUrl, setLiveUrl] = useState(submission?.liveUrl || '')
  const [notes, setNotes] = useState(submission?.notes || '')
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, type) => {
    setToast({ message: msg, type: type || 'success' })
  }, [])

  const handleSaveDraft = async () => {
    if (!githubUrl.trim() && !liveUrl.trim() && !notes.trim()) {
      showToast('Add at least a GitHub URL, live demo URL, or notes to save a draft.', 'error')
      return
    }
    setSaving(true)
    try {
      const result = await onSaveDraft({
        githubUrl: githubUrl.trim() || null,
        liveUrl: liveUrl.trim() || null,
        notes: notes.trim() || null,
      })
      if (result.success) {
        showToast('Draft saved successfully!', 'success')
      } else {
        showToast(result.message || 'Failed to save draft', 'error')
      }
    } catch (_) {
      showToast('Failed to save draft', 'error')
    }
    setSaving(false)
  }

  const handleSubmit = async () => {
    if (!githubUrl.trim() && !liveUrl.trim()) {
      showToast('Please provide at least a GitHub repository URL or live demo URL.', 'error')
      return
    }
    setSubmitting(true)
    try {
      const result = await onSubmit({
        githubUrl: githubUrl.trim() || null,
        liveUrl: liveUrl.trim() || null,
        notes: notes.trim() || null,
      })
      if (result.success) {
        showToast('Assignment submitted for review!', 'success')
        setTimeout(() => onClose(), 1200)
      } else {
        showToast(result.message || 'Failed to submit assignment', 'error')
      }
    } catch (_) {
      showToast('Failed to submit assignment', 'error')
    }
    setSubmitting(false)
  }

  const hasSubmission = submission && submission.status !== 'draft'
  const isSubmitted = submission?.status === 'submitted'
  const isApproved = submission?.status === 'approved'
  const isChangesRequested = submission?.status === 'changes_requested'
  const canEdit = !isApproved && !isSubmitted

  if (!canEdit && !hasSubmission) return null

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600 dark:text-cyan-400" /> {assignment.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Week {assignment.week_number} · {assignment.difficulty} · {assignment.hours_label || `${assignment.estimated_hours}h`}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {hasSubmission && (
            <div className="px-6 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset whitespace-nowrap ${{
                  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/25',
                  submitted: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/25',
                  changes_requested: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/25',
                  rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/25',
                }[submission.status] || 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-500 ring-slate-300 dark:ring-white/10'}`}>
                  <span className="h-1.5 w-1.5 rounded-full {{
                    approved: 'bg-emerald-400',
                    submitted: 'bg-amber-400',
                    changes_requested: 'bg-rose-400',
                    rejected: 'bg-rose-400',
                  }[submission.status] || 'bg-slate-400'}" /> {submission.status.charAt(0).toUpperCase() + submission.status.slice(1).replace('_', ' ')}
                </span>
                {submission.submittedAt && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Submitted {new Date(submission.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
                {submission.feedback && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 flex-1 text-right">Mentor feedback available</span>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {hasSubmission && submission.feedback && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-500/10 p-4">
                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Mentor Feedback
                </h4>
                <p className="mt-2 text-sm text-amber-700 dark:text-amber-300 whitespace-pre-wrap">{submission.feedback}</p>
              </div>
            )}

            {assignment.question && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Assignment Brief</h4>
                <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                  {assignment.question.split('\n').map((para, i) => (
                    <p key={i} className="mb-3 last:mb-0">{para}</p>
                  ))}
                </div>
              </div>
            )}

            {(assignment.requirements?.length || assignment.deliverables?.length) && (
              <div className="grid gap-4 md:grid-cols-2">
                {assignment.requirements?.length && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-white/5 p-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-sky-600 dark:text-cyan-400" /> Requirements
                    </h4>
                    <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                      {assignment.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-sky-600 dark:text-cyan-400 mt-0.5">→</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {assignment.deliverables?.length && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-white/5 p-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Deliverables
                    </h4>
                    <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                      {assignment.deliverables.map((del, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">→</span>
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {canEdit && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {hasSubmission ? 'Update Submission' : 'Submit Assignment'}
                </h4>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">GitHub Repository URL *</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/yourusername/repo"
                    className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-sky-600 dark:focus:border-cyan-400 transition-colors"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">Live Demo URL</label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://your-project.vercel.app"
                    className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-sky-600 dark:focus:border-cyan-400 transition-colors"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Any notes for the reviewer... (optional)"
                    className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-sky-600 dark:focus:border-cyan-400 transition-colors resize-none"
                    disabled={!canEdit}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  {hasSubmission && isChangesRequested && (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      {submitting ? 'Resubmitting...' : 'Resubmit Changes'}
                    </button>
                  )}
                  {!hasSubmission || isChangesRequested ? (
                    <>
                      <button
                        onClick={handleSaveDraft}
                        disabled={saving || !githubUrl.trim() && !liveUrl.trim() && !notes.trim()}
                        className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : ''} Save Draft
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting || !githubUrl.trim() && !liveUrl.trim()}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        {submitting ? 'Submitting...' : hasSubmission ? 'Resubmit' : 'Submit Assignment'}
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400">Submitted — awaiting review</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}