import nodemailer from 'nodemailer'
import pg from 'pg'

const pool = new pg.Pool({
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, otp } = req.body || {}
  const cleanEmail = String(email || '').trim().toLowerCase()
  if (!cleanEmail || !otp) {
    return res.status(400).json({ error: 'email and otp are required' })
  }

  const smtpUser = process.env.SMTP_USER || 'ihusmanigroup@gmail.com'
  if (!process.env.SMTP_PASS || !process.env.SUPABASE_DB_URL) {
    console.error('[forgot-password] missing SMTP_PASS or SUPABASE_DB_URL env vars')
    return res.status(500).json({ error: 'Email service not configured' })
  }

  let client
  try {
    client = await pool.connect()
    const { rows } = await client.query(
      "SELECT id, full_name, email, status FROM intern_applications WHERE email = $1 AND status = 'approved' LIMIT 1",
      [cleanEmail]
    )
    if (!rows.length) {
      return res.status(404).json({ error: 'No approved application for this email' })
    }
    const application = rows[0]
    const name = application.full_name || 'Intern'

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser, pass: process.env.SMTP_PASS },
    })

    await transporter.sendMail({
      from: `"IH Academy" <${smtpUser}>`,
      to: application.email,
      subject: 'IH Academy — Intern Portal Password Reset Code',
      html: EMAIL_HTML(name, otp),
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('[forgot-password] send failed:', err.message)
    return res.status(500).json({ error: err.message || 'Failed to send email' })
  } finally {
    if (client) client.release()
  }
}
