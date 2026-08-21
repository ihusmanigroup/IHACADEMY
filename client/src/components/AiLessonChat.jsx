import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Sparkles, Send, Loader2, RotateCcw, Trash2, Bot } from 'lucide-react'
import AiMarkdown from './AiMarkdown'
import AiStageLoader from './AiStageLoader'
import { streamAIReply, useSmoothStream, AI_MODEL } from '../lib/aiTutorClient'

// Exact guardrail reply for FUTURE topics — the AI must never answer questions
// about lessons that come after the current one.
export const TOPIC_GUARDRAIL_MESSAGE =
  'This question belongs to a future topic. Please focus on clearing your doubts for the current topic first. Once completed, navigate to that specific lesson to ask questions about it!'

function buildSystemPrompt({ courseTitle, topicId, topicTitle, lessons, currentLessonIndex }) {
  const order = (lessons || [])
    .map((l, i) => `${i + 1}. ${l.id} — ${l.title}${i === currentLessonIndex ? ' (CURRENT LESSON)' : ''}`)
    .join('\n')

  return [
    `You are the official IH Academy AI Tutor for the course "${courseTitle}".`,
    '',
    `CURRENT LESSON: "${topicId} — ${topicTitle}" (position ${currentLessonIndex + 1} of ${lessons.length}).`,
    '',
    'COMPLETE LESSON ORDER OF THIS COURSE (the learner studies these in order):',
    order,
    '',
    'STRICT TOPIC GUARDRAIL (the most important rule — NEVER violate it):',
    '- Questions about PAST lessons (lessons BEFORE the CURRENT LESSON in the order above) ARE allowed — answer them normally.',
    '- If the user asks about a FUTURE lesson (any lesson AFTER the CURRENT LESSON in the order above), do NOT answer it in any way. Do NOT preview, hint, summarize, or explain anything about future topics.',
    '- In that case reply with EXACTLY the following message and NOTHING else — no prefix, no quotes, no extra words:',
    `"${TOPIC_GUARDRAIL_MESSAGE}"`,
    '- If the user asks about something that is not part of this course at all, politely refuse and steer them back to the current lesson.',
    '',
    'LANGUAGE RULE (STRICT — COUNT THE WORDS IN THE USER\'S LAST MESSAGE):',
    '- DEFAULT: If the user\'s last message is in English (or was auto-sent by the "Explain in Simple Words" button), reply 100% in standard English.',
    '- Count the English words vs the Roman Urdu words in the user\'s last message. If MOST of the words are English (even if the message contains 1-2 Urdu words like karo, hai, bhai, haan), reply 100% IN ENGLISH. Example: "continue karo haan ya naa" is mostly English, so the whole reply must be in English.',
    '- Reply in SIMPLE Roman Urdu ONLY when the message is clearly majority Roman Urdu (for example "mujhe samajh nahi araha kya karna hai", "bhai karwao full code").',
    '- If the user writes in any other language (e.g. Urdu script, Arabic, Hindi), reply in that same language.',
    '- NEVER mix languages inside one reply. An English reply must NOT contain any Urdu words (no karo, haan, naa, bhai, hai, chahiye). A Roman Urdu reply must not contain long English sentences.',
    '- Code, commands, file names and technical terms are always written in English in both cases.',
    '- The future-topic guardrail message above is FIXED — always reply it exactly as written, in every language.',
    '',
    'EXPLANATION STYLE:',
    '- Explain the current lesson in extremely simple, easy-to-understand words. Break down complex jargon.',
    '- Use a short real-world analogy when it helps.',
    '- Keep the main explanation concise: 2-3 short paragraphs plus a few bullets.',
    '- Use clean Markdown ONLY: ## headings, **bold** for key terms, - bullets, numbered steps, `code` for technical terms, and ``` code blocks for code. NEVER use HTML tags.',
    '- Never write "Copy" or "Copy code" before a code block.',
    '- No emojis.',
    '',
    'FOLLOW-UP CONVERSATION:',
    '- Follow-up questions in this conversation are about the current lesson or past lessons — apply the same guardrail to them.',
    '- Keep the whole conversation in the same language as the user\'s latest message.',
  ].join('\n')
}

