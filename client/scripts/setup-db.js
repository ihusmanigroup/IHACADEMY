/**
 * IH Academy — Automated Database Initialization & Seeding
 * ------------------------------------------------------------------
 * Run from the repo root (client/):
 *   npm run db:setup
 *
 * This script connects to your Supabase Postgres database using the DIRECT
 * connection string (NOT the SQL editor), creates every CMS table with
 * public-read RLS, and seeds it with the site's current static content so the
 * frontend can be refactored to fetch dynamically.
 *
 * Required environment variable (add to client/.env):
 *   SUPABASE_DB_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
 *   (or the direct non-pooled connection string from Supabase → Settings →
 *   Database → Connection string → "Direct connection".)
 *
 * Using the Postgres wire protocol is the only way to run DDL (CREATE TABLE,
 * ALTER TABLE ... ENABLE ROW LEVEL SECURITY) programmatically — the anon key
 * only has REST access and cannot create tables or policies.
 */

import { config as loadEnv } from 'dotenv'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// Load client/.env so VITE_* + SUPABASE_* are both available.
loadEnv({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env') })

const DB_URL = process.env.SUPABASE_DB_URL

if (!DB_URL) {
  console.error('✖ Missing SUPABASE_DB_URL in client/.env')
  console.error('  Add the Direct connection string from Supabase → Settings → Database.')
  process.exit(1)
}

const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8')

const seed = {
  siteSettings: [
    {
      key: 'hero_badge',
      value: '✨ Now in public beta — join 10k+ developers',
      type: 'text',
    },
    {
      key: 'hero_title_line_1',
      value: 'Master Tech.',
      type: 'text',
    },
    {
      key: 'hero_title_line_2',
      value: 'Enter the Arena.',
      type: 'text',
    },
    {
      key: 'hero_title_line_3',
      value: 'Land the Job.',
      type: 'text',
    },
    {
      key: 'hero_subtitle',
      value:
        'The ultimate ecosystem for developers. Learn cutting-edge skills, compete in real-world challenges, and get hired.',
      type: 'text',
    },
    {
      key: 'brand_name',
      value: 'IH Academy',
      type: 'text',
    },
    {
      key: 'cta_primary_text',
      value: 'Start Learning Free',
      type: 'text',
    },
    {
      key: 'cta_secondary_text',
      value: 'Enter the Arena',
      type: 'text',
    },
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

console.log('ℹ Connecting to Supabase database…')
console.log('  Step 1: Running schema (tables + RLS)…')

const { default: pg } = await import('pg')
const client = new pg.Client({ connectionString: DB_URL })
await client.connect()

try {
  await client.query(schema)
  console.log('  ✓ Schema applied (9 CMS tables + RLS).')

  console.log('  Step 2: Seeding site_settings…')
  for (const row of seed.siteSettings) {
    await client.query(
      `INSERT INTO site_settings (key, value, type)
       VALUES ($1, $2, $3)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type`,
      [row.key, row.value, row.type]
    )
  }

  console.log('  Step 3: Seeding pricing_plans…')
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

  console.log('  Step 4: Seeding faqs…')
  for (const row of seed.faqs) {
    await client.query(
      `INSERT INTO faqs (question, answer, category, sort_order)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (question) DO UPDATE SET
         answer = EXCLUDED.answer, category = EXCLUDED.category, sort_order = EXCLUDED.sort_order`,
      [row.question, row.answer, row.category, row.sort_order]
    )
  }

  console.log('  Step 5: Seeding testimonials…')
  for (const row of seed.testimonials) {
    await client.query(
      `INSERT INTO testimonials (name, role, rating, quote, avatar_url, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [row.name, row.role, row.rating, row.quote, row.avatar_url, row.sort_order]
    )
  }

  console.log('  Step 6: Seeding announcements…')
  for (const row of seed.announcements) {
    await client.query(
      `INSERT INTO announcements (message, link, is_active, sort_order)
       VALUES ($1, $2, $3, $4)`,
      [row.message, row.link, row.is_active, row.sort_order]
    )
  }

  console.log('  Step 7: Seeding features…')
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

  console.log('  Step 8: Seeding about_sections…')
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

  // NOTE: `courses`, `lessons`, `internship_tracks` and `internship_weeks`
  // are production tables already seeded (Courses page, LessonPlayer, and the
  // Winter Internship read them). We intentionally do NOT manage them here.

  console.log('\n✔ Database setup complete (7 CMS tables created + seeded).')
} finally {
  await client.end()
}
