require('dotenv').config({ path: require('path').resolve(__dirname, '.env') })
const { Client } = require('pg')

;(async () => {
  const c = new Client({ connectionString: process.env.SUPABASE_DB_URL })
  await c.connect()
  const r = await c.query(
    "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('internship_tracks','internship_weeks') ORDER BY table_name, ordinal_position"
  )
  console.table(r.rows)
  await c.end()
})().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
