// ---------------------------------------------------------------------------
// IH Academy — central pricing source of truth.
//
// Every price shown across the app (Pricing page, course cards, unlock /
// checkout modals) reads from PRICING_PLANS so a change here syncs
// everywhere automatically. Never hardcode a dollar amount in a component.
// ---------------------------------------------------------------------------

export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free Plan',
    price: '$0',
    numericPrice: 0,
    period: 'forever',
    description: 'Essential access to start learning and exploring foundational tracks.',
    features: [
      'Access to all Free Courses',
      'Basic Coding Arena access',
      'Standard AI Mentor assistance (limited credits)',
      'Community forum access',
    ],
    buttonText: 'Get Started Free',
    isPopular: false,
    cardBg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white',
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '$70',
    originalPrice: '$100',
    numericPrice: 70,
    period: 'year',
    description: 'Perfect balance for active developers building portfolio projects.',
    features: [
      'Access to 3 Major Paid Courses',
      'IH Usmani Group AI Product Discount Vouchers / Coupons',
      'Exclusive PDF eBooks access',
      'Verified course completion certificates',
    ],
    buttonText: 'Upgrade to Pro',
    isPopular: true, // Badge: MOST POPULAR
    cardBg: 'bg-white dark:bg-slate-900 border-cyan-500 dark:border-cyan-500/50 text-slate-900 dark:text-white',
  },
  {
    id: 'exclusive',
    name: 'Exclusive Plan',
    price: '$200',
    originalPrice: '$300',
    numericPrice: 200,
    period: 'year',
    description: 'Unrestricted all-in pass for total access & career guarantee.',
    features: [
      'All Pro features included',
      'Exclusive Discord / Community access',
      'Priority AI Vouchers & early AI tool drops',
      '1-on-1 Mentorship',
    ],
    buttonText: 'Unlock Full Access',
    isPopular: false,
    isExclusive: true, // Badge: EXCLUSIVE
    cardBg: 'bg-slate-950 border-amber-500/40 text-white shadow-2xl shadow-amber-500/10',
  },
]

/** Lookup helper: plan by id — `getPlan('pro')?.price === '$30'`. */
export function getPlan(id) {
  return PRICING_PLANS.find((p) => p.id === id) || null
}

/** Paid tiers only ($30 / $100) — used by checkout / upgrade modals. */
export const PAID_PLANS = PRICING_PLANS.filter((p) => p.numericPrice > 0)

/** Entry price string for paid unlocks, e.g. "From $30". */
export const PAID_FROM_LABEL = `From ${PAID_PLANS[0]?.price || '$30'}`
