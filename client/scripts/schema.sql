-- ============================================================================
-- IH Academy — CMS Schema (idempotent)
-- Run via: npm run db:setup  (see scripts/setup-db.js)
-- All tables: RLS enabled + public read policy.
--
-- NOTE: `courses`, `lessons`, `internship_tracks` and `internship_weeks`
-- already exist in production with their own schemas and data (the Courses
-- page, LessonPlayer, and Winter Internship all read them). This script does
-- NOT manage those tables — only the CMS static-content tables below.
-- ============================================================================

-- ── 1. site_settings ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key          TEXT PRIMARY KEY,
  value        TEXT,
  type         TEXT NOT NULL DEFAULT 'text',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. pricing_plans ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pricing_plans (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  price         TEXT NOT NULL,
  numeric_price NUMERIC NOT NULL DEFAULT 0,
  original_price TEXT,
  period        TEXT,
  description   TEXT,
  features      JSONB NOT NULL DEFAULT '[]'::jsonb,
  button_text   TEXT,
  is_popular    BOOLEAN NOT NULL DEFAULT false,
  is_exclusive  BOOLEAN NOT NULL DEFAULT false,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. faqs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faqs (
  id         BIGSERIAL PRIMARY KEY,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  category   TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (question)
);

-- ── 4. testimonials ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  role       TEXT,
  rating     INTEGER NOT NULL DEFAULT 5,
  quote      TEXT NOT NULL,
  avatar_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 5. announcements ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id         BIGSERIAL PRIMARY KEY,
  message    TEXT NOT NULL,
  link       TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 6. features ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS features (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT,
  points      JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (title)
);

-- ── 7. about_sections ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS about_sections (
  id         BIGSERIAL PRIMARY KEY,
  key        TEXT NOT NULL UNIQUE,
  title      TEXT NOT NULL,
  body       TEXT,
  icon       TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Row Level Security: public read on every CMS table.
-- ============================================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'site_settings', 'pricing_plans', 'faqs', 'testimonials', 'announcements',
    'features', 'about_sections'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format(
      'DROP POLICY IF EXISTS "public_read_%s" ON %I;', tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY "public_read_%s" ON %I FOR SELECT USING (true);', tbl, tbl
    );
  END LOOP;
END $$;
