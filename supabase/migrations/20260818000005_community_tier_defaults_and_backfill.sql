-- ============================================================
-- IH ACADEMY — Community chat: strict tier defaults + backfill
-- Migration: 20260818000005
--
-- Fixes tier classification for community_messages:
--   * Default user_tier / user_role is now 'FREE' — legacy rows and
--     unspecified inserts must NOT fall back to 'intern'.
--   * Retroactive backfill re-resolves every message whose stored tier is
--     stale — legacy/missing values OR a valid value that no longer matches
--     the sender's current profile/transaction state.
--   * Strict hierarchy (server-side, so it can read owner-private
--     transactions): admin > EXCLUSIVE > PRO > COURSE_BUYER > FREE.
--   * PRO/EXCLUSIVE only via plan flags (is_pro/is_exclusive). Course
--     enrollment does NOT confer PRO. COURSE_BUYER requires a completed
--     individual course purchase with NO paid plan.
--
-- NOTE: applied live via scripts/setup-community-db.js (idempotent).
-- ============================================================

ALTER TABLE public.community_messages ALTER COLUMN user_tier SET DEFAULT 'FREE';
ALTER TABLE public.community_messages ALTER COLUMN user_role SET DEFAULT 'FREE';

UPDATE public.community_messages AS cm
SET user_tier = st.tier,
    user_role = st.tier
FROM (
    SELECT
        p.id AS user_id,
        CASE
            WHEN p.is_admin THEN 'admin'
            WHEN p.is_exclusive = true THEN 'EXCLUSIVE'
            WHEN p.is_pro = true THEN 'PRO'
            WHEN EXISTS (
                SELECT 1 FROM public.transactions t
                WHERE t.user_id = p.id
                  AND t.item_type = 'course'
                  AND COALESCE(t.status, 'completed') = 'completed'
            ) THEN 'COURSE_BUYER'
            ELSE 'FREE'
        END AS tier
    FROM public.profiles p
) AS st
WHERE st.user_id = cm.user_id
  AND (UPPER(cm.user_tier) IS DISTINCT FROM st.tier
       OR cm.user_tier IS NULL);