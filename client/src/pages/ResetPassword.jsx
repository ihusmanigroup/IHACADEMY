import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Loader2, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errors = {}
    if (!newPassword) errors.newPassword = 'New password is required'
    else if (newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters'
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your new password'
    else if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match.'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNotice('Password updated successfully. Redirecting...')
      setTimeout(() => {
        navigate(user ? '/dashboard' : '/login', { replace: true })
      }, 1200)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors pr-11`
  const inputErrorClass = `w-full bg-white dark:bg-[#07090e] border border-red-500/70 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-red-400 transition-colors pr-11`
  const labelClass = 'block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5'

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
      isDark ? 'bg-[#080d1a]' : 'bg-slate-50'
    }`}>
      <div className="w-full max-w-md">
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-[1.3rem] bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 animate-border-flow opacity-50 blur-sm pointer-events-none" />
          <div className="absolute -inset-px rounded-[1.28rem] bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 animate-border-flow opacity-90 pointer-events-none" />
          <div className="relative bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <h1 className="text-2xl font-bold text-slate-950 dark:text-white mb-1">
              Set a New Password
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Choose a strong password you haven't used before.
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/20 border border-red-800 text-sm text-red-400">
                {error}
              </div>
            )}

            {notice && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-900/20 border border-emerald-800 text-sm text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {notice}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className={labelClass}>New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setFieldErrors((p) => { const n = { ...p }; delete n.newPassword; return n }) }}
                    className={fieldErrors.newPassword ? inputErrorClass : inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.newPassword && <p className="mt-1 text-xs text-red-400">{fieldErrors.newPassword}</p>}
              </div>
              <div>
                <label className={labelClass}>Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setFieldErrors((p) => { const n = { ...p }; delete n.confirmPassword; return n }) }}
                    className={fieldErrors.confirmPassword ? inputErrorClass : inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-400">{fieldErrors.confirmPassword}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-400 text-black font-semibold py-2.5 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 dark:text-slate-300 mt-6">
              Remembered your password?{' '}
              <Link to="/login" className="text-cyan-500 dark:text-cyan-400 hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
