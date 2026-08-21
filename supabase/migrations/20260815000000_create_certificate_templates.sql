-- certificate_templates already exists (managed by the admin app) with the
-- columns we rely on: course_id (nullable), template_url, is_auto_issue,
-- template_type, certificate_category, and name overlay offsets
-- (name_offset_x/y, name_font_size, name_color).
-- This migration just adds a lookup index for the per-course template queries
-- used by Certifications.jsx.

CREATE INDEX IF NOT EXISTS certificate_templates_course_id_idx
  ON public.certificate_templates (course_id);
