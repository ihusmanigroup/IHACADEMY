import { useRef, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import './certificateModal.css'

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452z" />
  </svg>
)

export default function MinorCourseCertificate({
  studentName,
  courseTitle,
  category,
  issueDate,
  certificateId,
  submissionDate,
  verificationUrl,
  templateUrl,
  onClose,
}) {
  const certRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  const verifyLink = verificationUrl || `https://ihacademy.app/verify/${certificateId || ''}`

  const buildLinkedInCaption = () => {
    const title = courseTitle || 'the course'
    const courseHashtag = (title.replace(/[^a-zA-Z0-9]/g, '') || 'Course')
    return [
      `🎓 Proud to share that I have successfully completed the "${title}" course at IH Academy! 🚀`,
      '',
      `📜 Certificate ID: ${certificateId || 'N/A'}`,
      `🌐 Verify Certificate: ${verificationUrl || `https://ihacademy.app/verify/${certificateId || ''}`}`,
      '',
      `#IHAcademy #Certification #SkillUp #${courseHashtag} #ContinuousLearning`,
    ].join('\n')
  }

  const handleShareLinkedIn = async () => {
    try {
      await navigator.clipboard.writeText(buildLinkedInCaption())
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      console.error('Failed to copy LinkedIn caption:', err)
    }
  }

  const getImageDataURL = async () => {
    const node = certRef.current
    if (!node) return null
    try {
      const canvas = await html2canvas(node, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        windowWidth: node.scrollWidth,
        windowHeight: node.scrollHeight,
        onclone: (clonedDoc) => {
          const cloned = clonedDoc.getElementById('certificate-node')
          if (cloned) {
            cloned.style.transform = 'none'
            cloned.style.margin = '0'
          }
        },
      })
      return canvas.toDataURL('image/png', 1.0)
    } catch (err) {
      console.error('Certificate export failed:', err)
      window.print()
      return null
    }
  }

  const handleDownloadHD = async () => {
    try {
      setDownloading(true)
      const dataUrl = await getImageDataURL()
      if (!dataUrl) return
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `Certificate-${studentName?.replace(/\s+/g, '_') || 'HD'}.png`
      link.click()
    } catch (err) {
      console.error('HD Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true)
      const dataUrl = await getImageDataURL()
      if (!dataUrl) return
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      pdf.addImage(dataUrl, 'PNG', 0, 0, 297, 210)
      pdf.save(`Certificate-${studentName?.replace(/\s+/g, '_') || 'HD'}.pdf`)
    } catch (err) {
      console.error('PDF Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  const Button = ({ label, onClick, primary, disabled }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`mc-btn ${primary ? 'mc-btn-primary' : ''} ${disabled ? 'mc-btn-disabled' : ''}`}
    >
      {label}
    </button>
  )

  return (
    <div className="mc-modal-overlay" role="dialog" aria-modal="true">
      <div className="mc-modal-shell">
        <div className="mc-toolbar no-print">
          <div className="mc-toolbar-left">
            <span className="mc-brand">IH ACADEMY</span>
          </div>
          <div className="mc-toolbar-right">
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(buildLinkedInCaption())
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2500)
                } catch (err) {
                  console.error('Failed to copy LinkedIn caption:', err)
                }
              }}
              className="bg-[#0A66C2] hover:bg-[#004182] text-white font-medium px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
            >
              <LinkedinIcon />
              {copied ? 'Copied!' : 'Share on LinkedIn'}
            </button>
            <Button
              label={downloading ? 'Generating HD...' : 'Download HD Certificate Image'}
              onClick={handleDownloadHD}
              primary
              disabled={downloading}
            />
            <Button
              label={downloading ? 'Generating PDF...' : 'Download PDF'}
              onClick={handleDownloadPDF}
              disabled={downloading}
            />
            <Button label="Close" onClick={() => onClose?.()} disabled={downloading} />
          </div>
        </div>

        <div className="mc-stage">
          <div className="mc-canvas-wrap" ref={certRef}>
            <div
              id="certificate-node"
              className="relative w-full max-w-3xl overflow-hidden"
              style={{ aspectRatio: '16 / 9', background: 'transparent' }}
            >
              {templateUrl ? (
                <img
                  src={templateUrl}
                  alt="IH Academy Certificate"
                  crossOrigin="anonymous"
                  className="absolute inset-0 w-full h-full object-cover z-0"
                  style={{ background: 'transparent' }}
                />
              ) : null}

              {/* Student Name - below "THIS CERTIFICATE IS PROUDLY PRESENTED TO" */}
              <h2 className="absolute top-[43%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold font-serif text-slate-900 text-center w-full z-20 pointer-events-none select-none bg-transparent">
                {studentName || 'Student Name'}
              </h2>

              {/* Course Title - replaces static "MINOR COURSE" */}
              <h3 className="absolute top-[57%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-extrabold uppercase text-slate-800 text-center w-full z-20 bg-transparent pointer-events-none select-none">
                {courseTitle || 'Git & GitHub for Absolute Beginners'}
              </h3>

              {/* 4-Column Dynamic Data (Bottom Row) */}
              <div className="absolute z-20 pointer-events-none select-none">
                {/* Category */}
                <div className="absolute bottom-[17%] left-[23%] -translate-x-1/2 z-20 pointer-events-none select-none">
                  <span className="text-xs font-semibold text-slate-800 z-20 bg-transparent">{category || 'Tools'}</span>
                </div>
                {/* Issue Date */}
                <div className="absolute bottom-[17%] left-[41%] -translate-x-1/2 z-20 pointer-events-none select-none">
                  <span className="text-xs font-semibold text-slate-800 z-20 bg-transparent">{issueDate || '26/08/2026'}</span>
                </div>
                {/* Certificate ID */}
                <div className="absolute bottom-[17%] left-[59%] -translate-x-1/2 z-20 pointer-events-none select-none">
                  <span className="text-xs font-mono font-bold text-slate-900 z-20 bg-transparent">{certificateId || 'IH-CERT-2026-8738'}</span>
                </div>
                {/* Submission Date */}
                <div className="absolute bottom-[17%] left-[77%] -translate-x-1/2 z-20 pointer-events-none select-none">
                  <span className="text-xs font-semibold text-slate-800 z-20 bg-transparent">{submissionDate || '26/08/2026'}</span>
                </div>
              </div>

              {/* Footer Verification URL */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none">
                <span className="text-xs font-mono text-emerald-300 z-20 bg-transparent">
                  Verify at {verificationUrl || `ihacademy.app/verify/${certificateId || 'IH-CERT-2026-8738'}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mc-footer no-print">
          <span className="text-xs font-mono text-emerald-300 opacity-90 bg-transparent">
            Verify at {verificationUrl || `ihacademy.app/verify/${certificateId || 'IH-CERT-2026-8738'}`}
          </span>
        </div>
      </div>
    </div>
  )
}