import { useState } from 'react'
import {
  AlertTriangle, Award, CheckCircle2, Clock3, Code2, FileText,
  GitBranch, Globe, Loader2, MessageSquareText, Send, UploadCloud,
} from 'lucide-react'
import { useTopicSubmissions } from '../hooks/useTopicSubmissions'

const STATUS_META = {
  pending: {
    label: 'Submitted (Awaiting Review)',
    hint: 'Your submission has been received and is being reviewed by the IH Academy team.',
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
    hint: 'Your submission needs a few changes before it can be approved.',
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

function StatusCard({ sub, meta, onResubmit }) {
  const StatusIcon = meta.icon
  const repoUrl = sub.github_url ? /^https?:\/\//i.test(sub.github_url) ? sub.github_url : `https://${sub.github_url}` : null
  const demoUrl = sub.demo_link ? /^https?:\/\//i.test(sub.demo_link) ? sub.demo_link : `https://${sub.demo_link}` : null
  const pdfUrl = sub.file_url || null
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 ${meta.chip}`}>
      <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-slate-500 to-slate-400" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 dark:bg-white/10 ring-1 ring-inset ring-slate-900/5 dark:ring-white/10">
            <StatusIcon className={`w-5 h-5 ${meta.iconColor}`} />
          </span>
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              {meta.label}
              <span aria-hidden className={`h-2 w-2 rounded-full ${meta.dot}`} />
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Submitted {formatDate(sub.submitted_at)}</p>
          </div>
        </div>
        {sub.score != null && (
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Score</p>
            <p className="flex items-center justify-end gap-1.5 text-xl font-extrabold text-slate-900 dark:text-white">
              <Award className="w-4 h-4 text-emerald-500" />
              {sub.score}
              <span className="text-xs font-semibold text-slate-400">/100</span>
            </p>
          </div>
        )}
      </div>

      {sub.topic_title && (
        <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">{sub.topic_title}</h3>
      )}
      <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{meta.hint}</p>

      {(sub.admin_feedback || repoUrl || demoUrl || pdfUrl || sub.code_snippet || sub.notes) && (
        <div className="mt-3 flex flex-col gap-2">
          {sub.admin_feedback && (
            <div className="flex-1 rounded-xl border border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-white/[0.04] px-4 py-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                <MessageSquareText className="w-3.5 h-3.5" />
                {sub.status === 'rejected' ? 'Admin Feedback' : 'Reviewer Feedback'}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{sub.admin_feedback}</p>
            </div>
          )}
          {sub.code_snippet && (
            <pre className="rounded-xl bg-slate-900 text-slate-100 text-xs p-3 overflow-x-auto max-h-40">
              <code>{sub.code_snippet}</code>
            </pre>
          )}
          <div className="flex flex-wrap gap-2">
            {repoUrl && (
              <a href={repoUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">
                <GitBranch className="w-3.5 h-3.5" /> GitHub Repo
              </a>
            )}
            {demoUrl && (
              <a href={demoUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">
                <Globe className="w-3.5 h-3.5" /> Live Demo
              </a>
            )}
            {pdfUrl && (
              <a href={pdfUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">
                <FileText className="w-3.5 h-3.5" /> View PDF
              </a>
            )}
          </div>
        </div>
      )}

      {sub.status === 'rejected' && (
        <button
          onClick={onResubmit}
          className="mt-4 inline-flex items-center gap-1.5 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5" /> Resubmit
        </button>
      )}
    </div>
  )
}

export default function TopicSubmissionPanel({
  courseId, lessonId, topicId, topicTitle, courseType = 'free',
}) {
  const { submission, loading, submitting, error, submit } = useTopicSubmissions({
    courseId, lessonId, topicId, courseType,
  })
  const [mode, setMode] = useState('form') // 'form' | 'resubmit'
  const [code, setCode] = useState('')
  const [github, setGithub] = useState('')
  const [demo, setDemo] = useState('')
  const [pdf, setPdf] = useState(null)
  const [localError, setLocalError] = useState(null)

  if (loading) {
    return <div className="mt-6 flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading submission…</div>
  }

  if (submission && submission.status !== 'rejected' && !mode) {
    return (
      <div className="mt-6">
        <StatusCard sub={submission} meta={STATUS_META[submission.status]} onResubmit={() => setMode('resubmit')} />
      </div>
    )
  }

  const handleSubmit = async () => {
    setLocalError(null)
    try {
      await submit({
        githubUrl: github,
        demoLink: demo,
        codeSnippet: code,
        pdfFile: pdf,
        topicTitle,
      })
      setMode(null)
      setCode(''); setGithub(''); setDemo(''); setPdf(null)
    } catch (err) {
      setLocalError(err.message || 'Submission failed')
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1420]/80 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
          <Code2 className="w-3 h-3" /> Practical Submission
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Required for course completion</span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
        Submit your work for <strong className="text-slate-900 dark:text-white">{topicTitle}</strong>. At least one of the following is required: code snippet, GitHub repo, live demo, or PDF.
      </p>

      {(error || localError) && (
        <div className="mb-4 flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs px-4 py-3 rounded-xl">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error || localError}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">
            <Code2 className="w-3.5 h-3.5" /> Code Snippet (paste)
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={5}
            placeholder="Paste your solution code here…"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-slate-100 text-xs font-mono p-3 focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">
              <GitBranch className="w-3.5 h-3.5" /> GitHub Repo URL
            </label>
            <input
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/you/repo"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-slate-100 text-xs px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">
              <Globe className="w-3.5 h-3.5" /> Live Demo URL
            </label>
            <input
              value={demo}
              onChange={(e) => setDemo(e.target.value)}
              placeholder="https://your-demo.netlify.app"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-slate-100 text-xs px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">
            <FileText className="w-3.5 h-3.5" /> PDF Upload (optional)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdf(e.target.files?.[0] || null)}
            className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-sky-500/10 file:text-sky-600 dark:file:text-sky-400 hover:file:bg-sky-500/20 cursor-pointer"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || (!code.trim() && !github.trim() && !demo.trim() && !pdf)}
          className="w-full inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {mode === 'resubmit' ? 'Resubmit Work' : 'Submit Work'}
        </button>
      </div>
    </div>
  )
}
