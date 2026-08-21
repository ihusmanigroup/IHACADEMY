import { supabase } from './supabase'

/**
 * Executes a Supabase RPC function and normalizes the result into a RESOLVED
 * { rpcError, data } object. A thrown network/supabase failure or an RPC-level
 * error becomes `rpcError` instead of a rejected promise — callers can rely on
 * `res.rpcError` / `res.data` without try/catch, so a stalled or failed RPC
 * can never leave the UI hanging on a spinner.
 */
async function call(fn, args = {}) {
  try {
    const { data, error } = await supabase.rpc(fn, args)
    if (error) return { rpcError: error, data: null }
    return { data, error: null }
  } catch (err) {
    return { rpcError: err, data: null }
  }
}

/**
 * Winter Internship 2026-27 — RPC data layer.
 *
 * Every read/write for the intern portal and the admin review console runs
 * through the SECURITY DEFINER functions defined in
 * supabase/migrations/20260804010004_winter_internship_rpc.sql. The client
 * never touches intern-facing tables directly (they have RLS with no
 * policies), so track isolation, approval-based week unlocks and input
 * validation are enforced server-side.
 */

export const WINTER_TRACKS = [
  { id: 'frontend-engineering', label: 'Frontend', icon: '💻', tech: 'React.js, Tailwind CSS, TypeScript, Responsive UI' },
  { id: 'backend-engineering', label: 'Backend', icon: '🚀', tech: 'Node.js, Express, PostgreSQL, REST & AI APIs' },
  { id: 'full-stack-engineering', label: 'Full Stack', icon: '⚡', tech: 'React, Node.js, Databases, Full Lifecycle Deployment' },
  { id: 'machine-learning', label: 'Machine Learning', icon: '🤖', tech: 'Python, scikit-learn, Pandas, Model Evaluation' },
  { id: 'agentic-ai-engineering', label: 'Agentic AI', icon: '🧠', tech: 'LLM APIs, LangChain, Function Calling, Agent Workflows' },
]

export const STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Under Review',
  under_review: 'Under Review',
  changes_requested: 'Changes Requested',
  approved: 'Approved',
  rejected: 'Rejected',
}

const TRACK_LABELS = Object.fromEntries(WINTER_TRACKS.map((t) => [t.id, t.label]))

/** Resolves a track slug (e.g. 'frontend-engineering') to its display label. */
export function trackLabel(slug) {
  return TRACK_LABELS[slug] || slug || null
}

/** Resolves any track label/slug to the canonical slug, or null when unknown. */
export function trackSlug(value) {
  if (!value) return null
  if (TRACK_LABELS[value]) return value
  const norm = String(value).toLowerCase().replace(/[^a-z0-9]/g, '')
  const hit = WINTER_TRACKS.find((t) => t.id.replace(/[^a-z0-9]/g, '') === norm)
  return hit ? hit.id : null
}

/**
 * Resolves the effective application status from a list of rows using
 * priority order. A user can have multiple applications for the same email
 * (e.g. an old rejected row plus a newer approved resubmission) — an
 * `approved` row ALWAYS wins, then `pending`/`shortlisted`, and only when no
 * better row exists do we fall back to the most recent (rejected/revoked).
 * Status comparisons are case-insensitive.
 *
 * CRITICAL: When multiple approved rows exist, the LATEST by `created_at`
 * (newest application) wins — this ensures a user who re-applied for a
 * different track (e.g., Full Stack → Backend) sees their NEW track.
 *
 * Returns { status, application }:
 *   - status: the resolved row's status, or null when the list is empty.
 *   - application: the winning row.
 */
