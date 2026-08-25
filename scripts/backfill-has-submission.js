/**
 * Backfill lessons.has_submission in ONE batched UPDATE.
 * Flag source: curated title→flag map (PRO bundled + free JSON) when the title
 * matches, otherwise the content classifier. Read-only/theory/video lessons
 * stay false so LearnView never renders a submission form for them.
 *
 * Run: node scripts/backfill-has-submission.js
 */
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const DB_CONFIG = {
  host: 'aws-0-us-west-1.pooler.supabase.com', port: 5432, database: 'postgres',
  user: 'postgres.dolfyahvhqsszjzsjgsi', password: 'IhAcademy#2026$DbSecure!',
  ssl: { rejectUnauthorized: false },
}

const PRACTICAL_TASK_RE = [
  /\byour turn\b/i, /\btry it (yourself|out)\b/i,
  /\bcomplete (the|this|these|all|following|next)?\s*(exercise|exercises|practice|practise|challenge|challenges|assignment|task|tasks|project|projects)\b/i,
  /\bhands?[-\s]?on\b/i, /\bsubmit (your|your work|the|this|an?)\b/i,
  /\bpractice (exercise|exercises|task|tasks|set|problem|problems|round|session)\b/i,
  /\bcoding exercise\b/i, /\bnow (build|create|implement|write|code|develop)\b/i,
  /\bchallenge:\b/i, /\byour (task|assignment|project|exercise|challenges?)\b/i,
  /\b(assignment|homework|lab|workshop)\b/i, /\bcapstone\b/i,
]
const classify = ({ content = '' } = {}) => PRACTICAL_TASK_RE.some((re) => re.test(String(content || '')))
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

function buildTitleMap() {
  const map = {}
  // free JSON
  const ddir = path.join(__dirname, '..', 'course-data')
  if (fs.existsSync(ddir)) {
    for (const f of fs.readdirSync(ddir).filter((x) => /^course-\d+\.json$/.test(x))) {
      let course
      try { course = JSON.parse(fs.readFileSync(path.join(ddir, f), 'utf-8')) } catch (_) { continue }
      for (const lesson of course.lessons || []) {
        if (!lesson?.title) continue
        const topics = lesson?.content?.topics
        const practical = Array.isArray(topics) ? topics.some((t) => t.hasSubmission === true) : false
        map[norm(lesson.title)] = practical
      }
    }
  }
  // PRO bundled
  const pdir = path.join(__dirname, '..', 'client', 'src', 'data')
  if (fs.existsSync(pdir)) {
    for (const f of fs.readdirSync(pdir).filter((x) => /CourseData\.js$/.test(x))) {
      const text = fs.readFileSync(path.join(pdir, f), 'utf-8')
      const m = text.match(/export const (\w+)\s*=\s*([\s\S]+);?\s*$/)
      if (!m) continue
      let course
      try { course = new Function('return ' + m[2])() } catch (_) { continue }
      for (const mod of course.modules || []) for (const lesson of mod.lessons || []) {
        if (lesson?.title) map[norm(lesson.title)] = !!lesson.hasSubmission
      }
    }
  }
  return map
}

;(async () => {
  const titleMap = buildTitleMap()
  const pool = new Pool(DB_CONFIG)
  const client = await pool.connect()
  try {
    const { rows } = await client.query('SELECT id, title, content FROM public.lessons')
    const vals = []
    let t = 0, f = 0
    for (const l of rows) {
      const key = norm(l.title)
      const flag = key in titleMap ? titleMap[key] : classify({ content: l.content })
      if (flag) t++; else f++
      vals.push(`('${l.id}'::uuid, ${flag ? 'true' : 'false'})`)
    }
    if (vals.length) {
      await client.query(
        `UPDATE public.lessons AS l SET has_submission = v.flag
         FROM (VALUES ${vals.join(',')}) AS v(id, flag) WHERE l.id = v.id`
      )
    }
    console.log(`\n  🔄 DB backfill: ${rows.length} lesson(s) — has_submission TRUE: ${t}, FALSE: ${f}.`)
  } finally {
    client.release(); await pool.end()
  }
})().catch((e) => { console.error('ERR', e.message); process.exit(1) })
