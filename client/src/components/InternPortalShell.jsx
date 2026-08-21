import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useInternAuth } from '../context/InternAuthContext'
import { sidebarItems } from '../data/internPortalNav'

/**
 * Persistent portal chrome: left sidebar navigation, sticky top header, and
 * the mobile tab bar. Navigation is done with React Router <NavLink> so tab
 * switching stays fully client-side — no full page reloads. The shell is kept
 * mounted by the /intern-portal layout route while <Outlet /> swaps the tab
 * content beneath it.
 */
export default function InternPortalShell({ title, subtitle = 'Intern Portal · IH Academy', activeTab, children }) {
  const { intern } = useInternAuth()
  const navigate = useNavigate()
  const displayName = intern?.name || 'Hassan'

  /**
   * "Exit Portal" only leaves the /intern-portal route. It clears the dedicated
   * intern access flag (`intern_unlocked`) so the portal guard won't re-admit
   * without another Email & Password login — but it must NOT touch the main
   * website session (Supabase auth / Google sign-in), so the user stays logged
   * in to IH Academy.
   */
  const handleExit = () => {
    try { sessionStorage.removeItem('intern_unlocked') } catch {}
    navigate('/internship')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-[#05080f] text-slate-950 dark:text-white transition-colors duration-200">

      {/* Top Section — Sidebar + Content */}
      <div className="flex flex-1 min-w-0 items-stretch">
      <aside className="hidden md:flex w-64 shrink-0 border-r border-sky-900/40 bg-gradient-to-b from-[#081325] via-[#0c1e38] to-[#070f1e] text-white p-4 flex-col justify-between h-full min-h-screen sticky top-0 overflow-y-auto custom-scrollbar">
        <div>
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-black font-bold text-sm border border-sky-500/30 shadow-lg shadow-sky-500/10">IH</div>
            <div>
              <p className="font-bold text-white leading-tight">Intern Portal</p>
              <p className="text-xs font-extrabold text-sky-400">IH Academy</p>
            </div>
          </div>
          <div className="px-3 mt-4 mb-3 text-[11px] font-extrabold uppercase tracking-widest text-sky-400">Internship</div>
          <nav className="space-y-2.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const active = activeTab === item.id
              return (
                <NavLink
                  key={item.id}
                  to={`/intern-portal/${item.id}`}
                  className={`group w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                    active
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                      : 'text-slate-300 hover:bg-sky-500/10 hover:text-sky-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-sky-300'}`} />
                  <span className="text-[15px] leading-snug">{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>
        <div className="pt-4 border-t border-sky-900/40 mt-6">
          <div className="flex items-center gap-3 px-3.5 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
              {displayName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <p className="text-xs text-slate-300/70 truncate">{intern?.email || 'intern@ih.com'}</p>
            </div>
          </div>
          <button
            onClick={handleExit}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Exit Portal
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-6 md:p-8">
        <div className="sticky top-0 z-10 -mx-6 md:-mx-8 px-6 md:px-8 -mt-6 md:-mt-8 pt-5 md:pt-6 pb-4 mb-6 bg-white dark:bg-[#080C14]/90 backdrop-blur border-b border-slate-200/90 dark:border-slate-800/60 shadow-sm shadow-slate-200/60 dark:shadow-none flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">{title}</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>        <div className="md:hidden flex gap-2 overflow-x-auto pb-4 -mx-1 px-1">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.id}
              to={`/intern-portal/${item.id}`}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-500 text-white font-bold shadow-sm shadow-cyan-500/20'
                  : 'bg-white dark:bg-[#0b0f19]/80 border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-300 shadow-sm dark:shadow-none'
              }`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
          {children}
        </div>
      </main>
      </div>
    </div>
  )
}
