/**
 * IH Academy — Database Migration Runner
 *
 * Usage:
 *   set SUPABASE_DB_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
 *   node scripts/run-migration.js
 *
 * Or create a .env file in the project root with:
 *   SUPABASE_DB_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
 */

const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

// Try loading .env from project root
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
  console.error('')
  console.error('  ❌ SUPABASE_DB_URL not set.')
  console.error('')
  console.error('  To get your connection string:')
  console.error('    1. Go to https://supabase.com/dashboard/project/dolfyahvhqsszjzsjgsi/settings/database')
  console.error('    2. Copy the "Connection string" under "Direct connection"')
  console.error('    3. Run:')
  console.error('       set SUPABASE_DB_URL=postgresql://postgres:YOUR_PASSWORD@db.dolfyahvhqsszjzsjgsi.supabase.co:5432/postgres')
  console.error('       node scripts/run-migration.js')
  console.error('')
  process.exit(1)
}

async function run() {
  const sqlPath = path.resolve(__dirname, '..', 'supabase', 'schema.sql')

  if (!fs.existsSync(sqlPath)) {
    console.error(`  ❌ Schema file not found: ${sqlPath}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(sqlPath, 'utf-8')

  console.log('  🔌 Connecting to Supabase PostgreSQL...')
  const pool = new Pool({ connectionString: DB_URL })

  try {
    const client = await pool.connect()
    console.log('  ✅ Connected. Executing schema...')
    await client.query(sql)
    client.release()
    console.log('  ✅ Migration complete — all tables and policies created.')
  } catch (err) {
    console.error('  ❌ Migration failed:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

run()
