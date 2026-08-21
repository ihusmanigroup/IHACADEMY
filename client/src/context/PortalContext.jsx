import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  winterPortalContext, winterDevAutoEnroll, winterSaveSubmission, winterSaveCourseProof,
  trackLabel, trackSlug, mapSubmission, mapProof, WINTER_TRACKS,
} from '../lib/winterInternship'
import { supabase } from '../lib/supabase'
import { DEV_MODE } from '../config/devMode'
import { fetchFreeCourses } from '../lib/freeCoursesCatalog'

/**
 * Global Portal Store — Winter Internship 2026-27.
 *
 * Everything is loaded from the `winter_portal_context` RPC and refreshed
 * after each save. There is no local write-through: drafts, submissions and
 * course proofs live in Supabase, reviewed by the admin console.
 *
 * Exposed shape mirrors the old store API where the UI still depends on it:
 * `getSubmission`, `saveDraft`, `submitAssignment`, `submissions`,
 * `unlockedWeek`, `totals`, `weekProgress`, `allApproved`, `nextAssignment`,
 * `overallPct` plus the raw `context` payload and `refresh()`.
 *
 * Assignment Q&A stays in localStorage (`ih_portal_qa`) — it is a display
 * convenience, not a record of truth.
 */

const QA_KEY = 'ih_portal_qa'

/** Every free course in the IH Academy catalog is mandatory for completing the internship. */
const FREE_COURSE_TOTAL = 8

/**
 * Default Winter Internship 2026-27 cohort roadmap, scoped per track. Injected
 * as a client-side fallback when the `winter_portal_context` RPC returns
 * empty / null / errored data, so the Overview dashboard never hangs on a
 * skeleton or shows NaN stats, AND every candidate sees the assignments for
 * the track they actually applied to — never a generic "Full Stack" roadmap.
 * The stats cards compute safely from these rows (total 4, approved 0, pending
 * 0) and the "Next up" card always has a starting assignment.
 */
