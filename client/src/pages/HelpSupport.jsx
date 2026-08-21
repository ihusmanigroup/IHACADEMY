import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  ChevronDown, Send, Loader2, Ticket, CheckCircle2, AlertCircle, X,
  Mail, MessageSquare, RotateCcw, Eye, FileText
} from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'

const FAQ_CATEGORIES = [
  {
    category: 'Getting Started',
    icon: MessageSquare,
    faqs: [
      { q: 'How do I enroll in a course?', a: 'Go to the Courses page, click on any course, and press "Enroll". Free courses enroll instantly; paid courses redirect to checkout.' },
      { q: 'How do I join a coding challenge?', a: 'Visit the Coding Arena, pick an active challenge, and click "Start Challenge". You can code directly in the browser.' },
      { q: 'Where do I see my learning progress?', a: 'Your Dashboard shows XP, streak, completed lessons, and enrolled courses with progress rings.' },
      { q: 'Can I switch tracks later?', a: 'Yes, you can enroll in multiple tracks simultaneously. Progress is tracked separately for each.' },
    ],
  },
  {
    category: 'Account & Billing',
    icon: Mail,
    faqs: [
      { q: 'How do I upgrade to Pro or Exclusive?', a: 'Open Pricing from the sidebar, choose a plan, and complete checkout. Your tier updates instantly.' },
      { q: 'Where can I see my purchase history?', a: 'Go to Settings → Billing to view all transactions, invoices, and active subscriptions.' },
      { q: 'How do I cancel my subscription?', a: 'In Settings → Billing, click "Cancel Plan" on your active subscription. Access continues until the period ends.' },
      { q: 'Can I get a refund?', a: 'Refunds are available within 7 days of purchase if you haven\'t completed more than 10% of a course. Contact support.' },
    ],
  },
  {
    category: 'Internship Program',
    icon: FileText,
    faqs: [
      { q: 'How do I apply for the internship?', a: 'Go to Careers & Internships, read the program details, and submit the application form when applications are open.' },
      { q: 'What are the internship requirements?', a: 'You must be enrolled in at least one Pro track, have 500+ XP, and complete the screening assignment.' },
      { q: 'How are interns evaluated?', a: 'Weekly submissions, code reviews, mentor feedback, and a final capstone project determine your LOR grade.' },
      { q: 'When do I receive my Letter of Recommendation?', a: 'Upon successful completion of the internship (all submissions approved), your LOR is generated automatically.' },
    ],
  },
  {
    category: 'Troubleshooting',
    icon: RotateCcw,
    faqs: [
      { q: 'The code playground isn\'t loading', a: 'Try hard refresh (Ctrl+Shift+R), disable ad blockers, or switch browsers. Ensure WebAssembly is enabled.' },
      { q: 'My certificate isn\'t generating', a: 'Ensure you\'ve completed all required lessons (100% progress). If stuck, re-open the course syllabus and re-verify.' },
      { q: 'I can\'t log in with Google', a: 'Clear cookies for ihacademy.com, disable "Block third-party cookies", or use email/password login instead.' },
      { q: 'Video lessons won\'t play', a: 'Check your internet connection, try a different browser, or disable VPN/proxy. Videos are hosted on a CDN.' },
    ],
  },
]

