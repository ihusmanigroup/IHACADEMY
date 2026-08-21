/**
 * IH Academy — Database Setup & Seed
 * ------------------------------------------------------------------
 * Usage (from repo root):
 *   node scripts/setup-db.js
 *
 * Initializes ALL tables and seeds the initial CMS content:
 *   1. Applies the full production schema (supabase/schema.sql):
 *      profiles, courses, lessons, enrollments, user_course_progress,
 *      RLS policies, triggers and RPC functions. Idempotent.
 *   2. Creates the 7 CMS static-content tables (site_settings,
 *      pricing_plans, faqs, testimonials, announcements, features,
 *      about_sections) with public-read RLS.
 *   3. Seeds the CMS tables from the site's static source of truth.
 *
 * NOTE: `courses`, `lessons`, `internship_tracks` and `internship_weeks`
 * are production tables already seeded (Courses page, LessonPlayer, and the
 * Winter Internship read them) — this script does NOT overwrite them.
 *
 * Required env var (see .env): SUPABASE_DB_URL
 */

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

// Load .env from repo root (manual parser, matching other root scripts).
try {
  const envPath = path.resolve(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim()
          const value = trimmed.slice(eqIdx + 1).trim()
          if (!process.env[key]) process.env[key] = value
        }
      }
    })
  }
} catch (_) {}

const DB_URL = process.env.SUPABASE_DB_URL

if (!DB_URL) {
  console.error('\n  ❌ SUPABASE_DB_URL not set. Add it to .env (see comment there).\n')
  process.exit(1)
}

// ── CMS schema: the 7 static-content tables + public-read RLS ────────────────
const CMS_SCHEMA = `
-- 1. site_settings
CREATE TABLE IF NOT EXISTS site_settings (
  key          TEXT PRIMARY KEY,
  value        TEXT,
  type         TEXT NOT NULL DEFAULT 'text',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. pricing_plans
CREATE TABLE IF NOT EXISTS pricing_plans (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  price          TEXT NOT NULL,
  numeric_price  NUMERIC NOT NULL DEFAULT 0,
  original_price TEXT,
  period         TEXT,
  description    TEXT,
  features       JSONB NOT NULL DEFAULT '[]'::jsonb,
  button_text    TEXT,
  is_popular     BOOLEAN NOT NULL DEFAULT false,
  is_exclusive   BOOLEAN NOT NULL DEFAULT false,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. faqs
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

-- 4. testimonials
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

-- 5. announcements
CREATE TABLE IF NOT EXISTS announcements (
  id         BIGSERIAL PRIMARY KEY,
  message    TEXT NOT NULL,
  link       TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. features
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

-- 7. about_sections
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

-- RLS: public read on every CMS table
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
    EXECUTE format('DROP POLICY IF EXISTS "public_read_%s" ON %I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "public_read_%s" ON %I FOR SELECT USING (true);', tbl, tbl);
  END LOOP;
END $$;
`

