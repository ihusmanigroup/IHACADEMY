const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

// Load .env from project root
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
const PAT = process.env.SUPABASE_PAT
const PROJECT_REF = 'dolfyahvhqsszjzsjgsi'

// Build pooler connection string from DB_URL
function buildPoolerURL() {
  if (!DB_URL) return null
  try {
    const url = new URL(DB_URL)
    url.hostname = 'aws-0-us-west-1.pooler.supabase.com'
    url.port = '6543'
    // Pooler requires postgres.<project_ref> as user
    url.username = `postgres.${PROJECT_REF}`
    return url.toString()
  } catch {
    return null
  }
}

const POOLER_URL = buildPoolerURL()

const SQL = `
CREATE TABLE IF NOT EXISTS public.intern_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    track TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT,
    city TEXT,
    experience_level TEXT,
    skills TEXT[],
    github_url TEXT,
    linkedin_url TEXT,
    resume_url TEXT,
    cover_note TEXT,
    availability TEXT,
    password TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.intern_applications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'intern_applications' AND policyname = 'Allow public inserts') THEN
    CREATE POLICY "Allow public inserts" ON public.intern_applications FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'intern_applications' AND policyname = 'Allow public select') THEN
    CREATE POLICY "Allow public select" ON public.intern_applications FOR SELECT USING (true);
  END IF;
END $$;
`

async function tryConnection(url, label) {
  const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 10000 })
  const client = await pool.connect()
  try {
    console.log(`  🔌 Connected via ${label}...`)
    await client.query(SQL)
    console.log('  ✅ Table `intern_applications` created (or already exists).')
    console.log('  ✅ RLS enabled + policies created.')
  } finally {
    client.release()
    await pool.end()
  }
}

async function runViaAPI() {
  if (!PAT) {
    console.log('')
    console.log('  ❌ All DB connections failed and no SUPABASE_PAT set.')
    console.log('')
    console.log('  Option 1 — Paste the SQL directly in Supabase dashboard:')
    console.log('    https://supabase.com/dashboard/project/dolfyahvhqsszjzsjgsi/sql/new')
    console.log('')
    console.log('  Option 2 — Get a PAT and re-run:')
    console.log('    set SUPABASE_PAT=your_token_here')
    console.log('    node scripts/create_intern_table.js')
    console.log('')
    console.log('  SQL to run:')
    console.log('  ' + '-' .repeat(50))
    console.log(SQL.trim())
    console.log('  ' + '-' .repeat(50))
    process.exit(1)
  }

  console.log('  🔌 Connecting via Supabase Management API...')
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: SQL }),
  })

  if (res.ok) {
    console.log('  ✅ Table `intern_applications` created (or already exists).')
    console.log('  ✅ RLS enabled + policies created.')
  } else {
    const text = await res.text()
    console.error(`  ❌ API failed (${res.status}):`, text)
    process.exit(1)
  }
}

async function main() {
  console.log('')
  console.log('  ╔══════════════════════════════════════════╗')
  console.log('  ║  IH Academy — Create intern_applications ║')
  console.log('  ╚══════════════════════════════════════════╝')
  console.log('')

  // 1. Try pooler (IPv4 reachable)
  if (POOLER_URL) {
    try {
      await tryConnection(POOLER_URL, 'Supabase Pooler (:6543)')
      return
    } catch (err) {
      console.log(`  ⚠ Pooler: ${err.message}`)
    }
  }

  // 2. Try direct connection
  if (DB_URL) {
    try {
      await tryConnection(DB_URL, 'Direct DB (:5432)')
      return
    } catch (err) {
      console.log(`  ⚠ Direct: ${err.message}`)
    }
  }

  // 3. Fallback: Management API
  await runViaAPI()
}

main().catch((err) => {
  console.error('  ❌ Fatal:', err.message)
  process.exit(1)
})
