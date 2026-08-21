/**
 * IH Academy — Reset ALL Users' Learning Progress (full clean slate)
 *
 * Empties every learning-progress table and zeroes XP/streak for every user.
 * Auth accounts, the course catalog, and intern/portal data are untouched.
 *
 * Effect:
 *   - Paid (PRO) users: enrollment rows (user_course_progress) are deleted →
 *     the catalog/roadmap show them as not enrolled again. Client-side temp
 *     PRO enrollments (ih_temp_enrollments) are wiped on next sign-out.
 *   - Free users: all lesson_completions are deleted → they restart from
 *     lesson 1 of any course they re-enter.
 *   - Dashboard stats (Active Courses / Completed / Certifications / XP /
 *     Streak) are computed from these tables, so they read 0 for every user.
 *
 * Usage:
 *   node scripts/reset-all-progress.js
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
  const pool = new Pool({ ...DB_CONFIG, statement_timeout: 60000 })
  let client = null

  try {
    client = await pool.connect()
    console.log('  ✅ Connected to Supabase PostgreSQL.\n')

    const count = async (sql) => (await client.query(sql)).rows[0].c

    const tableExists = async (name) => {
      const r = await client.query(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1) AS e",
        [name]
      )
      return r.rows[0].e
    }

    const hasEnrollments = await tableExists('enrollments')
    const hasLessonCompletions = await tableExists('lesson_completions')
    const hasUserCourseProgress = await tableExists('user_course_progress')

    const enrollCount = hasEnrollments ? await count('SELECT COUNT(*)::int AS c FROM enrollments') : 0
    const lessonCount = hasLessonCompletions ? await count('SELECT COUNT(*)::int AS c FROM lesson_completions') : 0
    const proCount = hasUserCourseProgress ? await count('SELECT COUNT(*)::int AS c FROM user_course_progress') : 0
    const statsCount = await count('SELECT COUNT(*)::int AS c FROM profiles WHERE xp <> 0 OR streak_count <> 0')

    console.log('  📊 Current state (ALL users):')
    console.log(`     enrollments:            ${enrollCount}${hasEnrollments ? '' : '  (table missing — skipping)'}`)
    console.log(`     lesson_completions:     ${lessonCount}${hasLessonCompletions ? '' : '  (table missing — skipping)'}`)
    console.log(`     user_course_progress:   ${proCount}${hasUserCourseProgress ? '' : '  (table missing — skipping)'}`)
    console.log(`     profiles w/ XP|streak:  ${statsCount}`)
    console.log()

    const confirmed = await askConfirmation('  ⚠️  FULL RESET for ALL users — this cannot be undone. Continue? (y/N): ')
    if (!confirmed) {
      console.log('  ✋ Cancelled.')
      process.exit(0)
    }

    await client.query('BEGIN')

    if (hasEnrollments) {
      await client.query('DELETE FROM enrollments')
      console.log('  ✅ Emptied enrollments (free/DB course enrollments)')
    }

    if (hasLessonCompletions) {
      await client.query('DELETE FROM lesson_completions')
      console.log('  ✅ Emptied lesson_completions (every lesson resets to locked, lesson 1 active)')
    }

    if (hasUserCourseProgress) {
      await client.query('DELETE FROM user_course_progress')
      console.log('  ✅ Emptied user_course_progress (PRO track enrollments + ML Major progress)')
    }

    await client.query('UPDATE profiles SET xp = 0, streak_count = 0')
    console.log('  ✅ Reset XP and streak to 0 for all profiles')

    await client.query('COMMIT')
    console.log('\n  🎉 Full reset complete for ALL users.')
    console.log('     - Auth users, course catalog, intern/portal data: untouched.')
    console.log('\n  📱 Frontend sync:')
    console.log('     - Dashboard stats (Active Courses / Completed / Certifications) are')
    console.log('       computed from these tables, so every user now sees 0.')
    console.log('     - Client-side caches (active course, local progress, temp PRO enrollments)')
    console.log('       auto-clear on sign-out — ask users to log out & back in, or reload,')
    console.log('       to drop any leftover browser state.')
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {})
    console.error('  ❌ Reset failed:', err.message)
    process.exit(1)
  } finally {
    if (client) client.release()
    await pool.end()
  }
}

run()
