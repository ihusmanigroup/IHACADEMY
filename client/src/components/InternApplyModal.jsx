import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { useInternAuth } from '../context/InternAuthContext'
import { supabase } from '../lib/supabase'
import { DEV_MODE } from '../config/devMode'
import {
  X, CheckCircle, Loader2, Eye, EyeOff, ChevronRight, ChevronLeft,
  User, Mail, Phone, MapPin, Code2, BriefcaseBusiness, Globe, FileText,
  Clock, Calendar, Key, GraduationCap,
  Tags, Target, ShieldAlert, Upload, File, UploadCloud, Lock,
} from 'lucide-react'

const TRACKS = [
  { id: 'frontend-engineering', icon: '💻', label: 'Frontend Web Engineering', tech: 'React.js, Tailwind CSS, TypeScript, Responsive UI' },
  { id: 'backend-engineering', icon: '🚀', label: 'Backend Engineering', tech: 'Node.js, Express, PostgreSQL, REST & AI APIs' },
  { id: 'full-stack-engineering', icon: '⚡', label: 'Full-Stack Software Engineering', tech: 'React, Node.js, Databases, Full Lifecycle Deployment' },
  { id: 'machine-learning', icon: '🤖', label: 'Machine Learning', tech: 'Python, scikit-learn, Pandas, Model Evaluation' },
  { id: 'agentic-ai-engineering', icon: '🧠', label: 'Agentic AI Engineering', tech: 'LLM APIs, LangChain, Function Calling, Agent Workflows' },
]

const PRESET_SKILLS = ['React', 'Node.js', 'Python', 'SQL', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Git', 'Docker', 'PostgreSQL', 'MongoDB', 'GraphQL', 'REST APIs', 'JavaScript', 'HTML/CSS', 'Flutter', 'Dart', 'Power BI', 'Express', 'AI/ML']

const AVAILABILITY_OPTIONS = ['5-10 hrs/week', '15-20 hrs/week', '25-30 hrs/week', '30+ hrs/week']

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', desc: 'Some coursework or personal projects' },
  { value: 'intermediate', label: 'Intermediate Student', desc: 'Formal coursework and building projects' },
  { value: 'advanced', label: 'Advanced', desc: 'Prior internship or job experience' },
]

const STEPS = [
  { title: 'Profile & Contact', subtitle: 'Candidate details' },
  { title: 'Tech Stack & Online', subtitle: 'Skills & presence' },
  { title: 'CV & Statement', subtitle: 'Resume & cover' },
  { title: 'Commitment & Setup', subtitle: 'Availability & password' },
]

function Toast({ message, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 3500)
    return () => clearTimeout(id)
  }, [onClose])
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium bg-gray-900/95 border-amber-500/30 text-amber-300">
      <ShieldAlert className="w-4 h-4 shrink-0" />
      {message}
    </div>
  )
}

