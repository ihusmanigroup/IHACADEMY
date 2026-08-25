/**
 * Step 1 + DB backfill for the `hasSubmission` flag.
 *
 *  - Tags every free-course topic in course-data/course-*.json with an explicit
 *    `hasSubmission` boolean (authoritative source of truth for the JSON form).
 *  - Backfills the Supabase `lessons.has_submission` column (what LearnView
 *    actually reads at runtime). Each DB lesson's flag is taken from the
 *    curated source (PRO bundled data or free JSON) when its title matches,
 *    otherwise from the content classifier. Read-only/video/theory lessons
 *    therefore stay false and never render a submission form.
 *
 * Run: node scripts/tag-requires-submission.js
 */
const fs = require('fs')
const path = require('path')

const DB_CONFIG = {
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.dolfyahvhqsszjzsjgsi',
  password: 'IhAcademy#2026$DbSecure!',
  ssl: { rejectUnauthorized: false },
}

const PRACTICAL_TASK_RE = [
  /\byour turn\b/i,
  /\btry it (yourself|out)\b/i,
  /\bcomplete (the|this|these|all|following|next)?\s*(exercise|exercises|practice|practise|challenge|challenges|assignment|task|tasks|project|projects)\b/i,
  /\bhands?[-\s]?on\b/i,
  /\bsubmit (your|your work|the|this|an?)\b/i,
  /\bpractice (exercise|exercises|task|tasks|set|problem|problems|round|session)\b/i,
  /\bcoding exercise\b/i,
  /\bnow (build|create|implement|write|code|develop)\b/i,
  /\bchallenge:\b/i,
  /\byour (task|assignment|project|exercise|challenges?)\b/i,
  /\b(assignment|homework|lab|workshop)\b/i,
  /\bcapstone\b/i,
]

function classify({ content = '' } = {}) {
  const text = String(content || '')
  return PRACTICAL_TASK_RE.some((re) => re.test(text))
}

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

// ---------------------------------------------------------------------------
// Load PRO bundled courses (client/src/data/*CourseData.js) for the title map.
// ---------------------------------------------------------------------------
function loadProLessons() {
  const out = []
  const dir = path.join(__dirname, '..', 'client', 'src', 'data')
  for (const file of fs.readdirSync(dir).filter((f) => /CourseData\.js$/.test(f))) {
    const text = fs.readFileSync(path.join(dir, file), 'utf-8')
    const m = text.match(/export const (\w+)\s*=\s*([\s\S]+);?\s*$/)
    if (!m) continue
    let course
    try { course = new Function('return ' + m[2])() } catch (_) { continue }
    for (const mod of course.modules || []) {
      for (const lesson of mod.lessons || []) {
        if (lesson?.title) out.push({ title: lesson.title, flag: !!lesson.hasSubmission })
      }
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// 1) Tag free JSON with hasSubmission.
// ---------------------------------------------------------------------------
const dataDir = path.join(__dirname, '..', 'course-data')
const files = fs.readdirSync(dataDir).filter((f) => /^course-\d+\.json$/.test(f))
let totalTopics = 0
let practical = 0
const flagByNormTitle = {}
for (const file of files) {
  const full = path.join(dataDir, file)
  const course = JSON.parse(fs.readFileSync(full, 'utf-8'))
  for (const lesson of course.lessons || []) {
    const topics = lesson?.content?.topics
    if (!Array.isArray(topics)) continue
    let lessonPractical = false
    for (const t of topics) {
      totalTopics++
      const explicit = typeof t.hasSubmission === 'boolean'
        ? t.hasSubmission
        : (typeof t.requiresSubmission === 'boolean' ? t.requiresSubmission : null)
      const flag = explicit !== null ? explicit : classify({ content: t.content })
      delete t.requiresSubmission
      t.hasSubmission = flag
      if (flag) { practical++; lessonPractical = true }
    }
    if (lesson.title) flagByNormTitle[norm(lesson.title)] = lessonPractical
  }
  fs.writeFileSync(full, JSON.stringify(course, null, 2))
  console.log(`  ✅ ${file} (${course.title || ''}) tagged`)
}
console.log(`\n  📊 Free topics: ${totalTopics}, practical: ${practical}, read-only: ${totalTopics - practical}`)

// Merge PRO lessons into the title map.
for (const l of loadProLessons()) flagByNormTitle[norm(l.title)] = l.flag
console.log(`  🗺️  Title→flag map size: ${Object.keys(flagByNormTitle).length}`)

// ---------------------------------------------------------------------------
// 2) Backfill the DB `lessons.has_submission` column.
// ---------------------------------------------------------------------------
;(async () => {
  let Pool
  try { Pool = require('pg').Pool } catch (_) { console.log('\n  ⚠️  pg not installed — skipped DB backfill (JSON updated).'); return }
  const pool = new Pool(DB_CONFIG)
  let client
  try { client = await pool.connect() } catch (e) {
    console.log(`\n  ⚠️  DB unreachable (${e.message}) — JSON is the source of truth.`)
    return
  }
  try {
    const { rows } = await client.query('SELECT id, title, content FROM public.lessons')
    let setTrue = 0
    let setFalse = 0
    for (const l of rows) {
      const key = norm(l.title)
      let flag = flagByNormTitle[key]
      if (flag === undefined) flag = classify({ content: l.content })
      if (flag) setTrue++; else setFalse++
      await client.query('UPDATE public.lessons SET has_submission = $1 WHERE id = $2', [!!flag, l.id])
    }
    console.log(`\n  🔄 DB backfill: ${rows.length} lesson(s) processed — has_submission TRUE: ${setTrue}, FALSE: ${setFalse}.`)
  } catch (e) {
    console.log(`\n  ⚠️  DB backfill error: ${e.message}`)
  } finally {
    client.release()
    await pool.end()
  }
})()
