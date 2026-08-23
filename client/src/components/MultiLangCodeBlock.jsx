import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, ChevronDown, Code2, Copy, Loader2, RefreshCw, TriangleAlert } from 'lucide-react'
import { completeAI } from '../lib/aiTutorClient'

// ---------------------------------------------------------------------------
// MultiLangCodeBlock — universal lesson code viewer with a language switcher.
//
// The original snippet ships with the lesson (any language); every other tab
// is generated on demand by the shared OpenRouter queue (completeAI), then
// cached in localStorage keyed by content-hash + target language so each
// translation is computed only once per browser. If every model fails, the
// block keeps showing the original code with a clean retry banner instead of
// breaking the lesson.
// ---------------------------------------------------------------------------

const LANGS = [
  { id: 'python', label: 'Python', ext: '.py' },
  { id: 'javascript', label: 'JavaScript', ext: '.js' },
  { id: 'cpp', label: 'C++', ext: '.cpp' },
  { id: 'java', label: 'Java', ext: '.java' },
]

const LANG_NAMES = {
  python: 'Python',
  javascript: 'JavaScript',
  js: 'JavaScript',
  cpp: 'C++',
  'c++': 'C++',
  cxx: 'C++',
  java: 'Java',
  c: 'C',
  cs: 'C#',
  go: 'Go',
  rust: 'Rust',
  php: 'PHP',
  ruby: 'Ruby',
  sql: 'SQL',
  bash: 'Bash',
  sh: 'Shell',
  html: 'HTML',
  css: 'CSS',
}

export const normalizeLang = (lang) =>
  LANG_NAMES[String(lang || '').toLowerCase()] || String(lang || 'Code')

