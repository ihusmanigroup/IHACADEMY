-- Delta: courses, enrollments, lessons, XP, RLS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  level TEXT DEFAULT 'Beginner',
  thumbnail_url TEXT,
  total_lessons INT DEFAULT 0,
  xp_reward INT DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
CREATE POLICY "Courses are viewable by everyone"
  ON public.courses FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  progress_percent INT DEFAULT 0,
  lessons_completed INT DEFAULT 0,
  xp_earned INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own enrollments" ON public.enrollments;
CREATE POLICY "Users can manage their own enrollments"
  ON public.enrollments FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  duration_mins INT DEFAULT 15,
  lesson_order INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lessons are viewable by authenticated users" ON public.lessons;
CREATE POLICY "Lessons are viewable by authenticated users"
  ON public.lessons FOR SELECT USING (auth.role() = 'authenticated');
