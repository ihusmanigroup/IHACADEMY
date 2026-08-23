import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import AIChatModal from './AIChatModal'
import GooeyNav from './GooeyNav'
import Footer from './Footer'
import Logo from './Logo'

const navLinks = [
  { label: 'Courses', to: '/courses' },
  { label: 'Internship', to: '/internship' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About Us', to: '/about' },
]

export default function PublicLayout() {
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const hideFooterRoutes = ['/learn', '/course', '/ml-major', '/quiz', '/test', '/editor', '/solve']
  const isExcludedRoute = hideFooterRoutes.some((route) => location.pathname.startsWith(route))

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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 transition-colors duration-200">
      <nav className="flex items-center justify-between px-8 py-4 bg-white dark:bg-[#090D16] border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
        <Link to="/" className="flex items-center gap-3">
          <Logo className="h-8 w-8" />
          <span className="font-bold text-slate-900 dark:text-white">IH Academy</span>
        </Link>
        <div className="hidden md:flex items-center rounded-full bg-slate-100/80 dark:bg-[#0d1322]/80 border border-slate-200 dark:border-slate-800/60 backdrop-blur-md py-1">
          <GooeyNav items={gooeyItems} initialActiveIndex={activeIndex} />
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer">Sign In</Link>
          <Link to="/register" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-4 py-2 rounded-md text-sm shadow-[0_0_16px_rgba(6,182,212,0.35)] hover:shadow-[0_0_24px_rgba(6,182,212,0.5)] transition-all cursor-pointer">
            Get Started
          </Link>
        </div>
      </nav>
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
