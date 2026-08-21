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

const DB_URL = process.env.SUPABASE_DB_URL
if (!DB_URL) { console.error('NO DB URL'); process.exit(1) }

async function run() {
  const c = new Client({ connectionString: DB_URL })
  await c.connect()
  try {
    const r = await c.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'courses'
      ORDER BY ordinal_position
    `)
    console.log('=== courses table columns ===')
    r.rows.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}${row.column_default ? ' [' + row.column_default + ']' : ''}`))

    const sample = await c.query('SELECT * FROM public.courses LIMIT 3')
    console.log('\n=== sample rows ===')
    console.log(JSON.stringify(sample.rows, null, 2))
  } finally {
    await c.end()
  }
}
run().catch((e) => { console.error(e); process.exit(1) })