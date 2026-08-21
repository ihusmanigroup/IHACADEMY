import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  X, Send, Loader2, Sparkles, Trash2, Copy, Check,
  PlayCircle, Code2, HelpCircle, LifeBuoy, FileCheck2, ClipboardCheck, GraduationCap,
  MessageCircle,
} from 'lucide-react'
import { usePortalStore } from '../context/PortalContext'
import { useInternAuth } from '../context/InternAuthContext'
import { streamAIReply } from '../lib/aiTutorClient'

const MAX_TOKENS = 1200

// Shown in the assistant bubble whenever every model in the queue fails or a
// response comes back empty — never leave a blank bubble stuck on screen.
const ERROR_COPY = 'Connection lost or model timed out. Retrying with fallback model...'

const LOADING_STATUSES = [
  'Analyzing your question...',
  'Preparing your answer...',
  'Writing step-by-step guide...',
  'Almost done...',
]

const QUICK_ACTIONS = [
  { label: 'How do I start?', icon: PlayCircle, prompt: 'How do I start this assignment? Give me the exact step-by-step plan.' },
  { label: 'Give me complete code', icon: Code2, prompt: 'Give me the complete code for this assignment, file by file.' },
  { label: 'Explain this step', icon: HelpCircle, prompt: 'Explain this step in detail.' },
  { label: "I'm stuck", icon: LifeBuoy, prompt: "I'm stuck on this assignment. Help me figure out where I am and what to do next." },
  { label: 'What should I submit?', icon: FileCheck2, prompt: 'What exactly should I submit for this assignment? Give me the submission checklist.' },
  { label: 'Check my progress', icon: ClipboardCheck, prompt: 'Give me a checklist to check my progress on this assignment.' },
]

// Cleans up AI output: converts stray HTML (<br> etc.) into real newlines,
// removes leftover tags, and normalizes spacing so text renders cleanly.
function cleanAiText(raw) {
  let t = raw || ''
  t = t.replace(/<br\s*\/?>/gi, '\n')
  t = t.replace(/<\/(?:p|div|li|h1|h2|h3|h4|pre|code|span|strong|em)>/gi, '\n')
  t = t.replace(/<(?:p|div|li|h1|h2|h3|h4|pre|code|span|strong|em)[^>]*>/gi, '')
  t = t.replace(/&nbsp;/gi, ' ')
  t = t.replace(/\\n/g, '\n')
  t = t.replace(/\\t/g, '    ')
  t = t.replace(/\n{3,}/g, '\n\n')
  t = t.replace(/[ \t]+\n/g, '\n')
  t = t.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}]/gu, '')
  t = t.replace(/\uFE0F|\u20E3/g, '')
  t = t.replace(/[\u2014\u2013]/g, '-')
  t = t.replace(/\u00B7/g, ' ')
  return t.trim()
}

// Converts plain "Step 1: ..." lines into real markdown headings and makes
// sure code fences are surrounded by blank lines so they render as blocks.
function prettifyMarkdown(raw) {
  const t = cleanAiText(raw)
  const parts = t.split('```')
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part
      return part
        .replace(/^\s*(step\s*\d+[\s.:)\-–—]*[^\n]*?)\s*$/gim, '\n### $1\n')
        .replace(/\n{3,}/g, '\n\n')
    })
    .join('```')
    .trim()
}

