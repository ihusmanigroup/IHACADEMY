import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle, Award, CheckCircle2, Clock3, Download, ExternalLink, FileText, GitBranch,
  Globe, Loader2, Lock, MessageSquareText, RefreshCw, Send, UploadCloud, X,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// ---------------------------------------------------------------------------
// AssignmentSubmissionPanel — DB-backed assignment / capstone submission for
// the course player (LearnView).
//
// Reads the student's own rows from public.course_assignment_submissions
// (RLS scoped to auth.uid()) and renders a status card for the latest
// submission matching this course + assignment title:
//   pending  → amber  "Submitted (Awaiting Review)"
//   approved → green  "Verified / Passed"  (+ score & admin feedback)
//   rejected → red    "Needs Revision"     (+ admin feedback & a "Resubmit
//              Assignment" button that reopens the form for another try)
//
// Validation is flexible: a submission is valid when AT LEAST ONE of
// github_url / demo_link / notes / pdf_file is provided. When a PDF is
// attached it is uploaded to the public `assignment-docs` Storage bucket
// (path `submissions/<timestamp>_<file>.pdf`) and its public URL is stored as
// file_url. Every submit/resubmit inserts a fresh row with status 'pending'
// so review history is preserved. Storage upload failures surface as a clean
// toast instead of silently failing the form.
// ---------------------------------------------------------------------------

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
  pending: {
    label: 'Submitted (Awaiting Review)',
    hint: 'Your submission has been received and is being reviewed by the IH Academy team. We usually respond within a few days.',
    chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: Clock3,
    iconColor: 'text-amber-500',
    dot: 'bg-amber-500 animate-pulse',
  },
  approved: {
    label: 'Verified / Passed',
    hint: 'Congratulations — your submission has been verified and accepted.',
    chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Needs Revision',
    hint: 'Your submission needs a few changes before it can be approved. Read the feedback below and resubmit when ready.',
    chip: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    icon: AlertTriangle,
    iconColor: 'text-rose-500',
    dot: 'bg-rose-500',
  },
}

const MAX_PDF_BYTES = 10 * 1024 * 1024

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
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

function safeUrl(u) {
  if (!u) return null
  return /^https?:\/\//i.test(u) ? u : `https://${u}`
}

