import { useEffect, useMemo, useState } from 'react'
import { useCourses } from '../hooks/useCourses'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  fetchUserCertificates,
  fetchCertTemplates,
  templateForCourse,
  issueCertificateIfNeeded,
  certificateIdFor,
  certificateDuration,
} from '../lib/certificates'
import { useCourseSubmissionGate } from '../hooks/useCourseSubmissionGate'
import MinorCourseCertificate from '../components/MinorCourseCertificate'
import CertificationCard from '../components/CertificationCard'
import {
  Shield, Award, Clock, Loader2, BadgeCheck, BarChart3, Globe, Palette, Brain, Bot, Terminal, BookOpen,
} from 'lucide-react'

const CATEGORY_META = {
  'AI & Data':        { icon: BarChart3, glow: 'radial-gradient(ellipse at 50% 40%, rgba(6,182,212,0.40), transparent 70%)', iconColor: 'text-cyan-400' },
  'Web Development':  { icon: Globe,     glow: 'radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.40), transparent 70%)', iconColor: 'text-indigo-400' },
  'Design':           { icon: Palette,   glow: 'radial-gradient(ellipse at 50% 40%, rgba(129,140,248,0.35), transparent 70%)', iconColor: 'text-indigo-400' },
  'AI Fundamentals':  { icon: Brain,     glow: 'radial-gradient(ellipse at 50% 40%, rgba(6,182,212,0.35), transparent 70%)', iconColor: 'text-cyan-400' },
  'AI Tools':         { icon: Bot,       glow: 'radial-gradient(ellipse at 50% 40%, rgba(52,211,153,0.35), transparent 70%)', iconColor: 'text-emerald-400' },
  'Tools':            { icon: Terminal,  glow: 'radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.35), transparent 70%)', iconColor: 'text-indigo-400' },
  'Fundamentals':     { icon: Shield,    glow: 'radial-gradient(ellipse at 50% 40%, rgba(6,182,212,0.35), transparent 70%)', iconColor: 'text-cyan-400' },
}

const DEFAULT_META = { icon: BookOpen, glow: 'radial-gradient(ellipse at 50% 40%, rgba(6,182,212,0.25), transparent 70%)', iconColor: 'text-cyan-400' }

