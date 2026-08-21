-- Official course certificates — issued automatically when a learner reaches
-- 100% on a course (LearnView completion / dashboard catch-up), one row per
-- (user_id, course_id). The certificate_id is generated client-side in the
-- `IH-CERT-2026-XXXX` format and stored here as the public credential id.

CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  user_name text NOT NULL DEFAULT 'Student',
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  course_name text NOT NULL,
  certificate_id text NOT NULL,
  completion_date date NOT NULL DEFAULT CURRENT_DATE,
  duration text NOT NULL DEFAULT '10 Hours',
  status text NOT NULL DEFAULT 'issued',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS certificates_user_idx
  ON public.certificates (user_id);

CREATE INDEX IF NOT EXISTS certificates_course_idx
  ON public.certificates (course_id);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own certificates"
  ON public.certificates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own certificates"
  ON public.certificates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin / mentor review layer: full read + update for users flagged is_admin,
-- so the academy can verify and manage issued credentials.
CREATE POLICY "Admins read all certificates"
  ON public.certificates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)
  );

CREATE POLICY "Admins update certificates"
  ON public.certificates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE)
  );