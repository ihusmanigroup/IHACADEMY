-- ============================================================
-- IH ACADEMY — Assignment submissions: PDF evidence + GitHub link
-- Migration: 20260817000001
--
-- Extends public.course_assignment_submissions (20260817000000) so a
-- submission can carry a GitHub repository link and an uploaded PDF
-- evidence file in addition to the demo link / notes:
--   * github_url  — optional GitHub repository (replaces submission_link)
--   * file_url    — public URL of the uploaded PDF in Storage
--   * file_name   — original PDF filename for display
--
-- Also provisions the `assignment-docs` Storage bucket (public) plus
-- storage.objects policies so signed-in students can upload evidence
-- PDFs and anyone can read them back via the public URL.
-- ============================================================

ALTER TABLE public.course_assignment_submissions
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT;

-- Storage bucket for assignment/capstone evidence PDFs (idempotent).
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment-docs', 'assignment-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Public read so the public URL served to reviewers/students resolves.
DROP POLICY IF EXISTS "assignment_docs_public_read" ON storage.objects;
CREATE POLICY "assignment_docs_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assignment-docs');

-- Signed-in students may upload evidence PDFs into the bucket.
DROP POLICY IF EXISTS "assignment_docs_authenticated_insert" ON storage.objects;
CREATE POLICY "assignment_docs_authenticated_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'assignment-docs');