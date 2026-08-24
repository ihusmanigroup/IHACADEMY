import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="w-full bg-[#0b0f19] text-slate-400 border-t border-slate-800/80 transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-center md:justify-between gap-2">
        <p className="text-xs text-center md:text-left">
          © 2026 <Link to="/" className="font-semibold text-slate-200 hover:text-cyan-400 transition-colors">IH Academy</Link> — Learn · Build · Elevate.
        </p>
        <nav className="flex items-center gap-5 text-xs">
          <Link to="/courses" className="hover:text-cyan-400 transition-colors">Courses</Link>
          <Link to="/careers" className="hover:text-cyan-400 transition-colors">Internships</Link>
          <Link to="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link>
          <Link to="/help" className="hover:text-cyan-400 transition-colors">Support</Link>
        </nav>
      </div>
    </footer>
  )
}
