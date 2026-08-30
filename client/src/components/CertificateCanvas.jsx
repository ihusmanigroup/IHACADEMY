import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react'

const CW = 1920
const CH = 1080

// Pixel positions mapped 1:1 from the DOM overlay percentages so the canvas
// preview matches exactly what the old DOM preview looked like.
const NAME = { x: 960, y: 491, size: 38, font: 'Georgia, "Times New Roman", serif', color: '#1E293B', spacing: 0.16 }
const COURSE = { x: 960, y: 664, size: 31, font: 'Arial, sans-serif', color: '#0F172A' }
const META = {
  y: 970,
  size: 23,
  font: 'Arial, sans-serif',
  color: '#334155',
  cols: [470, 796, 1122, 1449],
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
    ctx.font = `700 ${COURSE.size}px ${COURSE.font}`
    ctx.fillStyle = COURSE.color
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
    ctx.fillText(courseTitle || '', COURSE.x, COURSE.y)

    // Bottom meta row (category / issue date / cert id / submission date)
    ctx.font = `600 ${META.size}px ${META.font}`
    ctx.fillStyle = META.color
    const metaValues = [category, issueDate, certificateId, submissionDate]
    metaValues.forEach((val, i) => {
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
