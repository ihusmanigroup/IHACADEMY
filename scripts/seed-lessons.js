const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

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
  console.error('')
  console.error('  SUPABASE_DB_URL not set.')
  console.error('')
  console.error('  To get your connection string:')
  console.error('    1. Go to https://supabase.com/dashboard/project/dolfyahvhqsszjzsjgsi/settings/database')
  console.error('    2. Copy the "Connection string" under "Direct connection"')
  console.error('    3. Run:')
  console.error('       set SUPABASE_DB_URL=postgresql://postgres:YOUR_PASSWORD@db.dolfyahvhqsszjzsjgsi.supabase.co:5432/postgres')
  console.error('       node scripts/seed-lessons.js')
  console.error('')
  process.exit(1)
}

const LESSON_TEMPLATES = [
  { title: 'Introduction & Overview', duration: 15 },
  { title: 'Core Concepts & Fundamentals', duration: 20 },
  { title: 'Practical Applications', duration: 25 },
  { title: 'Advanced Topics & Best Practices', duration: 30 },
]

async function seed() {
  const pool = new Pool({ connectionString: DB_URL })
  const client = await pool.connect()

  try {
    const { rows: courses } = await client.query(
      'SELECT id, title, total_lessons FROM public.courses ORDER BY title'
    )

    console.log(`  Found ${courses.length} courses.`)

    let totalInserted = 0
    for (const course of courses) {
      const lessonsToGenerate = Math.min(4, course.total_lessons)

      for (let i = 0; i < lessonsToGenerate; i++) {
        const tpl = LESSON_TEMPLATES[i] || LESSON_TEMPLATES[LESSON_TEMPLATES.length - 1]
        const title = `${course.title} — ${tpl.title}`
        const content = `## ${title}\n\nThis is an auto-generated lesson for the **${course.title}** course.\n\n### What you will learn\n\n- Core concepts and terminology\n- Hands-on practical exercises\n- Real-world applications and use cases\n\n### Key Takeaways\n\nBy the end of this lesson, you will have a solid understanding of ${course.title.toLowerCase()} fundamentals and be ready to apply them in practice.\n\n> "The only way to learn programming is by writing code." — Anonymous\n\n---\n\n*This lesson is part of the IH Academy curriculum.*`
        const duration = tpl.duration

        await client.query(
          `INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [course.id, title, content, duration, i + 1]
        )
        totalInserted++
      }
    }

    console.log(`  Inserted ${totalInserted} lessons across ${courses.length} courses.`)

    const { rows: countResult } = await client.query('SELECT COUNT(*)::int AS count FROM public.lessons')
    console.log(`  Total lessons in table: ${countResult[0].count}`)
  } catch (err) {
    console.error('  Seed failed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
