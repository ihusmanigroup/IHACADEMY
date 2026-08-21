import { useEffect, useRef, useState } from 'react'
import { UploadCloud, X, GitBranch, ExternalLink, Clock, CheckCircle2, AlertCircle, FileText, Download } from 'lucide-react'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function isPdfFile(file) {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
}

/**
 * Submit (or view) a task solution.
 * - Form mode renders fields based on `assignment.submissionType`:
 *   'links' -> GitHub + Live URL inputs (default)
 *   'pdf'   -> drag-and-drop PDF upload zone (restricted to .pdf)
 *   'both'  -> URL inputs + PDF upload zone
 * - readOnly mode shows the submitted links and/or PDF attachment.
 */
export default function InternSubmissionModal({
  assignment,
  initial = null,
  submission = null,
  readOnly = false,
  onClose,
  onSubmit,
}) {
  const submissionType = assignment.submissionType || 'links'
  const needsLinks = submissionType === 'links' || submissionType === 'both'
  const needsPdf = submissionType === 'pdf' || submissionType === 'both'

  const [githubLink, setGithubLink] = useState(initial?.githubLink || '')
  const [liveLink, setLiveLink] = useState(initial?.liveLink || '')
  const [pdfFile, setPdfFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const pickFile = (file) => {
    if (!file) return
    if (!isPdfFile(file)) {
      setError('Only PDF files are accepted. Please upload a .pdf document.')
      return
    }
    setPdfFile(file)
    setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    pickFile(e.dataTransfer?.files?.[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const repo = githubLink.trim()
    if (needsLinks && !repo) {
      setError('Please paste your GitHub repository link.')
      return
    }
    if (needsLinks && !/^https?:\/\//i.test(repo)) {
      setError('The GitHub link must start with http:// or https://')
      return
    }
    if (needsLinks && liveLink.trim() && !/^https?:\/\//i.test(liveLink.trim())) {
      setError('The live link must start with http:// or https://')
      return
    }
    if (needsPdf && !pdfFile) {
      setError('Please attach your completion certificate or proof as a PDF.')
      return
    }
    onSubmit({ githubLink: repo, liveLink: liveLink.trim(), pdfFile })
  }

  const inputClass =
    'w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-950 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 dark:focus:ring-cyan-400/40 focus:border-sky-400 dark:focus:border-cyan-400/50 transition'

  const linkChipClass =
    'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:border-sky-400 dark:hover:border-cyan-400/50 hover:text-sky-600 dark:hover:text-cyan-300'

  const data = submission || initial || null

  const labelClass =
    'mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300'

  const linkBlock = (readOnlyMode) => (
    <>
      <div>
        <label className={labelClass}>
          <GitBranch className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400" />
          GitHub Repository Link{' '}
          {!readOnlyMode && needsLinks && <span className="text-rose-500">*</span>}
        </label>
        {readOnlyMode ? (
          <a
            href={data?.githubLink || '#'}
            target="_blank"
            rel="noreferrer"
            className="block truncate rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/70 px-3.5 py-2.5 text-sm text-sky-600 dark:text-cyan-300 hover:underline"
          >
            {data?.githubLink || 'No repository link'}
          </a>
        ) : (
          <input
            type="url"
            value={githubLink}
            onChange={(e) => { setGithubLink(e.target.value); setError('') }}
            placeholder="https://github.com/your-username/task-repo"
            autoFocus
            className={inputClass}
          />
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
          The public repo containing your solution for this task.
        </p>
      </div>

      <div>
        <label className={labelClass}>
          <ExternalLink className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400" />
          Deployed Live Link <span className="text-slate-500">(optional)</span>
        </label>
        {readOnlyMode ? (
          data?.liveLink ? (
            <a
              href={data.liveLink}
              target="_blank"
              rel="noreferrer"
              className="block truncate rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/70 px-3.5 py-2.5 text-sm text-sky-600 dark:text-cyan-300 hover:underline"
            >
              {data.liveLink}
            </a>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 dark:border-white/10 px-3.5 py-2.5 text-sm text-slate-500 dark:text-slate-500">
              No live link provided
            </p>
          )
        ) : (
          <input
            type="url"
            value={liveLink}
            onChange={(e) => { setLiveLink(e.target.value); setError('') }}
            placeholder="https://your-app.vercel.app"
            className={inputClass}
          />
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
          Required for frontend / full-stack tasks — leave empty if not deployed.
        </p>
      </div>
    </>
  )

  const pdfBlock = (readOnlyMode) => {
    if (readOnlyMode) {
      return data?.pdfFileName ? (
        <div>
          <p className={labelClass}>
            <FileText className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400" />
            PDF Attachment
          </p>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/70 px-3.5 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
              <FileText className="w-5 h-5 text-rose-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                {data.pdfFileName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {formatFileSize(data.pdfFileSize) || 'PDF document'}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Download className="w-3.5 h-3.5" /> PDF
            </span>
          </div>
        </div>
      ) : (
        <div>
          <p className={labelClass}>
            <FileText className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400" />
            PDF Attachment
          </p>
          <p className="rounded-xl border border-dashed border-slate-300 dark:border-white/10 px-3.5 py-2.5 text-sm text-slate-500 dark:text-slate-500">
            No PDF attached
          </p>
        </div>
      )
    }

    return (
      <div>
        <label className={labelClass}>
          <FileText className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400" />
          Completion Certificate / Proof (PDF) <span className="text-rose-500">*</span>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = '' }}
        />
        {pdfFile ? (
          <div className="flex items-center gap-3 rounded-xl border border-sky-400/50 dark:border-cyan-400/50 bg-sky-50 dark:bg-cyan-400/[0.06] px-3.5 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
              <FileText className="w-5 h-5 text-rose-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                {pdfFile.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {formatFileSize(pdfFile.size)} · PDF ready to submit
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPdfFile(null)}
              aria-label="Remove file"
              className="shrink-0 rounded-lg border border-slate-200 dark:border-white/10 p-1.5 text-slate-500 dark:text-slate-500 transition hover:border-rose-400/50 hover:text-rose-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
              dragOver
                ? 'border-sky-500 bg-sky-500/10 dark:border-cyan-400 dark:bg-cyan-400/10'
                : 'border-slate-300 dark:border-white/15 bg-slate-50 hover:border-sky-400 dark:bg-white/[0.03] dark:hover:border-cyan-400/50'
            }`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 dark:bg-cyan-400/10">
              <UploadCloud className="w-5 h-5 text-sky-500 dark:text-cyan-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Drag &amp; drop your PDF here, or{' '}
              <span className="text-sky-600 dark:text-cyan-400 underline">browse files</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Merged completion certificates or proof · .pdf only · max 10 MB
            </p>
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0F17] shadow-2xl shadow-sky-500/5 dark:shadow-cyan-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-white/10 px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sky-600 dark:text-cyan-400 mb-1">
              {readOnly ? (
                <GitBranch className="w-4 h-4 shrink-0" />
              ) : (
                <UploadCloud className="w-4 h-4 shrink-0" />
              )}
              <span className="text-xs font-bold uppercase tracking-widest">
                {readOnly ? 'Submission Details' : 'Submit Solution'}
              </span>
            </div>
            <h3 className="font-bold text-slate-950 dark:text-white leading-snug">{assignment.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">Due {assignment.due}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg border border-slate-200 dark:border-white/10 p-2 text-slate-500 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {readOnly ? (
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {data?.status === 'approved' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400 ring-1 ring-inset ring-emerald-500/25">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved &amp; Verified
                  {data.score && (
                    <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-emerald-300">{data.score}</span>
                  )}
                </span>
              ) : data?.status === 'revision-requested' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-400 ring-1 ring-inset ring-rose-500/25">
                  <AlertCircle className="w-3.5 h-3.5" /> Revision Requested
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-400 ring-1 ring-inset ring-amber-500/25 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Pending Admin Review
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-500">
                <Clock className="w-3 h-3" /> Submitted {data ? formatDate(data.submittedAt) : '—'}
              </span>
            </div>

            {needsLinks && linkBlock(true)}
            {needsPdf && pdfBlock(true)}

            <p
              className={`rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed ${
                data?.status === 'approved'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/5 dark:text-emerald-300'
                  : data?.status === 'revision-requested'
                    ? 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-400/20 dark:bg-rose-400/5 dark:text-rose-300'
                    : 'border-sky-200 bg-sky-50 text-sky-900 dark:border-cyan-400/20 dark:bg-cyan-400/5 dark:text-cyan-300'
              }`}
            >
              {data?.status === 'approved'
                ? 'This task has been reviewed and approved by the admin. Your week progress is updated automatically.'
                : data?.status === 'revision-requested'
                  ? 'This task needs revision. Review the admin feedback and resubmit your solution to return it to the review queue.'
                  : 'Your solution is in the review queue. Once the admin approves it, this task will be marked Approved & Verified and the next week unlocks.'}
            </p>

            {data?.feedback && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  Admin Feedback
                </p>
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-900 dark:border-rose-400/20 dark:bg-rose-400/5 dark:text-rose-300">
                  {data.feedback}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              {data?.githubLink && (
                <a href={data.githubLink} target="_blank" rel="noreferrer" className={linkChipClass}>
                  <GitBranch className="w-3.5 h-3.5" /> Open Repo
                </a>
              )}
              {data?.liveLink && (
                <a href={data.liveLink} target="_blank" rel="noreferrer" className={linkChipClass}>
                  <ExternalLink className="w-3.5 h-3.5" /> Open Live
                </a>
              )}
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-white/10 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {needsLinks && linkBlock(false)}
            {needsPdf && pdfBlock(false)}

            {error && (
              <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-500">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 dark:bg-blue-600 dark:hover:bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 dark:shadow-blue-600/40 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Submit for Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
