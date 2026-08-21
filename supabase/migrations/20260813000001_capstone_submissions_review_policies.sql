-- ============================================================
-- IH ACADEMY — Capstone Submissions: review policies
-- Migration: 20260813000001
--
-- Adds the admin/review layer on top of 20260813000000:
--   * profiles.is_admin flag (admins can review submissions)
--   * read-all SELECT policy so the admin panel can view every
--     submission (per product spec).
--   * UPDATE policy scoped to admins so reviewers can flip
--     status / set score & feedback.
--
-- NOTE: the read-all policy below is intentionally permissive
-- (`USING (true)`), exactly as specified. That means any
-- authenticated user can SELECT every submission. To harden it
-- later, scope it to admins:
--   FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles p
--     WHERE p.id = auth.uid() AND p.is_admin = true));
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Promote a reviewer (run manually for each reviewer account):
--   UPDATE public.profiles SET is_admin = TRUE
--   WHERE email = 'admin@example.com';

-- ---------------------------------------------------------------------------
-- Select: students still see their own rows (capstone_submissions_select_own),
-- and the admin panel can read everything via this policy.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow read capstone_submissions for admin" ON public.capstone_submissions;
CREATE POLICY "Allow read capstone_submissions for admin"
  ON public.capstone_submissions FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- Update: admins may change status / score / feedback on any submission.
-- Students get NO update (resubmission is a fresh INSERT, which keeps the
-- review history intact).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "capstone_submissions_admin_update" ON public.capstone_submissions;
CREATE POLICY "capstone_submissions_admin_update"
  ON public.capstone_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );