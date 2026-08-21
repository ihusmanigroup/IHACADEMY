import { mlMajorCourse } from '../data/mlCourseData'
import { MAJOR_COURSE_DB_ID } from '../data/coursesData'
import { supabase } from '../lib/supabase'

// ---------------------------------------------------------------------------
// Shared ML Major Course progress engine (viewer, roadmap, dashboard)
// Weighting: lessons 90% · quiz 5% · capstone 5% — certificate at 100%
// ---------------------------------------------------------------------------
export const LESSON_WEIGHT = 90
export const QUIZ_WEIGHT = 5
export const CAPSTONE_WEIGHT = 5
export const MODULE_XP_REWARD = 50

export const MAJOR_COURSE_ID = mlMajorCourse.id
export const COMPLETED_KEY = 'ml_major_completed_lessons'
export const CAPSTONE_STATUS_KEY = `ml_major_${MAJOR_COURSE_ID}_capstones_status`
export const XP_AWARDED_KEY = `ml_major_${MAJOR_COURSE_ID}_xp_awarded_modules`
export const lsKey = (suffix) => `ml_major_${MAJOR_COURSE_ID}_${suffix}`

export const loadJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export const saveJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export const flatLessonsOf = (course = mlMajorCourse) =>
  course.modules.flatMap((m) =>
    m.lessons.map((l) => ({
      ...l,
      moduleId: m.id,
      moduleNumber: m.number,
      moduleTitle: m.title,
      moduleDifficulty: m.difficulty,
    }))
  )

// Dynamic progress unlock: lessons unlock ahead of completion based on %
// progress (lookahead 2 at 0% -> ~6 at 100%). The module of the frontier
// lesson is always unlocked wholesale, so modules open dynamically.
export function computeUnlockedLessons(flatLessons, completedLessons) {
  const total = flatLessons.length
  const done = completedLessons.size
  const pct = total > 0 ? done / total : 0
  const lookahead = Math.max(2, Math.round(total * (0.02 + pct * 0.04)))
  const count = Math.min(total, done + lookahead)
  const unlocked = new Set(flatLessons.slice(0, count).map((l) => l.id))
  const frontier = flatLessons[Math.min(total - 1, count - 1)]
  if (frontier) {
    for (const l of flatLessons) {
      if (l.moduleId === frontier.moduleId) unlocked.add(l.id)
    }
  }
  return unlocked
}

export function computeMajorProgress(flatLessons, completedLessons, quizSubmitted, capstoneStatuses, answeredCount = 0) {
  const totalLessons = flatLessons.length
  const quizTotal = mlMajorCourse.grandQuiz.length
  const capstoneTotal = mlMajorCourse.capstones.length
  const lessonPercent = totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0
  const quizPercent = quizSubmitted
    ? QUIZ_WEIGHT
    : Math.round((answeredCount / quizTotal) * QUIZ_WEIGHT)
  const capstoneSubmittedCount = Object.values(capstoneStatuses || {}).filter((s) => s === 'submitted').length
  const capstoneInReviewCount = Object.values(capstoneStatuses || {}).filter((s) => s === 'in_review').length
  const capstonePercent = capstoneSubmittedCount > 0
    ? CAPSTONE_WEIGHT
    : Math.round((capstoneSubmittedCount / capstoneTotal) * CAPSTONE_WEIGHT)
  const overallProgress = Math.min(100, lessonPercent * (LESSON_WEIGHT / 100) + quizPercent + capstonePercent)
  const courseComplete = completedLessons.size >= totalLessons
  const certificateUnlocked = courseComplete && quizSubmitted && capstoneSubmittedCount >= 1
  return {
    totalLessons,
    quizTotal,
    capstoneTotal,
    lessonPercent,
    quizPercent,
    capstonePercent,
    overallProgress,
    courseComplete,
    certificateUnlocked,
    pendingCapstone: courseComplete && quizSubmitted && capstoneSubmittedCount === 0,
    capstoneSubmittedCount,
    capstoneInReviewCount,
  }
}

export function moduleCompletionInfo(flatLessons, completedLessons) {
  const byModule = (moduleId) => flatLessons.filter((l) => l.moduleId === moduleId)
  const moduleCompleted = (moduleId) => {
    const lessons = byModule(moduleId)
    return lessons.length > 0 && lessons.every((l) => completedLessons.has(l.id))
  }
  return { byModule, moduleCompleted }
}

// First lesson the user should work on next (null when everything is done)
export function nextLessonToDo(flatLessons, completedLessons, unlockedLessons) {
  return flatLessons.find((l) => !completedLessons.has(l.id) && unlockedLessons.has(l.id)) || null
}

// ---------------------------------------------------------------------------
// Progress reset — clears every ML Major local key and wipes the remote row,
// returning the course to Module 1 / Lesson 1.1 (0 of 93 lessons).
// ---------------------------------------------------------------------------
export const RESET_KEYS = [
  COMPLETED_KEY,
  CAPSTONE_STATUS_KEY,
  XP_AWARDED_KEY,
  lsKey('quiz_submitted'),
  lsKey('quiz_answers'),
  lsKey('exercises_done'),
  'ml_course_progress',
]

export function clearMajorProgressLocal() {
  for (const key of RESET_KEYS) {
    try {
      localStorage.removeItem(key)
    } catch {}
  }
}

export async function resetMajorProgress(user) {
  clearMajorProgressLocal()
  if (!user) return { ok: true, remote: false }
  const { error } = await supabase
    .from('user_course_progress')
    .upsert(
      {
        user_id: user.id,
        course_id: MAJOR_COURSE_DB_ID,
        lessons_completed: [],
        quiz_submitted: false,
        capstone_status: 'pending',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,course_id' }
    )
  return { ok: !error, remote: true, error }
}
