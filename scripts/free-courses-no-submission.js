/**
 * STEP 1+2 of the "no submissions in free courses" refactor.
 *  - DB: force lessons.has_submission = false for every lesson belonging to a
 *    free course (price = 0 OR is_free = true).
 *  - Free JSON (course-data/course-*.json): force every topic hasSubmission=false
 *    (the source of truth for those courses). PRO courses are untouched.
 *
 * Run: node scripts/free-courses-no-submission.js
 */
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const DB_CONFIG = {
  host: 'aws-0-us-west-1.pooler.supabase.com', port: 5432, database: 'postgres',
  user: 'postgres.dolfyahvhqsszjzsjgsi', password: 'IhAcademy#2026$DbSecure!',
  ssl: { rejectUnauthorized: false },
}

// 1) Free JSON
const dataDir = path.join(__dirname, '..', 'course-data')
if (fs.existsSync(dataDir)) {
  for (const file of fs.readdirSync(dataDir).filter((f) => /^course-\d+\.json$/.test(f))) {
    const full = path.join(dataDir, file)
    const course = JSON.parse(fs.readFileSync(full, 'utf-8'))
    let changed = 0
    for (const lesson of course.lessons || []) {
      const topics = lesson?.content?.topics
      if (!Array.isArray(topics)) continue
      for (const t of topics) {
        if (t.hasSubmission !== false || 'requiresSubmission' in t) {
          t.hasSubmission = false
          delete t.requiresSubmission
          changed++
        }
      }
    }
    fs.writeFileSync(full, JSON.stringify(course, null, 2))
    console.log(`  ✅ ${file} — topics forced hasSubmission=false: ${changed}`)
  }
}

// 2) DB
;(async () => {
  let PoolOk = true
  let pool
  try { pool = new Pool(DB_CONFIG) } catch (e) { PoolOk = false; console.log('\n  ⚠️  pg unavailable:', e.message) }
  if (!PoolOk) return
  const client = await pool.connect()
  try {
    const { rows: before } = await client.query(
      `SELECT COUNT(*)::int AS n FROM public.lessons WHERE has_submission = true AND course_id IN (SELECT id FROM public.courses WHERE price = 0 OR is_free = true)`)
    await client.query(
      `UPDATE public.lessons SET has_submission = false WHERE course_id IN (SELECT id FROM public.courses WHERE price = 0 OR is_free = true)`)
    console.log(`\n  🔄 DB free-course lessons: ${before[0].n} had has_submission=true → now all false.`)
  } catch (e) {
    console.log('\n  ⚠️  DB update error:', e.message)
  } finally {
    client.release(); await pool.end()
  }
})()
