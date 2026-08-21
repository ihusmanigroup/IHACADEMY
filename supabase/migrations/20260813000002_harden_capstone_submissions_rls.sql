-- ============================================================
-- IH ACADEMY — Harden capstone_submissions RLS
-- Migration: 20260813000002
--
-- Drops two policies that existed directly in the live DB (not
-- from any repo migration) and were security holes:
--   * "Public read capstone_submissions"       (role anon,
--     SELECT USING true)  — let unauthenticated visitors read
--     every student's submission.
--   * "Admin anon update capstone_submissions" (role anon,
--     UPDATE USING true WITH CHECK true)  — let ANY unauthenticated
--     client change status/score/feedback on any row.
--
-- The admin panel is covered by the authenticated read-all policy
-- ("Allow read capstone_submissions for admin", role public) and
-- review updates go through the admin-gated UPDATE policy
-- ("capstone_submissions_admin_update"). Students read/insert
-- only their own rows. This restores that intended posture.
-- ============================================================

DROP POLICY IF EXISTS "Public read capstone_submissions" ON public.capstone_submissions;
DROP POLICY IF EXISTS "Admin anon update capstone_submissions" ON public.capstone_submissions;