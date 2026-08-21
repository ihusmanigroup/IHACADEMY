-- Seed a per-course completion certificate template that auto-issues once a
-- learner hits 100% progress. We reuse the academy's existing certificate
-- background image (already stored in Supabase Storage) so every course renders
-- a real certificate. Academy admins can later scope/disable these per course
-- (set is_auto_issue = FALSE or remove the row) to put a course into the
-- "Pending Admin Release" state.
-- Idempotent: skips courses that already have a completion template.

INSERT INTO public.certificate_templates
  (title, target_type, course_id, template_url, is_auto_issue, template_type, certificate_category, course_name)
SELECT
  (c.title || ' — Completion Certificate'),
  'minor',
  c.id,
  (SELECT template_url FROM public.certificate_templates WHERE template_url IS NOT NULL LIMIT 1),
  TRUE,
  'completion',
  'course',
  c.title
FROM public.courses c
WHERE NOT EXISTS (
  SELECT 1 FROM public.certificate_templates t
  WHERE t.course_id = c.id AND t.template_type = 'completion'
);
