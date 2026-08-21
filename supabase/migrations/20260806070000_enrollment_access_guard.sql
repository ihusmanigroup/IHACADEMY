-- Enrollment access guard (the "backend authorization" for course content).
--
-- 1. profiles.is_pro — flag for an active Pro subscription (set by the
--    payment/checkout flow when a plan is purchased).
-- 2. lessons RLS — replaces "viewable by everyone" with a strict gate:
--    a lesson row is readable only when its course is FREE, OR the user has a
--    confirmed enrollment row for the course, OR the user has an active
--    is_pro subscription. Everyone else gets an empty result set (the 403
--    equivalent at the data layer) for paid-course content.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_pro BOOLEAN NOT NULL DEFAULT FALSE;

DROP POLICY IF EXISTS "Lessons are viewable by everyone" ON public.lessons;
DROP POLICY IF EXISTS "Lessons are viewable by authenticated users" ON public.lessons;

CREATE POLICY "Lessons gated by course access"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = lessons.course_id
        AND (c.is_free OR c.price = 0 OR c.price IS NULL)
    )
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = lessons.course_id
        AND e.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_pro
    )
  );
