import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Dynamic certificate rendering for the Intern Portal Certificate tab.
 *
 * Two per-track templates are fetched from Supabase (`certificate_templates`):
 *   - 'entry'      → Entry / Offer Letter (always unlocked)
 *   - 'completion' → Certificate of Completion (unlocks at 100% progress)
 * `useCertificateCanvas` draws the uploaded template onto a canvas at its
 * native resolution and overlays the intern's full name, so the on-screen
 * certificate and the downloaded PNG are identical.
 *
 * No mock data is used anywhere in this module.
 */

export function useCertificateTemplate(trackSlug, templateType = null) {
  const [state, setState] = useState({ loading: true, template: null, error: null })

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!trackSlug) {
        setState({ loading: false, template: null, error: null })
        return
      }
      setState((s) => ({ ...s, loading: true, error: null }))

      // Prefer the typed template (entry/completion); fall back to the latest
      // template uploaded for the track so older uploads still render.
      if (templateType) {
        const { data, error } = await supabase
          .from('certificate_templates')
          .select('*')
          .eq('track_id', trackSlug)
          .eq('template_type', templateType)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (!cancelled && !error && data) {
          setState({ loading: false, template: data, error: null })
          return
        }
      }

      const { data, error } = await supabase
        .from('certificate_templates')
        .select('*')
        .eq('track_id', trackSlug)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (cancelled) return
      if (error) {
        setState({ loading: false, template: null, error: error.message })
        return
      }
      setState({ loading: false, template: data || null, error: null })
    }

    load()
    return () => { cancelled = true }
  }, [trackSlug, templateType])

  return state
}

export function useCertificateCanvas({
  templateUrl,
  internName = '',
  nameOffsetX = 50,
  nameOffsetY = 60,
  nameFontSize = 30,
  nameColor = '#1E293B',
}) {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('loading') // loading | ready | error

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelled) return
      const canvas = canvasRef.current
      if (!canvas) return
      const w = img.naturalWidth
      const h = img.naturalHeight
      if (!w || !h) {
        setStatus('error')
        return
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      const x = ((nameOffsetX ?? 50) / 100) * w
      const y = ((nameOffsetY ?? 60) / 100) * h
      ctx.save()
      ctx.font = `italic 600 ${Math.max(10, Math.round(nameFontSize ?? 30))}px Georgia, 'Times New Roman', serif`
      ctx.fillStyle = nameColor ?? '#1E293B'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(internName, x, y)
      ctx.restore()
      setStatus('ready')
    }
    img.onerror = () => {
      if (!cancelled) setStatus('error')
    }
    img.src = templateUrl
    return () => { cancelled = true }
  }, [templateUrl, internName, nameOffsetX, nameOffsetY, nameFontSize, nameColor])

  const download = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'IH-Academy-Certificate.png'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }, [])

  return { canvasRef, status, download }
}
