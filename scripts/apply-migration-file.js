/**
 * IH Academy — Apply a single migration file to the live DB.
 *
 * Usage:
 *   node scripts/apply-migration-file.js supabase/migrations/20260812000001_backfill_lesson_metadata.sql
 */

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

try {
  const envPath = path.resolve(__dirname, '..', '.env')
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const t = line.trim()
    if (t && !t.startsWith('#')) {
      const i = t.indexOf('=')
      if (i > 0) {
        const k = t.slice(0, i).trim()
        if (!process.env[k]) process.env[k] = t.slice(i + 1).trim()
      }
    }
  })
} catch (_) {}

const DB_URL = process.env.SUPABASE_DB_URL
const fileArg = process.argv[2]
if (!DB_URL) {
  console.error('  ❌ SUPABASE_DB_URL not set in root .env')
  process.exit(1)
}
if (!fileArg) {
  console.error('  ❌ Usage: node scripts/apply-migration-file.js <path-to-sql>')
  process.exit(1)
}

const sqlPath = path.resolve(process.cwd(), fileArg)
if (!fs.existsSync(sqlPath)) {
  console.error(`  ❌ File not found: ${sqlPath}`)
  process.exit(1)
}

async function run() {
  const sql = fs.readFileSync(sqlPath, 'utf8')
  console.log(`  🔌 Applying: ${fileArg}`)
  const client = new Client({ connectionString: DB_URL })
  await client.connect()
  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('  ✅ Applied successfully.')
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('  ❌ Failed:', err.message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

run()