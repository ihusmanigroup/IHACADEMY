import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, ExternalLink, FileText,
  CheckCircle2, AlertTriangle, Loader2, Lock, Award, Upload,
} from 'lucide-react'
import { usePortalStore } from '../context/PortalContext'
import CertificateUploadModal from '../components/CertificateUploadModal'
import { courseHours } from '../lib/freeCoursesCatalog'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 3500)
    return () => clearTimeout(id)
  }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3 text-sm font-medium shadow-2xl transition-all animate-[fadeIn_0.2s_ease-out] ${
      type === 'success'
        ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
        : 'bg-red-950/90 border-red-500/30 text-red-300'
    }`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
      {message}
    </div>
  )
}

const IMAGE_RE = /\.(png|jpe?g)$/i

const STATUS_TONES = {
  none: 'border-slate-200/80 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400',
  approved: 'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300',
  under_review: 'border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
  changes_requested: 'border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300',
}

function getStatus(course, proof) {
  if (!proof) return { label: 'Not Started', tone: 'none', icon: null }
  if (proof.status === 'approved') return { label: 'Approved', tone: 'approved', icon: CheckCircle2 }
  if (proof.status === 'changes_requested' || proof.status === 'rejected') return { label: 'Changes Requested', tone: 'changes_requested', icon: AlertTriangle }
  return { label: 'Under Review', tone: 'under_review', icon: Loader2 }
}

function CourseCard({ course, weekNumber, locked, linked, proof, userTrack, onPickFile }) {
  const navigate = useNavigate()
  const status = getStatus(course, proof)
  const StatusIcon = status.icon
  const hours = courseHours(course)
  const inputRef = useRef(null)
  // Re-upload is only allowed after the admin asks for changes / rejects the
  // submission; while Under Review multi-uploading stays disabled.
  const needsReupload = !!proof && (proof.status === 'changes_requested' || proof.status === 'rejected')
  const viewLabel = proof?.fileUrl && IMAGE_RE.test(proof.fileName) ? 'View Uploaded Image' : 'View Uploaded PDF'

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-sky-300 hover:shadow-md dark:border-slate-700/80 dark:bg-[#0f1420] dark:hover:border-sky-500/50">
      {/* Top badge row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {course.level || 'Beginner'}
        </span>
        {linked ? (
          <span className="rounded-md bg-amber-100/80 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
            Required
          </span>
        ) : (
          <span className="rounded-md bg-sky-100/80 px-2 py-0.5 text-[11px] font-semibold text-sky-800 dark:bg-sky-500/15 dark:text-sky-300">
            Available
          </span>
        )}
      </div>

      {/* Title & description */}
      <h4 className="mb-1 mt-1 text-base font-bold tracking-tight text-slate-900 dark:text-white">{course.title}</h4>
      <p className="mb-3 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
        {course.description || `Required for ${userTrack || 'your track'} · Week ${weekNumber}. Complete it on IH Academy and upload your completion certificate to progress your roadmap.`}
      </p>

      {/* Status & metadata badges */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${STATUS_TONES[status.tone]}`}>
          {StatusIcon && <StatusIcon className="w-3.5 h-3.5" />} {status.label}
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          Type: Certificate
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          {hours} hours on completion
        </span>
      </div>

      {/* Action area */}
      <div className="mt-auto space-y-2">
        {/* Hidden native file picker — accepts PDF / PNG / JPG certificates.
            Clicking Upload Certificate triggers this dialog immediately. */}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] || null
            e.target.value = ''
            if (f) onPickFile(course, f)
          }}
        />

        <button
          type="button"
          onClick={() => navigate('/courses')}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-sky-700"
        >
          <ExternalLink className="w-4 h-4" /> Watch Course on IH Academy
        </button>

        {/* Upload Certificate — ALWAYS rendered whenever no certificate is on
            file yet, regardless of link/lock state. Under Review / Approved
            cards swap it for the status pill below; Changes Requested becomes
            Re-upload Certificate. */}
        {(!proof || needsReupload) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50/60 px-4 py-2.5 text-sm font-semibold text-sky-700 shadow-none transition-all duration-200 hover:border-sky-300 hover:bg-sky-100 hover:shadow-sm dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:border-sky-400/50 dark:hover:bg-sky-500/20"
          >
            <Upload className="w-4 h-4 text-sky-600 dark:text-sky-400" /> {needsReupload ? 'Re-upload Certificate' : 'Upload Certificate'}
          </button>
        )}

        {needsReupload && (
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200/80 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300">
              <AlertTriangle className="w-3.5 h-3.5" /> Changes Requested
            </span>
            {proof.fileUrl && (
              <a
                href={proof.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-sky-200 bg-sky-50/60 px-2.5 py-1.5 text-[11px] font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
              >
                <FileText className="w-3 h-3" /> {viewLabel}
              </a>
            )}
          </div>
        )}

        {needsReupload && proof.feedback && (
          <p className="flex items-start gap-1.5 rounded-lg border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-[11px] font-medium text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
            <span><span className="font-bold">Changes requested:</span> {proof.feedback}</span>
          </p>
        )}

        {proof && !needsReupload && (
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/40 px-3 py-2.5 dark:border-slate-700/60 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                proof.status === 'approved'
                  ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300'
              }`}>
                {proof.status === 'approved'
                  ? <><CheckCircle2 className="w-3.5 h-3.5" /> Approved</>
                  : <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Under Review</>}
              </span>
              {proof.fileUrl && (
                <a
                  href={proof.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-sky-200 bg-sky-50/60 px-2.5 py-1.5 text-[11px] font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
                >
                  <FileText className="w-3 h-3" /> {viewLabel}
                </a>
              )}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
              <FileText className="w-3 h-3 shrink-0 text-sky-600 dark:text-cyan-400" />
              <span className="max-w-[200px] truncate">{proof.fileName}</span>
              {proof.submittedAt && (
                <>
                  <span aria-hidden>·</span>
                  <span className="shrink-0">{formatDate(proof.submittedAt)}</span>
                </>
              )}
            </div>
            {proof.status !== 'approved' && (
              <p className="mt-1.5 text-[10px] font-medium text-amber-700/80 dark:text-amber-300/70">
                Awaiting admin verification — re-upload is disabled while under review.
              </p>
            )}
          </div>
        )}

        {locked && !proof && (
          <p className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-700">
            <Lock className="w-3.5 h-3.5" /> Unlocks once the previous week is fully approved
          </p>
        )}
      </div>

      {/* Footer bar */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800">
        <span>💬 Comments (0)</span>
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Completion checklist
        </span>
      </div>
    </div>
  )
}

/**
 * Dedicated Free Courses page for the Intern Portal (Winter 2026-27).
 *
 * Dynamically fetches EVERY free course published in the IH Academy catalog
 * (`courses where is_free = true`) — no `.limit()`, no track-restricted
 * truncation. Each card maps back to its winter course requirement (via
 * `catalog_course_id`) when one exists so the certificate upload flow
 * (PDF / PNG / JPG via CertificateUploadModal) → Storage
 * (`course-certificates` bucket) → `winter_save_course_proof` RPC keeps
 * working; catalog courses without a requirement link are shown as available
 * with a Watch CTA only.
 *
 * Progress is fully dynamic: `approved / total` cards plus credited hours
 * summed from each completed course's real lesson count.
 */
export default function FreeCoursesView() {
  const { saveCourseProof, userTrack, freeCourses, freeCourseStats } = usePortalStore()
  const [uploadCourseId, setUploadCourseId] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, type) => setToast({ message: msg, type: type || 'success' }), [])

  // File was picked from the card's native file dialog — open the modal with it
  // pre-loaded so the intern can review the name/size before submitting.
  const handlePickFile = useCallback((course, file) => {
    setPendingFile(file)
    setUploadCourseId(course.id)
  }, [])

  const courses = freeCourses || []
  const uploadCourse = courses.find((c) => c.id === uploadCourseId) || null
  const totalFreeCoursesCount = freeCourseStats?.total || courses.length || 0
  const approvedCount = freeCourseStats?.approved || 0
  const pct = freeCourseStats?.pct || (totalFreeCoursesCount ? Math.round((approvedCount / totalFreeCoursesCount) * 100) : 0)
  const creditedHours = courses.reduce(
    (sum, c) => (c.proof?.status === 'approved' ? sum + courseHours(c) : sum),
    0
  )

  const submitUpload = async (file) => {
    if (!uploadCourse?.requirementId) {
      setError('This course is not yet linked for certificate submission — complete it through your roadmap.')
      showToast('Certificate submission is not available for this course yet.', 'error')
      return
    }
    setSubmitting(true)
    setError('')
    const result = await saveCourseProof(uploadCourse.requirementId, file)
    setSubmitting(false)
    if (result?.success === false) {
      setError(result.message || 'Upload failed.')
      showToast(result.message || 'Upload failed.', 'error')
      return
    }
    setUploadCourseId(null)
    setPendingFile(null)
    showToast('Certificate submitted — it is now under review.', 'success')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white">IH Academy Free Courses</h1>
        <p className="mt-1 mb-6 text-sm font-medium text-slate-500 dark:text-slate-400">
          Complete the required free courses for your internship roadmap and upload your completion certificates for verification.
        </p>
      </div>

      {totalFreeCoursesCount === 0 ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-14 text-center shadow-2xs dark:border-slate-800 dark:bg-[#0f1420]">
          <Loader2 className="w-10 h-10 mx-auto animate-spin text-slate-400" />
          <p className="mt-3 text-sm font-medium text-slate-500">Loading free courses…</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-14 text-center shadow-2xs dark:border-slate-800 dark:bg-[#0f1420]">
          <BookOpen className="w-10 h-10 mx-auto text-slate-400" />
          <p className="mt-3 font-semibold text-slate-900 dark:text-slate-100">No free courses yet</p>
          <p className="mt-1 text-sm text-slate-500">Required courses will appear here once your enrollment is active.</p>
        </div>
      ) : (
        <>
          {/* Progress metric — fully dynamic totals */}
          <div className="flex flex-col gap-4 rounded-2xl border border-sky-200/80 bg-sky-50/80 p-5 shadow-2xs sm:flex-row sm:items-center sm:justify-between dark:border-sky-500/30 dark:bg-sky-500/10">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-600/25">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">Certificate Progress</p>
                <p className="mt-0.5 text-2xl font-extrabold text-slate-900 dark:text-white">
                  {approvedCount}/{totalFreeCoursesCount}{' '}
                  <span className="text-sm font-semibold text-slate-500">Certificates Approved</span>
                </p>
                <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  {creditedHours}h of free-course hours credited
                </p>
              </div>
            </div>
            <div className="sm:w-64">
              <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Approval progress</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="flex items-start gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" /> {error}
            </p>
          )}

          {/* Course grid — responsive 2-column layout */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                weekNumber={course.weekNumber}
                locked={course.locked}
                linked={course.linked}
                proof={course.proof}
                userTrack={userTrack}
                onPickFile={handlePickFile}
              />
            ))}
          </div>
        </>
      )}

      {uploadCourse && (
        <CertificateUploadModal
          course={uploadCourse}
          proof={uploadCourse.proof}
          initialFile={pendingFile}
          submitting={submitting}
          onSubmit={submitUpload}
          onClose={() => { if (!submitting) { setUploadCourseId(null); setPendingFile(null) } }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}