function AlexAvatar({ className = '' }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Alex, AI Mentor">
      <defs>
        <linearGradient id="alex-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </linearGradient>
      </defs>

      {/* backdrop */}
      <circle cx="60" cy="60" r="60" fill="url(#alex-bg)" />

      {/* suit jacket */}
      <path d="M10 120 L10 102 C10 86 30 79 46 79 C51 79 56 81 59 85 L60 88 L61 85 C64 81 69 79 74 79 C90 79 110 86 110 102 L110 120 Z" fill="#1e3a8a" />

      {/* shirt + tie (a little of the tie stays visible below the beard) */}
      <path d="M47 79 L60 95 L73 79 Z" fill="#ffffff" />
      <path d="M56 79 L64 79 L64.5 85 L60 89 L55.5 85 Z" fill="#b91c1c" />
      <path d="M58.2 87 L61.8 87 L62.5 102 L60 107 L57.5 102 Z" fill="#dc2626" />

      {/* neck */}
      <path d="M52 66 L68 66 L70 79 L50 79 Z" fill="#e0a878" />

      {/* ears + head */}
      <circle cx="33" cy="46" r="6" fill="#f2c191" />
      <circle cx="87" cy="46" r="6" fill="#f2c191" />
      <circle cx="60" cy="42" r="27" fill="#f2c191" />

      {/* hair */}
      <path d="M33 36 A27 27 0 0 1 87 36 L87 30 C87 22 76 15 60 15 C44 15 33 22 33 30 Z" fill="#332e2c" />

      {/* beard */}
      <path d="M35 47 C35 63 44 74 60 74 C76 74 85 63 85 47 C84 55 76 60 60 60 C44 60 36 55 35 47 Z" fill="#332e2c" />

      {/* eyebrows */}
      <path d="M43 35 Q49 32 55 34" stroke="#332e2c" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M65 34 Q71 32 77 35" stroke="#332e2c" strokeWidth="2.4" strokeLinecap="round" fill="none" />

      {/* eyes (blink animation via .alex-eye) */}
      <g className="alex-eye">
        <circle cx="49" cy="42" r="3.2" fill="#1f2937" />
      </g>
      <g className="alex-eye">
        <circle cx="71" cy="42" r="3.2" fill="#1f2937" />
      </g>

      {/* nose */}
      <path d="M60 44 Q57 51 59 54 Q60 55.5 61 54" stroke="#d9a06b" strokeWidth="2.4" strokeLinecap="round" fill="none" />

      {/* mustache */}
      <path d="M45 52 Q52 58 60 58 Q68 58 75 52 Q68 63 60 63 Q52 63 45 52 Z" fill="#332e2c" />
    </svg>
  )
}

function buildWelcome({ trackLabel, assignment, week }) {
  if (assignment) {
    return (
      `Hi! I'm **Alex** — your AI Mentor for the **${trackLabel}** track of the Winter Internship 2026-27.\n\n` +
      `You're currently on **Task #${assignment.order}: ${assignment.title}** (Week ${week?.week_number || '—'}).\n\n` +
      `I'll guide you step by step - exact commands, copy-paste code, and how to submit. What do you need?`
    )
  }
  return (
    `Hi! I'm **Alex** — your AI Mentor for the **${trackLabel}** track of the Winter Internship 2026-27.\n\n` +
    `Ask me anything about your internship - assignments, week unlocks, submissions, course proofs, certificates or LOR. ` +
    `I'll keep it practical with exact steps.`
  )
}

