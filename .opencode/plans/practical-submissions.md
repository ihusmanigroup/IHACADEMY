# Plan: Curated Practical-Submission Gating for Every Topic

## Goal
For **every course (free + paid/PRO)**, read each topic/lesson and add an explicit,
curated `requiresSubmission` flag. Show the practical-submission box at the end of a
topic **only when that flag is true** (never for read-only topics), and **block
"mark complete"** on that topic until a submission exists.

This replaces the current fragile auto-detection (keyword/code-block/`type:'code'`)
with a deliberate per-topic decision, as requested.

---

## 1. Curate the data — the manual read (bulk of the work)
Add `requiresSubmission: true|false` to each topic/lesson:

- **Free courses** — `course-data/course-*.json`. Each topic is `lesson.content.topics[]`
  (fields: `topic_id`, `title`, `content`). Read each topic; set `true` only when the
  topic needs hands-on work (exercises, "build/create/implement", code practice,
  challenge). Set `false` for pure reading/theory.
- **PRO / Major courses** — `client/src/data/*CourseData.js`. Each unit is
  `modules[].lessons[]` (fields include `type`, `content`, `codeSnippet`). The lesson
  IS the topic here. Read each; set `requiresSubmission` accordingly (e.g. real build
  tasks = true, pure concept lessons = false). Note: `type:'code'` is a hint, not
  gospel — a code lesson that is only an explanation can be `false`.

Recommendation: delegate this tagging to a subagent that reads every file and edits
it in place, so the source-of-truth files carry the flag.

## 2. Sync runtime source of truth
- **PRO courses**: bundled static JS is used directly by the app + `resolveLocalCourse`,
  so no DB change needed for rendering or the course-level gate.
- **Free courses**: the app reads `lessons` from the **Supabase table**, not the JSON.
  Two options (recommend both):
  - Update `scripts/seed-free-lessons.js` (or the relevant seed) so future reseeds
    include `requiresSubmission`, **and**
  - Write a one-off migration `scripts/tag-requires-submission.js` that updates existing
    `lessons` rows: for each row, map `content.topics[].requiresSubmission` from the
    curated JSON, then `supabase.from('lessons').update({ content })`.
  This keeps rendering (reads DB) and the course-level gate (reads DB `lessons`) in sync.

## 3. Update detection utils — `client/src/utils/topicUtils.js`
- `isPracticalTopic(topic)`: `if (topic.requiresSubmission !== undefined) return topic.requiresSubmission;` else keep current heuristic fallback.
- `isPracticalLesson(lesson)`: `if (lesson.requiresSubmission !== undefined) return lesson.requiresSubmission;` else fallback.
- `getPracticalFreeTopics` / `getPracticalProLessons` already call these → automatically correct.

## 4. Render panel at end of practical topics (mostly already done)
CourseViewer (`CourseViewer.jsx:1137`), MajorCourseViewer (`MajorCourseViewer.jsx:954`),
and LessonPlayer (`LessonPlayer.jsx:649`) already render `<TopicSubmissionPanel>` when
`isPractical*` is true. With step 3 they will now honor the explicit flag. Verify the
panel only appears for `requiresSubmission: true` topics.

## 5. Per-topic "required to complete" gate (NEW behavior)
Lift a submission-status check for the active unit in each viewer:
- Reuse `useTopicSubmissions({ courseId, lessonId, topicId, courseType })` (or a lighter
  status query) at the viewer level for the active lesson/topic; it returns `submission`.
- **CourseViewer `markCompletedAndContinue`** (`CourseViewer.jsx:647`) and
  **MajorCourseViewer `markCompletedAndContinue`** (`MajorCourseViewer.jsx:386`):
  if `activeLesson.requiresSubmission` (or `isPracticalLesson`) and `!submission`,
  block completion, disable the "Mark Completed & Next" button, and show a notice
  ("Submit your practical work to unlock completion").
- **LessonPlayer `handleTopicComplete` / `saveTopicProgress`** (`LessonPlayer.jsx:403,416`):
  same guard for the active topic (`topics[activeTopicIndex].requiresSubmission`).
- Two-tier model (preserves existing behavior): submitting (pending/approved/rejected all
  count as "submitted") unlocks topic completion; the **course certificate** gate
  (`useCourseSubmissionGate`) still requires *approved* — no change there.

## 6. Course-level gate consistency — `client/src/hooks/useCourseSubmissionGate.js`
No logic change required: it calls `getPracticalFreeTopics`/`getPracticalProLessons`,
which now reflect the explicit flag. It continues to require *approved* submissions for
certificate issuance. Verify free-course enumeration still matches DB `lessons` content.

## 7. Verify
- `cd client && npm run lint` and `npm run build`.
- Manual: open a free course and a PRO course; confirm submission box shows ONLY on
  `requiresSubmission:true` topics, and that "Mark Completed" is blocked until a
  submission is made; confirm a course still certifies only after approvals.
- Run `scripts/tag-requires-submission.js` (free courses) and confirm `lessons` rows updated.

## Notes / risks
- Large tagging surface (≈8 free JSONs + several PRO data files, hundreds of topics) —
  delegate to a subagent for speed/consistency.
- Keep heuristic fallback in `topicUtils` so any untagged unit still behaves sensibly.
- Ensure the free-course DB sync runs in the correct environment (Supabase URL/keys).