// Flexible key builders so a course can be matched to its progress / certificate
// by id, derived slug, or normalized title (e.g. "node-js-beginners" vs
// "Node.js for Absolute Beginners").
const slugify = (s) =>
  (s || '').toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const normTitle = (s) =>
  (s || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

// Look up a record in a map keyed by course identifier, trying id → slug →
// normalized title so progress works regardless of how the row was keyed.
const lookup = (map, course) => {
  if (!map || !course) return undefined
  const keys = [course.id, slugify(course.title), normTitle(course.title)].filter(Boolean)
  for (const k of keys) {
    const hit = map[String(k)]
    if (hit) return hit
  }
  return undefined
}

// [DATE] placeholder format: DD/MM/YYYY (e.g. 12/08/2026). Parses YYYY-MM-DD
// without timezone shifting.
const formatDate = (value) => {
  if (!value) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  const dt = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value)
  if (isNaN(dt.getTime())) return ''
  const dd = String(dt.getDate()).padStart(2, '0')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${dt.getFullYear()}`
}

export default function Certifications() {
  const { courses, enrollments, loading } = useCourses()
  const { user, profile } = useAuth()
  const [preview, setPreview] = useState(null)
  const [certificates, setCertificates] = useState([])
  const [templates, setTemplates] = useState([])
  // Submission gate: a course with practical topics can't unlock/issue its
  // certificate until every practical topic has an approved submission.
  const { isGateSatisfied } = useCourseSubmissionGate(user?.id, courses)
  // Lesson-completion counts keyed by course id (uuid). Empty (not crashing) is
  // the safe fallback when the DB fetch fails or returns nothing.
  const [lessonCounts, setLessonCounts] = useState({})

  const findCourse = (courseId) =>
    courses.find((c) => String(c.id) === String(courseId))

  // Official certificate rows issued for this user (certificates table).
  useEffect(() => {
    let cancelled = false
    if (user?.id) {
      fetchUserCertificates(user.id)
        .then((rows) => { if (!cancelled) setCertificates(rows) })
        .catch(() => { if (!cancelled) setCertificates([]) })
    }
    return () => { cancelled = true }
  }, [user?.id])

  // Admin certificate templates (certificate_templates table).
  useEffect(() => {
    let cancelled = false
    fetchCertTemplates()
      .then((rows) => { if (!cancelled) setTemplates(rows) })
      .catch(() => { if (!cancelled) setTemplates([]) })
    return () => { cancelled = true }
  }, [])

  // Lesson progress from lesson_completions — wrapped so a non-critical error
  // (e.g. 404 on a missing table / RLS) never blocks rendering. Falls back to
  // enrollment progress when this is empty or fails.
  useEffect(() => {
    let cancelled = false
    if (!user?.id) return
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('lesson_completions')
          .select('course_id')
          .eq('user_id', user.id)
        if (error) throw error
        const counts = {}
        ;(data || []).forEach((r) => {
          const id = String(r.course_id)
          counts[id] = (counts[id] || 0) + 1
        })
        if (!cancelled) setLessonCounts(counts)
      } catch (e) {
        // Non-critical: keep local enrollment-based progress as the fallback.
        console.warn('Lesson progress fetch skipped:', (e && e.message) || e)
        if (!cancelled) setLessonCounts({})
      }
    })()
    return () => { cancelled = true }
  }, [user?.id])

  const certMap = useMemo(() => {
    const m = {}
    ;(certificates || []).forEach((c) => { if (c.course_id != null) m[String(c.course_id)] = c })
    return m
  }, [certificates])

  const enrollMap = useMemo(() => {
    const m = {}
    ;(enrollments || []).forEach((e) => { if (e.course_id != null) m[String(e.course_id)] = e })
    return m
  }, [enrollments])

  const userName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : '') ||
    'Student'

  const getCert = (courseId) => {
    const course = findCourse(courseId)
    return lookup(certMap, course)
  }

  const hasCert = (courseId) => Boolean(getCert(courseId))

  const getEnrollment = (courseId) => {
    const course = findCourse(courseId)
    return lookup(enrollMap, course)
  }

  // Actual lesson completions (20/20) — the primary completion signal.
  const getLessonCount = (courseId) => {
    const course = findCourse(courseId)
    return lookup(lessonCounts, course) || 0
  }

  const getLessonPercent = (courseId) => {
    const course = findCourse(courseId)
    const total = course?.total_lessons || 0
    if (!total) return 0
    return Math.min(100, Math.round((getLessonCount(courseId) / total) * 100))
  }

  const getEnrollProgress = (courseId) => {
    const e = getEnrollment(courseId)
    return Math.min(e?.progress_percent ?? 0, 100)
  }

  // Progress = max of enrollment percent and actual lesson completions.
  const getProgress = (courseId) =>
    Math.max(getEnrollProgress(courseId), getLessonPercent(courseId))

  const isLessonComplete = (courseId) => {
    const course = findCourse(courseId)
    const total = course?.total_lessons || 0
    return total > 0 && getLessonCount(courseId) >= total
  }

  const isEnrollComplete = (courseId) => getEnrollProgress(courseId) >= 100

  // 100% lesson progress OR an issued certificate record unlocks the cert —
  // BUT only when the practical-submission gate is satisfied (every practical
  // topic in the course has an approved submission).
  const isComplete = (courseId) =>
    getProgress(courseId) >= 100 && isGateSatisfied(courseId)

  const templForCourse = (courseId) => templateForCourse(templates, courseId)

  // Unlock rule: lesson progress is 100% (e.g. 20/20) OR a certificate record
  // exists in Supabase — gated by approved submissions unless a cert was
  // already issued (legacy records stay unlocked).
  const isUnlocked = (courseId) => {
    const base =
      isLessonComplete(courseId) || isEnrollComplete(courseId) || hasCert(courseId)
    if (base && !hasCert(courseId) && !isGateSatisfied(courseId)) return false
    return base
  }

  const getStatus = (courseId) => (isUnlocked(courseId) ? 'unlocked' : 'locked')

  const getLessonsDone = (courseId) => {
    const done = getLessonCount(courseId)
    if (done) return done
    const e = getEnrollment(courseId)
    if (typeof e?.lessons_completed === 'number') return e.lessons_completed
    const course = findCourse(courseId)
    return Math.round((getProgress(courseId) / 100) * (course?.total_lessons || 0))
  }

  const getHours = (courseId) => {
    const course = findCourse(courseId)
    return course?.duration_hours || Math.round((course?.total_lessons || 0) / 2)
  }

  const getIssueDate = (courseId) => {
    const cert = getCert(courseId)
    if (cert?.completion_date) return formatDate(cert.completion_date)
    if (isComplete(courseId)) return formatDate(new Date())
    return ''
  }

  const getCredentialId = (courseId) => {
    const cert = getCert(courseId)
    if (cert?.certificate_id) return cert.certificate_id
    return certificateIdFor(user?.id || 'guest', courseId)
  }

  const getVerifyUrl = (courseId) => {
    const cert = getCert(courseId)
    if (cert?.certificate_id) return `https://ihacademy.io/verify/${cert.certificate_id}`
    return `https://ihacademy.io/verify/${courseId}`
  }

  const unlockedCount = courses.filter((c) => isUnlocked(c.id)).length
  const totalHoursEarned = courses
    .filter((c) => isUnlocked(c.id))
    .reduce((sum, c) => sum + getHours(c.id), 0)
  const globalPercent = courses.length ? Math.round((unlockedCount / courses.length) * 100) : 0

  // Catch-up issuance: when a course is complete and has an auto-issue template
  // but no certificate row yet, create the official record (idempotent). This
  // keeps the certificates table populated for admin reporting and supplies the
  // metadata shown on the certificate.
  useEffect(() => {
    if (!user?.id || loading) return
    let cancelled = false
    const toIssue = courses.filter((c) => {
      if (!isComplete(c.id) || hasCert(c.id)) return false
      const t = templateForCourse(templates, c.id)
      return Boolean(t && t.is_auto_issue)
    })
    if (!toIssue.length) return
    ;(async () => {
      for (const c of toIssue) {
        await issueCertificateIfNeeded({ userId: user.id, userName, course: c })
      }
      const rows = await fetchUserCertificates(user.id)
      if (!cancelled) setCertificates(rows)
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading, courses, templates, enrollments, certificates, lessonCounts])

  const openModal = (course) => {
    const template = templForCourse(course.id)
    setPreview({
      studentName: userName,
      courseTitle: course.title,
      duration: certificateDuration(course),
      completionDate: getIssueDate(course.id),
      certificateId: getCredentialId(course.id),
      blankTemplateUrl: template?.template_url,
      verifyUrl: getVerifyUrl(course.id),
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-600 dark:text-cyan-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Hero command banner */}
        <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 mb-8 bg-slate-900 text-white border border-slate-800 shadow-2xl">
          <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(ellipse at 85% 20%, rgba(6,182,212,0.25), transparent 60%)' }} />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #FFFFFF 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                  <Award className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">Verified Credentials</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Complete a course and earn its official academy certificate</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm px-5 py-3 flex items-center gap-3 shadow-inner">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <BadgeCheck className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Unlocked</p>
                  <p className="text-2xl font-black text-cyan-400 tabular-nums leading-tight">
                    {unlockedCount} <span className="text-sm font-bold text-slate-500">/ {courses.length}</span>
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm px-5 py-3 flex items-center gap-3 shadow-inner">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Hours Earned</p>
                  <p className="text-2xl font-black text-cyan-400 tabular-nums leading-tight">
                    {totalHoursEarned} <span className="text-sm font-bold text-slate-500">hrs</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Global completion bar */}
          <div className="relative mt-6">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
              <span>Global Completion</span>
              <span className="text-cyan-400 tabular-nums">{globalPercent}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-700"
                style={{ width: `${globalPercent}%` }}
              />
            </div>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Award className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No courses yet</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md">
              Enroll in a course, complete all lessons, and the academy will release your certificate.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CertificationCard
                key={course.id}
                course={course}
                status={getStatus(course.id)}
                progress={getProgress(course.id)}
                lessonsDone={getLessonsDone(course.id)}
                template={templForCourse(course.id)}
                meta={CATEGORY_META[course.category] || DEFAULT_META}
                issueDate={getIssueDate(course.id)}
                credentialId={getCredentialId(course.id)}
                onView={() => openModal(course)}
              />
            ))}
          </div>
        )}

        {/* Certificate Modal */}
        {preview && (
          <MinorCourseCertificate
            studentName={preview.studentName}
            courseTitle={preview.courseTitle}
            duration={preview.duration}
            completionDate={preview.completionDate}
            certificateId={preview.certificateId}
            blankTemplateUrl={preview.blankTemplateUrl}
            verifyUrl={preview.verifyUrl}
            onClose={() => setPreview(null)}
          />
        )}
      </div>
    </div>
  )
}
