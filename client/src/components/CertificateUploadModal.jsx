import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle, CheckCircle2, FileText, Image as ImageIcon,
  Loader2, UploadCloud, X,
} from 'lucide-react'

const ACCEPT_ATTR = '.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg'
const FILE_RE = /\.(pdf|png|jpe?g)$/i
const IMAGE_RE = /\.(png|jpe?g)$/i
const MAX_SIZE = 10 * 1024 * 1024

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * Certificate upload modal for the Free Courses page.
 *
 * Sleek picker for PDF / PNG / JPG completion certificates with a drag-and-drop
 * zone, a live preview (image thumbnail) or file details (name / size / type
 * badge), validation, and a submit action backed by the parent's upload flow.
 * Closes on backdrop click or Escape; body scrolling is frozen while open.
 */
export default function CertificateUploadModal({ course, proof, initialFile = null, submitting = false, onSubmit, onClose }) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const isImage = !!file && IMAGE_RE.test(file.name)
  const isPdf = !!file && /\.pdf$/i.test(file.name)
  const reupload = !!proof

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  useEffect(() => {
    if (isImage) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewUrl(null)
  }, [file, isImage])

  const acceptFile = (f) => {
    if (!f) return
    setError('')
    if (!FILE_RE.test(f.name)) {
      setError('Only .pdf, .png, .jpg or .jpeg certificate files are accepted.')
      return
    }
    if (f.size > MAX_SIZE) {
      setError('Certificate file must be under 10 MB.')
      return
    }
    setFile(f)
  }

  // A file was already picked via the card's native file dialog — pre-load it
  // into the modal so the intern reviews name/size before submitting.
  useEffect(() => {
    if (initialFile) acceptFile(initialFile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = () => {
    if (!file || submitting) return
    onSubmit(file)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Upload certificate"
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700/80 dark:bg-[#0f1420]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/25">
              <UploadCloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                {reupload ? 'Re-upload Certificate' : 'Upload Certificate'}
              </h2>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">{course?.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:border-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {reupload && proof?.feedback && (
          <p className="mb-4 flex items-start gap-1.5 rounded-lg border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-[11px] font-medium text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
            <span><span className="font-bold">Admin feedback:</span> {proof.feedback}</span>
          </p>
        )}

        {/* File picker / drag-and-drop */}
        {!file ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); acceptFile(e.dataTransfer?.files?.[0] || null) }}
            className={`flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all ${
              dragOver
                ? 'border-sky-400 bg-sky-50/60 dark:border-sky-400/60 dark:bg-sky-400/[0.06]'
                : 'border-slate-300 bg-slate-50/50 hover:border-sky-400 hover:bg-sky-50/30 dark:border-slate-700 dark:bg-white/[0.02] dark:hover:border-sky-400/50 dark:hover:bg-sky-400/[0.06]'
            }`}
          >
            <UploadCloud className={`w-9 h-9 ${dragOver ? 'text-sky-500' : 'text-slate-400'}`} />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Click to choose or drag &amp; drop
            </span>
            <span className="text-xs font-medium text-slate-400">PDF, PNG or JPG · up to 10 MB</span>
          </button>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-white/[0.02]">
            {/* Live preview */}
            {previewUrl ? (
              <div className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700">
                <img src={previewUrl} alt={file.name} className="max-h-44 w-full object-contain" />
              </div>
            ) : (
              <div className="mb-3 flex h-28 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-700">
                {isPdf ? (
                  <FileText className="w-10 h-10 text-rose-500" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-sky-500" />
                )}
              </div>
            )}

            {/* File details */}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{file.name}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-400">{formatFileSize(file.size)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                  isPdf
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                    : 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
                }`}>
                  {isPdf ? <FileText className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                  {isPdf ? 'PDF' : 'IMG'}
                </span>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => { setFile(null); setError('') }}
                  className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-white/5"
                >
                  Change
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-3 flex items-start gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" /> {error}
          </p>
        )}

        {/* Hidden input */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={(e) => acceptFile(e.target.files?.[0] || null)}
        />

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!file || submitting}
            onClick={submit}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> {reupload ? 'Submit Re-upload' : 'Upload Certificate'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}