export default function AiLessonChat({ courseTitle, topicId, topicTitle, lessons, currentLessonIndex }) {
  const [started, setStarted] = useState(false)
  const [thread, setThread] = useState([]) // [{ role, content }] — persists across follow-ups
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState(0)
  const [error, setError] = useState(null)
  const [retryText, setRetryText] = useState(null)
  const listRef = useRef(null)
  const timersRef = useRef([])

  const systemPrompt = useMemo(
    () => buildSystemPrompt({ courseTitle, topicId, topicTitle, lessons, currentLessonIndex }),
    [courseTitle, topicId, topicTitle, lessons, currentLessonIndex]
  )

  const appendChunk = useCallback((chunk) => {
    setThread((prev) => {
      const copy = [...prev]
      const last = { ...copy[copy.length - 1] }
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

  // Reset the whole chat whenever the lesson (or course) changes so context
  // never leaks between topics.
  useEffect(() => {
    clearPump()
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setStarted(false)
    setThread([])
    setInput('')
    setLoading(false)
    setStage(0)
    setError(null)
    setRetryText(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemPrompt])

  useEffect(() => () => timersRef.current.forEach(clearTimeout), [])

  // Keep the latest message in view.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [thread, loading])

  const send = async (override) => {
    const text = (override ?? input).trim()
    if (!text || loading) return
    setInput('')
    setError(null)
    setRetryText(null)
    clearPump()
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setStage(0)
    setStarted(true)

    const updated = [...thread, { role: 'user', content: text }]
    setThread([...updated, { role: 'assistant', content: '' }])
    setLoading(true)
    start()

    let movedTo50 = false
    try {
      const res = await streamAIReply({
        messages: [{ role: 'system', content: systemPrompt }, ...updated],
        maxTokens: 1200,
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
        schedule(() => setLoading(false), 900)
      } else {
        // Every model in the queue failed consecutively — only now do we
        // surface an end-user error.
        setError('AI Tutor is busy — every model is unavailable right now. Give it a few seconds and tap "Retry" below.')
        setRetryText(text)
        setThread((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = {
            role: 'assistant',
            content: 'The AI queue is busy right now — every model is unavailable. Give it a few seconds and I\'ll resend it for you.',
          }
          return copy
        })
        setLoading(false)
      }
    } catch {
      stop()
      clearPump()
      setError('Network error — check your connection and try again.')
      setThread((prev) => {
        const copy = [...prev]
        copy[copy.length - 1] = {
          role: 'assistant',
          content: 'Connection error. Please check your network and try again.',
        }
        return copy
      })
      setLoading(false)
    }
  }

  const resetChat = () => {
    clearPump()
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setStarted(false)
    setThread([])
    setInput('')
    setLoading(false)
    setStage(0)
    setError(null)
    setRetryText(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  if (!started) {
    return (
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0f1420]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-md shadow-sky-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white">AI Tutor — {topicTitle}</p>
            <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Ask anything about this topic. Clear your doubts before moving to the next lesson.
            </p>
          </div>
        </div>
        <button
          onClick={() => send('Explain this topic in simple words.')}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:from-sky-400 hover:to-cyan-400"
        >
          ✨ AI: Explain in Simple Words
        </button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
          <Bot className="h-3 w-3 text-sky-500" /> Powered by OpenRouter · {AI_MODEL}
        </p>
      </div>
    )
  }

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0f1420]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">AI Tutor — {topicTitle}</p>
            <p className="truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">{courseTitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={resetChat}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white"
            title="Reset chat"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="custom-scrollbar max-h-[55vh] space-y-4 overflow-y-auto bg-slate-50/70 px-4 py-4 dark:bg-[#0B0F17]">
        {thread.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <div key={i} className="flex justify-end">
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-none bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-3 text-sm leading-relaxed text-white shadow-md shadow-sky-600/10">
                  {msg.content}
                </div>
              </div>
            )
          }
          const isEmptyLoading = i === thread.length - 1 && loading && msg.content === ''
          return (
            <div key={i} className="flex justify-start">
              <div className="mr-auto w-full max-w-[96%] rounded-2xl rounded-tl-none border border-slate-200 bg-white px-4 py-3.5 text-sm leading-relaxed text-slate-700 shadow-sm dark:border-slate-800 dark:bg-[#1E293B] dark:text-slate-200">
                {isEmptyLoading ? (
                  <AiStageLoader stage={stage} />
                ) : (
                  <>
                    <AiMarkdown content={msg.content} />
                    {i === thread.length - 1 && loading && <AiStageLoader stage={stage} compact />}
                  </>
                )}
              </div>
            </div>
          )
        })}

        {error && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300">
            <p>{error}</p>
            {retryText && (
              <button
                onClick={() => send(retryText)}
                disabled={loading}
                className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 font-semibold text-white transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      {/* Follow-up input — thread stays open so follow-ups keep the conversation */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="relative flex w-full items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a follow-up question about this topic..."
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-14 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-[#07090e] dark:text-white"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="absolute right-1.5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-cyan-500/10 transition-all hover:from-blue-500 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] font-medium text-slate-400 dark:text-slate-500">
          Ask only about this topic or topics you have already completed — future topics are not covered here.
        </p>
      </div>
    </div>
  )
}