const TRACK_DEFAULT_ASSIGNMENTS = {
  'frontend-engineering': [
    { title: 'Build Your Portfolio UI with HTML & CSS', slug: 'portfolio-ui-html-css', difficulty: 'Beginner', hours: 9, desc: 'Create a polished, responsive portfolio page as your Week 1 deliverable — semantic HTML, modern CSS and a strong visual hierarchy.' },
    { title: 'Interactive UI with React & TypeScript', slug: 'interactive-ui-react-ts', difficulty: 'Intermediate', hours: 10, desc: 'Build interactive components with React and TypeScript: state, props, routing and reusable UI patterns.' },
    { title: 'Responsive Layouts & Tailwind Mastery', slug: 'responsive-tailwind', difficulty: 'Intermediate', hours: 11, desc: 'Master responsive layouts and Tailwind CSS — breakpoints, grids, flexbox and production styling workflow.' },
    { title: 'Frontend Performance & Deployment', slug: 'frontend-performance-deploy', difficulty: 'Advanced', hours: 12, desc: 'Optimize bundle size and runtime performance, then deploy your frontend to production.' },
  ],
  'backend-engineering': [
    { title: 'Node.js API Fundamentals & Express', slug: 'node-express-api', difficulty: 'Beginner', hours: 9, desc: 'Stand up a REST API with Node.js and Express — routing, middleware, validation and structured responses.' },
    { title: 'PostgreSQL Database Design & Queries', slug: 'postgresql-design-queries', difficulty: 'Intermediate', hours: 10, desc: 'Design normalized schemas and write efficient PostgreSQL queries, indexes and joins.' },
    { title: 'REST & AI API Integration', slug: 'rest-ai-api-integration', difficulty: 'Intermediate', hours: 11, desc: 'Connect your backend to third-party REST and AI APIs with secure credential handling.' },
    { title: 'Backend Production Deployment', slug: 'backend-production-deploy', difficulty: 'Advanced', hours: 12, desc: 'Deploy your API to production with environment config, migrations and monitoring.' },
  ],
  'full-stack-engineering': [
    { title: 'Setup Environment & Portfolio UI', slug: 'setup-environment-portfolio', difficulty: 'Beginner', hours: 9, desc: 'Set up your developer environment and build a polished, responsive portfolio page as your Week 1 deliverable.' },
    { title: 'Backend API & Supabase Integration', slug: 'backend-api-supabase', difficulty: 'Intermediate', hours: 10, desc: 'Build a backend API and wire it to Supabase for storage, auth and realtime data flows.' },
    { title: 'AI Agent Integration & RAG Pipeline', slug: 'ai-agent-rag-pipeline', difficulty: 'Intermediate', hours: 12, desc: 'Integrate an AI agent and assemble a Retrieval-Augmented Generation pipeline over your project data.' },
    { title: 'Production Deployment & Capstone Review', slug: 'production-deployment-capstone', difficulty: 'Advanced', hours: 14, desc: 'Deploy your application to production and complete the final capstone review.' },
  ],
  'machine-learning': [
    { title: 'Python Data Foundations & NumPy/Pandas', slug: 'python-data-foundations', difficulty: 'Beginner', hours: 9, desc: 'Warm up with Python data tooling — NumPy arrays, Pandas DataFrames and clean exploratory analysis.' },
    { title: 'Scikit-Learn Models & Evaluation', slug: 'sklearn-models-evaluation', difficulty: 'Intermediate', hours: 10, desc: 'Train scikit-learn models and evaluate them rigorously with cross-validation and metrics.' },
    { title: 'Feature Engineering & Model Tuning', slug: 'feature-engineering-tuning', difficulty: 'Intermediate', hours: 12, desc: 'Engineer features and tune hyperparameters to push model performance on a real dataset.' },
    { title: 'ML Capstone & Deployment', slug: 'ml-capstone-deployment', difficulty: 'Advanced', hours: 14, desc: 'Ship an end-to-end machine learning project: data pipeline, model, evaluation and deployment.' },
  ],
  'agentic-ai-engineering': [
    { title: 'LLM APIs & Prompt Foundations', slug: 'llm-apis-prompt-foundations', difficulty: 'Beginner', hours: 9, desc: 'Get productive with LLM APIs — prompt design, structured outputs and cost-aware calls.' },
    { title: 'RAG Pipeline with LangChain', slug: 'rag-langchain', difficulty: 'Intermediate', hours: 11, desc: 'Assemble a Retrieval-Augmented Generation pipeline with LangChain over your own documents.' },
    { title: 'Function Calling & Agent Workflows', slug: 'function-calling-agents', difficulty: 'Intermediate', hours: 12, desc: 'Build agents with function calling, tool use and multi-step reasoning workflows.' },
    { title: 'Agent Production Deployment & Capstone', slug: 'agent-deployment-capstone', difficulty: 'Advanced', hours: 14, desc: 'Deploy a production agent with eval sets, monitoring and safety guardrails.' },
  ],
}

const TRACK_DEFAULT_FALLBACK = TRACK_DEFAULT_ASSIGNMENTS['full-stack-engineering']

/**
 * Every week carries 4 distinct tasks (matching the live cohort structure that
 * `winter_portal_context` serves for enrolled interns). Week 1 uses the
 * canonical Task 1.1–1.4 breakdown; later weeks split the week theme into
 * setup / implementation / integration / review phases.
 */
const WEEK1_SUBTASKS = [
  'Environment Setup & Project Architecture',
  'Core UI Components & Responsive Layout',
  'State Management & Client Routing',
  'Local Storage & Mock API Integration',
]

const FALLBACK_TASK_PHASES = [
  'Setup & Architecture',
  'Core Implementation',
  'Integration & Polish',
  'Review & Submission',
]

function fallbackSubtaskTitle(weekNumber, taskIndex, theme) {
  if (weekNumber === 1) return WEEK1_SUBTASKS[taskIndex - 1]
  return `${theme} — ${FALLBACK_TASK_PHASES[taskIndex - 1]}`
}

