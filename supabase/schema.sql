-- ============================================================
-- IH ACADEMY â€” Database Schema (standalone, for SQL Editor)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student',
  xp INT DEFAULT 0,
  streak_count INT DEFAULT 0,
  global_rank INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- 2. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Developer'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  level TEXT DEFAULT 'Beginner',
  thumbnail_url TEXT,
  total_lessons INT DEFAULT 0,
  xp_reward INT DEFAULT 100,
  price NUMERIC DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
CREATE POLICY "Courses are viewable by everyone"
  ON public.courses FOR SELECT USING (true);

-- ============================================================
-- 4. LESSONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- ============================================================
-- 5. ENROLLMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  progress INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own enrollments" ON public.enrollments;
CREATE POLICY "Users can manage their own enrollments"
  ON public.enrollments FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- 6. GAMIFICATION ENGINE (see migrations/20260729000012_add_gamification.sql)
-- ============================================================

-- ============================================================
-- IH ACADEMY â€” Gamification Engine
-- profiles: badges + league | leaderboard RPC | add_xp RPC
-- ============================================================

-- 1. PROFILE GAMIFICATION COLUMNS
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS league TEXT DEFAULT 'Bronze',
  ADD COLUMN IF NOT EXISTS solved_challenges INT[] DEFAULT '{}'::INT[];

-- 2. LEAGUE AUTO-CALCULATION (based on XP)
--    Bronze < 1000 | Silver >= 1000 | Gold >= 2500 | Platinum >= 5000 | Diamond >= 10000
CREATE OR REPLACE FUNCTION public.calc_league(xp INT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN xp >= 10000 THEN 'Diamond'
    WHEN xp >= 5000 THEN 'Platinum'
    WHEN xp >= 2500 THEN 'Gold'
    WHEN xp >= 1000 THEN 'Silver'
    ELSE 'Bronze'
  END;
$$;

CREATE OR REPLACE FUNCTION public.sync_league()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.league := public.calc_league(NEW.xp);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profile_league ON public.profiles;
CREATE TRIGGER trg_profile_league
  BEFORE INSERT OR UPDATE OF xp ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_league();

-- Backfill existing rows
UPDATE public.profiles SET league = public.calc_league(xp);

-- ============================================================
-- 3. GET /api/leaderboard  ->  get_leaderboard()
--    Top 50 users sorted descending by XP, with rank position
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE(
  rank BIGINT,
  id UUID,
  name TEXT,
  avatar TEXT,
  xp INT,
  streak INT,
  badges TEXT[],
  league TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    row_number() OVER (ORDER BY p.xp DESC, p.streak_count DESC, p.created_at ASC)::BIGINT AS rank,
    p.id,
    COALESCE(NULLIF(p.full_name, ''), 'Developer') AS name,
    p.avatar_url AS avatar,
    p.xp,
    p.streak_count AS streak,
    COALESCE(p.badges, '{}'::TEXT[]) AS badges,
    p.league
  FROM public.profiles p
  ORDER BY p.xp DESC, p.streak_count DESC, p.created_at ASC
  LIMIT 50;
$$;

-- ============================================================
-- 4. POST /api/user/add-xp  ->  add_xp(points, reason)
--    Awards XP, bumps streak, unlocks badges, auto-upgrades
--    league via trigger, and returns the updated profile.
-- ============================================================
CREATE OR REPLACE FUNCTION public.add_xp(points INT DEFAULT 0, reason TEXT DEFAULT 'activity')
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  before_xp INT;
  before_streak INT;
  earned_badges TEXT[];
  total_xp INT;
  total_streak INT;
BEGIN
  -- Safety: ensure the caller has a profile row
  INSERT INTO public.profiles (id, full_name)
  VALUES (auth.uid(), 'Developer')
  ON CONFLICT (id) DO NOTHING;

  SELECT xp, streak_count INTO before_xp, before_streak
  FROM public.profiles
  WHERE id = auth.uid();

  total_xp := GREATEST(0, COALESCE(before_xp, 0) + COALESCE(points, 0));
  total_streak := COALESCE(before_streak, 0) + 1;

  -- Award badges on milestone thresholds
  earned_badges := ARRAY(
    SELECT b.badge_name
    FROM (
      VALUES
        ('First Steps', 50),
        ('Centurion', 1000),
        ('League Climber', 2500),
        ('Platinum Elite', 5000),
        ('Diamond Elite', 10000)
    ) AS b(badge_name TEXT, at_xp INT)
    WHERE total_xp >= b.at_xp
  ) || ARRAY(
    SELECT 'Streak Master' WHERE total_streak >= 7
  );

  UPDATE public.profiles
  SET xp = total_xp,
      streak_count = total_streak,
      badges = ARRAY(
        SELECT DISTINCT b
        FROM unnest(COALESCE(badges, '{}'::TEXT[]) || earned_badges) AS b
        WHERE b IS NOT NULL
      ),
      updated_at = timezone('utc'::text, now())
  WHERE id = auth.uid();

  -- League is recalculated automatically by trg_profile_league
  RETURN QUERY SELECT * FROM public.profiles WHERE id = auth.uid();
END;
$$;

-- ============================================================
-- 5. Helper: current user's live rank + total participants
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_rank()
RETURNS TABLE(rank BIGINT, total BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*) + 1 FROM public.profiles p2 WHERE p2.xp > p1.xp)::BIGINT AS rank,
    (SELECT COUNT(*) FROM public.profiles)::BIGINT AS total
  FROM public.profiles p1
  WHERE p1.id = auth.uid();
$$;

-- ============================================================
-- 6. Major Course progress sync (ML Engineering Major Course)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_course_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  lessons_completed TEXT[] NOT NULL DEFAULT '{}',
  quiz_submitted BOOLEAN NOT NULL DEFAULT FALSE,
  capstone_status TEXT NOT NULL DEFAULT 'pending',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);

ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_course_progress_select_own"
  ON public.user_course_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_course_progress_upsert_own"
  ON public.user_course_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_course_progress_update_own"
  ON public.user_course_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- DEMO INTERNS (Winter Internship)
-- Keeps the advertised demo account (intern@ih.com / password123) working.
-- The winter reset migration wipes intern_applications, so re-running this
-- block is required. Idempotent: merges on email, never duplicates.
-- ============================================================
INSERT INTO public.intern_applications
  (id, full_name, email, password, status, track, cohort)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'Intern User', 'intern@ih.com', 'password123', 'approved', 'frontend-engineering', 'winter'),
  ('10000000-0000-4000-8000-000000000002', 'Demo Frontend Intern', 'demo.frontend@ih.com', 'password123', 'approved', 'frontend-engineering', 'winter'),
  ('10000000-0000-4000-8000-000000000003', 'Demo Backend Intern', 'demo.backend@ih.com', 'password123', 'approved', 'backend-engineering', 'winter'),
  ('10000000-0000-4000-8000-000000000004', 'Demo Full Stack Intern', 'demo.fullstack@ih.com', 'password123', 'approved', 'full-stack-engineering', 'winter'),
  ('10000000-0000-4000-8000-000000000005', 'Demo Machine Learning Intern', 'demo.ml@ih.com', 'password123', 'approved', 'machine-learning', 'winter'),
  ('10000000-0000-4000-8000-000000000006', 'Demo Agentic AI Intern', 'demo.agentic@ih.com', 'password123', 'approved', 'agentic-ai-engineering', 'winter')
ON CONFLICT (email) DO UPDATE SET
  password = 'password123',
  status = 'approved',
  track = EXCLUDED.track,
  cohort = 'winter';

