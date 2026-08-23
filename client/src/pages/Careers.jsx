import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useInternAuth } from '../context/InternAuthContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import InternApplyModal from '../components/InternApplyModal'
import SpotlightCard from '../components/SpotlightCard'
import { DEV_MODE } from '../config/devMode'
import {
  X, Loader2, Eye, EyeOff,
  LogIn, UserPlus, ShieldAlert, Award, Handshake, BadgeCheck, Code2,
  Zap, Star, Snowflake, Sun, Lock, CalendarClock, Globe, Clock3,
  Mail, KeyRound, CheckCircle2, ArrowLeft,
} from 'lucide-react'
import LiveCountdown from '../components/LiveCountdown'

const TRACKS = [
  {
    id: 'frontend-engineering', icon: '💻', label: 'Frontend Web Engineering',
    desc: 'Craft pixel-perfect responsive UIs with React.js, Tailwind CSS, and TypeScript. Ship accessible, performant components.',
    tech: 'React.js, Tailwind CSS, TypeScript, Responsive UI',
    duration: '4 Weeks', format: 'Remote / Self-Paced',
  },
  {
    id: 'backend-engineering', icon: '🚀', label: 'Backend Engineering',
    desc: 'Build scalable REST APIs and data layers with Node.js, Express, and PostgreSQL. Validate inputs, handle errors, deploy.',
    tech: 'Node.js, Express, PostgreSQL, REST & AI APIs',
    duration: '4 Weeks', format: 'Remote / Self-Paced',
  },
  {
    id: 'full-stack-engineering', icon: '⚡', label: 'Full-Stack Software Engineering',
    desc: 'Own the full development lifecycle — from React frontends to Node.js/PostgreSQL backends. Ship production-grade features.',
    tech: 'React, Node.js, Databases, Full Lifecycle Deployment',
    duration: '4 Weeks', format: 'Remote / Self-Paced',
  },
  {
    id: 'machine-learning', icon: '🤖', label: 'Machine Learning',
    desc: 'Work with real datasets, engineer features, train and evaluate models with Python, scikit-learn, and pandas.',
    tech: 'Python, scikit-learn, Pandas, Model Evaluation',
    duration: '4 Weeks', format: 'Remote / Self-Paced',
  },
  {
    id: 'agentic-ai-engineering', icon: '🧠', label: 'Agentic AI Engineering',
    desc: 'Build AI agents and workflows with LLM APIs, function calling, and agent frameworks. Evaluate outputs rigorously.',
    tech: 'LLM APIs, LangChain, Function Calling, Agent Workflows',
    duration: '4 Weeks', format: 'Remote / Self-Paced',
  },
]

const TRACK_GRADIENTS = [
  'from-sky-500 to-cyan-400',
  'from-violet-500 to-fuchsia-500',
  'from-emerald-500 to-teal-400',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
]

const BENEFITS = [
  { icon: Award, title: 'Verified Certificate', desc: 'Earn an official IH Usmani Group completion certificate after all 4 weeks are approved.' },
  { icon: Code2, title: 'Real Production Projects', desc: 'Build industry-standard applications for your portfolio instead of dummy code.' },
  { icon: Handshake, title: 'Mentorship & Code Reviews', desc: 'Get feedback on your solutions and architecture from senior engineers.' },
  { icon: BadgeCheck, title: 'Letter of Recommendation', desc: 'Top performers receive personalized LORs for future career growth.' },
]

/**
 * Map a Supabase internship_seasons row to the shape the UI expects.
 * Adds computed fields (programDates, appOpen/appClose as month/day objects, accent, etc.)
 * so the rest of the component can stay largely unchanged.
 */
