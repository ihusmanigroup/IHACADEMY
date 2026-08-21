import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  FileText, Copy, Check, Printer, Download, Edit2, X, Loader2, RotateCcw,
  Send, MessageSquare, Sparkles,
} from 'lucide-react'
import AiMarkdown from './AiMarkdown'
import AiStageLoader from './AiStageLoader'
import { streamAIReply, useSmoothStream, AI_MODEL } from '../lib/aiTutorClient'
import { useNotifications } from '../context/NotificationContext'

const MASTER_NOTES_MODEL = 'poolside/laguna-s-2.1:free'

function courseStructureLines({ modules, lessons }) {
  return (modules || [])
    .map((m) => {
      const modLessons = (lessons || [])
        .filter((l) => l.moduleId === m.id)
        .map((l) => `- ${l.id}: ${l.title}`)
        .join('\n')
      return `## Module ${m.number}: ${m.title}\n${modLessons}`
    })
    .join('\n\n')
}

function buildNotesPrompt({ courseTitle, modules, lessons }) {
  return [
    `You are the official IH Academy AI Tutor. Generate COMPREHENSIVE, structured Course Master Notes for the entire course "${courseTitle}".`,
    '',
    'FULL COURSE STRUCTURE (modules and their lessons — cover EVERY single one):',
    courseStructureLines({ modules, lessons }),
    '',
    'REQUIRED STRUCTURE (follow it exactly):',
    `# ${courseTitle} — Course Master Notes`,
    '## 1. Course Overview — 2-3 sentences on what the course teaches and its goal.',
    '## 2. Module-by-Module Breakdown — for EVERY module: a 1-2 line intro plus bulleted key concepts for every lesson. Use ### lesson headings inside each module when helpful.',
    '## 3. Key Formulas, Definitions & Terms — a table with columns: Concept | Definition / Formula | When to Use.',
    '## 4. Quick Reference Cheat Sheet — a compact table or bullet list summarizing the whole course at a glance.',
    '## 5. Common Pitfalls to Avoid — bullets.',
    '## 6. Exam / Interview Ready Checklist — final bullets the learner must master.',
    '',
    'RULES:',
    '- Cover EVERY module and EVERY lesson listed above. Do not skip any.',
    '- All content in standard English.',
    '- Clean Markdown ONLY: headings, **bold**, - bullets, numbered steps, `code`, ``` code blocks, and tables. NEVER use HTML tags.',
    '- No emojis. No filler like "Sure!" or "Here you go".',
    '- Comprehensive yet concise — short, exam-ready notes that are easy to scan.',
  ].join('\n')
}

function buildFollowupPrompt({ courseTitle, modules, lessons }) {
  return [
    `You are the official IH Academy AI Tutor for the course "${courseTitle}". You refine Course Master Notes on request.`,
    '',
    'FULL COURSE STRUCTURE (modules and their lessons):',
    courseStructureLines({ modules, lessons }),
    '',
    'YOUR TASK:',
    '- You will receive the CURRENT Course Master Notes together with the learner\'s refinement request (e.g. "make these notes more concise", "add more key terms", "explain module 2 in detail", "add examples").',
    '- Rewrite the COMPLETE updated Course Master Notes applying the request.',
    '- ALWAYS output the FULL updated notes — never a diff, never "here are the changes", never fragments or placeholders.',
    '- Keep the same overall structure: Course Overview, Module-by-Module Breakdown, Key Formulas & Definitions, Quick Reference Cheat Sheet, Common Pitfalls, Exam / Interview Ready Checklist.',
    '- Cover every module and every lesson. Keep technical terms in English; write the notes in English unless the learner explicitly asks for another language.',
    '- Clean Markdown ONLY: headings, **bold**, - bullets, numbered steps, `code`, ``` code blocks, and tables. NEVER use HTML tags. No emojis. No filler.',
  ].join('\n')
}

