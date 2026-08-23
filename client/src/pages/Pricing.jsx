import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  GraduationCap,
  Rocket,
  Crown,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Award,
  BadgePercent,
  ArrowRight,
} from 'lucide-react'
import SpotlightCard from '../components/SpotlightCard'
import Skeleton from '../components/Skeleton'
import { useAuth } from '../context/AuthContext'
import { usePricing } from '../hooks/usePricing'
import { useFaqs } from '../hooks/useSiteData'
import { recordTransaction } from '../lib/transactions'

const PLAN_ICONS = {
  free: GraduationCap,
  pro: Rocket,
  exclusive: Crown,
}

const PLAN_THEME = {
  free: {
    accent: 'from-slate-400 to-slate-600',
    spotlight: 'rgba(148, 163, 184, 0.22)',
    badgeClass: 'bg-slate-800 text-white',
    iconTile: 'from-slate-500 to-slate-700 shadow-slate-500/30',
    check: 'text-slate-500 dark:text-slate-400',
    checkBg: 'bg-slate-500/10',
    cta: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25',
    cardRing: '',
    cardScale: '',
    nameText: 'text-slate-900 dark:text-white',
  },
  pro: {
    accent: 'from-cyan-400 via-cyan-500 to-blue-600',
    spotlight: 'rgba(6, 182, 212, 0.25)',
    badgeClass: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/40',
    iconTile: 'from-cyan-400 to-blue-600 shadow-cyan-500/40',
    check: 'text-cyan-600 dark:text-cyan-400',
    checkBg: 'bg-cyan-500/10',
    cta: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30',
    cardRing: 'ring-2 ring-cyan-400/60 dark:ring-cyan-400/50 shadow-2xl shadow-cyan-500/20',
    cardScale: 'md:-translate-y-3 md:scale-[1.02]',
    nameText: 'text-slate-900 dark:text-white',
  },
  exclusive: {
    accent: 'from-amber-300 via-amber-400 to-orange-500',
    spotlight: 'rgba(245, 158, 11, 0.22)',
    badgeClass: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/40',
    iconTile: 'from-amber-300 to-orange-500 shadow-amber-500/40',
    check: 'text-amber-400',
    checkBg: 'bg-amber-400/10',
    cta: 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/30',
    cardRing: 'ring-1 ring-amber-400/40 shadow-2xl shadow-amber-500/20',
    cardScale: '',
    nameText: 'text-white',
  },
}

const FAQ_FALLBACK = [
  {
    question: 'What do the Pro and Exclusive plans unlock?',
    answer:
      'The Pro plan ($70/year) unlocks 3 Major Paid Courses, IH Usmani Group AI product discount vouchers/coupons, and exclusive PDF eBook access. The Exclusive plan ($200/year) includes all Pro features plus Discord/community access, priority AI vouchers, and 1-on-1 mentorship.',
  },
  {
    question: 'Is this a recurring subscription?',
    answer:
      'Yes — both paid plans are billed annually. You pay once per year and keep access to every course and perk your plan unlocks for that year.',
  },
  {
    question: 'Can I upgrade from Pro to Exclusive later?',
    answer:
      'Yes. Upgrade to Exclusive anytime and unlock Discord access, priority AI vouchers, and 1-on-1 mentorship immediately.',
  },
  {
    question: 'What are the IH Usmani Group AI discount vouchers?',
    answer:
      'Pro and Exclusive members get periodic discount coupons/vouchers for IH Usmani Group AI products — redeemable directly from the dashboard. Exclusive members get priority access to the best offers.',
  },
]

const PERKS = [
  { icon: BadgePercent, label: 'Annual billing — big savings' },
  { icon: ShieldCheck, label: 'Access to all unlocked content' },
  { icon: Award, label: 'Certificate on every completed course' },
  { icon: Sparkles, label: 'AI vouchers & eBooks for paid members' },
]

