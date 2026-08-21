import { useState } from 'react'
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Briefcase, Award,
   Zap, ChevronLeft, ChevronRight, Sparkles, HelpCircle, Swords,
   Trophy, MessageSquare, CreditCard, ReceiptText,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AIChatModal from './AIChatModal'
import UserDropdown from './UserDropdown'
import NotificationBell from './NotificationBell'

const navSections = [
  {
    label: 'Learning & Practice',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
      { icon: BookOpen, label: 'Courses Catalog', to: '/courses' },
       { icon: Swords, label: 'Coding Arena', to: '/challenges' },
    ],
  },
  {
    label: 'Careers & Credentials',
    items: [
      { icon: Briefcase, label: 'Careers & Internships', to: '/careers' },
      { icon: CreditCard, label: 'Pricing & Plans', to: '/pricing' },
      { icon: Award, label: 'Certifications', to: '/certifications' },
    ],
  },
  {
    label: 'Community & Ranks',
    items: [
      { icon: Trophy, label: 'Global Leaderboard', to: '/leaderboard' },
      { icon: MessageSquare, label: 'Developer Community', to: '/community' },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: ReceiptText, label: 'Billing & Purchases', to: '/dashboard/billing' },
      { icon: HelpCircle, label: 'Help & Support', to: '/help' },
    ],
  },
]

