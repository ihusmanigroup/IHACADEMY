/**
 * IH Academy — Delete the old free courses (being replaced by the new
 * 8-course curriculum), respecting FK order (children first).
 *
 * Usage:
 *   node scripts/delete-courses.js
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

const OLD_COURSE_IDS = [
  '4475d40b-6d6d-49e9-a06b-b0719298df8d', // Git & GitHub for Beginners
  'd3a2bb67-839a-46b3-97f6-765b8c39d22d', // HTML & CSS Basics
  'd0af38df-6bbe-4082-8b10-371e4ccbcff0', // React.js & Modern Web Apps
  'aa244263-0441-4e8d-9d8e-bec7753c0ba0', // Node.js & Backend Architecture
  'a9b4899f-fd7a-4ddb-a392-924c19d06f0f', // Full-Stack Web Development & Databases
]

async function run() {
  const pool = new Pool({ ...DB_CONFIG, statement_timeout: 60000 })
  const client = await pool.connect()

  try {
    const { rows } = await client.query(
      'SELECT id, title FROM public.courses WHERE id = ANY($1)',
      [OLD_COURSE_IDS]
    )
    if (rows.length === 0) {
      console.log('  ⚠️  No matching courses found — nothing to delete.')
      return
    }

    rows.forEach((r) => console.log(`  📚 Will delete: ${r.title} (${r.id})`))

    await client.query('BEGIN')

    for (const course of rows) {
      const lessons = await client.query(
        'SELECT id FROM public.lessons WHERE course_id = $1',
        [course.id]
      )
      const lessonIds = lessons.rows.map((l) => l.id)

      if (lessonIds.length > 0) {
        await client.query(
          'DELETE FROM public.lesson_completions WHERE course_id = $1 OR lesson_id = ANY($2)',
          [course.id, lessonIds]
        )
        await client.query(
          'DELETE FROM public.quizzes WHERE lesson_id = ANY($1)',
          [lessonIds]
        )
        await client.query(
          'DELETE FROM public.enrollments WHERE course_id = $1',
          [course.id]
        )
        await client.query(
          'DELETE FROM public.lessons WHERE course_id = $1',
          [course.id]
        )
      }

      await client.query('DELETE FROM public.courses WHERE id = $1', [course.id])
      console.log(`  ✅ Deleted ${course.title}`)
    }

    await client.query('COMMIT')
    console.log('\n  🎉 Old free courses removed successfully.')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('  ❌ Delete failed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

run()
