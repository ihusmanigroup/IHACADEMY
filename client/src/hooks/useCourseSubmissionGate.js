// useCourseSubmissionGate.js — enforces the "practical submission" gate:
// a course cannot be marked complete / its certificate issued until EVERY
// practical topic/lesson in that course has an APPROVED topic_submissions row.
//
// Courses with no practical units always pass, so existing courses that never
// required a submission are never wrongly locked. On any DB error the gate
// fails OPEN (returns true) so a transient failure never blocks certificates
// for the whole academy.

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getPracticalFreeTopics, getPracticalProLessons } from '../utils/topicUtils'
import { resolveLocalCourse } from '../data/coursesData'

export function useCourseSubmissionGate(userId, courses = []) {
  const [submissions, setSubmissions] = useState([])
  const [freeLessonsByCourse, setFreeLessonsByCourse] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) {
      setSubmissions([])
      setFreeLessonsByCourse({})
      return
    }
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        // 1) All of this user's topic submissions (course_id + topic_id + status).
        const { data: subData, error: subErr } = await supabase
          .from('topic_submissions')
          .select('course_id, lesson_id, topic_id, status')
          .eq('user_id', userId)
        if (subErr) throw subErr

        // 2) Free-course lessons (to enumerate their expected practical topics).
        //    PRO majors resolve locally via resolveLocalCourse, so we only need
        //    the DB `lessons` rows for courses that have no local `data`/`modules`.
        const freeIds = (courses || [])
          .filter((c) => !c?.data && !c?.modules)
          .map((c) => String(c.id))
        const lessonsMap = {}
        if (freeIds.length) {
          const { data: lesData, error: lesErr } = await supabase
            .from('lessons')
            .select('course_id, content')
            .in('course_id', freeIds)
          if (lesErr) throw lesErr
          for (const row of lesData || []) {
            const cid = String(row.course_id)
            ;(lessonsMap[cid] = lessonsMap[cid] || []).push(row)
          }
        }

        if (!cancelled) {
          setSubmissions(subData || [])
          setFreeLessonsByCourse(lessonsMap)
        }
      } catch (e) {
        // Fail open: don't lock certificates if the query can't run.
        console.warn('Submission gate fetch skipped:', (e && e.message) || e)
        if (!cancelled) {
          setSubmissions([])
          setFreeLessonsByCourse({})
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [userId, courses])

  // topic_id -> true for every approved submission.
  const approvedTopics = useMemo(() => {
    const m = {}
    for (const s of submissions) {
      if (s.status === 'approved') m[String(s.topic_id)] = true
    }
    return m
  }, [submissions])

  // Precompute the list of practical topic_ids for every course in the catalog.
  const practicalByCourse = useMemo(() => {
    const map = {}
    for (const c of courses || []) {
      const cid = String(c.id)
      let practical = []
      const rich = c?.data && c.data.modules ? c.data : resolveLocalCourse(c.id)
      if (rich?.modules) {
        practical = getPracticalProLessons(rich).map((p) => String(p.topicId))
      } else {
        practical = getPracticalFreeTopics(freeLessonsByCourse[cid] || []).map((p) => String(p.topicId))
      }
      map[cid] = practical
    }
    return map
  }, [courses, freeLessonsByCourse])

  // A course passes the gate when it has no practical topics, or every
  // practical topic has an approved submission.
  const isGateSatisfied = (courseId) => {
    const practical = practicalByCourse[String(courseId)] || []
    if (!practical.length) return true
    return practical.every((t) => approvedTopics[t])
  }

  return { isGateSatisfied, loading, submissions }
}
