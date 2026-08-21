/**
 * IH Academy — Database Wipe Script
 *
 * Usage:
 *   node scripts/wipe-database.js
 */

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
  console.log('  🔌 Connecting to Supabase PostgreSQL...')
  const pool = new Pool(DB_CONFIG)

  try {
    const client = await pool.connect()
    console.log('  ✅ Connected.')

    // Tables to wipe in order (respecting foreign key dependencies)
    const tables = [
      'lesson_completions',
      'quizzes',
      'enrollments',
      'lessons',
      'courses'
    ]

    console.log('  🧹 Wiping database tables...')

    for (const table of tables) {
      console.log(`    Deleting all rows from ${table}...`)
      const result = await client.query(`DELETE FROM public.${table}`)
      console.log(`    ✅ ${table}: ${result.rowCount} rows deleted`)
    }

    console.log('')
    console.log('  🔍 Verifying all tables are empty...')

    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) as count FROM public.${table}`)
      const count = parseInt(result.rows[0].count)
      console.log(`    ${table}: ${count} rows`)
      
      if (count !== 0) {
        console.error(`    ❌ ERROR: ${table} is not empty!`)
        process.exit(1)
      }
    }

    console.log('')
    console.log('  ✅ Database wipe complete — all tables are empty (0 rows).')
    console.log('')

    client.release()
  } catch (err) {
    console.error('  ❌ Wipe failed:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

run()
