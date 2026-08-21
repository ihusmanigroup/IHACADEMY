import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, GraduationCap, Rocket, Crown, ChevronDown } from 'lucide-react'
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

const PLAN_ACCENTS = {
  free: { accent: 'from-slate-500 to-slate-700', spotlight: 'rgba(148, 163, 184, 0.22)' },
  pro: { accent: 'from-cyan-500 to-blue-600', spotlight: 'rgba(6, 182, 212, 0.25)' },
  exclusive: { accent: 'from-amber-400 to-orange-600', spotlight: 'rgba(245, 158, 11, 0.22)' },
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

export default function Pricing({ onOpenAuth }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [openFaq, setOpenFaq] = useState(0)

  const { plans, loading: plansLoading } = usePricing()
  const { faqs: dbFaqs, loading: faqsLoading } = useFaqs()
  const faqs = dbFaqs && dbFaqs.length ? dbFaqs.map((f) => ({ question: f.question, answer: f.answer })) : FAQ_FALLBACK

  const PLANS = plans.map((plan) => {
    const icon = PLAN_ICONS[plan.id] || Rocket
    const style = PLAN_ACCENTS[plan.id] || PLAN_ACCENTS.pro
    return {
      ...plan,
      icon,
      accent: style.accent,
      spotlight: style.spotlight,
    }
  })

  const handleCta = async (plan) => {
    if (user) {
      // Record the plan selection in billing history, then send the user on.
      try {
        await recordTransaction({
          item_type: 'plan',
          item_name: plan.name,
          amount: plan.numericPrice,
        })
      } catch (err) {
        // Never block the flow if the ledger write fails.
        console.warn('Plan transaction skipped:', (err && err.message) || err)
      }
      navigate('/courses')
    } else if (onOpenAuth) onOpenAuth()
    else navigate('/courses')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <p className="text-cyan-600 dark:text-cyan-400 text-sm tracking-widest uppercase font-semibold">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-2 text-slate-900 dark:text-white">
            Simple, one-time pricing.
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-3 max-w-2xl mx-auto text-sm md:text-base">
            Start free, or go all-in. No subscriptions, no hidden fees — pay once, learn forever.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 pt-10 pb-8">
          {plansLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                  <Skeleton className="w-11 h-11 rounded-xl" />
                  <Skeleton className="w-2/3 h-6" />
                  <Skeleton className="w-1/2 h-10" />
                  <Skeleton className="w-full h-4" lines={3} />
                  <Skeleton className="w-full h-11 rounded-xl" />
                </div>
              ))
            : PLANS.map((plan) => (
                <SpotlightCard
                  key={plan.id}
                  spotlightColor={plan.spotlight}
                  clipOverflow={false}
                  className={`relative rounded-3xl p-6 pt-9 flex flex-col justify-between border transition-all duration-300 hover:-translate-y-1 ${plan.cardBg}`}
                >
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                  <span className="px-3.5 py-1 bg-cyan-500 text-white text-[11px] font-extrabold tracking-wider uppercase rounded-full shadow-md shadow-cyan-500/20 whitespace-nowrap">
                    Most Popular
                  </span>
                </div>
              )}
              {plan.isExclusive && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                  <span className="px-3.5 py-1 bg-amber-500 text-slate-950 text-[11px] font-black tracking-wider uppercase rounded-full shadow-md shadow-amber-500/20 whitespace-nowrap">
                    Exclusive All-Access
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${plan.accent} flex items-center justify-center text-white shadow-lg`}>
                    <plan.icon className="w-5 h-5" />
                  </div>
                  <h2 className={`text-xl font-bold ${plan.isExclusive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.name}</h2>
                </div>

                <div className="flex items-baseline gap-2 my-4">
                  {plan.originalPrice && (
                    <span className={`text-lg font-semibold line-through ${plan.isExclusive ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      {plan.originalPrice}
                    </span>
                  )}
                  <span className={`text-4xl font-extrabold ${plan.isExclusive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.price}</span>
                  <span className={`text-xs font-medium ${plan.isExclusive ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>/ {plan.period}</span>
                </div>
                {plan.originalPrice && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full -mt-2 mb-3">
                    Save ${Number(plan.originalPrice.replace(/[^0-9]/g, '')) - Number(plan.price.replace(/[^0-9]/g, ''))} — {Math.round((1 - Number(plan.price.replace(/[^0-9]/g, '')) / Number(plan.originalPrice.replace(/[^0-9]/g, ''))) * 100)}% off
                  </span>
                )}
                <p className={`text-sm mb-5 ${plan.isExclusive ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>{plan.description}</p>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.isExclusive ? 'text-slate-200' : 'text-slate-700 dark:text-slate-200'}`}>
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.isExclusive ? 'text-amber-400' : 'text-cyan-600 dark:text-cyan-400'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleCta(plan)}
                className={`w-full font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 ${
                  plan.isExclusive
                    ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-500/25'
                    : plan.isPopular
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/25'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white shadow-md shadow-cyan-500/20'
                }`}
              >
                {plan.buttonText}
              </button>
            </SpotlightCard>
          ))}
        </div>

        {/* Guarantee strip */}
        <div className="mt-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f1420]/60 px-6 py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Annual billing — big savings</span>
          <span className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Access to all unlocked content</span>
          <span className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Certificate on every completed course</span>
          <span className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> AI vouchers & eBooks for paid members</span>
        </div>

        {/* FAQ */}
        <div className="mt-16 mb-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-6">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-2">
                    <Skeleton className="w-3/4 h-4" />
                    <Skeleton className="w-full h-3" lines={2} />
                  </div>
                ))
              : faqs.map((item, i) => (
                  <div key={item.question} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1420]/60 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{item.question}</span>
                      <ChevronDown className={`w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <p className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.answer}</p>
                    )}
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  )
}
