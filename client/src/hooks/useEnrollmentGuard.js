import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PRO_MAJOR_IDS } from '../data/coursesData'

// Client-side 403 guard for PRO track lesson content: the viewer may only
// open when the requesting user has a DB-confirmed enrollment row for the
// course (or an active Pro subscription — same rule the RLS layer enforces
// server-side for DB lessons). Guests and unenrolled users are bounced back
// to the catalog, where the only path forward is the payment modal.
export function useEnrollmentGuard(courseId) {
  const [denied, setDenied] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!courseId || !PRO_MAJOR_IDS.has(courseId)) return
    let cancelled = false
    const check = async () => {
      setChecking(true)
      try {
        const { data: { user: u } } = await supabase.auth.getUser()
        if (cancelled) return
        if (!u) { setDenied(true); return }
        const { data } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', u.id)
          .eq('course_id', courseId)
          .maybeSingle()
        if (!cancelled) setDenied(!data)
      } catch {
        if (!cancelled) setDenied(true)
      } finally {
        if (!cancelled) setChecking(false)
      }
    }
    check()
    return () => { cancelled = true }
  }, [courseId])

  return { checking, denied }
}
