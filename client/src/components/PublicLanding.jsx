import { useState } from 'react'
import { BookOpen, Crosshair, Briefcase, Library, ChevronRight, Check, LogIn, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useInternAuth } from '../context/InternAuthContext'
import { useSiteData, useFeatures } from '../hooks/useSiteData'
import SplitText from './SplitText'
import BorderGlow from './BorderGlow'
import SpotlightCard from './SpotlightCard'
import SpecularButton from './SpecularButton'
import AnimatedCounter from './AnimatedCounter'

const statsFallback = [
  { value: '50+', label: 'Courses' },
  { value: '10k+', label: 'Developers' },
  { value: '24/7', label: 'AI Support' },
  { value: '95%', label: 'Satisfaction' },
]

const FEATURE_ICONS = { 'book-open': BookOpen, crosshair: Crosshair, briefcase: Briefcase, library: Library }

const pillarsFallback = [
  {
    icon: BookOpen,
    title: 'Learning',
    desc: 'Master modern tech stacks with project-based curricula designed by industry veterans.',
    points: ['200+ hours of interactive content', 'Real-world projects & code reviews', 'Certified career pathways'],
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    hoverBorder: 'hover:border-cyan-400 dark:hover:border-cyan-400',
    spotlight: 'rgba(6, 182, 212, 0.25)',
  },
  {
    icon: Crosshair,
    title: 'Arena',
    desc: 'Compete in timed coding battles, algorithm duels, and system design face-offs.',
    points: ['Live 1v1 & team tournaments', 'AI-powered difficulty scaling', 'Global leaderboard & ELO ranking'],
    iconColor: 'text-[#F97316]',
    hoverBorder: 'hover:border-[#F97316] dark:hover:border-[#F97316]',
    spotlight: 'rgba(249, 115, 22, 0.25)',
  },
  {
    icon: Briefcase,
    title: 'Careers',
    desc: 'From resume roast to mock interviews — we prep you for the roles you deserve.',
    points: ['Personalized job matching engine', 'Technical & behavioral mock interviews', 'Direct referrals to 300+ partners'],
    iconColor: 'text-[#22C55E]',
    hoverBorder: 'hover:border-[#22C55E] dark:hover:border-[#22C55E]',
    spotlight: 'rgba(34, 197, 94, 0.25)',
  },
  {
    icon: Library,
    title: 'Resources',
    desc: 'A growing library of cheat sheets, templates, and study guides.',
    points: ['Community-contributed playbooks', 'Weekly digest & curated newsletters', 'Open-source tooling & SDKs'],
    iconColor: 'text-[#A855F7]',
    hoverBorder: 'hover:border-[#A855F7] dark:hover:border-[#A855F7]',
    spotlight: 'rgba(168, 85, 247, 0.25)',
  },
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
    </pre>
  </div>
)

export default function PublicLanding({ onOpenAuth: _onOpenAuth }) {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { login } = useInternAuth()
  const [demoBusy, setDemoBusy] = useState(false)
  const [demoError, setDemoError] = useState('')

  // CMS-driven content with static fallbacks while DB rows load / are absent.
  const { settings } = useSiteData()
  const { features } = useFeatures()

  const heroBadge = settings?.hero_badge || '✨ Now in public beta — join 10k+ developers'
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
    ? features.map((f) => ({
        icon: FEATURE_ICONS[f.icon] || BookOpen,
        title: f.title,
        desc: f.description,
        points: Array.isArray(f.points) ? f.points : [],
        iconColor: 'text-cyan-600 dark:text-cyan-400',
        hoverBorder: 'hover:border-cyan-400 dark:hover:border-cyan-400',
        spotlight: 'rgba(6, 182, 212, 0.25)',
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

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="mt-20 px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5 text-sm text-slate-700 dark:text-slate-300 transition-colors duration-300">
            {heroBadge}
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mt-6 leading-tight">
            <span className="block">
              <SplitText tag="span" text={heroTitle1} textAlign="left" className="text-slate-900 dark:text-white" delay={45} duration={0.6} threshold={0.3} />
            </span>
            <span className="block">
              <SplitText tag="span" text={heroTitle2.split(' ')[0]} textAlign="left" className="text-slate-900 dark:text-white" delay={45} duration={0.6} threshold={0.3} />{' '}
              <span className="text-cyan-600 dark:text-cyan-400">
                <SplitText tag="span" text={heroTitle2.split(' ').slice(1).join(' ')} textAlign="left" delay={45} duration={0.6} threshold={0.3} />
              </span>
            </span>
            <span className="block">
              <SplitText tag="span" text={heroTitle3} textAlign="left" className="text-slate-900 dark:text-white" delay={45} duration={0.6} threshold={0.3} />
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg mt-4 max-w-lg transition-colors duration-300">
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
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-600 dark:text-slate-300 transition-colors duration-300">
            <span>✓ No credit card</span>
            <span>✓ Start in 60 seconds</span>
            <span>⭐ 4.9/5 from 2k+ reviews</span>
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

        {/* Code Mockup */}
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
      </section>

      {/* ─── STATS DIVIDER ─── */}
      <section className="mt-20 border-y border-slate-200 dark:border-slate-800 py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <AnimatedCounter key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </section>

      {/* ─── FOUR PILLARS ─── */}
      <section className="mt-20 mb-20 max-w-7xl mx-auto px-8">
        <div className="text-center">
          <p className="text-cyan-600 dark:text-cyan-400 text-sm tracking-widest uppercase">The Platform</p>
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {pillars.map((p) => (
            <SpotlightCard
              key={p.title}
              spotlightColor={p.spotlight}
              className={`bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors ${p.hoverBorder}`}
            >
              <p.icon className={`w-10 h-10 ${p.iconColor}`} />
              <h3 className="text-slate-900 dark:text-white text-xl font-bold mt-4 transition-colors duration-300">{p.title}</h3>
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
    </>
  )
}
