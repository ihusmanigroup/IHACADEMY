/**
 * IH Academy — Run migration via Supabase Management API (HTTPS/443)
 *
 * Usage:
 *   set SUPABASE_PAT=your_personal_access_token
 *   node scripts/migrate-via-api.js
 *
 * Get a PAT: https://supabase.com/dashboard/account/tokens
 * Project ref: dolfyahvhqsszjzsjgsi
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

const PAT = process.env.SUPABASE_PAT
const PROJECT_REF = 'dolfyahvhqsszjzsjgsi'

if (!PAT) {
  console.log('')
  console.log('  Supply your Supabase Personal Access Token:')
  console.log('    set SUPABASE_PAT=your_token_here')
  console.log('    node scripts/migrate-via-api.js')
  console.log('')
  console.log('  Get a PAT: https://supabase.com/dashboard/account/tokens')
  process.exit(1)
}

const sql = fs.readFileSync(
  path.resolve(__dirname, '..', 'supabase', 'migrations', '20260729000011_add_profile_settings.sql'),
  'utf-8'
)

const body = JSON.stringify({ query: sql })

const options = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${PROJECT_REF}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${PAT}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
}

const req = https.request(options, (res) => {
  let data = ''
  res.on('data', (chunk) => { data += chunk })
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('Migration ran successfully.')
    } else {
      console.log(`Status: ${res.statusCode}`)
      console.log(data)
    }
  })
})

req.on('error', (e) => {
  console.error('Request failed:', e.message)
})

req.write(body)
req.end()
