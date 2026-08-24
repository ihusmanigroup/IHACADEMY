import { Link } from 'react-router-dom'
import { SOCIAL_LINKS } from '../lib/socialLinks'

export default function Footer() {
  return (
    <footer className="w-full bg-[#0b0f19] text-slate-400 border-t border-slate-800/80 transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-center md:text-left">
          © 2026 <Link to="/" className="font-semibold text-slate-200 hover:text-cyan-400 transition-colors">IH Academy</Link> — Learn · Build · Elevate.
        </p>
        <nav className="flex items-center gap-5 text-xs">
          <Link to="/courses" className="hover:text-cyan-400 transition-colors">Courses</Link>
          <Link to="/careers" className="hover:text-cyan-400 transition-colors">Internships</Link>
          <Link to="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link>
          <Link to="/help" className="hover:text-cyan-400 transition-colors">Support</Link>
        </nav>
        <div className="flex items-center gap-2">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.id}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              title={social.label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-white/[0.03] text-slate-400 transition-all hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-300"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d={social.path} />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
