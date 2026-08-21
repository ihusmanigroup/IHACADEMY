-- ============================================================
-- IH ACADEMY — Course Assignment / Capstone Submissions
-- Migration: 20260817000000
--
-- NOTE: the generic name `assignment_submissions` is already taken
-- by the winter-internship schema (keyed on enrollment_id), so this
-- course-level table is named `course_assignment_submissions`.
--
-- Students submit assignment / capstone work from the course player
-- (LearnView) with a required submission link plus optional demo link
-- and notes. A submission is inserted with status 'pending'; an admin
-- (profiles.is_admin) later flips it to 'approved' (optionally scoring
-- 0-100 and leaving admin_feedback) or 'rejected' (feedback; the
-- student resubmits, which inserts a fresh 'pending' row so review
-- history is preserved).
--
-- RLS: students may only see and insert their own rows; admins may
-- read all rows and update status/score/admin_feedback.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.course_assignment_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  assignment_title TEXT NOT NULL DEFAULT '',
  submission_link TEXT NOT NULL DEFAULT '',
  demo_link TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  score INTEGER CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  admin_feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS course_assignment_submissions_user_course_idx
  ON public.course_assignment_submissions (user_id, course_id, submitted_at DESC);

ALTER TABLE public.course_assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Student sees only their own submissions.
DROP POLICY IF EXISTS "course_assignment_submissions_select_own" ON public.course_assignment_submissions;
CREATE POLICY "course_assignment_submissions_select_own"
  ON public.course_assignment_submissions FOR SELECT USING (auth.uid() = user_id);

-- Student may insert their own submission (resubmission is a fresh insert).
DROP POLICY IF EXISTS "course_assignment_submissions_insert_own" ON public.course_assignment_submissions;
CREATE POLICY "course_assignment_submissions_insert_own"
  ON public.course_assignment_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin read-all so the review console can see every submission.
DROP POLICY IF EXISTS "course_assignment_submissions_admin_select" ON public.course_assignment_submissions;
CREATE POLICY "course_assignment_submissions_admin_select"
  ON public.course_assignment_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

-- Admin may review: flip status / set score & feedback. Students get no UPDATE.
DROP POLICY IF EXISTS "course_assignment_submissions_admin_update" ON public.course_assignment_submissions;
CREATE POLICY "course_assignment_submissions_admin_update"
  ON public.course_assignment_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );
