-- Profile display fields: enrolled track, location, and resume link.
-- Idempotent — safe to run on any database state.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS track TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS resume_url TEXT;
