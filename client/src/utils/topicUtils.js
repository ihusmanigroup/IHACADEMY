// topicUtils.js — helpers to detect practical topics/lessons across
// free and PRO courses, and to enumerate practical units for completion checks.

// Free courses (course-data/*.json): topics live in lesson.content.topics[].
// They have NO explicit type field, so we infer "practical" from the content:
// code blocks (```), and keywords that signal hands-on work.
const PRACTICAL_KEYWORDS = [
  'code example',
  'implementation',
  'exercise',
  'practice',
  'write a function',
  'create a',
  'build a',
  'implement',
  'try it',
  'hands-on',
  'your turn',
  'challenge',
]

export function isPracticalTopic(topic) {
  if (!topic || !topic.content) return false
  const content = (topic.content || '').toLowerCase()
  // Any fenced code block means there is something to practice.
  if (content.includes('```')) return true
  return PRACTICAL_KEYWORDS.some((kw) => content.includes(kw))
}

// PRO courses (client/src/data/*CourseData.js): lessons have an explicit
// `type` ("theory" | "code") and an optional `codeSnippet`.
export function isPracticalLesson(lesson) {
  if (!lesson) return false
  return lesson.type === 'code' || !!lesson.codeSnippet
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
