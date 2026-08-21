import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchInternApplication } from '../lib/winterInternship'
import { useAuth } from '../context/AuthContext'
import { useInternAuth } from '../context/InternAuthContext'

/**
 * Authoritative internship application status for the /intern-portal route.
 *
 * Resolves the current user from Supabase auth (site account) and falls back
 * to the intern session email, then queries `intern_applications` fresh on
 * every visit. The portal gate must render from `status` returned here — never
 * from a cached/mock fallback.
 *
 * Status resolution is PRIORITY-based (approved > pending/shortlisted >
 * most recent), so a user with multiple rows (old rejected + new approved)
 * always sees their approved application.
 *
 * Returns { status, application, loading, error, refresh }:
 *   - status: 'approved' | 'pending' | 'shortlisted' | 'rejected' | null (no matching app)
 *   - application: full DB row (authoritative id + track for the approved path)
 */
export default function useInternApplication() {
  const { user } = useAuth()
  const { intern } = useInternAuth()
  const [state, setState] = useState({ status: null, application: null, loading: true, error: null })
  // Mirrors `application` so a re-refresh can tell a first load (show the gate
  // skeleton) from a silent background refresh (keep the cached application
  // rendered — a mid-session re-sync must never blank the portal behind a
  // full-page loader).
  const applicationRef = useRef(null)
  // Hard safety timeout: if the Supabase query hangs (no resolve/reject), the
  // splash must never stay up longer than 1.5s.
  const loadingTimeoutRef = useRef(null)

  useEffect(() => {
    applicationRef.current = state.application
  }, [state.application])

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current)
    }
  }, [])

  const refresh = useCallback(async () => {
    // Current logged-in user straight from Supabase auth.
    let siteUser = user
    if (!siteUser) {
      try {
        const { data } = await supabase.auth.getUser()
        siteUser = data?.user || null
      } catch {}
    }

    const emails = [
      ...new Set(
        [siteUser?.email, intern?.email, (() => {
          try { return localStorage.getItem('intern_email') || null } catch { return null }
        })()]
          .filter(Boolean)
          .map((e) => String(e).trim().toLowerCase()),
      ),
    ]

    if (emails.length === 0) {
      setState({ status: null, application: null, loading: false, error: null })
      return
    }

    // Only the very first load flips `loading`; later refreshes are silent so
    // an already-rendered portal stays on screen while data is revalidated.
    if (applicationRef.current == null) {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      // Arm the hard safety timeout — the finally below always clears it.
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, loading: false }))
      }, 1500)
    }

    try {
      // Try each identity email until a real application row is found.
      for (const email of emails) {
        let result
        try {
          result = await fetchInternApplication(email)
        } catch {
          // A thrown query (network / supabase misconfig) is treated as a
          // failed lookup, never as a crash or an infinite spinner.
          continue
        }
        const { status, application, error } = result
        if (error) continue
        if (application) {
          setState({ status: status || 'pending', application, loading: false, error: null })
          return
        }
      }
      setState({ status: null, application: null, loading: false, error: null })
    } finally {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
  }, [user, intern?.email])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { ...state, refresh }
}
