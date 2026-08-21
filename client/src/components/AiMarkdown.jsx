import { useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Check, Copy } from 'lucide-react'
import { prettifyMarkdown } from '../lib/aiTutorClient'

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

// Rich markdown renderer used by the Paid Course AI Tutor. Pre-processes the
// model output (stray HTML → newlines, "Step 1:" → headings) so answers always
// render cleanly.
export default function AiMarkdown({ content }) {
  const cleaned = useMemo(() => prettifyMarkdown(content), [content])

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="mt-4 mb-2 text-lg font-extrabold tracking-tight text-sky-700 dark:text-cyan-300">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-4 mb-1.5 text-base font-extrabold tracking-tight text-sky-700 dark:text-cyan-300">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-4 mb-1.5 text-sm font-extrabold tracking-tight text-sky-700 dark:text-cyan-300">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="mt-3 mb-1 text-sm font-bold text-slate-900 dark:text-white">{children}</h4>
        ),
        p: ({ children }) => <p className="mb-2 last:mb-0 text-pretty text-slate-700 dark:text-slate-200">{children}</p>,
        ul: ({ children }) => <ul className="my-1.5 space-y-1 pl-4">{children}</ul>,
        ol: ({ children }) => <ol className="my-1.5 list-decimal space-y-1 pl-4">{children}</ol>,
        li: ({ children }) => <li className="list-disc text-slate-700 dark:text-slate-200">{children}</li>,
        strong: ({ children }) => <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>,
        em: ({ children }) => <em className="italic text-slate-700 dark:text-slate-200">{children}</em>,
        mark: ({ children }) => (
          <mark className="rounded bg-yellow-200 px-1 font-semibold text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100">
            {children}
          </mark>
        ),
        pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        code: ({ children }) => (
          <code className="rounded bg-sky-500/10 px-1.5 py-0.5 font-mono text-[11px] text-sky-700 dark:text-sky-300">
            {children}
          </code>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-3 border-l-4 border-amber-500 bg-amber-50 pl-4 dark:bg-amber-900/20">
            <p className="italic text-amber-900 dark:text-amber-100">{children}</p>
          </blockquote>
        ),
        hr: () => <hr className="my-6 border-slate-200 dark:border-slate-700" />,
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto rounded-lg border border-slate-300 dark:border-slate-700">
            <table className="w-full text-xs">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-slate-100 dark:bg-slate-800">{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-slate-200 dark:border-slate-700">{children}</tr>,
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
