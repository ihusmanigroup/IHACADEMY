import { useState } from 'react'
import {
  BookOpen, Crosshair, Briefcase, Library, ChevronRight, Check, LogIn, Loader2,
  Sparkles, Trophy, ArrowRight, Star, Zap, ShieldCheck, Code2, Rocket, Swords,
  Users, Brain, Quote,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useInternAuth } from '../context/InternAuthContext'
import { useSiteData, useFeatures } from '../hooks/useSiteData'
import SplitText from './SplitText'
import BorderGlow from './BorderGlow'
import SpotlightCard from './SpotlightCard'
import SpecularButton from './SpecularButton'
import AnimatedCounter from './AnimatedCounter'
import './publicLanding.css'

const statsFallback = [
  { value: '50+', label: 'Courses', icon: Library },
  { value: '10k+', label: 'Developers', icon: Users },
  { value: '24/7', label: 'AI Support', icon: Brain },
  { value: '95%', label: 'Satisfaction', icon: Trophy },
]

const FEATURE_ICONS = { 'book-open': BookOpen, crosshair: Crosshair, briefcase: Briefcase, library: Library }

const pillarsFallback = [
  {
    icon: BookOpen,
    title: 'Learning',
    desc: 'Master modern tech stacks with project-based curricula designed by industry veterans.',
    points: ['200+ hours of interactive content', 'Real-world projects & code reviews', 'Certified career pathways'],
    to: '/courses',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    hoverBorder: 'hover:border-cyan-400 dark:hover:border-cyan-400',
    spotlight: 'rgba(6, 182, 212, 0.25)',
    tile: 'from-cyan-500/15 to-cyan-500/5 border-cyan-500/25',
  },
  {
    icon: Crosshair,
    title: 'Arena',
    desc: 'Compete in timed coding battles, algorithm duels, and system design face-offs.',
    points: ['Live 1v1 & team tournaments', 'AI-powered difficulty scaling', 'Global leaderboard & ELO ranking'],
    to: '/arena',
    iconColor: 'text-orange-600 dark:text-orange-400',
    hoverBorder: 'hover:border-orange-400 dark:hover:border-orange-400',
    spotlight: 'rgba(249, 115, 22, 0.25)',
    tile: 'from-orange-500/15 to-orange-500/5 border-orange-500/25',
  },
  {
    icon: Briefcase,
    title: 'Careers',
    desc: 'From resume roast to mock interviews — we prep you for the roles you deserve.',
    points: ['Personalized job matching engine', 'Technical & behavioral mock interviews', 'Direct referrals to 300+ partners'],
    to: '/careers',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-400',
    spotlight: 'rgba(34, 197, 94, 0.25)',
    tile: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/25',
  },
  {
    icon: Library,
    title: 'Resources',
    desc: 'A growing library of cheat sheets, templates, and study guides.',
    points: ['Community-contributed playbooks', 'Weekly digest & curated newsletters', 'Open-source tooling & SDKs'],
    to: '/resources',
    iconColor: 'text-violet-600 dark:text-violet-400',
    hoverBorder: 'hover:border-violet-400 dark:hover:border-violet-400',
    spotlight: 'rgba(168, 85, 247, 0.25)',
    tile: 'from-violet-500/15 to-violet-500/5 border-violet-500/25',
  },
]

const journeySteps = [
  {
    icon: BookOpen,
    step: '01',
    title: 'Learn by building',
    desc: 'Follow structured, project-based tracks with an AI mentor reviewing every line you ship.',
    accent: 'text-cyan-600 dark:text-cyan-400',
    tile: 'from-cyan-500/15 to-cyan-500/5 border-cyan-500/25',
    glow: 'bg-cyan-500/20',
  },
  {
    icon: Swords,
    step: '02',
    title: 'Compete in the Arena',
    desc: 'Prove your skills in timed coding battles and climb a global ELO leaderboard.',
    accent: 'text-orange-600 dark:text-orange-400',
    tile: 'from-orange-500/15 to-orange-500/5 border-orange-500/25',
    glow: 'bg-orange-500/20',
  },
  {
    icon: Rocket,
    step: '03',
    title: 'Get hired',
    desc: 'Match with 300+ hiring partners through job matching, mock interviews, and referrals.',
    accent: 'text-violet-600 dark:text-violet-400',
    tile: 'from-violet-500/15 to-violet-500/5 border-violet-500/25',
    glow: 'bg-violet-500/20',
  },
]