export default function DashboardLayout() {
  const { pathname } = useLocation()
  const { profile } = useAuth()
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="min-h-screen flex flex-col w-full bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 transition-colors duration-200">

      {/* Top Section — Sidebar + Content */}
      <div className="flex flex-1 min-w-0 items-stretch">
      {/* ─── SIDEBAR ─── */}
      <aside
        className={`h-full min-h-screen sticky top-0 flex-shrink-0 transition-all duration-300 ease-in-out flex flex-col bg-gradient-to-b from-[#081325] via-[#0c1e38] to-[#070f1e] border-r border-sky-900/40 text-slate-200 shadow-2xl z-30 ${isCollapsed ? 'w-16 px-2' : 'w-64 px-4'}`}
      >
        {/* Sidebar Header */}
        <div className={`flex items-center h-16 shrink-0 border-b border-sky-900/40 transition-colors duration-300 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
          {isCollapsed ? (
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-md flex items-center justify-center text-black font-bold text-sm border border-sky-500/30 shadow-lg shadow-sky-500/10">IH</div>
          ) : (
            <>
              <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-md flex items-center justify-center text-black font-bold text-sm border border-sky-500/30 shadow-lg shadow-sky-500/10">IH</div>
                <span className="font-bold text-slate-100">IH Academy</span>
              </Link>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-500/10 transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {isCollapsed && (
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-500/10 transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Navigation — scrollable middle, logo pinned top, Help & Support pinned bottom */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="py-1 flex-1 overflow-y-auto custom-scrollbar">
            {navSections.filter((s) => s.label !== 'System').map((section) => (
              <div key={section.label}>
                {!isCollapsed && (
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 px-3 mt-5 mb-2">
                    {section.label}
                  </p>
                )}
                <nav className={`${isCollapsed ? 'px-1 py-1' : 'px-1 py-1'} space-y-0.5`}>
                  {section.items.map((item) => (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      end={item.to === '/dashboard'}
                      title={isCollapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `flex items-center rounded-xl transition-all cursor-pointer text-sm font-medium my-1 ${
                          isCollapsed ? 'justify-center px-0 py-3.5' : 'justify-start gap-3 px-3 py-2.5'
                        } ${
                          isActive
                            ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(14,165,233,0.4)] rounded-xl'
                            : 'text-slate-200 hover:bg-sky-500/10 hover:text-sky-300 transition-all duration-200'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          {/* Sidebar Bottom Filler — Daily Goal widget */}
          {!isCollapsed && (
            <div className="mx-3 my-4 p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 shadow-lg shadow-sky-500/10 text-xs shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sky-100">Daily Goal</span>
                <span className="text-[10px] text-sky-400 font-mono font-bold">1 / 3 Solved</span>
              </div>
              <div className="w-full h-1.5 bg-sky-900/50 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full w-[33%]" />
              </div>
            </div>
          )}

          {/* Help & Support — pinned to the bottom footer */}
          <div className="shrink-0 pb-1 mt-auto border-t border-sky-900/40 pt-4">
            {isCollapsed ? (
              <div className="flex justify-center py-1 space-y-1">
                <NavLink
                  to="/dashboard/billing"
                  title="Billing & Purchases"
                  className={({ isActive }) =>
                    `flex items-center justify-center rounded-xl transition-all cursor-pointer p-2.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(14,165,233,0.4)] rounded-xl'
                        : 'text-slate-200 hover:bg-sky-500/10 hover:text-sky-300 transition-all duration-200'
                    }`
                  }
                >
                  <ReceiptText className="w-5 h-5 shrink-0" />
                </NavLink>
                <NavLink
                  to="/help"
                  title="Help & Support"
                  className={({ isActive }) =>
                    `flex items-center justify-center rounded-xl transition-all cursor-pointer p-2.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(14,165,233,0.4)] rounded-xl'
                        : 'text-slate-200 hover:bg-sky-500/10 hover:text-sky-300 transition-all duration-200'
                    }`
                  }
                >
                  <HelpCircle className="w-5 h-5 shrink-0" />
                </NavLink>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 px-3 mt-5 mb-2">
                  System
                </p>
                <nav className="px-1 py-1 space-y-0.5">
                  <NavLink
                    to="/dashboard/billing"
                    className={({ isActive }) =>
                      `flex items-center justify-start gap-3 rounded-xl transition-all cursor-pointer text-sm font-medium py-2.5 px-3 my-1 ${
                        isActive
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(14,165,233,0.4)] rounded-xl'
                          : 'text-slate-200 hover:bg-sky-500/10 hover:text-sky-300 transition-all duration-200'
                      }`
                    }
                  >
                    <ReceiptText className="w-5 h-5 shrink-0" />
                    <span>Billing & Purchases</span>
                  </NavLink>
                  <NavLink
                    to="/help"
                    className={({ isActive }) =>
                      `flex items-center justify-start gap-3 rounded-xl transition-all cursor-pointer text-sm font-medium py-2.5 px-3 my-1 ${
                        isActive
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(14,165,233,0.4)] rounded-xl'
                          : 'text-slate-200 hover:bg-sky-500/10 hover:text-sky-300 transition-all duration-200'
                      }`
                    }
                  >
                    <HelpCircle className="w-5 h-5 shrink-0" />
                    <span>Help & Support</span>
                  </NavLink>
                </nav>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <main className="flex-1 min-w-0 flex flex-col bg-slate-50 dark:bg-[#090d16] transition-all duration-300 ease-in-out">
        <header className="sticky top-0 z-30 bg-white dark:bg-[#090D16] border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200 px-6 md:px-8 py-3 flex items-center justify-end shrink-0">
          <div className="flex items-center gap-3">
            <NotificationBell />

            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all duration-300">
              <Zap className="w-3.5 h-3.5" /> {profile?.xp ?? 0} XP
            </span>

            {/* User Profile Dropdown */}
            <UserDropdown />
          </div>
        </header>

        <div className="flex-1 w-full px-6 py-6 md:px-8">
          <Outlet key={pathname} />
        </div>
      </main>
      </div>

      {/* Floating AI button */}
      {!aiChatOpen && (
        <button
          onClick={() => setAiChatOpen(true)}
          style={{ zIndex: 40 }}
          className="fixed bottom-6 right-6 font-bold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer border-2 border-white/60 dark:border-cyan-400/40 bg-gradient-to-br from-cyan-500 to-blue-600 text-white hover:scale-105 active:scale-95 transition-all"
        >
          <Sparkles className="w-5 h-5 text-white" />
          <span>Ask AI</span>
        </button>
      )}

      {aiChatOpen && <AIChatModal onClose={() => setAiChatOpen(false)} />}
    </div>
  )
}
