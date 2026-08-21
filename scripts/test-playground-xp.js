const { Pool } = require('pg')

const pool = new Pool({
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.dolfyahvhqsszjzsjgsi',
  password: 'IhAcademy#2026$DbSecure!',
  ssl: { rejectUnauthorized: false }
})

async function main() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query('SELECT id FROM public.profiles LIMIT 1')
    if (!rows.length) {
      console.log('No profiles found — cannot test auth path')
      await client.query('ROLLBACK')
      return
    }
    const uid = rows[0].id
    console.log('Test user:', uid)
    await client.query(`SET LOCAL request.jwt.claims = '${JSON.stringify({ sub: uid, role: 'authenticated' })}'`)

    // Neutralize any real state inside the test txn (rolled back at the end).
    await client.query(
      "UPDATE public.xp_transactions SET created_at = now() - interval '2 days' WHERE user_id = $1 AND source = 'playground_run'",
      [uid]
    )
    await client.query(
      "UPDATE public.profiles SET xp = xp - COALESCE((SELECT SUM(xp_amount) FROM public.xp_transactions WHERE user_id = $1 AND source = 'playground_run' AND created_at >= date_trunc('day', now())), 0) WHERE id = $1",
      [uid]
    )

    const call = async (hash, cleanLen) => {
      const r = await client.query('SELECT * FROM public.award_playground_xp($1, $2)', [hash, cleanLen])
      return r.rows[0]
    }
    const backdate = async () => {
      await client.query(
        "UPDATE public.xp_transactions SET created_at = now() - interval '60 seconds' WHERE user_id = $1 AND source = 'playground_run' AND created_at > now() - interval '1 minute'",
        [uid]
      )
    }

    let r = await call('h1', 100)
    console.log('1) first run (no snapshot)   ->', JSON.stringify(r), r.awarded ? 'PASS' : 'FAIL')
    r = await call('h2', 100)
    console.log('2) run within 45s           ->', JSON.stringify(r), r.reason === 'cooldown' ? 'PASS' : 'FAIL')
    await backdate()
    r = await call('h1', 100)
    console.log('3) identical code rerun     ->', JSON.stringify(r), r.reason === 'unchanged' ? 'PASS' : 'FAIL')
    await backdate()
    r = await call('h3', 110)
    console.log('4) minor edit (diff 10<15)  ->', JSON.stringify(r), r.reason === 'minor_edit' ? 'PASS' : 'FAIL')
    await backdate()
    r = await call('h4', 115)
    console.log('5) boundary edit (diff 15)  ->', JSON.stringify(r), r.awarded ? 'PASS' : 'FAIL')
    await backdate()
    r = await call('h5', 130)
    console.log('6) meaningful edit (diff 15)->', JSON.stringify(r), r.awarded ? 'PASS' : 'FAIL')
    await backdate()
    r = await call('h6', 140)
    console.log('7) run past 30 XP cap       ->', JSON.stringify(r), r.reason === 'daily_cap' ? 'PASS' : 'FAIL')

    const total = await client.query(
      "SELECT COALESCE(SUM(xp_amount),0) AS s FROM public.xp_transactions WHERE user_id = $1 AND source = 'playground_run' AND created_at >= date_trunc('day', now())",
      [uid]
    )
    console.log('8) daily sum in txn         ->', total.rows[0].s, Number(total.rows[0].s) === 30 ? 'PASS' : 'FAIL')

    await client.query('ROLLBACK')
    console.log('All changes rolled back — user XP untouched.')
  } catch (err) {
    console.error('TEST ERROR:', err.message)
    await client.query('ROLLBACK')
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

main()
