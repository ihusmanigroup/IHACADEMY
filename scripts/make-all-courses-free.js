/**
 * IH Academy — Make All Courses 100% Free
 *
 * Updates every row in the courses table:
 *   price = 0, is_free = true
 *
 * Usage:
 *   node scripts/make-all-courses-free.js
 */

const { Pool } = require('pg')

const DB_CONFIG = {
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.dolfyahvhqsszjzsjgsi',
  password: 'IhAcademy#2026$DbSecure!',
  ssl: { rejectUnauthorized: false }
}

async function run() {
  console.log('  🔌 Connecting to Supabase PostgreSQL...')
  const pool = new Pool(DB_CONFIG)

  try {
    const result = await pool.query(
      `UPDATE public.courses SET price = 0, is_free = true`
    )
    console.log(`  ✅ Updated ${result.rowCount} courses — all now FREE (price=0, is_free=true).`)
  } catch (err) {
    console.error('  ❌ Update failed:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

run()
