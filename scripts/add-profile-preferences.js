/**
 * IH Academy — Add Profile Preferences Columns
 * ------------------------------------------------------------------
 * Usage (from repo root):
 *   node scripts/add-profile-preferences.js
 *
 * Adds the settings-persistence columns to `profiles` used by the
 * Account Settings → "Save Preferences" button:
 *   - email_notifications  JSONB  (per-channel notification toggles)
 *   - theme                VARCHAR (stored theme override for the app)
 *
 * Both are idempotent (ADD COLUMN IF NOT EXISTS) with a sensible default
 * so existing rows are backfilled. After the ALTER it sends the PostgREST
 * "reload schema" notice so the REST API picks up the new columns without
 * a manual dashboard refresh (prevents schema-cache 4xx errors on save).
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

const ALTER_PROFILES = `
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_notifications JSONB
    DEFAULT '{"course_updates": true, "certificate_alerts": true, "arena_announcements": true, "career_opportunities": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'light';
`

async function run() {
  console.log('ℹ Connecting to Supabase database…')
  const client = new Client({ connectionString: DB_URL })
  await client.connect()

  try {
    console.log('  Step 1: Adding email_notifications + theme to profiles…')
    await client.query(ALTER_PROFILES)
    console.log('  ✓ Columns added (or already present).')

    console.log('  Step 2: Reloading PostgREST schema cache…')
    await client.query("NOTIFY pgrst, 'reload schema'")
    console.log('  ✓ Schema cache reload notice sent.')

    const { rows } = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles'
        AND column_name IN ('email_notifications', 'theme')
      ORDER BY column_name
    `)
    if (rows.length === 0) {
      console.warn('  ⚠ Could not confirm the new columns. Check the ALTER output above.')
    } else {
      console.log('\n  Confirmed columns:')
      for (const r of rows) {
        console.log(`    - ${r.column_name}  ${r.data_type}${r.column_default ? `  default=${r.column_default}` : ''}`)
      }
    }

    console.log('\n✔ Profile preferences columns ready.')
  } finally {
    await client.end()
  }
}

run().catch((err) => {
  console.error('\n  ❌ Failed:', err.message)
  process.exit(1)
})
