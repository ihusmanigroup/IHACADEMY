import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, AlertTriangle, Award, CalendarDays, CheckCircle2, ClipboardList,
  Clock, FileText, Loader2, Lock, Package, Rocket, ScrollText, Target,
} from 'lucide-react'
import { STATUS_LABELS, usePortalStore } from '../context/PortalContext'
import { winterAssignmentDetail, mapSubmission, trackLabel } from '../lib/winterInternship'
import InternSubmissionPanel from '../components/InternSubmissionPanel'
import AIMentor from '../components/AIMentor'

const cardBase =
  'rounded-xl border border-slate-200/90 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900'

/**
 * Guardrail: list fields on an assignment row can be null, missing, or (for
 * older rows) a scalar — never call `.map`/`.join` on anything but an array.
 */
function asArray(value) {
  return Array.isArray(value) ? value : []
}

function Section({ icon: Icon, title, accent = false, children }) {
  return (
    <section className={`relative overflow-hidden ${cardBase} p-6`}>
      {accent && (
        <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-500 to-cyan-500" />
      )}
      <h2 className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 ring-1 ring-inset ring-sky-500/25">
          <Icon className="h-4 w-4 text-sky-600 dark:text-cyan-400" />
        </span>
        {title}
      </h2>
      <div className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{children}</div>
    </section>
  )
}

function CheckList({ items, variant = 'check' }) {
  const Icon = variant === 'target' ? Target : CheckCircle2
  const chip =
    variant === 'target'
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/25'
      : 'bg-sky-500/10 text-sky-600 dark:text-cyan-400 ring-sky-500/25'
  const list = asArray(items)
  return (
    <ul className="space-y-3">
      {list.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${chip}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="pt-0.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{item}</span>
        </li>
      ))}
    </ul>
  )
}

const STATUS_DOTS = {
  approved: 'bg-emerald-500',
  submitted: 'bg-amber-500',
  under_review: 'bg-amber-500 animate-pulse',
  changes_requested: 'bg-rose-500',
  rejected: 'bg-rose-500',
  draft: 'bg-slate-400',
}

const STATUS_STYLES = {
  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  submitted: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  under_review: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  changes_requested: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  draft: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-500 border-slate-200/80 dark:border-white/10',
}

/**
 * Rendered inside the /intern-portal layout (<Outlet />). Gating, the shell
 * and the shared PortalProvider live in InternPortalLayout; this page loads
 * the assignment brief for the id in the URL. The provider stays mounted when
 * navigating between assignments or tabs, so no data is refetched here.
 *
 * Never renders a blank page: when the application context or the assignment
 * itself is unavailable (no enrollment yet / fallback roadmap / transient RPC
 * failure), a full detail view is synthesized from the portal context so
 * every assignment link resolves to something useful.
 */
export default function InternAssignmentDetail() {
  const { context } = usePortalStore()
  const applicationId = context?.application?.id || null
  return <InternAssignmentDetailInner applicationId={applicationId} />
}

/** Canonical Week 1 subtask titles (mirrors the fallback roadmap in PortalContext). */
const WEEK1_SUBTASKS = [
  'Environment Setup & Project Architecture',
  'Core UI Components & Responsive Layout',
  'State Management & Client Routing',
  'Local Storage & Mock API Integration',
]

const TASK_PHASES = [
  'Setup & Architecture',
  'Core Implementation',
  'Integration & Polish',
  'Review & Submission',
]

/**
 * Builds a complete detail view for an assignment id that couldn't be loaded
 * from Supabase (assignment missing, preview/fallback roadmap, or a failed
 * RPC). Prefers the real week/assignment when it exists in the portal context;
 * otherwise it synthesizes a Task W.N brief from the applied track.
 */
