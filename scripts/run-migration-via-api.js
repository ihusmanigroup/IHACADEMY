/**
 * Run DB migration via Supabase Management API over HTTPS (port 443).
 * Uses @supabase/supabase-js + raw fetch for Management API.
 *
 * Usage:
 *   1. set SUPABASE_PAT=your_personal_access_token
 *   2. node scripts/run-migration-via-api.js
 *
 * Get a PAT: https://supabase.com/dashboard/account/tokens
 * Project ref: dolfyahvhqsszjzsjgsi
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load .env
try {
  const envPath = path.resolve(__dirname, '..', 'client', '.env')
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

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dolfyahvhqsszjzsjgsi.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const PAT = process.env.SUPABASE_PAT
const PROJECT_REF = 'dolfyahvhqsszjzsjgsi'

async function run() {
  // Step 1: check if columns already exist (via supabase-js REST API)
  if (SUPABASE_ANON_KEY) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { error } = await supabase.from('profiles').select('username').limit(1)
    if (!error) {
      console.log('Columns already exist — no migration needed.')
      return
    }
    if (error && !error.message?.includes('column')) {
      console.log('Unexpected error:', error.message)
      // Continue anyway to try the migration
    }
    console.log('Detected missing columns — attempting migration...')
  } else {
    console.log('No anon key found — attempting migration directly...')
  }

  // Step 2: run DDL via Management API (requires PAT)
  if (!PAT) {
    console.log('')
    console.log('Direct DB connection is unavailable (IPv6 only, unreachable from this network).')
    console.log('Supabase REST API on port 443 IS reachable, but cannot run DDL (ALTER TABLE).')
    console.log('')
    console.log('Option A — Run the migration manually:')
    console.log('  1. Go to https://supabase.com/dashboard/project/dolfyahvhqsszjzsjgsi/sql/new')
    console.log('  2. Paste the SQL from supabase/migrations/20260729000011_add_profile_settings.sql')
    console.log('  3. Click "Run"')
    console.log('')
    console.log('Option B — Use the Management API:')
    console.log('  set SUPABASE_PAT=your_token')
    console.log('  node scripts/run-migration-via-api.js')
    console.log('')
    console.log('  Get a PAT: https://supabase.com/dashboard/account/tokens')
    return
  }

  const sql = fs.readFileSync(
    path.resolve(__dirname, '..', 'supabase', 'migrations', '20260729000011_add_profile_settings.sql'),
    'utf-8'
  )

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  if (res.ok) {
    console.log('Migration completed successfully.')
  } else {
    const text = await res.text()
    console.log(`Failed (${res.status}):`, text)
  }
}

run().catch((e) => console.error('Error:', e.message))
