-- Academy-wide global Minor certificate template. Acts as the fallback for any
-- Minor course that does not have its own course-specific template row. It is
-- identified by course_type = 'Minor' with course_id NULL (the 'ALL_MINOR'
-- sentinel is supported in client lookup for deployments that use it).
-- Reuses the academy's existing certificate background image in Supabase Storage.
-- Idempotent: only inserted when no global minor template exists yet.

INSERT INTO public.certificate_templates
  (title, target_type, course_id, template_url, is_auto_issue, template_type, certificate_category, course_name, course_type)
SELECT
  'Global Minor Course Certificate',
  'minor',
  NULL,
  'https://dolfyahvhqsszjzsjgsi.supabase.co/storage/v1/object/public/certificates/templates/1786386099252-jnbo5j.jpeg',
  TRUE,
  'completion',
  'course',
  'Minor Course',
  'Minor'
WHERE NOT EXISTS (
  SELECT 1 FROM public.certificate_templates
  WHERE course_type = 'Minor' AND course_id IS NULL
);