/** Build 4 weeks × 4 tasks for a track slug (falls back to full-stack). */
function defaultAssignmentsFor(trackSlug) {
  const themes = TRACK_DEFAULT_ASSIGNMENTS[trackSlug] || TRACK_DEFAULT_FALLBACK
  const baseSlug = trackSlug || 'full-stack-engineering'
  return themes.map((t, i) => {
    const weekNumber = i + 1
    const assignments = [1, 2, 3, 4].map((taskIndex) => {
      const id = `${baseSlug}-w${weekNumber}-a${taskIndex}`
      const phase = FALLBACK_TASK_PHASES[taskIndex - 1]
      const sub = fallbackSubtaskTitle(weekNumber, taskIndex, t.title)
      return {
        id,
        week_number: weekNumber,
        order: taskIndex,
        title: `Task ${weekNumber}.${taskIndex}: ${sub}`,
        slug: id,
        difficulty: taskIndex <= 2 ? 'Beginner' : taskIndex === 3 ? 'Intermediate' : 'Advanced',
        estimated_hours: t.hours,
        hours_label: `~${t.hours}h`,
        submission_mode: 'GitHub Repository & Live URL',
        description: `${t.desc} This task focuses on ${phase.toLowerCase()}.`,
        question: `${t.desc} For Task ${weekNumber}.${taskIndex}, deliver the ${phase.toLowerCase()} portion of this week's brief.`,
        instructions: [
          `Review the ${t.title} brief for Week ${weekNumber}.`,
          `Plan and implement the ${phase.toLowerCase()} scope described in the brief.`,
          'Follow the acceptance criteria below and run through them before submitting.',
          'Commit your work to a GitHub repository and (where applicable) deploy a live preview.',
        ],
        requirements: [
          `Task ${weekNumber}.${taskIndex} scope is fully implemented and functional.`,
          'Clean, well-structured, commented code following the track conventions.',
          'A GitHub repository with a README explaining how to run the project.',
        ],
        deliverables: ['Source code repository', 'Live demo / deployed link (where applicable)', 'Screenshots or a short evidence note'],
        acceptance_criteria: [
          `All requirements for Task ${weekNumber}.${taskIndex} are met.`,
          'Code builds/runs without errors.',
          'Submission links (GitHub / live URL) are public and working.',
        ],
        evidence_required: 'GitHub repository link + live demo URL (if applicable).',
        points: 100,
      }
    })
    return {
      week_number: weekNumber,
      title: t.title,
      assignments,
      course_requirements: [],
    }
  })
}

/** Zero-filled default portal payload scoped to the candidate's applied track. */
function defaultCohortPayload(trackSlug, application = null) {
  const weeks = defaultAssignmentsFor(trackSlug)
  const total = weeks.reduce((n, w) => n + (w.assignments?.length || 0), 0)
  return {
    application:
      application || {
        id: 'ih-portal-preview',
        full_name: 'Winter Intern',
        email: 'intern@ihacademy.example',
        track: trackSlug || 'full-stack-engineering',
        status: 'approved',
      },
    enrollment: null,
    weeks,
    unlocked_week: 1,
    all_approved: false,
    track: { slug: trackSlug || 'full-stack-engineering', name: trackLabel(trackSlug) },
    submissions: {},
    proofs: {},
    progress: {
      total,
      approved: 0,
      week_progress: weeks.map((w) => ({
        week_number: w.week_number,
        title: w.title,
        total: w.assignments.length,
        approved: 0,
        complete: false,
      })),
    },
    needs_enrollment: false,
    fallback: true,
  }
}

export const SUBMISSION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  CHANGES_REQUESTED: 'changes_requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

export const STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Under Review',
  under_review: 'Under Review',
  changes_requested: 'Changes Requested',
  approved: 'Approved',
  rejected: 'Rejected',
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

/**
 * Upload the first newly-attached PDF (real File blob) to the
 * `assignment-docs` Storage bucket and return its public URL + name.
 * Objects are stored under `submissions/<timestamp>_<file>.pdf` and read back
 * via the bucket's public URL. Returns null when there is nothing new to
 * upload (e.g. only a pre-existing attachment is being kept). Existing
 * attachments are identified by the `existing` marker and are preserved
 * server-side instead of re-uploaded.
 */
async function uploadNewAttachment(files) {
  const file = (files || []).find((f) => f && !f.existing && f.name && f.size > 0)
  if (!file) return null
  const safeName = file.name.replace(/[^a-z0-9._-]/gi, '_').slice(0, 80)
  const filePath = `submissions/${Date.now()}_${safeName}`
  const { error } = await supabase.storage
    .from('assignment-docs')
    .upload(filePath, file, { cacheControl: '3600', contentType: 'application/pdf', upsert: false })
  if (error) return { error }
  const { data } = supabase.storage.from('assignment-docs').getPublicUrl(filePath)
  return { url: data.publicUrl, name: file.name }
}

