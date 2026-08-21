-- ---------------------------------------------------------------------------
-- IH Academy — Lesson metadata backfill (modules / previews / types)
--
-- Makes the ENTIRE `lessons` table 100% database-driven for the Curriculum
-- Builder UI: no frontend math fallbacks are needed to render modules,
-- preview badges or type badges.
--
--  1. Align the lesson_type default with the CHECK constraint
--     (theory/video/quiz/code) — the previous default ('video') silently made
--     every new lesson a "video".
--  2. is_preview = true for the first lesson of every module (free sample).
--  3. lesson_type re-derived from real content:
--       assessment -> quiz
--       has video_url -> video
--       has ``` code fences -> code
--       otherwise -> theory
--  4. Safety net: any lesson still missing module_order/module_title gets the
--     classic "4 lessons per module" grouping materialized as real columns.
-- ---------------------------------------------------------------------------

-- (1) Default aligned with the CHECK constraint ---------------------------------------
ALTER TABLE public.lessons
  ALTER COLUMN lesson_type SET DEFAULT 'theory';

-- (2) First lesson of each module is a free preview -----------------------------------
UPDATE public.lessons l
SET is_preview = true
FROM (
  SELECT DISTINCT ON (course_id, module_order)
    id
  FROM public.lessons
  ORDER BY course_id, module_order, lesson_order ASC
) first_rows
WHERE l.id = first_rows.id;

-- (3) Re-derive lesson_type from the actual saved content -----------------------------
UPDATE public.lessons
SET lesson_type = 'quiz'
WHERE is_assessment = true;

UPDATE public.lessons
SET lesson_type = 'video'
WHERE video_url IS NOT NULL AND video_url <> '';

UPDATE public.lessons
SET lesson_type = 'code'
WHERE is_assessment = false
  AND (video_url IS NULL OR video_url = '')
  AND content LIKE '%```%';

UPDATE public.lessons
SET lesson_type = 'theory'
WHERE lesson_type NOT IN ('theory', 'video', 'quiz', 'code');

-- (4) Materialize module columns whenever they are still missing ----------------------
UPDATE public.lessons
SET module_order = GREATEST(1, CEIL(lesson_order::numeric / 4)::int)
WHERE module_order IS NULL;

UPDATE public.lessons
SET module_title = CASE
      WHEN module_title IS NULL OR module_title = '' THEN 'Module ' || module_order
      ELSE module_title
    END;