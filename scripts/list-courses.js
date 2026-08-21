const { Pool } = require('pg')

const DB_CONFIG = {
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.dolfyahvhqsszjzsjgsi',
  password: 'IhAcademy#2026$DbSecure!',
  ssl: { rejectUnauthorized: false }
}

async function main() {
  const pool = new Pool(DB_CONFIG)
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.title, c.is_free, c.price, c.total_lessons,
              COUNT(l.id)::int AS lesson_count
       FROM public.courses c
       LEFT JOIN public.lessons l ON l.course_id = c.id
       GROUP BY c.id
       ORDER BY c.created_at`
    )
    console.log('COURSES IN DB:')
    rows.forEach((r) => {
      console.log(`  [${r.is_free ? 'FREE' : 'PRO '}] ${r.title} | lessons: ${r.lesson_count}/${r.total_lessons} | price: ${r.price} | id: ${r.id}`)
    })
  } catch (err) {
    console.error('Query failed:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
