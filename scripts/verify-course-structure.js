const { Client } = require('pg')

const DB_CONFIG = {
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.dolfyahvhqsszjzsjgsi',
  password: 'IhAcademy#2026$DbSecure!',
  ssl: { rejectUnauthorized: false },
}

async function run() {
  const client = new Client(DB_CONFIG)
  await client.connect()
  console.log('Connected.')

  const { rows: courses } = await client.query(
    `SELECT id, title, total_lessons FROM courses WHERE title ILIKE '%for Absolute Beginners%' ORDER BY title`
  )

  let allOk = true
  for (const course of courses) {
    const issues = []
    const { rows: lessons } = await client.query(
      `SELECT id, lesson_order, module_order, module_title, is_locked, is_assessment, title, content, duration_mins
       FROM lessons WHERE course_id = $1 ORDER BY lesson_order`,
      [course.id]
    )

    if (lessons.length !== 20) issues.push(`expected 20 lesson rows, got ${lessons.length}`)

    const unlocked = lessons.filter((l) => !l.is_locked)
    if (unlocked.length !== 1) issues.push(`expected exactly 1 unlocked lesson, got ${unlocked.length}`)
    else if (!/^Topic 1\.1/.test(unlocked[0].title)) issues.push(`unlocked lesson is not Topic 1.1: "${unlocked[0].title}"`)

    const modCounts = {}
    lessons.forEach((l) => {
      modCounts[l.module_order] = (modCounts[l.module_order] || 0) + 1
    })
    const mods = Object.keys(modCounts).map(Number).sort((a, b) => a - b)
    if (mods.length !== 4) issues.push(`expected 4 modules, got ${mods.join(',')}`)
    for (const m of mods) {
      if (modCounts[m] !== 5) issues.push(`module ${m} has ${modCounts[m]} lessons (expected 5)`)
    }

    const assessments = lessons.filter((l) => l.is_assessment)
    if (assessments.length !== 4) issues.push(`expected 4 assessments, got ${assessments.length}`)
    for (const a of assessments) {
      if (!/MCQ Assessment/.test(a.title)) issues.push(`assessment row missing MCQ Assessment in title: "${a.title}"`)
      const { rows: quizzes } = await client.query(
        `SELECT title, jsonb_array_length(questions::jsonb) AS qcount FROM quizzes WHERE lesson_id = $1`,
        [a.id]
      )
      if (quizzes.length !== 1) issues.push(`assessment "${a.title}" has ${quizzes.length} quizzes (expected 1)`)
      else {
        if (quizzes[0].qcount !== 10) issues.push(`quiz for "${a.title}" has ${quizzes[0].qcount} questions (expected 10)`)
        const questions = await client.query(`SELECT questions::jsonb FROM quizzes WHERE lesson_id = $1`, [a.id])
        const arr = questions.rows[0].questions
        arr.forEach((q, i) => {
          if (!Array.isArray(q.options) || q.options.length !== 4) issues.push(`quiz q${i + 1} of "${a.title}" does not have 4 options`)
          if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) issues.push(`quiz q${i + 1} of "${a.title}" has invalid answer`)
        })
      }
    }

    for (const l of lessons) {
      if (!l.module_title) issues.push(`lesson "${l.title}" has no module_title`)
      if (!l.content || l.content.trim().length === 0) issues.push(`lesson "${l.title}" has empty content`)
      if (l.content.includes('"topics"') || /^\s*\{/.test(l.content)) issues.push(`lesson "${l.title}" content looks like JSON, not markdown`)
      if (!l.duration_mins || l.duration_mins <= 0) issues.push(`lesson "${l.title}" has missing/invalid duration`)
    }

    const status = issues.length === 0 ? 'PASS' : 'FAIL'
    if (issues.length > 0) allOk = false
    console.log(`${status} ${course.title} (total_lessons=${course.total_lessons}, rows=${lessons.length}, unlocked=${unlocked.length}, modules=${mods.join(',')})`)
    issues.forEach((i) => console.log(`   - ${i}`))
  }

  console.log(allOk ? '\nAll structure checks passed.' : '\nSome checks FAILED.')
  await client.end()
}

run().catch((e) => {
  console.error('ERROR:', e.message)
  process.exit(1)
})
