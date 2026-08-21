import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useInternAuth } from '../context/InternAuthContext'
import { fetchInternApplication } from '../lib/winterInternship'
import IHLoader from './IHLoader'

/**
 * Route guard pair:
 *  - Site routes (dashboard, courses, arena, …): a signed-in site account is
 *    required; guests go to /login?redirect=… and return seamlessly.
 *  - /intern-portal: strictly gated by approved internship application status.
 *    We fetch the latest application status from Supabase in real-time.
 *    Only 'approved' status grants access. Pending/rejected users are redirected
 *    to /internship with an appropriate message.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const { intern, loading: internLoading } = useInternAuth()
  const location = useLocation()

  const isPortal = location.pathname.startsWith('/intern-portal')
  const [portalAllowed, setPortalAllowed] = useState(false)
  const [portalChecking, setPortalChecking] = useState(true)

  // Real-time application status check for /intern-portal. Hard safety timeout:
  // the check must NEVER leave the splash up longer than 1s under any network
  // condition (stalled query, no row, thrown error) — worst case it redirects.
  useEffect(() => {
    if (!isPortal) {
      setPortalAllowed(true)
      setPortalChecking(false)
      return
    }

    let cancelled = false
    const safetyTimer = setTimeout(() => {
      if (cancelled) return
      setPortalChecking(false)
    }, 1000)

    const checkPortalAccess = async () => {
      try {
        // Gate 1: the explicit intern access flag must be present. It is set ONLY
        // by a successful Email & Password login inside the Intern Login modal —
        // a general site session (Google / Supabase) is NEVER enough to enter the
        // portal. Without it, deny immediately and let the redirect run.
        let unlocked = false
        try { unlocked = sessionStorage.getItem('intern_unlocked') === 'true' } catch {}
        if (!unlocked) {
          if (!cancelled) { setPortalAllowed(false); setPortalChecking(false) }
          return
        }

        // Fast path: an active intern session is ALREADY approved — `adopt()`
        // only builds a session for an approved login, so sub-route refreshes
        // render immediately with zero network round-trips.
        if (intern?.email) {
          if (!cancelled) setPortalAllowed(true)
          return
        }

        // No intern session: fall back to the signed-in site account's email.
        const email = user?.email
        if (!email) {
          if (!cancelled) setPortalAllowed(false)
          return
        }

        // Priority-based check: ANY approved application for this email grants
        // access, even when an older rejected row exists.
        const { status } = await fetchInternApplication(String(email).trim().toLowerCase())
        if (!cancelled) setPortalAllowed(status === 'approved')
      } catch {
        // A thrown query (network stall / supabase misconfig) must never hang
        // the splash — deny access and let the redirect gate run.
        if (!cancelled) setPortalAllowed(false)
      } finally {
        if (!cancelled) setPortalChecking(false)
        clearTimeout(safetyTimer)
      }
    }

    checkPortalAccess()

    return () => {
      cancelled = true
      clearTimeout(safetyTimer)
    }
  }, [isPortal, intern?.email, user?.email])

  if (loading || internLoading || portalChecking) return <IHLoader />

  if (isPortal) {
    if (portalAllowed) return children
    return <Navigate to="/internship?notice=intern_login" replace />
  }

  if (!user) {
    const target = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${target}`} replace />
  }

  return children
}
