import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { recordTransaction } from '../lib/transactions'
import { PRO_MAJOR_COURSES, PRO_MAJOR_IDS } from '../data/coursesData'

// Enrollments are strictly DB-confirmed: the `enrollments` table is the only
// source of truth. No localStorage fallbacks — paid-course lesson access is
// gated server-side (RLS) on a real enrollment row (or profiles.is_pro).

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const fetched = useRef(false)

  const fetch = useCallback(async () => {
    setLoading(true)

    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: userData } = await supabase.auth.getUser()
    let enrollmentsData = []
    if (userData?.user) {
      const { data } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', userData.user.id)
      enrollmentsData = data || []
    }

    // Local PRO Major Tracks are the catalog source of truth for these ids
    // (their DB rows exist once the seed migration is applied — dedupe by id
    // so the catalog always shows exactly the 5 premium tracks). Live DB
    // price / is_free / thumbnail override the local snapshot so cards always
    // reflect the real `courses` row (e.g. `$30` instead of a hardcoded tier).
    const merged = [
      ...(coursesData || []).filter((c) => !PRO_MAJOR_IDS.has(c.id)),
      ...PRO_MAJOR_COURSES.map((local) => {
        const dbRow = (coursesData || []).find((c) => c.id === local.id)
        return {
          ...local,
          price: dbRow?.price ?? local.price,
          is_free: dbRow?.is_free ?? local.is_free,
          thumbnail_url: dbRow?.thumbnail_url ?? local.thumbnail_url ?? null,
        }
      }),
    ]

    setCourses(merged)
    setEnrollments(enrollmentsData)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    fetch()
  }, [fetch])

  const ensureProfile = async (user) => {
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Developer'
    const avatarUrl = user.user_metadata?.avatar_url || ''
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: fullName, avatar_url: avatarUrl }, { onConflict: 'id' })
    if (error) {
      console.warn('Profile upsert skipped — profile likely exists:', error.message)
    }
  }

  const enroll = async (courseId) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    await ensureProfile(user)

    // DB-only enrollment — throws on failure so the UI never grants access
    // without a confirmed row (paid content is gated by RLS on this row).
    const { data, error } = await supabase
      .from('enrollments')
      .insert({ user_id: user.id, course_id: courseId })
      .select()
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('Enrollment failed — already enrolled?')

    // Paid courses get a billing ledger entry so "Billing & Purchases" can
    // show real unlocks. Free enrollments record a $0 plan/ledger only when
    // they are purchases — not for every free join.
    const course = courses.find((c) => c.id === courseId)
    if (course && course.is_free !== true && (Number(course.price) || 0) > 0) {
      try {
        await recordTransaction({
          item_type: 'course',
          item_name: course.title,
          amount: Number(course.price),
        })
      } catch (txErr) {
        // Ledger write failure must not roll back a confirmed enrollment.
        console.warn('Course transaction skipped:', (txErr && txErr.message) || txErr)
      }
    }

    setEnrollments((prev) => [...prev, data])
    return data
  }

  const updateLessonProgress = async (courseId, lessonCount, totalLessons) => {
    const newProgress = Math.min(Math.round((lessonCount / totalLessons) * 100), 100)
    const newStatus = newProgress >= 100 ? 'completed' : 'active'

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: enrollError } = await supabase
      .from('enrollments')
      .update({
        progress_percent: newProgress,
        lessons_completed: lessonCount,
        status: newStatus,
      })
      .eq('user_id', user.id)
      .eq('course_id', courseId)

    if (enrollError) throw enrollError

    setEnrollments((prev) =>
      prev.map((e) =>
        e.course_id === courseId
          ? { ...e, progress_percent: newProgress, lessons_completed: lessonCount, status: newStatus }
          : e
      )
    )

    return { newProgress, newStatus }
  }

  const addXp = async (amount) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await ensureProfile(user)

    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, streak_count')
      .eq('id', user.id)
      .maybeSingle()

    const newXp = (profile?.xp || 0) + amount
    const newStreak = (profile?.streak_count || 0) + 1

    await supabase
      .from('profiles')
      .update({ xp: newXp, streak_count: newStreak })
      .eq('id', user.id)
  }

  const completeLesson = async (courseId, lessonCount, totalLessons, xpReward) => {
    await addXp(xpReward || 50)
    return updateLessonProgress(courseId, lessonCount, totalLessons)
  }

  const getEnrollment = (courseId) =>
    enrollments.find((e) => e.course_id === courseId)

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id))

  return {
    courses, enrollments, enrolledCourseIds, loading,
    enroll, getEnrollment, updateLessonProgress, completeLesson, addXp,
    refetch: fetch,
  }
}
