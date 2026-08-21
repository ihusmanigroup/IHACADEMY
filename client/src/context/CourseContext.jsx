import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react'
import { mlMajorCourse } from '../data/mlCourseData'
import { supabase } from '../lib/supabase'
import { clearLocalLearningState } from '../utils/learningReset'
import {
  PRO_MAJOR_CATALOG_BY_ID, PRO_MAJOR_IDS,
  resolveLocalCourse, localLessonList, localProgressKey,
} from '../data/coursesData'
import {
  COMPLETED_KEY, CAPSTONE_STATUS_KEY, lsKey, loadJson,
  flatLessonsOf, computeMajorProgress,
} from '../utils/mlMajorProgress'

// ---------------------------------------------------------------------------
// CourseContext — global "Active Course" state.
//
// `activeCourse` is a small persisted snapshot (localStorage) of whichever
// course the user last started / continued (Free or Pro). Progress numbers
// are recomputed dynamically on every read from the local progress engines
// (ML Major COMPLETED_KEY / per-course `ih_local_progress_*` keys), so the
// dashboard always shows live "X of Y lessons · Z% complete" data.
//
// Active course shape:
//   { id, title, category, level, isPro, badgeText,
//     totalLessons, completedLessons, progressPercentage, xpReward }
// ---------------------------------------------------------------------------
const CourseContext = createContext(null)
const ACTIVE_COURSE_KEY = 'ih_active_course'

function loadStoredActiveCourse() {
  try {
    const raw = localStorage.getItem(ACTIVE_COURSE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Live progress for a course id from the local progress engines. Returns null
// only for DB-only courses — there the stored snapshot stands (the dashboard
// overlays live lesson_completions counts).
function computeLiveProgress(active) {
  if (!active?.id) return { totalLessons: 0, completedLessons: 0, progressPercentage: 0 }
  const rich = resolveLocalCourse(active.id)
  if (rich) {
    if (rich.id === mlMajorCourse.id) {
      const flat = flatLessonsOf()
      const completed = new Set(loadJson(COMPLETED_KEY, []))
      const quizSubmitted = loadJson(lsKey('quiz_submitted'), false)
      const capstoneStatuses = loadJson(CAPSTONE_STATUS_KEY, {})
      const p = computeMajorProgress(flat, completed, quizSubmitted, capstoneStatuses, 0)
      return {
        totalLessons: flat.length,
        completedLessons: completed.size,
        progressPercentage: p.overallProgress,
      }
    }
    const flat = localLessonList(rich)
    const completed = new Set(loadJson(localProgressKey(rich.id), []))
    const total = flat.length
    return {
      totalLessons: total,
      completedLessons: completed.size,
      progressPercentage: total ? Math.round((completed.size / total) * 100) : 0,
    }
  }
  return {
    totalLessons: active.totalLessons || 0,
    completedLessons: active.completedLessons || 0,
    progressPercentage: active.progressPercentage || 0,
  }
}

// Merge the stored snapshot with freshly computed progress + derived fields.
function enrich(active) {
  if (!active) return null
  const live = computeLiveProgress(active)
  return {
    ...active,
    ...live,
    badgeText: active.isPro ? 'PRO TRACK ACTIVE' : 'FREE TRACK ACTIVE',
  }
}

// Build the active-course payload from ANY course shape: rich course object
// (has `modules`), catalog entry, or a Supabase `courses` row.
export function buildActiveCourse(course) {
  if (!course) return null
  const rich = course.modules ? course : resolveLocalCourse(course)
  const catalog = rich ? PRO_MAJOR_CATALOG_BY_ID[rich.id] || null : null
  const source = rich || catalog || course
  const id = rich?.id || course.id
  const isPro = !!rich || !!catalog || course.pro === true || PRO_MAJOR_IDS.has(course.id)
  const base = {
    id,
    title: source.title || 'Untitled Course',
    category: source.category || course.category || '',
    level: source.level || course.level || '',
    isPro,
    xpReward: catalog?.xp_reward || course.xp_reward || 0,
  }
  return enrich(base)
}

export function CourseProvider({ children }) {
  const [activeCourse, setActiveCourseState] = useState(loadStoredActiveCourse)

  // Full learning-state sync: on sign-out, wipe the client-side mirror
  // (active course, local progress, temp PRO enrollments) so the next account
  // on this device starts from the same clean slate as the database.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearLocalLearningState()
        setActiveCourseState(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const setActiveCourse = useCallback((course) => {
    const next = buildActiveCourse(course)
    try {
      localStorage.setItem(ACTIVE_COURSE_KEY, JSON.stringify(next))
    } catch {
      // storage unavailable — state-only fallback still works
    }
    setActiveCourseState(next)
  }, [])

  const clearActiveCourse = useCallback(() => {
    try {
      localStorage.removeItem(ACTIVE_COURSE_KEY)
    } catch {}
    setActiveCourseState(null)
  }, [])

  // Re-read the local progress engines so numbers stay live after the user
  // completes lessons in a viewer. Touching state identity re-runs `enrich`.
  const refreshActiveCourse = useCallback(() => {
    setActiveCourseState((prev) => (prev ? { ...prev } : prev))
  }, [])

  const markCourseStarted = useCallback(
    (course) => {
      if (course) setActiveCourse(course)
    },
    [setActiveCourse]
  )

  const value = useMemo(
    () => ({
      activeCourse: enrich(activeCourse),
      setActiveCourse,
      clearActiveCourse,
      refreshActiveCourse,
      markCourseStarted,
    }),
    [activeCourse, setActiveCourse, clearActiveCourse, refreshActiveCourse, markCourseStarted]
  )

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
}

export function useActiveCourse() {
  const ctx = useContext(CourseContext)
  if (!ctx) throw new Error('useActiveCourse must be used within CourseProvider')
  return ctx
}