/**
 * Map a certificate file's extension to its MIME type so images are stored
 * with their real content type — inline previews in the browser and admin
 * console render correctly instead of being served as application/pdf.
 */
function certificateContentType(file) {
  if (file && file.type) return file.type
  const ext = String(file?.name || '').toLowerCase().split('.').pop()
  if (ext === 'png') return 'image/png'
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  return 'application/pdf'
}

/**
 * Build the Storage object path for a course certificate upload:
 * `<applicationId>/<courseRequirementId>_<timestamp>.<ext>` so every intern's
 * certificates live under their own folder and re-uploads never collide.
 */
function certificateStoragePath({ applicationId, courseRequirementId }, file) {
  const safeUserId = String(applicationId || 'intern').replace(/[^a-z0-9_-]/gi, '_')
  const safeReq = String(courseRequirementId || 'course').replace(/[^a-z0-9_-]/gi, '_')
  const match = String(file.name || '').toLowerCase().match(/\.(pdf|png|jpe?g)$/)
  const ext = match ? match[1] : 'pdf'
  return `${safeUserId}/${safeReq}_${Date.now()}.${ext}`
}

/**
 * Upload a course completion certificate (PDF or PNG/JPG image) to the
 * `course-certificates` Storage bucket under
 * `<applicationId>/<courseRequirementId>_<timestamp>.<ext>` and return its
 * public URL + name. The URL is then persisted on the proof row via the RPC so
 * the admin console (and the intern) can open the uploaded file.
 */
async function uploadCourseCertificate(file, { applicationId, courseRequirementId } = {}) {
  if (!file) return null
  const filePath = certificateStoragePath({ applicationId, courseRequirementId }, file)
  const { error } = await supabase.storage
    .from('course-certificates')
    .upload(filePath, file, { cacheControl: '3600', contentType: certificateContentType(file), upsert: false })
  if (error) return { error }
  const { data } = supabase.storage.from('course-certificates').getPublicUrl(filePath)
  return { url: data.publicUrl, name: file.name }
}

const PortalContext = createContext(null)

