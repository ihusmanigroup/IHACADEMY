-- ============================================================
-- IH ACADEMY — Free-course certificate uploads: dedicated bucket
-- Migration: 20260817000004
--
-- Provisions the `course-certificates` Storage bucket (public) plus
-- storage.objects policies so signed-in interns can upload completion
-- certificate files (PDF / PNG / JPG) and anyone can read them back
-- via the public URL stored on course_proofs.file_url.
--
-- Client upload path: <application_id>/<course_requirement_id>_<timestamp>.<ext>
-- NOT yet applied — run with the other 2026081700000x migrations.
-- ============================================================

-- Storage bucket for course completion certificates (idempotent).
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-certificates', 'course-certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Public read so the public URL served to reviewers/students resolves.
DROP POLICY IF EXISTS "course_certificates_public_read" ON storage.objects;
CREATE POLICY "course_certificates_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-certificates');

-- Signed-in interns may upload certificate files into the bucket.
DROP POLICY IF EXISTS "course_certificates_authenticated_insert" ON storage.objects;
CREATE POLICY "course_certificates_authenticated_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'course-certificates');