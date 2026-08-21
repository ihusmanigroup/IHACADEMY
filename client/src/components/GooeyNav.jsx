import { useRef, useEffect, useState } from 'react'
import './GooeyNav.css'

const GooeyNav = ({
  items,
  animationTime = 600,
  particleCount = 8,
  particleDistances = [60, 10],
  particleR = 60,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0
}) => {
  const containerRef = useRef(null)
  const navRef = useRef(null)
  const filterRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex)

  const noise = (n = 1) => n / 2 - Math.random() * n

  const getXY = (distance, pointIndex, totalPoints) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180)
    return [distance * Math.cos(angle), distance * Math.sin(angle)]
  }

  const createParticle = (i, t, d, r) => {
    let rotate = noise(r / 10)
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    }
  }

  const makeParticles = element => {
    const d = particleDistances
    const r = particleR
    const bubbleTime = animationTime * 2 + timeVariance
    element.style.setProperty('--time', `${bubbleTime}ms`)

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2)
      const p = createParticle(i, t, d, r)

      setTimeout(() => {
        const particle = document.createElement('span')
        const point = document.createElement('span')
        particle.classList.add('particle')
        particle.style.setProperty('--start-x', `${p.start[0]}px`)
        particle.style.setProperty('--start-y', `${p.start[1]}px`)
        particle.style.setProperty('--end-x', `${p.end[0]}px`)
        particle.style.setProperty('--end-y', `${p.end[1]}px`)
        particle.style.setProperty('--time', `${p.time}ms`)
        particle.style.setProperty('--scale', `${p.scale}`)
        particle.style.setProperty('--color', `var(--color-${p.color}, white)`)
        particle.style.setProperty('--rotate', `${p.rotate}deg`)

        point.classList.add('point')
        particle.appendChild(point)
        element.appendChild(particle)

        setTimeout(() => {
          try {
            element.removeChild(particle)
          } catch {
            // Do nothing
          }
        }, t)
      }, 30)
    }
  }

  const updateEffectPosition = element => {
    if (!containerRef.current || !filterRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const pos = element.getBoundingClientRect()

    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    }
    Object.assign(filterRef.current.style, styles)
  }

  const handleClick = (e, index) => {
    const item = items[index]
    if (item?.onClick) {
      e.preventDefault()
      item.onClick(e)
    }
    if (activeIndex === index) return

    setActiveIndex(index)

    const liEl = e.currentTarget.closest('li')
    if (liEl) {
      updateEffectPosition(liEl)
    }

    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll('.particle')
      particles.forEach(p => filterRef.current.removeChild(p))
      makeParticles(filterRef.current)
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const liEl = e.currentTarget.parentElement
      if (liEl) {
        handleClick({ currentTarget: liEl }, index)
      }
    }
  }

  useEffect(() => {
    setActiveIndex(initialActiveIndex)
  }, [initialActiveIndex])

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return
    const activeLi = navRef.current.querySelectorAll('li')[activeIndex]
    if (activeLi) {
      updateEffectPosition(activeLi)
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex]
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi)
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [activeIndex])

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <nav>
        <ul ref={navRef}>
          {items.map((item, index) => {
            const isActive = activeIndex === index
            return (
              <li
                key={index}
                className={`rounded-full border transition-colors duration-300 ${
                  isActive
                    ? 'bg-white border-slate-200/80 shadow-sm dark:bg-slate-800 dark:border-slate-700'
                    : 'border-transparent'
                }`}
              >
                <a
                  href={item.href}
                  onClick={e => handleClick(e, index)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  className={`relative z-10 block px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                    isActive
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
      <span className="effect filter" ref={filterRef} />
    </div>
  )
}

export default GooeyNav