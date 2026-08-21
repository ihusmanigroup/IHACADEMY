import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight, Sparkles, Layers, Users, BadgeCheck, Bot, Trophy, Code2, Target,
} from 'lucide-react'
import { useAboutSections } from '../hooks/useSiteData'

const STAT_ICONS = [Users, Code2, Bot, Trophy]

const PILLAR_ICONS = {
  layers: Layers,
  users: Users,
  'badge-check': BadgeCheck,
}

const PILLAR_ACCENTS = {
  'pillar_1': 'from-cyan-500/15 to-blue-500/5 text-cyan-600 dark:text-cyan-400',
  'pillar_2': 'from-blue-500/15 to-indigo-500/5 text-blue-600 dark:text-blue-400',
  'pillar_3': 'from-indigo-500/15 to-purple-500/5 text-indigo-600 dark:text-indigo-400',
}

const FALLBACK_STATS = [
  { value: '10k+', label: 'Active Developers Enrolled', icon: Users },
  { value: '95%', label: 'Practical Hands-On Curriculum', icon: Code2 },
  { value: '24/7', label: 'AI Code Review & Feedback', icon: Bot },
  { value: '100+', label: 'Real-world Capstone Projects', icon: Trophy },
]

const FALLBACK_PILLARS = [
  {
    icon: Layers,
    title: 'Industry-Standard Projects',
    desc: 'Building real React, Node.js, and Python backend microservices.',
    accent: 'from-cyan-500/15 to-blue-500/5 text-cyan-600 dark:text-cyan-400',
  },
  {
    icon: Users,
    title: 'Structured Internship Cohorts',
    desc: 'Guided multi-week internships with realistic sprint tasks and code reviews.',
    accent: 'from-blue-500/15 to-indigo-500/5 text-blue-600 dark:text-blue-400',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Skills & Badging',
    desc: 'Earn cryptographically verifiable certificate badges for your portfolio.',
    accent: 'from-indigo-500/15 to-purple-500/5 text-indigo-600 dark:text-indigo-400',
  },
]

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  )
}

export default function About() {
  const { sections, loading } = useAboutSections()

  const stats = sections
    .filter((s) => s.key && s.key.startsWith('stat_'))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s, i) => {
      const [value, ...labelParts] = (s.title || '').split(' — ')
      return {
        value: s.body || value || '—',
        label: labelParts.length ? labelParts.join(' — ') : value,
        icon: STAT_ICONS[i % STAT_ICONS.length],
      }
    })

  const pillars = sections
    .filter((s) => s.key && s.key.startsWith('pillar_'))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s) => ({
      icon: PILLAR_ICONS[s.icon] || Layers,
      title: s.title,
      desc: s.body,
      accent: PILLAR_ACCENTS[s.key] || 'from-cyan-500/15 to-blue-500/5 text-cyan-600 dark:text-cyan-400',
    }))

  const showSkeleton = loading && (!sections || sections.length === 0)
  const showFallback = !loading && (!sections || sections.length === 0)

  const renderedStats = showFallback ? FALLBACK_STATS : stats
  const renderedPillars = showFallback ? FALLBACK_PILLARS : pillars

  return (
    <div className="relative overflow-hidden">
      {/* Subtle grid + glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(100,116,139,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.08) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 85% 65% at 50% 0%, black 35%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 65% at 50% 0%, black 35%, transparent 100%)',
        }}
      />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[680px] h-[440px] rounded-full bg-cyan-500/20 dark:bg-cyan-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-[420px] h-[420px] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-[460px] h-[460px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[130px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 md:px-8 py-20 md:py-28">
        {/* ─── Hero ─── */}
        <Reveal className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 dark:border-cyan-400/30 bg-cyan-500/10 dark:bg-cyan-500/10 px-4 py-1.5 text-xs font-bold tracking-widest text-cyan-700 dark:text-cyan-300">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-cyan-500" />
            </span>
            REVOLUTIONIZING TECH EDUCATION
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Empowering Next-Gen{' '}
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Software Engineers
            </span>{' '}
            &amp; AI Innovators
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            IH Academy bridges the gap between traditional learning and real-world software production
            through interactive coding arenas, mentored internships, and AI-driven skill tracking.
          </p>
        </Reveal>

        {/* ─── Impact Metrics ─── */}
        <div className="mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {showSkeleton
            ? Array.from({ length: 4 }).map((_, i) => (
                <Reveal key={i} delay={i * 90}>
                  <div className="rounded-2xl bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
                    <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-4 h-9 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-2 h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                </Reveal>
              ))
            : renderedStats.map(({ value, label, icon: Icon }, i) => (
            <Reveal key={label} delay={i * 90}>
              <div className="group relative h-full rounded-2xl bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50 dark:hover:border-cyan-400/40 hover:shadow-[0_12px_40px_-12px_rgba(6,182,212,0.35)]">
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Icon className="w-5 h-5 text-cyan-500 mb-4" />
                <p className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  {value}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-snug">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ─── Core Pillars ─── */}
        <div className="mt-20 md:mt-24">
          <Reveal className="text-center">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">
              <Sparkles className="w-4 h-4" /> Why Choose Us
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Built on Three Core Pillars
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-sm md:text-base text-slate-600 dark:text-slate-400">
              Everything we build is engineered around outcomes that actually get you hired.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {showSkeleton
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Reveal key={i} delay={i * 110}>
                    <div className="rounded-2xl bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 p-7 animate-pulse">
                      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
                      <div className="mt-5 h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="mt-2.5 space-y-2">
                        <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
                      </div>
                    </div>
                  </Reveal>
                ))
              : renderedPillars.map(({ icon: Icon, title, desc, accent }, i) => (
              <Reveal key={title} delay={i * 110}>
                <div className="group relative h-full rounded-2xl bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 p-7 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_48px_-16px_rgba(6,182,212,0.4)]">
                  <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-2xl group-hover:bg-cyan-500/20 dark:group-hover:bg-cyan-500/10 transition-colors duration-300 pointer-events-none" />
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${accent.split(' ').slice(0, 2).join(' ')}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                  <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
                  <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Target className="w-3.5 h-3.5" /> Outcome-first curriculum
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ─── CTA Banner ─── */}
        <Reveal delay={120}>
          <div className="relative mt-20 md:mt-24 rounded-3xl overflow-hidden border border-cyan-500/30 dark:border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-indigo-500/15 dark:from-cyan-500/10 dark:via-blue-500/5 dark:to-indigo-500/10 p-10 md:p-14 text-center">
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'linear-gradient(rgba(6,182,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.08) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }} />
            <div className="relative">
              <Sparkles className="w-8 h-8 mx-auto text-cyan-500 mb-4" />
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Ready to accelerate your <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">tech career?</span>
              </h2>
              <p className="mt-4 max-w-lg mx-auto text-sm md:text-base text-slate-600 dark:text-slate-400">
                Join thousands of developers building production-grade skills — starting today.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-7 py-3.5 rounded-xl text-sm shadow-[0_0_24px_rgba(6,182,212,0.35)] hover:shadow-[0_0_32px_rgba(6,182,212,0.5)] transition-all hover:-translate-y-0.5"
                >
                  Explore Courses <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/internship"
                  className="inline-flex items-center gap-2 border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 text-slate-900 dark:text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:border-cyan-400/60"
                >
                  Join Next Internship <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}