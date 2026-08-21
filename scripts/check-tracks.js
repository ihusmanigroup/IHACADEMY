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
  const tracks = await c.query(`select id, name, slug from public.internship_tracks where season_id = 'winter-2026-27' order by "order"`)
  console.log('TRACKS:', JSON.stringify(tracks.rows, null, 2))
  const weeks = await c.query(`select track_id, week_number, title from public.internship_weeks order by track_id, week_number`)
  console.log('WEEKS:', JSON.stringify(weeks.rows, null, 2))
  await c.end()
})().catch(e => { console.error(e.message); process.exit(1) })