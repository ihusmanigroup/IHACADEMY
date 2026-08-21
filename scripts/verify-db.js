/**
 * IH Academy — Database Audit & Verification
 * ------------------------------------------------------------------
 * Usage (from repo root):
 *   node scripts/verify-db.js            # full audit (DB + frontend scan)
 *   node scripts/verify-db.js --db-only  # skip the frontend scan
 *
 * Connects to Supabase Postgres (SUPABASE_DB_URL from .env) and:
 *   1. Queries every public table and reports Record Count + Status.
 *   2. Cross-checks the expected CMS/domain tables (status OK/Empty/Missing).
 *   3. Produces a detailed Course Content breakdown (courses / modules /
 *      lessons / quizzes / requirements / video links).
 *   4. Flags schema gaps vs. the target CMS hierarchy (missing tables/columns).
 *   5. Scans client/src for local mock/hardcoded data still used by pages.
 */

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

// ---- load root .env (manual parser, matches other root scripts) ------------
try {
  const envPath = path.resolve(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
      const t = line.trim()
      if (t && !t.startsWith('#')) {
        const i = t.indexOf('=')
        if (i > 0) {
          const k = t.slice(0, i).trim()
          const v = t.slice(i + 1).trim()
          if (!process.env[k]) process.env[k] = v
        }
      }
    })
  }
} catch (_) {}

const DB_URL = process.env.SUPABASE_DB_URL
if (!DB_URL) {
  console.error('  ❌ SUPABASE_DB_URL not set in .env')
  process.exit(1)
}

const CLIENT_SRC = path.resolve(__dirname, '..', 'client', 'src')
const onlyDb = process.argv.includes('--db-only')

// Expected tables, grouped by site domain.
const EXPECTED_GROUPS = [
  { name: 'Homepage & Global UI', tables: ['site_settings', 'announcements', 'features', 'testimonials', 'faqs', 'about_sections'] },
  { name: 'Pricing Page', tables: ['pricing_plans'] },
  { name: 'Courses & Content (hierarchy)', tables: ['courses', 'course_modules', 'lessons', 'quizzes', 'course_requirements', 'course_outcomes'] },
  { name: 'Internships', tables: ['internship_seasons', 'internship_tracks', 'internship_weeks', 'internship_assignments', 'intern_applications', 'internship_enrollments', 'assignment_submissions', 'course_proofs'] },
  { name: 'Student Dashboard & Tracking', tables: ['profiles', 'enrollments', 'user_course_progress', 'lesson_completions', 'xp_transactions', 'winter_settings'] },
]

// Target columns for the CMS course hierarchy (for gap analysis).
const TARGET_COLUMNS = {
  courses: ['id', 'title', 'slug', 'description', 'thumbnail_url', 'price', 'duration', 'category', 'level', 'created_at', 'updated_at'],
  lessons: ['id', 'module_id', 'course_id', 'title', 'video_url', 'content_md', 'duration', 'order_index', 'resources_json', 'is_preview'],
  quizzes: ['id', 'lesson_id', 'course_id', 'title', 'questions_json', 'passing_score'],
}

const LINE = '─'.repeat(78)

function fmtTable(rows, widths) {
  const render = (arr) => '│ ' + arr.map((cell, i) => cell.padEnd(widths[i])).join(' │ ') + ' │'
  const border = (left, mid, right) => left + rows[0].map((_, i) => '─'.repeat(widths[i] + 2)).join(mid) + right
  const seps = rows.length - 1
  const lines = [border('┌', '┬', '┐'), render(rows[0])]
  for (let i = 1; i < rows.length; i++) {
    lines.push(border('├', '┼', '┤'), render(rows[i]))
  }
  lines.push(border('└', '┴', '┘'))
  return lines.join('\n')
}

