// ---------------------------------------------------------------------------
// IH Academy — subscription / membership state.
//
// The user's plan is derived from `profiles.is_pro` (set by the checkout flow)
// and the `profiles.plan`/`profiles.plan_expires_at` columns when present.
// Tiers: 'free' | 'pro' | 'exclusive'. All UI guards read through here so a
// single source of truth stays consistent across Pricing, Dashboard vouchers,
// eBook locks and course access.
// ---------------------------------------------------------------------------

export const PLAN_TIERS = [
  { id: 'free', label: 'Free Plan', short: 'Free' },
  { id: 'pro', label: 'Pro Plan', short: 'Pro' },
  { id: 'exclusive', label: 'Exclusive Plan', short: 'Exclusive' },
]

export function getPlanTier(profile) {
  if (!profile) return 'free'
  if (profile.plan === 'exclusive' || profile.is_exclusive === true) return 'exclusive'
  if (profile.is_pro === true || profile.plan === 'pro') return 'pro'
  return 'free'
}

export function isProMember(profile) {
  return getPlanTier(profile) !== 'free'
}

export function isExclusiveMember(profile) {
  return getPlanTier(profile) === 'exclusive'
}

export function planLabel(profile) {
  const tier = getPlanTier(profile)
  return (PLAN_TIERS.find((t) => t.id === tier) || PLAN_TIERS[0]).label
}

// ---------------------------------------------------------------------------
// IH Usmani Group AI ecosystem perk vouchers (shown to Pro & Exclusive).
// `status: 'active'` vouchers are copyable; `'soon'` ones are upcoming.
// ---------------------------------------------------------------------------
export const PERK_VOUCHERS = [
  {
    id: 'ihg-ai-agent-20',
    title: '20% Off AI Agent Studio',
    description: 'One-time 20% discount on IH Usmani Group AI Agent Studio annual plans.',
    code: 'IHA-STUDIO-20',
    status: 'active',
    expiry: 'Expires 31 Dec 2026',
  },
  {
    id: 'ihg-rag-cloud-15',
    title: '15% Off RAG Cloud API',
    description: 'Discount voucher for IH Usmani Group RAG Cloud API credits.',
    code: 'IHA-RAG-15',
    status: 'active',
    expiry: 'Expires 31 Dec 2026',
  },
  {
    id: 'ihg-major-30',
    title: '30% Off AI Product Bundle',
    description: 'Bundle voucher across IH Usmani Group AI tools — exclusive members only.',
    code: 'IHA-BUNDLE-30',
    status: 'exclusive',
    expiry: 'Priority drop — 1 Jan 2027',
  },
  {
    id: 'ihg-copilot-beta',
    title: 'AI Copilot Beta Access',
    description: 'Early access + coupon for the upcoming IH Usmani Group AI Copilot.',
    code: 'IHA-COPILOT-BETA',
    status: 'soon',
    expiry: 'Opening soon',
  },
]

export function vouchersForTier(profile) {
  const tier = getPlanTier(profile)
  if (tier === 'exclusive') return PERK_VOUCHERS
  if (tier === 'pro') return PERK_VOUCHERS.filter((v) => v.status !== 'exclusive')
  return []
}
