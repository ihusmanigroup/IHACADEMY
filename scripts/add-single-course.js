/**
 * IH Academy — Single Course Insertion Script
 *
 * Usage:
 *   set SUPABASE_DB_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
 *   node scripts/add-single-course.js
 *
 * Or create a .env file in the project root with:
 *   SUPABASE_DB_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
 *
 * This script inserts a single course with lessons and quizzes into Supabase.
 * Edit the course object at the bottom of this file to customize the course content.
 */

const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')
const { v4: uuidv4 } = require('uuid')

// Try loading .env from project root
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
  console.error('  ❌ SUPABASE_DB_URL not set.')
  console.error('')
  console.error('  To get your connection string:')
  console.error('    1. Go to https://supabase.com/dashboard/project/dolfyahvhqsszjzsjgsi/settings/database')
  console.error('    2. Copy the "Connection string" under "Direct connection"')
  console.error('    3. Run:')
  console.error('       set SUPABASE_DB_URL=postgresql://postgres:YOUR_PASSWORD@db.dolfyahvhqsszjzsjgsi.supabase.co:5432/postgres')
  console.error('       node scripts/add-single-course.js')
  console.error('')
  process.exit(1)
}

// ============================================================
// COURSE OBJECT TEMPLATE
// ============================================================
// Edit this object to define your course content
// ============================================================

const courseData = {
  title: "Your Course Title",
  description: "A comprehensive course covering the fundamentals and advanced topics.",
  category: "Your Category",
  level: "Beginner", // Beginner, Intermediate, Advanced
  pricing_type: "Free", // Free or Paid
  xp_reward: 100,
  thumbnail_url: null, // Optional: URL to course thumbnail
  lessons: [
    {
      title: "Lesson 1: Introduction",
      content: `# Introduction

This is the first lesson. Write your comprehensive 1-page markdown content here.

## Key Concepts

- Concept 1
- Concept 2
- Concept 3

## Detailed Explanation

Provide deep, comprehensive content following Anthropic's style.`,
      duration_mins: 25,
      lesson_order: 1,
      quiz: {
        title: "Lesson 1 Quiz",
        questions: [
          {
            question: "What is the main concept covered in this lesson?",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correct_answer: 0, // Index of correct option (0-based)
            explanation: "Explanation of why this is the correct answer."
          },
          {
            question: "Which statement is true?",
            options: ["Statement A", "Statement B", "Statement C", "Statement D"],
            correct_answer: 1,
            explanation: "Explanation of why this is the correct answer."
          }
        ]
      }
    }
    // Add more lessons as needed
  ]
}

// ============================================================
// INSERTION LOGIC
// ============================================================

async function run() {
  console.log('  🔌 Connecting to Supabase PostgreSQL...')
  const pool = new Pool({ 
    connectionString: DB_URL,
    statement_timeout: 30000 // 30 second timeout per query
  })

  try {
    const client = await pool.connect()
    console.log('  ✅ Connected.')

    // Start transaction
    await client.query('BEGIN')
    console.log('  📝 Transaction started.')

    try {
      // Insert course
      console.log(`  📚 Inserting course: ${courseData.title}`)
      const courseResult = await client.query(
        `INSERT INTO public.courses (title, description, category, level, thumbnail_url, total_lessons, xp_reward)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          courseData.title,
          courseData.description,
          courseData.category,
          courseData.level,
          courseData.thumbnail_url,
          courseData.lessons.length,
          courseData.xp_reward
        ]
      )
      const courseId = courseResult.rows[0].id
      console.log(`  ✅ Course inserted with ID: ${courseId}`)

      // Insert lessons and quizzes
      for (const lesson of courseData.lessons) {
        console.log(`  📖 Inserting lesson: ${lesson.title}`)
        
        // Insert lesson
        const lessonResult = await client.query(
          `INSERT INTO public.lessons (course_id, title, content, duration_mins, lesson_order)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [courseId, lesson.title, lesson.content, lesson.duration_mins, lesson.lesson_order]
        )
        const lessonId = lessonResult.rows[0].id
        console.log(`  ✅ Lesson inserted with ID: ${lessonId}`)

        // Insert quiz if provided
        if (lesson.quiz) {
          console.log(`  ❓ Inserting quiz: ${lesson.quiz.title}`)
          await client.query(
            `INSERT INTO public.quizzes (lesson_id, title, questions)
             VALUES ($1, $2, $3)`,
            [lessonId, lesson.quiz.title, JSON.stringify(lesson.quiz.questions)]
          )
          console.log(`  ✅ Quiz inserted`)
        }
      }

      // Commit transaction
      await client.query('COMMIT')
      console.log('  ✅ Transaction committed.')

      console.log('')
      console.log('  🎉 Course insertion complete!')
      console.log(`  Course: ${courseData.title}`)
      console.log(`  Lessons: ${courseData.lessons.length}`)
      console.log('')

    } catch (err) {
      // Rollback on error
      await client.query('ROLLBACK')
      console.error('  ❌ Transaction rolled back due to error:', err.message)
      throw err
    }

    client.release()
  } catch (err) {
    console.error('  ❌ Insertion failed:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

run()
