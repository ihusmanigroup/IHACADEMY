import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Loader2, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const mapAuthError = (err) => {
  const status = err?.status
  const msg = err?.message || 'Something went wrong'
  const lower = msg.toLowerCase()

  if (status === 429 || lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('only request')) {
    return 'Registration rate limit reached. Please wait a few minutes before trying again or sign in with an existing account.'
  }
  if (status === 400 && (lower.includes('already registered') || lower.includes('already been registered'))) {
    return 'An account with this email already exists. Please Sign In.'
  }
  if (lower.includes('password should be at least')) {
    return 'Password must be at least 6 characters.'
  }
  if (lower.includes('password should be different') || lower.includes('new password should be different')) {
    return 'New password cannot be the same as your current password.'
  }
  if (lower.includes('invalid email') || lower.includes('email address invalid')) {
    return 'Please enter a valid email address.'
  }
  if (lower.includes('token') || lower.includes('otp') || lower.includes('code')) {
    return 'Invalid or expired verification code. Please try again.'
  }
  return msg
}

export default function AuthModal({ onClose, initialTab = 'signin', initialError = '' }) {
  const { signInWithPassword, signUp, signInWithGoogle, resetPassword, verifyOtp, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState(initialTab)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [residence, setResidence] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(initialError)
  const [notice, setNotice] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Forgot Password — 3-step OTP flow
  const [resetStep, setResetStep] = useState(1)
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const clearMessages = () => {
    setError('')
    setNotice('')
    setSuccess('')
    setFieldErrors({})
  }

  const resetFlow = () => {
    setResetStep(1)
    setOtpCode('')
    setNewPassword('')
    setConfirmNewPassword('')
  }

  // Mandatory DB-first pre-check: confirm the email exists via RPC and
  // that it is an Email/Password account before sending any OTP.
  const verifyAccountForReset = async (email) => {
    const normalized = email.trim().toLowerCase()
    const { data, error } = await supabase.rpc('check_user_auth_status', {
      search_email: normalized
    })

    if (error) {
      // If RPC is unavailable, do not block resets — let Supabase decide.
      return { ok: true }
    }
    // Check 1: Account Does NOT Exist
    if (!data?.exists) {
      return { ok: false, message: 'No account found with this email address. Please check your email or sign up.' }
    }
    // Check 2: Google OAuth Account
    if (data?.provider === 'google') {
      return { ok: false, message: 'This account was registered using Google Sign-In. Please sign in with Google.' }
    }
    // Check 3: Valid Email/Password Account
    return { ok: true }
  }

  const validateForm = () => {
    const errors = {}
    if (tab === 'signup') {
      if (!fullName.trim()) errors.fullName = 'Full name is required'
      if (!email.trim()) errors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address'
      if (!confirmEmail.trim()) errors.confirmEmail = 'Please confirm your email'
      else if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) errors.confirmEmail = 'Email addresses do not match.'
      if (!phone.trim()) errors.phone = 'Phone number is required'
      if (!residence.trim()) errors.residence = 'Residence / Country is required'
      if (!password) errors.password = 'Password is required'
      else if (password.length < 6) errors.password = 'Password must be at least 6 characters'
      if (!confirmPassword) errors.confirmPassword = 'Please confirm your password'
      else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.'
    } else if (tab === 'forgot_password') {
      if (resetStep === 1) {
        if (!email.trim()) errors.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address'
      } else if (resetStep === 2) {
        if (!otpCode.trim()) errors.otpCode = 'Enter the 6-digit code'
        else if (!/^\d{6}$/.test(otpCode.trim())) errors.otpCode = 'Code must be exactly 6 digits'
      } else if (resetStep === 3) {
        if (!newPassword) errors.newPassword = 'New password is required'
        else if (newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters'
        if (!confirmNewPassword) errors.confirmNewPassword = 'Please confirm your new password'
        else if (newPassword !== confirmNewPassword) errors.confirmNewPassword = 'Passwords do not match.'
      }
    } else {
      if (!email.trim()) errors.email = 'Email is required'
      if (!password) errors.password = 'Password is required'
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearMessages()
    const errors = validateForm()
    setFieldErrors(errors)
    if (Object.keys(errors).length) return
    setLoading(true)
    try {
      if (tab === 'signin') {
        await signInWithPassword({ email, password })
        onClose()
      } else if (tab === 'forgot_password') {
        if (resetStep === 1) {
          const check = await verifyAccountForReset(email)
          if (!check.ok) {
            setError(check.message)
            return
          }
          await resetPassword(email)
          clearMessages()
          setResetStep(2)
          setOtpCode('')
          setNotice('A 6-digit verification code has been sent to your email.')
        } else if (resetStep === 2) {
          await verifyOtp({ email, token: otpCode, type: 'recovery' })
          clearMessages()
          setResetStep(3)
        } else {
          await updatePassword(newPassword)
          // Step 4 — sign out happened inside updatePassword; return to Login
          // screen with a success banner so the user signs in fresh.
          setPassword('')
          setTab('signin')
          resetFlow()
          setNotice('Password updated successfully! Please log in.')
        }
      } else {
        await signUp({ email, password, name: fullName, phone, residence })
        setSuccess('Account created successfully!')
        setLoading(false)
        setTimeout(() => {
          onClose()
          navigate('/dashboard', { replace: true })
        }, 1200)
        return
      }
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    clearMessages()
    setLoading(true)
    try {
      const check = await verifyAccountForReset(email)
      if (!check.ok) {
        setError(check.message)
        return
      }
      await resetPassword(email)
      setNotice('A new verification code has been sent to your email.')
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setNotice('')
    setGoogleLoading(true)
    try {
      // Record the active tab ('signin' | 'signup') so the post-OAuth callback
      // can enforce strict intent-based validation against the profiles table.
      localStorage.setItem('oauth_intent', tab === 'signup' ? 'signup' : 'signin')
      await signInWithGoogle()
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setGoogleLoading(false)
    }
  }

  const clearError = (field) => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const inputClass = 'w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-colors'
  const inputErrorClass = 'w-full bg-slate-50 border border-red-500/70 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors'
  const labelClass = 'block text-xs font-medium text-slate-700 mb-1.5'

  const resetDescription =
    resetStep === 1
      ? "Enter your registered email address and we'll send you a password reset code."
      : resetStep === 2
        ? `We sent a 6-digit code to ${email || 'your email'}. Enter it below to continue.`
        : 'Choose a new password for your account.'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {success && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold shadow-2xl animate-[fadeIn_0.2s_ease-out]">
          <CheckCircle2 className="w-5 h-5" />
          {success}
        </div>
      )}
      <div className="relative w-full max-w-lg mx-4">
        <div className="absolute -inset-0.5 rounded-[1.3rem] bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 animate-border-flow opacity-50 blur-sm pointer-events-none" />
        <div className="absolute -inset-px rounded-[1.28rem] bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 animate-border-flow opacity-90 pointer-events-none" />
        <div className="relative bg-white border border-slate-200 shadow-2xl shadow-slate-300/50 rounded-2xl p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-lg p-1">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {tab === 'signin' ? 'Welcome back' : tab === 'forgot_password' ? 'Reset Your Password' : 'Create account'}
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          {tab === 'signin' ? 'Sign in to continue your journey.'
            : tab === 'forgot_password' ? resetDescription
            : 'Join the arena and start learning.'}
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-600">
            {notice}
          </div>
        )}

        {/* Tabs */}
        {tab !== 'forgot_password' && (
          <div className="flex mb-6 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => { setTab('signin'); clearMessages(); resetFlow() }}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                tab === 'signin'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); clearMessages(); resetFlow() }}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                tab === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        <div className="max-h-[65vh] overflow-y-auto pr-1 -mr-1">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {tab === 'signup' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={e => { setFullName(e.target.value); clearError('fullName') }}
                    className={fieldErrors.fullName ? inputErrorClass : inputClass}
                  />
                  {fieldErrors.fullName && <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); clearError('email') }}
                    className={fieldErrors.email ? inputErrorClass : inputClass}
                  />
                  {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Confirm Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={confirmEmail}
                    onChange={e => { setConfirmEmail(e.target.value); clearError('confirmEmail') }}
                    className={fieldErrors.confirmEmail ? inputErrorClass : inputClass}
                  />
                  {fieldErrors.confirmEmail && <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmEmail}</p>}
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); clearError('phone') }}
                    className={fieldErrors.phone ? inputErrorClass : inputClass}
                  />
                  {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
                </div>
                <div>
                  <label className={labelClass}>Residence / Country</label>
                  <input
                    type="text"
                    placeholder="Pakistan"
                    value={residence}
                    onChange={e => { setResidence(e.target.value); clearError('residence') }}
                    className={fieldErrors.residence ? inputErrorClass : inputClass}
                  />
                  {fieldErrors.residence && <p className="mt-1 text-xs text-red-600">{fieldErrors.residence}</p>}
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearError('password') }}
                    className={fieldErrors.password ? inputErrorClass : inputClass}
                  />
                  {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
                </div>
                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); clearError('confirmPassword') }}
                    className={fieldErrors.confirmPassword ? inputErrorClass : inputClass}
                  />
                  {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>}
                </div>
              </div>
            )}
            {tab === 'signin' && (
              <>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearError('email') }}
                  className={fieldErrors.email ? inputErrorClass : inputClass}
                />
                {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError('password') }}
                  className={fieldErrors.password ? inputErrorClass : inputClass}
                />
                {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
                <div className="text-right -mt-1">
                  <button
                    type="button"
                    onClick={() => { setTab('forgot_password'); clearMessages(); resetFlow() }}
                    className="text-xs text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            )}
            {tab === 'forgot_password' && (
              <>
                {resetStep === 1 && (
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); clearError('email') }}
                      className={fieldErrors.email ? inputErrorClass : inputClass}
                    />
                    {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
                  </div>
                )}
                {resetStep === 2 && (
                  <>
                    <div>
                      <label className={labelClass}>6-Digit Verification Code</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        placeholder="••••••"
                        value={otpCode}
                        onChange={e => { setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6)); clearError('otpCode') }}
                        className={`${fieldErrors.otpCode ? inputErrorClass : inputClass} text-center text-xl tracking-[0.5em]`}
                      />
                      {fieldErrors.otpCode && <p className="mt-1 text-xs text-red-600">{fieldErrors.otpCode}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={loading}
                      className="text-xs text-cyan-600 hover:text-cyan-700 font-medium transition-colors disabled:text-slate-400"
                    >
                      Resend Code
                    </button>
                  </>
                )}
                {resetStep === 3 && (
                  <>
                    <div>
                      <label className={labelClass}>New Password</label>
                      <input
                        type="password"
                        placeholder="Min. 6 characters"
                        value={newPassword}
                        onChange={e => { setNewPassword(e.target.value); clearError('newPassword') }}
                        className={fieldErrors.newPassword ? inputErrorClass : inputClass}
                      />
                      {fieldErrors.newPassword && <p className="mt-1 text-xs text-red-600">{fieldErrors.newPassword}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Re-enter new password"
                        value={confirmNewPassword}
                        onChange={e => { setConfirmNewPassword(e.target.value); clearError('confirmNewPassword') }}
                        className={fieldErrors.confirmNewPassword ? inputErrorClass : inputClass}
                      />
                      {fieldErrors.confirmNewPassword && <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmNewPassword}</p>}
                    </div>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    clearMessages()
                    if (resetStep > 1) setResetStep((s) => s - 1)
                    else { setTab('signin'); resetFlow() }
                  }}
                  className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
                >
                  ← {resetStep === 1 ? 'Back to Sign In' : 'Back'}
                </button>
              </>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-cyan-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {tab === 'signin' ? 'Sign In'
                : tab === 'forgot_password'
                  ? resetStep === 1 ? 'Send Reset Code' : resetStep === 2 ? 'Verify Code' : 'Update Password'
                  : 'Create Account'}
            </button>
          </form>
        </div>

        {tab !== 'forgot_password' && (
          <>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-slate-400">or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {googleLoading ? 'Redirecting...' : 'Continue with Google'}
        </button>

        <p className="text-center text-xs text-slate-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
          </>
        )}
      </div>
      </div>
    </div>
  )
}
