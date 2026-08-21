-- ============================================================
-- IH ACADEMY — Lesson Modules, Locking & Assessments
-- Migration: 20260804030000
--
-- Each lessons row is now a single Topic (or a Module Assessment)
-- whose `content` column holds PURE markdown (no JSON wrapper).
-- Module grouping and progression locking are explicit columns.
-- ============================================================

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS module_order INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_assessment BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_lessons_course_order
  ON public.lessons (course_id, lesson_order);
