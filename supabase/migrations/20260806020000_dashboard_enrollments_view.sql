-- ===========================================================================
-- dashboard_enrollments — unified dashboard feed (single source of truth)
--
-- One row per (user, course) with SERVER-computed stats so every dashboard
-- component reads the SAME numbers. This is the Supabase equivalent of a
-- Mongoose `.populate('course')` + aggregation: completed_lessons is counted
-- from lesson_completions, and progress is the max of the stored enrollment
-- percentage and the live completion ratio — the client can no longer derive
-- conflicting numbers from separate queries.
-- ===========================================================================

CREATE OR REPLACE VIEW public.dashboard_enrollments
WITH (security_invoker = true) AS
SELECT
  e.user_id,
  e.course_id,
  e.status,
  e.enrolled_at,
  c.title,
  c.category,
  c.level,
  c.xp_reward,
  c.is_free,
  COALESCE(c.total_lessons, 0)::int  AS total_lessons,
  COALESCE(lc.completed_lessons, 0)::int AS completed_lessons,
  LEAST(100, GREATEST(
    COALESCE(e.progress_percent, e.progress, 0),
    CASE WHEN COALESCE(c.total_lessons, 0) > 0
      THEN ROUND((COALESCE(lc.completed_lessons, 0)::numeric / c.total_lessons) * 100)
      ELSE 0 END
  ))::int AS progress,
  lc.last_completed_at AS last_activity
FROM public.enrollments e
JOIN public.courses c ON c.id = e.course_id
LEFT JOIN LATERAL (
  SELECT
    COUNT(*)::int AS completed_lessons,
    MAX(completed_at) AS last_completed_at
  FROM public.lesson_completions l
  WHERE l.user_id = e.user_id
    AND l.course_id = e.course_id
) lc ON true;

-- security_invoker + base-table RLS (auth.uid() = user_id) mean callers only
-- ever see their own rows; no extra policy is required.
GRANT SELECT ON public.dashboard_enrollments TO authenticated;
