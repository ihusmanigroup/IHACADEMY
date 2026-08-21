// server/index.js
//
// Lightweight Node/Express backend for the Intern Portal forgot-password flow.
// It does ONE job: email the 6-digit OTP (generated + stored on
// `intern_applications` by the client) to the approved applicant's Gmail via
// Resend. The RESEND_API_KEY never reaches the browser.
//
// In development this is auto-started by the Vite dev server (see client/
// vite.config.js) and reached through the /api proxy, so there is no separate
// "run the server" step and no 502 / CORS errors. For production, run it behind
// your host: `node server/index.js` (listens on PORT || 8787).

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')
const { Pool } = require('pg')

const app = express()
app.use(cors())
app.use(express.json())

// Gmail SMTP via Nodemailer — no Resend test-mode restriction, so the OTP can be
// sent to ANY approved applicant's address (the typed email). Credentials come
// from SMTP_USER / SMTP_PASS in .env (SMTP_PASS = Gmail App Password).
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'ihusmanigroup@gmail.com',
    pass: process.env.SMTP_PASS,
  },
})

const PORT = process.env.PORT || 8787
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
})

const EMAIL_HTML = (name, otp) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; max-width:480px; margin:0 auto; color:#0f172a">
    <h2>Intern Portal Password Reset</h2>
    <p>Hi ${name},</p>
    <p>Your 6-digit OTP code is:</p>
    <h1 style="color: #10B981; letter-spacing: 4px;">${otp}</h1>
    <p>This code will expire in 15 minutes.</p>
    <p style="color:#64748b;font-size:12px;margin-top:24px">— IH Academy Team</p>
  </div>
`

app.post('/api/intern/forgot-password', async (req, res) => {
  const { email, otp } = req.body || {}
  const cleanEmail = String(email || '').trim().toLowerCase()
  if (!cleanEmail || !otp) {
    return res.status(400).json({ error: 'email and otp are required' })
  }
  let client
  try {
    client = await pool.connect()
    // Only email approved applicants — prevents OTP spam to arbitrary addresses.
    const { rows } = await client.query(
      "SELECT id, full_name, email, status FROM intern_applications WHERE email = $1 AND status = 'approved' LIMIT 1",
      [cleanEmail]
    )
    if (!rows.length) {
      return res.status(404).json({ error: 'No approved application for this email' })
    }
    const app = rows[0]
    const name = app.full_name || 'Intern'

    await transporter.sendMail({
      from: `"IH Academy" <${process.env.SMTP_USER || 'ihusmanigroup@gmail.com'}>`,
      to: app.email, // dynamic recipient = the typed/approved applicant email
      subject: 'IH Academy — Intern Portal Password Reset Code',
      html: EMAIL_HTML(name, otp),
    })

    return res.json({ success: true })
  } catch (err) {
    console.error('[forgot-password] send failed:', err.message)
    return res.status(500).json({ error: err.message || 'Failed to send email' })
  } finally {
    if (client) client.release()
  }
})

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`Intern email server listening on http://localhost:${PORT}`)
})
