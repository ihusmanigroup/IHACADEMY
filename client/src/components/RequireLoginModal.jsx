import { Link } from 'react-router-dom'
import { Lock, X, ArrowRight } from 'lucide-react'

const MESSAGES = {
  enroll: 'Please sign in or create an account to enroll in courses.',
  learn: 'Please sign in or create an account to start learning.',
  roadmap: 'Please sign in or create an account to view course roadmaps.',
  default: 'Please sign in or create an account to continue.',
}

export default function RequireLoginModal({ redirect = '/', reason = 'enroll', onClose }) {
  const encoded = encodeURIComponent(redirect)
  const message = MESSAGES[reason] || MESSAGES.default

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white dark:bg-[#0f1420]/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border border-cyan-500/30 dark:border-cyan-400/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sign in required</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>

          <div className="mt-6 space-y-2.5">
            <Link
              to={`/login?redirect=${encoded}`}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={`/register?redirect=${encoded}`}
              className="w-full inline-flex items-center justify-center border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-slate-900 dark:text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:border-cyan-400/60"
            >
              Create Account
            </Link>
            <button
              onClick={onClose}
              className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}