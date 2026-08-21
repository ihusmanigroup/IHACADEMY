import { useEffect, useRef, useState } from 'react'

function parseValue(value) {
  const match = String(value).match(/^(\d+(?:\.\d+)?)(.*)$/)
  return {
    num: match ? parseFloat(match[1]) : 0,
    suffix: match ? match[2] : '',
  }
}

export default function AnimatedCounter({ value, label, duration = 1800 }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  const [display, setDisplay] = useState('0')
  const { num: target, suffix } = parseValue(value)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    let raf
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const current = target * eased
      setDisplay(current.toFixed(target % 1 ? 1 : 0))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration])

  return (
    <div ref={ref} className="text-center">
      <p className="font-bold text-3xl text-slate-900 dark:text-white transition-colors duration-300 tabular-nums">
        {display}
        {suffix}
      </p>
      <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 transition-colors duration-300">{label}</p>
    </div>
  )
}
