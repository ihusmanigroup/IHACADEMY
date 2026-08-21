/**
 * IH Academy — Add intern_applications.updated_at
 * ------------------------------------------------------------------
 * Usage (from repo root):
 *   node scripts/add-intern-app-updated-at.js
 *
 * Adds `updated_at` to `intern_applications` so re-applications can stamp a
 * fresh submission timestamp when a rejected applicant re-applies. Idempotent.
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
      ALTER TABLE public.intern_applications
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
    `)
    await client.query("NOTIFY pgrst, 'reload schema'")

    const { rows } = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'intern_applications'
        AND column_name = 'updated_at'
    `)
    if (rows.length) {
      console.log('  ✓ intern_applications.updated_at ready.')
    } else {
      console.warn('  ⚠ Could not confirm the new column.')
    }
  } finally {
    await client.end()
  }
}

run().catch((err) => {
  console.error('\n  ❌ Failed:', err.message)
  process.exit(1)
})
