import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

/**
 * Live course progress backed by the lesson_completions table.
 *
 * Hydrates the user's completed lesson ids for a course from the database
 * (never defaulting to 0% / all-locked on refresh) and derives:
 *   - completedIds     : Set of completed lesson ids (in `lessonIds`)
 *   - completedCount   : number of completed lessons
 *   - progressPercent  : (completed / total) * 100
 *   - firstIncompleteId: next lesson to do in course order (null when done)
 *   - allCompleted     : true when every lesson in `lessonIds` is done
 *
 * Pass the ordered lesson id list of the course; guests get an empty set.
 */
export function useCourseProgress(courseId, lessonIds = []) {
  const { user } = useAuth()
  const [completedIds, setCompletedIds] = useState(() => new Set())
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    const next = new Set()
    if (user && courseId) {
      const { data } = await supabase
        .from('lesson_completions')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
      ;(data || []).forEach((row) => {
        if (row.lesson_id) next.add(row.lesson_id)
      })
    }
    setCompletedIds(next)
    setLoaded(true)
  }, [user, courseId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const completedCount = lessonIds.filter((id) => completedIds.has(id)).length
  const total = lessonIds.length
  const progressPercent = total ? Math.round((completedCount / total) * 100) : 0
  const firstIncompleteId = lessonIds.find((id) => !completedIds.has(id)) || null
  const allCompleted = total > 0 && completedCount === total

  return {
    completedIds,
    completedCount,
    progressPercent,
    firstIncompleteId,
    allCompleted,
    loaded,
    refresh,
  }
}