export default function HelpSupport() {
  const { user, profile } = useAuth()
  const { addNotification } = useNotifications()

  const [openCategory, setOpenCategory] = useState(null)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [tickets, setTickets] = useState([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ category: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})

  // Load user's tickets on mount
  useEffect(() => {
    if (!user) return
    let active = true
    supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return
        if (!error) setTickets(data || [])
        setTicketsLoading(false)
      })
    return () => { active = false }
  }, [user])

  const openTicketModal = () => {
    if (!user) return
    setFormData({ category: '', subject: '', message: '' })
    setErrors({})
    setShowTicketModal(true)
  }

  const closeTicketModal = () => setShowTicketModal(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const errs = {}
    if (!formData.category) errs.category = 'Please select a category.'
    if (!formData.subject.trim()) errs.subject = 'Subject is required.'
    if (!formData.message.trim()) errs.message = 'Message is required.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    if (!user) return

    setSubmitting(true)
    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        user_name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        user_email: user.email || '',
        category: formData.category,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        status: 'open',
      })
      if (error) throw error

      addNotification({
        type: 'success',
        title: 'Ticket Submitted',
        message: 'Your support ticket has been submitted successfully!',
      }).catch(() => {})

      // Refresh tickets
      const { data } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setTickets(data)

      setFormData({ category: '', subject: '', message: '' })
      setShowTicketModal(false)
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: err.message || 'Could not submit ticket. Please try again.',
      }).catch(() => {})
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800/50',
      in_progress: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800/50',
      resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800/50',
    }
    const icons = {
      open: AlertCircle,
      in_progress: RotateCcw,
      resolved: CheckCircle2,
    }
    const Icon = icons[status] || Ticket
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || styles.open}`}>
        <Icon className="w-3 h-3" /> {status.replace('_', ' ')}
      </span>
    )
  }

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Help & Support</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-500">Find answers or raise a support ticket</p>
      </div>

      {/* FAQ Accordions */}
      <div className="space-y-3">
        {FAQ_CATEGORIES.map(({ category, icon: Icon, faqs }) => (
          <div key={category} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenCategory(openCategory === category ? null : category)}
              className="w-full flex items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
              aria-expanded={openCategory === category}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-950 dark:text-white">{category}</h3>
              </div>
              <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${openCategory === category ? 'rotate-180' : ''}`} />
            </button>
            {openCategory === category && (
              <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 divide-y divide-slate-200 dark:divide-slate-800">
                {faqs.map((faq, i) => (
                  <div key={i} className="p-5">
                    <p className="font-medium text-slate-950 dark:text-white">{faq.q}</p>
                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{faq.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Support — Raise Ticket Button */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-950 dark:text-white">Can't find your answer?</h3>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-500">Raise a support ticket and our team will get back to you within 24 hours.</p>
          </div>
          <button
            onClick={openTicketModal}
            disabled={!user}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/20 hover:from-sky-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquare className="h-4 w-4" /> Raise Support Ticket
          </button>
        </div>
        {!user && (
          <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">Please sign in to submit a support ticket.</p>
        )}
      </div>

      {/* My Tickets History */}
      {user && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-slate-950 dark:text-white flex items-center gap-2">
              <Ticket className="h-5 w-5 text-sky-600 dark:text-sky-400" /> My Previous Tickets
            </h3>
          </div>
          {ticketsLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <Ticket className="mx-auto h-10 w-10 mb-2 opacity-50" />
              <p>No support tickets yet.</p>
              <p className="text-sm mt-1">Your submitted tickets will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {tickets.map((t) => (
                <div key={t.id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-950 dark:text-white truncate">{t.subject}</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{t.category}</span>
                        {getStatusBadge(t.status)}
                      </div>
                      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 truncate">{t.message}</p>
                      <p className="mt-1 text-xs text-slate-400">Submitted {formatDate(t.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Raise Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeTicketModal}>
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">Raise Support Ticket</h2>
              <button onClick={closeTicketModal} disabled={submitting} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category <span className="text-rose-500">*</span></label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1526] px-3.5 py-2.5 text-sm text-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                >
                  <option value="">Select a category</option>
                  <option value="Getting Started">Getting Started</option>
                  <option value="Account & Billing">Account & Billing</option>
                  <option value="Internship Program">Internship Program</option>
                  <option value="Troubleshooting">Troubleshooting</option>
                  <option value="General">General</option>
                </select>
                {errors.category && <p className="mt-1 text-xs text-rose-500">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Subject <span className="text-rose-500">*</span></label>
                <input
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief summary of your issue"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${errors.subject ? 'border-rose-400 dark:border-rose-500/60' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1526]'}`}
                />
                {errors.subject && <p className="mt-1 text-xs text-rose-500">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Message <span className="text-rose-500">*</span></label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-950 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${errors.message ? 'border-rose-400 dark:border-rose-500/60' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1526]'}`}
                />
                {errors.message && <p className="mt-1 text-xs text-rose-500">{errors.message}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeTicketModal} disabled={submitting} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/20 hover:from-sky-400 hover:to-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}