// Plain-text version of the notes for the .txt download.
function toPlainText(md) {
  return md
    .replace(/```/g, '\n')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*\|.*\|$/gm, (line) => line.replace(/\|/g, '  '))
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function buildPrintHtml(courseTitle, bodyHtml) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${courseTitle} - Course Master Notes</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; max-width: 820px; margin: 0 auto; padding: 32px 24px; color: #1e293b; }
  h1 { font-size: 22px; border-bottom: 3px solid #0ea5e9; padding-bottom: 10px; }
  h2 { font-size: 17px; margin-top: 24px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; color: #0369a1; }
  h3 { font-size: 15px; margin-top: 18px; color: #334155; }
  p, li { line-height: 1.65; font-size: 13.5px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12.5px; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
  th { background: #f1f5f9; }
  code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
  pre { background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 8px; overflow-x: auto; }
  pre code { background: none; color: inherit; padding: 0; }
  blockquote { border-left: 4px solid #f59e0b; margin: 12px 0; padding: 4px 14px; background: #fffbeb; }
  mark { background: #fef08a; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>${bodyHtml}</body>
</html>`
}

export default function CourseMasterNotes({ courseTitle, modules, lessons }) {
  const { addNotification } = useNotifications()
  const [state, setState] = useState('idle') // idle | loading | done | error
  const [notes, setNotes] = useState('')
  const [stage, setStage] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [edited, setEdited] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  // Follow-up chat state (thread persists across refinements)
  const [chatThread, setChatThread] = useState([]) // [{ role, content }]
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState(null)
  const [chatRetryText, setChatRetryText] = useState(null)
  const chatListRef = useRef(null)

  const timersRef = useRef([])

  const prompt = useMemo(
    () => buildNotesPrompt({ courseTitle, modules, lessons }),
    [courseTitle, modules, lessons]
  )
  const followupPrompt = useMemo(
    () => buildFollowupPrompt({ courseTitle, modules, lessons }),
    [courseTitle, modules, lessons]
  )

  // Streams into BOTH the notes body (smooth in-place update) and the last
  // assistant message of the follow-up thread.
  const appendChunk = useCallback((chunk) => {
    setNotes((prev) => prev + chunk)
    setChatThread((prev) => {
      if (!prev.length) return prev
      const copy = [...prev]
      const last = { ...copy[copy.length - 1] }
      if (last.role !== 'assistant') return prev
      last.content = (last.content || '') + chunk
      copy[copy.length - 1] = last
      return copy
    })
  }, [])
  const { enqueue, start, stop, flush, clear: clearPump } = useSmoothStream(appendChunk)

  const schedule = (fn, ms) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id)
      fn()
    }, ms)
    timersRef.current.push(id)
  }

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => () => timersRef.current.forEach(clearTimeout), [])

  // Keep the follow-up chat scrolled to the newest message.
  useEffect(() => {
    chatListRef.current?.scrollTo({ top: chatListRef.current.scrollHeight, behavior: 'smooth' })
  }, [chatThread, chatLoading])

  const generate = async () => {
    clearPump()
    clearTimers()
    setState('loading')
    setNotes('')
    setStage(0)
    setError(null)
    setIsEditing(false)
    setChatThread([])
    setChatInput('')
    setChatLoading(false)
    setChatError(null)
    setChatRetryText(null)
    start()

    let movedTo50 = false
    try {
      const res = await streamAIReply({
        messages: [{ role: 'system', content: prompt }],
        maxTokens: 2000,
        model: MASTER_NOTES_MODEL,
        onDelta: (delta) => {
          if (!movedTo50) {
            movedTo50 = true
            setStage(50)
          }
          enqueue(delta)
        },
      })

      flush()
      stop()

      if (res.ok) {
        addNotification({
          type: 'ai',
          title: 'AI Tutor',
          message: 'Your Overall Course Master Notes are ready for download.',
          link: null,
        })
        setStage(90)
        schedule(() => setStage(100), 400)
        schedule(() => setState('done'), 900)
      } else {
        // Every model in the queue failed consecutively — only now do we
        // surface an end-user error.
        setError('AI Tutor is busy — every model is unavailable right now. Give it a few seconds and tap "Try Again" below.')
        setState('error')
      }
    } catch {
      stop()
      clearPump()
      setError('Network error — check your connection and try again.')
      setState('error')
    }
  }

  // Follow-up: sends the CURRENT notes + the learner's request, streams the
  // refined notes back into both the body and the chat thread.
  const followUp = async (override) => {
    const text = (override ?? chatInput).trim()
    if (!text || chatLoading || state !== 'done') return
    const currentNotes = notes
    setChatInput('')
    setChatError(null)
    setChatRetryText(null)
    clearPump()
    clearTimers()
    setStage(0)
    setChatLoading(true)
    setIsEditing(false)
    setNotes('')

    const updated = [...chatThread, { role: 'user', content: text }]
    setChatThread([...updated, { role: 'assistant', content: '' }])
    start()

    let movedTo50 = false
    try {
      const res = await streamAIReply({
        messages: [
          { role: 'system', content: followupPrompt },
          {
            role: 'user',
            content: `CURRENT COURSE MASTER NOTES (rewrite these applying the request below):\n\n${currentNotes}\n\nLEARNER REQUEST: ${text}`,
          },
        ],
        maxTokens: 2000,
        model: MASTER_NOTES_MODEL,
        onDelta: (delta) => {
          if (!movedTo50) {
            movedTo50 = true
            setStage(50)
          }
          enqueue(delta)
        },
      })

      flush()
      stop()

      if (res.ok) {
        setStage(90)
        schedule(() => setStage(100), 400)
        schedule(() => setChatLoading(false), 900)
      } else {
        // Every model in the queue failed consecutively — only now do we
        // surface an end-user error.
        setChatError('AI Tutor is busy — every model is unavailable right now. Give it a few seconds and tap "Retry" below.')
        setChatRetryText(text)
        setChatThread((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = {
            role: 'assistant',
            content: 'The AI queue is busy right now — every model is unavailable. Your notes were not changed. Tap Retry to try again.',
          }
          return copy
        })
        setChatLoading(false)
      }
    } catch {
      stop()
      clearPump()
      setChatError('Network error — check your connection and try again.')
      setChatThread((prev) => {
        const copy = [...prev]
        copy[copy.length - 1] = {
          role: 'assistant',
          content: 'Connection error. Your notes were not changed. Please check your network and try again.',
        }
        return copy
      })
      setChatLoading(false)
    }
  }

  const copyNotes = async () => {
    try {
      await navigator.clipboard.writeText(toPlainText(notes))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable
    }
  }

  const openPrintWindow = (autoPrint) => {
    const bodyHtml = renderToStaticMarkup(<AiMarkdown content={notes} />)
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) return
    printWindow.document.open()
    printWindow.document.write(buildPrintHtml(courseTitle, bodyHtml))
    printWindow.document.close()
    printWindow.focus()
    if (autoPrint) setTimeout(() => printWindow.print(), 400)
  }

  const downloadTxt = () => {
    const blob = new Blob([`${courseTitle} — Course Master Notes\n\n${toPlainText(notes)}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${courseTitle.replace(/\s+/g, '-')}-Course-Master-Notes.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const startEditing = () => {
    setEdited(notes)
    setIsEditing(true)
  }

  const saveEditing = () => {
    setNotes(edited)
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      followUp()
    }
  }

  const toolbarButton = (title, onClick, children) => (
    <button
      key={title}
      onClick={onClick}
      title={title}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-all hover:border-sky-500/50 hover:text-sky-600 dark:border-slate-700 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:text-cyan-300"
    >
      {children}
    </button>
  )

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0f1420]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/25">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">Overall Course Master Notes</p>
            <p className="truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {courseTitle} · {lessons?.length || 0} lessons · complete study material for the whole course
            </p>
          </div>
        </div>

        {/* Toolbar: Inline Edit · Copy · Print · Download (.txt/.pdf) — always bound to the live notes */}
        {state === 'done' && !isEditing && !chatLoading && (
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {toolbarButton('Inline Edit', startEditing, <><Edit2 className="h-3 w-3" /> Edit</>)}
            {toolbarButton(copied ? 'Copied!' : 'Copy Notes', copyNotes, copied
              ? <><Check className="h-3 w-3 text-emerald-500" /> Copied</>
              : <><Copy className="h-3 w-3" /> Copy</>)}
            {toolbarButton('Print Notes', () => openPrintWindow(true), <><Printer className="h-3 w-3" /> Print</>)}
            {toolbarButton('Download .txt', downloadTxt, <><Download className="h-3 w-3" /> .txt</>)}
            {toolbarButton('Download PDF', () => openPrintWindow(true), <><FileText className="h-3 w-3" /> PDF</>)}
          </div>
        )}

        {state === 'done' && isEditing && (
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={saveEditing}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-emerald-400"
            >
              <Check className="h-3 w-3" /> Save
            </button>
            <button
              onClick={() => { setEdited(notes); setIsEditing(false) }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-all hover:border-rose-500/50 hover:text-rose-500 dark:border-slate-700 dark:text-slate-300"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {state === 'idle' && (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <p className="max-w-lg text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Generate a complete, structured study pack for the entire course — module-by-module breakdown,
              key formulas, quick reference cheat sheet, common pitfalls and an exam-ready checklist.
              You can then edit, copy, print, download or refine it with follow-up chat.
            </p>
            <button
              onClick={generate}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-400 hover:to-teal-500"
            >
              📝 Generate Course Master Notes
            </button>
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              <Loader2 className="h-3 w-3 text-emerald-500" /> Powered by OpenRouter · {AI_MODEL}
            </p>
          </div>
        )}

        {state === 'loading' && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-4 dark:bg-emerald-500/10">
            <AiStageLoader stage={stage} />
          </div>
        )}

        {state === 'done' && (
          <>
            {/* Live notes body — updates smoothly during chat refinements */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-[#0B0F17]">
              {isEditing ? (
                <textarea
                  value={edited}
                  onChange={(e) => setEdited(e.target.value)}
                  className="custom-scrollbar min-h-[320px] w-full resize-y rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs leading-relaxed text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  spellCheck={false}
                />
              ) : chatLoading && !notes ? (
                <AiStageLoader stage={stage} />
              ) : (
                <>
                  <AiMarkdown content={notes} />
                  {chatLoading && <AiStageLoader stage={stage} compact />}
                </>
              )}
            </div>

            {/* Follow-up chat — same design as the Topic AI chat box */}
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/50">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Refine Your Notes</span>
              </div>

              {chatThread.length > 0 && (
                <div
                  ref={chatListRef}
                  className="custom-scrollbar max-h-[40vh] space-y-3 overflow-y-auto bg-slate-50/70 px-4 py-3 dark:bg-[#0B0F17]"
                >
                  {chatThread.map((msg, i) => {
                    if (msg.role === 'user') {
                      return (
                        <div key={i} className="flex justify-end">
                          <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-none bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2.5 text-xs leading-relaxed text-white shadow-md shadow-emerald-600/10">
                            {msg.content}
                          </div>
                        </div>
                      )
                    }
                    const isEmptyLoading = i === chatThread.length - 1 && chatLoading && msg.content === ''
                    return (
                      <div key={i} className="flex justify-start">
                        <div className="mr-auto w-full max-w-[96%] rounded-2xl rounded-tl-none border border-slate-200 bg-white px-3.5 py-3 text-xs leading-relaxed text-slate-700 shadow-sm dark:border-slate-800 dark:bg-[#1E293B] dark:text-slate-200">
                          {isEmptyLoading ? (
                            <AiStageLoader stage={stage} />
                          ) : (
                            <>
                              <AiMarkdown content={msg.content} />
                              {i === chatThread.length - 1 && chatLoading && <AiStageLoader stage={stage} compact />}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {chatError && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-[11px] text-amber-700 dark:text-amber-300">
                      <p>{chatError}</p>
                      {chatRetryText && (
                        <button
                          onClick={() => followUp(chatRetryText)}
                          disabled={chatLoading}
                          className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 font-semibold text-white transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {chatLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                          Retry
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-slate-200 p-3 dark:border-slate-800">
                <div className="relative flex w-full items-center">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={'Ask to refine the notes... e.g. "make it more concise", "add key terms"'}                    
                    disabled={chatLoading || isEditing}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-14 text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-[#07090e] dark:text-white"
                  />
                  <button
                    onClick={() => followUp()}
                    disabled={!chatInput.trim() || chatLoading || isEditing}
                    className="absolute right-1.5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/10 transition-all hover:from-emerald-500 hover:to-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {chatLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                  <Sparkles className="h-3 w-3 text-emerald-500" />
                  Ask anything — the notes update in place and the toolbar always reflects the latest version
                </p>
              </div>
            </div>
          </>
        )}

        {state === 'error' && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-600 dark:text-rose-300">
            <p>{error}</p>
            <button
              onClick={generate}
              disabled={state === 'loading'}
              className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 font-semibold text-white transition-all hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
