-- ============================================================
-- IH ACADEMY — Quizzes Table
-- Migration: 20260729000009
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Quizzes are viewable by authenticated users" ON public.quizzes;
CREATE POLICY "Quizzes are viewable by authenticated users"
  ON public.quizzes FOR SELECT USING (auth.role() = 'authenticated');