function StatusCard({ sub, meta, onResubmit }) {
  const StatusIcon = meta.icon
  const repoUrl = safeUrl(sub.github_url || sub.submission_link)
  const pdfUrl = sub.file_url || null
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 ${meta.chip}`}>
      <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-slate-500 to-slate-400" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 dark:bg-white/10 ring-1 ring-inset ring-slate-900/5 dark:ring-white/10">
            <StatusIcon className={`w-5 h-5 ${meta.iconColor}`} />
          </span>
          <div>
            <p className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              {meta.label}
              <span aria-hidden className={`h-2 w-2 rounded-full ${meta.dot}`} />
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Submitted {formatDate(sub.submitted_at)}</p>
          </div>
        </div>
        {sub.score != null && (
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Score</p>
            <p className="flex items-center justify-end gap-1.5 text-2xl font-extrabold text-slate-900 dark:text-white">
              <Award className="w-5 h-5 text-emerald-500" />
              {sub.score}
              <span className="text-sm font-semibold text-slate-400">/100</span>
            </p>
          </div>
        )}
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">{sub.assignment_title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{meta.hint}</p>

      {(sub.admin_feedback || repoUrl || sub.demo_link || pdfUrl || sub.notes) && (
        <div className="mt-4 flex flex-col gap-3">
          {sub.admin_feedback && (
            <div className="flex-1 rounded-xl border border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-white/[0.04] px-4 py-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                <MessageSquareText className="w-3.5 h-3.5" />
                {sub.status === 'rejected' ? 'Admin Feedback' : 'Reviewer Feedback'}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{sub.admin_feedback}</p>
            </div>
          )}

          {sub.notes && (
            <div className="flex-1 rounded-xl border border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-white/[0.04] px-4 py-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                <MessageSquareText className="w-3.5 h-3.5" /> Notes for Reviewers
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{sub.notes}</p>
            </div>
          )}

          {(repoUrl || sub.demo_link || pdfUrl) && (
            <div className="flex flex-wrap gap-2">
              {repoUrl && (
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-500/40 hover:text-sky-700 dark:border-slate-800 dark:bg-white/[0.04] dark:text-slate-300"
                >
                  <GitBranch className="w-3.5 h-3.5" /> GitHub <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {safeUrl(sub.demo_link) && (
                <a
                  href={safeUrl(sub.demo_link)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-500/40 hover:text-sky-700 dark:border-slate-800 dark:bg-white/[0.04] dark:text-slate-300"
                >
                  <Globe className="w-3.5 h-3.5" /> Live Demo <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-500/40 hover:text-sky-700 dark:border-slate-800 dark:bg-white/[0.04] dark:text-slate-300"
                >
                  <Download className="w-3.5 h-3.5" /> {sub.file_name || 'Evidence PDF'} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {sub.status === 'rejected' && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={onResubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/10 transition-all duration-200 hover:from-blue-500 hover:to-cyan-400 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Resubmit Assignment
          </button>
          <p className="text-xs text-slate-500">Your resubmission will go back under review.</p>
        </div>
      )}
    </div>
  )
}

export default function AssignmentSubmissionPanel({ courseId, assignmentTitle, courseTitle, topicId }) {
  const { user } = useAuth()

  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, type) => {
    setToast({ message: msg, type: type || 'success' })
  }, [])

  const [githubUrl, setGithubUrl] = useState('')
  const [demoLink, setDemoLink] = useState('')
  const [notes, setNotes] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const loadSubmissions = useCallback(async () => {
    if (!user) {
      setSubmissions([])
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError('')
    // Preferred: scope by course_id (and topic_id when the form is per-topic).
    // If the live table is missing an optional column, fall back to all of the
    // user's rows and let the `latest` lookup below filter by topic/title so
    // submissions still load instead of hard-failing.
    const base = supabase
      .from('course_assignment_submissions')
      .select('*')
      .eq('user_id', user.id)
    let query = base
    if (courseId) query = query.eq('course_id', courseId)
    if (topicId) query = query.eq('topic_id', topicId)
    const { data, error } = await query.order('submitted_at', { ascending: false })
    if (
      error &&
      ((courseId && /course_id/.test(error.message)) ||
        (topicId && /topic_id/.test(error.message)))
    ) {
      const { data: all, error: err2 } = await base.order('submitted_at', { ascending: false })
      if (err2) setLoadError(err2.message)
      else setSubmissions(all || [])
    } else if (error) {
      setLoadError(error.message)
    } else {
      setSubmissions(data || [])
    }
    setLoading(false)
  }, [user, courseId, topicId])

  useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])

  const latest = useMemo(() => {
    // Prefer the exact topic's submission when the form is scoped per-topic.
    if (topicId) {
      const byTopic = submissions.find((s) => s.topic_id === topicId)
      if (byTopic) return byTopic
    }
    if (!assignmentTitle) return submissions[0] || null
    return submissions.find((s) => s.assignment_title === assignmentTitle) || null
  }, [submissions, assignmentTitle, topicId])

  const latestStatus = latest?.status || null
  const meta = STATUS_META[latestStatus]

  const pickPdf = (file) => {
    if (!file) return
    if (!isPdfFile(file)) {
      setFormError('Only PDF files are accepted. Please upload a .pdf document.')
      return
    }
    if (file.size > MAX_PDF_BYTES) {
      setFormError('PDF must be under 10 MB.')
      return
    }
    setPdfFile(file)
    setFormError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    pickPdf(e.dataTransfer?.files?.[0])
  }

  const fillForm = (sub) => {
    setGithubUrl(sub.github_url || sub.submission_link || '')
    setDemoLink(sub.demo_link || '')
    setNotes(sub.notes || '')
    setPdfFile(null)
  }

  const openForm = () => {
    setFormError('')
    if (latest) fillForm(latest)
    setFormOpen(true)
  }

  const showForm = (!latest || formOpen) && !!user

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { setFormError('You must be signed in to submit.'); return }
    if (!assignmentTitle.trim()) { setFormError('Missing assignment title.'); return }

    const hasGithub = githubUrl.trim()
    const hasDemo = demoLink.trim()
    const hasNotes = notes.trim()
    const hasPdf = !!pdfFile

    if (!hasGithub && !hasDemo && !hasNotes && !hasPdf) {
      setFormError('Please fill or attach at least one item to submit')
      return
    }
    if (hasGithub && !/^https?:\/\//i.test(hasGithub)) {
      setFormError('The GitHub link must start with http:// or https://')
      return
    }
    if (hasDemo && !/^https?:\/\//i.test(hasDemo)) {
      setFormError('The live demo link must start with http:// or https://')
      return
    }

    setSubmitting(true)
    setFormError('')

    let fileUrl = null
    let fileName = null
    if (pdfFile) {
      const safeName = pdfFile.name.replace(/[^a-z0-9._-]/gi, '_').slice(0, 80)
      const filePath = `submissions/${Date.now()}_${safeName}`
      const { error: uploadError } = await supabase.storage
        .from('assignment-docs')
        .upload(filePath, pdfFile, { cacheControl: '3600', contentType: 'application/pdf', upsert: false })
      if (uploadError) {
        setSubmitting(false)
        setFormError(`PDF upload failed: ${uploadError.message}`)
        showToast(`PDF upload failed: ${uploadError.message}`, 'error')
        return
      }
      fileUrl = supabase.storage.from('assignment-docs').getPublicUrl(filePath).data.publicUrl
      fileName = pdfFile.name
    }

    const payload = {
      user_id: user.id,
      assignment_title: assignmentTitle.trim(),
      github_url: hasGithub || null,
      demo_link: hasDemo || null,
      notes: hasNotes || null,
      file_url: fileUrl,
      file_name: fileName,
      status: 'pending',
    }
    if (courseId) payload.course_id = courseId
    if (topicId) payload.topic_id = topicId

    let { error } = await supabase.from('course_assignment_submissions').insert(payload)
    // If the live table lacks an optional column (course_id / topic_id), retry
    // without it so the submission still saves instead of throwing a 400.
    if (error) {
      const rest = { ...payload }
      if (courseId && /course_id/.test(error.message)) delete rest.course_id
      if (topicId && /topic_id/.test(error.message)) delete rest.topic_id
      if (Object.keys(rest).length !== Object.keys(payload).length) {
        ;({ error } = await supabase.from('course_assignment_submissions').insert(rest))
      }
    }
    setSubmitting(false)
    if (error) {
      setFormError(error.message)
      showToast(`Couldn't save your submission: ${error.message}`, 'error')
      return
    }

    setFormOpen(false)
    await loadSubmissions()
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-100/70 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600'

  const labelClass = 'block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5'

  if (loading) {
    return (
      <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-slate-500 animate-fade-in">
        <Loader2 className="w-7 h-7 animate-spin text-sky-500" />
        <p className="text-sm">Loading your submissions…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-5 py-4 dark:border-slate-800 dark:bg-white/[0.03] animate-fade-in">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200/80 dark:bg-white/10">
          <Lock className="w-5 h-5 text-slate-500" />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Sign in to submit your assignment</p>
          <p className="text-xs text-slate-500">You need an account so our reviewers can verify your work.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-cyan-400">
        <FileText className="w-4 h-4" />
        Assignment / Capstone Submission{courseTitle ? ` — ${courseTitle}` : ''}
      </div>

      {loadError && !latest && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
          Couldn't load your submissions: {loadError}
        </div>
      )}

      {latest && <StatusCard sub={latest} meta={meta} onResubmit={openForm} />}

      {showForm && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0f1420]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-cyan-400">
            <UploadCloud className="w-4 h-4" />
            {latestStatus === 'rejected' ? 'Resubmit Your Assignment' : 'Submission Form'}
          </div>
          {latestStatus === 'rejected' && (
            <p className="mt-2 rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Improve your work based on the feedback above, then resubmit. A new submission goes back under review.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className={labelClass}>
                GitHub Repository Link <span className="text-slate-400">(Optional)</span>
              </label>
              <div className="relative">
                <GitBranch className="pointer-events-none absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => { setGithubUrl(e.target.value); setFormError('') }}
                  placeholder="https://github.com/yourusername/project"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Live Demo / Walkthrough URL <span className="text-slate-400">(Optional)</span>
                </label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={demoLink}
                    onChange={(e) => { setDemoLink(e.target.value); setFormError('') }}
                    placeholder="https://demo.example.com or https://youtu.be/…"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  Notes for Reviewers <span className="text-slate-400">(Optional)</span>
                </label>
                <div className="relative">
                  <MessageSquareText className="pointer-events-none absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    value={notes}
                    onChange={(e) => { setNotes(e.target.value); setFormError('') }}
                    rows={1}
                    placeholder="How to run it, what you built, anything to check…"
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-100/70 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Evidence PDF <span className="text-slate-400">(Optional — .pdf, max 10 MB)</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => { pickPdf(e.target.files?.[0]); e.target.value = '' }}
              />
              {pdfFile ? (
                <div className="flex items-center gap-3 rounded-xl border border-sky-400/50 dark:border-cyan-400/50 bg-sky-50 dark:bg-cyan-400/[0.06] px-3.5 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
                    <FileText className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{pdfFile.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(pdfFile.size)} · PDF ready to submit</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPdfFile(null)}
                    aria-label="Remove file"
                    className="shrink-0 rounded-lg border border-slate-200 dark:border-white/10 p-1.5 text-slate-500 transition hover:border-rose-400/50 hover:text-rose-500"
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
                    Drag &amp; drop your PDF here, or <span className="text-sky-600 dark:text-cyan-400 underline">browse files</span>
                  </p>
                  <p className="text-xs text-slate-500">Screenshots, certificates or proof · .pdf only · max 10 MB</p>
                </button>
              )}
            </div>

            {formError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/10 transition-all duration-200 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                </>
              ) : latestStatus === 'rejected' ? (
                <>
                  <RefreshCw className="w-4 h-4" /> Resubmit Assignment
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit for Review
                </>
              )}
            </button>
          </form>
        </div>
      )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}