const testimonials = [
  {
    quote: 'IH Academy took me from tutorial hell to a signed offer in five months. The Arena is genuinely addictive.',
    name: 'Aarav Sharma',
    role: 'Frontend Developer',
    initials: 'AS',
    tile: 'from-cyan-500 to-blue-600',
  },
  {
    quote: 'The AI mentor reviews every project like a senior engineer would. Nothing else I tried even comes close.',
    name: 'Priya Patel',
    role: 'Full-Stack Intern → Junior Dev',
    initials: 'PP',
    tile: 'from-violet-500 to-fuchsia-600',
  },
  {
    quote: 'I climbed from Rank 400 to the global Top 10. Recruiters started reaching out to me instead.',
    name: 'Daniel Kim',
    role: 'Backend Engineer',
    initials: 'DK',
    tile: 'from-emerald-500 to-teal-600',
  },
]

const marqueeItems = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Next.js', 'TensorFlow',
  'PostgreSQL', 'Docker', 'AWS', 'OpenAI API', 'Tailwind CSS', 'Git & GitHub',
]

const codeMockup = (
  <div className="bg-[#0f1420] border border-slate-800 rounded-xl shadow-2xl p-4 transition-colors duration-300">
    <div className="flex items-center gap-2 mb-4">
      <span className="w-3 h-3 rounded-full bg-red-500" />
      <span className="w-3 h-3 rounded-full bg-yellow-500" />
      <span className="w-3 h-3 rounded-full bg-green-500" />
      <span className="flex-1 text-center text-xs text-slate-400">ih-academy / app.tsx</span>
    </div>
    <pre className="text-sm leading-relaxed overflow-x-auto">
      <span className="text-purple-400">import</span><span className="text-slate-100"> </span><span className="text-green-400">{'{'}</span><span className="text-slate-100"> Learn, Arena, Career, Resources </span><span className="text-green-400">{'}'}</span><span className="text-slate-100"> </span><span className="text-purple-400">from</span><span className="text-slate-100"> </span><span className="text-green-400">'ih-academy'</span><span className="text-slate-100">;</span>
      {'\n'}
      <span className="text-purple-400">import</span><span className="text-slate-100"> </span><span className="text-green-400">{'{'}</span><span className="text-slate-100"> Brain, Trophy, Briefcase, Book </span><span className="text-green-400">{'}'}</span><span className="text-slate-100"> </span><span className="text-purple-400">from</span><span className="text-slate-100"> </span><span className="text-green-400">'lucide-react'</span><span className="text-slate-100">;</span>
      {'\n\n'}
      <span className="text-purple-400">const</span><span className="text-slate-100"> skills = </span><span className="text-blue-400">await</span><span className="text-slate-100"> </span><span className="text-yellow-400">Developer</span><span className="text-slate-100">.</span><span className="text-yellow-400">learn</span><span className="text-slate-100">(</span><span className="text-green-400">'fullstack'</span><span className="text-slate-100">);</span>
      {'\n'}
      <span className="text-purple-400">const</span><span className="text-slate-100"> rank = </span><span className="text-blue-400">await</span><span className="text-slate-100"> </span><span className="text-yellow-400">Arena</span><span className="text-slate-100">.</span><span className="text-yellow-400">compete</span><span className="text-slate-100">(skills);</span>
      {'\n'}
      <span className="text-purple-400">const</span><span className="text-slate-100"> job = </span><span className="text-blue-400">await</span><span className="text-slate-100"> </span><span className="text-yellow-400">Career</span><span className="text-slate-100">.</span><span className="text-yellow-400">match</span><span className="text-slate-100">(rank);</span>
      {'\n\n'}
      <span className="text-slate-500 italic">// 🚀 From code to career in one pipeline</span>
      <span className="ih-cursor inline-block w-2 h-4 ml-1 align-middle bg-cyan-400" />
    </pre>
    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      Live — 2,847 developers learning right now
    </div>
  </div>
)

const avatarTiles = [
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-fuchsia-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',
]
const avatarInitials = ['AS', 'PP', 'DK', 'MR', 'ZK']