export function PortalProvider({ applicationId, enrolledTrack, children }) {
  const [payload, setPayload] = useState(null)
  const [loading, setLoading] = useState(Boolean(applicationId))
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState(null)
  const [qa, setQa] = useState(() => readJson(QA_KEY) || {})
  // Optimistic course-proof entries applied on top of the server payload so an
  // upload flips the UI to "Under Review" instantly, before the silent
  // background refresh lands the authoritative row from Supabase.
  const [proofOverrides, setProofOverrides] = useState({})
  // Full IH Academy free-course catalog (all `is_free` courses, no limit).
  // Used by the Progress metrics + Free Courses page so "mandatory free
  // courses" are always counted against the real catalog.
  const [freeCatalog, setFreeCatalog] = useState(null)
  // Mirrors `payload` so `refresh()` can tell a first load (show skeleton)
  // from a background refresh (keep the cached UI rendered, no flicker).
  const payloadRef = useRef(payload)
  // Single-flight guards: at most one RPC in flight; a request arriving while
  // one runs only marks a pending refresh, coalesced into a single follow-up.
  const refreshInFlightRef = useRef(false)
  const refreshQueuedRef = useRef(false)

  /**
   * Fetch portal data. The first load flips `loading` so sub-pages can show a
   * skeleton; every later call is a SILENT background refresh that keeps the
   * existing payload visible and only swaps in the new data when it arrives —
   * `loading` is never toggled and the cached UI is never cleared. On a
   * background refresh failure the stale data is kept instead of blanking the
   * page with an error.
   *
   * Overlapping calls are coalesced (single-flight): while one fetch is in
   * flight, further requests only flag a pending refresh that the in-flight
   * completion runs once — rapid tab switches collapse into a single RPC
   * instead of stacking concurrent requests.
   */
  const refresh = useCallback(async () => {
    if (!applicationId) {
      setLoading(false)
      return
    }
    if (refreshInFlightRef.current) {
      refreshQueuedRef.current = true
      return
    }
    refreshInFlightRef.current = true
    try {
      const firstLoad = payloadRef.current == null
      if (firstLoad) setLoading(true)
      else setRefreshing(true)

      let res
      try {
        res = await winterPortalContext(applicationId)
        if (!res.error && res.needs_enrollment && DEV_MODE) {
          const enrol = await winterDevAutoEnroll(applicationId)
          if (enrol.success && enrol.data?.enrolled) {
            res = await winterPortalContext(applicationId)
          }
        }
      } catch (err) {
        // A thrown network/RPC rejection must NEVER leave the portal on a
        // perpetual skeleton — resolve it as an error so the fallback below
        // can render the default cohort dashboard.
        res = { error: err?.message || 'Unable to load portal data' }
      }

      setRefreshing(false)

      // If the RPC errored or returned an empty/null roadmap (no enrolled
      // weeks yet, needs_enrollment, or a transient failure), inject the
      // default cohort data for the CANDIDATE'S APPLIED TRACK instead of
      // hanging on a skeleton or falling back to a generic roadmap — the
      // dashboard always renders with safe zero values.
      const hasWeeks = Array.isArray(res.weeks) && res.weeks.length > 0
      if (!hasWeeks) {
        // Capture application status from RPC response (e.g., pending, shortlisted, rejected)
        if (res.status) {
          setApplicationStatus(res.status)
        }
        // Keep the real application row (present in `needs_enrollment`/partial
        // responses) so the assignment detail route has an application id and
        // never renders a blank page.
        // CRITICAL: Use the track from the authoritative database application row
        // (res.application.track) instead of the enrolledTrack prop, which may
        // come from a stale localStorage session.
        const applicationTrackSlug = res.application?.track ? trackSlug(res.application.track) : enrolledTrack
        setPayload(defaultCohortPayload(applicationTrackSlug, res.application || null))
        setError(null)
        return
      }

      setError(null)
      setApplicationStatus('approved') // Only reaches here if approved
      setPayload(res)
    } finally {
      // ALWAYS break out of the loading state, success or failure.
      setLoading(false)
      refreshInFlightRef.current = false
      if (refreshQueuedRef.current) {
        refreshQueuedRef.current = false
        refresh()
      }
    }
  }, [applicationId, enrolledTrack])

  useEffect(() => {
    payloadRef.current = payload
  }, [payload])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const rows = await fetchFreeCourses()
      if (alive) setFreeCatalog(rows)
    })()
    return () => { alive = false }
  }, [])

  useEffect(() => {
    setQa(readJson(QA_KEY) || {})
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, refresh])

  const weeks = useMemo(() => payload?.weeks || [], [payload])
  const unlockedWeek = payload?.unlocked_week || 1

  /** requirementId -> { weekNum, requirement } index for course proof lookups. */
  const requirementIndex = useMemo(() => {
    const index = {}
    for (const week of weeks) {
      for (const req of week.course_requirements || []) {
        index[req.id] = { weekNum: week.week_number, requirement: req }
      }
    }
    return index
  }, [weeks])

  const submissions = useMemo(() => {
    const map = {}
    for (const [assignmentId, row] of Object.entries(payload?.submissions || {})) {
      map[assignmentId] = mapSubmission(row)
    }
    return map
  }, [payload])

  const proofs = useMemo(() => {
    const map = {}
    for (const [requirementId, row] of Object.entries(payload?.proofs || {})) {
      map[requirementId] = mapProof(row)
    }
    // Optimistic uploads bridge the gap until the next payload arrives; once
    // the server row is present it wins over the local overlay.
    for (const [requirementId, p] of Object.entries(proofOverrides)) {
      map[requirementId] = { ...p, ...(map[requirementId] || {}) }
    }
    return map
  }, [payload, proofOverrides])

  /** Compat: week-level certificate map keyed by track label + week number. */
  const certificates = useMemo(() => {
    const out = {}
    for (const [requirementId, proof] of Object.entries(proofs)) {
      const meta = requirementIndex[requirementId]
      if (!meta) continue
      const label = trackLabel(payload?.track?.slug) || 'Intern'
      out[label] = {
        ...(out[label] || {}),
        [meta.weekNum]: {
          name: proof.fileName,
          size: 0,
          uploadedAt: proof.submittedAt,
          status: proof.status,
        },
      }
    }
    return out
  }, [proofs, requirementIndex, payload])

  const userTrack = trackLabel(payload?.track?.slug) || trackLabel(enrolledTrack) || null

  const getSubmission = useCallback((assignmentId) => submissions[assignmentId] || null, [submissions])

  const getProof = useCallback((requirementId) => proofs[requirementId] || null, [proofs])

  const saveDraft = useCallback(
    async (assignmentId, patch = {}) => {
      if (!applicationId) return
      try {
        const uploaded = await uploadNewAttachment(patch.files)
        const files = Array.isArray(patch.files) ? patch.files : []
        const existing = files.find((f) => f && f.existing)
        const keepUrl = uploaded && !uploaded.error ? uploaded.url : (patch.attachmentUrl || null)
        const keepName = uploaded && !uploaded.error ? uploaded.name : (existing ? existing.name : (patch.attachmentName || null))
        await winterSaveSubmission({
          applicationId,
          assignmentId,
          githubUrl: patch.githubUrl !== undefined ? patch.githubUrl : null,
          liveUrl: patch.liveUrl !== undefined ? patch.liveUrl : null,
          notes: patch.notes !== undefined ? patch.notes : null,
          attachmentUrl: keepUrl,
          attachmentName: keepName,
          status: 'draft',
        })
        await refresh()
      } catch {}
    },
    [applicationId, refresh]
  )

  const submitAssignment = useCallback(
    async (assignmentId, { githubUrl, liveUrl, notes, files = [], attachmentUrl = null, attachmentName = null } = {}) => {
      if (!applicationId) return { success: false, message: 'Not signed in' }
      try {
        const uploaded = await uploadNewAttachment(files)
        if (uploaded && uploaded.error) return { success: false, message: `PDF upload failed: ${uploaded.error.message}` }
        const keepUrl = uploaded ? uploaded.url : attachmentUrl
        const keepName = uploaded ? uploaded.name : attachmentName
        const result = await winterSaveSubmission({
          applicationId,
          assignmentId,
          githubUrl: githubUrl !== undefined ? githubUrl : null,
          liveUrl: liveUrl !== undefined ? liveUrl : null,
          notes: notes !== undefined ? notes : null,
          attachmentUrl: keepUrl,
          attachmentName: keepName,
          status: 'submitted',
        })
        if (result.success) await refresh()
        return result
      } catch (err) {
        return { success: false, message: err?.message || 'Submission could not be saved.' }
      }
    },
    [applicationId, refresh]
  )

  /**
   * Upload a course certificate file (PDF / PNG / JPG) for one required course.
   *
   * End-to-end flow: (1) upload the file to the `course-certificates` Storage
   * bucket, (2) resolve the public URL, (3) upsert the course_proofs row via
   * the RPC with that URL and status `submitted` (Under Review), then (4) apply
   * an optimistic overlay so the UI transitions to Under Review instantly while
   * the silent background refresh reconciles with the authoritative row.
   */
  const saveCourseProof = useCallback(
    async (courseRequirementId, file) => {
      if (!applicationId) return { success: false, message: 'Not signed in' }
      if (!file || !/\.(pdf|png|jpe?g)$/i.test(file.name)) {
        return { success: false, message: 'Only .pdf, .png, .jpg or .jpeg certificate files are accepted.' }
      }

      const uploaded = await uploadCourseCertificate(file, { applicationId, courseRequirementId })
      if (uploaded && uploaded.error) {
        return { success: false, message: `Certificate upload failed: ${uploaded.error.message}` }
      }
      const fileUrl = uploaded ? uploaded.url : null
      const fileName = uploaded ? uploaded.name : file.name

      const result = await winterSaveCourseProof({
        applicationId,
        courseRequirementId,
        fileUrl,
        fileName,
      })
      if (result.success) {
        setProofOverrides((prev) => ({
          ...prev,
          [courseRequirementId]: {
            status: 'submitted',
            fileName,
            fileUrl: fileUrl || '',
            submittedAt: new Date().toISOString(),
          },
        }))
        await refresh()
      }
      return result
    },
    [applicationId, refresh]
  )

  /* --------------------------- Derived summary --------------------------- */

  /**
   * Live status tallies from the real-time submissions + proofs maps returned
   * by `winter_portal_context`. Server `progress.submitted` lumps
   * 'changes_requested' into the submitted bucket, so Under Review and
   * Changes Requested are derived here from the actual per-row statuses:
   *   Under Review      = submitted / under_review / pending
   *   Changes Requested = changes_requested / rejected
   */
  const statusCounts = useMemo(() => {
    const c = { approved: 0, underReview: 0, changesRequested: 0, rejected: 0, draft: 0 }
    for (const rows of [submissions, proofs]) {
      for (const row of Object.values(rows)) {
        if (row.status === 'approved') c.approved += 1
        else if (row.status === 'submitted' || row.status === 'under_review' || row.status === 'pending') c.underReview += 1
        else if (row.status === 'changes_requested') c.changesRequested += 1
        else if (row.status === 'rejected') { c.changesRequested += 1; c.rejected += 1 }
        else if (row.status === 'draft') c.draft += 1
      }
    }
    return c
  }, [submissions, proofs])

  const totals = useMemo(() => {
    const progress = payload?.progress
    const t = {
      submitted: 0,
      approved: 0,
      pending: 0,
      revision: 0,
      changesRequested: 0,
      rejected: 0,
      draft: 0,
      total: 0,
    }
    if (!progress) return t
    t.total = progress.total || 0
    t.approved = progress.approved || 0
    t.pending = statusCounts.underReview
    t.submitted = statusCounts.underReview
    t.revision = statusCounts.changesRequested
    t.changesRequested = statusCounts.changesRequested
    t.rejected = statusCounts.rejected
    t.draft = statusCounts.draft
    return t
  }, [payload, statusCounts])

  const weekProgress = useMemo(
    () =>
      (payload?.progress?.week_progress || []).map((w) => ({
        weekNum: w.week_number,
        label: `Week ${w.week_number}`,
        title: w.title || '',
        total: w.total || 0,
        approved: w.approved || 0,
        submitted: w.approved || 0,
        complete: !!w.complete,
      })),
    [payload]
  )

  /**
   * catalog course id -> { requirementId, weekNum } for certificates that link
   * to the winter roadmap. Only catalog courses with a matching requirement can
   * receive an approved certificate.
   */
  const catalogLinkMap = useMemo(() => {
    const map = {}
    for (const [reqId, meta] of Object.entries(requirementIndex || {})) {
      const catalogId = meta?.requirement?.catalog_course_id
      if (catalogId) map[catalogId] = { requirementId: reqId, weekNum: meta.weekNum }
    }
    return map
  }, [requirementIndex])

  /** Catalog courses enriched with their roadmap link + approval state. */
  const freeCourses = useMemo(() => {
    if (!freeCatalog) return []
    return freeCatalog.map((c) => {
      const link = catalogLinkMap[c.id]
      return {
        ...c,
        requirementId: link?.requirementId || null,
        weekNumber: link?.weekNum || null,
        locked: link ? link.weekNum > unlockedWeek : false,
        linked: Boolean(link),
        proof: link ? proofs[link.requirementId] || null : null,
      }
    })
  }, [freeCatalog, catalogLinkMap, unlockedWeek, proofs])

  const freeCourseStats = useMemo(() => {
    const total = freeCourses.length || FREE_COURSE_TOTAL
    const approved = freeCourses.filter((c) => c.proof?.status === 'approved').length
    return { total, approved, pct: total ? Math.round((approved / total) * 100) : 0 }
  }, [freeCourses])

  /**
   * Combined internship progress: weekly roadmap items (assignments + course
   * requirements, reported by the server) PLUS the mandatory free-course
   * catalog. Free courses are now a hard requirement for completion.
   */
  const combinedProgress = useMemo(() => {
    const approved = (totals.approved || 0) + freeCourseStats.approved
    const total = (totals.total || 0) + freeCourseStats.total
    return { approved, total, pct: total ? Math.round((approved / total) * 100) : 0 }
  }, [totals, freeCourseStats])

  const allApproved = !!payload?.all_approved && freeCourseStats.approved >= freeCourseStats.total
  const overallPct = combinedProgress.pct

  const nextAssignment = useMemo(() => {
    for (const week of weeks) {
      for (const assignment of week.assignments || []) {
        const s = submissions[assignment.id]
        if (!s || s.status !== 'approved') return assignment
      }
    }
    return null
  }, [weeks, submissions])

  const submissionsList = useMemo(() => {
    const rows = []
    for (const week of weeks) {
      for (const assignment of week.assignments || []) {
        const s = submissions[assignment.id]
        if (!s) continue
        rows.push({
          taskId: assignment.id,
          taskTitle: assignment.title,
          week: `Week ${week.week_number}`,
          track: userTrack || '—',
          type: assignment.submission_mode || 'Assignment',
          githubUrl: s.githubUrl,
          liveUrl: s.liveUrl,
          notes: s.notes,
          pdfName: s.attachmentName,
          pdfSize: null,
          attemptNumber: s.attemptNumber,
          submitDate: s.submittedAt,
          status: STATUS_LABELS[s.status] || s.status,
          statusKey: s.status,
          score: s.score,
          feedback: s.feedback,
          reviewedAt: s.reviewedAt,
        })
      }
    }
    return rows.sort((a, b) => new Date(b.submitDate || 0) - new Date(a.submitDate || 0))
  }, [weeks, submissions, userTrack])

  /* --------------------------- Q&A (local mirror) --------------------------- */

  const postQuestion = useCallback((assignmentId, body, author = { name: 'Intern' }) => {
    if (!body.trim()) return
    const question = {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      assignmentId,
      authorId: author.id || 'intern',
      authorName: author.name || 'Intern',
      body: body.trim(),
      isPublic: true,
      createdAt: new Date().toISOString(),
      answers: [],
    }
    setQa((prev) => {
      const next = {
        ...prev,
        [assignmentId]: [...(prev[assignmentId] || []), question],
      }
      writeJson(QA_KEY, next)
      return next
    })
  }, [])

  const answerQuestion = useCallback(
    (assignmentId, questionId, body, { isOfficial = false, author = { name: 'IH Academy' } } = {}) => {
      if (!body.trim()) return
      const answer = {
        id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        authorId: author.id || 'admin',
        authorName: author.name || 'IH Academy',
        body: body.trim(),
        isOfficial,
        createdAt: new Date().toISOString(),
      }
      setQa((prev) => {
        const list = prev[assignmentId] || []
        const next = {
          ...prev,
          [assignmentId]: list.map((q) =>
            q.id === questionId ? { ...q, answers: [...q.answers, answer] } : q
          ),
        }
        writeJson(QA_KEY, next)
        return next
      })
    },
    []
  )

  const questionsFor = useCallback((assignmentId) => qa[assignmentId] || [], [qa])

  const value = useMemo(
    () => ({
      userTrack,
      setUserTrack: () => {},
      context: payload,
      loading,
      error,
      refreshing,
      hasLoaded: payload != null,
      refresh,
      weeks,
      getSubmission,
      saveDraft,
      submitAssignment,
      submissions: submissionsList,
      unlockedWeek,
      totals,
      weekProgress,
      allApproved,
      nextAssignment,
      overallPct,
      saveCourseProof,
      getProof,
      proofs,
      certificates,
      freeCourses,
      freeCourseStats,
      combinedProgress,
      getCertificate: (trackLabelValue, weekNum) =>
        certificates?.[trackLabel(trackLabelValue) || trackLabelValue]?.[weekNum] || null,
      questionsFor,
      postQuestion,
      answerQuestion,
      isAssignmentPublished: () => true,
      togglePublish: () => {},
      allTracks: WINTER_TRACKS.map((t) => t.label),
      totalAssignments: payload?.progress?.total || 0,
      requirementIndex,
      applicationStatus,
    }),
    [
      userTrack, payload, loading, refreshing, error, refresh, weeks, getSubmission, saveDraft, submitAssignment,
      submissionsList, unlockedWeek, totals, weekProgress, allApproved, nextAssignment,
      overallPct, saveCourseProof, getProof, proofs, certificates, freeCourses, freeCourseStats, combinedProgress,
      questionsFor, postQuestion, answerQuestion, requirementIndex, applicationStatus,
    ]
  )

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
}

export function usePortalStore() {
  const ctx = useContext(PortalContext)
  if (!ctx) throw new Error('usePortalStore must be used inside <PortalProvider>')
  return ctx
}
