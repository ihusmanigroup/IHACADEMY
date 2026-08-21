import { useCallback, useEffect, useRef, useState } from 'react'
import {
  UploadCloud, X, GitBranch, ExternalLink, FileText, CheckCircle2, AlertCircle,
  Clock, RefreshCcw, Send, Save, ShieldCheck, Paperclip, AlertTriangle, Award,
  ChevronDown,
} from 'lucide-react'
import { usePortalStore } from '../context/PortalContext'

function formatDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

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
      {type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
      {message}
    </div>
  )
}

const STATUS_META = {
  draft: { label: 'Draft Saved', dot: 'bg-slate-400', cls: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10' },
  submitted: { label: 'Submitted', dot: 'bg-sky-500', cls: 'bg-sky-500/10 text-sky-600 dark:text-cyan-300 border-sky-500/20' },
  under_review: { label: 'Pending Review', dot: 'bg-amber-500 animate-pulse', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20' },
  changes_requested: { label: 'Changes Requested', dot: 'bg-rose-500', cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20' },
  rejected: { label: 'Rejected', dot: 'bg-rose-500', cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20' },
  approved: { label: 'Approved', dot: 'bg-emerald-500', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
}

function StatusBadge({ statusKey }) {
  const meta = STATUS_META[statusKey] || STATUS_META.draft
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${meta.cls}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
    </span>
  )
}

function LinkChip({ href, icon: Icon, children }) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-sky-700 dark:text-cyan-300 transition-all duration-200 hover:border-sky-500/50 hover:text-sky-600 dark:hover:text-cyan-200"
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">{children}</span>
      <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
    </a>
  )
}

const cardBase =
  'rounded-xl border border-slate-200/90 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900'

const inputClass =
  'w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#07090e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-all duration-200 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'

const labelClass = 'mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300'

function OptionalTag() {
  return (
    <span className="ml-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
      Optional
    </span>
  )
}

const MAX_FILES = 3
const MAX_SIZE_MB = 10

/**
 * Winter submission panel. The store now persists to Supabase through the
 * `winter_save_submission` RPC — draft saves and submits are async, and the
 * detail page refreshes the brief after each save.
 */
export default function InternSubmissionPanel({ assignmentId, submission, onSaved }) {
  const { saveDraft, submitAssignment } = usePortalStore()

  const statusKey = submission?.status || null
  const isApproved = statusKey === 'approved'
  const isPending = statusKey === 'submitted' || statusKey === 'under_review'
  const isRevision = statusKey === 'changes_requested' || statusKey === 'rejected'

  const [editing, setEditing] = useState(() => {
    if (!submission) return true
    return statusKey === 'draft' || statusKey === 'changes_requested' || statusKey === 'rejected'
  })
  const [values, setValues] = useState({
    githubUrl: submission?.githubUrl || '',
    liveUrl: submission?.liveUrl || '',
  })
  const [files, setFiles] = useState(submission?.attachmentName ? [{ name: submission.attachmentName, size: 0, existing: true }] : [])
  const [notes, setNotes] = useState(submission?.notes || '')
  const [declared, setDeclared] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [saved, setSaved] = useState(null)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [collapsed, setCollapsed] = useState(true)
  const fileInputRef = useRef(null)

  const showToast = useCallback((msg, type) => {
    setToast({ message: msg, type: type || 'success' })
  }, [])

  useEffect(() => {
    setValues({
      githubUrl: submission?.githubUrl || '',
      liveUrl: submission?.liveUrl || '',
    })
    setFiles(submission?.attachmentName ? [{ name: submission.attachmentName, size: 0, existing: true }] : [])
    setNotes(submission?.notes || '')
    setDeclared(false)
    setError('')
    setSaved(null)
    setJustSubmitted(false)
    const s = submission?.status || null
    setEditing(!submission || s === 'draft' || s === 'changes_requested' || s === 'rejected')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId, submission])

  const setValue = (key, v) => {
    setValues((prev) => ({ ...prev, [key]: v }))
    setError('')
  }

  const pickFiles = (list) => {
    const picked = Array.from(list || [])
    if (picked.length === 0) return
    const remaining = MAX_FILES - files.length
    if (picked.length > remaining) {
      setError(`You can attach up to ${MAX_FILES} file${MAX_FILES > 1 ? 's' : ''}.`)
      return
    }
    const next = []
    for (const f of picked) {
      const isPdf = /\.pdf$/i.test(f.name)
      if (!isPdf) {
        setError(`Unsupported file type "${f.name}". Only .pdf attachments are accepted.`)
        return
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`"${f.name}" exceeds the ${MAX_SIZE_MB} MB limit.`)
        return
      }
      next.push(f)
    }
    setFiles((prev) => [...prev, ...next])
    setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    pickFiles(e.dataTransfer?.files)
  }

  const withTimeout = (promise) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out. Please try again.')), 20000)
      ),
    ])

  const validate = () => {
    const hasGithub = Boolean(values.githubUrl && values.githubUrl.trim())
    const hasDemo = Boolean(values.liveUrl && values.liveUrl.trim())
    const hasNotes = Boolean(notes && notes.trim())
    const hasFile = Boolean(files && files.length > 0)

    if (!hasGithub && !hasDemo && !hasNotes && !hasFile) {
      return 'Please provide at least one item (GitHub URL, Demo link, Notes, or PDF Report).'
    }

    const github = (values.githubUrl || '').trim()
    if (github && !/^https?:\/\//i.test(github)) return 'The GitHub URL must start with http:// or https://'
    const live = (values.liveUrl || '').trim()
    if (live && !/^https?:\/\//i.test(live)) return 'The Live URL must start with http:// or https://'
    if (!declared) return 'Please confirm the declaration before submitting.'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const result = await withTimeout(submitAssignment(assignmentId, {
        ...values,
        files,
        notes,
        attachmentUrl: submission?.attachmentUrl || null,
        attachmentName: submission?.attachmentName || null,
      }))
      if (result && result.success === false) {
        setError(result.message || 'Submission could not be saved.')
        showToast(result.message || 'Submission could not be saved.', 'error')
        return
      }
      setDeclared(false)
      setSaved({ id: assignmentId, at: new Date(), submitted: true })
      setJustSubmitted(true)
      showToast(isRevision ? 'Solution resubmitted for review!' : 'Assignment submitted for review!', 'success')
      onSaved?.()
    } catch (err) {
      setError(err?.message || 'Submission could not be saved.')
      showToast(err?.message || 'Submission could not be saved.', 'error')
    } finally {
      // CRITICAL: always clear the spinner, on success or failure.
      setSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    setError('')
    try {
      await withTimeout(saveDraft(assignmentId, {
        ...values,
        files,
        notes,
        attachmentUrl: submission?.attachmentUrl || null,
        attachmentName: submission?.attachmentName || null,
      }))
      setSaved({ id: assignmentId, at: new Date(), submitted: false })
      onSaved?.()
    } catch (err) {
      setError(err?.message || 'Draft could not be saved.')
      showToast(err?.message || 'Draft could not be saved.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const submittedLabel = submission?.submittedAt ? formatDate(submission.submittedAt) : 'Not Submitted'

  const links = (
    <div className="flex flex-wrap items-center gap-1.5">
      <LinkChip href={submission?.githubUrl} icon={GitBranch}>GitHub Repository</LinkChip>
      <LinkChip href={submission?.liveUrl} icon={ExternalLink}>Live Demo</LinkChip>
      {submission?.attachmentUrl && (
        <LinkChip href={submission.attachmentUrl} icon={Paperclip}>PDF Report</LinkChip>
      )}
      {(files.length > 0) && (
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
          <Paperclip className="w-3.5 h-3.5 shrink-0 text-sky-600 dark:text-cyan-400" />
          <span className="truncate">{files[0].name}</span>
        </span>
      )}
    </div>
  )

  const reviewMeta = (
    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-2.5 py-1 font-semibold">
        <Clock className="w-3 h-3" /> Submitted {submittedLabel}
      </span>
      {submission?.attemptNumber && (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-2.5 py-1 font-semibold">
          Attempt #{submission.attemptNumber}
        </span>
      )}
    </div>
  )

  return (
    <>
      <div className={`${cardBase} p-5 space-y-4`}>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          className="group flex items-center gap-2 focus:outline-none"
        >
          <UploadCloud className="w-4 h-4 shrink-0 text-sky-600 dark:text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
            Submit Solution
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:text-sky-500 ${collapsed ? '' : 'rotate-180'}`}
          />
        </button>
        {saved && saved.id === assignmentId && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> {saved.submitted ? 'Submitted' : 'Draft saved'} {formatDate(saved.at.toISOString())}
          </span>
        )}
      </div>

      {collapsed && (
        <p className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-[11px] font-medium text-slate-500">
          {statusKey
            ? `Status: ${STATUS_META[statusKey]?.label || statusKey} — click the arrow to view your submission links.`
            : 'No submission yet — click the arrow to add your GitHub link, live demo and PDF report.'}
        </p>
      )}

      {!collapsed && (
        <>
          {error && (
            <p className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-px" /> {error}
            </p>
          )}

          {isApproved ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge statusKey="approved" />
                  {submission?.score != null && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Award className="w-3.5 h-3.5" /> Score: {submission.score} / 100
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  Your submission was reviewed and approved by the IH Academy team.
                </p>
              </div>

              {submission?.feedback && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-3.5 py-3">
                  <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Mentor Feedback
                  </p>
                  <p className="text-xs leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">{submission.feedback}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Submitted Work</p>
                {links}
              </div>

              {reviewMeta}
              {submission?.reviewedAt && (
                <p className="text-[11px] text-slate-500">
                  Completed {formatDate(submission.reviewedAt)}
                </p>
              )}
            </div>
          ) : isPending && !editing ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge statusKey="under_review" />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  Your submission is with the IH Academy review team. You'll see the decision here once it's reviewed.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Submitted Work</p>
                {links}
              </div>

              {reviewMeta}

              <button
                type="button"
                onClick={() => { setEditing(true); setError('') }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-all duration-200 hover:border-sky-500/50 hover:bg-slate-50 dark:hover:bg-white/[0.06]"
              >
                <RefreshCcw className="w-4 h-4" /> Edit Submission
              </button>
              <p className="text-center text-[11px] text-slate-500">
                Editing moves your submission back to Draft for resubmission.
              </p>
            </div>
          ) : justSubmitted ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Assignment Submitted Successfully!</p>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  Your submission is with the IH Academy review team. This form is now locked to prevent duplicate submissions — check the Submissions tab for updates.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Submitted Work</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {values.githubUrl && <LinkChip href={values.githubUrl} icon={GitBranch}>GitHub Repository</LinkChip>}
                  {values.liveUrl && <LinkChip href={values.liveUrl} icon={ExternalLink}>Live Demo</LinkChip>}
                  {files.length > 0 && (
                    <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <Paperclip className="w-3.5 h-3.5 shrink-0 text-sky-600 dark:text-cyan-400" />
                      <span className="truncate">{files[0].name}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRevision && submission?.feedback && (
                <div className="rounded-xl border border-rose-500/25 bg-rose-500/[0.07] px-3.5 py-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5" /> {statusKey === 'rejected' ? 'Submission Rejected' : 'Changes Requested'}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">{submission.feedback}</p>
                </div>
              )}

              {submission?.submittedAt && (
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-2.5 py-1 font-semibold">
                    <Clock className="w-3 h-3" /> Submitted {submittedLabel}
                  </span>
                  {submission.attemptNumber && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-2.5 py-1 font-semibold">
                      Attempt #{submission.attemptNumber}
                    </span>
                  )}
                </div>
              )}

              <div>
                <label className={labelClass}>
                  <GitBranch className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                  GitHub Repository URL <OptionalTag />
                </label>
                <input
                  type="url"
                  value={values.githubUrl || ''}
                  onChange={(e) => setValue('githubUrl', e.target.value)}
                  placeholder="https://github.com/your-username/task-repo"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-slate-500">Public repository containing your full solution.</p>
              </div>

              <div>
                <label className={labelClass}>
                  <ExternalLink className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                  Live Demo / Deployed Link <OptionalTag />
                </label>
                <input
                  type="url"
                  value={values.liveUrl || ''}
                  onChange={(e) => setValue('liveUrl', e.target.value)}
                  placeholder="https://your-app.vercel.app"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-slate-500">Where the app is running, if you deployed it.</p>
              </div>

              <div>
                <label className={labelClass}>
                  <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                  Submission Notes / Comments <OptionalTag />
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => { setNotes(e.target.value); setError('') }}
                  placeholder="What did you build, what went well, anything the reviewer should know?"
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <Paperclip className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                  PDF Evidence Report <OptionalTag />
                </label>
                {files.length > 0 && (
                  <div className="mb-2 space-y-2">
                    {files.map((f, i) => (
                      <div key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-xl border border-sky-500/30 bg-sky-500/[0.06] px-3.5 py-2.5">
                        <FileText className="w-4 h-4 shrink-0 text-sky-600 dark:text-cyan-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{f.name}</p>
                          <p className="text-xs text-slate-500">{formatFileSize(f.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                          aria-label="Remove file"
                          className="shrink-0 rounded-lg border border-slate-200 dark:border-slate-700/80 p-1.5 text-slate-500 transition-all duration-200 hover:border-rose-500/50 hover:text-rose-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {files.length < MAX_FILES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-all duration-200 ${
                      dragOver
                        ? 'border-sky-500 bg-sky-500/10'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-white/[0.02] hover:border-sky-500/50'
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10">
                      <UploadCloud className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Drag &amp; drop your PDF report here, or <span className="text-sky-600 dark:text-cyan-400 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Evidence report (.pdf) · max {MAX_SIZE_MB} MB each · up to {MAX_FILES}
                    </p>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple={MAX_FILES > 1}
                  className="hidden"
                  onChange={(e) => {
                    pickFiles(e.target.files)
                    e.target.value = ''
                  }}
                />
              </div>

              <label className="flex cursor-pointer select-none items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={declared}
                  onChange={(e) => { setDeclared(e.target.checked); setError('') }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950/80 accent-sky-500 focus:ring-sky-500/50"
                />
                <span className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  I confirm this is my own work, follows the integrity rules, and I grant IH Academy permission to review and verify it.
                </span>
              </label>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.07] disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Draft'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/10 transition-all duration-200 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Submitting…' : isRevision ? 'Resubmit Solution' : 'Submit Solution'}
                </button>
              </div>
            </form>
          )}
        </>
      )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
