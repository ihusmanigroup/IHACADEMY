/**
 * IH Academy — Structured Course Seeder
 *
 * Seeds every course in course-data/*.json following the strict
 * curriculum structure:
 *
 *   Course
 *   └── Module 1..4            (module_order column)
 *       ├── Topic 1.1, 1.2 ... (ONE lesson row per topic)
 *       └── Topic 1.N: Module N MCQ Assessment  (is_assessment = true)
 *           └── quiz row in public.quizzes (module questions)
 *
 * Rules enforced:
 *   - Every topic is its OWN lessons row so the sidebar shows it
 *     individually. `content` holds ONLY pure Markdown — never a
 *     JSON wrapper like {"topics": [...]}.
 *   - is_locked = false ONLY for Topic 1.1 of Module 1; every other
 *     row is is_locked = true.
 *   - Each module ends with a dedicated Assessment lesson row that
 *     carries the module's quiz questions in public.quizzes.
 *
 * The migration is applied automatically (idempotent) before seeding:
 *   supabase/migrations/20260804030000_lesson_modules_locking.sql
 *
 * Usage:
 *   node scripts/seed-all-courses.js
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

const PASS_THRESHOLD_PCT = 75

const SCHEMA_SQL = `
  ALTER TABLE public.lessons
    ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS module_order INT NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS is_assessment BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS module_title TEXT;

  CREATE INDEX IF NOT EXISTS idx_lessons_course_order
    ON public.lessons (course_id, lesson_order);
`

// ============================================================
// HELPERS
// ============================================================

// "Topic 1.1 [Unlocked]: Intro ..." -> "Topic 1.1: Intro ..."
// Lock state lives in the is_locked column, not the title.
function cleanTopicTitle(title) {
  return String(title || '')
    .replace(/\s*\[(?:Unlocked|Locked[^\]]*)\]\s*:\s*/, ': ')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function assessmentContent(moduleNumber, moduleCount, questionCount) {
  const next =
    moduleNumber < moduleCount
      ? `to unlock Module ${moduleNumber + 1}`
      : 'to finish the course and earn your XP reward'

  return [
    `# Module ${moduleNumber} MCQ Assessment`,
    '',
    `You've completed the topics of Module ${moduleNumber}. Answer all ${questionCount} questions in this assessment ${next}.`,
    '',
    '## Rules',
    '',
    '- Each question has exactly one correct answer',
    `- Score at least **${PASS_THRESHOLD_PCT}%** to pass`,
    '- You can retake the assessment as many times as you need',
    '',
    'Good luck!',
  ].join('\n')
}

async function deleteCourse(client, courseId) {
  const { rows: lessonRows } = await client.query(
    'SELECT id FROM public.lessons WHERE course_id = $1',
    [courseId]
  )
  const lessonIds = lessonRows.map((l) => l.id)

  if (lessonIds.length > 0) {
    await client.query(
      'DELETE FROM public.lesson_completions WHERE course_id = $1 OR lesson_id = ANY($2)',
      [courseId, lessonIds]
    )
    await client.query('DELETE FROM public.quizzes WHERE lesson_id = ANY($1)', [lessonIds])
    await client.query('DELETE FROM public.enrollments WHERE course_id = $1', [courseId])
    await client.query('DELETE FROM public.lessons WHERE course_id = $1', [courseId])
  }

  await client.query('DELETE FROM public.courses WHERE id = $1', [courseId])
}

// ============================================================
// SEED ONE COURSE
// ============================================================

