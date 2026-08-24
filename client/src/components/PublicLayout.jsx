import { useState } from 'react'
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Sparkles, ArrowRight } from 'lucide-react'
import AIChatModal from './AIChatModal'
import Footer from './Footer'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'
import { useInternAuth } from '../context/InternAuthContext'

const navLinks = [
  { label: 'Courses', to: '/courses' },
  { label: 'Internship', to: '/internship' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About Us', to: '/about' },
]

function NavHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2 lg:gap-10 min-w-0">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <Logo className="h-8 w-8" />
              <span className="font-bold text-white text-[15px] tracking-tight">IH Academy</span>
            </Link>
            <nav className="hidden md:flex items-center h-16">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative flex h-16 items-center px-4 text-sm font-medium transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      <span
                        className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-opacity duration-200 ${
                          isActive ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_28px_rgba(6,182,212,0.5)] transition-all"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0B101B]/95 backdrop-blur-xl">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'text-white bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 pt-3 border-t border-white/10 grid grid-cols-2 gap-3">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="inline-flex justify-center items-center border border-white/15 text-slate-200 hover:bg-white/5 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="inline-flex justify-center items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default function PublicLayout() {
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()
  const { intern } = useInternAuth()

  const isAuthenticated = Boolean(user || intern)

  const hideFooterRoutes = ['/learn', '/course', '/ml-major', '/quiz', '/test', '/editor', '/solve']
  const isExcludedRoute = hideFooterRoutes.some((route) => location.pathname.startsWith(route))

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 transition-colors duration-200">
      {!isAuthenticated && <NavHeader key={location.key} />}
      <div className="flex-1 w-full">
        <Outlet />
      </div>
      {!isExcludedRoute && <Footer />}

      {!isAuthenticated && !aiChatOpen && (
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
