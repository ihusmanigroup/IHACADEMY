/**
 * IH Academy — LinkedIn Onboarding + Certificate Overlay Columns
 * ------------------------------------------------------------------
 * Usage (from repo root):
 *   node scripts/add-linkedin-post-and-cert-cols.js
 *
 * 1. Adds `linkedin_post_url` to `intern_applications` so approved interns
 *    can submit the mandatory LinkedIn announcement link that unlocks the
 *    strict onboarding gate in the Intern Portal.
 * 2. Adds per-template overlay tuning columns to `certificate_templates`
 *    so the admin can position the intern's name on the uploaded certificate
 *    image. The portal canvas renderer falls back to these defaults when the
 *    columns are absent.
 *
 * Idempotent (ADD COLUMN IF NOT EXISTS) + PostgREST schema reload.
 *
 * Required env var (see .env): SUPABASE_DB_URL
 */

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

try {
  const envPath = path.resolve(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
      const t = line.trim()
      if (t && !t.startsWith('#')) {
        const i = t.indexOf('=')
        if (i > 0) {
          const k = t.slice(0, i).trim()
          const v = t.slice(i + 1).trim()
          if (!process.env[k]) process.env[k] = v
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

const STEPS = [
  {
    name: 'intern_applications.linkedin_post_url',
    sql: `ALTER TABLE public.intern_applications
      ADD COLUMN IF NOT EXISTS linkedin_post_url TEXT;`,
  },
  {
    name: 'certificate_templates.name_offset_x (percent, default 50)',
    sql: `ALTER TABLE public.certificate_templates
      ADD COLUMN IF NOT EXISTS name_offset_x INT DEFAULT 50;`,
  },
  {
    name: 'certificate_templates.name_offset_y (percent, default 60)',
    sql: `ALTER TABLE public.certificate_templates
      ADD COLUMN IF NOT EXISTS name_offset_y INT DEFAULT 60;`,
  },
  {
    name: 'certificate_templates.name_font_size (px, default 30)',
    sql: `ALTER TABLE public.certificate_templates
      ADD COLUMN IF NOT EXISTS name_font_size INT DEFAULT 30;`,
  },
  {
    name: 'certificate_templates.name_color (default #1E293B)',
    sql: `ALTER TABLE public.certificate_templates
      ADD COLUMN IF NOT EXISTS name_color TEXT DEFAULT '#1E293B';`,
  },
]

async function run() {
  console.log('ℹ Connecting to Supabase database…')
  const client = new Client({ connectionString: DB_URL })
  await client.connect()

  try {
    for (const step of STEPS) {
      console.log(`  ${step.name}…`)
      await client.query(step.sql)
    }

    console.log('  Reloading PostgREST schema cache…')
    await client.query("NOTIFY pgrst, 'reload schema'")

    const { rows } = await client.query(`
      SELECT column_name, table_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND (
          (table_name = 'intern_applications' AND column_name = 'linkedin_post_url')
          OR (table_name = 'certificate_templates' AND column_name IN ('name_offset_x','name_offset_y','name_font_size','name_color'))
        )
      ORDER BY table_name, column_name
    `)
    if (!rows.length) {
      console.warn('  ⚠ Could not confirm the new columns. Check the ALTER output above.')
    } else {
      console.log('\n  Confirmed:')
      for (const r of rows) console.log(`    - ${r.table_name}.${r.column_name}`)
    }

    console.log('\n✔ LinkedIn onboarding + certificate overlay columns ready.')
  } finally {
    await client.end()
  }
}

run().catch((err) => {
  console.error('\n  ❌ Failed:', err.message)
  process.exit(1)
})
