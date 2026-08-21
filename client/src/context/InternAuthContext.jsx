import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { winterLogin, resolveApplicationPriority } from '../lib/winterInternship'

const InternAuthContext = createContext(null)

const SESSION_KEY = 'ih_active_intern_user'
const APPLICATIONS_KEY = 'ih_intern_applications'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** True only for a real PostgreSQL UUID — never a fabricated `intern-…` id. */
function isValidUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value)
}

/**
 * Normalizes an application record (DB snake_case or local camelCase) into the
 * intern session shape. The session carries the exact fields the applicant
 * submitted (name, track, resume, GitHub, contact…) so the portal reflects
 * their application data.
 *
 * Returns null when the record has no real UUID — the session is never built
 * from a fabricated id, so the portal can't crash on `invalid input syntax
 * for type uuid`.
 */
function buildUser(r) {
  if (!r || !isValidUuid(r.id)) return null
  return {
    id: r.id,
    name: r.fullName || r.full_name || (r.email ? r.email.split('@')[0] : 'Intern'),
    email: r.email,
    track: r.track || r.internshipTrack || null,
    cohort: r.cohort || 'winter',
    status: r.status || 'pending',
    phone: r.phone || r.whatsapp || '',
    city: r.city || '',
    experienceLevel: r.experienceLevel || r.experience_level || '',
    skills: Array.isArray(r.skills)
      ? r.skills
      : typeof r.skills === 'string'
        ? r.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    githubUrl: r.githubUrl || r.github_url || r.github || '',
    linkedinUrl: r.linkedinUrl || r.linkedin_url || r.linkedin || '',
    resumeUrl: r.resumeUrl || r.resume_url || '',
    coverNote: r.coverNote || r.cover_note || '',
    availability: r.availability || '',
    startDate: r.startDate || r.start_date || '',
  }
}

