/**
 * IH Academy — Clean 4-Category Certificate Scheme
 * ------------------------------------------------------------------
 * Usage (from repo root):
 *   node scripts/add-certificate-categories.js
 *
 * Aligns `certificate_templates` to the clean 4-category scheme:
 *   target_type        IN ('internship','minor','paid','major','specific')
 *   certificate_category IN ('internship_entry','internship_completion','course_completion','major_capstone')
 *
 * Backfills existing rows:
 *   target_type: 'internship-track' → 'internship'
 *   certificate_category: 'entry' → 'internship_entry', 'completion' → 'course_completion'
 *
 * Idempotent + PostgREST schema reload.
 *
 * Required env var (see .env): SUPABASE_DB_URL
 */

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
if (!DB_URL) {
  console.error('\n  ❌ SUPABASE_DB_URL not set. Add it to .env (see comment there).\n')
  process.exit(1)
}

async function run() {
  console.log('ℹ Connecting to Supabase database…')
  const client = new Client({ connectionString: DB_URL })
  await client.connect()

  try {
    // 1. Backfill target_type: 'internship-track' → 'internship'
    await client.query(`
      UPDATE public.certificate_templates
      SET target_type = 'internship'
      WHERE target_type = 'internship-track';
    `)
    console.log('  ✓ Backfilled target_type "internship-track" → "internship"')

    // 2. Backfill certificate_category
    await client.query(`
      UPDATE public.certificate_templates
      SET certificate_category = CASE
        WHEN certificate_category = 'entry' THEN 'internship_entry'
        WHEN certificate_category = 'completion' THEN 'course_completion'
        ELSE certificate_category
      END;
    `)
    console.log('  ✓ Backfilled certificate_category: entry→internship_entry, completion→course_completion')

    // 3. Update target_type default + CHECK
    await client.query(`
      ALTER TABLE public.certificate_templates
        ALTER COLUMN target_type SET DEFAULT 'internship';
    `)

await client.query(`
      ALTER TABLE public.certificate_templates
        DROP CONSTRAINT IF EXISTS certificate_templates_course_type_check,
        ADD CONSTRAINT certificate_templates_target_type_check
          CHECK (target_type = ANY (ARRAY['internship'::text,'minor'::text,'paid'::text,'major'::text,'specific'::text]));
    `)
    console.log('  ✓ target_type CHECK updated')

    // 4. Update certificate_category default + CHECK
    await client.query(`
      ALTER TABLE public.certificate_templates
        ALTER COLUMN certificate_category SET DEFAULT 'course_completion';
    `)

    await client.query(`
      ALTER TABLE public.certificate_templates
        DROP CONSTRAINT IF EXISTS certificate_templates_certificate_category_check,
        ADD CONSTRAINT certificate_templates_certificate_category_check
          CHECK (certificate_category = ANY (ARRAY['internship_entry'::text,'internship_completion'::text,'course_completion'::text,'major_capstone'::text]));
    `)
    console.log('  ✓ certificate_category CHECK updated')

    // 5. Reload PostgREST schema
    console.log('  Reloading PostgREST schema cache…')
    await client.query("NOTIFY pgrst, 'reload schema'")

    // Verify
    const { rows: cols } = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'certificate_templates'
        AND column_name IN ('target_type','certificate_category')
      ORDER BY column_name
    `)
    console.log('\n  Columns:')
    for (const r of cols) console.log(`    - ${r.column_name} ${r.data_type} default=${r.column_default}`)

    const { rows: cons } = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) def
      FROM pg_constraint
      WHERE conrelid = 'public.certificate_templates'::regclass
        AND conname IN ('certificate_templates_target_type_check','certificate_templates_certificate_category_check')
      ORDER BY conname
    `)
    console.log('\n  Constraints:')
    for (const c of cons) console.log(`    - ${c.conname}: ${c.def}`)

    console.log('\n✔ 4-category certificate scheme ready.')
  } finally {
    await client.end()
  }
}

run().catch((err) => {
  console.error('\n  ❌ Failed:', err.message)
  process.exit(1)
})