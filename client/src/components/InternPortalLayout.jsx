import { useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { useInternAuth } from '../context/InternAuthContext'
import { PortalProvider } from '../context/PortalContext'
import { sidebarItems } from '../data/internPortalNav'
import useInternApplication from '../hooks/useInternApplication'
import InternPortalShell from './InternPortalShell'
import InternApplicationGate from './InternApplicationGate'
import StrictOnboardingModal from './StrictOnboardingModal'
import ErrorBoundary from './ErrorBoundary'
import { LoadingPortal, ErrorPortal } from './PortalStatus'
import { trackLabel, trackSlug } from '../lib/winterInternship'

/**
 * Persistent layout for /intern-portal.
 *
 * The shell (sidebar + header) and the PortalProvider (submissions, proofs,
 * progress) live here and stay mounted while <Outlet /> swaps the active tab
 * or assignment detail page beneath them. Switching tabs never remounts the
 * shell or refetches portal data — the portal store is cached in context.
 *
 * All application gating (approved / pending / rejected, LinkedIn onboarding)
 * is enforced once here instead of inside every sub-page.
 */
export default function InternPortalLayout() {
  const { intern } = useInternAuth()
  // Authoritative application status fetched fresh from Supabase — never the
  // cached session status or a mock fallback.
  const { application, loading, error, refresh } = useInternApplication()
  // Bypass the LinkedIn onboarding gate when the intern has already submitted
  // their post link on a previous visit (instant re-entry on reload — never a
  // loading/onboarding loop), even before the DB row is re-fetched.
  const [linkedInSubmitted, setLinkedInSubmitted] = useState(() => {
    try {
      return localStorage.getItem('linkedin_submitted') === 'true'
    } catch {
      return false
    }
  })
  const [linkedInVerified, setLinkedInVerified] = useState(false)
  const { tab, assignmentId } = useParams()

  const isAssignmentDetail = Boolean(assignmentId)
  const activeTab = isAssignmentDetail ? 'assignments' : (tab || 'overview')
  const item = sidebarItems.find((i) => i.id === activeTab)
  // The candidate's applied track (slug from `intern_applications.track`),
  // resolved to its display label for the shell header/subheadings.
  // CRITICAL: Always use the database application's track as the source of truth.
  // The localStorage intern session may have a stale/wrong track value.
  const applicationTrackSlug = application?.track ? trackSlug(application.track) : null
  const internTrackSlug = intern?.track ? trackSlug(intern.track) : null
  const enrolledTrackSlug = applicationTrackSlug || internTrackSlug || 'full-stack-engineering'
  const appliedTrack = trackLabel(enrolledTrackSlug)
  const title = isAssignmentDetail
    ? `Assignment Details · ${appliedTrack || 'Winter Internship'}`
    : `${item?.label || 'Overview'} · ${appliedTrack || 'Winter Internship'}`
  const subtitle = appliedTrack ? `Winter Internship 2026-27 · ${appliedTrack} · IH Academy` : 'Winter Internship 2026-27 · IH Academy'

  if (loading) return <LoadingPortal />

  const shellProps = { activeTab, title, subtitle }

  if (error) {
    return (
      <InternPortalShell {...shellProps}>
        <ErrorPortal message={error} />
      </InternPortalShell>
    )
  }

  // No application row exists for this email — never fall back to a mock.
  if (!application) {
    return (
      <InternPortalShell {...shellProps}>
        <InternApplicationGate status="none" />
      </InternPortalShell>
    )
  }

  // Gatekeeper: only approved applications see the portal modules.
  if (application.status === 'pending' || application.status === 'shortlisted' || application.status === 'rejected') {
    return (
      <InternPortalShell {...shellProps}>
        <InternApplicationGate status={application.status} />
      </InternPortalShell>
    )
  }

  // Strict LinkedIn onboarding gate: approved interns must submit their public
  // LinkedIn announcement link before ANY portal access. The modal has no close
  // button and cannot be dismissed. Once submitted (DB row, verified state, or
  // the local `linkedin_submitted` flag) the gate stays unlocked forever.
  if (
    application.status === 'approved'
    && !application.linkedin_post_url
    && !linkedInVerified
    && !linkedInSubmitted
  ) {
    return (
      <InternPortalShell activeTab={activeTab} title="LinkedIn Onboarding" subtitle={subtitle}>
        <StrictOnboardingModal
          application={application}
          onVerified={() => {
            setLinkedInVerified(true)
            setLinkedInSubmitted(true)
            refresh()
          }}
        />
      </InternPortalShell>
    )
  }

  // Error boundary keyed only by the active tab/assignment so it resets on
  // navigation while the shell, portal store and page stay mounted (no
  // remount / refetch / skeleton flicker on tab switches).
  const boundaryKey = isAssignmentDetail ? `assignment-${assignmentId}` : (tab || 'overview')

  return (
    <PortalProvider applicationId={application.id} enrolledTrack={enrolledTrackSlug}>
      <InternPortalShell activeTab={activeTab} title={title} subtitle={subtitle}>
        <ErrorBoundary resetKey={boundaryKey}>
          <Outlet />
        </ErrorBoundary>
      </InternPortalShell>
    </PortalProvider>
  )
}