function buildFallbackDetail(context, assignmentId) {
  const weeks = context?.weeks || []
  const track = context?.track || null
  const app = context?.application || {}
  const fallbackTrackLabel = trackLabel(track?.slug) || app.track || 'Internship'
  const unlockedWeek = context?.unlocked_week || 1

  // 1) Prefer a real assignment that exists in the portal context.
  for (const w of weeks) {
    const hit = (w.assignments || []).find((a) => a.id === assignmentId)
    if (hit) {
      return {
        assignment: hit,
        week: { week_number: w.week_number, title: w.title, unlock_rule: w.unlock_rule },
        track: track || { slug: app.track, name: fallbackTrackLabel },
        submission: null,
        unlocked: w.week_number <= unlockedWeek,
        unlocked_week: unlockedWeek,
      }
    }
  }

  // 2) Synthesize a full detail view so navigation never lands on a blank page.
  const m = String(assignmentId || '').match(/w(\d+)-a(\d+)/i)
  const weekNumber = m ? parseInt(m[1], 10) : 1
  const taskIndex = m ? parseInt(m[2], 10) : 1
  const week = weeks.find((w) => w.week_number === weekNumber) || weeks[0] || {
    week_number: weekNumber,
    title: 'Foundation & Workflow',
    unlock_rule: 'Every assignment and required course proof in the previous week must be approved.',
  }
  const safeWeek = { week_number: week.week_number, title: week.title, unlock_rule: week.unlock_rule }
  const phase = TASK_PHASES[taskIndex - 1] || TASK_PHASES[0]
  const safeAssignment = {
    id: assignmentId || `${track?.slug || 'full-stack-engineering'}-w${weekNumber}-a${taskIndex}`,
    week_number: weekNumber,
    order: taskIndex,
    title: `Task ${weekNumber}.${taskIndex}: ${WEEK1_SUBTASKS[taskIndex - 1] || `${week.title} — ${phase}`}`,
    difficulty: taskIndex <= 2 ? 'Beginner' : taskIndex === 3 ? 'Intermediate' : 'Advanced',
    estimated_hours: 9,
    hours_label: '~9h',
    points: 100,
    submission_mode: 'GitHub Repository & Live URL',
    question: `Complete the ${phase.toLowerCase()} scope for ${week.title} (Week ${weekNumber}). Set up your repository, implement the required functionality, and verify everything works before submitting.`,
    instructions: [
      'Initialize your frontend project using Vite + React / Next.js.',
      'Configure Tailwind CSS or styled components for layout styling.',
      'Integrate basic project structure with dynamic routing.',
      'Push your code to GitHub and host the live preview on Vercel/Netlify.',
    ],
    requirements: [
      `Task ${weekNumber}.${taskIndex} scope is fully implemented and functional.`,
      'Clean, well-structured code following the track conventions.',
      'A GitHub repository with a README explaining how to run the project.',
    ],
    deliverables: ['Source code repository', 'Live demo / deployed link (where applicable)', 'Screenshots or a short evidence note'],
    acceptance_criteria: [
      `All requirements for Task ${weekNumber}.${taskIndex} are met.`,
      'Code builds and runs without errors.',
      'Submission links (GitHub / live URL) are public and working.',
    ],
    evidence_required: 'GitHub repository link + live demo URL (if applicable).',
  }
  return {
    assignment: safeAssignment,
    week: safeWeek,
    track: track || { slug: app.track, name: fallbackTrackLabel },
    submission: null,
    unlocked: week.week_number <= unlockedWeek,
    unlocked_week: unlockedWeek,
    fallback: true,
  }
}