export function resolveApplicationPriority(applications) {
  const list = Array.isArray(applications) ? applications : []
  if (list.length === 0) return { status: null, application: null }

  const norm = (app) => String(app?.status || '').trim().toLowerCase()
  // A row is approved if status says so OR the is_approved flag is set (the
  // flag can drift out of sync with status when written by older admin paths).
  const isApproved = (app) => norm(app) === 'approved' || app?.is_approved === true

  // 1. PRIORITIZE APPROVED STATUS — but pick the LATEST approved by created_at.
  const approvedApps = list.filter(isApproved)
  if (approvedApps.length > 0) {
    // List is already ordered by created_at DESC (newest first) from the query,
    // but be explicit: sort by created_at descending and take the first.
    const latestApproved = [...approvedApps].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    )[0]
    return { status: 'approved', application: latestApproved }
  }

  // 2. CHECK FOR PENDING / SHORTLISTED — pick the latest.
  const pendingApps = list.filter((app) => norm(app) === 'pending' || norm(app) === 'shortlisted')
  if (pendingApps.length > 0) {
    const latestPending = [...pendingApps].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    )[0]
    return { status: norm(latestPending), application: latestPending }
  }

  // 3. FALLBACK TO THE MOST RECENT ROW (rejected / revoked / any other state).
  // List is already ordered by created_at DESC, so list[0] is the latest.
  const fallback = list[0]
  return { status: norm(fallback) || 'rejected', application: fallback }
}

/**
 * Fetches EVERY application row for an email (newest first) and resolves the
 * effective status via {@link resolveApplicationPriority}. Unlike a bare
 * `limit(1).maybeSingle()`, a user with multiple rows (old rejected + new
 * approved) is never locked out or hit by a multiple-rows error.
 */
export async function fetchInternApplication(email) {
  if (!email) return { status: null, application: null, error: null }
  const { data, error } = await supabase
    .from('intern_applications')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })
  if (error) return { status: null, application: null, error }
  return { ...resolveApplicationPriority(data), error: null }
}

function rowOf(data) {
  return Array.isArray(data) && data.length ? data[0] : data
}

/**
 * Server-side login. `winter_login` returns a single row:
 * { ok, application, error, status } where `ok` is true only for approved
 * applications with matching credentials.
 */
export async function winterLogin(email, password) {
  const res = await call('winter_login', { p_email: email, p_password: password })
  if (res.rpcError) {
    return { success: false, rpcError: res.rpcError, error: 'Login service unavailable' }
  }
  const row = rowOf(res.data)
  if (!row) return { success: false, error: 'Invalid credentials' }
  if (!row.ok) return { success: false, status: row.status || null, error: row.error || 'Login failed' }
  return { success: true, application: row.application }
}

/** One call drives the whole portal: enrollment, weeks, assignments, submissions, proofs, unlock state. */
export async function winterPortalContext(applicationId) {
  const res = await call('winter_portal_context', { p_application_id: applicationId })
  if (res.rpcError) return { error: res.rpcError.message || 'Unable to load portal data' }
  return res.data || { error: 'Empty portal response' }
}

/**
 * Dev-only auto-enrollment. Enrolls an approved application into the active
 * Winter season so a freshly submitted application opens a portal with the
 * Winter assignments immediately. Gated server-side by
 * `winter_settings.dev_auto_enroll` — when that flag is 'false'/absent the
 * normal production `needs_enrollment` flow is preserved.
 */
export async function winterDevAutoEnroll(applicationId) {
  const res = await call('winter_dev_auto_enroll', { p_application_id: applicationId })
  if (res.rpcError) return { success: false, message: res.rpcError.message || 'Auto-enroll failed' }
  const data = res.data || {}
  if (data.error) return { success: false, message: data.error }
  return { success: true, data }
}

/** Unique assignment brief + prior submission + unlock state. Cross-track ids are rejected server-side. */
export async function winterAssignmentDetail(applicationId, assignmentId) {
  const res = await call('winter_assignment_detail', {
    p_application_id: applicationId,
    p_assignment_id: assignmentId,
  })
  if (res.rpcError) return { error: res.rpcError.message || 'Unable to load assignment', code: 'unavailable' }
  return res.data || { error: 'Empty assignment response' }
}

/** Save or resubmit a solution. `status` is 'draft' or 'submitted'. */
export async function winterSaveSubmission({ applicationId, assignmentId, githubUrl, liveUrl, notes, attachmentUrl, attachmentName, status }) {
  const res = await call('winter_save_submission', {
    p_application_id: applicationId,
    p_assignment_id: assignmentId,
    p_github_url: githubUrl || null,
    p_live_url: liveUrl || null,
    p_notes: notes || null,
    p_attachment_url: attachmentUrl || null,
    p_attachment_name: attachmentName || null,
    p_status: status,
  })
  if (res.rpcError) return { success: false, code: 'unavailable', message: res.rpcError.message || 'Save failed' }
  const data = res.data || {}
  if (data.error) return { success: false, code: data.code || 'error', message: data.error }
  return { success: true, data }
}

