import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react'

const CW = 1920
const CH = 1080

// Pixel positions mapped to match DOM overlay on a max-w-4xl (896px) container.
// Scale factor: 1920 / 896 ≈ 2.14x for font sizes.
const NAME = { x: 960, y: 454, size: 64, font: 'Georgia, "Times New Roman", serif', color: '#1E293B', spacing: 0.16 }
const COURSE = { x: 960, y: 691, size: 34, font: 'Arial, sans-serif', color: '#0F172A' }
const META = {
  y: 1000,
  size: 24,
  font: 'Arial, sans-serif',
  color: '#0f2942',
  cols: [430, 790, 1140, 1480],
}

const CertificateCanvas = forwardRef(function CertificateCanvas(
  { templateUrl, studentName, courseTitle, category, issueDate, certificateId, submissionDate },
  ref
) {
  const canvasRef = useRef(null)
  const [tainted, setTainted] = useState(false)
  const readyRef = useRef(Promise.resolve())

  const draw = (img) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, CW, CH)

    if (img) {
      ctx.drawImage(img, 0, 0, CW, CH)
    } else {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, CW, CH)
    }

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'

    // Recipient name
    ctx.font = `700 ${NAME.size}px ${NAME.font}`
    ctx.fillStyle = NAME.color
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.round(NAME.size * NAME.spacing)}px`
    ctx.fillText(studentName || '', NAME.x, NAME.y)

    // Course title
    ctx.font = `800 ${COURSE.size}px ${COURSE.font}`
    ctx.fillStyle = COURSE.color
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
    ctx.fillText((courseTitle || '').toUpperCase(), COURSE.x, COURSE.y)

    // Bottom meta row (category / issue date / cert id / submission date)
    const metaValues = [category || 'Minor', issueDate, certificateId, submissionDate]
    ctx.font = `700 ${META.size}px ${META.font}`
    ctx.fillStyle = META.color
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
    metaValues.forEach((val, i) => {
      ctx.font = `700 ${META.size}px ${META.font}`
      ctx.fillText(val || '', META.cols[i], META.y)
    })
  }

  useEffect(() => {
    let cancelled = false

    const renderWhenReady = () => {
      if (cancelled) return
      const img = imgRef.current
      if (!img || !img.complete) return
      try {
        draw(img)
      } catch (e) {
        // Tainted canvas (CORS) — keep the white fallback, mark tainted.
        console.error('CertificateCanvas draw failed:', e)
        setTainted(true)
      }
    }

    const imgRef = { current: null }

    if (templateUrl) {
      readyRef.current = new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          if (cancelled) return
          imgRef.current = img
          const finish = () => {
            renderWhenReady()
            resolve()
          }
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(finish)
          } else {
            finish()
          }
        }
        img.onerror = () => {
          if (cancelled) return
          imgRef.current = null
          renderWhenReady()
          resolve()
        }
        img.src = templateUrl
        imgRef.current = img
      })
    } else {
      readyRef.current = (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => {
        if (cancelled) return
        renderWhenReady()
      })
    }

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateUrl, studentName, courseTitle, category, issueDate, certificateId, submissionDate])

  useImperativeHandle(ref, () => ({
    ready: () => readyRef.current,
    toDataURL: () => {
      const canvas = canvasRef.current
      if (!canvas) return null
      try {
        return canvas.toDataURL('image/png', 1.0)
      } catch (e) {
        console.error('Canvas export failed (likely CORS taint):', e)
        setTainted(true)
        return null
      }
    },
    isTainted: () => tainted,
  }))

  return (
    <canvas
      ref={canvasRef}
      width={CW}
      height={CH}
      className="mc-certificate-image"
    />
  )
})

export default CertificateCanvas