function buildSystemPrompt({ trackLabel, assignment, week, internName, unlockedWeek }) {
  const mode = assignment ? 'assignment' : 'general'
  const lines = [
    `You are Alex, the official IH Academy AI Mentor for the ${trackLabel} track (Winter Internship 2026-27). You guide intern ${internName || 'Intern'} like a real teacher — practical, step-by-step, never vague theory.`,
    '',
    'LANGUAGE RULE (STRICT - COUNT THE WORDS IN THE USER\'S LAST MESSAGE):',
    '- Count the English words vs the Roman Urdu words in the user\'s last message. If MOST of the words are English (even if the message contains 1-2 Urdu words like karo, hai, bhai, haan), reply 100% IN ENGLISH. Example: "continue karo haan ya naa" is mostly English, so the whole reply must be in English.',
    '- Reply in SIMPLE Roman Urdu ONLY when the message is clearly majority Roman Urdu (for example "mujhe samajh nahi araha kya karna hai", "bhai karwao full code").',
    '- NEVER mix languages inside one reply. An English reply must NOT contain any Urdu words (no karo, haan, naa, bhai, hai, chahiye). A Roman Urdu reply must not contain long English sentences.',
    '- Code, commands, file names and technical terms are always written in English in both cases.',
    '',
    'CONTEXT RULE (STRICT):',
    mode === 'assignment'
      ? '- The intern is CURRENTLY VIEWING the assignment listed below. You MUST help ONLY with THAT assignment — never switch to a different project. Your answer MUST match the assignment\'s question, requirements, deliverables and acceptance criteria exactly.'
      : '- The intern is on the internship DASHBOARD / general portal page, NOT on any specific assignment. Do NOT invent or give full assignment solutions here. Answer general internship questions only (weeks, unlocks, submissions, course proofs, certificates, LOR, portal navigation). If they ask about a specific assignment, ask which one they mean, then guide them to open it.',
    '',
    'WINDOWS RULES (VERY STRICT):',
    '- The intern works on WINDOWS with VS Code and Windows CMD or PowerShell terminal. NEVER give Linux/macOS commands: NO cat, touch, cp, mv, rm, chmod, nano, vi. ABSOLUTELY NO heredoc commands like "cat > file <<\'EOF\'" — these DO NOT work on Windows.',
    '- To create/edit a file, do NOT give a file-creating command. Instead say in which folder to create it, and show the FULL file content in a code block. The intern will create the file in VS Code and paste the content.',
    '- NEVER chain multiple commands in one line with && or ; . Give ONE command per line, each as its own small step. Example: step 1 gives "mkdir notes-api", step 2 gives "cd notes-api", step 3 gives "npm init -y". After every terminal command, tell the intern in one short line what they should SEE if it worked (for example: "package.json file ban gayi").',
    '- Every terminal command you give must be a single line that works when pasted into Windows CMD or PowerShell (npm install, mkdir, cd, node, npm init -y are fine).',
    '',
    'ANSWER STYLE — ALWAYS USE THIS STEP TEMPLATE:',
    '- Interleave ACTION then CODE. NEVER dump all the text first and then all the code. The pattern for every task is:',
    '    Step 1: <short title of what you do here>',
    '    <max 2 short lines: what to do and WHERE — Terminal mein, ya VS Code mein ye file banao>',
    '    ```bash  (only if it is a Windows terminal command)',
    '    <exact command>',
    '    ```',
    '    Then the next action line, then its code. Continue Step 2, Step 3...',
    '- LABEL every code block clearly: terminal commands are fenced as ```bash. File contents are fenced as ```js / ```json / ```html and the filename is written in BOLD ABOVE the block (e.g. **src/server.js**) with the words "ye file banao:".',
    '- PACING: Do NOT give the whole project at once. Give a 2-3 line plan first, then give Step 1 and Step 2 WITH their commands/code, then ask "Continue?" in the SAME language as your reply (English reply -> ask "Continue? (yes / no)". Roman Urdu reply -> ask "Continue karun? (haan / naa)"). Continue step by step only when the user says yes. The ONLY exception: when the user explicitly asks for "complete code" or "full code", then give everything file by file.',
    '- Keep every step small: one short action line + one command/code block. Max 2 lines of explanation per step. No long paragraphs and never re-explain the code line by line.',
    '- DEFAULT: 150-300 words total. When the user says things like "karwao", "kaise hoga", "start", "help": give a SHORT plan plus the FIRST 2 steps with their exact commands, then offer: "Full code chahiye to bolo, main file by file complete code de deta hoon."',
    '- ONLY when the user explicitly asks "complete code", "full code", "code de do", "file by file": give COMPLETE files (never fragments), file by file in order — **File 1** (name + code), command to run it, **File 2** (name + code), command to run it, etc. Give only the essential files, never dump every possible file.',
    '- At the end of every solution give: (1) what to test, (2) expected result, (3) which screenshots to take, (4) exact submission checklist (GitHub URL, deployed link, API collection, PDF report).',
    '',
    'ERROR MODE:',
    '- Ask for the exact error message/code/screenshot first. Then give the exact file, the exact line/section, the replacement code, save, and the command to rerun. Never say vague things like "check your code".',
    '',
    'FORMATTING RULES (STRICT):',
    '- NO EMOJIS, NO symbols like 1️⃣, 👋, ❌, ✅, →, —, ·, ─, ✔. Use only plain ASCII: normal dashes and plain numbers (1. 2. 3.).',
    '- Use plain Markdown only. NEVER use HTML tags like <br>, <p>, <div> — separate paragraphs with a blank line instead.',
    '- Every piece of code MUST be inside a fenced code block. NEVER show code as plain paragraphs and NEVER mix prose and code inside the same paragraph — text stays text, code stays code.',
    '- Never write the word "Copy" or "Copy code" before a code block — the chat already has its own copy button.',
    '- Put one blank line before and after every code block. Use numbered steps (Step 1, Step 2) and short dashes for simple bullets.',
    '',
    'WORD / GOOGLE DOCS / PDF REPORT MODE:',
    '- Give click-by-click guide: open Google Docs or Word, write this heading, paste this ready-to-paste text, put your screenshot here, add a test table, then File > Save as PDF.',
    '',
    'HARD RULES:',
    '- NEVER invent files, imports, routes or database names for code you have not seen. If the implementation depends on an existing file, ask: "paste the current code of that file".',
    '- NEVER help with fake screenshots, fake deployments, copied repositories, plagiarism or exposed API keys.',
    `- TRACK ISOLATION: You ONLY know the ${trackLabel} track. Never expose other tracks' assignments or solutions. Never help bypass week locks or the approval system.`,
    '',
  ]
  const ctx = [
    'INTERNSHIP CONTEXT:',
    `- Track: ${trackLabel || 'Unknown'}`,
    `- Intern: ${internName || 'Intern'}`,
    `- Week currently unlocked: Week ${unlockedWeek || 1} of 4`,
    ...(mode === 'assignment' && assignment
      ? [
          'CURRENT ASSIGNMENT (help ONLY with this):',
          `- Task #${assignment.order || '—'} · ${assignment.title || '—'} (Week ${week?.week_number || '—'}${week?.title ? ` · ${week.title}` : ''})`,
          `- Difficulty: ${assignment.difficulty || '—'} | Workload: ${assignment.hours_label || (assignment.estimated_hours ? `${assignment.estimated_hours} hours` : '—')}`,
          `- Question: ${assignment.question || '—'}`,
          `- Key requirements: ${(Array.isArray(assignment.requirements) ? assignment.requirements : []).join('; ') || '—'}`,
          `- Expected deliverables: ${(Array.isArray(assignment.deliverables) ? assignment.deliverables : []).join('; ') || '—'}`,
          `- Acceptance criteria: ${(Array.isArray(assignment.acceptance_criteria) ? assignment.acceptance_criteria : []).join('; ') || '—'}`,
          `- Evidence required: ${assignment.evidence_required || '—'}`,
          `- Submission mode: ${assignment.submission_mode || 'GitHub URL + PDF report'}`,
        ]
      : []),
    '',
    'Respond in simple English. Keep it short and actionable.',
  ]
  return [...lines, ...ctx].join('\n')
}

