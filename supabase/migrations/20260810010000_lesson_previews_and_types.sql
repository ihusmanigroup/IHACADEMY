-- ============================================================
-- IH ACADEMY — Lesson Previews & Lesson Types
-- Migration: 20260810010000
--
-- * lessons.is_preview  — topic is watchable WITHOUT enrollment (used by
--   Course Details syllabus + Learn sidebar to show a "Preview" unlock.
-- * lessons.lesson_type — 'reading' | 'video' | 'code' (drives the
--   Video/Code badge on syllabus rows and sidebar topics).
-- * lessons.video_url   — optional video embed URL for video lessons.
--
-- Classifies existing rows heuristically (code fences => code, video
-- URL => video) and marks the FIRST lesson of every course as a free
-- preview. RLS is updated so preview topics stay readable even for
-- unenrolled users on paid courses.
-- ============================================================

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS is_preview BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lesson_type TEXT NOT NULL DEFAULT 'reading',
  ADD COLUMN IF NOT EXISTS video_url TEXT;

UPDATE public.lessons
SET lesson_type = 'code'
WHERE lesson_type = 'reading' AND content ILIKE '%```%';

UPDATE public.lessons
SET lesson_type = 'video'
WHERE lesson_type = 'reading' AND video_url IS NOT NULL;

UPDATE public.lessons
SET is_preview = true
WHERE lesson_order = 1;

-- Preview topics stay accessible for everyone; everything else stays gated
-- by free course / enrollment / is_pro as before.
DROP POLICY IF EXISTS "Lessons gated by course access" ON public.lessons;

CREATE POLICY "Lessons gated by course access"
  ON public.lessons FOR SELECT
  USING (
    lessons.is_preview
    OR EXISTS (
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