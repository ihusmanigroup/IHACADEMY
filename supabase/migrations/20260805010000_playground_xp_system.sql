-- ============================================================
-- IH ACADEMY — Secure, Anti-Spam XP Reward System (Playground)
-- Migration: 20260805010000
--
-- xp_transactions: audit ledger of every awarded XP amount.
-- award_playground_xp(): server-side guarded reward used by the
-- Code Playground (/playground):
--   * +10 XP only for a successful run of MODIFIED code
--   * 30-second cooldown between awards
--   * 50 XP daily cap strictly from 'playground_run' source
--   * rejects repeated runs of identical code (code_hash compare)
--   * bumps profiles.xp (leaderboard rank follows automatically)
-- The amount is hard-coded server-side (10) — callers cannot
-- request arbitrary XP.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  xp_amount INT NOT NULL DEFAULT 0,
  code_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS xp_transactions_user_source_idx
  ON public.xp_transactions (user_id, source, created_at DESC);

ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "xp_transactions_select_own" ON public.xp_transactions;
CREATE POLICY "xp_transactions_select_own"
  ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "xp_transactions_insert_own" ON public.xp_transactions;
CREATE POLICY "xp_transactions_insert_own"
  ON public.xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- award_playground_xp(p_code_hash) -> (awarded, new_xp, reason)
--   reason: 'awarded' | 'cooldown' | 'daily_cap' | 'unchanged' | 'no_user'
-- ============================================================
CREATE OR REPLACE FUNCTION public.award_playground_xp(p_code_hash TEXT DEFAULT NULL)
RETURNS TABLE(awarded BOOLEAN, new_xp INT, reason TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  last_created_at TIMESTAMPTZ;
  last_code_hash TEXT;
  daily_sum INT;
BEGIN
  IF uid IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::INT, 'no_user'::TEXT;
    RETURN;
  END IF;

  INSERT INTO public.profiles (id, full_name)
  VALUES (uid, 'Developer')
  ON CONFLICT (id) DO NOTHING;

  SELECT t.created_at, t.code_hash INTO last_created_at, last_code_hash
  FROM public.xp_transactions t
  WHERE t.user_id = uid AND t.source = 'playground_run'
  ORDER BY t.created_at DESC
  LIMIT 1;

  -- 1) Cooldown guard: 30s between awards
  IF last_created_at IS NOT NULL
     AND now() - last_created_at < interval '30 seconds' THEN
    RETURN QUERY SELECT FALSE, (SELECT xp FROM public.profiles WHERE id = uid), 'cooldown'::TEXT;
    RETURN;
  END IF;

  -- 2) Daily cap: max 50 XP/day from playground execution
  SELECT COALESCE(SUM(t.xp_amount), 0)::INT INTO daily_sum
  FROM public.xp_transactions t
  WHERE t.user_id = uid
    AND t.source = 'playground_run'
    AND t.created_at >= date_trunc('day', now());

  IF daily_sum >= 50 THEN
    RETURN QUERY SELECT FALSE, (SELECT xp FROM public.profiles WHERE id = uid), 'daily_cap'::TEXT;
    RETURN;
  END IF;

  -- 3) Code-change check: no XP for re-running identical code
  IF last_code_hash IS NOT NULL AND p_code_hash IS NOT NULL
     AND last_code_hash = p_code_hash THEN
    RETURN QUERY SELECT FALSE, (SELECT xp FROM public.profiles WHERE id = uid), 'unchanged'::TEXT;
    RETURN;
  END IF;

  -- 4) Award: audit row + profile XP bump (leaderboard rank auto-updates)
  INSERT INTO public.xp_transactions (user_id, source, xp_amount, code_hash)
  VALUES (uid, 'playground_run', 10, p_code_hash);

  UPDATE public.profiles
  SET xp = xp + 10,
      updated_at = timezone('utc'::text, now())
  WHERE id = uid;

  RETURN QUERY SELECT TRUE, (SELECT xp FROM public.profiles WHERE id = uid), 'awarded'::TEXT;
END;
$$;
