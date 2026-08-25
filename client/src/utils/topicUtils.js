// topicUtils.js — helpers to detect practical topics/lessons across
// free and PRO courses, and to enumerate practical units for completion checks.
//
// DATA MODEL: every topic/lesson carries an EXPLICIT `hasSubmission` boolean
// (curated by reading the content). When present it is authoritative and is
// the ONLY thing that decides whether a submission form renders. Read-only,
// video and theory units are `hasSubmission: false` and therefore never show
// a submission box. The classifier below is used ONLY at tag-time (scripts)
// to set that explicit flag — it is intentionally NOT consulted at runtime,
// so the UI can never silently diverge from the curated data.

// Strong signals that a unit assigns hands-on work the learner must submit.
// Used by the tagging scripts to set `hasSubmission`; not used at runtime.
const PRACTICAL_TASK_RE = [
  /\byour turn\b/i,
  /\btry it (yourself|out)\b/i,
  /\bcomplete (the|this|these|all|following|next)?\s*(exercise|exercises|practice|practise|challenge|challenges|assignment|task|tasks|project|projects)\b/i,
  /\bhands?[-\s]?on\b/i,
  /\bsubmit (your|your work|the|this|an?)\b/i,
  /\bpractice (exercise|exercises|task|tasks|set|problem|problems|round|session)\b/i,
  /\bcoding exercise\b/i,
  /\bnow (build|create|implement|write|code|develop)\b/i,
  /\bchallenge:\b/i,
  /\byour (task|assignment|project|exercise|challenges?)\b/i,
  /\b(assignment|homework|lab|workshop)\b/i,
  /\bcapstone\b/i,
]

// Tag-time only: decide whether a block of content assigns hands-on work.
// NOTE: a code lesson / fenced code block alone is NOT practical — it is an
// illustration. Work is required ONLY when the content explicitly assigns it.
export function classifyRequiresSubmission({ content = '', type } = {}) {
  const text = String(content || '')
  return PRACTICAL_TASK_RE.some((re) => re.test(text))
}

// Single source of truth for the runtime flag. Explicit `hasSubmission`
// (camelCase in JS data) or `has_submission` (snake_case from the DB) wins;
// `requiresSubmission` is accepted for backwards compatibility during the
// transition. Anything untagged is treated as false (no submission form).
export function getSubmissionFlag(unit) {
  if (!unit || typeof unit !== 'object') return false
  if (typeof unit.hasSubmission === 'boolean') return unit.hasSubmission
  if (typeof unit.has_submission === 'boolean') return unit.has_submission
  if (typeof unit.requiresSubmission === 'boolean') return unit.requiresSubmission
  return false
}

export function isPracticalTopic(topic) {
  return getSubmissionFlag(topic)
}

// PRO courses (client/src/data/*CourseData.js): lessons are the unit.
export function isPracticalLesson(lesson) {
  return getSubmissionFlag(lesson)
}

// All practical topics across a free course (from its lessons[] array).
export function getPracticalFreeTopics(lessons = []) {
  const out = []
  for (const lesson of lessons) {
    const topics = lesson?.content?.topics || []
    for (const t of topics) {
      if (isPracticalTopic(t)) {
        out.push({ lessonId: lesson.id, topicId: t.topic_id, title: t.title })
      }
    }
  }
  return out
}

// All practical lessons across a PRO course (from its modules[].lessons[]).
export function getPracticalProLessons(course) {
  const out = []
  const modules = course?.modules || []
  for (const mod of modules) {
    for (const lesson of mod.lessons || []) {
      if (isPracticalLesson(lesson)) {
        out.push({ lessonId: lesson.id, topicId: lesson.id, title: lesson.title })
      }
    }
  }
  return out
}