function MarkdownMessage({ content }) {
  const [copied, setCopied] = useState(null)
  const cleaned = useMemo(() => prettifyMarkdown(content), [content])

  const copyCode = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        pre: ({ children }) => {
          let codeText = ''
          if (children && children.props && typeof children.props.children === 'string') {
            codeText = children.props.children
          } else if (children && children.props && Array.isArray(children.props.children)) {
            codeText = children.props.children.map((c) => (typeof c === 'string' ? c : '')).join('')
          }
          return (
            <div className="group/code relative my-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-[#0B0F17]">
              <button
                onClick={() => copyCode(codeText)}
                className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:text-sky-600 dark:bg-slate-800/90 dark:text-slate-300 dark:ring-slate-700 cursor-pointer"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-slate-800 dark:text-slate-100">{children}</pre>
            </div>
          )
        },
        code: ({ children }) => (
          <code className="rounded bg-sky-500/10 px-1.5 py-0.5 font-mono text-[11px] text-sky-700 dark:text-sky-300">
            {children}
          </code>
        ),
        strong: ({ children }) => <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>,
        p: ({ children }) => <p className="mb-2 last:mb-0 text-pretty text-slate-700 dark:text-slate-200">{children}</p>,
        ul: ({ children }) => <ul className="my-1.5 space-y-1 pl-4">{children}</ul>,
        li: ({ children }) => <li className="list-disc text-slate-700 dark:text-slate-200">{children}</li>,
        ol: ({ children }) => <ol className="my-1.5 list-decimal space-y-1 pl-4">{children}</ol>,
        h1: ({ children }) => (
          <h1 className="mt-4 mb-1.5 text-[13px] font-extrabold tracking-tight text-sky-700 dark:text-cyan-300">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-4 mb-1.5 text-[13px] font-extrabold tracking-tight text-sky-700 dark:text-cyan-300">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-4 mb-1.5 text-[13px] font-extrabold tracking-tight text-sky-700 dark:text-cyan-300">{children}</h3>
        ),
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto rounded-lg border border-slate-300 dark:border-slate-700">
            <table className="w-full text-xs">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border-b border-slate-300 bg-slate-100 px-2.5 py-1.5 text-left font-bold dark:border-slate-700 dark:bg-slate-800">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-b border-slate-200 px-2.5 py-1.5 dark:border-slate-800">{children}</td>
        ),
      }}
    >
      {cleaned}
    </ReactMarkdown>
  )
}

