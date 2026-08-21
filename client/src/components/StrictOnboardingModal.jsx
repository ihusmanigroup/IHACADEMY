import { useEffect, useState } from 'react'
import { AlertTriangle, Loader2, Share2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const LINKEDIN_REGEX = /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/

/**
 * Strict LinkedIn Onboarding — mandatory first-run gate for approved interns.
 *
 * There is intentionally NO way to dismiss this modal:
 *   - no X / close button,
 *   - backdrop clicks are no-ops,
 *   - Escape is ignored and body scrolling is frozen.
 * The intern must paste a valid LinkedIn post URL. The portal unlocks
 * INSTANTLY (local flag + onVerified), while the URL is persisted in the
 * background to both `linkedin_submissions` and
 * `intern_applications.linkedin_post_url` so the gate never re-appears.
 */
export default function StrictOnboardingModal({ application, onVerified }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const internEmail = String(application?.email || '').trim().toLowerCase()
  const internName = application?.full_name || application?.name || 'Intern'
  const internTrack = application?.track || 'Winter Internship'

  // Freeze background scrolling + ignore Escape so the gate truly cannot be escaped.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') e.preventDefault()
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey, true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return

    const value = url.trim()
    if (!value) {
      setError('Please paste the link to your LinkedIn post.')
      return
    }
    if (!LINKEDIN_REGEX.test(value)) {
      setError('That does not look like a valid LinkedIn URL. It must contain "linkedin.com" and the post path (e.g. https://www.linkedin.com/posts/…).')
      return
    }
    setError(null)
    setSaving(true)

    // INSTANT UNLOCK — never trap the intern behind a hanging network call or
    // a page reload. Persist the flag locally and unlock the portal right away;
    // the DB writes below run in the background and are retried on next submit.
    try {
      localStorage.setItem('linkedin_submitted', 'true')
      localStorage.setItem('linkedin_post_url', value)
    } catch {}

    onVerified()

    // Persist to BOTH tables (fire-and-forget, errors are swallowed so the
    // unlock above is never undone by a transient network failure):
    //   1. linkedin_submissions  -> admin review list (status 'pending')
    //   2. intern_applications   -> linkedin_post_url (source of truth gate)
    void (async () => {
      const now = new Date().toISOString()
      try {
        const { error: liError } = await supabase
          .from('linkedin_submissions')
          .upsert(
            {
              email: internEmail,
              applicant_name: internName,
              track: internTrack,
              linkedin_url: value,
              status: 'pending',
              created_at: now,
              updated_at: now,
            },
            { onConflict: 'email' },
          )
        if (liError) console.warn('linkedin_submissions save failed:', liError.message)
      } catch (err) {
        console.warn('linkedin_submissions save failed:', err)
      }

      try {
        const { error: appError } = await supabase
          .from('intern_applications')
          .update({ linkedin_post_url: value, updated_at: now })
          .eq('id', application?.id)
        if (appError) console.warn('intern_applications linkedin save failed:', appError.message)
      } catch (err) {
        console.warn('intern_applications linkedin save failed:', err)
      }
    })()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      onClick={() => {}}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="LinkedIn onboarding required"
        className="relative w-full max-w-lg rounded-3xl border border-slate-700/60 bg-gradient-to-b from-[#0a1120] to-[#0c1628] p-7 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/30">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold leading-tight">🎉 Congratulations on your Internship Selection!</h2>
            <p className="text-xs font-semibold text-sky-400 mt-0.5">LinkedIn Announcement Required · Welcome, {internName}</p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-200 text-center">
          To officially activate your portal and start your assignments, announce your selection on LinkedIn and
          paste your post link below. (Note: Submitting fake links will immediately cancel your internship).
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="linkedin-post-url" className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-400">
              LinkedIn post URL
            </label>
            <input
              id="linkedin-post-url"
              type="url"
              autoFocus
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (error) setError(null)
              }}
              placeholder="https://www.linkedin.com/posts/your-name/internship…"
              className="w-full rounded-xl border border-slate-700 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 transition-colors duration-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
            {error && (
              <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" /> {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all duration-200 hover:from-sky-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Unlocking your portal…
              </>
            ) : (
              'Verify & Unlock My Portal'
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] text-slate-500">
          Announcing your selection publicly confirms your enrollment and is required before any portal access.
        </p>

        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-sky-500/20" />
      </div>
    </div>
  )
}
