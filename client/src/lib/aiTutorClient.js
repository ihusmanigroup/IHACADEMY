import { useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// Shared OpenRouter AI client — the SINGLE source of truth for every AI
// surface in the app:
//   - Internship Portal "Ask Alex" (AIMentor.jsx)
//   - Site AI assistant (AIChatModal.jsx)
//   - Paid Course AI: Topic Explanations (AiLessonChat.jsx)
//   - Paid Course AI: Course Master Notes (CourseMasterNotes.jsx)
//
// Zero-downtime policy: every request goes through the unified model queue
// below. Each attempt has a 10-second watchdog timeout; any HTTP error
// (400/404/429/500/...) or hang aborts that attempt and the client silently
// auto-switches to the next model. Only when EVERY model in the queue fails
// does the caller surface an end-user error.
// ---------------------------------------------------------------------------

export const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
// The key must be VITE_-prefixed to reach the browser bundle. Accept the bare
// name too as a safety net for local setups that expose it manually.
export const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.OPENROUTER_API_KEY || ''
export const AI_MODEL = import.meta.env.VITE_AI_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free'

// Unified model priority queue (primary model first, then these fallbacks).
// Every id below is a verified live OpenRouter :free model — no paid models,
// so a missing credit balance can never break the tutor. Order reflects
// real-world availability tests (strongest reliable responder first).
export const FALLBACK_MODELS = [
  'poolside/laguna-s-2.1:free',
  'dots-studio/dots-3-note-preview:free',
  'z-ai/glm-5.2:free',
  'google/gemma-4-31b-it:free',
  'cohere/north-mini-code:free',
  'liquid/lfm-2.5-2.6b:free',
]

// Backwards-compatible alias (older consumers used this name).
export const AI_FALLBACK_MODELS = FALLBACK_MODELS

// Per-attempt watchdog: if a model produces no data for this long, abort it
// and auto-switch to the next model. The timer resets on every received chunk,
// so a model that is actively streaming is never killed mid-answer.
const REQUEST_TIMEOUT_MS = 10000

// Cleans up AI output: converts stray HTML (<br> etc.) into real newlines,
// removes leftover tags, and normalizes spacing so text renders cleanly.
export function cleanAiText(raw) {
  let t = raw || ''
  t = t.replace(/<br\s*\/?>/gi, '\n')
  t = t.replace(/<\/(?:p|div|li|h1|h2|h3|h4|pre|code|span|strong|em|blockquote|details|summary)>/gi, '\n')
  t = t.replace(/<(?:p|div|li|h1|h2|h3|h4|pre|code|span|strong|em|blockquote|details|summary)[^>]*>/gi, '')
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
export function prettifyMarkdown(raw) {
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

// Smooth streaming: incoming deltas accumulate in a ref, then a
// requestAnimationFrame loop releases them a few characters at a time so the
// answer visibly types out even when the provider sends big chunks at once.
export function useSmoothStream(onChunk) {
  const pendingRef = useRef('')
  const rafRef = useRef(null)
  const onChunkRef = useRef(onChunk)
  onChunkRef.current = onChunk

  const pump = () => {
    rafRef.current = requestAnimationFrame(pump)
    const pending = pendingRef.current
    if (!pending) return
    const take = Math.min(pending.length, 3)
    if (!take) return
    pendingRef.current = pending.slice(take)
    onChunkRef.current(pending.slice(0, take))
  }

  const enqueue = (text) => {
    pendingRef.current += text
  }

  const start = () => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(pump)
  }

  const stop = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const flush = () => {
    const p = pendingRef.current
    if (p) {
      pendingRef.current = ''
      onChunkRef.current(p)
    }
  }

  const clear = () => {
    pendingRef.current = ''
    stop()
  }

  useEffect(() => () => stop(), []) // eslint-disable-line react-hooks/exhaustive-deps

  return { enqueue, start, stop, flush, clear }
}

async function streamOnce(model, messages, maxTokens, onDelta) {
  const controller = new AbortController()
  // Watchdog: aborts the attempt when the model hangs (no data for 10s).
  let timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const kick = () => {
    clearTimeout(timer)
    timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  }
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages,
        stream: true,
      }),
    })

    if (!res.ok) {
      clearTimeout(timer)
      return { ok: false, status: res.status, errorText: await res.text() }
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let receivedContent = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      kick() // model is alive — reset the watchdog
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content || ''
          if (delta) {
            receivedContent = true
            onDelta(delta)
          }
        } catch {
          // skip malformed stream chunk
        }
      }
    }

    clearTimeout(timer)
    // A 200 OK that streamed zero content is a dead/empty model payload —
    // treat it like a failure so the queue auto-switches to the next model
    // instead of leaving the user with a blank bubble.
    if (!receivedContent) return { ok: false, status: 200, errorText: 'Empty response from model' }
    return { ok: true }
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') return { ok: false, status: 408, errorText: 'Request timed out' }
    throw err
  }
}

// Resilient retry loop: tries the chosen primary model (or the env default)
// first, then walks the unified FALLBACK_MODELS queue one by one. Each attempt
// is guarded by the 10-second watchdog and every failure (timeout / 400 / 404 /
// 429 / 500 / any non-ok status) is logged silently and auto-switches to the
// next model. A short cooldown after a rate-limit (429) gives the free tier a
// beat to recover before the next model fires. Resolves { ok: true } the
// moment any model streams, and only returns { ok: false, status, errorText }
// when the whole queue is exhausted — callers render the end-user error only
// in that case.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function streamAIReply({ messages, maxTokens = 1200, onDelta, model }) {
  const primary = model || AI_MODEL
  const models = [primary, ...FALLBACK_MODELS.filter((m) => m !== primary)]
  let last = null

  for (let i = 0; i < models.length; i++) {
    const r = await streamOnce(models[i], messages, maxTokens, onDelta)
    if (r.ok) return { ok: true }
    last = r
    console.warn('Model failed, auto-switching...', models[i], r.status)
    if (r.status === 429) await sleep(700)
  }

  return { ok: false, status: last.status, errorText: last.errorText }
}

// Non-streaming sibling of streamAIReply — same queue, same watchdogs, but it
// buffers the full reply instead of streaming deltas. Used by features that
// need complete text up-front (e.g. code translation in lesson code blocks).
export async function completeAI({ messages, maxTokens = 1600, model }) {
  const primary = model || AI_MODEL
  const models = [primary, ...FALLBACK_MODELS.filter((m) => m !== primary)]
  let last = null

  for (let i = 0; i < models.length; i++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS * 3)
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: models[i], max_tokens: maxTokens, messages }),
      })
      clearTimeout(timer)

      if (!res.ok) {
        last = { status: res.status, errorText: await res.text() }
        console.warn('Model failed, auto-switching...', models[i], res.status)
        if (res.status === 429) await sleep(700)
        continue
      }

      const json = await res.json()
      const text = json?.choices?.[0]?.message?.content || ''
      if (!text.trim()) {
        last = { status: 200, errorText: 'Empty response from model' }
        continue
      }
      return { ok: true, text }
    } catch (err) {
      last = { status: err.name === 'AbortError' ? 408 : 0, errorText: err.message }
    }
  }

  return { ok: false, status: last?.status ?? 0, errorText: last?.errorText ?? 'All models failed' }
}
