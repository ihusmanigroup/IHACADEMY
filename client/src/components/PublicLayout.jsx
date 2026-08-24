import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Sparkles, Menu, X } from 'lucide-react'
import AIChatModal from './AIChatModal'
import GooeyNav from './GooeyNav'
import Footer from './Footer'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { label: 'Courses', to: '/courses' },
  { label: 'Internship', to: '/internship' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About Us', to: '/about' },
]

function NavHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const gooeyItems = navLinks.map((link) => ({
    label: link.label,
    href: link.to,
    onClick: link.to !== '#' ? () => navigate(link.to) : undefined,
  }))
  const activeIndex = Math.max(
    0,
    navLinks.findIndex((l) => l.to !== '#' && location.pathname.startsWith(l.to)),
  )

  return (
    <header className="sticky top-0 z-40">
      <nav className="flex items-center justify-between px-6 md:px-8 h-16 bg-[#090D16]/95 backdrop-blur border-b border-slate-800/80">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <Logo className="h-8 w-8" />
          <span className="font-bold text-white">IH Academy</span>
        </Link>
        <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md py-1">
          <GooeyNav items={gooeyItems} initialActiveIndex={activeIndex} tone="dark" />
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer">Sign In</Link>
          <Link to="/register" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow-[0_0_16px_rgba(6,182,212,0.35)] hover:shadow-[0_0_24px_rgba(6,182,212,0.5)] transition-all cursor-pointer">
            Get Started
          </Link>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-[#090D16]/98 backdrop-blur">
          <div className="px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'text-white bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-2 inline-flex justify-center items-center border border-white/15 text-slate-200 hover:bg-white/5 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default function PublicLayout() {
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  const hideFooterRoutes = ['/learn', '/course', '/ml-major', '/quiz', '/test', '/editor', '/solve']
  const isExcludedRoute = hideFooterRoutes.some((route) => location.pathname.startsWith(route))

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 transition-colors duration-200">
      {!user && <NavHeader key={location.key} />}
      <div className="flex-1 w-full">
        <Outlet />
      </div>
      {!isExcludedRoute && <Footer />}

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
