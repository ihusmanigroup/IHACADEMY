/**
 * IH Academy — Reset User Progress
 * Resets ALL course progress for a given user (enrollments, lesson_completions, xp, streak).
 *
 * Usage:
 *   node scripts/reset-user-progress.js <user-email>
 *
 * Example:
 *   node scripts/reset-user-progress.js student@example.com
 */

const { Pool } = require('pg')
const readline = require('readline')

const DB_CONFIG = {
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.dolfyahvhqsszjzsjgsi',
  password: 'IhAcademy#2026$DbSecure!',
  ssl: { rejectUnauthorized: false },
}

function askConfirmation(msg) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(msg, (ans) => { rl.close(); resolve(ans.toLowerCase() === 'y' || ans.toLowerCase() === 'yes') })
  })
}

async function run() {
  const email = process.argv[2]
  if (!email) {
    console.error('  ❌ Usage: node scripts/reset-user-progress.js <user-email>')
    process.exit(1)
  }

  const pool = new Pool({ ...DB_CONFIG, statement_timeout: 30000 })

  try {
    const client = await pool.connect()
    console.log('  ✅ Connected to Supabase PostgreSQL.\n')

    const userRes = await client.query('SELECT id, email FROM auth.users WHERE email = $1', [email])
    if (userRes.rows.length === 0) {
      console.error(`  ❌ No user found with email: ${email}`)
      process.exit(1)
    }
    const userId = userRes.rows[0].id
    console.log(`  👤 Found user: ${email} (${userId})\n`)

    const enrollCount = (await client.query('SELECT COUNT(*) FROM enrollments WHERE user_id = $1', [userId])).rows[0].count
    const lessonCount = (await client.query('SELECT COUNT(*) FROM lesson_completions WHERE user_id = $1', [userId])).rows[0].count

    console.log(`  📊 Current state:`)
    console.log(`     Enrollments:       ${enrollCount}`)
    console.log(`     Lesson completions: ${lessonCount}`)
    console.log()

    const confirmed = await askConfirmation('  ⚠️  This will DELETE all progress for this user. Continue? (y/N): ')
    if (!confirmed) {
      console.log('  ✋ Cancelled.')
      process.exit(0)
    }

    await client.query('BEGIN')

    await client.query('DELETE FROM lesson_completions WHERE user_id = $1', [userId])
    console.log('  ✅ Deleted lesson_completions')

    await client.query('DELETE FROM enrollments WHERE user_id = $1', [userId])
    console.log('  ✅ Deleted enrollments')

    await client.query("UPDATE profiles SET xp = 0, streak_count = 0 WHERE id = $1", [userId])
    console.log('  ✅ Reset XP and streak to 0')

    await client.query('COMMIT')
    console.log(`\n  🎉 Progress reset complete for ${email}!`)
    console.log('     Enrollments, lesson completions, XP, and streak have been cleared.')

    client.release()
  } catch (err) {
    console.error('  ❌ Reset failed:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

run()
