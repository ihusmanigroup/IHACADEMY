/**
 * IH Academy — Quizzes Table Migration Runner
 *
 * Usage:
 *   node scripts/run-quizzes-migration.js
 */

const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

// Explicit connection parameters
const DB_CONFIG = {
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.dolfyahvhqsszjzsjgsi',
  password: 'IhAcademy#2026$DbSecure!',
  ssl: { rejectUnauthorized: false }
}

async function run() {
  const sqlPath = path.resolve(__dirname, '..', 'supabase', 'migrations', '20260729000009_add_quizzes_table.sql')

  if (!fs.existsSync(sqlPath)) {
    console.error(`  ❌ Migration file not found: ${sqlPath}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(sqlPath, 'utf-8')

  console.log('  🔌 Connecting to Supabase PostgreSQL...')
  const pool = new Pool(DB_CONFIG)

  try {
    const client = await pool.connect()
    console.log('  ✅ Connected. Executing quizzes table migration...')
    await client.query(sql)
    client.release()
    console.log('  ✅ Quizzes table migration complete.')
  } catch (err) {
    console.error('  ❌ Migration failed:', err.message)
    console.error('  Full error:', err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

run()
