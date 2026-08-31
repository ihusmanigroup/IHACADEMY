import { useRef, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import CertificateCanvas from './CertificateCanvas'
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
  const canvasRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

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

  const handleDownloadHD = async () => {
    const originalEl = certRef.current?.querySelector('#certificate-node')
    if (!originalEl) return
    try {
      setDownloading(true)
      const clone = originalEl.cloneNode(true)
      clone.style.position = 'fixed'
      clone.style.left = '-9999px'
      clone.style.top = '0px'
      clone.style.width = '1200px'
      clone.style.height = 'auto'
      clone.style.transform = 'none'
      const footerContainer = clone.querySelector('[class*="bottom-[6%]"]') ||
                              clone.querySelector('[class*="bottom-[5.5%]"]') ||
                              clone.querySelector('[class*="bottom-"]')
      if (footerContainer) {
        footerContainer.style.bottom = '8.5%'
      }
      document.body.appendChild(clone)
      if (document.fonts) await document.fonts.ready
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      })
      document.body.removeChild(clone)
      const image = canvas.toDataURL('image/png', 1.0)
      const link = document.createElement('a')
      link.download = `Certificate-${studentName?.replace(/\s+/g, '_') || 'HD'}.png`
      link.href = image
      link.click()
    } catch (err) {
      console.error('HD Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadPDF = async () => {
    const originalEl = certRef.current?.querySelector('#certificate-node')
    if (!originalEl) return
    try {
      setDownloading(true)
      const clone = originalEl.cloneNode(true)
      clone.style.position = 'fixed'
      clone.style.left = '-9999px'
      clone.style.top = '0px'
      clone.style.width = '1200px'
      clone.style.height = 'auto'
      clone.style.transform = 'none'
      const footerContainer = clone.querySelector('[class*="bottom-[6%]"]') ||
                              clone.querySelector('[class*="bottom-[5.5%]"]') ||
                              clone.querySelector('[class*="bottom-"]')
      if (footerContainer) {
        footerContainer.style.bottom = '8.5%'
      }
      document.body.appendChild(clone)
      if (document.fonts) await document.fonts.ready
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      })
      document.body.removeChild(clone)
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
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
              onClick={handleShareLinkedIn}
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
            {/* Full template background — no cropping, natural aspect ratio */}
            <div
              id="certificate-node"
              className="relative w-full max-w-4xl mx-auto my-auto"
            >
              {templateUrl ? (
                <img
                  src={templateUrl}
                  alt="Certificate Template"
                  crossOrigin="anonymous"
                  className="w-full h-auto block object-contain"
                />
              ) : null}

              {/* Hidden high-res canvas for downloads */}
              <div className="absolute -left-[9999px] -top-[9999px]">
                <CertificateCanvas
                  ref={canvasRef}
                  templateUrl={templateUrl}
                  studentName={studentName}
                  courseTitle={courseTitle}
                  category={category}
                  issueDate={issueDate}
                  certificateId={certificateId}
                  submissionDate={submissionDate}
                />
              </div>

              {/* Dynamic values overlay — only the 6 values that change per student */}
              <div className="absolute inset-0 pointer-events-none font-sans text-[#0f2942] select-none">

                {/* 1. STUDENT NAME */}
                <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-[70%]">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-wide text-slate-900">
                    {studentName || 'Student Name'}
                  </h2>
                </div>

                {/* 2. LOWER TITLE: COURSE NAME (Pushed down above bottom line) */}
                <div className="absolute top-[64%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-[85%] px-4 pointer-events-none">
                  <h3 className="text-sm md:text-base font-extrabold text-[#0f2942] uppercase tracking-wide leading-tight">
                    {courseTitle || "Git & GitHub for Absolute Beginners"}
                  </h3>
                </div>

                {/* FOOTER VALUES DIRECTLY ABOVE UNDERLINE BARS */}
                <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 w-[76%] grid grid-cols-4 pointer-events-none">
                  {/* 1. COURSE CATEGORY (NUDGED SLIGHTLY LEFT FOR PERFECT ALIGNMENT) */}
                  <div className="flex items-center justify-center text-center text-[10px] md:text-[11px] font-bold text-[#0f2942] tracking-tight whitespace-nowrap translate-x-[15px]">
                    {category || "Tools"}
                  </div>
                  {/* 2. ISSUE DATE (NUDGED FURTHER RIGHT) */}
                  <div className="flex items-center justify-center text-center text-[10px] md:text-[11px] font-bold text-[#0f2942] tracking-tight whitespace-nowrap translate-x-[7px]">
                    {issueDate || "August 26, 2026"}
                  </div>
                  {/* 3. CERTIFICATE ID (FINAL NUDGE LEFT) */}
                  <div className="flex items-center justify-center text-center text-[10px] md:text-[11px] font-bold text-[#0f2942] tracking-tight whitespace-nowrap -translate-x-[12px]">
                    {certificateId || "IH-CERT-2026-8738"}
                  </div>
                  {/* 4. SUBMISSION DATE (FINAL TINY NUDGE LEFT) */}
                  <div className="flex items-center justify-center text-center text-[10px] md:text-[11px] font-bold text-[#0f2942] tracking-tight whitespace-nowrap -translate-x-[35px]">
                    {submissionDate || "August 26, 2026"}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Single verification link — below the certificate frame only */}
        <div className="mc-footer no-print">
          <span className="text-xs font-mono text-emerald-300 opacity-90">
            Verify at{' '}
            <a
              href={verificationUrl || `https://ihacademy.app/verify/${certificateId || ''}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {verificationUrl || `ihacademy.app/verify/${certificateId || 'IH-CERT-2026-8738'}`}
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}