/**
 * Upsert a course completion certificate (PDF or PNG/JPG image) for a course
 * requirement. `fileUrl` is the public Storage URL returned after the client
 * uploads the file to the `course-certificates` bucket; the RPC stores it
 * alongside the file name with status `submitted` (Under Review).
 */
export async function winterSaveCourseProof({ applicationId, courseRequirementId, fileUrl, fileName }) {
  const res = await call('winter_save_course_proof', {
    p_application_id: applicationId,
    p_course_requirement_id: courseRequirementId,
    p_file_url: fileUrl || null,
    p_file_name: fileName || null,
  })
  if (res.rpcError) return { success: false, code: 'unavailable', message: res.rpcError.message || 'Upload failed' }
  const data = res.data || {}
  if (data.error) return { success: false, code: data.code || 'error', message: data.error }
  return { success: true, data }
}

/* ------------------------------ Admin RPCs ------------------------------ */

export async function winterAdminDashboard(adminKey) {
  const res = await call('winter_admin_dashboard', { p_admin_key: adminKey })
  if (res.rpcError) return { error: res.rpcError.message || 'Unable to load dashboard', code: 'unavailable' }
  return res.data || { error: 'Empty dashboard response' }
}

export async function winterAdminReviewSubmission(adminKey, submissionId, status, feedback) {
  const res = await call('winter_admin_review_submission', {
    p_admin_key: adminKey,
    p_submission_id: submissionId,
    p_status: status,
    p_feedback: feedback || null,
  })
  if (res.rpcError) return { success: false, message: res.rpcError.message || 'Review failed' }
  const data = res.data || {}
  if (data.error) return { success: false, message: data.error }
  return { success: true }
}

export async function winterAdminReviewProof(adminKey, proofId, status, feedback) {
  const res = await call('winter_admin_review_proof', {
    p_admin_key: adminKey,
    p_proof_id: proofId,
    p_status: status,
    p_feedback: feedback || null,
  })
  if (res.rpcError) return { success: false, message: res.rpcError.message || 'Review failed' }
  const data = res.data || {}
  if (data.error) return { success: false, message: data.error }
  return { success: true }
}

export async function winterAdminApproveApplication(adminKey, applicationId, trackId) {
  const res = await call('winter_admin_approve_application', {
    p_admin_key: adminKey,
    p_application_id: applicationId,
    p_track_id: trackId,
  })
  if (res.rpcError) return { success: false, message: res.rpcError.message || 'Approve failed' }
  const data = res.data || {}
  if (data.error) return { success: false, message: data.error }
  return { success: true }
}

export async function winterAdminRejectApplication(adminKey, applicationId) {
  const res = await call('winter_admin_reject_application', {
    p_admin_key: adminKey,
    p_application_id: applicationId,
  })
  if (res.rpcError) return { success: false, message: res.rpcError.message || 'Reject failed' }
  const data = res.data || {}
  if (data.error) return { success: false, message: data.error }
  return { success: true }
}

/** Camel-case an assignment_submissions row for the client UI. */
export function mapSubmission(row) {
  if (!row || typeof row !== 'object') return null
  return {
    id: row.id,
    assignmentId: row.assignment_id,
    status: row.status || 'draft',
    githubUrl: row.github_url || '',
    liveUrl: row.live_url || '',
    notes: row.notes || '',
    attachmentUrl: row.attachment_url || '',
    attachmentName: row.attachment_name || '',
    attemptNumber: row.attempt_number || 1,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    feedback: row.mentor_feedback || '',
    score: row.score,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
  }
}

/** Camel-case a course_proofs row for the client UI. */
export function mapProof(row) {
  if (!row || typeof row !== 'object') return null
  return {
    id: row.id,
    courseRequirementId: row.course_requirement_id,
    status: row.status || 'submitted',
    fileName: row.file_name || '',
    fileUrl: row.file_url || '',
    submittedAt: row.submitted_at,
    feedback: row.mentor_feedback || '',
    reviewedAt: row.reviewed_at,
  }
}
