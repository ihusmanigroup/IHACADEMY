/**
 * IH Academy — Add 'revoked' status to intern_applications
 * ------------------------------------------------------------------
 * Usage (from repo root):
 *   node scripts/add-revoked-status.js
 *
 * Adds 'revoked' to the status check constraint so admins can
 * explicitly revoke access separate from rejection.
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
    // Drop and recreate the check constraint with 'revoked' added
    await client.query(`
      ALTER TABLE public.intern_applications
        DROP CONSTRAINT IF EXISTS intern_applications_status_check;
    `)

    await client.query(`
      ALTER TABLE public.intern_applications
        ADD CONSTRAINT intern_applications_status_check
        CHECK (status IN ('pending', 'approved', 'rejected', 'revoked'));
    `)

    await client.query("NOTIFY pgrst, 'reload schema'")

    console.log('  ✓ Status constraint updated to include "revoked".')
  } finally {
    await client.end()
  }
}

run().catch((err) => {
  console.error('\n  ❌ Failed:', err.message)
  process.exit(1)
})