export default function InternApplyModal({ initialTrack, cohort, locked = false, opensOn = null, onClose }) {
  const navigate = useNavigate()
  const { purgeCorruptSessions } = useInternAuth()
  // DEV_MODE keeps the Winter Internship always open and fully unlocked.
  const isLocked = DEV_MODE ? false : locked
  const opensLabel = DEV_MODE ? null : opensOn
  // Use dynamic cohort object passed from parent (Careers.jsx)
  const cohortObj = cohort || {}
  const meta = {
    title: cohortObj.title || 'Apply for Internship',
    subtitle: cohortObj.tagline || 'Internship Program',
    free: cohortObj.free ?? true,
    price: cohortObj.price ?? 0,
  }
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [toast, setToast] = useState(null)
  const [skillInput, setSkillInput] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [resumeFile, setResumeFile] = useState(null)
  const [showManualLink, setShowManualLink] = useState(true)

  // Drop any leftover mock-auth session before the applicant starts a new one.
  useEffect(() => { purgeCorruptSessions() }, [purgeCorruptSessions])

  const [form, setForm] = useState({
    track: initialTrack || '',
    cohort: cohortObj.id || '',
    fullName: '',
    email: '',
    phone: '',
    city: '',
    experienceLevel: '',
    skills: [],
    github: '',
    linkedin: '',
    portfolio: '',
    resumeUrl: '',
    coverNote: '',
    availability: '',
    startDate: '',
    password: '',
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const addSkill = (skill) => {
    const s = (skill || '').trim()
    if (s && !form.skills.includes(s)) update('skills', [...form.skills, s])
    setSkillInput('')
  }

  const removeSkill = (skill) => update('skills', form.skills.filter(s => s !== skill))

  const canProceed = () => {
    if (step === 0) return form.track && form.fullName.trim() && form.email.trim() && form.phone.trim()
    if (step === 1) return form.github.trim()
    if (step === 2) return form.resumeUrl.trim()
    if (step === 3) return form.password.trim().length >= 6
    return true
  }

  const uploadResume = useCallback(async (file) => {
    setUploading(true)
    setUploadProgress(0)
    setResumeFile(file)

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + Math.random() * 25, 85))
    }, 300)

    // Upload resume PDF to Supabase Storage bucket — do NOT fall back to
    // Base64 (bloats DB + triggers Chrome security blocks).
    const BUCKET = 'resumes'
    const fileName = `resume_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    console.log('[Resume Upload] Target bucket:', BUCKET, '| File:', fileName)

    try {
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'application/pdf',
        })

      clearInterval(progressInterval)
      if (uploadError) throw uploadError

      setUploadProgress(100)

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName)

      update('resumeUrl', publicUrl)
    } catch (err) {
      clearInterval(progressInterval)
      setUploadProgress(0)
      const msg = err?.message || 'Failed to upload resume.'
      // Bucket not found → guide user to manual link field
      if (String(msg).includes('Bucket not found') || String(msg).includes('not found')) {
        setToast({ message: 'Resume storage unconfigured. Please use "Paste a link instead" below.' })
        setShowManualLink(true)
      } else {
        setToast({ message: msg + ' You can also paste a link instead.' })
        setShowManualLink(true)
      }
    } finally {
      setUploading(false)
    }
  }, [])

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'File too large. Maximum size is 5MB.' })
      return
    }

    uploadResume(file)
  }, [uploadResume])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  })

  const removeResume = () => {
    setResumeFile(null)
    setUploadProgress(0)
    update('resumeUrl', '')
  }

  const handleSubmit = async () => {
    if (!canProceed()) return
    setSubmitting(true)
    setToast(null)
    await new Promise(r => setTimeout(r, 600))

    let applicationId = null
    const email = (form.email || '').trim().toLowerCase()
    const payload = {
      full_name: form.fullName,
      email,
      whatsapp: form.phone,
      city: form.city,
      cohort: form.cohort,
      track: form.track,
      experience_level: form.experienceLevel,
      skills: form.skills,
      github_url: form.github,
      linkedin_url: form.linkedin,
      resume_url: form.resumeUrl,
      cover_note: form.coverNote,
      availability: form.availability,
      password: form.password,
    }

    try {
      // Look up ALL applications for this email so we can upsert. A user may
      // have multiple rows (old rejected + newer pending) — never use
      // maybeSingle() here, it errors on multiple rows.
      const { data: existingRows, error: lookupErr } = await supabase
        .from('intern_applications')
        .select('id, status, is_approved')
        .eq('email', email)
        .order('created_at', { ascending: false })

      const existing = !lookupErr && Array.isArray(existingRows) ? existingRows : []
      if (existing.length) {
        const pending = existing.find((r) => (r.status || '').toLowerCase() === 'pending')
        if (pending) {
          setSubmitting(false)
          setToast({ message: 'Your application is currently under review.' })
          return
        }
        const approved = existing.find((r) =>
          (r.status || '').toLowerCase() === 'approved' || r.is_approved === true
        )
        if (approved) {
          setSubmitting(false)
          setToast({ message: 'You are already an approved intern! Please log in.' })
          return
        }
        // Rejected/revoked → resubmit: reset the newest row to pending with
        // the refreshed submission details.
        const { data, error } = await supabase
          .from('intern_applications')
          .update({ ...payload, status: 'pending', is_approved: false, updated_at: new Date().toISOString() })
          .eq('id', existing[0].id)
          .select('id')
          .maybeSingle()
        if (!error && data?.id) applicationId = data.id
      } else {
        const { data, error } = await supabase
          .from('intern_applications')
          .insert([{ ...payload, status: 'pending', is_approved: false }])
          .select('id')
          .maybeSingle()
        if (!error && data?.id) applicationId = data.id
      }
    } catch {}

    setSubmitting(false)

    // Strictly DB-backed sessions: without the returned UUID there is no real
    // application record, so we never fabricate an `intern-…` id.
    if (!applicationId) {
      setToast({ message: 'Could not save your application. Please check your connection and try again.' })
      return
    }

    const application = {
      ...form,
      id: applicationId,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      is_approved: false,
    }

    try {
      const raw = localStorage.getItem('ih_intern_applications')
      const existing = raw ? JSON.parse(raw) : []
      const list = Array.isArray(existing) ? existing : [existing].filter(Boolean)
      list.push(application)
      localStorage.setItem('ih_intern_applications', JSON.stringify(list))
    } catch {}

    try {
      localStorage.setItem('ihacademy_intern_application', JSON.stringify(application))
    } catch {}

    // Do NOT auto-login or redirect. Application is pending review.
    setSubmitted(true)
  }

  if (submitted) {
    // Use the dynamic cohort object passed from parent
    const cohortLabel = cohortObj.title || 'Internship Program'
    const weeks = meta.free ? '4' : '6'
    return (
      <>
        {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <div className="relative w-full max-w-md bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-8 text-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Application Submitted Successfully! 📝
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-7">
                Your application for the {cohortLabel} cohort is now under review.
                You will be able to log in to the Intern Portal once your application is approved.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={onClose}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const StepIndicator = () => (
    <div className="flex items-center gap-2 px-6 pt-5 pb-3">
      {STEPS.map((s, i) => (
        <div key={s.title} className="flex-1">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
              i < step ? 'bg-emerald-500 text-black' : i === step ? 'bg-emerald-500 text-black' : 'bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-gray-500 dark:text-gray-400'
            }`}>
              {i < step ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 transition-colors ${i < step ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-800'}`} />
            )}
          </div>
          <p className={`text-[10px] mt-1 font-medium leading-tight ${i === step ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'}`}>{s.title}</p>
        </div>
      ))}
    </div>
  )

  return (
    <>
      {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-500" /> {meta.title}
                {isLocked && <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"><Lock className="w-3 h-3" /> Locked</span>}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{meta.subtitle}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {isLocked && (
            <div className="mx-6 mt-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-sm">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Applications open on {opensLabel}</p>
                <p className="text-xs mt-0.5 opacity-80">
                  This form is locked right now — you can preview the full application below.
                  All fields will become editable once applications open.
                </p>
              </div>
            </div>
          )}

          {!isLocked && (
            <div className="mx-6 mt-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-500/30 text-sky-800 dark:text-sky-300 text-sm">
              <GraduationCap className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {cohortObj.title || 'Internship Program'} — {meta.free ? 'completely free' : `Pro program · $${meta.price}`}
                </p>
                <p className="text-xs mt-0.5 opacity-80">
                  Cohort program · 5 tracks · required free courses · verified certificate.
                </p>
              </div>
            </div>
          )}

          <StepIndicator />

          <div className={`flex-1 overflow-y-auto p-6 space-y-5 ${isLocked ? 'opacity-70' : ''}`}>
            <fieldset disabled={isLocked} className="space-y-5">
            {step === 0 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-3">Select Track *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TRACKS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => update('track', t.id)}
                        className={`text-left p-3.5 rounded-xl border text-sm transition-all ${
                          form.track === t.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'bg-white dark:bg-[#07090e] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-emerald-500/30'
                        }`}
                      >
                        <span className="text-base">{t.icon}</span>
                        <p className="font-semibold mt-0.5">{t.label}</p>
                        <p className="text-[10px] opacity-70 mt-0.5">{t.tech}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">
                      <User className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Full Legal Name *
                    </label>
                    <input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="John Doe" className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">
                      <Mail className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Professional Email *
                    </label>
                    <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="john@example.com" className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">
                      <Phone className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />WhatsApp / Phone *
                    </label>
                    <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+92 300 1234567" className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">
                      <MapPin className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />City & Country
                    </label>
                    <input value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Karachi, Pakistan" className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-3">
                    <Target className="w-4 h-4 inline mr-1 -mt-0.5" />Experience Level
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {EXPERIENCE_LEVELS.map((el) => (
                      <button
                        key={el.value}
                        onClick={() => update('experienceLevel', el.value)}
                        className={`flex-1 text-left p-3.5 rounded-xl border text-sm transition-all ${
                          form.experienceLevel === el.value
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'bg-white dark:bg-[#07090e] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-emerald-500/30'
                        }`}
                      >
                        <p className="font-semibold">{el.label}</p>
                        <p className="text-[10px] opacity-70 mt-0.5">{el.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">
                    <Tags className="w-4 h-4 inline mr-1 -mt-0.5" />Key Technical Skills
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.skills.map(s => (
                      <span key={s} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {s}
                        <button onClick={() => removeSkill(s)} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput) } }} placeholder="Type a skill and press Enter" className="flex-1 bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors" />
                    <button onClick={() => addSkill(skillInput)} className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-medium transition-colors">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {PRESET_SKILLS.filter(s => !form.skills.includes(s)).slice(0, 8).map(s => (
                      <button key={s} onClick={() => addSkill(s)} className="text-[10px] px-2 py-0.5 rounded-full border border-dashed border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">+ {s}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">
                      <Code2 className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />GitHub Profile Link *
                    </label>
                    <input value={form.github} onChange={(e) => update('github', e.target.value)} placeholder="https://github.com/yourhandle" className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">
                        <BriefcaseBusiness className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />LinkedIn Profile URL
                      </label>
                      <input value={form.linkedin} onChange={(e) => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">
                        <Globe className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Portfolio / Live Project
                      </label>
                      <input value={form.portfolio} onChange={(e) => update('portfolio', e.target.value)} placeholder="https://yourportfolio.com" className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4" />Upload Resume / CV *
                  </label>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                    Accepted formats: PDF, DOC, DOCX. Max file size: 5MB.
                  </p>

                  {isLocked ? (
                    <div className="p-8 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#07090e] text-center">
                      <Lock className="w-10 h-10 mx-auto mb-3 text-slate-500 dark:text-slate-400" />
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Uploads open on {opensLabel}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Resume / CV upload will be enabled when applications open.</p>
                    </div>
                  ) : resumeFile && uploadProgress === 100 ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <File className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{resumeFile.name}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle className="w-3 h-3" /> Uploaded successfully
                        </p>
                      </div>
                      <button onClick={removeResume} className="p-1 rounded text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : uploading ? (
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#07090e]">
                      <div className="flex items-center gap-3 mb-3">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Uploading resume...</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">{resumeFile?.name}</p>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${Math.round(uploadProgress)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 text-right">{Math.round(uploadProgress)}%</p>
                    </div>
                  ) : (!showManualLink ? (
                    <div
                      {...getRootProps()}
                      className={`p-8 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                        isDragActive
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#07090e] hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-10 h-10 mx-auto mb-3 text-slate-600 dark:text-slate-300" />
                      {isDragActive ? (
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Drop your resume here...</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Drag & drop your resume here
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">or click to browse files</p>
                        </>
                      )}
                    </div>
                  ) : null)}

                  {!isLocked && !uploading && uploadProgress !== 100 && (
                    <button
                      onClick={() => setShowManualLink(!showManualLink)}
                      className="mt-3 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors underline underline-offset-2"
                    >
                      {showManualLink ? 'Upload a file instead' : 'Or paste a link instead'}
                    </button>
                  )}

                  {!isLocked && showManualLink && !resumeFile && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">
                        <FileText className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Resume / CV URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          value={form.resumeUrl}
                          onChange={(e) => update('resumeUrl', e.target.value)}
                          placeholder="https://drive.google.com/your-resume"
                          className="flex-1 bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors"
                        />
                        <button
                          onClick={() => setShowManualLink(false)}
                          className="px-3 py-2 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-colors"
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">
                    Short Cover Note <span className="text-gray-500 dark:text-gray-400 font-normal">({form.coverNote.length}/500)</span>
                  </label>
                  <textarea
                    value={form.coverNote}
                    onChange={(e) => update('coverNote', e.target.value.slice(0, 500))}
                    rows={4}
                    placeholder="Why are you applying for this track at IH Group?"
                    className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tell us why you're a great fit for this internship track.</p>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-3">
                    <Clock className="w-4 h-4 inline mr-1 -mt-0.5" />Weekly Time Availability
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => update('availability', opt)}
                        className={`text-center p-3 rounded-xl border text-sm font-medium transition-all ${
                          form.availability === opt
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'bg-white dark:bg-[#07090e] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-emerald-500/30'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Preferred Start Date
                  </label>
                  <input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">
                    <Key className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Account Password * <span className="text-gray-500 dark:text-gray-400 font-normal">(min. 6 chars)</span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">This password will be used to access your Intern Portal.</p>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Create a password" className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors" />
                    <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}
            </fieldset>
          </div>

          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-[#0f1420]/80 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <button
              onClick={() => step > 0 ? setStep(step - 1) : onClose()}
              className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />{step > 0 ? 'Back' : 'Cancel'}
            </button>
            {isLocked ? (
              <button
                disabled
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-semibold px-5 py-2 rounded-lg text-sm cursor-not-allowed"
              >
                <Lock className="w-4 h-4" /> Opens {opensLabel}
              </button>
            ) : (
              <>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Step {step + 1} of {STEPS.length}
                </div>
                {step < STEPS.length - 1 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-5 py-2 rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed() || submitting}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
