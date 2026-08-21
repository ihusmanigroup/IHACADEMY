import { supabase } from './supabase'

// Client-side credential generation & issuance helpers for the `certificates`
// table (migration 20260814000000_create_certificates.sql).
//
// Issuance is idempotent per (user_id, course_id): a unique constraint backs
// it, and every helper re-checks before inserting, so calling it from both the
// lesson player and the dashboard is safe.

// Deterministic `IH-CERT-2026-XXXX` credential id for a user+course pair so the
// same course always yields the same verifiable id across devices/tabs.
const hash4 = (seed) => {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return 1000 + ((h >>> 0) % 9000)
}

export const certificateIdFor = (userId, courseId) =>
  `IH-CERT-2026-${hash4(`${userId}|${courseId}`)}`

// Human duration label for a course ("10 Hours"). Falls back to a lesson-count
// estimate (≈ half-hour per lesson) then a fixed default.
export const certificateDuration = (course) => {
  if (!course) return '10 Hours'
  if (course.duration_hours) return `${course.duration_hours} Hours`
  if (course.total_lessons) return `${Math.max(1, Math.round(course.total_lessons / 2))} Hours`
  return '10 Hours'
}

export async function fetchUserCertificates(userId) {
  if (!userId) return []
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
  return error ? [] : (data || [])
}

// Admin-managed certificate templates (certificate_templates table). Students can
// read these (Public read policy) to decide the locked / pending / unlocked state
// and to render the background image for an issued certificate.
export async function fetchCertTemplates() {
  const { data, error } = await supabase
    .from('certificate_templates')
    .select('*')
  return error ? [] : (data || [])
}

// Best template for a course, with global-minor fallback:
//   1) a course-specific template (course_id === courseId)
//   2) the academy-wide global minor template (no specific course, flagged
//      course_type = 'Minor', or the reserved 'ALL_MINOR' sentinel)
// Returns null when nothing applies.
export function templateForCourse(templates, courseId) {
  if (!templates || !templates.length) return null
  const specific = templates.find((t) => String(t.course_id) === String(courseId))
  if (specific) return specific
  return (
    templates.find(
      (t) => !t.course_id && (t.course_type === 'Minor' || t.course_id === 'ALL_MINOR')
    ) || null
  )
}

// Insert a certificate row if one doesn't already exist for (user, course).
// Returns the certificate row (existing or freshly inserted) or null.
export async function issueCertificateIfNeeded({ userId, userName, course }) {
  if (!userId || !course?.id) return null

  const { data: existing } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', course.id)
    .maybeSingle()
  if (existing) return existing

  const row = {
    user_id: userId,
    user_name: userName || 'Student',
    course_id: course.id,
    course_name: course.title || 'Course',
    certificate_id: certificateIdFor(userId, course.id),
    completion_date: new Date().toISOString().slice(0, 10),
    duration: certificateDuration(course),
    status: 'issued',
  }

  const { data, error } = await supabase
    .from('certificates')
    .insert(row)
    .select()
    .maybeSingle()

  if (error) {
    // Concurrent tab / duplicate insert — swallow the unique hit.
    if (/duplicate|unique|violates/i.test(error.message)) return null
    console.warn('Certificate issuance failed:', error.message)
    return null
  }
  return data || null
}