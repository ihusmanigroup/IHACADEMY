-- Root fix: the user_course_progress table was referenced by client code and
-- by later ALTER migrations (20260731000000) but was never actually created,
-- so ML Major progress has only ever lived in browser localStorage. Create it
-- so progress persists to the DB and the dashboard's DB-only gate can see it.
--
-- Column shapes match what the client writes (MajorCourseViewer.syncSupabase):
--   user_id, course_id, lessons_completed (jsonb array), quiz_submitted,
--   capstone_status, updated_at — upsert on (user_id, course_id).

CREATE TABLE IF NOT EXISTS public.user_course_progress (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  lessons_completed jsonb NOT NULL DEFAULT '[]'::jsonb,
  quiz_submitted boolean NOT NULL DEFAULT FALSE,
  capstone_status text NOT NULL DEFAULT 'pending',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);

ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own course progress"
  ON public.user_course_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