function mapSeasonToCohort(s) {
  const season = s // Supabase row
  const isWinter = season.type === 'winter' || season.slug?.includes('winter')
  const isFree = season.is_free ?? true
  const price = season.price ?? 0

  const appOpen = season.application_open_at ? new Date(season.application_open_at) : null
  const appClose = season.application_close_at ? new Date(season.application_close_at) : null
  const progStart = season.program_start_at ? new Date(season.program_start_at) : null
  const progEnd = season.program_end_at ? new Date(season.program_end_at) : null

  const programDates = progStart && progEnd
    ? `${progStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — ${progEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
    : (season.description || 'Dates TBD')

  const appOpenMonthDay = appOpen ? { month: appOpen.getMonth() + 1, day: appOpen.getDate() } : { month: 11, day: 1 }
  const appCloseMonthDay = appClose ? { month: appClose.getMonth() + 1, day: appClose.getDate() } : { month: 11, day: 20 }

  return {
    id: season.id,
    slug: season.slug,
    icon: isWinter ? Snowflake : Sun,
    title: season.name,
    tagline: `${isWinter ? '4' : '6'} Weeks · ${isFree ? 'Free' : 'Pro'}`,
    programDates,
    appOpen: appOpenMonthDay,
    appClose: appCloseMonthDay,
    free: isFree,
    price,
    accent: isWinter ? 'from-sky-400 to-blue-600' : 'from-amber-400 to-orange-600',
    spotlight: isWinter ? 'rgba(56, 189, 248, 0.25)' : 'rgba(245, 158, 11, 0.25)',
    desc: season.description || (isWinter
      ? 'A structured 4-week winter cohort: 4 assignments per week, required free courses, and strict approval-based unlocks. Completely free.'
      : 'An extended 6-week summer cohort with the full Pro experience: advanced tracks, weekly 1-on-1 mentorship, code reviews, and priority selection.'),
  }
}

function getSeasonWindow(type, now = new Date()) {
  const y = now.getFullYear()
  const windows = [-1, 0, 1].map((dy) => ({
    start: new Date(y + dy, type.appOpen.month - 1, type.appOpen.day),
    end: new Date(y + dy, type.appClose.month - 1, type.appClose.day),
  }))
  const active = windows.find((w) => now >= w.start && now <= w.end)
  const win = active || windows.filter((w) => w.start > now).sort((a, b) => a.start - b.start)[0]
  return { isOpen: !!active, opensOn: win.start, closesOn: win.end }
}

function formatDate(d) {
  if (!d) return ''
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 3500)
    return () => clearTimeout(id)
  }, [onClose])
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium bg-gray-900/95 border-amber-500/30 text-amber-300">
      <ShieldAlert className="w-4 h-4 shrink-0" />
      {message}
    </div>
  )
}

/**
 * Intern Login — Email & Password only. Credentials are matched against the
 * applicant records (DB + local applications). On success the full application
 * data (name, track, resume, GitHub…) is loaded into the intern session and the
 * user is sent straight into /intern-portal.
 */
const STEP = {
  LOGIN: 'LOGIN',
  FORGOT_EMAIL: 'FORGOT_EMAIL',
  VERIFY_OTP: 'VERIFY_OTP',
  RESET_PASSWORD: 'RESET_PASSWORD',
  SUCCESS: 'SUCCESS',
}

const STEP_TITLE = {
  LOGIN: 'Intern Login',
  FORGOT_EMAIL: 'Reset Password',
  VERIFY_OTP: 'Verify Code',
  RESET_PASSWORD: 'Set New Password',
  SUCCESS: 'Password Updated',
}

/**
 * Intern Login + custom Forgot-Password (6-digit OTP) flow.
 *
 * IMPORTANT: this is 100% isolated from `supabase.auth` — every read/write for
 * the password reset runs directly against the `intern_applications` table
 * (the same DB the intern login itself authenticates against). We never call
 * `supabase.auth.resetPasswordForEmail` / `verifyOtp` / `updateUser`, so the main
 * website's auth session is completely untouched.
 */
function InternLoginModal({ onClose }) {
  const navigate = useNavigate()
  const { login, purgeCorruptSessions } = useInternAuth()
  const [step, setStep] = useState(STEP.LOGIN)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Forgot-password (OTP) flow state
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [sendingCode, setSendingCode] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [pwError, setPwError] = useState('')
  const otpRefs = useRef([])

  // Drop any leftover mock-auth session so a stale `intern-…` id can't leak
  // into the portal when this intern signs in.
  useEffect(() => { purgeCorruptSessions() }, [purgeCorruptSessions])

  const canSubmit = form.email.trim() && form.password.trim()

  const resetForgotFlow = () => {
    setOtp(['', '', '', '', '', ''])
    setNewPassword('')
    setConfirmPassword('')
    setPwError('')
  }

  const goToLogin = () => {
    resetForgotFlow()
    setError('')
    setStep(STEP.LOGIN)
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    const result = await login(form.email.trim(), form.password)
    if (result.success) {
      // Only AFTER a successful Email & Password login do we grant portal access
      // by setting the intern access flag, then navigate in.
      try { sessionStorage.setItem('intern_unlocked', 'true') } catch {}
      navigate('/intern-portal')
    } else if (result.status === 'pending') {
      setError(result.error)
    } else {
      setError(result.error || 'Login failed')
    }
    setSubmitting(false)
  }

  // STEP 1 — request a 6-digit code, stored on the intern_applications row.
  const handleRequestOtp = async () => {
    const email = form.email.trim()
    if (!email) {
      setError('Enter your email address first.')
      return
    }
    setSendingCode(true)
    setError('')
    try {
      // Only approved applicants may request a reset.
      const { data: app, error: appErr } = await supabase
        .from('intern_applications')
        .select('id')
        .eq('email', email)
        .eq('status', 'approved')
        .maybeSingle()
      if (appErr) throw appErr
      if (!app) {
        setError('No approved internship application found for this email.')
        return
      }
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
      const { error: updErr } = await supabase
        .from('intern_applications')
        .update({ reset_otp: generatedOtp, otp_expires_at: expiresAt })
        .eq('email', email)
      if (updErr) throw updErr

      // Real email dispatch via the local Express backend (/api/intern/forgot-password,
      // proxied by Vite so it's same-origin — no CORS/502). It emails the OTP through
      // Resend; the key never reaches the browser. The OTP is delivered EXCLUSIVELY
      // to the user's inbox — never shown, logged, or alerted on screen.
      //
      // The OTP was already persisted to `intern_applications` above, so the
      // reset flow can still continue even if the email can't be sent:
      //  • DEV_MODE  → advance anyway so local testing is never blocked by a
      //                send failure or a network blip.
      //  • Production→ surface an explicit red error and stay on this step.
      try {
        const resp = await fetch('/api/intern/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: generatedOtp }),
        })
        const data = await resp.json().catch(() => ({}))
        if (!resp.ok) throw new Error(data.error || `Email service error (${resp.status})`)
      } catch (e) {
        if (DEV_MODE) {
          setStep(STEP.VERIFY_OTP)
          return
        }
        setError(`Email delivery failed: ${e.message || 'unknown error'}`)
        return
      }
      setStep(STEP.VERIFY_OTP)
    } catch (err) {
      setError(err?.message || 'Could not send the reset code. Please try again.')
    } finally {
      setSendingCode(false)
    }
  }

  // STEP 2 — verify the entered code against the stored OTP + expiry.
  const handleVerifyOtp = async () => {
    const email = form.email.trim()
    const token = otp.join('')
    if (token.length !== 6) {
      setError('Enter the 6-digit code.')
      return
    }
    setVerifying(true)
    setError('')
    try {
      const { data, error: selErr } = await supabase
        .from('intern_applications')
        .select('reset_otp, otp_expires_at')
        .eq('email', email)
        .maybeSingle()
      if (selErr) throw selErr
      const expires = data?.otp_expires_at ? new Date(data.otp_expires_at) : null
      const isExpired = !expires || expires < new Date()
      if (!data?.reset_otp || data.reset_otp !== token || isExpired) {
        setError('Invalid or expired code. Please request a new one.')
        return
      }
      // Valid — clear the OTP so it can't be reused, then advance.
      const { error: clrErr } = await supabase
        .from('intern_applications')
        .update({ reset_otp: null, otp_expires_at: null })
        .eq('email', email)
      if (clrErr) throw clrErr
      setStep(STEP.RESET_PASSWORD)
    } catch (err) {
      setError(err?.message || 'Could not verify the code. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  // STEP 3 — set the new password on the intern_applications row.
  const handleResetPassword = async () => {
    setPwError('')
    if (newPassword.length < 6) {
      setPwError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.')
      return
    }
    setUpdating(true)
    try {
      const { error: updErr } = await supabase
        .from('intern_applications')
        .update({ password: newPassword, reset_otp: null, otp_expires_at: null })
        .eq('email', form.email.trim())
      if (updErr) throw updErr
      setStep(STEP.SUCCESS)
    } catch (err) {
      setPwError(err?.message || 'Could not update your password. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  // OTP box helpers (auto-advance + paste support).
  const handleOtpChange = (i, val) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    setOtp((prev) => {
      const next = [...prev]
      next[i] = digit
      return next
    })
    if (digit && i < 5) otpRefs.current[i + 1]?.focus()
  }
  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }
  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    e.preventDefault()
    const arr = text.split('').concat(Array(6 - text.length).fill(''))
    setOtp(arr)
    otpRefs.current[Math.min(text.length, 5)]?.focus()
  }

  const StepIcon = step === STEP.LOGIN ? LogIn : KeyRound

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-sm bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <StepIcon className="w-5 h-5 text-emerald-500" /> {STEP_TITLE[step]}
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {step === STEP.LOGIN && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => { setError(''); setStep(STEP.FORGOT_EMAIL) }}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-500 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                    placeholder="Password you set while applying"
                    className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">Demo: <strong>intern@ih.com</strong> / <strong>password123</strong></p>
            </>
          )}

          {step === STEP.FORGOT_EMAIL && (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Enter the email on your approved internship application. We'll generate a 6-digit reset code for it.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRequestOtp() }}
                  placeholder="you@example.com"
                  className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </>
          )}

          {step === STEP.VERIFY_OTP && (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                A 6-digit verification code has been sent to <strong>{form.email}</strong>. Enter it below to continue.
              </p>
              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el }}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    inputMode="numeric"
                    maxLength={1}
                    className="w-11 h-12 text-center text-lg font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#07090e] text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                  />
                ))}
              </div>
            </>
          )}

          {step === STEP.RESET_PASSWORD && (
            <>
              {pwError && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
                  {pwError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">New Password</label>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleResetPassword() }}
                  placeholder="At least 6 characters"
                  className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleResetPassword() }}
                    placeholder="Re-enter new password"
                    className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {step === STEP.SUCCESS && (
            <div className="text-center py-2">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
                Your password has been updated. You can now log in with your new password.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-[#0f1420]/80 border-t border-slate-200 dark:border-slate-800">
          {step === STEP.LOGIN && (
            <>
              <button onClick={onClose} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-5 py-2 rounded-lg text-sm transition-all disabled:opacity-40 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                {submitting ? 'Signing in...' : 'Login'}
              </button>
            </>
          )}

          {step === STEP.FORGOT_EMAIL && (
            <>
              <button onClick={goToLogin} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={handleRequestOtp}
                disabled={sendingCode || !form.email.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-5 py-2 rounded-lg text-sm transition-all disabled:opacity-40 flex items-center gap-2"
              >
                {sendingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {sendingCode ? 'Sending...' : 'Send 6-Digit Code'}
              </button>
            </>
          )}

          {step === STEP.VERIFY_OTP && (
            <>
              <button onClick={() => { setError(''); setStep(STEP.FORGOT_EMAIL) }} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={verifying || otp.join('').length !== 6}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-5 py-2 rounded-lg text-sm transition-all disabled:opacity-40 flex items-center gap-2"
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                {verifying ? 'Verifying...' : 'Verify'}
              </button>
            </>
          )}

          {step === STEP.RESET_PASSWORD && (
            <>
              <button onClick={() => { setError(''); setStep(STEP.VERIFY_OTP) }} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={handleResetPassword}
                disabled={updating}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-5 py-2 rounded-lg text-sm transition-all disabled:opacity-40 flex items-center gap-2"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                {updating ? 'Updating...' : 'Update Password'}
              </button>
            </>
          )}

          {step === STEP.SUCCESS && (
            <button
              onClick={goToLogin}
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-5 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Careers() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { purgeCorruptSessions } = useInternAuth()
  const [params] = useSearchParams()
  const [internApplyOpen, setInternApplyOpen] = useState(false)
  const [internLoginOpen, setInternLoginOpen] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState(null)
  const [selectedCohort, setSelectedCohort] = useState(null)
  const [lockedInfo, setLockedInfo] = useState(null)
  const [toast, setToast] = useState(null)

  // Live seasons from Supabase
  const [seasons, setSeasons] = useState([])
  const [seasonsLoading, setSeasonsLoading] = useState(true)
  const [seasonsError, setSeasonsError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setSeasonsLoading(true)
      setSeasonsError(null)
      const { data, error } = await supabase
        .from('internship_seasons')
        .select('*')
        .eq('is_active', true)
        .order('year', { ascending: false })
      if (cancelled) return
      if (error) {
        setSeasonsError(error.message)
      } else {
        setSeasons(data || [])
      }
      setSeasonsLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Cohorts mapped for UI
  const COHORTS = seasons.map(mapSeasonToCohort)

  // Default cohort for auto-apply fallbacks
  const defaultCohort = COHORTS[0] || null

  const openApply = (cohortId, trackId) => {
    purgeCorruptSessions()
    const cohort = COHORTS.find((c) => c.id === cohortId) || defaultCohort
    if (!cohort) return
    const win = getSeasonWindow(cohort)
    setSelectedCohort(cohort) // pass full cohort object
    setSelectedTrack(trackId)
    setLockedInfo(!DEV_MODE && !win.isOpen ? { opensOn: formatDate(win.opensOn) } : null)
    setInternApplyOpen(true)
  }

  // After internship signup (/register?track=internship|intent=apply), ?apply=1
  // auto-opens the application form so new candidates land directly in it.
  useEffect(() => {
    if (!user || params.get('apply') !== '1') return
    const cohort = defaultCohort
    if (!cohort) return
    const win = getSeasonWindow(cohort)
    setSelectedCohort(cohort) // pass full cohort object
    setSelectedTrack(TRACKS[0].id)
    setLockedInfo(!DEV_MODE && !win.isOpen ? { opensOn: formatDate(win.opensOn) } : null)
    setInternApplyOpen(true)
    navigate(location.pathname, { replace: true })
  }, [user, params, navigate, location.pathname, defaultCohort])

  // Portal was attempted without an active intern session.
  useEffect(() => {
    const notice = params.get('notice')
    if (notice !== 'apply_required' && notice !== 'intern_login') return
    setToast({ message: 'Please sign in to your intern account or apply for an internship to access the portal.' })
    navigate(location.pathname, { replace: true })
  }, [params, navigate, location.pathname])

  const handleInternLogin = () => {
    // ALWAYS open the Email & Password modal. A general site session (Google /
    // Supabase) must NEVER auto-redirect into /intern-portal — the user must go
    // through the modal. The intern access flag is set only on successful submit.
    purgeCorruptSessions()
    setInternLoginOpen(true)
  }

  const closeApply = () => {
    setInternApplyOpen(false)
    setSelectedTrack(null)
    setSelectedCohort(null)
    setLockedInfo(null)
  }

  // Default winter cohort for hero section
  const winterCohort = COHORTS.find((c) => c.id === 'winter') || defaultCohort
  const win = winterCohort ? getSeasonWindow(winterCohort) : { isOpen: false, opensOn: null, closesOn: null }

  return (
    <div className="min-h-screen bg-white dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="mb-10 bg-gradient-to-r from-[#111827] via-[#0F172A] to-[#0369A1]/20 border border-slate-800/80 rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <Snowflake className="w-9 h-9 md:w-11 md:h-11 text-sky-400" />
              <h1 className="text-4xl md:text-5xl font-extrabold text-white">Winter Internship 2026-27</h1>
            </div>
            <p className="text-slate-300 text-sm md:text-base mb-2 max-w-3xl leading-relaxed">
              A structured <span className="text-sky-400 font-semibold">4-week cohort</span> that replaces the old
              eight-week assignment bank: <span className="text-sky-400 font-semibold">4 assignments per week</span>,
              required free courses, and strict approval-based week unlocks.
            </p>
            <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
              Apply by <span className="text-slate-200 font-semibold">{formatDate(win.closesOn)}</span> for the program
              running <span className="text-slate-200 font-semibold">Dec 1 – Dec 28</span>. Choose from 5 tracks —
              Frontend, Backend, Full-Stack, Machine Learning, or Agentic AI — build production-grade projects, and
              earn a verified certificate backed by IH Usmani Group.
            </p>
            <div className="flex flex-wrap gap-2 my-5">
              <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold px-3 py-1 rounded-full">100% Free</span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-3 py-1 rounded-full">Verified Certificate</span>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold px-3 py-1 rounded-full">Mentor Code Reviews</span>
              <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold px-3 py-1 rounded-full">Required Free Courses</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="#internships"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('internships')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-sky-500/20"
              >
                <UserPlus className="w-4 h-4" /> Browse Internships
              </a>
              <button
                onClick={handleInternLogin}
                className="flex items-center gap-2 border border-slate-700/80 hover:bg-slate-800/80 text-slate-200 font-semibold px-6 py-2.5 rounded-xl transition-all"
              >
                <LogIn className="w-4 h-4" /> Intern Login
              </button>
            </div>
          </div>
        </div>

        {/* Internship */}
        <div id="internships" className="mb-10 scroll-mt-8">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-sky-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Internship Cohorts</h2>
            <span className="text-xs text-slate-600 dark:text-slate-300">
              {seasonsLoading
                ? 'Loading…'
                : seasonsError
                ? 'Error'
                : `(${COHORTS.length} programs)`}
            </span>
          </div>

          {seasonsLoading ? (
            <div className="flex flex-wrap justify-center items-center gap-6 w-full my-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-pulse max-w-lg w-full">
                  <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : seasonsError ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              <p className="font-semibold">Failed to load internship programs.</p>
              <p className="text-sm mt-1">{seasonsError}</p>
            </div>
          ) : COHORTS.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              <p className="font-semibold">No active internship programs at the moment.</p>
              <p className="text-sm mt-1">Check back later for upcoming cohorts.</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center items-center gap-6 w-full my-6">
              {COHORTS.map((cohort) => {
                const cWin = getSeasonWindow(cohort)
                const cOpen = DEV_MODE || cWin.isOpen
                const countdownTarget = cOpen ? cWin.closesOn : cWin.opensOn
                return (
                  <SpotlightCard
                    key={cohort.id}
                    spotlightColor={cohort.spotlight}
                    className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:border-cyan-400/40 dark:hover:border-cyan-400/40 flex flex-col max-w-lg w-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cohort.accent} flex items-center justify-center text-white shadow-lg`}>
                        <cohort.icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-md ${
                        cohort.free
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {cohort.free ? '100% Free' : `$${cohort.price} Paid`}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{cohort.title}</h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{cohort.tagline}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed flex-1">{cohort.desc}</p>

                    <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
                      <CalendarClock className="w-3.5 h-3.5 shrink-0" /> {cohort.programDates}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        {cOpen ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-emerald-600 dark:text-emerald-400">Applications close in</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-amber-600 dark:text-amber-400">Opens {formatDate(cWin.opensOn)}</span>
                          </>
                        )}
                      </div>
                      <LiveCountdown target={countdownTarget} compact />
                    </div>

                    <button
                      onClick={() => openApply(cohort.id, TRACKS[0].id)}
                      className={`mt-5 w-full font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm ${
                        cOpen
                          ? cohort.free
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white shadow-md shadow-cyan-500/20'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white shadow-md shadow-amber-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cOpen ? (
                        <>
                          <UserPlus className="w-3.5 h-3.5" /> {cohort.free ? `Apply for ${cohort.title || 'Cohort'}` : `Apply Now · $${cohort.price}`}
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" /> Preview {cohort.title || 'Cohort'} Form
                        </>
                      )}
                    </button>
                  </SpotlightCard>
                )
              })}
            </div>
          )}
        </div>

        {/* Tracks */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-sky-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Choose Your Track</h2>
            <span className="text-xs text-slate-600 dark:text-slate-300">(5 options)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRACKS.map((t, i) => (
              <SpotlightCard
                key={t.id}
                spotlightColor="rgba(16,185,129,0.16)"
                className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1420]/80 p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 shadow-sm hover:shadow-xl shadow-slate-900/5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${TRACK_GRADIENTS[i % TRACK_GRADIENTS.length]} text-white text-xl shadow-md shadow-slate-900/10`}>
                    {t.icon}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">{t.label}</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex-1">{t.desc}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {t.tech.split(',').map((tech) => (
                    <span key={tech} className="rounded-full bg-slate-100 dark:bg-slate-800/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-3 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1"><Clock3 className="w-3 h-3" /> {t.duration}</span>
                  <span className="inline-flex items-center gap-1"><Globe className="w-3 h-3" /> {t.format}</span>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>

        {/* Why Join */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Why Join the Winter Internship?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-start gap-4 hover:border-emerald-500/20 transition-all">
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                  <b.icon className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{b.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {internApplyOpen && (
          <InternApplyModal
            cohort={selectedCohort}
            initialTrack={selectedTrack}
            locked={!!lockedInfo}
            opensOn={lockedInfo?.opensOn}
            onClose={closeApply}
          />
        )}
        {internLoginOpen && <InternLoginModal onClose={() => setInternLoginOpen(false)} />}
        {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}