function InternAssignmentDetailInner({ applicationId }) {
  const { assignmentId } = useParams()
  const { context } = usePortalStore()

  const [state, setState] = useState({ loading: Boolean(applicationId), error: null, data: null })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    // Keep the previously rendered brief visible while a different assignment
    // loads; only the very first fetch (nothing cached yet) shows the spinner.
    // Navigating between assignments never blanks the page behind a skeleton.
    if (!applicationId) {
      // No application context (portal preview / fallback roadmap) — render the
      // fallback detail view directly instead of a blank page.
      setState({ loading: false, error: null, data: buildFallbackDetail(context, assignmentId) })
      return () => { cancelled = true }
    }
    setState((prev) => (prev.data ? prev : { ...prev, loading: true, error: null }))
    // Hard safety timeout: if the RPC hangs (network stall, no resolve/reject),
    // fall back to the synthesized detail view after 1.5s instead of spinning
    // forever on a direct refresh of /intern-portal/assignments/:id.
    const safetyTimer = setTimeout(() => {
      if (cancelled) return
      setState({ loading: false, error: null, data: buildFallbackDetail(context, assignmentId) })
    }, 1500)
    ;(async () => {
      try {
        const res = await winterAssignmentDetail(applicationId, assignmentId)
        if (cancelled) return
        clearTimeout(safetyTimer)
        if (res.error && !res.assignment) {
          // Assignment not found / unavailable / transient failure — synthesize
          // a full detail view from the portal context instead of erroring.
          setState({ loading: false, error: null, data: buildFallbackDetail(context, assignmentId) })
          return
        }
        setState({ loading: false, error: null, data: res })
      } catch (err) {
        if (cancelled) return
        clearTimeout(safetyTimer)
        setState({ loading: false, error: null, data: buildFallbackDetail(context, assignmentId) })
      }
    })()
    return () => {
      cancelled = true
      clearTimeout(safetyTimer)
    }
  }, [applicationId, assignmentId, reloadKey, context])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [assignmentId])

  const refresh = () => setReloadKey((k) => k + 1)

  if (state.loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-7 h-7 animate-spin text-sky-500" />
        <p className="text-sm">Loading assignment brief…</p>
      </div>
    )
  }

  if (!state.data) {
    // Belt-and-suspenders: never render a blank page, whatever happened.
    const safe = buildFallbackDetail(context, assignmentId)
    if (!safe) return null
    return <InternAssignmentDetailView data={safe} assignmentId={assignmentId} refresh={refresh} />
  }

  return <InternAssignmentDetailView data={state.data} assignmentId={assignmentId} refresh={refresh} />
}

