-- Delta: ML Major Course strict completion (capstone gate)
-- Progress weighting: lessons 90% · quiz 5% · capstone 5%
-- 100% + certificate only when capstone_status = 'submitted'

ALTER TABLE public.user_course_progress
  ADD COLUMN IF NOT EXISTS quiz_submitted BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.user_course_progress
  ADD COLUMN IF NOT EXISTS capstone_status TEXT NOT NULL DEFAULT 'pending';
