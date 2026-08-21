import { useRef, useState, useEffect, useCallback } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { buildCloudinaryCertificateUrl } from '../utils/cloudinaryCert'
import './certificateModal.css'

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452z" />
  </svg>
)

export default function MinorCourseCertificate({
  studentName,
  courseTitle,
  duration,
  completionDate,
  certificateId,
  blankTemplateUrl,
  verifyUrl,
  onClose,
}) {
  const certRef = useRef(null)
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [useFallback, setUseFallback] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  const verifyLink = verifyUrl || `https://ihacademy.io/verify/${certificateId || ''}`

  const buildLinkedInCaption = () => {
    const title = courseTitle || 'the course'
    const courseHashtag = (title.replace(/[^a-zA-Z0-9]/g, '') || 'Course')
    return [
      `🎓 Proud to share that I have successfully completed the "${title}" course at IH Academy! 🚀`,
      '',
      `📜 Certificate ID: ${certificateId || 'N/A'}`,
      `🌐 Verify Certificate: ${verifyLink}`,
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

  const buildUrl = useCallback(() => {
    if (!blankTemplateUrl) return null
    return buildCloudinaryCertificateUrl({
      blankTemplateUrl,
      studentName: studentName || 'Student',
      courseTitle: courseTitle || 'Course',
      duration: duration || '10 Hours',
      completionDate: completionDate || '',
      certificateId: certificateId || '',
    })
  }, [blankTemplateUrl, studentName, courseTitle, duration, completionDate, certificateId])

  const handleImageError = () => {
    console.warn('Cloudinary certificate URL failed to load, falling back to blank template')
    setUseFallback(true)
  }

  useEffect(() => {
    const url = buildUrl()
    setCloudinaryUrl(url)
    setLoading(false)
  }, [blankTemplateUrl, studentName, courseTitle, duration, completionDate, certificateId, buildUrl])

  const handleDownloadHD = async () => {
    if (!certRef.current) return
    try {
      setDownloading(true)
      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const image = canvas.toDataURL('image/png', 1.0)
      const link = document.createElement('a')
      link.href = image
      link.download = `Certificate-${studentName?.replace(/\s+/g, '_') || 'HD'}.png`
      link.click()
    } catch (err) {
      console.error('HD Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!certRef.current) return
    try {
      setDownloading(true)
      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210)
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
              disabled={loading || downloading || (!cloudinaryUrl && !blankTemplateUrl)}
            />
            <Button
              label={downloading ? 'Generating PDF...' : 'Download PDF'}
              onClick={handleDownloadPDF}
              disabled={loading || downloading || (!cloudinaryUrl && !blankTemplateUrl)}
            />
            <Button label="Close" onClick={() => onClose?.()} disabled={downloading} />
          </div>
        </div>

        <div className="mc-stage">
          {loading ? (
            <div className="mc-loading">Generating certificate…</div>
          ) : (
            <div className="mc-canvas-wrap" ref={certRef}>
              <img
                src={useFallback ? blankTemplateUrl : cloudinaryUrl}
                alt={`${courseTitle} Certificate for ${studentName}`}
                className="mc-certificate-image"
                onError={handleImageError}
              />
            </div>
          )}
        </div>

        <div className="mc-footer no-print">
          <span>
            Verify at{' '}
            {verifyUrl ? (
              <a href={verifyUrl} target="_blank" rel="noreferrer">
                {verifyUrl}
              </a>
            ) : (
              'ihacademy.com/verify'
            )}
          </span>
        </div>
      </div>
    </div>
  )
}