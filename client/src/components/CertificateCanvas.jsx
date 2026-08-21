import { useEffect, useRef } from 'react'

const CANVAS_W = 1920
const CANVAS_H = 1080

// Renders the certificate onto a high-resolution HTML5 canvas (A4 @ 1920x1080).
// The supplied canvasRef is exposed to the parent so it can export a PNG / PDF.
//
// CRITICAL: the uploaded template contains hardcoded placeholder text
// ([RECIPIENT NAME], [MINOR COURSE NAME], [DURATION], [DATE], [CERTIFICATE ID]).
// Before drawing any dynamic text we paint opaque white rectangles over those
// placeholder areas so the underlying strings are completely erased and the
// dynamic text does not overlap them.
export default function CertificateCanvas({
  canvasRef,
  templateUrl,
  recipientName,
  courseTitle,
  duration,
  date,
  certificateId,
}) {
  const localRef = useRef(null)
  const ref = canvasRef || localRef

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Erase ONLY the template's baked-in placeholder strings (not the static
    // label headers like "COURSE DURATION") with white boxes.
    const patchPlaceholders = () => {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(480, 470, 960, 90) // [RECIPIENT NAME]
      ctx.fillRect(520, 625, 880, 55) // [MINOR COURSE NAME]
      ctx.fillRect(580, 782, 170, 32) // [DURATION] (right half only)
      ctx.fillRect(980, 782, 160, 32) // [DATE] (right half only)
      ctx.fillRect(1380, 782, 260, 32) // [CERTIFICATE ID] (right half only)
    }

    const drawText = () => {
      ctx.textBaseline = 'alphabetic'

      // Recipient name
      ctx.textAlign = 'center'
      ctx.fillStyle = '#2563EB'
      ctx.font = '700 50px "Inter", sans-serif'
      ctx.fillText(recipientName || '', 960, 532)

      // Course title
      ctx.fillStyle = '#0F172A'
      ctx.font = '700 30px "Inter", sans-serif'
      ctx.fillText(courseTitle || '', 960, 665)

      // Metadata row (left-aligned, drawn over the erased inline placeholders)
      ctx.textAlign = 'left'
      ctx.fillStyle = '#0F172A'
      ctx.font = '700 18px "Inter", sans-serif'
      ctx.fillText(duration || '—', 585, 804)
      ctx.fillText(date || '—', 985, 804)
      ctx.fillText(certificateId || '', 1385, 804)
    }

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

      if (templateUrl) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H)
          patchPlaceholders()
          drawText()
        }
        img.onerror = () => {
          patchPlaceholders()
          drawText()
        }
        img.src = templateUrl
      } else {
        patchPlaceholders()
        drawText()
      }
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(render)
    } else {
      render()
    }
  }, [ref, templateUrl, recipientName, courseTitle, duration, date, certificateId])

  return (
    <canvas
      ref={ref}
      width={CANVAS_W}
      height={CANVAS_H}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        borderRadius: 12,
        boxShadow: '0 20px 50px rgba(2, 44, 34, 0.25)',
      }}
    />
  )
}
