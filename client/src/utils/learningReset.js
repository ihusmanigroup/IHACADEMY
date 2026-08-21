// ---------------------------------------------------------------------------
// learningReset — client-side half of a full learning reset.
//
// The admin script (scripts/reset-all-progress.js) wipes the Supabase tables;
// this clears the mirrored localStorage state (progress engines, temp PRO
// enrollments, active course) so the dashboard can never show stale progress
// against the clean database, and so one account's local cache never leaks
// into the next account on a shared device.
// ---------------------------------------------------------------------------

const EXACT_KEYS = ['ih_active_course', 'ih_temp_enrollments']

const KEY_PREFIXES = ['ml_major_', 'ih_local_', 'lesson_progress_', 'exam_']

export function clearLocalLearningState() {
  const removed = []
  const stale = []
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (!key) continue
    if (EXACT_KEYS.includes(key) || KEY_PREFIXES.some((p) => key.startsWith(p))) {
      stale.push(key)
    }
  }
  stale.forEach((key) => {
    localStorage.removeItem(key)
    removed.push(key)
  })
  return removed
}