export function InternAuthProvider({ children }) {
  const [intern, setIntern] = useState(null)
  const [loading, setLoading] = useState(true)

  /**
   * Removes everything created by the old mock-auth flow: sessions and local
   * application records with a fabricated `intern-…` id. Real DB-backed rows
   * (valid UUID) are kept intact. Called on boot and whenever a login/apply
   * form is opened so leftover mock sessions can never reach the portal.
   */
  const purgeCorruptSessions = useCallback(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        const user = JSON.parse(raw)
        if (!user || !isValidUuid(user.id)) {
          localStorage.removeItem(SESSION_KEY)
          setIntern(null)
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY)
      setIntern(null)
    }

    try {
      const raw = localStorage.getItem(APPLICATIONS_KEY)
      if (raw) {
        const apps = JSON.parse(raw)
        const list = Array.isArray(apps) ? apps : [apps]
        const clean = list.filter(a => a && isValidUuid(a.id))
        if (clean.length !== list.length) {
          localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(clean))
        }
      }
    } catch {
      localStorage.removeItem(APPLICATIONS_KEY)
    }
  }, [])

  useEffect(() => {
    // Hard safety timeout: NEVER leave the splash/loading state hanging longer
    // than 1.5s, whatever the storage or network state below.
    const timeoutId = setTimeout(() => setLoading(false), 1500)
    try {
      purgeCorruptSessions()
      // Restore the persisted intern session SYNCHRONOUSLY on boot so a hard
      // refresh of /intern-portal recognizes the active intern immediately,
      // without waiting on Supabase auth or any network handshake. The portal
      // gate then renders from the cached session and revalidates in the
      // background (useInternApplication refresh).
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        const user = JSON.parse(raw)
        if (user && isValidUuid(user.id)) {
          setIntern(buildUser(user))
        }
      }
    } catch {
      // Corrupt storage — nothing to restore; loading still resolves below.
    } finally {
      setLoading(false)
      clearTimeout(timeoutId)
    }
  }, [purgeCorruptSessions])

  const adopt = useCallback((record) => {
    const user = buildUser(record)
    if (!user) return null
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    if (user.email) {
      const cleanEmail = String(user.email).trim().toLowerCase()
      localStorage.setItem('active_intern_email', cleanEmail)
      // Persisted for immediate session recognition on page reloads.
      localStorage.setItem('intern_email', cleanEmail)
    }
    setIntern(user)
    return user
  }, [])

  const login = useCallback(async (email, password) => {
    purgeCorruptSessions()

    // The email typed in the Intern Login modal is authoritative. Signing in
    // with a different address than the site account ALWAYS switches/overrides
    // the current intern session to THAT application — no mismatch error.
    const cleanEmail = String(email || '').trim().toLowerCase()
    if (!cleanEmail) return { success: false, error: 'Enter your application email.' }

    // Primary path: `winter_login` verifies credentials server-side.
    // Only approved applications get a session; pending/rejected/revoked are
    // explicitly rejected here so the login modal can show a clear message.
    try {
      const res = await winterLogin(cleanEmail, password)
      if (res.rpcError) {
        // RPC unavailable (migrations not applied yet) — fall through to legacy paths.
      } else if (res.success && res.application) {
        if (adopt(res.application)) return { success: true, status: 'approved' }
      } else if (res.status) {
        // RPC found a matching row but status is not approved.
        const isRevokedOrRejected = res.status === 'rejected' || res.status === 'revoked'
        return {
          success: false,
          status: res.status,
          error: res.status === 'pending'
            ? 'Your application is currently under review by the IH Academy team. You will receive an email once verified.'
            : 'Your access has been revoked or application was not selected. You may re-apply.',
        }
      }
    } catch {}

    // DB fallback: check every application row directly (ORDER BY created_at
    // DESC). A user can have multiple rows (old rejected + new approved) — we
    // only need ONE row with matching credentials that is approved.
    try {
      const { data, error } = await supabase
        .from('intern_applications')
        .select('id, full_name, email, password, status, track, cohort')
        .eq('email', cleanEmail)
        .order('created_at', { ascending: false })

      if (!error && Array.isArray(data) && data.length) {
        // Filter to rows whose password matches, then resolve the best status.
        const matches = data.filter((r) => r.password === password)
        if (matches.length) {
          const { status, application } = resolveApplicationPriority(matches)
          if (status === 'approved' && application) {
            if (adopt(application)) return { success: true, status: 'approved' }
          }
          // Pending, rejected, or revoked — block login with a clear message.
          const isRevokedOrRejected = status === 'rejected' || status === 'revoked'
          return {
            success: false,
            status: status || 'pending',
            error: isRevokedOrRejected
              ? 'Your access has been revoked or application was not selected. You may re-apply.'
              : 'Your application is currently under review by the IH Academy team. You will receive an email once verified.',
          }
        }
      }
    } catch {}

    // Local applications fallback — only rows with a real UUID are accepted.
    try {
      const raw = localStorage.getItem(APPLICATIONS_KEY)
      if (raw) {
        const apps = JSON.parse(raw)
        const list = Array.isArray(apps) ? apps : [apps]
        const match = list.find(a => a.email === cleanEmail && a.password === password && isValidUuid(a.id))
        if (match) {
          // Approved = status 'approved' OR is_approved flag (flag can drift
          // out of sync with status when written by older admin paths).
          if (match.status === 'approved' || match.is_approved === true) {
            if (adopt(match)) return { success: true, status: 'approved' }
          }
          const isRevokedOrRejected = match.status === 'rejected' || match.status === 'revoked'
          return {
            success: false,
            status: match.status || 'pending',
            error: isRevokedOrRejected
              ? 'Your access has been revoked or application was not selected. You may re-apply.'
              : 'Your application is currently under review by the IH Academy team. You will receive an email once verified.',
          }
        }
      }
    } catch {}

    return { success: false, error: 'Invalid credentials' }
  }, [adopt, purgeCorruptSessions])

  const register = useCallback((data) => {
    if (adopt(data)) return { success: true }
    return { success: false, error: 'Could not create your session. Please try submitting your application again.' }
  }, [adopt])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem('active_intern_email')
    localStorage.removeItem('intern_email')
    setIntern(null)
  }, [])

  /**
   * Bridges the site account to the intern session: when a signed-in site user
   * has an internship application matching their email — stored locally in this
   * browser, or in the database (approved, pending, or rejected) — restore
   * their intern session so the portal can render the correct gate.
   */
  const syncWithEmail = useCallback(async (email) => {
    if (!email) return null
    const cleanEmail = String(email).trim().toLowerCase()

    purgeCorruptSessions()

    // If an intern session is already active for a DIFFERENT email, the user
    // explicitly signed in as that account — never silently override it with
    // the site account's application (multi-email override must win).
    if (intern && intern.email && String(intern.email).trim().toLowerCase() !== cleanEmail) return null

    try {
      const raw = localStorage.getItem(APPLICATIONS_KEY)
      if (raw) {
        const apps = JSON.parse(raw)
        const list = Array.isArray(apps) ? apps : [apps]
        const match = [...list].reverse().find(a =>
          a && (a.email || '').toLowerCase() === cleanEmail && isValidUuid(a.id)
        )
        if (match && adopt(match)) return match
      }
    } catch {}

    try {
      const { data, error } = await supabase
        .from('intern_applications')
        .select('*')
        .eq('email', cleanEmail)
        .order('created_at', { ascending: false })
      if (!error && Array.isArray(data) && data.length) {
        // Priority resolution: approved row wins over an older rejected one.
        const { application } = resolveApplicationPriority(data)
        if (application) return adopt(application) || null
      }
    } catch {}

    return null
  }, [adopt, intern, purgeCorruptSessions])

  return (
    <InternAuthContext.Provider value={{ intern, loading, login, register, logout, syncWithEmail, purgeCorruptSessions, isIntern: !!intern }}>
      {children}
    </InternAuthContext.Provider>
  )
}

export function useInternAuth() {
  const ctx = useContext(InternAuthContext)
  if (!ctx) throw new Error('useInternAuth must be used within InternAuthProvider')
  return ctx
}
