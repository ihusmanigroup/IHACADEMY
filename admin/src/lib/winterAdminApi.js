import { supabase } from './supabase'

/**
 * Admin wrappers around the Winter Internship RPC layer. All functions are
 * token-gated server-side via `winter_settings.admin_api_key`.
 */

async function call(name, params) {
  const { data, error } = await supabase.rpc(name, params)
  if (error) return { rpcError: error }
  return { data }
}

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
