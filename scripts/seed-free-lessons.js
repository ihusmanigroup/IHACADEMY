const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

try {
  const envPath = path.resolve(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim()
          const value = trimmed.slice(eqIdx + 1).trim()
          if (!process.env[key]) process.env[key] = value
        }
      }
    })
  }
} catch (_) {}

const DB_URL = process.env.SUPABASE_DB_URL

if (!DB_URL) {
  console.error('\n  SUPABASE_DB_URL not set.\n')
  process.exit(1)
}

const FREE_COURSES = [
  "AI Fluency",
  "Prompt Engineering",
  "AI-Assisted Coding",
  "Introduction to LLMs",
  "AI Safety & Responsible AI",
  "Claude Fundamentals",
  "AI Collaboration Techniques",
  "Git & GitHub Fundamentals",
  "Linux & Command Line Basics",
  "API Fundamentals",
  "Database Fundamentals",
  "Software Engineering Fundamentals",
  "Cloud Computing Fundamentals",
  "AI Productivity & Automation",
  "Cybersecurity Fundamentals",
]

const lessons = require("./lesson-data.js")

async function seed() {
  const pool = new Pool({ connectionString: DB_URL })
  const client = await pool.connect()

  try {
    const { rowCount: deleted } = await client.query(
      "DELETE FROM public.lessons WHERE course_id IN (SELECT id FROM public.courses WHERE title = ANY($1))",
      [FREE_COURSES]
    )
    console.log("  Deleted " + deleted + " existing lessons from free courses.")

    let inserted = 0
    for (const lesson of lessons) {
      const res = await client.query(
        "INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order) SELECT id, $1, $2, $3, $4 FROM public.courses WHERE title = $5",
        [lesson.title, lesson.content, lesson.duration, lesson.order, lesson.course]
      )
      if (res.rowCount > 0) inserted++
    }

    console.log("  Inserted " + inserted + " new lessons.")

    const { rows: countResult } = await client.query(
      "SELECT COUNT(*)::int AS count FROM public.lessons l JOIN public.courses c ON c.id = l.course_id WHERE c.title = ANY($1)",
      [FREE_COURSES]
    )
    console.log("  Total lessons for free courses: " + countResult[0].count)
  } catch (err) {
    console.error("  Seed failed:", err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
