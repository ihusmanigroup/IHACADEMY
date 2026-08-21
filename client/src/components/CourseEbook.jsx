import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookMarked, Download, Lock, ChevronDown, Printer, Crown, FileText, Sparkles,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// CourseEbook — "Exclusive PDF eBooks access" Pro perk.
//
// Renders the course's full textbook content as a book-style reader inside the
// course workspace. Free-plan users see a blurred preview + upgrade CTA; Pro
// and Exclusive members get the complete read/download view. The PDF download
// is produced client-side via a print-to-PDF window, so no static asset needs
// to ship in the bundle.
// ---------------------------------------------------------------------------

function inlineBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  )
}

function EbookRichText({ text }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-2.5 whitespace-pre-wrap">
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={i} className="h-1" />
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          return (
            <div key={i} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 shrink-0" />
              <p className="text-sm md:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
                {inlineBold(trimmed.replace(/^[-•] /, ''))}
              </p>
            </div>
          )
        }
        return (
          <p key={i} className="text-sm md:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed">
            {inlineBold(trimmed)}
          </p>
        )
      })}
    </div>
  )
}

// Plain-text escape used to build the print-to-PDF document.
function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*/g, '')
}

function plainText(content) {
  return escapeHtml(content || '')
}

function buildPdfDocument(course, flatLessons) {
  const modules = course?.modules || []
  const meta = course?.ebook || {}
  const chapters = modules
    .map((m) => {
      const lessons = flatLessons.filter((l) => l.moduleId === m.id)
      const lessonsHtml = lessons
        .map(
          (l) => `
          <div class="lesson">
            <h3>${l.id}. ${escapeHtml(l.title)}</h3>
            <div>${plainText(l.content)}</div>
          </div>`
        )
        .join('\n')
      return `
        <div class="chapter">
          <h2>Chapter ${m.number} — ${escapeHtml(m.title)}</h2>
          <p class="sub">${escapeHtml(m.summary || '')}</p>
          ${lessonsHtml}
        </div>`
    })
    .join('\n')
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(meta.title || course.title)}</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; color: #0f172a; margin: 48px; line-height: 1.6; }
  h1 { font-size: 28px; margin-bottom: 4px; }
  .meta { color: #64748b; font-size: 13px; margin-bottom: 32px; }
  .chapter { page-break-before: always; }
  .chapter h2 { color: #0369a1; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
  .chapter .sub { color: #475569; font-style: italic; }
  .lesson { margin: 16px 0; }
  .lesson h3 { color: #0f172a; font-size: 16px; }
  .lesson div { white-space: pre-wrap; font-size: 13px; color: #334155; }
</style>
</head>
<body>
  <h1>${escapeHtml(meta.title || course.title)}</h1>
  <div class="meta">${escapeHtml(meta.edition || '')} · ${meta.pages || flatLessons.length} pages · IH Academy Exclusive eBook</div>
  ${chapters}
</body>
</html>`
}

function downloadPdf(course, flatLessons) {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(buildPdfDocument(course, flatLessons))
  win.document.close()
  win.focus()
  win.document.title = 'IH Academy eBook'
  // Small delay so the browser lays out before the print dialog opens.
  setTimeout(() => win.print(), 400)
}

export default function CourseEbook({ course, flatLessons, locked }) {
  const [openChapter, setOpenChapter] = useState(0)
  const meta = course?.ebook || {}
  const modules = course?.modules || []
  const lessonCount = flatLessons?.length || 0

  if (locked) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f1420] shadow-sm dark:shadow-none animate-fade-in">
        {/* Blurred preview */}
        <div className="blur-sm select-none pointer-events-none" aria-hidden="true">
          <EbookCoverHeader course={course} meta={meta} lessonCount={lessonCount} />
          <div className="p-6 space-y-4">
            {modules.slice(0, 3).map((m) => (
              <div key={m.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 flex-1 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="h-2.5 rounded bg-slate-100 dark:bg-slate-800 mb-1.5" />
                <div className="h-2.5 rounded bg-slate-100 dark:bg-slate-800 mb-1.5" />
                <div className="h-2.5 rounded bg-slate-100 dark:bg-slate-800 w-3/4" />
              </div>
            ))}
          </div>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-white/70 dark:bg-[#0f1420]/75 backdrop-blur-[2px]">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-amber-500 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">eBook Locked — Pro Member Feature</h2>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 max-w-md leading-relaxed">
            <strong className="text-slate-700 dark:text-slate-300">{meta.title || course.title}</strong> is a {meta.pages || '100+'} page
            downloadable PDF. Upgrade to the Pro Plan to unlock the full eBook reader, PDF download and exclusive member perks.
          </p>
          <Link
            to="/pricing"
            className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer"
          >
            <Crown className="w-4 h-4" /> Upgrade to Pro to Unlock eBook
          </Link>
          <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Pro $70/yr · Exclusive $200/yr · Cancel anytime
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* eBook header + download actions */}
      <EbookCoverHeader course={course} meta={meta} lessonCount={lessonCount} />

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => downloadPdf(course, flatLessons)}
          className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-sky-500/20 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Download eBook (PDF)
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="w-3 h-3" /> Included in your {meta.edition || 'Pro'} membership
        </span>
      </div>

      {/* Chapter list */}
      <div className="bg-white dark:bg-[#0f1420] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Chapters</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{modules.length} chapters · {lessonCount} lessons</span>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800/60">
          {modules.map((m, idx) => {
            const lessons = flatLessons.filter((l) => l.moduleId === m.id)
            const open = openChapter === idx
            return (
              <div key={m.id}>
                <button
                  onClick={() => setOpenChapter(open ? -1 : idx)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                >
                  <span className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {m.number}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 truncate">Chapter {m.number} — {m.title}</span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">{lessons.length} lessons</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-sky-500' : ''}`} />
                </button>
                {open && (
                  <div className="px-5 pb-5 space-y-3">
                    {m.summary && <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">{m.summary}</p>}
                    {lessons.map((l) => (
                      <div key={l.id} className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/20">
                        <p className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                          <FileText className="w-3.5 h-3.5 text-sky-500 shrink-0" /> {l.id}. {l.title}
                        </p>
                        {l.content ? (
                          <div className="max-h-44 overflow-y-auto custom-scrollbar">
                            <EbookRichText text={l.content.slice(0, 2000)} />
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">Lesson content available in the reader.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function EbookCoverHeader({ course, meta, lessonCount }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-600 p-6 sm:p-8 shadow-lg shadow-sky-500/10 relative">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="relative flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-2 flex items-center gap-1.5">
            <BookMarked className="w-3.5 h-3.5" /> IH Academy Exclusive eBook
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">{meta.title || course.title}</h2>
          <p className="text-sm text-white/80 mt-2 max-w-2xl leading-relaxed">{course?.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-4 text-[11px] font-bold">
            <span className="px-2.5 py-1 rounded-full bg-white/15 text-white backdrop-blur-sm">{meta.pages || '100+'} pages</span>
            <span className="px-2.5 py-1 rounded-full bg-white/15 text-white backdrop-blur-sm">{meta.edition || '2026 Edition'}</span>
            <span className="px-2.5 py-1 rounded-full bg-white/15 text-white backdrop-blur-sm">{lessonCount} lessons</span>
            <span className="px-2.5 py-1 rounded-full bg-amber-400/90 text-amber-950 backdrop-blur-sm">Pro Exclusive</span>
          </div>
        </div>
      </div>
    </div>
  )
}
