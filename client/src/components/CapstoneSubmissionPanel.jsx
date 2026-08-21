import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, Award, CheckCircle2, Clock3, ExternalLink, FolderGit2, Globe,
  Link2, Loader2, Lock, MessageSquareText, RefreshCw, Rocket, Send, User2,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// ---------------------------------------------------------------------------
// CapstoneSubmissionPanel — DB-backed capstone / assignment submission.
//
// Reads the student's own rows from public.capstone_submissions (RLS scoped
// to auth.uid()) and renders a status card for the latest submission for this
// course:
//   pending  → amber  "Submission Under Review"
//   approved → green  "Verified / Passed"  (+ score & feedback)
//   rejected → red    "Needs Revision"     (+ feedback & a "Resubmit
//              Assignment" button that reopens the form for another try)
//
// Every submit/resubmit inserts a fresh row with status 'pending'.
// ---------------------------------------------------------------------------

const STATUS_META = {
  pending: {
    label: 'Submission Under Review',
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

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function safeUrl(u) {
  if (!u) return null
  return /^https?:\/\//i.test(u) ? u : `https://${u}`
}

function StatusCard({ sub, meta, onResubmit }) {
  const StatusIcon = meta.icon
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 ${
        meta.chip
      }`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${meta.bar || 'from-slate-500 to-slate-400'}`}
      />
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
            <p className="mt-0.5 text-xs text-slate-500">
              Submitted {formatDate(sub.submitted_at)} · {sub.student_name || 'You'}
            </p>
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

      {(sub.feedback || (sub.github_url || sub.live_demo_url)) && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
          {sub.feedback && (
            <div className="flex-1 rounded-xl border border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-white/[0.04] px-4 py-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                <MessageSquareText className="w-3.5 h-3.5" />
                {sub.status === 'rejected' ? 'Admin / AI Feedback' : 'Reviewer Feedback'}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{sub.feedback}</p>
            </div>
          )}
          <div className="flex shrink-0 flex-col gap-2">
            {safeUrl(sub.github_url) && (
              <a
                href={safeUrl(sub.github_url)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-500/40 hover:text-sky-700 dark:border-slate-800 dark:bg-white/[0.04] dark:text-slate-300"
              >
                <FolderGit2 className="w-3.5 h-3.5" /> Repository <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {safeUrl(sub.live_demo_url) && (
              <a
                href={safeUrl(sub.live_demo_url)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-500/40 hover:text-sky-700 dark:border-slate-800 dark:bg-white/[0.04] dark:text-slate-300"
              >
                <Globe className="w-3.5 h-3.5" /> Live Demo <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
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

export default function CapstoneSubmissionPanel({ course, quizPassed, onQuiz, capstoneState, updateCapstone }) {
  const { user, profile } = useAuth()
  const capstones = useMemo(() => course.capstones || [], [course?.capstones])
  const capstoneTitles = useMemo(() => new Set(capstones.map((c) => c.title)), [capstones])

  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const [studentName, setStudentName] = useState('')
  const [selectedId, setSelectedId] = useState(capstoneState?.capstoneId || '')
  const [repoUrl, setRepoUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')

  const defaultName = profile?.full_name || user?.user_metadata?.full_name || ''

  const loadSubmissions = useCallback(async () => {
    if (!user) {
      setSubmissions([])
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError('')
    const { data, error } = await supabase
      .from('capstone_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
    if (error) setLoadError(error.message)
    else setSubmissions(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])

  const latestForCourse = useMemo(() => {
    if (!capstoneTitles.size) return null
    return submissions.find((s) => capstoneTitles.has(s.assignment_title)) || null
  }, [submissions, capstoneTitles])

  const latestStatus = latestForCourse?.status || null
  const meta = STATUS_META[latestStatus]

  const fillForm = (sub) => {
    setStudentName(sub.student_name || defaultName)
    const cap = capstones.find((c) => c.title === sub.assignment_title)
    setSelectedId(cap?.id || '')
    setRepoUrl(sub.github_url || '')
    setDemoUrl(sub.live_demo_url || '')
  }

  const openForm = () => {
    setFormError('')
    if (latestForCourse) fillForm(latestForCourse)
    else {
      setStudentName((prev) => prev || defaultName)
      setSelectedId((prev) => prev || '')
    }
    setFormOpen(true)
  }

  const showForm = quizPassed && (!latestForCourse || formOpen)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const cap = capstones.find((c) => c.id === selectedId)
    if (!cap) { setFormError('Please choose a capstone project.'); return }
    if (!studentName.trim()) { setFormError('Please enter your name.'); return }
    if (!repoUrl.trim()) { setFormError('Please provide the GitHub repository URL.'); return }
    if (!user) { setFormError('You must be signed in to submit.'); return }

    setSubmitting(true)
    setFormError('')
    const { error } = await supabase.from('capstone_submissions').insert({
      user_id: user.id,
      student_name: studentName.trim(),
      assignment_title: cap.title,
      github_url: repoUrl.trim(),
      live_demo_url: demoUrl.trim() || null,
      status: 'pending',
    })
    setSubmitting(false)
    if (error) { setFormError(error.message); return }

    updateCapstone?.({
      capstoneId: cap.id,
      capstoneTitle: cap.title,
      repoUrl: repoUrl.trim(),
      demoUrl: demoUrl.trim(),
      submittedAt: new Date().toISOString(),
    })
    setFormOpen(false)
    await loadSubmissions()
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500 animate-fade-in">
        <Loader2 className="w-7 h-7 animate-spin text-sky-500" />
        <p className="text-sm">Loading your submissions…</p>
      </div>
    )
  }

  if (!quizPassed) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/5 p-10 text-center animate-fade-in">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
          <Lock className="w-6 h-6 text-amber-500 dark:text-amber-400" />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">Capstone submission locked</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          Pass the Grand Quiz with at least 80% to unlock the Capstone Projects and submit your work for review.
        </p>
        <button
          onClick={onQuiz}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-500/20 transition-all duration-200 hover:bg-sky-600 cursor-pointer"
        >
          <Rocket className="w-4 h-4" /> Go to Grand Quiz
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {loadError && !latestForCourse && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
          Couldn't load your submissions: {loadError}
        </div>
      )}

      {latestForCourse && <StatusCard sub={latestForCourse} meta={meta} onResubmit={openForm} />}

      {showForm && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0f1420]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-cyan-400">
            <Link2 className="w-4 h-4" />
            {latestStatus === 'rejected' ? 'Resubmit Your Capstone' : 'Capstone Submission Form'}
          </div>
          {latestStatus === 'rejected' && (
            <p className="mt-2 rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Improve your project based on the feedback above, then resubmit. A new submission goes back under review.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                Student Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User2 className="pointer-events-none absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Your full name as it should appear on the certificate"
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/70 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                Assignment / Track <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-100/70 px-4 py-2.5 text-sm text-slate-800 focus:border-sky-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Choose one of the {capstones.length} assignments above</option>
                {capstones.map((cap, idx) => (
                  <option key={cap.id} value={cap.id}>
                    Capstone {idx + 1}: {cap.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                  GitHub Repository URL <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FolderGit2 className="pointer-events-none absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/yourusername/capstone"
                    className="w-full rounded-xl border border-slate-200 bg-slate-100/70 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                  Live Demo / Walkthrough URL <span className="text-slate-400">(Optional)</span>
                </label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://demo.example.com or https://youtu.be/…"
                    className="w-full rounded-xl border border-slate-200 bg-slate-100/70 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600"
                  />
                </div>
              </div>
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
                  <Send className="w-4 h-4" /> Submit Capstone for Review &amp; Claim Certificate
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
