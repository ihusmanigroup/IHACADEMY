/**
 * IH Academy — Add price & free flag to internship_seasons
 * ------------------------------------------------------------------
 * Usage (from repo root):
 *   node scripts/add-season-price-free.js
 *
 * Adds minimal columns so the Careers page can render fee badges
 * directly from the DB record.
 *
 * Idempotent + PostgREST schema reload.
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

async function run() {
  console.log('ℹ Connecting to Supabase database…')
  const client = new Client({ connectionString: DB_URL })
  await client.connect()

  try {
    await client.query(`
      ALTER TABLE public.internship_seasons
        ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0,
        ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true;
    `)

    console.log('  Reloading PostgREST schema cache…')
    await client.query("NOTIFY pgrst, 'reload schema'")

    const { rows } = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'internship_seasons'
        AND column_name IN ('price', 'is_free')
      ORDER BY column_name
    `)
    console.log('\n  Confirmed:')
    for (const r of rows) console.log(`    - ${r.column_name} ${r.data_type} default=${r.column_default}`)

    console.log('\n✔ internship_seasons price/is_free ready.')
  } finally {
    await client.end()
  }
}

run().catch((err) => {
  console.error('\n  ❌ Failed:', err.message)
  process.exit(1)
})