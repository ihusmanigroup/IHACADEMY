import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useInternAuth } from '../context/InternAuthContext'

/**
 * Guard for /intern-portal: an active intern session (application email +
 * password, stored by InternAuthContext) renders the portal immediately.
 *
 * If a site user arrives without an intern session, we first try to restore
 * it from their stored/DB application (syncWithEmail). Otherwise they are
 * bounced once to /internship, where the intern login and apply actions live —
 * no redirect loops back to /careers or /internship for authenticated interns.
 */
export default function InternshipLayout() {
  const { user } = useAuth()
  const { intern, loading, syncWithEmail } = useInternAuth()
  const navigate = useNavigate()

  const ready = !loading

  useEffect(() => {
    if (!ready) return
    // Gate on the explicit intern access flag — set ONLY by a successful Email &
    // Password login in the Intern Login modal. A general site session (Google /
    // Supabase) alone must never open the portal.
    let unlocked = false
    try { unlocked = sessionStorage.getItem('intern_unlocked') === 'true' } catch {}
    if (!unlocked) {
      navigate('/internship?notice=intern_login', { replace: true })
      return
    }
    if (intern) return
    if (!user) {
      navigate('/internship?notice=intern_login', { replace: true })
      return
    }
    let cancelled = false
    syncWithEmail(user.email).then((synced) => {
      if (!cancelled && !synced) {
        navigate('/internship?notice=intern_login', { replace: true })
      }
    })
    return () => { cancelled = true }
  }, [ready, intern, user, syncWithEmail, navigate])

  if (!ready || !intern) return null

  return <Outlet />
}
