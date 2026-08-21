import { useTableData } from './useTableData'
import { PRICING_PLANS } from '../data/pricingData'

/**
 * Pricing plans from the CMS `pricing_plans` table. Falls back to the local
 * PRICING_PLANS source of truth while loading or if the DB is unreachable, so
 * the Pricing page never renders blank.
 */
export function usePricing() {
  const { data, loading, error } = useTableData('pricing_plans', {
    orderBy: 'sort_order',
    fallback: PRICING_PLANS,
  })

  const plans = (data || [])
    .filter((p) => p.is_active !== false)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      numericPrice: Number(p.numeric_price ?? 0),
      originalPrice: p.original_price || null,
      period: p.period,
      description: p.description,
      features: Array.isArray(p.features) ? p.features : [],
      buttonText: p.button_text,
      isPopular: !!p.is_popular,
      isExclusive: !!p.is_exclusive,
      cardBg: p.is_exclusive
        ? 'bg-slate-950 border-amber-500/40 text-white shadow-2xl shadow-amber-500/10'
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white',
    }))

  return { plans, loading, error }
}
