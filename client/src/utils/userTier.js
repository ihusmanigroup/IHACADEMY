import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPlanTier } from './subscription'
import { supabase } from '../lib/supabase'

// ---------------------------------------------------------------------------
// Shared membership tier system — single source of truth for the Developer
// Community badges and the Profile page.
//
// Strict hierarchy (NO fallback to INTERN):
//   admin        → IH Academy administrator (profile.is_admin)
//   exclusive    → $200/yr Exclusive Plan
//   pro          → $70/yr Pro Plan
//   course_buyer → purchased ≥1 individual paid course, no paid plan
//   free         → default $0 Free Plan
//
// Course enrollment does NOT confer PRO — only an active Pro/Exclusive plan
// does. Individual course purchases (without a plan) grant COURSE_BUYER.
// INTERN is intentionally NOT part of the community tier classification — free
// users must never render as INTERN.
// ---------------------------------------------------------------------------

// Resolve tier for the CURRENT user — checks profile plan flags + completed
// paid-course transactions. Returns the lowercase tier key.
export function deriveTier(profile, opts) {
  if (!profile) return 'free'
  if (profile.is_admin) return 'admin'

  const plan = (opts && opts.getPlanTierFn) ? opts.getPlanTierFn(profile) : getPlanTier(profile)
  if (plan === 'exclusive') return 'exclusive'
  if (plan === 'pro') return 'pro'

  const boughtCourse = !!(opts && opts.boughtCourse)
  if (boughtCourse) return 'course_buyer'

  return 'free'
}

// Plan/profile-only resolution (admin + plan flags). Used to dynamically map
// legacy chat rows to their sender's CURRENT profile tier — the best tier
// signal available for OTHER users (their transactions are owner-private).
// Enrollment in courses does NOT affect tier — only plan flags do.
export function deriveProfileTier(profile) {
  if (!profile) return 'free'
  if (profile.is_admin) return 'admin'
  if (profile.is_exclusive === true) return 'exclusive'
  if (profile.is_pro === true) return 'pro'
  return 'free'
}

// `user_role` stored on community_messages — admin stays lowercase, everything
// else mirrors the uppercase tier value.
export function roleForTier(tier) {
  return tier === 'admin' ? 'admin' : String(tier || 'free').toUpperCase()
}

// `user_tier` stored on community_messages.
export function tierToStorage(tier) {
  return tier === 'admin' ? 'admin' : String(tier || 'free').toUpperCase()
}

// Normalize any stored value (legacy lowercase or new uppercase) to a key.
export function tierFromStorage(value) {
  const key = String(value || '').toLowerCase()
  if (key === 'vvip' || key === 'premium') return 'exclusive'
  return key || 'free'
}

// Modern tiers the app actually writes to the DB. Anything outside this set
// (null, 'intern', 'vvip', 'premium', typos) is treated as a legacy/missing
// value and re-resolved from the sender's current profile tier at render time.
export const VALID_STORED_TIERS = new Set([
  'FREE', 'COURSE_BUYER', 'PRO', 'EXCLUSIVE', 'ADMIN', 'admin',
])

export function hasValidStoredTier(value) {
  return VALID_STORED_TIERS.has(String(value || ''))
}

// Styling metadata used by both the community cards and the Profile page.
// `chatBadge` is what appears beside the username in chat (null hides the pill
// entirely, e.g. COURSE BUYER); `badge` is the richer chip used on Profile.
export const TIER_META = {
  admin: {
    label: 'ADMIN',
    icon: null,
    chatBadge:
      'border border-indigo-300 bg-indigo-500/10 text-indigo-600 dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full',
    badge:
      'border border-indigo-300 bg-indigo-500/10 text-indigo-600 dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-300 text-xs font-bold px-2.5 py-0.5 rounded-full',
    ring: 'ring-2 ring-indigo-400/70',
    name: 'text-indigo-700 dark:text-indigo-300',
    gradient: 'from-indigo-500 to-violet-500',
  },
  exclusive: {
    label: 'EXCLUSIVE',
    icon: '👑',
    chatBadge:
      'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md',
    badge:
      'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow-md',
    ring: 'ring-2 ring-yellow-400 ring-offset-2 shadow-sm shadow-yellow-400/50',
    name: 'text-amber-700 dark:text-amber-400',
    gradient: 'from-amber-400 to-yellow-500',
  },
  pro: {
    label: 'PRO',
    icon: '👑',
    chatBadge:
      'bg-amber-500/10 text-amber-700 border border-amber-400/60 font-bold text-[10px] px-2 py-0.5 rounded-md',
    badge:
      'bg-amber-500/10 text-amber-700 border border-amber-400/60 font-bold text-xs px-2.5 py-0.5 rounded-md',
    ring: 'ring-2 ring-amber-400 ring-offset-1',
    name: 'text-amber-700 dark:text-amber-400',
    gradient: 'from-amber-300 to-yellow-400',
  },
  course_buyer: {
    label: 'COURSE BUYER',
    icon: null,
    chatBadge: null,
    badge:
      'border border-amber-400/30 bg-amber-400/10 text-amber-600 dark:border-amber-400/40 dark:bg-amber-400/15 dark:text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full',
    ring: 'ring-2 ring-amber-400 ring-offset-1',
    name: 'text-slate-900 dark:text-white',
    gradient: 'from-amber-400 to-yellow-500',
  },
  free: {
    label: 'FREE',
    icon: null,
    chatBadge: 'bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded',
    badge: 'bg-slate-100 text-slate-500 text-xs px-2.5 py-0.5 rounded',
    ring: 'ring-1 ring-slate-200',
    name: 'text-slate-900 dark:text-white',
    gradient: 'from-slate-400 to-slate-500',
  },
}

/**
 * Resolve the current user's tier straight from Supabase records.
 *
 * Sources (strict hierarchy, EXCLUSIVE > PRO > COURSE_BUYER > FREE):
 *   1. profile.is_admin → admin
 *   2. Exclusive plan (getPlanTier / profile.is_exclusive) → exclusive
 *   3. Pro plan flag (getPlanTier / profile.is_pro) → pro
 *   4. Completed paid-course transactions (item_type='course') → course_buyer
 *      (only if no pro/exclusive plan)
 *   5. otherwise → free
 *
 * Course enrollment does NOT confer PRO — only an active Pro/Exclusive plan does.
 * Transactions are owner-private, so this full resolution is only possible for
 * the logged-in user; their own message rows store the result.
 */
export function useUserTier() {
  const { user, profile } = useAuth()
  const [boughtCourse, setBoughtCourse] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setBoughtCourse(false)
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    const load = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('item_type, status')
        .eq('user_id', user.id)
      if (!active) return
      setBoughtCourse(
        (data || []).some(
          (t) => t.item_type === 'course' && (t.status || 'completed') === 'completed'
        )
      )
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [user])

  const tier = useMemo(
    () =>
      deriveTier(profile, {
        getPlanTierFn: getPlanTier,
        boughtCourse,
      }),
    [profile, boughtCourse]
  )

  return { tier, loading }
}