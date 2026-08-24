import { Link } from 'react-router-dom'
import { Mail, MapPin } from 'lucide-react'
import Logo from './Logo'
import { SOCIAL_LINKS } from '../lib/socialLinks'

const platformLinks = [
  { label: 'Courses', to: '/courses' },
  { label: 'Internship', to: '/internship' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About Us', to: '/about' },
]

const supportLinks = [
  { label: 'Help & Support', to: '/help' },
  { label: 'Sign In', to: '/login' },
  { label: 'Create Account', to: '/register' },
]

function SocialIcon({ social }) {
  return (
    <a
      href={social.href}
      target="_blank"
      rel="noreferrer"
      aria-label={social.label}
      title={social.label}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/80 bg-white/[0.03] text-slate-400 transition-all hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-300 hover:shadow-[0_8px_20px_-6px_rgba(6,182,212,0.4)]"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
        <path d={social.path} />
      </svg>
    </a>
  )
}

export default function Footer() {
  return (
    <footer className="w-full bg-[#0b0f19] text-slate-400 border-t border-slate-800/80 transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] gap-10 lg:gap-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 group">
              <Logo className="h-9 w-9" />
              <span className="font-bold text-white text-lg tracking-tight">IH Academy</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-500 max-w-xs">
              Learn · Build · Elevate. Interactive courses, mentored internships and verified certificates backed by IH Usmani Group.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              {SOCIAL_LINKS.map((social) => (
                <SocialIcon key={social.id} social={social} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Platform</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="hover:text-cyan-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Support</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="hover:text-cyan-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Get In Touch</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 mt-0.5 text-cyan-500 shrink-0" />
                <a href="mailto:support@ihacademy.com" className="hover:text-cyan-400 transition-colors break-all">support@ihacademy.com</a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-cyan-500 shrink-0" />
                <span>IH Usmani Group — Learn anywhere, build everywhere.</span>
              </li>
            </ul>
            <Link
              to="/register"
              className="mt-5 inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm shadow-[0_0_16px_rgba(6,182,212,0.35)] hover:shadow-[0_0_24px_rgba(6,182,212,0.5)] transition-all"
            >
              Start Learning Free
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-center sm:text-left">
            © 2026 <Link to="/" className="font-semibold text-slate-200 hover:text-cyan-400 transition-colors">IH Academy</Link> — IH Usmani Group. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">Made with passion for learners everywhere.</p>
        </div>
      </div>
    </footer>
  )
}
