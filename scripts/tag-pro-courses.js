/**
 * Tag every PRO/major-course lesson with an explicit `hasSubmission` flag.
 * These courses ship as bundled static data (client/src/data/*CourseData.js),
 * so editing the file immediately affects the runtime — no DB needed.
 *
 * Run: node scripts/tag-pro-courses.js
 */
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'client', 'src', 'data')

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

function classify({ content = '', type } = {}) {
  const text = String(content || '')
  return PRACTICAL_TASK_RE.some((re) => re.test(text))
}

const files = fs.readdirSync(DATA_DIR).filter((f) => /CourseData\.js$/.test(f))

for (const file of files) {
  const full = path.join(DATA_DIR, file)
  const text = fs.readFileSync(full, 'utf-8')
  const m = text.match(/export const (\w+)\s*=\s*([\s\S]+);?\s*$/)
  if (!m) { console.log(`  ⏭️  no export found in ${file}`); continue }
  const name = m[1]
  let course
  try {
    course = new Function('return ' + m[2])()
  } catch (e) {
    console.log(`  ❌ failed to parse ${file}: ${e.message}`)
    continue
  }

  let lessons = 0
  let practical = 0
  for (const mod of course.modules || []) {
    for (const lesson of mod.lessons || []) {
      lessons++
      // Explicit flag wins; fall back to the curated classifier, then drop the
      // legacy `requiresSubmission` key so the data stays unambiguous.
      const explicit = typeof lesson.hasSubmission === 'boolean'
        ? lesson.hasSubmission
        : (typeof lesson.requiresSubmission === 'boolean' ? lesson.requiresSubmission : null)
      const flag = explicit !== null ? explicit : classify({ content: lesson.content, type: lesson.type })
      delete lesson.requiresSubmission
      lesson.hasSubmission = flag
      if (flag) practical++
    }
  }

  fs.writeFileSync(full, `export const ${name} = ${JSON.stringify(course, null, 2)};\n`)
  console.log(`  ✅ ${file} — lessons: ${lessons}, practical: ${practical}, read-only: ${lessons - practical}`)
}

console.log('\n  🎉 PRO course tagging complete.')