async function seedCourse(client, courseData) {
  const courseRes = await client.query(
    `INSERT INTO public.courses (title, description, category, level, thumbnail_url, total_lessons, xp_reward, price, is_free)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      courseData.title,
      courseData.description,
      courseData.category,
      courseData.level,
      courseData.thumbnail_url || null,
      0, // patched below once rows are inserted
      courseData.xp_reward || 50,
      courseData.price ?? 0,
      courseData.pricing_type === 'Free',
    ]
  )
  const courseId = courseRes.rows[0].id
  const moduleCount = courseData.lessons.length

  let lessonOrder = 0
  let totalLessons = 0

  for (let m = 0; m < moduleCount; m++) {
    const module = courseData.lessons[m]
    const moduleNumber = m + 1
    const topics = (module.content && module.content.topics) || []
    const questionCount = (module.quiz && module.quiz.questions
      ? module.quiz.questions.length
      : 0)

    // Split the module's duration across its topic rows + assessment row
    const perRowMins = Math.max(3, Math.round((module.duration_mins || 30) / (topics.length + 1)))

    for (let t = 0; t < topics.length; t++) {
      const topic = topics[t]
      lessonOrder++
      totalLessons++
      const isFirstRow = m === 0 && t === 0

      await client.query(
        `INSERT INTO public.lessons
           (course_id, title, content, duration_mins, lesson_order, module_order, module_title, is_locked, is_assessment)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          courseId,
          cleanTopicTitle(topic.title),
          topic.content.trim(), // pure markdown — never JSON-wrapped
          perRowMins,
          lessonOrder,
          moduleNumber,
          module.title, // e.g. "Module 1 — The Node.js Runtime"
          isFirstRow ? false : true,
          false,
        ]
      )
    }

    // Dedicated Module Assessment record (topic X.N: Module X MCQ Assessment)
    lessonOrder++
    totalLessons++
    const assessmentTitle = `Topic ${moduleNumber}.${topics.length + 1}: Module ${moduleNumber} MCQ Assessment`

    const lessonRes = await client.query(
      `INSERT INTO public.lessons
         (course_id, title, content, duration_mins, lesson_order, module_order, module_title, is_locked, is_assessment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        courseId,
        assessmentTitle,
        assessmentContent(moduleNumber, moduleCount, questionCount),
        perRowMins,
        lessonOrder,
        moduleNumber,
        module.title,
        true,
        true,
      ]
    )

    if (module.quiz && module.quiz.questions && module.quiz.questions.length > 0) {
      await client.query(
        `INSERT INTO public.quizzes (lesson_id, title, questions)
         VALUES ($1, $2, $3)`,
        [
          lessonRes.rows[0].id,
          `Module ${moduleNumber} MCQ Assessment`,
          JSON.stringify(module.quiz.questions),
        ]
      )
    }
  }

  await client.query('UPDATE public.courses SET total_lessons = $1 WHERE id = $2', [
    totalLessons,
    courseId,
  ])

  console.log(
    `  ✅ ${courseData.title}: ${moduleCount} modules, ${totalLessons} lesson rows (${totalLessons - moduleCount} topics + ${moduleCount} assessments)`
  )
}

// ============================================================
// RUN
// ============================================================

async function run() {
  console.log('  🔌 Connecting to Supabase PostgreSQL...')
  const pool = new Pool({ ...DB_CONFIG, statement_timeout: 120000 })

  try {
    const client = await pool.connect()
    console.log('  ✅ Connected.')

    console.log('  🗄️  Applying schema migration (is_locked, module_order, is_assessment)...')
    await client.query(SCHEMA_SQL)
    console.log('  ✅ Schema ready.')

    const dataDir = path.join(__dirname, '..', 'course-data')
    if (!fs.existsSync(dataDir)) {
      console.log('  ⚠️  No course-data/ directory — nothing to seed.')
      client.release()
      await pool.end()
      return
    }

    const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json')).sort()
    if (files.length === 0) {
      console.log('  ⚠️  No course JSON files found in course-data/')
      client.release()
      await pool.end()
      return
    }

    for (const file of files) {
      const courseData = JSON.parse(
        fs.readFileSync(path.join(dataDir, file), 'utf-8')
      )
      console.log(`\n  📄 ${file} — ${courseData.title}`)

      await client.query('BEGIN')
      try {
        // Idempotent: remove any previous version of this course first
        const existing = await client.query(
          'SELECT id FROM public.courses WHERE title = $1',
          [courseData.title]
        )
        for (const row of existing.rows) {
          await deleteCourse(client, row.id)
        }

        await seedCourse(client, courseData)
        await client.query('COMMIT')
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      }
    }

    console.log('\n  🎉 All courses seeded with the structured curriculum!')
    client.release()
  } catch (err) {
    console.error('  ❌ Seed failed:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

run()
