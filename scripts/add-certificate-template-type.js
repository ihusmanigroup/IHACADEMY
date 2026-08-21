/**
 * IH Academy — certificate_templates.template_type
 * ------------------------------------------------------------------
 * Usage (from repo root):
 *   node scripts/add-certificate-template-type.js
 *
 * The Intern Portal Certificate tab renders TWO cards per track:
 *   - Entry / Offer Letter      (always unlocked)
 *   - Certificate of Completion (unlocks at 100% progress)
 * This migration adds `template_type` so the admin can upload and label each
 * template ('entry' | 'completion'). Existing rows are backfilled to
 * 'completion'. The portal falls back to the latest untyped template when a
 * track only has one upload.
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
    await client.query(`
      ALTER TABLE public.certificate_templates
        ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'completion';
    `)

    await client.query(`
      ALTER TABLE public.certificate_templates
        DROP CONSTRAINT IF EXISTS certificate_templates_template_type_check,
        ADD CONSTRAINT certificate_templates_template_type_check
          CHECK (template_type = ANY (ARRAY['entry'::text, 'completion'::text]));
    `)

    console.log('  Reloading PostgREST schema cache…')
    await client.query("NOTIFY pgrst, 'reload schema'")

    const { rows } = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'certificate_templates'
        AND column_name = 'template_type'
    `)
    if (!rows.length) {
      console.warn('  ⚠ Could not confirm the new column.')
    } else {
      console.log(`  ✓ certificate_templates.template_type ready (default=${rows[0].column_default}).`)
    }

    const constraint = await client.query(`
      SELECT conname FROM pg_constraint
      WHERE conrelid = 'public.certificate_templates'::regclass
        AND conname = 'certificate_templates_template_type_check'
    `)
    console.log(constraint.rows.length ? '  ✓ template_type CHECK constraint in place.' : '  ⚠ CHECK constraint not found.')

    console.log('\n✔ Certificate template type column ready.')
  } finally {
    await client.end()
  }
}

run().catch((err) => {
  console.error('\n  ❌ Failed:', err.message)
  process.exit(1)
})
