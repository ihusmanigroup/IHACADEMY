-- ============================================================
-- IH ACADEMY — Assignment & Capstone Submission Workflow
-- Migration: 20260813000000
--
-- capstone_submissions: students submit capstone / assignment work
-- for review. A submission is inserted with status 'pending'; an
-- admin or AI reviewer flips it to 'approved' (optionally scoring
-- it 0-100 and leaving feedback) or 'rejected' (feedback + the
-- student can resubmit, which inserts a fresh 'pending' row).
--
-- RLS: students may only see and insert their own rows. Reads of
-- status/score/feedback come back through the same select-own
-- policy, so a student never sees another student's work.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.capstone_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL DEFAULT '',
  assignment_title TEXT NOT NULL DEFAULT '',
  github_url TEXT NOT NULL DEFAULT '',
  live_demo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  score INTEGER CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS capstone_submissions_user_idx
  ON public.capstone_submissions (user_id, submitted_at DESC);

ALTER TABLE public.capstone_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "capstone_submissions_select_own" ON public.capstone_submissions;
CREATE POLICY "capstone_submissions_select_own"
  ON public.capstone_submissions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "capstone_submissions_insert_own" ON public.capstone_submissions;
CREATE POLICY "capstone_submissions_insert_own"
  ON public.capstone_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