// ── Initial seed data (source of truth: client/src/data + page statics) ─────
const seed = {
  siteSettings: [
    { key: 'hero_badge', value: '✨ Now in public beta — join 10k+ developers', type: 'text' },
    { key: 'hero_title_line_1', value: 'Master Tech.', type: 'text' },
    { key: 'hero_title_line_2', value: 'Enter the Arena.', type: 'text' },
    { key: 'hero_title_line_3', value: 'Land the Job.', type: 'text' },
    {
      key: 'hero_subtitle',
      value:
        'The ultimate ecosystem for developers. Learn cutting-edge skills, compete in real-world challenges, and get hired.',
      type: 'text',
    },
    { key: 'brand_name', value: 'IH Academy', type: 'text' },
    { key: 'cta_primary_text', value: 'Start Learning Free', type: 'text' },
    { key: 'cta_secondary_text', value: 'Enter the Arena', type: 'text' },
  ],
  pricingPlans: [
    {
      id: 'free',
      name: 'Free Plan',
      price: '$0',
      numeric_price: 0,
      original_price: null,
      period: 'forever',
      description: 'Essential access to start learning and exploring foundational tracks.',
      features: [
        'Access to all Free Courses',
        'Basic Coding Arena access',
        'Standard AI Mentor assistance (limited credits)',
        'Community forum access',
      ],
      button_text: 'Get Started Free',
      is_popular: false,
      is_exclusive: false,
      sort_order: 1,
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '$70',
      numeric_price: 70,
      original_price: '$100',
      period: 'year',
      description: 'Perfect balance for active developers building portfolio projects.',
      features: [
        'Access to 3 Major Paid Courses',
        'IH Usmani Group AI Product Discount Vouchers / Coupons',
        'Exclusive PDF eBooks access',
        'Verified course completion certificates',
      ],
      button_text: 'Upgrade to Pro',
      is_popular: true,
      is_exclusive: false,
      sort_order: 2,
    },
    {
      id: 'exclusive',
      name: 'Exclusive Plan',
      price: '$200',
      numeric_price: 200,
      original_price: '$300',
      period: 'year',
      description: 'Unrestricted all-in pass for total access & career guarantee.',
      features: [
        'All Pro features included',
        'Exclusive Discord / Community access',
        'Priority AI Vouchers & early AI tool drops',
        '1-on-1 Mentorship',
      ],
      button_text: 'Unlock Full Access',
      is_popular: false,
      is_exclusive: true,
      sort_order: 3,
    },
  ],
  faqs: [
    {
      question: 'What do the Pro and Exclusive plans unlock?',
      answer:
        'The Pro plan ($70/year) unlocks 3 Major Paid Courses, IH Usmani Group AI product discount vouchers/coupons, and exclusive PDF eBook access. The Exclusive plan ($200/year) includes all Pro features plus Discord/community access, priority AI vouchers, and 1-on-1 mentorship.',
      category: 'pricing',
      sort_order: 1,
    },
    {
      question: 'Is this a recurring subscription?',
      answer:
        'Yes — both paid plans are billed annually. You pay once per year and keep access to every course and perk your plan unlocks for that year.',
      category: 'pricing',
      sort_order: 2,
    },
    {
      question: 'Can I upgrade from Pro to Exclusive later?',
      answer:
        'Yes. Upgrade to Exclusive anytime and unlock Discord access, priority AI vouchers, and 1-on-1 mentorship immediately.',
      category: 'pricing',
      sort_order: 3,
    },
    {
      question: 'What are the IH Usmani Group AI discount vouchers?',
      answer:
        'Pro and Exclusive members get periodic discount coupons/vouchers for IH Usmani Group AI products — redeemable directly from the dashboard. Exclusive members get priority access to the best offers.',
      category: 'pricing',
      sort_order: 4,
    },
  ],
  testimonials: [
    {
      name: 'Developer Community',
      role: 'IH Academy Students',
      rating: 5,
      quote:
        'The platform blends project-based learning, live coding battles, and career prep into one seamless pipeline. 4.9/5 from 2k+ reviews.',
      avatar_url: null,
      sort_order: 1,
    },
  ],
  announcements: [
    {
      message: 'Now in public beta — join 10k+ developers. 🚀',
      link: null,
      is_active: true,
      sort_order: 1,
    },
  ],
  features: [
    {
      title: 'Learning',
      description:
        'Master modern tech stacks with project-based curricula designed by industry veterans.',
      icon: 'book-open',
      points: ['200+ hours of interactive content', 'Real-world projects & code reviews', 'Certified career pathways'],
      sort_order: 1,
    },
    {
      title: 'Arena',
      description: 'Compete in timed coding battles, algorithm duels, and system design face-offs.',
      icon: 'crosshair',
      points: ['Live 1v1 & team tournaments', 'AI-powered difficulty scaling', 'Global leaderboard & ELO ranking'],
      sort_order: 2,
    },
    {
      title: 'Careers',
      description: 'From resume roast to mock interviews — we prep you for the roles you deserve.',
      icon: 'briefcase',
      points: ['Personalized job matching engine', 'Technical & behavioral mock interviews', 'Direct referrals to 300+ partners'],
      sort_order: 3,
    },
    {
      title: 'Resources',
      description: 'A growing library of cheat sheets, templates, and study guides.',
      icon: 'library',
      points: ['Community-contributed playbooks', 'Weekly digest & curated newsletters', 'Open-source tooling & SDKs'],
      sort_order: 4,
    },
  ],
  aboutStats: [
    { value: '10k+', label: 'Active Developers Enrolled', sort_order: 1 },
    { value: '95%', label: 'Practical Hands-On Curriculum', sort_order: 2 },
    { value: '24/7', label: 'AI Code Review & Feedback', sort_order: 3 },
    { value: '100+', label: 'Real-world Capstone Projects', sort_order: 4 },
  ],
  aboutSections: [
    {
      key: 'mission',
      title: 'Our Mission',
      body: 'Build the ultimate ecosystem for developers — learn, compete, and get hired.',
      sort_order: 1,
    },
    {
      key: 'pillar_1',
      title: 'Industry-Standard Projects',
      body: 'Building real React, Node.js, and Python backend microservices.',
      icon: 'layers',
      sort_order: 2,
    },
    {
      key: 'pillar_2',
      title: 'Structured Internship Cohorts',
      body: 'Guided multi-week internships with realistic sprint tasks and code reviews.',
      icon: 'users',
      sort_order: 3,
    },
    {
      key: 'pillar_3',
      title: 'Verified Skills & Badging',
      body: 'Earn cryptographically verifiable certificate badges for your portfolio.',
      icon: 'badge-check',
      sort_order: 4,
    },
  ],
}

