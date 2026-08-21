import { useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Check, Copy } from 'lucide-react'

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false)

  let codeText = ''
  if (children && children.props && typeof children.props.children === 'string') {
    codeText = children.props.children
  } else if (children && children.props && Array.isArray(children.props.children)) {
    codeText = children.props.children.map((c) => (typeof c === 'string' ? c : '')).join('')
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700/70 dark:bg-[#0B0F17]">
      <button
        onClick={copyCode}
        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:text-sky-600 dark:bg-slate-800/90 dark:text-slate-300 dark:ring-slate-700 cursor-pointer"
      >
        {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-slate-800 dark:text-slate-100">{children}</pre>
    </div>
  )
}

// Chat-friendly pre-processing: a single line break between text lines should
// stay visible (Markdown collapses it), but fenced code blocks must be left
// untouched so the code fence keeps working.
function prettifyChat(content) {
  const lines = String(content || '').split('\n')
  let inFence = false
  const out = []
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      out.push(line)
      continue
    }
    // Inside a fence, or an empty line, keep verbatim.
    if (inFence || !line.trim()) {
      out.push(line)
      continue
    }
    // Outside a fence: append a hard-break marker so newlines render as breaks.
    out.push(`${line}  `)
  }
  return out.join('\n')
}

/**
 * Markdown renderer for Developer Hub chat messages. Supports inline + fenced
 * code (with a copy button), tables, lists and clickable links — reusing the
 * same code-block pattern as the AI Tutor (`AiMarkdown`).
 */
export default function CommunityContent({ content }) {
  const cleaned = useMemo(() => prettifyChat(content), [content])

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-sky-600 underline underline-offset-2 hover:text-sky-700 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            {children}
          </a>
        ),
        p: ({ children }) => <p className="mb-2 last:mb-0 text-pretty text-sm text-slate-700 dark:text-slate-200">{children}</p>,
        ul: ({ children }) => <ul className="my-1.5 space-y-1 pl-4">{children}</ul>,
        ol: ({ children }) => <ol className="my-1.5 list-decimal space-y-1 pl-4">{children}</ol>,
        li: ({ children }) => <li className="list-disc text-slate-700 dark:text-slate-200">{children}</li>,
        strong: ({ children }) => <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>,
        em: ({ children }) => <em className="italic text-slate-700 dark:text-slate-200">{children}</em>,
        code: ({ children }) => (
          <code className="rounded bg-sky-500/10 px-1.5 py-0.5 font-mono text-[11px] text-sky-700 dark:text-sky-300">
            {children}
          </code>
        ),
        pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        blockquote: ({ children }) => (
          <blockquote className="my-2 border-l-4 border-sky-300 bg-sky-50/70 px-3 py-1.5 dark:border-sky-500/50 dark:bg-sky-500/10">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-4 border-slate-200 dark:border-slate-700" />,
      }}
    >
      {cleaned}
    </ReactMarkdown>
  )
}