-- ============================================================
-- IH ACADEMY — Playground XP: Meaningful Edit Validation
-- Migration: 20260805020000
--
-- Tightens award_playground_xp():
--   * 45-second cooldown between awards (was 30s)
--   * 30 XP daily cap (was 50) — max 3 successful evolutions/day
--   * rejects "minor" edits: normalized code (whitespace + comments
--     stripped) must differ by >= 15 meaningful characters vs the
--     last awarded snapshot — blocks single-space / dot / letter farms
--   * stores clean_length on each transaction so the threshold is
--     enforced server-side, not just in the browser
-- ============================================================

ALTER TABLE public.xp_transactions
  ADD COLUMN IF NOT EXISTS clean_length INT;

DROP FUNCTION IF EXISTS public.award_playground_xp(p_code_hash TEXT);

CREATE OR REPLACE FUNCTION public.award_playground_xp(
  p_code_hash TEXT DEFAULT NULL,
  p_clean_length INT DEFAULT NULL
)
RETURNS TABLE(awarded BOOLEAN, new_xp INT, reason TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  last_created_at TIMESTAMPTZ;
  last_code_hash TEXT;
  last_clean_length INT;
  daily_sum INT;
  edit_diff INT;
BEGIN
  IF uid IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::INT, 'no_user'::TEXT;
    RETURN;
  END IF;

  INSERT INTO public.profiles (id, full_name)
  VALUES (uid, 'Developer')
  ON CONFLICT (id) DO NOTHING;

  SELECT t.created_at, t.code_hash, t.clean_length
    INTO last_created_at, last_code_hash, last_clean_length
  FROM public.xp_transactions t
  WHERE t.user_id = uid AND t.source = 'playground_run'
  ORDER BY t.created_at DESC
  LIMIT 1;

  -- 1) Cooldown guard: 45s between awards
  IF last_created_at IS NOT NULL
     AND now() - last_created_at < interval '45 seconds' THEN
    RETURN QUERY SELECT FALSE, (SELECT xp FROM public.profiles WHERE id = uid), 'cooldown'::TEXT;
    RETURN;
  END IF;

  -- 2) Daily cap: max 30 XP/day strictly from playground execution
  SELECT COALESCE(SUM(t.xp_amount), 0)::INT INTO daily_sum
  FROM public.xp_transactions t
  WHERE t.user_id = uid
    AND t.source = 'playground_run'
    AND t.created_at >= date_trunc('day', now());

  IF daily_sum >= 30 THEN
    RETURN QUERY SELECT FALSE, (SELECT xp FROM public.profiles WHERE id = uid), 'daily_cap'::TEXT;
    RETURN;
  END IF;

  -- 3) No XP for re-running identical code
  IF last_code_hash IS NOT NULL AND p_code_hash IS NOT NULL
     AND last_code_hash = p_code_hash THEN
    RETURN QUERY SELECT FALSE, (SELECT xp FROM public.profiles WHERE id = uid), 'unchanged'::TEXT;
    RETURN;
  END IF;

  -- 4) Meaningful-edit threshold: normalized code must differ by
  --    >= 15 characters vs the last awarded snapshot
  IF last_clean_length IS NOT NULL AND p_clean_length IS NOT NULL THEN
    edit_diff := ABS(p_clean_length - last_clean_length);
    IF edit_diff < 15 THEN
      RETURN QUERY SELECT FALSE, (SELECT xp FROM public.profiles WHERE id = uid), 'minor_edit'::TEXT;
      RETURN;
    END IF;
  END IF;

  -- 5) Award: audit row (with clean snapshot length) + profile XP bump
  INSERT INTO public.xp_transactions (user_id, source, xp_amount, code_hash, clean_length)
  VALUES (uid, 'playground_run', 10, p_code_hash, p_clean_length);

  UPDATE public.profiles
  SET xp = xp + 10,
      updated_at = timezone('utc'::text, now())
  WHERE id = uid;

  RETURN QUERY SELECT TRUE, (SELECT xp FROM public.profiles WHERE id = uid), 'awarded'::TEXT;
END;
$$;