function InternAssignmentDetailView({ data, assignmentId, refresh }) {
  const { assignment, week, track, submission: submissionRow, unlocked, fallback } = data
  const submission = mapSubmission(submissionRow)
  const statusKey = submission?.status || null

  // Safe refresh handler — never reference an undefined function at runtime.
  const handleRefresh = () => {
    if (typeof refresh === 'function') refresh()
    else window.location.reload()
  }

  const metaChip =
    'inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300'
  const statusChip =
    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold'

  const displayAssignment = {
    ...assignment,
    weekLabel: `Week ${week?.week_number || '—'}`,
    trackLabel: trackLabel(track?.slug) || track?.name || 'Internship',
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 font-sans antialiased leading-relaxed text-slate-700 dark:text-slate-300">
      <Link
        to="/intern-portal/assignments"
        className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-cyan-400"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" /> Back to
        Assignments
      </Link>

      {fallback && (
        <div className="flex items-start gap-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-700 dark:text-sky-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong className="font-semibold">Preview brief</strong> — your enrollment is being prepared. This is the
            standard roadmap for your applied track; submissions will open once your enrollment is active.
          </span>
        </div>
      )}

      <div className={`${cardBase} p-6`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-lg bg-sky-500/10 px-2.5 py-1 text-[11px] font-bold text-sky-700 dark:text-cyan-300 ring-1 ring-inset ring-sky-500/25">
            {displayAssignment.trackLabel}
          </span>
          <span className={metaChip}>{displayAssignment.weekLabel}</span>
          <span className={metaChip}>{assignment.difficulty || 'Beginner'}</span>
          <span className={metaChip}>
            <Clock className="w-3 h-3" /> {assignment.hours_label || `${assignment.estimated_hours} h`}
          </span>
          <span className={metaChip}>Task #{assignment.order}</span>
          {assignment.points ? (
            <span className={`${metaChip} !border-sky-500/30 !text-sky-700 dark:!text-cyan-300`}>
              <Award className="w-3 h-3" /> {assignment.points} XP
            </span>
          ) : null}
        </div>

        <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {assignment.title || 'Assignment Details'}
          </h1>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {statusKey ? (
            <span className={`${statusChip} ${STATUS_STYLES[statusKey] || STATUS_STYLES.draft}`}>
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[statusKey] || 'bg-slate-400'}`} />
              {STATUS_LABELS[statusKey] || statusKey}
            </span>
          ) : (
            <span className={`${statusChip} bg-slate-100 text-slate-500 border-slate-200/80 dark:bg-white/5 dark:text-slate-500 dark:border-white/10`}>
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Not Started
            </span>
          )}
          <span className={`${statusChip} bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300 dark:border-white/10`}>
            <CalendarDays className="w-3 h-3" /> Week {week?.week_number || '—'} · {week?.title || ''}
          </span>
          {unlocked ? (
            <span className={`${statusChip} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20`}>
              <CheckCircle2 className="w-3 h-3" /> Week unlocked — submissions open
            </span>
          ) : (
            <span className={`${statusChip} bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20`}>
              <Lock className="w-3 h-3" /> Week locked — {week?.unlock_rule || 'previous week must be fully approved'}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="space-y-6 lg:col-span-3">
          <Section icon={ScrollText} title="Overview" accent>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {assignment.question || assignment.description || 'Complete the brief for this task, meet the acceptance criteria below, and submit your work for review.'}
            </p>
          </Section>

          {asArray(assignment.instructions).length ? (
            <Section icon={ClipboardList} title="Step-by-Step Instructions">
              <ol className="space-y-3">
                {asArray(assignment.instructions).map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 ring-1 ring-inset ring-sky-500/25 text-xs font-bold text-sky-600 dark:text-cyan-400">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{step}</span>
                  </li>
                ))}
              </ol>
            </Section>
          ) : null}

          <Section icon={ClipboardList} title="Key Requirements">
            <CheckList items={asArray(assignment.requirements)} />
          </Section>

          <Section icon={Package} title="Expected Deliverables">
            <div className="flex flex-wrap gap-2">
              {asArray(assignment.deliverables).map((d, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all duration-200 hover:border-sky-500/40 hover:text-sky-700 dark:hover:text-cyan-200"
                >
                  <Package className="h-3.5 w-3.5 shrink-0 text-indigo-500" /> {d}
                </span>
              ))}
            </div>
          </Section>

          <Section icon={Target} title="Acceptance Criteria">
            <CheckList items={asArray(assignment.acceptance_criteria)} variant="target" />
          </Section>

          {assignment.evidence_required && (
            <Section icon={FileText} title="Evidence Required">
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{assignment.evidence_required}</p>
            </Section>
          )}

          {assignment.submission_mode && (
            <Section icon={Rocket} title="How to Submit">
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{assignment.submission_mode}</p>
            </Section>
          )}
        </div>

        <div className="space-y-6 self-start lg:col-span-2 lg:sticky lg:top-6">
          {unlocked ? (
            <InternSubmissionPanel
              assignmentId={assignment.id}
              submission={submission}
              onSaved={handleRefresh}
            />
          ) : (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-700 dark:text-amber-300">
              <p className="flex items-start gap-2 font-semibold">
                <Lock className="w-4 h-4 shrink-0 mt-px" /> This week is locked
              </p>
              <p className="mt-1.5 text-xs leading-relaxed opacity-90">
                {week?.unlock_rule || 'Every assignment and required course proof in the previous week must be approved before submissions open here.'}
              </p>
            </div>
          )}

          <AIMentor
            assignment={assignment}
            week={week}
            trackLabel={displayAssignment.trackLabel}
          />

          <div className={`${cardBase} p-5`}>
            <h3 className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 ring-1 ring-inset ring-sky-500/25">
                <Award className="h-4 w-4 text-sky-600 dark:text-cyan-400" />
              </span>
              Quick Facts
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Track</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-200">{displayAssignment.trackLabel}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Week</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-200">{displayAssignment.weekLabel}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Difficulty</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-200">{assignment.difficulty || 'Beginner'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Workload</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-200">
                  {assignment.hours_label || `${assignment.estimated_hours} hours`}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Submission</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-200">
                  {assignment.submission_mode || 'GitHub URL + PDF report'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