export default function PublicLanding({ onOpenAuth: _onOpenAuth }) {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { login } = useInternAuth()
  const [demoBusy, setDemoBusy] = useState(false)
  const [demoError, setDemoError] = useState('')

  // CMS-driven content with static fallbacks while DB rows load / are absent.
  const { settings } = useSiteData()
  const { features } = useFeatures()

  const heroBadge = settings?.hero_badge || 'Now in public beta — join 10k+ developers'
  const heroTitle1 = settings?.hero_title_line_1 || 'Master Tech.'
  const heroTitle2 = settings?.hero_title_line_2 || 'Enter the Arena.'
  const heroTitle3 = settings?.hero_title_line_3 || 'Land the Job.'
  const heroSubtitle =
    settings?.hero_subtitle ||
    'The ultimate ecosystem for developers. Learn cutting-edge skills, compete in real-world challenges, and get hired.'
  const ctaPrimary = settings?.cta_primary_text || 'Start Learning Free'
  const ctaSecondary = settings?.cta_secondary_text || 'Enter the Arena'

  // DB-backed pillars, falling back to the static feature set.
  const pillars = features && features.length
    ? features.map((f, i) => ({
        icon: FEATURE_ICONS[f.icon] || BookOpen,
        title: f.title,
        desc: f.description,
        points: Array.isArray(f.points) ? f.points : [],
        to: f.to || '#',
        iconColor: 'text-cyan-600 dark:text-cyan-400',
        hoverBorder: 'hover:border-cyan-400 dark:hover:border-cyan-400',
        spotlight: 'rgba(6, 182, 212, 0.25)',
        tile: pillarsFallback[i % pillarsFallback.length].tile,
      }))
    : pillarsFallback

  const stats = statsFallback

  // Temporary: one-click demo sign-in straight into the intern portal.
  const demoSignIn = async () => {
    setDemoBusy(true)
    setDemoError('')
    try {
      const res = await login('intern@ih.com', 'password123')
      if (res.success) {
        navigate('/intern-portal')
      } else {
        setDemoError(res.error || 'Demo login failed')
      }
    } finally {
      setDemoBusy(false)
    }
  }

  const title2Words = heroTitle2.split(' ')
  const title2Accent = title2Words.slice(1).join(' ')

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        {/* Aurora backdrop + blueprint grid */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="ih-hero-grid absolute inset-0" />
          <div className={`ih-orb ih-orb-1 w-[480px] h-[480px] -top-32 -left-24 ${isDark ? 'bg-cyan-500/15' : 'bg-cyan-400/20'}`} />
          <div className={`ih-orb ih-orb-2 w-[420px] h-[420px] top-10 right-[-120px] ${isDark ? 'bg-indigo-500/15' : 'bg-indigo-400/20'}`} />
          <div className={`ih-orb ih-orb-3 w-[380px] h-[380px] bottom-[-140px] left-1/3 ${isDark ? 'bg-violet-500/10' : 'bg-violet-400/15'}`} />
        </div>

        <div className="relative mt-20 px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-white/70 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-full pl-3 pr-4 py-1.5 text-sm text-slate-700 dark:text-slate-300 transition-colors duration-300 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-70" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              {heroBadge}
            </span>

            <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight mt-6 leading-[1.08]">
              <span className="block">
                <SplitText tag="span" text={heroTitle1} textAlign="left" className="text-slate-900 dark:text-white" delay={45} duration={0.6} threshold={0.3} />
              </span>
              <span className="block">
                <SplitText tag="span" text={title2Words[0]} textAlign="left" className="text-slate-900 dark:text-white" delay={45} duration={0.6} threshold={0.3} />{' '}
                {title2Accent && (
                  <span className="ih-gradient-text">{title2Accent}</span>
                )}
              </span>
              <span className="block">
                <SplitText tag="span" text={heroTitle3} textAlign="left" className="text-slate-900 dark:text-white" delay={45} duration={0.6} threshold={0.3} />
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-lg mt-5 max-w-lg transition-colors duration-300">
              {heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <SpecularButton
                size="lg"
                radius={14}
                tint={isDark ? '#06B6D4' : '#0891B2'}
                tintOpacity={1}
                blur={0}
                textColor={isDark ? '#083344' : '#ffffff'}
                lineColor={isDark ? '#A5F3FC' : '#67E8F9'}
                baseColor={isDark ? '#06B6D4' : '#0891B2'}
                intensity={1}
                shineSize={10}
                shineFade={40}
                thickness={1.2}
                speed={0.35}
                followMouse
                proximity={250}
                onClick={() => navigate('/courses')}
              >
                <span className="inline-flex items-center gap-2">
                  {ctaPrimary} <ChevronRight className="w-4 h-4" />
                </span>
              </SpecularButton>
              <SpecularButton
                size="lg"
                radius={14}
                tint={isDark ? '#94A3B8' : '#0F172A'}
                tintOpacity={0.4}
                blur={0}
                textColor={isDark ? '#CBD5E1' : '#334155'}
                lineColor={isDark ? '#475569' : '#CBD5E1'}
                baseColor={isDark ? '#1E293B' : '#E2E8F0'}
                intensity={1}
                shineSize={10}
                shineFade={40}
                thickness={1.2}
                speed={0.35}
                followMouse
                proximity={250}
                onClick={() => navigate('/arena')}
              >
                {ctaSecondary} ⚔️
              </SpecularButton>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-6">
              <div className="flex -space-x-2.5">
                {avatarInitials.map((ini, i) => (
                  <span
                    key={ini}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarTiles[i]} ring-2 ring-white dark:ring-[#090d16] flex items-center justify-center text-[10px] font-bold text-white`}
                  >
                    {ini}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 ml-1">4.9/5</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">from 2,000+ reviews · 10k+ developers</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-xs text-slate-600 dark:text-slate-300 transition-colors duration-300">
              <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> No credit card</span>
              <span className="inline-flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> Start in 60 seconds</span>
              <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-cyan-500" /> Cancel anytime</span>
            </div>

            <div className="mt-6">
              <button
                onClick={demoSignIn}
                disabled={demoBusy}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-sky-400/60 bg-sky-500/5 px-4 py-2.5 text-sm font-semibold text-sky-700 dark:text-cyan-300 transition-all hover:border-sky-500 hover:bg-sky-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {demoBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                {demoBusy ? 'Signing in as demo intern...' : 'Demo sign-in — try the Intern Portal'}
              </button>
              {demoError && <p className="mt-2 text-xs text-red-500">{demoError}</p>}
            </div>
          </div>

          {/* Code Mockup + floating achievement chips */}
          <div className="relative">
            <BorderGlow
              edgeSensitivity={30}
              glowColor="187 92 43"
              backgroundColor="#18181B"
              borderRadius={14}
              glowRadius={40}
              glowIntensity={1}
              coneSpread={25}
              animated
              colors={['#06B6D4', '#6366F1', '#22D3EE']}
            >
              {codeMockup}
            </BorderGlow>

            <div className="ih-float hidden lg:flex absolute -top-6 -right-4 items-center gap-2.5 bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-700/70 rounded-2xl shadow-xl px-4 py-3">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-orange-500" />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Global Rank #12</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Arena leaderboard</p>
              </div>
            </div>

            <div className="ih-float ih-float-d1 hidden lg:flex absolute -bottom-7 -left-6 items-center gap-2.5 bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-700/70 rounded-2xl shadow-xl px-4 py-3">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-emerald-500" />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Job matched · 96%</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Career engine</p>
              </div>
            </div>

            <div className="ih-float ih-float-d2 hidden lg:flex absolute top-1/2 -right-8 items-center gap-2.5 bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-700/70 rounded-2xl shadow-xl px-4 py-3">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 border border-violet-500/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-violet-500" />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">+250 XP</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">12-day streak 🔥</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TECH MARQUEE ─── */}
      <section className="mt-20 border-y border-slate-200 dark:border-slate-800/80 py-5 transition-colors duration-300">
        <div className="ih-marquee">
          <div className="ih-marquee-track items-center gap-10 pr-10">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="flex items-center gap-10 text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap"
                aria-hidden={i >= marqueeItems.length}
              >
                {item}
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="mt-16">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-600/10 border border-cyan-500/20 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </span>
              <AnimatedCounter value={s.value} label={s.label} />
            </div>
          ))}
        </div>
      </section>

      {/* ─── FOUR PILLARS ─── */}
      <section className="mt-24 max-w-7xl mx-auto px-8">
        <div className="text-center">
          <p className="text-cyan-600 dark:text-cyan-400 text-sm tracking-widest uppercase font-semibold">The Platform</p>
          <div className="mt-2">
            <SplitText
              tag="h2"
              text="Four pillars, one ecosystem. Zero limits."
              className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white"
              textAlign="center"
              delay={50}
              duration={0.7}
              threshold={0.2}
            />
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
            Everything you need to go from curious beginner to hired engineer — in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {pillars.map((p) => (
            <SpotlightCard
              key={p.title}
              spotlightColor={p.spotlight}
              onClick={() => p.to && p.to !== '#' && navigate(p.to)}
              className={`group cursor-pointer bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-black/40 ${p.hoverBorder}`}
            >
              <div className="flex items-start justify-between">
                <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br border flex items-center justify-center ${p.tile}`}>
                  <p.icon className={`w-6 h-6 ${p.iconColor}`} />
                </span>
                <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 transition-all duration-300 group-hover:text-cyan-500 group-hover:translate-x-1" />
              </div>
              <h3 className="text-slate-900 dark:text-white text-xl font-bold mt-5 transition-colors duration-300">{p.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm transition-colors duration-300">{p.desc}</p>
              <ul className="mt-4 space-y-2">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300">
                    <Check className="w-4 h-4 mt-0.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="mt-24 max-w-7xl mx-auto px-8">
        <div className="text-center">
          <p className="text-cyan-600 dark:text-cyan-400 text-sm tracking-widest uppercase font-semibold">The Pipeline</p>
          <div className="mt-2">
            <SplitText
              tag="h2"
              text="From zero to hired in three moves."
              className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white"
              textAlign="center"
              delay={50}
              duration={0.7}
              threshold={0.2}
            />
          </div>
        </div>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="hidden md:block absolute top-14 left-[18%] right-[18%] border-t-2 border-dashed border-slate-200 dark:border-slate-800" aria-hidden="true" />
          {journeySteps.map((s) => (
            <div
              key={s.step}
              className="relative bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-black/40"
            >
              <div className="relative inline-flex">
                <span className={`absolute inset-0 rounded-2xl blur-xl ${s.glow}`} aria-hidden="true" />
                <span className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br border flex items-center justify-center mx-auto ${s.tile}`}>
                  <s.icon className={`w-6 h-6 ${s.accent}`} />
                </span>
              </div>
              <p className="text-6xl font-extrabold text-slate-200 dark:text-slate-700 mt-4 select-none">{s.step}</p>
              <h3 className="text-slate-900 dark:text-white text-lg font-bold -mt-6">{s.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="mt-24 max-w-7xl mx-auto px-8">
        <div className="text-center">
          <p className="text-cyan-600 dark:text-cyan-400 text-sm tracking-widest uppercase font-semibold">Wall of Love</p>
          <div className="mt-2">
            <SplitText
              tag="h2"
              text="Loved by developers worldwide."
              className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white"
              textAlign="center"
              delay={50}
              duration={0.7}
              threshold={0.2}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-black/40"
            >
              <Quote className="w-7 h-7 text-cyan-500/60 dark:text-cyan-400/40" />
              <div className="flex items-center gap-1 mt-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed mt-3 flex-1">"{t.quote}"</p>
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <span className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.tile} flex items-center justify-center text-xs font-bold text-white`}>
                  {t.initials}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="mt-24 mb-24 max-w-7xl mx-auto px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-900 px-8 py-16 md:py-20 text-center shadow-2xl">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="ih-hero-grid absolute inset-0 opacity-40" />
            <div className="ih-orb ih-orb-1 w-96 h-96 -top-24 -right-16 bg-white/10" />
            <div className="ih-orb ih-orb-2 w-72 h-72 -bottom-24 -left-10 bg-cyan-300/20" />
          </div>
          <div className="relative">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur rounded-full px-4 py-1.5 text-xs font-semibold text-cyan-100 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Free to start
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-6 leading-tight">
              Your career won't wait.<br className="hidden md:block" /> Neither should you.
            </h2>
            <p className="text-cyan-100/90 text-lg mt-4 max-w-xl mx-auto">
              Join 10,000+ developers learning, competing, and landing jobs on IH Academy — starting today, for free.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button
                onClick={() => navigate('/register')}
                className="inline-flex cursor-pointer items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                {ctaPrimary} <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/arena')}
                className="inline-flex cursor-pointer items-center gap-2 bg-white/10 border border-white/30 text-white font-bold px-7 py-3.5 rounded-xl backdrop-blur hover:bg-white/20 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                {ctaSecondary} ⚔️
              </button>
            </div>
            <p className="text-cyan-200/80 text-xs mt-6 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> No credit card required · <Code2 className="w-3.5 h-3.5" /> Build from day one
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