async function run() {
  const c = new Client({ connectionString: DB_URL })
  await c.connect()

  console.log('\n' + LINE)
  console.log('  IH ACADEMY — DATABASE AUDIT & VERIFICATION')
  console.log('  Connected: ' + DB_URL.replace(/:[^:@]*@/, ':****@'))
  console.log(LINE + '\n')

  // 1. Discover all public tables.
  const allTables = await c.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  )
  const tableSet = new Set(allTables.rows.map((r) => r.tablename))

  // 2. Count rows for each expected table.
  const counts = {}
  for (const name of tableSet) {
    try {
      const res = await c.query(`SELECT count(*)::int AS n FROM "${name}"`)
      counts[name] = res.rows[0].n
    } catch (_) {
      counts[name] = null
    }
  }

  // 3. Build grouped report.
  const allExpected = []
  for (const g of EXPECTED_GROUPS) allExpected.push(...g.tables)

  const rows = [['Table Name', 'Record Count', 'Status']]
  for (const g of EXPECTED_GROUPS) {
    for (const name of g.tables) {
      const exists = tableSet.has(name)
      const n = counts[name]
      let status
      if (!exists) status = 'MISSING'
      else if (n === 0) status = 'EMPTY'
      else status = 'OK'
      rows.push([name, exists ? String(n) : '-', status])
    }
  }

  const extras = [...tableSet].filter((t) => !allExpected.includes(t)).sort()
  for (const name of extras) {
    rows.push([name, String(counts[name]), 'OK (extra)'])
  }

  const w = [34, 14, 12]
  console.log('  ALL DATABASE TABLES  (26 discovered)')
  console.log(fmtTable(rows, w))
  console.log()

  // 4. Group summary.
  console.log('  SUMMARY BY DOMAIN')
  for (const g of EXPECTED_GROUPS) {
    const ok = g.tables.filter((t) => tableSet.has(t) && counts[t] > 0)
    const empty = g.tables.filter((t) => tableSet.has(t) && counts[t] === 0)
    const missing = g.tables.filter((t) => !tableSet.has(t))
    const bits = []
    if (ok.length) bits.push(`${ok.length} OK`)
    if (empty.length) bits.push(`${empty.length} EMPTY`)
    if (missing.length) bits.push(`${missing.length} MISSING (${missing.join(', ')})`)
    console.log(`    ${g.name.padEnd(32)} -> ${bits.join(', ') || '—'}`)
  }
  console.log()

  // 5. Detailed course content breakdown.
  console.log('  COURSE CONTENT BREAKDOWN')
  const courses = await c.query('SELECT count(*)::int AS n FROM courses')
  const lessons = await c.query('SELECT count(*)::int AS n FROM lessons')
  const quizzes = await c.query('SELECT count(*)::int AS n FROM quizzes')
  const requirements = await c.query('SELECT count(*)::int AS n FROM course_requirements')
  const modules = await c.query(
    `SELECT count(*)::int AS n FROM (SELECT DISTINCT course_id, module_title FROM lessons WHERE module_title IS NOT NULL AND module_title <> '') t`
  )
  const videoLessons = await c.query(
    `SELECT count(*)::int AS n FROM lessons WHERE content ILIKE '%youtube%' OR content ILIKE '%youtu.be%' OR content ILIKE '%vimeo%'`
  )
  const videoUrls = await c.query(
    `SELECT count(DISTINCT m[1])::int AS n FROM lessons, LATERAL regexp_matches(content, 'https?://[^"''\\) ]*(youtube|youtu\\.be|vimeo)[^"''\\) ]*', 'g') m`
  )

  const videoRows = [
    ['Total Courses', courses.rows[0].n],
    ['Total Modules (distinct course_id + module_title)', modules.rows[0].n],
    ['Total Lessons', lessons.rows[0].n],
    ['Total Quizzes', quizzes.rows[0].n],
    ['Total Course Requirements', requirements.rows[0].n],
    ['Lessons containing video links', videoLessons.rows[0].n],
    ['Distinct video URLs (YouTube/Vimeo)', videoUrls.rows[0].n],
  ]
  for (const [label, val] of videoRows) {
    console.log(`    ${label.padEnd(45)} ${String(val).padStart(6)}`)
  }
  console.log()

  // 6. Schema gap analysis vs. target CMS hierarchy.
  console.log('  SCHEMA GAP ANALYSIS (vs. admin-panel CMS target)')
  const gapRows = [['Area', 'Expected', 'Actual Status']]
  const colInfo = {}
  for (const table of Object.keys(TARGET_COLUMNS)) {
    const cols = await c.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`,
      [table]
    ).catch(() => ({ rows: [] }))
    colInfo[table] = new Set(cols.rows.map((r) => r.column_name))
  }

  const gapDefs = [
    { area: 'course_modules / sections table', expected: 'first-class module table', present: tableSet.has('course_modules') },
    { area: 'course_outcomes table', expected: 'outcomes for landing pages', present: tableSet.has('course_outcomes') },
    { area: 'courses.slug', expected: 'URL slug', present: colInfo.courses && colInfo.courses.has('slug') },
    { area: 'courses.duration', expected: 'duration field', present: colInfo.courses && colInfo.courses.has('duration') },
    { area: 'courses.updated_at', expected: 'audit timestamp', present: colInfo.courses && colInfo.courses.has('updated_at') },
    { area: 'lessons.video_url', expected: 'video link column', present: colInfo.lessons && colInfo.lessons.has('video_url') },
    { area: 'lessons.resources_json', expected: 'resources attachments', present: colInfo.lessons && colInfo.lessons.has('resources_json') },
    { area: 'lessons.is_preview', expected: 'free-preview flag', present: colInfo.lessons && colInfo.lessons.has('is_preview') },
    { area: 'lessons.module_id', expected: 'FK to course_modules', present: colInfo.lessons && colInfo.lessons.has('module_id') },
    { area: 'quizzes.course_id', expected: 'course FK on quiz', present: colInfo.quizzes && colInfo.quizzes.has('course_id') },
    { area: 'quizzes.passing_score', expected: 'pass threshold', present: colInfo.quizzes && colInfo.quizzes.has('passing_score') },
    { area: 'lesson_completions', expected: 'per-lesson tracking', present: tableSet.has('lesson_completions') && counts.lesson_completions > 0 },
  ]

  for (const g of gapDefs) {
    gapRows.push([g.area, g.expected, g.present ? 'PRESENT / POPULATED' : 'GAP'])
  }
  console.log(fmtTable(gapRows, [28, 26, 20]))
  console.log()

  // 7. Frontend mock-data scan.
  if (!onlyDb) {
    console.log('  FRONTEND DATA SOURCE SCAN (client/src)')
    const dataDir = path.join(CLIENT_SRC, 'data')
    let dataFiles = []
    try {
      dataFiles = fs.readdirSync(dataDir).filter((f) => f.endsWith('.js'))
    } catch (_) {}
    const dataRows = [['Local data file', 'Lines', 'Used by']]
    for (const f of dataFiles.sort()) {
      const full = path.join(dataDir, f)
      const lines = fs.readFileSync(full, 'utf8').split('\n').length
      // Find who imports it.
      const users = []
      const base = path.basename(f, '.js')
      const rgx = new RegExp(`from ['"].*data/${base}['"]`, 'i')
      for (const dir of ['pages', 'components', 'hooks', 'context', 'utils', 'lib']) {
        const d = path.join(CLIENT_SRC, dir)
        if (!fs.existsSync(d)) continue
        const walk = (p) => {
          for (const e of fs.readdirSync(p)) {
            const fp = path.join(p, e)
            const st = fs.statSync(fp)
            if (st.isDirectory()) walk(fp)
            else if (/\.(jsx|js|tsx)$/.test(e)) {
              const content = fs.readFileSync(fp, 'utf8')
              if (rgx.test(content)) users.push(`${dir}/${e}`)
            }
          }
        }
        walk(d)
      }
      const size = lines > 2000 ? 'HUGE' : lines > 500 ? 'LARGE' : lines > 100 ? 'MED' : 'SMALL'
      // Mark data files that are only bundled through data/coursesData.js
      // (the PRO-major catalog) as indirect dependencies.
      if (users.length === 0) {
        const coursesDataFile = path.join(dataDir, 'coursesData.js')
        if (fs.existsSync(coursesDataFile)) {
          const coursesDataContent = fs.readFileSync(coursesDataFile, 'utf8')
          const indirectRgx = new RegExp(`from\\s+['"]\\./${base}(\\.js)?['"]`)
          if (indirectRgx.test(coursesDataContent)) {
            users.push('INDIRECT via data/coursesData.js')
          }
        }
      }
      dataRows.push([`data/${f}`, `${lines} (${size})`, users.join(', ') || '(not imported)'])
    }
    console.log(fmtTable(dataRows, [34, 14, 34]))
    console.log()
  }

  await c.end()

  console.log(LINE)
  console.log('  AUDIT COMPLETE')
  console.log(LINE + '\n')
}

run().catch((e) => {
  console.error('  ❌ Audit failed:', e.message)
  process.exit(1)
})