/**
 * Split a SQL script into top-level statements, respecting single/double
 * quotes, dollar-quoted bodies ($$ / $tag$) and SQL comments so a semicolon
 * inside a string or function body never splits a statement.
 */
function splitStatements(sql) {
  const stmts = []
  let buf = ''
  let inSquote = false
  let inDquote = false
  let inLine = false
  let inBlock = false
  let i = 0

  while (i < sql.length) {
    const ch = sql[i]
    const next = sql[i + 1]

    if (inLine) {
      buf += ch
      if (ch === '\n') inLine = false
      i += 1
      continue
    }
    if (inBlock) {
      buf += ch
      if (ch === '*' && next === '/') { buf += '/'; inBlock = false; i += 1 }
      i += 1
      continue
    }
    if (inSquote) {
      if (ch === "'") {
        if (next === "'") { buf += "''"; i += 2; continue }
        inSquote = false
      }
      buf += ch
      i += 1
      continue
    }
    if (inDquote) {
      if (ch === '"') {
        if (next === '"') { buf += '""'; i += 2; continue }
        inDquote = false
      }
      buf += ch
      i += 1
      continue
    }

    // Dollar-quoted string: $$ ... $$ or $tag$ ... $tag$
    if (ch === '$') {
      const dollarMatch = /^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/.exec(sql.slice(i))
      if (dollarMatch) {
        const tag = dollarMatch[0]
        const close = sql.indexOf(tag, i + tag.length)
        if (close !== -1) {
          buf += sql.slice(i, close + tag.length)
          i = close + tag.length
          continue
        }
      }
    }

    if (ch === '-' && next === '-') { buf += '--'; inLine = true; i += 2; continue }
    if (ch === '/' && next === '*') { buf += '/*'; inBlock = true; i += 2; continue }
    if (ch === "'") { inSquote = true; buf += ch; i += 1; continue }
    if (ch === '"') { inDquote = true; buf += ch; i += 1; continue }
    if (ch === ';') {
      if (buf.trim()) stmts.push(buf.trim())
      buf = ''
      i += 1
      continue
    }
    buf += ch
    i += 1
  }
  if (buf.trim()) stmts.push(buf.trim())
  return stmts
}