export default function AIMentor({
  variant = 'launcher',
  assignment: assignmentProp = null,
  week: weekProp = null,
  trackLabel: trackLabelProp = null,
  quickActions: quickActionsProp = null,
  systemContextNote = null,
}) {
  const { assignmentId } = useParams()
  const { weeks, userTrack, unlockedWeek } = usePortalStore()
  const { intern } = useInternAuth()

  const current = useMemo(() => {
    if (assignmentProp && weekProp) return { assignment: assignmentProp, week: weekProp }
    if (!assignmentId || !weeks?.length) return null
    for (const week of weeks) {
      const a = (week.assignments || []).find((x) => String(x.id) === String(assignmentId))
      if (a) return { assignment: a, week }
    }
    return null
  }, [assignmentId, weeks, assignmentProp, weekProp])

  const assignment = current?.assignment || null
  const week = current?.week || null
  const trackLabel = trackLabelProp || userTrack || 'Internship'
  const internName = intern?.name || 'Intern'
  const activeQuickActions = quickActionsProp && quickActionsProp.length ? quickActionsProp : QUICK_ACTIONS

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryPrompt, setRetryPrompt] = useState(null)
  const [statusIdx, setStatusIdx] = useState(0)
  const listRef = useRef(null)
  const systemPromptRef = useRef(null)
  // Smooth streaming: incoming deltas accumulate in pendingRef, then a
  // requestAnimationFrame loop releases them a few characters at a time so the
  // answer visibly types out even when the provider sends big chunks at once.
  const pendingRef = useRef('')
  const rafRef = useRef(null)

  const streamTick = () => {
    rafRef.current = requestAnimationFrame(streamTick)
    const pending = pendingRef.current
    if (!pending) return
    const take = Math.min(pending.length, 3)
    if (!take) return
    const chunk = pending.slice(0, take)
    pendingRef.current = pending.slice(take)
    setMessages((prev) => {
      const copy = [...prev]
      const last = { ...copy[copy.length - 1] }
      last.content = (last.content || '') + chunk
      copy[copy.length - 1] = last
      return copy
    })
  }

  const startStream = () => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(streamTick)
  }

  const stopStream = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const flushPending = () => {
    const pending = pendingRef.current
    if (pending) {
      pendingRef.current = ''
      setMessages((prev) => {
        const copy = [...prev]
        const last = { ...copy[copy.length - 1] }
        last.content = (last.content || '') + pending
        copy[copy.length - 1] = last
        return copy
      })
    }
  }

  // Stop the pump when the chat unmounts so we never update state after exit.
  useEffect(() => () => stopStream(), [])

  // Rotates the "working..." status text while the answer is being prepared.
  useEffect(() => {
    if (!loading) {
      setStatusIdx(0)
      return
    }
    const id = setInterval(() => setStatusIdx((i) => (i + 1) % LOADING_STATUSES.length), 2500)
    return () => clearInterval(id)
  }, [loading])

  // Rebuild the mentor prompt + welcome whenever the assignment or track
  // changes so context never leaks between pages/assignments.
  useEffect(() => {
    let prompt = buildSystemPrompt({ trackLabel, assignment, week, internName, unlockedWeek })
    if (systemContextNote) prompt += `\n\nEXTRA CONTEXT FOR THIS VIEW:\n${systemContextNote}`
    systemPromptRef.current = prompt
    setMessages([{ role: 'assistant', content: buildWelcome({ trackLabel, assignment, week }) }])
    setError(null)
    setRetryPrompt(null)
    pendingRef.current = ''
    stopStream()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment, week, trackLabel, unlockedWeek, internName, systemContextNote])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading, open])

  const sendMessage = async (override) => {
    const text = (override ?? input).trim()
    if (!text || loading) return
    setInput('')
    setError(null)
    setRetryPrompt(null)
    pendingRef.current = ''
    const updated = [...messages, { role: 'user', content: text }]
    setMessages((prev) => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '' }])
    setLoading(true)
    startStream()

    try {
      // Resilient queue: primary model first, then the unified fallback chain
      // with a 10s watchdog per attempt. Deltas stream into the in-flight
      // assistant message through the smooth pump (pendingRef).
      const res = await streamAIReply({
        messages: [{ role: 'system', content: systemPromptRef.current }, ...updated],
        maxTokens: MAX_TOKENS,
        onDelta: (delta) => {
          pendingRef.current += delta
        },
      })

      if (res.ok) {
        const streamed = pendingRef.current
        flushPending()
        stopStream()

        // Safety net: if the model returned an empty payload (blank bubble),
        // replace it with the error alert instead of leaving it stuck.
        if (!(streamed || '').trim()) {
          setError(ERROR_COPY)
          setRetryPrompt(text)
          setMessages((prev) => {
            const copy = [...prev]
            copy[copy.length - 1] = { role: 'assistant', content: `⚠️ ${ERROR_COPY}` }
            return copy
          })
        }
        return
      }

      // Every model in the queue failed consecutively — only now do we
      // surface an end-user error instead of a blank bubble.
      stopStream()
      pendingRef.current = ''
      setError(ERROR_COPY)
      setRetryPrompt(text)
      setMessages((prev) => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'assistant', content: `⚠️ ${ERROR_COPY}` }
        return copy
      })
    } catch {
      // Network-level failure — never leave a blank bubble behind.
      stopStream()
      pendingRef.current = ''
      setError(ERROR_COPY)
      setMessages((prev) => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'assistant', content: `⚠️ ${ERROR_COPY}` }
        return copy
      })
    } finally {
      // Always clear the loading state so the UI can never freeze.
      setLoading(false)
    }
  }

  const clearChat = () => {
    pendingRef.current = ''
    stopStream()
    setMessages([{ role: 'assistant', content: buildWelcome({ trackLabel, assignment, week }) }])
    setError(null)
    setRetryPrompt(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const showQuickActions = messages.length === 1 && !loading

  const chatHeader = (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25">
          <AlexAvatar className="h-10 w-10 rounded-full border-2 border-white/30" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#0F1420]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-bold text-slate-900 dark:text-white">
              Ask Alex — {trackLabel}
            </h3>
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-sky-500 dark:text-cyan-400" />
          </div>
          <p className="mt-0.5 truncate text-[11px] text-slate-500">
            {assignment
              ? `Task #${assignment.order}: ${assignment.title}`
              : 'Step-by-step guide · Full code · Error fixing · Word/PDF reports'}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={clearChat}
          className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white"
          title="Clear chat"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        {variant === 'launcher' && (
          <button
            onClick={() => setOpen(false)}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )

  const chatMessages = (
    <div
      ref={listRef}
      className="custom-scrollbar flex-1 space-y-5 overflow-y-auto bg-slate-50/70 px-5 py-5 dark:bg-[#0B0F17]"
    >
      {messages.map((msg, i) => {
        if (msg.role === 'user') {
          return (
            <div key={i} className="flex justify-end">
              <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-none bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-3 text-sm leading-relaxed text-white shadow-md shadow-sky-600/10">
                {msg.content}
              </div>
            </div>
          )
        }
        const isLastEmpty = i === messages.length - 1 && loading && msg.content === ''
        return (
          <div key={i} className="flex justify-start">
            <div className="custom-scrollbar mr-auto max-h-[55vh] w-full max-w-[96%] overflow-y-auto rounded-2xl rounded-tl-none border border-slate-200 bg-white px-4 py-3.5 text-sm leading-relaxed text-slate-700 shadow-sm dark:border-slate-800 dark:bg-[#1E293B] dark:text-slate-200">
              {isLastEmpty ? (
                <div className="py-1">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {LOADING_STATUSES[statusIdx]}
                    </span>
                  </div>
                  <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" />
                  </div>
                </div>
              ) : (
                <MarkdownMessage content={msg.content} />
              )}
            </div>
          </div>
        )
      })}

      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300">
          <p>{error}</p>
          {retryPrompt && (
            <button
              onClick={() => sendMessage(retryPrompt)}
              disabled={loading}
              className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 font-semibold text-white transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Retry
            </button>
          )}
        </div>
      )}

      {showQuickActions && (
        <div className="flex flex-wrap gap-2 pt-1">
          {activeQuickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => sendMessage(a.prompt)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition-all hover:border-sky-500/50 hover:text-sky-600 dark:border-slate-700 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:text-cyan-300"
            >
              <a.icon className="h-3.5 w-3.5" /> {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const chatInput = (
    <div className="shrink-0 border-t border-slate-200 p-4 dark:border-slate-800">
      <div className="relative flex w-full items-center">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask about this assignment, paste an error, or say 'code de do'..."
          className="max-h-32 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-24 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-800 dark:bg-[#07090e] dark:text-white"
        />
        <div className="absolute right-2 flex items-center gap-1.5">
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-cyan-500/10 transition-all hover:from-blue-500 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
        <GraduationCap className="h-3.5 w-3.5 text-sky-500" />
        IH Academy - Winter Internship 2026-27
      </p>
    </div>
  )

  const chatWindow = (
    <div className="flex min-h-0 flex-1 flex-col">
      {chatHeader}
      {chatMessages}
      {chatInput}
    </div>
  )

  // Embedded variant — always-visible chatbox for side-by-side layouts
  // (e.g. the Assignment Details workspace).
  if (variant === 'inline') {
    return (
      <div className="flex h-[600px] max-h-[85vh] min-h-[460px] flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="h-1 shrink-0 bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500" />
        {chatWindow}
      </div>
    )
  }

  return (
    <>
      {/* Inline AI Mentor card — sits inside the assignment detail, below the submission tool */}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <button
          onClick={() => setOpen(true)}
          className="group flex w-full flex-col items-center gap-3 focus:outline-none"
          title="Ask Alex"
        >
          {/* Animated cartoon beard-man avatar (face + a little of his tie) */}
          <span className="relative block">
            <span className="relative block h-20 w-20 overflow-hidden rounded-full border-2 border-cyan-500/60 bg-slate-100 shadow-md shadow-cyan-500/10 transition-all duration-300 group-hover:border-cyan-400 dark:bg-slate-900">
              <span className="block h-full w-full animate-alex-breathe">
                <AlexAvatar className="h-full w-full" />
              </span>
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#0f1420]" />
          </span>

          {/* Mentor name */}
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Ask Alex
          </span>
        </button>

        {/* Action button inside the card */}
        <button
          onClick={() => setOpen(true)}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/10 transition-all duration-200 hover:from-blue-500 hover:to-cyan-400"
        >
          <MessageCircle className="h-3.5 w-3.5" /> Start a Chat
        </button>
      </div>

      {/* Centered chat window — rendered through a portal so `fixed` stays relative
          to the viewport even though this component sits inside transformed/animated wrappers */}
      {open && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative my-auto flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-slate-800 sm:h-[88vh] sm:max-h-[860px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient accent strip */}
            <div className="h-1 shrink-0 bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500" />
            {chatWindow}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
