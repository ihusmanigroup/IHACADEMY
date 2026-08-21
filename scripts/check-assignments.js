const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

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

;(async () => {
  const c = new Client({ connectionString: process.env.SUPABASE_DB_URL })
  await c.connect()
  const assignments = await c.query(`select week_id, count(*) as cnt from public.internship_assignments group by week_id order by week_id`)
  console.log('ASSIGNMENTS PER WEEK:', JSON.stringify(assignments.rows, null, 2))
  const mlAssignments = await c.query(`select id, week_id, title from public.internship_assignments where week_id like 'machine-learning-%' order by week_id, "order"`)
  console.log('ML ASSIGNMENTS:', JSON.stringify(mlAssignments.rows, null, 2))
  const aiAssignments = await c.query(`select id, week_id, title from public.internship_assignments where week_id like 'agentic-ai-%' order by week_id, "order"`)
  console.log('AI ASSIGNMENTS:', JSON.stringify(aiAssignments.rows, null, 2))
  await c.end()
})().catch(e => { console.error(e.message); process.exit(1) })