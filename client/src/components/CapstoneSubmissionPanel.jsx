import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle, Award, CheckCircle2, Clock3, ExternalLink, FileText,
  FolderGit2, Globe, Link2, Loader2, Lock, MessageSquareText, RefreshCw, Rocket,
  Send, UploadCloud, User2,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// CapstoneSubmitForm renders the submission UI + status for ONE capstone
// inside a card: GitHub URL, Live Demo URL, Notes textarea, Evidence PDF
// upload (Supabase Storage bucket 'assignment-docs'), and a Submit button.
// On submit it inserts into public.capstone_submissions with
// { user_id, course_id, capstone_id, assignment_title, student_name,
//   github_url, live_demo_url, notes, pdf_url, status: 'pending' } and the
// card flips to a 'Submitted - Under Review' status card.
//
// CapstoneSubmissionPanel (default export) is a convenience wrapper that
// renders one full card per capstone (brief + requirements + the form).

const STATUS_META = {
  pending: {
    label: 'Submitted — Under Review',
    hint: 'Your capstone has been received and is being reviewed by the IH Academy team. We usually respond within a few days.',
    chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: Clock3,
    iconColor: 'text-amber-500',
    dot: 'bg-amber-500 animate-pulse',
  },
  approved: {
    label: 'Verified / Passed',
    hint: 'Congratulations - your capstone has been verified and accepted.',
    chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Needs Revision',
    hint: 'Your capstone needs a few changes before it can be approved. Read the feedback below and resubmit when ready.',
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

function safeUrl(u) {
  if (!u) return null
  if (u.startsWith('http://') || u.startsWith('https://')) return u
  return 'https://' + u
}

function isPdfFile(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

function StatusCard({ sub, meta, onResubmit }) {
  const StatusIcon = meta.icon
  const pdfUrl = sub.pdf_url || sub.file_url || null
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 ${meta.chip}`}>
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${meta.bar || 'from-slate-500 to-slate-400'}`} />
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <span className='flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 dark:bg-white/10 ring-1 ring-inset ring-slate-900/5 dark:ring-white/10'>
            <StatusIcon className={`w-5 h-5 ${meta.iconColor}`} />
          </span>
          <div>
            <p className='flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white'>
              {meta.label}
              <span aria-hidden className={`h-2 w-2 rounded-full ${meta.dot}`} />
            </p>
            <p className='mt-0.5 text-[11px] text-slate-500'>Submitted {formatDate(sub.submitted_at)} · {sub.student_name || 'You'}</p>
          </div>
        </div>
        {sub.score != null && (
          <div className='text-right'>
            <p className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>Score</p>
            <p className='flex items-center justify-end gap-1.5 text-xl font-extrabold text-slate-900 dark:text-white'>
              <Award className='w-4 h-4 text-emerald-500' /> {sub.score}<span className='text-xs font-semibold text-slate-400'>/100</span>
            </p>
          </div>
        )}
      </div>

      <h3 className='mt-3 text-sm font-bold text-slate-900 dark:text-white'>{sub.assignment_title}</h3>
      <p className='mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300'>{meta.hint}</p>

      {(sub.feedback || sub.github_url || sub.live_demo_url || pdfUrl || sub.notes) && (
        <div className='mt-3 flex flex-col gap-2.5'>
          {sub.feedback && (
            <div className='rounded-xl border border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-white/[0.04] px-3 py-2.5'>
              <p className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500'>
                <MessageSquareText className='w-3.5 h-3.5' /> {sub.status === 'rejected' ? 'Admin / AI Feedback' : 'Reviewer Feedback'}
              </p>
              <p className='mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-200'>{sub.feedback}</p>
            </div>
          )}
          <div className='flex flex-wrap gap-2'>
            {safeUrl(sub.github_url) && (
              <a href={safeUrl(sub.github_url)} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-500/40 hover:text-sky-700 dark:border-slate-800 dark:bg-white/[0.04] dark:text-slate-300'>
                <FolderGit2 className='w-3.5 h-3.5' /> Repository <ExternalLink className='w-3 h-3' />
              </a>
            )}
            {safeUrl(sub.live_demo_url) && (
              <a href={safeUrl(sub.live_demo_url)} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-500/40 hover:text-sky-700 dark:border-slate-800 dark:bg-white/[0.04] dark:text-slate-300'>
                <Globe className='w-3.5 h-3.5' /> Live Demo <ExternalLink className='w-3 h-3' />
              </a>
            )}
            {pdfUrl && (
              <a href={safeUrl(pdfUrl)} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-500/40 hover:text-sky-700 dark:border-slate-800 dark:bg-white/[0.04] dark:text-slate-300'>
                <FileText className='w-3.5 h-3.5' /> Evidence PDF <ExternalLink className='w-3 h-3' />
              </a>
            )}
          </div>
          {sub.notes && (
            <div className='rounded-xl border border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-white/[0.04] px-3 py-2.5'>
              <p className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500'>
                <MessageSquareText className='w-3.5 h-3.5' /> Notes / Architecture Summary
              </p>
              <p className='mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-700 dark:text-slate-200'>{sub.notes}</p>
            </div>
          )}
        </div>
      )}

      {sub.status === 'rejected' && (
        <div className='mt-4 flex flex-wrap items-center gap-3'>
          <button onClick={onResubmit} className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-cyan-500/10 transition-all hover:from-blue-500 hover:to-cyan-400 cursor-pointer'>
            <RefreshCw className='w-4 h-4' /> Resubmit Capstone
          </button>
          <p className='text-xs text-slate-500'>Your resubmission will go back under review.</p>
        </div>
      )}
    </div>
  )
}

export function CapstoneSubmitForm({ cap, courseId, quizPassed, onQuiz, updateCapstone }) {
  const { user, profile } = useAuth()
  const defaultName = profile?.full_name || user?.user_metadata?.full_name || ''
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ studentName: undefined, repoUrl: '', demoUrl: '', notes: '', pdfFile: null, error: '', submitting: false })
  const inputRef = useRef(null)
  const approvedNotified = useRef(false)

  const loadSub = useCallback(async () => {
    if (!user) { setSubmissions([]); setLoading(false); return }
    setLoading(true); setLoadError('')
    const { data, error } = await supabase
      .from('capstone_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
    if (error) setLoadError(error.message)
    else setSubmissions(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { loadSub() }, [loadSub])

  // When an admin approves this capstone (status === 'approved'), mark it as
  // completed locally so course progress / certification eligibility updates.
  useEffect(() => {
    const mySub = submissions.find((s) => s.capstone_id === cap.id || s.assignment_title === cap.title)
    if (mySub && mySub.status === 'approved') {
      if (!approvedNotified.current) {
        approvedNotified.current = true
        updateCapstone?.({ capstoneId: cap.id, capstoneTitle: cap.title, repoUrl: mySub.github_url || '', demoUrl: mySub.live_demo_url || '', status: 'approved', submittedAt: mySub.submitted_at || new Date().toISOString() })
      }
    } else {
      approvedNotified.current = false
    }
  }, [submissions, cap.id, cap.title])

  const sub = submissions.find((s) => s.capstone_id === cap.id || s.assignment_title === cap.title) || null
  const meta = sub ? STATUS_META[sub.status] : null

  const pickPdf = (file) => {
    if (!file) { setForm((p) => ({ ...p, pdfFile: null, error: '' })); return }
    if (!isPdfFile(file)) { setForm((p) => ({ ...p, error: 'Only PDF files are accepted for the evidence upload.' })); return }
    if (file.size > MAX_PDF_BYTES) { setForm((p) => ({ ...p, error: 'PDF must be under 10 MB.' })); return }
    setForm((p) => ({ ...p, pdfFile: file, error: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { setForm((p) => ({ ...p, error: 'You must be signed in to submit.' })); return }
    const studentName = (form.studentName ?? defaultName).trim()
    if (!studentName) { setForm((p) => ({ ...p, error: 'Please enter your name.' })); return }
    const hasAtLeastOneInput = Boolean(form.repoUrl?.trim() || form.demoUrl?.trim() || form.notes?.trim() || form.pdfFile)
    if (!hasAtLeastOneInput) { setForm((p) => ({ ...p, error: 'Please provide at least one submission item (GitHub link, Live Demo, Notes, or PDF file).' })); return }
    setForm((p) => ({ ...p, submitting: true, error: '' }))
    let pdfUrl = null
    if (form.pdfFile) {
      const safeName = form.pdfFile.name.replace(/[^a-z0-9._-]/gi, '_').slice(0, 80)
      const filePath = `capstones/${Date.now()}_${safeName}`
      const { error: upErr } = await supabase.storage
        .from('assignment-docs')
        .upload(filePath, form.pdfFile, { cacheControl: '3600', contentType: 'application/pdf', upsert: false })
      if (upErr) {
        setForm((p) => ({ ...p, submitting: false, error: `PDF upload failed: ${upErr.message}` }))
        return
      }
      pdfUrl = supabase.storage.from('assignment-docs').getPublicUrl(filePath).data.publicUrl
    }
    const payload = {
      user_id: user.id,
      course_id: courseId || null,
      capstone_id: cap.id,
      assignment_title: cap.title,
      student_name: studentName,
      github_url: form.repoUrl?.trim() || '',
      live_demo_url: form.demoUrl?.trim() || '',
      notes: form.notes?.trim() || '',
      pdf_url: pdfUrl,
      status: 'pending',
    }
    const { data, error } = await supabase.from('capstone_submissions').insert([payload])
    setForm((p) => ({ ...p, submitting: false }))
    if (error) {
      console.error('Capstone submission failed:', error)
      setForm((p) => ({ ...p, error: error.message }))
      return
    }
    // Pending: do NOT mark as completed. The capstone only counts toward
    // course progress / certification once an admin sets status to 'approved'.
    updateCapstone?.({ capstoneId: cap.id, capstoneTitle: cap.title, repoUrl: form.repoUrl?.trim() || '', demoUrl: form.demoUrl?.trim() || '', status: 'pending', submittedAt: null })
    setOpen(false)
    await loadSub()
  }

  if (loading) {
    return (
      <div className='mt-4 flex items-center gap-2 text-xs text-slate-500'>
        <Loader2 className='w-4 h-4 animate-spin text-sky-500' /> Loading your submission…
      </div>
    )
  }
  if (loadError) {
    return (
      <div className='mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-300'>
        Couldn’t load your submission: {loadError}
      </div>
    )
  }

  if (sub) {
    return (
      <div className='mt-4 border-t border-slate-200/70 pt-4 dark:border-slate-800'>
        <StatusCard sub={sub} meta={meta} onResubmit={() => setOpen(true)} />
      </div>
    )
  }

  const quizLockNote = !quizPassed

  if (!open) {
    return (
      <div className='mt-4 border-t border-slate-200/70 pt-4 dark:border-slate-800'>
        {quizLockNote && (
          <div className='mb-3 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-300'>
            <Lock className='w-4 h-4' /> Pass the Grand Quiz to complete certification. You can still submit now.
            {onQuiz && (<button onClick={onQuiz} className='ml-auto font-bold underline cursor-pointer'>Go to Quiz</button>)}
          </div>
        )}
        <button onClick={() => setOpen(true)} className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-cyan-500/10 transition hover:from-blue-500 hover:to-cyan-400 cursor-pointer'>
          <Send className='w-4 h-4' /> Submit Capstone Project
        </button>
      </div>
    )
  }

  return (
    <div className='mt-4 border-t border-slate-200/70 pt-4 dark:border-slate-800'>
      <form onSubmit={handleSubmit} className='space-y-3'>
        <div className='flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-sky-600 dark:text-cyan-400'>
          <Link2 className='w-4 h-4' /> Submit Capstone {cap.title ? 'Project' : 'Project'}
        </div>
        <div>
          <label className='block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5'>Student Name <span className='text-rose-500'>*</span></label>
          <div className='relative'>
            <User2 className='pointer-events-none absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400' />
            <input
              value={form.studentName ?? defaultName}
              onChange={(e) => setForm((p) => ({ ...p, studentName: e.target.value }))}
              placeholder='Your full name as it should appear on the certificate'
              className='w-full rounded-xl border border-slate-200 bg-slate-100/70 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600'
            />
          </div>
        </div>

        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          <div>
            <label className='block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5'>GitHub Repository URL <span className='text-rose-500'>*</span></label>
            <div className='relative'>
              <FolderGit2 className='pointer-events-none absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400' />
              <input type='url' value={form.repoUrl || ''} onChange={(e) => setForm((p) => ({ ...p, repoUrl: e.target.value }))}
                placeholder='https://github.com/yourusername/capstone' className='w-full rounded-xl border border-slate-200 bg-slate-100/70 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600' />
            </div>
          </div>
          <div>
            <label className='block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5'>Live Demo / Walkthrough URL <span className='text-slate-400'>(Optional)</span></label>
            <div className='relative'>
              <Globe className='pointer-events-none absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400' />
              <input type='url' value={form.demoUrl || ''} onChange={(e) => setForm((p) => ({ ...p, demoUrl: e.target.value }))}
                placeholder='https://demo.example.com or https://youtu.be/…' className='w-full rounded-xl border border-slate-200 bg-slate-100/70 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600' />
            </div>
          </div>
        </div>

        <div>
          <label className='block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5'>Notes for Reviewers</label>
          <textarea
            value={form.notes || ''} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            rows={4} placeholder='Summarize the architecture, key decisions, and how your project meets the requirements…'
            className='w-full resize-y rounded-xl border border-slate-200 bg-slate-100/70 py-2.5 px-4 text-sm text-slate-800 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600'
          />
        </div>

        <div>
          <label className='block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5'>Evidence PDF <span className='font-normal text-slate-400'>(Optional - .pdf, max 10 MB)</span></label>
          <input ref={inputRef} type='file' accept='.pdf,application/pdf' className='hidden' onChange={(e) => { pickPdf(e.target.files?.[0]); e.target.value = '' }} />
          {form.pdfFile ? (
            <div className='flex items-center gap-3 rounded-xl border border-sky-400/50 dark:border-cyan-400/50 bg-sky-50 dark:bg-cyan-400/[0.06] px-3.5 py-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10'><FileText className='w-5 h-5 text-rose-400' /></div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-semibold text-slate-800 dark:text-white'>{form.pdfFile.name}</p>
                <p className='text-xs text-slate-500'>{Math.round(form.pdfFile.size / 1024)} KB · PDF ready to submit</p>
              </div>
              <button type='button' onClick={() => pickPdf(null)} aria-label='Remove file' className='shrink-0 rounded-lg border border-slate-200 dark:border-white/10 p-1.5 text-slate-500 transition hover:border-rose-400/50 hover:text-rose-500'><RefreshCw className='w-4 h-4' /></button>
            </div>
          ) : (
            <button type='button' onClick={() => inputRef.current?.click()} className='flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-center transition hover:border-sky-400 dark:border-white/15 dark:hover:border-cyan-400/50 dark:bg-white/[0.03]'>
              <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 dark:bg-cyan-400/10'><UploadCloud className='w-5 h-5 text-sky-500 dark:text-cyan-400' /></div>
              <p className='text-sm font-semibold text-slate-700 dark:text-slate-200'>Drag &amp; drop your PDF here, or <span className='text-sky-600 dark:text-cyan-400 underline'>browse files</span></p>
              <p className='text-xs text-slate-500'>Architecture diagram, report, or proof · .pdf only · max 10 MB</p>
            </button>
          )}
        </div>

        {form.error && (<div className='rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300'>{form.error}</div>)}

        <div className='flex items-center gap-3'>
          <button type='submit' disabled={form.submitting}
            className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/10 transition-all hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'>
            {form.submitting ? (<><Loader2 className='w-4 h-4 animate-spin' /> Submitting…</>) : (<><Send className='w-4 h-4' /> Submit Capstone for Review</>)}
          </button>
          <button type='button' onClick={() => setOpen(false)} className='text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer'>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default function CapstoneSubmissionPanel({ course, quizPassed, onQuiz, capstoneState, updateCapstone }) {
  const capstones = course?.capstones || []
  if (capstones.length === 0) {
    return (
      <div className='rounded-2xl border border-slate-200/80 bg-slate-50/60 px-5 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-white/[0.03]'>
        No capstone projects are configured for this course yet.
      </div>
    )
  }
  if (!quizPassed) {
    return (
      <div className='flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5'>
        <div className='flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10'>
          <Lock className='w-5 h-5 text-amber-500 dark:text-amber-400' />
        </div>
        <div className='text-left'>
          <p className='text-sm font-bold text-amber-700 dark:text-amber-300'>Capstone submissions unlock after the Grand Quiz</p>
          <p className='text-xs text-slate-500'>Pass the Grand Quiz with at least 80% to unlock the forms below and submit your capstones for certification.</p>
        </div>
        {onQuiz && (
          <button onClick={onQuiz} className='ml-auto inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-500/20 transition-all hover:bg-sky-600 cursor-pointer'>
            <Rocket className='w-4 h-4' /> Go to Grand Quiz
          </button>
        )}
      </div>
    )
  }
  return (
    <div className='space-y-6 animate-fade-in'>
      {capstones.map((cap, idx) => (
        <div key={cap.id} className='rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0f1420]'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <span className='inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 px-3 py-1.5 text-xs font-bold text-white'>
                Capstone {idx + 1}
              </span>
              <h3 className='text-lg font-bold text-slate-900 dark:text-white'>{cap.title}</h3>
            </div>
          </div>
          <p className='mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300'>{cap.description}</p>
          {Array.isArray(cap.requirements) && cap.requirements.length > 0 && (
            <ul className='mt-3 space-y-1.5 rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-white/[0.03] dark:text-slate-300'>
              {cap.requirements.map((r, i) => (<li key={i} className='flex gap-2'><span className='text-sky-500'>•</span><span>{r}</span></li>))}
            </ul>
          )}
          <div className='mt-5'>
            <CapstoneSubmitForm cap={cap} courseId={course?.id} quizPassed={quizPassed} onQuiz={onQuiz} updateCapstone={updateCapstone} />
          </div>
        </div>
      ))}
    </div>
  )
}