export default function Pricing({ onOpenAuth }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [openFaq, setOpenFaq] = useState(0)

  const { plans, loading: plansLoading } = usePricing()
  const { faqs: dbFaqs, loading: faqsLoading } = useFaqs()
  const faqs = dbFaqs && dbFaqs.length ? dbFaqs.map((f) => ({ question: f.question, answer: f.answer })) : FAQ_FALLBACK

  const PLANS = plans.map((plan) => {
    const id = PLAN_ICONS[plan.id] ? plan.id : 'pro'
    return {
      ...plan,
      theme: PLAN_THEME[id],
      icon: PLAN_ICONS[plan.id] || Rocket,
      dark: !!plan.isExclusive,
    }
  })

  const handleCta = async (plan) => {
    if (user) {
      try {
        await recordTransaction({
          item_type: 'plan',
          item_name: plan.name,
          amount: plan.numericPrice,
        })
      } catch (err) {
        console.warn('Plan transaction skipped:', (err && err.message) || err)
      }
      navigate('/courses')
    } else if (onOpenAuth) onOpenAuth()
    else navigate('/courses')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#07090e] dark:via-[#07090e] dark:to-[#0b1220] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[820px] rounded-full bg-cyan-400/15 dark:bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-64 -left-24 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute top-96 -right-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.06)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4">
        {/* ------------------------------ Hero ------------------------------ */}
        <div className="text-center pt-14 pb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            Pricing
          </span>
          <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-cyan-100 dark:to-white bg-clip-text text-transparent">
              Simple, one-time pricing.
            </span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Start free, or go all-in. No subscriptions, no hidden fees —{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-200">pay once, learn forever.</span>
          </p>
        </div>

        {/* ------------------------------ Plans ----------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6 items-stretch pt-10 pb-8 max-w-5xl mx-auto">
          {plansLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-slate-200 dark:border-slate-800 p-7 space-y-5 bg-white dark:bg-[#0f1420]/60 min-h-[480px]">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <Skeleton className="w-2/3 h-7" />
                  <Skeleton className="w-1/2 h-12" />
                  <Skeleton className="w-full h-4" lines={4} />
                  <Skeleton className="w-full h-12 rounded-xl mt-auto" />
                </div>
              ))
            : PLANS.map((plan) => {
                const t = plan.theme
                return (
                  <SpotlightCard
                    key={plan.id}
                    spotlightColor={t.spotlight}
                    clipOverflow={false}
                    className={`group relative flex flex-col rounded-3xl p-7 pt-10 border transition-all duration-300 hover:-translate-y-1.5 ${t.cardScale} ${t.cardRing} ${
                      plan.dark
                        ? 'border-transparent bg-gradient-to-b from-[#101827] via-[#0b1220] to-[#080d16] text-white'
                        : 'border-slate-200/90 dark:border-slate-700/60 bg-white dark:bg-[#0f1420]/80 text-slate-900 dark:text-white shadow-xl shadow-slate-900/5'
                    }`}
                  >
                    {/* Top accent */}
                    <div className={`pointer-events-none absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r ${t.accent}`} />

                    {/* Ribbon badge */}
                    {(plan.isPopular || plan.isExclusive) && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest rounded-full whitespace-nowrap ${t.badgeClass}`}>
                          {plan.isExclusive ? <Crown className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                          {plan.isExclusive ? 'Exclusive All-Access' : 'Most Popular'}
                        </span>
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br ${t.iconTile} flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                        <plan.icon className="w-5 h-5" strokeWidth={2.2} />
                      </div>
                      <h2 className="text-xl font-bold tracking-tight">{plan.name}</h2>
                    </div>

                    {/* Price */}
                    <div className="mt-6 flex flex-wrap items-end gap-x-2.5 gap-y-1">
                      {plan.originalPrice && (
                        <span className="text-lg font-semibold line-through text-slate-400 dark:text-slate-500 mb-1">{plan.originalPrice}</span>
                      )}
                      <span className="text-5xl font-extrabold tracking-tight leading-none">{plan.price}</span>
                      <span className={`text-sm font-medium mb-0.5 ${plan.dark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        / {plan.period}
                      </span>
                    </div>

                    {/* Save chip */}
                    {plan.originalPrice && (
                      <span className="mt-3 inline-flex w-fit items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                        <BadgePercent className="w-3.5 h-3.5" />
                        Save ${Number(plan.originalPrice.replace(/[^0-9]/g, '')) - Number(plan.price.replace(/[^0-9]/g, ''))} — {Math.round((1 - Number(plan.price.replace(/[^0-9]/g, '')) / Number(plan.originalPrice.replace(/[^0-9]/g, ''))) * 100)}% off
                      </span>
                    )}

                    <p className={`mt-4 text-sm leading-relaxed ${plan.dark ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
                      {plan.description}
                    </p>

                    <div className={`my-6 h-px ${plan.dark ? 'bg-white/10' : 'bg-slate-200/80 dark:bg-slate-700/50'}`} />

                    {/* Features */}
                    <ul className="space-y-3.5 mb-8 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-sm leading-snug">
                          <span className={`mt-0.5 w-5 h-5 shrink-0 rounded-full ${t.checkBg} flex items-center justify-center`}>
                            <Check className={`w-3 h-3 ${t.check}`} strokeWidth={3} />
                          </span>
                          <span className={plan.dark ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={() => handleCta(plan)}
                      className={`w-full font-bold py-3.5 rounded-2xl transition-all duration-300 text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 ${t.cta}`}
                    >
                      {plan.buttonText}
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </button>
                  </SpotlightCard>
                )
              })}
        </div>

        {/* --------------------------- Perks strip --------------------------- */}
        <div className="max-w-5xl mx-auto rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-white/70 dark:bg-[#0f1420]/70 backdrop-blur-md px-6 py-6 shadow-xl shadow-slate-900/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            {PERKS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 justify-center sm:justify-start">
                <span className="w-9 h-9 shrink-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                </span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ------------------------------- FAQ ------------------------------- */}
        <div className="mt-16 mb-14 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Everything you need to know before picking a plan.</p>
          </div>
          <div className="space-y-3">
            {faqsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-2 bg-white dark:bg-[#0f1420]/60">
                    <Skeleton className="w-3/4 h-4" />
                    <Skeleton className="w-full h-3" lines={2} />
                  </div>
                ))
              : faqs.map((item, i) => {
                  const open = openFaq === i
                  return (
                    <div
                      key={item.question}
                      className={`rounded-2xl border transition-all duration-300 bg-white dark:bg-[#0f1420]/60 ${
                        open
                          ? 'border-cyan-500/40 dark:border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                          : 'border-slate-200/90 dark:border-slate-700/60'
                      }`}
                    >
                      <button
                        onClick={() => setOpenFaq(open ? -1 : i)}
                        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                      >
                        <span className="font-semibold text-[15px] text-slate-900 dark:text-slate-100">{item.question}</span>
                        <span className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${
                          open ? 'bg-cyan-500/10 rotate-180' : 'bg-slate-100 dark:bg-slate-800'
                        }`}>
                          <ChevronDown className={`w-4 h-4 transition-colors ${open ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`} />
                        </span>
                      </button>
                      <div className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                          <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
          </div>
        </div>
      </div>
    </div>
  )
}
