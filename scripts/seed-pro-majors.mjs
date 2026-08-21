/**
 * IH Academy — Seed ALL 5 PRO Major curricula into the `lessons` table.
 *
 * Pro majors previously shipped their full module/lesson content as local
 * hardcoded files (client/src/data/*.js). This script:
 *   1. Loads each rich course object (ESM) directly from those files.
 *   2. Emits a full migration SQL file (supabase/migrations/..._seed_pro_major_lessons.sql)
 *      — one lessons row per topic, with module_order / module_title /
 *      lesson_type / is_preview / duration_mins / video_url / is_locked.
 *   3. Applies that migration directly to the live Supabase Postgres DB.
 *
 * Lessons are tied to the EXISTING `courses` rows (the fixed catalog UUIDs
 * seeded by 20260731000001_seed_pro_major_courses.sql), so enrollment FK
 * constraints keep working.
 *
 * Conventions (100% database-driven, no frontend fallbacks):
 *   - module_order / module_title come from the module's number + title.
 *   - lesson_order is the GLOBAL course position (1..N); the UI derives the
 *     per-module "1.2" index from module grouping.
 *   - lesson_type: theory -> theory, code -> code, video -> video
 *     (matches the lessons_lesson_type_check constraint).
 *   - codeSnippet is embedded into `content` as a fenced markdown block so it
 *     renders from the DB with no extra columns.
 *   - is_preview = true for the first lesson of every module (free samples).
 *   - is_locked = false only for the very first lesson of the course.
 *
 * Usage:
 *   node scripts/seed-pro-majors.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ---- load root .env (manual parser, mirrors other root scripts) -----------
try {
  fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n').forEach((line) => {
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

const { Client } = pg
const DB_URL = process.env.SUPABASE_DB_URL
if (!DB_URL) {
  console.error('  ❌ SUPABASE_DB_URL not set in root .env')
  process.exit(1)
}

// Catalog UUID -> rich data file (order matches PRO_MAJOR_COURSES in coursesData.js)
const COURSES = [
  { export: 'mlMajorCourse', file: '../client/src/data/mlCourseData.js', id: '00000000-0000-4000-8000-000000000001' },
  { export: 'agenticAIMajorCourse', file: '../client/src/data/agenticAICourseData.js', id: '00000000-0000-4000-8000-000000000005' },
  { export: 'backendMajorCourse', file: '../client/src/data/backendCourseData.js', id: '00000000-0000-4000-8000-000000000004' },
  { export: 'frontendMajorCourse', file: '../client/src/data/frontendCourseData.js', id: '00000000-0000-4000-8000-000000000003' },
  { export: 'genAIMajorCourse', file: '../client/src/data/genaiCourseData.js', id: '00000000-0000-4000-8000-000000000002' },
]

const TYPE_MAP = { theory: 'theory', code: 'code', video: 'video', quiz: 'quiz' }

function toLessonType(t) {
  return TYPE_MAP[t] || 'theory'
}

function parseCourseMinutes(duration) {
  if (!duration) return null
  const h = /(\d+)\s*hours?/i.exec(duration)
  if (h) return parseInt(h[1], 10) * 60
  const m = /(\d+)\s*mins?/i.exec(duration)
  if (m) return parseInt(m[1], 10)
  return null
}

function embedCodeSnippet(content, snippet) {
  if (!snippet) return content
  const base = String(content || '').trim()
  return `${base}\n\n**Practice: run this example**\n\n\`\`\`\n${snippet}\n\`\`\`\n`
}

// Content can contain almost anything; use a tagged dollar-quote and escape if
// the tag ever appears inside the content.
function dq(input) {
  let s = String(input == null ? '' : input)
  let tag = '$ih$'
  while (s.includes(tag)) tag += 'x'
  return `${tag}${s}${tag}`
}

function buildRows(exported) {
  const modules = exported.modules || []
  const courseMinutes = parseCourseMinutes(exported.duration)
  const totalTopics = modules.reduce((a, m) => a + (m.lessons || []).length, 0)
  const perLessonMin = courseMinutes && totalTopics
    ? Math.max(3, Math.round(courseMinutes / totalTopics))
    : 20

  const rows = []
  let lessonOrder = 0
  modules.forEach((m) => {
    ;(m.lessons || []).forEach((l, i) => {
      lessonOrder++
      rows.push({
        moduleOrder: m.number,
        moduleTitle: m.title,
        lessonOrder,
        title: l.title,
        content: embedCodeSnippet(l.content, l.codeSnippet),
        durationMins: l.duration_mins || perLessonMin,
        lessonType: toLessonType(l.type),
        isPreview: i === 0,
        isAssessment: false,
        isLocked: lessonOrder !== 1,
        videoUrl: l.video_url || null,
      })
    })
  })
  return rows
}

async function buildSql() {
  const header = `-- ---------------------------------------------------------------------------
-- IH Academy — Seed ALL 5 PRO Major curricula into \`lessons\`
-- Generated by scripts/seed-pro-majors.mjs from client/src/data/*.js
-- For each PRO major: one row per topic with module_order / module_title /
-- lesson_type / is_preview / duration_mins. Idempotent (deletes then re-seeds
-- the five fixed catalog UUIDs). Applied directly against the live DB.
-- ---------------------------------------------------------------------------

`
  const parts = [header]
  let totalLessons = 0

  for (const c of COURSES) {
    const mod = await import(c.file)
    const exported = mod[c.export]
    const rows = buildRows(exported)
    totalLessons += rows.length

    const values = rows
      .map(
        (r) =>
          `  (${dq(c.id)}, ${dq(r.title)}, ${dq(r.content)}, ${r.durationMins}, ${r.lessonOrder}, ${r.moduleOrder}, ${dq(r.moduleTitle)}, ${r.isPreview ? 'true' : 'false'}, ${r.isAssessment ? 'true' : 'false'}, ${r.isLocked ? 'true' : 'false'}, ${dq(r.lessonType)}, ${r.videoUrl ? dq(r.videoUrl) : "''"})`
      )
      .join(',\n')

    parts.push(`-- ${exported.title} (${rows.length} lessons, ${(exported.modules || []).length} modules)`)

    parts.push(`DELETE FROM public.lessons WHERE course_id = '${c.id}';`)

    parts.push(
      `INSERT INTO public.lessons
  (course_id, title, content, duration_mins, lesson_order, module_order, module_title, is_preview, is_assessment, is_locked, lesson_type, video_url)
VALUES
${values};`
    )

    parts.push(`UPDATE public.courses SET total_lessons = ${rows.length} WHERE id = '${c.id}';`)
    parts.push('')
  }

  parts.push(`-- Total lessons seeded: ${totalLessons}`)
  return parts.join('\n')
}

async function run() {
  const sql = await buildSql()
  const migrationPath = path.join(ROOT, 'supabase', 'migrations', '20260812000000_seed_pro_major_lessons.sql')
  fs.writeFileSync(migrationPath, sql, 'utf8')
  console.log(`  📄 Migration written: ${path.relative(ROOT, migrationPath)} (${(sql.length / 1024).toFixed(1)} KB)`)

  console.log('  🔌 Connecting to Supabase PostgreSQL...')
  const client = new Client({ connectionString: DB_URL })
  await client.connect()

  try {
    const coursesRes = await client.query(
      `SELECT id, title FROM public.courses WHERE id = ANY($1)`,
      [COURSES.map((c) => c.id)]
    )
    if (coursesRes.rows.length !== COURSES.length) {
      throw new Error(`Expected ${COURSES.length} catalog courses, found ${coursesRes.rows.length}. Run 20260731000001_seed_pro_major_courses.sql first.`)
    }

    console.log('  ✅ Connected. Applying migration...')
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')

    const after = await client.query(
      `SELECT c.title, count(l.id)::int AS lessons FROM courses c LEFT JOIN lessons l ON l.course_id = c.id
       WHERE c.id = ANY($1) GROUP BY c.id, c.title ORDER BY c.title`,
      [COURSES.map((c) => c.id)]
    )
    after.rows.forEach((r) => console.log(`  ✅ ${r.title}: ${r.lessons} lessons`))
    console.log('  🎉 PRO Major curricula are now 100% database-driven.')
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('  ❌ Seed failed:', err.message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

run()