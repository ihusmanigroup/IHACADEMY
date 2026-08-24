import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Bot, Zap, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

// ---------------------------------------------------------------------------
// CourseWorkspaceShell — 100% full-screen, distraction-free shell for every
// course workspace (Free + Paid). Rendered as a standalone route OUTSIDE the
// global DashboardLayout, so the app sidebar + topbar never appear.
//
// Layout:
//   fixed inset-0 z-[100] w-screen h-screen bg-slate-950 flex flex-col
//   ├─ 64px top bar (Exit → backTo, Course Title + Progress badge, XP + AI Tutor + avatar)
//   └─ h-[calc(100vh-64px)] flex
//       ├─ w-80 collapsible drawer (module tree — independently scrollable)
//       └─ flex-1 overflow-y-auto main content
// ---------------------------------------------------------------------------

export default function CourseWorkspaceShell({
  title,
  backTo = '/dashboard',
  backLabel = 'Exit Course',
  progressLabel,
  progressPct = 0,
  badges = null,
  drawer = null,
  aiTutorRef = null,
  contentRef = null,
  children,
}) {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [aiFlash, setAiFlash] = useState(false)

  const userInitial = (
    profile?.full_name?.[0] ||
    profile?.username?.[0] ||
    profile?.email?.[0] ||
    'U'
  ).toUpperCase()
  const xp = profile?.xp ?? 0

  const handleAiTutor = () => {
    if (aiTutorRef?.current) {
      aiTutorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setAiFlash(true)
      setTimeout(() => setAiFlash(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen bg-slate-100 dark:bg-[#080d1a] text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden transition-colors duration-200">
      {/* ─── TOP BAR (64px) ─── */}
      <header className="h-16 shrink-0 flex items-center gap-3 px-4 bg-white/95 dark:bg-[#080d1a]/95 border-b border-slate-200 dark:border-slate-800 z-30 backdrop-blur">
        {/* Left — Exit + drawer toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate(drawer ? (drawerOpen ? '/dashboard' : backTo) : backTo)}
            title={backLabel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> {backLabel}
          </button>
          {drawer && (
            <button
              onClick={() => setDrawerOpen((o) => !o)}
              title={drawerOpen ? 'Hide module tree' : 'Show module tree'}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              {drawerOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Center — Course title + progress badge */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-full leading-tight">
            {title}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap justify-center">
            {progressLabel && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                {progressPct > 0 && (
                  <span className="w-8 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden inline-block">
                    <span
                      className="block h-full bg-sky-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                    />
                  </span>
                )}
                {progressLabel}
              </span>
            )}
            {badges}
          </div>
        </div>

        {/* Right — XP + AI Tutor toggle + avatar */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" /> {xp.toLocaleString()} XP
          </span>
          {aiTutorRef && (
            <button
              onClick={handleAiTutor}
              title="Jump to AI Tutor"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                aiFlash
                  ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/30'
                  : 'text-sky-600 dark:text-sky-400 border-sky-500/30 hover:bg-sky-500/10'
              }`}
            >
              <Bot className="w-4 h-4" /> <span className="hidden sm:inline">AI Tutor</span>
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-black uppercase">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              userInitial
            )}
          </div>
        </div>
      </header>

      {/* ─── BODY — centered 12-col grid (module tree col-span-3 / content col-span-9) ─── */}
      <div className="flex-1 min-h-0 flex justify-center">
        <div className="w-full max-w-[1600px] h-full min-h-0 grid grid-cols-1 lg:grid-cols-12">
          {drawer && drawerOpen && (
            <aside className="lg:col-span-3 xl:col-span-3 min-w-0 h-full overflow-y-auto custom-scrollbar border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0E14]">
              {drawer}
            </aside>
          )}

          <main
            ref={contentRef}
            className={`min-w-0 h-full overflow-y-auto custom-scrollbar bg-slate-100 dark:bg-[#080d1a] transition-colors duration-200 ${
              drawer && drawerOpen ? 'lg:col-span-9 xl:col-span-9' : 'lg:col-span-12'
            }`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