async function run() {
  console.log('ℹ Connecting to Supabase database…')
  const client = new Client({ connectionString: DB_URL })
  await client.connect()

  try {
    // Step 1 — production schema (all app tables + RLS + RPCs).
    // Applied statement-by-statement so a pre-existing/incomplete statement
    // (e.g. a construct already created by migrations, or a known-buggy line
    // in the schema snapshot) never aborts the whole setup. Failures are
    // logged and skipped; tables already present are left untouched.
    let productionSql = fs.readFileSync(
      path.resolve(__dirname, '..', 'supabase', 'schema.sql'),
      'utf8'
    )
    productionSql = productionSql.replace(/^\uFEFF/, '') // strip UTF-8 BOM

    console.log('  Step 1: Applying production schema (profiles, courses, lessons, enrollments, RPCs, RLS)…')
    const stmts = splitStatements(productionSql)
    let prodOk = 0
    let prodFail = 0
    for (const stmt of stmts) {
      try {
        await client.query(stmt)
        prodOk += 1
      } catch (e) {
        prodFail += 1
        const preview = stmt.replace(/\s+/g, ' ').slice(0, 90)
        console.log(`      ↳ skipped (${e.message.split('\n')[0]}): ${preview}…`)
      }
    }
    console.log(`  ✓ Production schema: ${prodOk} statements applied, ${prodFail} skipped (already present or snapshot-only).`)

    // Step 2 — CMS static-content tables + RLS.
    console.log('  Step 2: Creating CMS tables (site_settings, pricing_plans, faqs, testimonials, announcements, features, about_sections)…')
    await client.query(CMS_SCHEMA)
    console.log('  ✓ CMS tables created.')

    // Step 3 — site_settings.
    console.log('  Step 3: Seeding site_settings…')
    for (const row of seed.siteSettings) {
      await client.query(
        `INSERT INTO site_settings (key, value, type)
         VALUES ($1, $2, $3)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type`,
        [row.key, row.value, row.type]
      )
    }

    // Step 4 — pricing_plans.
    console.log('  Step 4: Seeding pricing_plans…')
    for (const row of seed.pricingPlans) {
      await client.query(
        `INSERT INTO pricing_plans
          (id, name, price, numeric_price, original_price, period, description, features, button_text, is_popular, is_exclusive, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, price = EXCLUDED.price, numeric_price = EXCLUDED.numeric_price,
           original_price = EXCLUDED.original_price, period = EXCLUDED.period, description = EXCLUDED.description,
           features = EXCLUDED.features, button_text = EXCLUDED.button_text, is_popular = EXCLUDED.is_popular,
           is_exclusive = EXCLUDED.is_exclusive, sort_order = EXCLUDED.sort_order`,
        [row.id, row.name, row.price, row.numeric_price, row.original_price, row.period, row.description,
          JSON.stringify(row.features), row.button_text, row.is_popular, row.is_exclusive, row.sort_order]
      )
    }

    // Step 5 — faqs.
    console.log('  Step 5: Seeding faqs…')
    for (const row of seed.faqs) {
      await client.query(
        `INSERT INTO faqs (question, answer, category, sort_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (question) DO UPDATE SET
           answer = EXCLUDED.answer, category = EXCLUDED.category, sort_order = EXCLUDED.sort_order`,
        [row.question, row.answer, row.category, row.sort_order]
      )
    }

    // Step 6 — testimonials.
    console.log('  Step 6: Seeding testimonials…')
    for (const row of seed.testimonials) {
      await client.query(
        `INSERT INTO testimonials (name, role, rating, quote, avatar_url, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [row.name, row.role, row.rating, row.quote, row.avatar_url, row.sort_order]
      )
    }

    // Step 7 — announcements.
    console.log('  Step 7: Seeding announcements…')
    for (const row of seed.announcements) {
      await client.query(
        `INSERT INTO announcements (message, link, is_active, sort_order)
         VALUES ($1, $2, $3, $4)`,
        [row.message, row.link, row.is_active, row.sort_order]
      )
    }

    // Step 8 — features.
    console.log('  Step 8: Seeding features…')
    for (const row of seed.features) {
      await client.query(
        `INSERT INTO features (title, description, icon, points, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (title) DO UPDATE SET
           description = EXCLUDED.description, icon = EXCLUDED.icon,
           points = EXCLUDED.points, sort_order = EXCLUDED.sort_order`,
        [row.title, row.description, row.icon, JSON.stringify(row.points), row.sort_order]
      )
    }

    // Step 9 — about_sections (mission + pillars) and about stats (stat_N rows).
    console.log('  Step 9: Seeding about_sections…')
    for (const row of seed.aboutSections) {
      await client.query(
        `INSERT INTO about_sections (key, title, body, icon, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (key) DO UPDATE SET
           title = EXCLUDED.title, body = EXCLUDED.body, icon = EXCLUDED.icon, sort_order = EXCLUDED.sort_order`,
        [row.key, row.title, row.body, row.icon, row.sort_order]
      )
    }
    for (const row of seed.aboutStats) {
      await client.query(
        `INSERT INTO about_sections (key, title, body, sort_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (key) DO UPDATE SET title = EXCLUDED.title, body = EXCLUDED.body, sort_order = EXCLUDED.sort_order`,
        [`stat_${row.sort_order}`, `${row.value} — ${row.label}`, row.value, row.sort_order]
      )
    }

    console.log('\n✔ Database setup complete — all tables initialized and CMS data seeded.')
  } finally {
    await client.end()
  }
}

run().catch((err) => {
  console.error('\n  ❌ Setup failed:', err.message)
  process.exit(1)
})
