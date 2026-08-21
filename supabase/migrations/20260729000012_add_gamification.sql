-- ============================================================
-- IH ACADEMY — Gamification Engine
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
