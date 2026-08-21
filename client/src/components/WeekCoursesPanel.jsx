import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, GraduationCap, ArrowRight, FileText, UploadCloud, CheckCircle2, AlertTriangle, Loader2, Lock } from 'lucide-react'
import { usePortalStore } from '../context/PortalContext'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

/**
 * Weekly Free Course widget (Winter 2026-27).
 *
 * Receives the week's `course_requirements` from the portal context — one
 * required free course per row, each with its own PDF completion certificate
 * proof. Proofs are saved through the `winter_save_course_proof` RPC and must
 * be Approved (with every assignment) before the next week unlocks.
 */
export default function WeekCoursesPanel({ weekNum, locked, requirements = [] }) {
  const navigate = useNavigate()
  const { getProof, saveCourseProof } = usePortalStore()
  const [selected, setSelected] = useState({})
  const [error, setError] = useState('')
  const [uploadingId, setUploadingId] = useState(null)
  const inputRef = useRef({})

  if (requirements.length === 0) return null

  const pick = (requirementId, file) => {
    setError('')
    if (!file) return
    if (!/\.pdf$/i.test(file.name)) {
      setError('Only .pdf certificate files are accepted. Please export your certificate as a PDF.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Certificate file must be under 10 MB.')
      return
    }
    setSelected((prev) => ({ ...prev, [requirementId]: file }))
  }

  const upload = async (requirement) => {
    const file = selected[requirement.id]
    if (!file) return
    setUploadingId(requirement.id)
    setError('')
    const result = await saveCourseProof(requirement.id, file)
    setUploadingId(null)
    if (result?.success === false) setError(result.message || 'Upload failed.')
    else setSelected((prev) => ({ ...prev, [requirement.id]: null }))
  }

  return (
    <div className={`mt-5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50/60 dark:bg-[#131b2c] p-5 space-y-4 ${locked ? 'opacity-75' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-[11px] font-bold text-sky-700 dark:text-cyan-300 ring-1 ring-inset ring-sky-500/25 dark:ring-cyan-400/25">
          <BookOpen className="w-3.5 h-3.5" /> Free Courses · Week {weekNum}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-500/25">
          <FileText className="w-3.5 h-3.5" /> Course Certificates Required (.pdf)
        </span>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm font-medium text-amber-900 shadow-2xs dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>Upload each course's completion certificate below. Every certificate must be approved before the next week unlocks.</span>
      </div>

      <div className="space-y-3">
        {requirements.map((course) => {
          const proof = getProof(course.id)
          const isSelected = !!selected[course.id]
          const isUploading = uploadingId === course.id
          return (
            <div key={course.id} className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] px-4 py-3.5">
              <div className="flex flex-wrap items-center gap-3.5">
                <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/25">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{course.course_title}</p>
                    {course.course_badge && (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/25">
                        {course.course_badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {course.course_provider || 'Free Course'} · Included in your roadmap
                  </p>
                </div>
                {course.course_link && (
                  <button
                    type="button"
                    onClick={() => navigate(course.course_link)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 dark:bg-blue-600 dark:hover:bg-blue-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-500/25 transition disabled:opacity-50"
                  >
                    Open Course <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white/70 dark:bg-white/[0.02] p-3.5">
                {proof ? (
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${
                        proof.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/25'
                          : proof.status === 'changes_requested'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/25'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/25'
                      }`}
                    >
                      {proof.status === 'approved' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : proof.status === 'changes_requested' ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <Loader2 className="w-3.5 h-3.5" />
                      )}
                      {proof.status === 'approved' ? 'Certificate Approved' : proof.status === 'changes_requested' ? 'Changes Requested' : 'Certificate Under Review'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-gray-200">
                      <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                      <span className="max-w-[220px] truncate">{proof.fileName}</span>
                    </span>
                    <span className="text-[11px] text-slate-500">Uploaded {formatDate(proof.submittedAt)}</span>
                    {!locked && (
                      <button
                        type="button"
                        onClick={() => inputRef.current?.[course.id]?.click()}
                        className="ml-auto rounded-lg border border-slate-200 dark:border-gray-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-gray-200 transition hover:bg-slate-100 dark:hover:bg-white/5"
                      >
                        Replace
                      </button>
                    )}
                  </div>
                ) : locked ? (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Lock className="w-3.5 h-3.5" /> This week is locked — certificates can be uploaded once the previous week is fully approved.
                  </p>
                ) : (
                  <div>
                    <input
                      ref={(el) => { inputRef.current[course.id] = el }}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => pick(course.id, e.target.files?.[0] || null)}
                    />
                    {isSelected ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-gray-200">
                          <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                          <span className="max-w-[200px] truncate">{selected[course.id].name}</span>
                        </span>
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => upload(course)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 dark:bg-blue-600 dark:hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                        >
                          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                          {isUploading ? 'Uploading…' : 'Upload Certificate'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => inputRef.current?.[course.id]?.click()}
                        onDragOver={(e) => { e.preventDefault() }}
                        onDrop={(e) => { e.preventDefault(); pick(course.id, e.dataTransfer?.files?.[0] || null) }}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 text-center text-slate-600 transition-all hover:border-sky-400 hover:bg-sky-50/30 hover:text-sky-600 dark:border-slate-700 dark:bg-white/[0.02] dark:text-slate-400 dark:hover:border-sky-400/50 dark:hover:bg-sky-400/[0.06] dark:hover:text-sky-400"
                      >
                        <UploadCloud className="w-4 h-4 shrink-0" />
                        <span className="font-medium">Choose Certificate (.pdf)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <p className="flex items-start gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" /> {error}
        </p>
      )}
    </div>
  )
}