// Best-effort source-language detection when a caller doesn't know it.
export function detectLanguage(code = '') {
  const c = String(code)
  if (/^\s*#include|std::/m.test(c)) return 'cpp'
  if (/\bpublic\s+static\s+void\s+main|System\.out\.print/.test(c)) return 'java'
  if (/\b(function\b|=>|const\s+\w+\s*=|console\.(log|error)|require\(|module\.exports)/.test(c)) return 'javascript'
  if (/\b(def\s+\w+\s*\(|import\s+\w+|from\s+\w+\s+import|print\s*\()/m.test(c)) return 'python'
  if (/\bprintf\s*\(|\bint\s+main\s*\(/.test(c)) return 'cpp'
  return 'python'
}

// djb2 — small stable hash so the cache key survives page reloads.
function hashCode(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0
  return h.toString(36)
}

const CACHE_KEY = 'ih_code_translations_v1'

function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveCacheEntry(key, value) {
  try {
    const cache = loadCache()
    cache[key] = value
    // Keep the cache bounded — drop the oldest third when it grows huge.
    const keys = Object.keys(cache)
    if (keys.length > 120) {
      keys.slice(0, Math.floor(keys.length / 3)).forEach((k) => delete cache[k])
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // storage unavailable — translations just won't persist
  }
}

// Models love wrapping answers in prose/fences — strip everything back to the
// raw code body.
function extractCode(text) {
  let t = String(text || '').trim()
  const fence = t.match(/```[a-zA-Z0-9+#]*\s*\n([\s\S]*?)```/)
  if (fence) return fence[1].trimEnd()
  if (t.startsWith('```')) return t.replace(/^```[a-zA-Z0-9+#]*\s*\n?/, '').replace(/```\s*$/, '').trimEnd()
  return t
}

async function translateCode(code, fromLang, toLangId, signal) {
  const toName = LANGS.find((l) => l.id === toLangId)?.label || toLangId
  const res = await completeAI({
    maxTokens: 2400,
    messages: [
      {
        role: 'system',
        content:
          'You are an expert code translation engine for a programming academy. ' +
          'Translate the given code into the requested target language with production-quality idioms. ' +
          'Preserve the logic exactly, translate inline comments into concise English, and keep the same ' +
          'teaching clarity (simple variable names, short helper comments where the original had them). ' +
          'Respond with ONE fenced code block containing ONLY the translated code — no explanations before or after.',
      },
      {
        role: 'user',
        content: `Translate this ${fromLang} code to ${toName}:\n\n\`\`\`\n${code}\n\`\`\``,
      },
    ],
  })
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  if (!res.ok) throw new Error(res.errorText || 'All models failed')
  const out = extractCode(res.text)
  if (!out.trim()) throw new Error('Empty translation')
  return out
}

export default function MultiLangCodeBlock({ code, language, title }) {
  const sourceLang = LANGS.some((l) => l.id === language) ? language : detectLanguage(code)
  const [active, setActive] = useState(sourceLang)
  const [snippets, setSnippets] = useState(() => ({ [sourceLang]: code }))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const abortRef = useRef(null)

  const cacheKeyBase = `${hashCode(code)}_${sourceLang}`

  // Reset everything when a different lesson snippet arrives.
  useEffect(() => {
    setActive(sourceLang)
    setSnippets({ [sourceLang]: code })
    setError(null)
    setLoading(false)
  }, [code, sourceLang])

  useEffect(() => () => abortRef.current?.abort(), [])

  const ensureTranslation = useCallback(
    async (target) => {
      if (snippets[target]) return
      const cached = loadCache()[`${cacheKeyBase}_${target}`]
      if (cached) {
        setSnippets((prev) => ({ ...prev, [target]: cached }))
        return
      }
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)
      setError(null)
      try {
        const fromName = LANGS.find((l) => l.id === sourceLang)?.label || sourceLang
        const translated = await translateCode(code, fromName, target, controller.signal)
        setSnippets((prev) => ({ ...prev, [target]: translated }))
        saveCacheEntry(`${cacheKeyBase}_${target}`, translated)
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Translation failed')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    },
    [cacheKeyBase, code, snippets, sourceLang]
  )

  const switchLang = (id) => {
    if (id === active || loading) return
    setActive(id)
    setError(null)
    if (!snippets[id]) ensureTranslation(id)
  }

  const retry = () => {
    setError(null)
    ensureTranslation(active)
  }

  const copyCurrent = async () => {
    try {
      await navigator.clipboard.writeText(snippets[active] || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const shown = snippets[active]
  const showSourceFallback = !shown && !loading

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-[#0B0F17] shadow-lg shadow-slate-950/10">
      {/* Header — language tabs + copy */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 bg-[#151D2A] px-3 py-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1">
          <span className="mr-1.5 hidden items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:inline-flex">
            <Code2 className="h-3.5 w-3.5 text-sky-400" /> {title || 'Code'}
          </span>
          {LANGS.map((l) => (
            <button
              key={l.id}
              onClick={() => switchLang(l.id)}
              disabled={loading}
              className={`rounded-md px-2 py-1 text-[11px] font-bold transition-all cursor-pointer disabled:cursor-not-allowed ${
                active === l.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-200'
              }`}
              title={l.id === sourceLang ? `Original (${l.label})` : `View in ${l.label} (auto-translated)`}
            >
              {l.label}
              {l.id === sourceLang && (
                <span className={`ml-1 rounded px-1 text-[8px] font-black uppercase ${active === l.id ? 'bg-white/20' : 'bg-sky-500/15 text-sky-400'}`}>
                  orig
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={copyCurrent}
          className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-sky-400 transition-colors hover:text-sky-300 cursor-pointer"
        >
          {copied ? (
            <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Copied!</>
          ) : (
            <><Copy className="h-3.5 w-3.5" /> Copy</>
          )}
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          <p className="text-xs font-semibold text-slate-400">Generating {LANGS.find((l) => l.id === active)?.label} version…</p>
          <p className="text-[11px] text-slate-500">Powered by the IH Academy AI engine</p>
        </div>
      ) : showSourceFallback ? (
        <pre className="custom-scrollbar overflow-x-auto p-4 font-mono text-xs leading-relaxed whitespace-pre text-slate-100 md:text-[13px]">
          {code}
        </pre>
      ) : (
        <pre className="custom-scrollbar overflow-x-auto p-4 font-mono text-xs leading-relaxed whitespace-pre text-slate-100 md:text-[13px]">
          {shown}
        </pre>
      )}

      {/* Footer status */}
      {(error || (shown && active !== sourceLang)) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-[#0E1420] px-4 py-2">
          {error ? (
            <>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
                <TriangleAlert className="h-3.5 w-3.5" /> Couldn't generate {LANGS.find((l) => l.id === active)?.label} version right now — showing original below.
              </p>
              <button
                onClick={retry}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-400 transition-colors hover:bg-amber-500/25 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            </>
          ) : (
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <ChevronDown className="h-3 w-3" /> Auto-translated by AI — original {LANGS.find((l) => l.id === sourceLang)?.label} version stays available on its tab.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
