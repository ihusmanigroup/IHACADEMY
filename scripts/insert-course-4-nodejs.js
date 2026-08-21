/**
 * IH Academy — Course 4: Node.js & Backend Architecture
 * Loads rich 500+ word topic content from course-data/course-4.json
 *
 * Usage:
 *   node scripts/insert-course-4-nodejs.js
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

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
  const pool = new Pool({ ...DB_CONFIG, statement_timeout: 30000 })

  const coursePath = path.join(__dirname, '..', 'course-data', 'course-4.json')
  if (!fs.existsSync(coursePath)) {
    console.error('  ❌ course-data/course-4.json not found.')
    process.exit(1)
  }

  const courseData = JSON.parse(fs.readFileSync(coursePath, 'utf-8'))

  try {
    const client = await pool.connect()
    console.log('  ✅ Connected.')

    await client.query('BEGIN')
    console.log('  📝 Transaction started.')

    try {
      console.log(`  📚 Inserting course: ${courseData.title}`)
      const courseResult = await client.query(
        `INSERT INTO public.courses (title, description, category, level, thumbnail_url, total_lessons, xp_reward, price, is_free, is_pro)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          courseData.title, courseData.description, courseData.category,
          courseData.level, courseData.thumbnail_url || null,
          courseData.lessons.length, courseData.xp_reward || 60,
          courseData.price ?? 0, courseData.pricing_type === 'Free', false
        ]
      )
      const courseId = courseResult.rows[0].id
      console.log(`  ✅ Course inserted with ID: ${courseId}`)

      for (const lesson of courseData.lessons) {
        console.log(`  📖 Inserting lesson: ${lesson.title}`)

        let content
        if (typeof lesson.content === 'string') {
          content = lesson.content
        } else if (lesson.content && lesson.content.topics) {
          content = JSON.stringify(lesson.content)
        } else {
          content = JSON.stringify({ topics: [{ topic_id: 1, title: lesson.title, content: lesson.content || '' }] })
        }

        const lessonResult = await client.query(
          `INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [courseId, lesson.title, content, lesson.duration_mins || 30, lesson.lesson_order]
        )
        console.log(`  ✅ Lesson inserted with ID: ${lessonResult.rows[0].id}`)

        if (lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0) {
          console.log(`  ❓ Inserting quiz: ${lesson.quiz.title || 'Knowledge Check'}`)
          await client.query(
            `INSERT INTO public.quizzes (lesson_id, title, questions)
             VALUES ($1, $2, $3)`,
            [lessonResult.rows[0].id, lesson.quiz.title || 'Knowledge Check', JSON.stringify(lesson.quiz.questions)]
          )
          console.log('  ✅ Quiz inserted')
        }
      }

      await client.query('COMMIT')
      console.log('  ✅ Transaction committed.')
      console.log(`\n  🎉 Course "${courseData.title}" insertion complete!`)

    } catch (err) {
      await client.query('ROLLBACK')
      console.error('  ❌ Transaction rolled back:', err.message)
      throw err
    }

    client.release()
  } catch (err) {
    console.error('  ❌ Insertion failed:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

run()
