import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Zap, Flame, CheckCircle2, Award, Mail, Crown, TrendingUp, BookOpen,
  MapPin, GitBranch, Briefcase, Globe, FileText, Pencil, X, Sparkles,
  Trophy, Medal, Gem, Loader2, Plus, UserRound, FileUp, Trash2, Eye, Camera,
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import useProfileData, { LEAGUE_TIERS } from '../hooks/useProfileData'
import { uploadImageToCloudinary } from '../utils/cloudinaryUpload'
import { TIER_META, useUserTier } from '../utils/userTier'

const leagueStyles = {
  Diamond: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800/50',
  Platinum: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-400 dark:border-cyan-800/50',
  Gold: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800/50',
  Silver: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  Bronze: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800/50',
}

const leagueIcons = {
  Bronze: Medal,
  Silver: Medal,
  Gold: Crown,
  Platinum: Gem,
  Diamond: Gem,
}

const ACTIVITY_META = {
  lesson: { icon: BookOpen, chip: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300', dot: 'border-indigo-400' },
  enroll: { icon: UserRound, chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', dot: 'border-emerald-400' },
  xp: { icon: Zap, chip: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', dot: 'border-amber-400' },
  challenge: { icon: Trophy, chip: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300', dot: 'border-purple-400' },
}

const cardBase =
  'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/80 dark:bg-[#0f1420]'

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`} />
}

function StatCard({ icon: Icon, label, value, iconBg, loading }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-[#0f1420] dark:hover:border-slate-700">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-7 w-16" />
      ) : (
        <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</p>
      )}
      <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-500">{label}</p>
    </div>
  )
}

function SocialButton({ icon: Icon, label, href, onAdd, loading }) {
  if (loading) return <Skeleton className="h-10 w-10" />
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        title={label}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:text-cyan-500 hover:shadow-[0_0_16px_rgba(34,211,238,0.15)] dark:border-slate-700 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-cyan-400"
      >
        <Icon className="h-[18px] w-[18px]" />
      </a>
    )
  }
  return (
    <button
      type="button"
      onClick={onAdd}
      title={`Add ${label}`}
      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3 text-xs font-semibold text-slate-500 transition-all duration-200 hover:border-cyan-400/60 hover:text-cyan-500 dark:border-slate-700 dark:text-slate-500 dark:hover:text-cyan-400"
    >
      <Plus className="h-3.5 w-3.5" /> {label}
    </button>
  )
}

function EditProfileModal({ open, onClose, initial, onSaved }) {
  const { user, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [resumeError, setResumeError] = useState('')
  const [skillsText, setSkillsText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedSprite, setSelectedSprite] = useState(() => {
    if (initial?.sprite) return initial.sprite
    try { return localStorage.getItem('ih_user_sprite') || '🧑‍💻' } catch { return '🧑‍💻' }
  })

  useEffect(() => {
    try { localStorage.setItem('ih_user_sprite', selectedSprite) } catch {}
  }, [selectedSprite])

  useEffect(() => {
    if (!open || !initial) return
    setFullName(initial.full_name || '')
    setHeadline(initial.headline || '')
    setBio(initial.bio || '')
    setGithubUrl(initial.github_url || '')
    setLinkedinUrl(initial.linkedin_url || '')
    setPortfolioUrl(initial.portfolio_url || '')
    setResumeUrl(initial.resume_url || '')
    setResumeFile(null)
    setUploadProgress(0)
    setResumeError('')
    setSkillsText((Array.isArray(initial.skill_tags) ? initial.skill_tags : []).join(', '))
    setError('')
  }, [open, initial])

  const uploadResume = useCallback(async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      setResumeError('File too large. Maximum size is 5MB.')
      return
    }
    setUploading(true)
    setResumeError('')
    setUploadProgress(0)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + Math.random() * 25, 85))
    }, 300)

    const BUCKET = 'resumes'
    const filePath = `resume_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    console.log('[Profile Resume Upload] Target bucket:', BUCKET, '| File:', filePath)

    try {
      const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/pdf',
      })
      clearInterval(progressInterval)
      if (error) throw error
      setUploadProgress(100)
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
      setResumeFile(file)
      setResumeUrl(publicUrl)
    } catch (err) {
      clearInterval(progressInterval)
      setUploadProgress(0)
      const msg = err?.message || 'Failed to upload resume.'
      if (String(msg).includes('Bucket not found') || String(msg).includes('not found')) {
        setResumeError('Resume storage unconfigured. Please paste a direct link to your resume instead.')
      } else {
        setResumeError(msg + ' You can also paste a direct link instead.')
      }
    } finally {
      setUploading(false)
    }
  }, [])

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    uploadResume(file)
  }, [uploadResume])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  })

  const removeResume = () => {
    setResumeFile(null)
    setResumeUrl('')
    setUploadProgress(0)
    setResumeError('')
  }

  const formatBytes = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const resumeFileName = resumeFile?.name ||
    (resumeUrl ? resumeUrl.split('/').pop().split('#')[0].split('?')[0] : '') ||
    'resume.pdf'

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const skills = skillsText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const SPRITE_OPTIONS = [
    '🧑‍💻', '👨‍💻', '👩‍💻', '🧑‍🚀', '👨‍🚀', '👩‍🚀',
    '🧙‍♂️', '🧙‍♀️', '🦸‍♂️', '🦸‍♀️', '🤖', '👾',
    '🐱', '🐶', '🦊', '🐼', '🐸', '🦁',
    '🎮', '🕹️', '🎯', '🚀', '⭐', '💎',
  ]

  const handleSave = async (e) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setError('Full name is required.')
      return
    }
    setSaving(true)
    setError('')
    const { error: err } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        github_url: githubUrl.trim(),
        linkedin_url: linkedinUrl.trim(),
        portfolio_url: portfolioUrl.trim(),
        resume_url: resumeUrl.trim(),
        skill_tags: skills,
        sprite: selectedSprite,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user?.id)
    setSaving(false)
    if (err) {
      setError(err.message || 'Could not save your profile.')
      return
    }
    await refreshProfile()
    onSaved()
    onClose()
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-950 placeholder:text-slate-500 transition-all duration-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-800 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500'
  const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800/80 dark:bg-[#0f1420]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500">
              <Pencil className="h-4 w-4 text-white" />
            </span>
            <h3 className="text-base font-bold text-slate-950 dark:text-white">Edit Profile</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-500 dark:text-rose-300">
              {error}
            </p>
          )}

          <div>
            <label className={labelClass}>Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Muhammad Hassan" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Headline</label>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="MERN Stack Developer & CS Student"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short intro about you, your interests, and what you're building..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>GitHub URL</label>
              <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/yourhandle" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>LinkedIn URL</label>
              <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourhandle" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Portfolio / Website URL</label>
            <input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://yourportfolio.com" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Resume / CV</label>

            {resumeFile || resumeUrl ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-500 dark:text-sky-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{resumeFileName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {resumeFile ? formatBytes(resumeFile.size) : 'PDF · attached'}
                      {resumeUrl.startsWith('data:') ? ' · embedded copy' : ''}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-sky-500/20 transition-all duration-200 hover:from-sky-400 hover:to-indigo-400"
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </a>
                  <button
                    type="button"
                    onClick={removeResume}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-rose-500 transition-colors hover:border-rose-400/50 hover:bg-rose-500/10 dark:border-slate-700 dark:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                  <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500">Saved to your profile</span>
                </div>
              </div>
            ) : uploading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-950 dark:text-white">Uploading resume...</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-500">{resumeFile?.name}</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${Math.round(uploadProgress)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`rounded-2xl border-2 border-dashed p-5 text-center transition-all cursor-pointer ${
                  isDragActive
                    ? 'border-sky-500 bg-sky-500/5'
                    : 'border-slate-300 bg-slate-50/50 hover:border-sky-500 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-sky-500'
                }`}
              >
                <input {...getInputProps()} />
                <FileUp className="text-sky-400 size-8 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-950 dark:text-white">
                  {isDragActive ? 'Drop your resume here...' : 'Click to upload or drag & drop your Resume'}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">PDF, DOC, DOCX up to 5MB</p>
              </div>
            )}

            {resumeError && (
              <p className="mt-2 text-xs font-medium text-rose-500 dark:text-rose-400">{resumeError}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Tech Stack / Skills</label>
            <input
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="React, Node.js, Python, Tailwind CSS"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Comma-separated tags, e.g. React, Node.js, Python</p>
          </div>

          <div>
            <label className={labelClass}>Character Sprite</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {SPRITE_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedSprite(emoji)}
                  className={`w-10 h-10 rounded-xl text-2xl flex items-center justify-center transition-all ${
                    selectedSprite === emoji
                      ? 'bg-sky-500/20 border-2 border-sky-500 shadow-lg shadow-sky-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-sky-500/50'
                  }`}
                  aria-label={`Select ${emoji} as avatar`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">This character represents you on the learning roadmap.</p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-200 hover:from-sky-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, refreshProfile } = useAuth()
  const {
    loading, error, profile, authUser, refresh, xp, streak,
    solvedCount, badges, skills, league, nextLeague, leaguePct, activity, updateSkills,
  } = useProfileData()
  const [editOpen, setEditOpen] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [skillBusy, setSkillBusy] = useState(false)
  const [skillMsg, setSkillMsg] = useState('')
  const [highlightAchievements, setHighlightAchievements] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const avatarInputRef = useRef(null)
  const location = useLocation()

  // Resolve the user's membership tier (EXCLUSIVE / PRO / COURSE BUYER /
  // FREE / ADMIN) from their live plan, major-track enrollments, and
  // completed paid-course transactions.
  const { tier: tierKey, loading: tierLoading } = useUserTier()
  const tierMeta = TIER_META[tierKey] || TIER_META.free

  const displayName = profile?.full_name || authUser?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'
  const headline = profile?.headline || 'Student at IH Academy'
  const email = authUser?.email || user?.email || ''
  const initial = (displayName[0] || 'S').toUpperCase()
  const userSprite = profile?.sprite || initial
  const track = profile?.track || null
  const profileLocation = profile?.location || null
  const resumeUrl = profile?.resume_url || null

  useEffect(() => {
    if (window.location.hash === '#achievements') {
      const element = document.getElementById('achievements')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setHighlightAchievements(true)
        const timer = setTimeout(() => setHighlightAchievements(false), 2500)
        return () => clearTimeout(timer)
      }
    }
  }, [location])

  const addSkill = async () => {
    const s = (skillInput || '').trim()
    if (!s || skills.includes(s)) { setSkillInput(''); return }
    setSkillBusy(true)
    setSkillMsg('')
    try {
      await updateSkills([...skills, s])
      setSkillInput('')
      setSkillMsg('Skill added')
    } catch {
      setSkillMsg('Could not add skill')
    }
    setSkillBusy(false)
  }

  const removeSkill = async (skill) => {
    setSkillBusy(true)
    setSkillMsg('')
    try {
      await updateSkills(skills.filter((x) => x !== skill))
      setSkillMsg('Skill removed')
    } catch {
      setSkillMsg('Could not remove skill')
    }
    setSkillBusy(false)
  }

  const openEdit = () => setEditOpen(true)
  const onSaved = () => { refresh(); setEditOpen(false) }

  const handleAvatarPick = () => avatarInputRef.current?.click()

  const handleAvatarFile = async (e) => {
    const file = e.target.files ? e.target.files[0] : null
    e.target.value = ''
    if (!file || avatarUploading) return
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image too large — maximum size is 5MB.')
      return
    }

    setAvatarError('')
    const objectUrl = URL.createObjectURL(file)
    setAvatarPreview(objectUrl)
    setAvatarUploading(true)
    try {
      const secureUrl = await uploadImageToCloudinary(file, { folder: 'avatars' })
      if (!secureUrl) throw new Error('Cloudinary did not return an image URL.')

      // Keep auth metadata in sync so a future OAuth re-sync doesn't revert
      // to the provider's original avatar.
      try { await supabase.auth.updateUser({ data: { avatar_url: secureUrl } }) } catch {}

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: secureUrl, updated_at: new Date().toISOString() })
        .eq('id', user?.id)
      if (updateError) throw updateError

      // Keep the user's existing chat messages showing the new avatar too.
      try {
        await supabase.from('community_messages').update({ user_avatar: secureUrl }).eq('user_id', user?.id)
      } catch {}

      // Global sync — refreshProfile() re-hydrates the shared profile state so
      // the header avatar, user dropdown and new chat messages update instantly.
      await refreshProfile()
      await refresh()
    } catch (err) {
      setAvatarError(err?.message || 'Avatar upload failed. Please try again.')
    } finally {
      URL.revokeObjectURL(objectUrl)
      setAvatarPreview(null)
      setAvatarUploading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 slide-in-from-bottom-2">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">My Profile</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-500">
            Your stats, league, and achievements — live from the database
          </p>
        </div>
        <button
          onClick={openEdit}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-200 hover:from-sky-400 hover:to-indigo-400"
        >
          <Pencil className="h-4 w-4" /> Edit Profile
        </button>
      </div>

      {/* Profile summary card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0f1420]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sky-500/10 to-transparent dark:from-cyan-400/[0.07]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-start">
<div className="group relative shrink-0">
            {loading ? (
              <Skeleton className="h-20 w-20 rounded-full" />
            ) : (
              <>
                <div className={`h-20 w-20 rounded-full bg-gradient-to-br p-[3px] ${tierMeta.gradient}`}>
                  <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white text-2xl font-bold uppercase text-slate-950 dark:bg-[#0f1420]/80 dark:text-white">
                    {avatarPreview || profile?.avatar_url ? (
                      <img
                        src={avatarPreview || profile.avatar_url}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : typeof userSprite === 'string' && userSprite.length <= 4 ? (
                      <span className="text-3xl">{userSprite}</span>
                    ) : (
                      initial
                    )}

                    {avatarUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-[1px]">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Camera overlay — appears on hover, opens the file picker */}
                <button
                  type="button"
                  onClick={handleAvatarPick}
                  disabled={avatarUploading}
                  title="Change profile photo"
                  aria-label="Change profile photo"
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/0 text-white opacity-0 transition-all duration-200 hover:bg-slate-900/40 hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed"
                >
                  <Camera className="h-5 w-5 drop-shadow-md" />
                </button>

                <span className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full border-4 border-white bg-emerald-500 dark:border-[#111827]" />

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFile}
                />
              </>
            )}
            {avatarError && !loading && (
              <p className="mt-2 max-w-[80px] text-center text-[11px] font-medium leading-tight text-rose-500 dark:text-rose-400">
                {avatarError}
              </p>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-bold tracking-tight text-slate-950 dark:text-white">{displayName}</h2>
                  {track && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-xs font-bold text-cyan-600 dark:text-cyan-300">
                      <Sparkles className="h-3 w-3" /> {track}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:border-emerald-800/50 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Active Student
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${leagueStyles[league] || leagueStyles.Bronze}`}>
                    {league} League
                  </span>
                  {!tierLoading && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${tierMeta.badge}`}>
                      {tierMeta.icon}
                      {tierMeta.label}
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">{headline}</p>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 shrink-0" /> {email}
                  </span>
                  {profileLocation && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" /> {profileLocation}
                    </span>
                  )}
                </div>
              </>
            )}

            {profile?.bio && !loading && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-500">{profile.bio}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <SocialButton icon={Globe} label="Portfolio" href={profile?.portfolio_url || null} onAdd={openEdit} loading={loading} />
              <SocialButton icon={GitBranch} label="GitHub" href={profile?.github_url || null} onAdd={openEdit} loading={loading} />
              <SocialButton icon={Briefcase} label="LinkedIn" href={profile?.linkedin_url || null} onAdd={openEdit} loading={loading} />
              <SocialButton icon={FileText} label="Resume" href={resumeUrl} onAdd={openEdit} loading={loading} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Zap} label="Total XP" value={xp.toLocaleString()} iconBg="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400" loading={loading} />
        <StatCard icon={Flame} label="Current Streak" value={`${streak} days`} iconBg="bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400" loading={loading} />
        <StatCard icon={CheckCircle2} label="Solved Challenges" value={solvedCount} iconBg="bg-sky-100 text-sky-600 dark:bg-blue-950 dark:text-blue-400" loading={loading} />
        <StatCard icon={Award} label="Badges Earned" value={badges.length} iconBg="bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400" loading={loading} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* League & XP progress */}
        <div className={`${cardBase} p-6`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-slate-950 dark:text-white">League Progress</h3>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${leagueStyles[league] || leagueStyles.Bronze}`}>
              {league} League
            </span>
          </div>

          {loading ? (
            <div className="mt-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          ) : (
            <>
              <div className="mt-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-950 dark:text-white">{xp.toLocaleString()} XP</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
                    {nextLeague
                      ? `${xp.toLocaleString()} XP — ${nextLeague} next`
                      : 'Max league reached — Legendary!'}
                  </p>
                </div>
                <span className="text-xs font-bold text-sky-600 dark:text-cyan-400">{leaguePct}%</span>
              </div>

              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-700 ease-out"
                  style={{ width: `${leaguePct}%` }}
                />
              </div>

              <div className="mt-4 flex justify-between">
                {LEAGUE_TIERS.map((l) => {
                  const Icon = leagueIcons[l.name] || Trophy
                  const reached = xp >= l.min
                  return (
                    <span
                      key={l.name}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                        reached ? 'text-sky-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-600'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" /> {l.name}
                    </span>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Tech stack & skills */}
        <div className={`${cardBase} p-6`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-sky-600 dark:text-cyan-400" />
              <h3 className="font-semibold text-slate-950 dark:text-white">Tech Stack & Skills</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-500">{skills.length} skills</span>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
              placeholder="Add a skill (e.g. React)"
              disabled={skillBusy}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-950 placeholder:text-slate-500 transition-all duration-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-800 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500"
            />
            <button
              onClick={addSkill}
              disabled={skillBusy}
              className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-sky-500/20 transition-all duration-200 hover:from-sky-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {skillBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add
            </button>
          </div>
          {skillMsg && <p className="mt-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">{skillMsg}</p>}

          {loading ? (
            <div className="mt-5 flex flex-wrap gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          ) : skills.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_0_12px_rgba(34,211,238,0.06)] transition-all duration-200 hover:border-cyan-400/50 hover:text-cyan-600 dark:border-slate-700 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-cyan-400/50 dark:hover:text-cyan-300"
                >
                  {s}
                  <button
                    onClick={() => removeSkill(s)}
                    disabled={skillBusy}
                    title={`Remove ${s}`}
                    className="rounded-full p-0.5 text-slate-400 opacity-60 transition-all hover:bg-rose-500/10 hover:text-rose-500 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
              <Sparkles className="mx-auto h-6 w-6 text-slate-500 dark:text-slate-500" />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">No skills added yet</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">Add your tech stack to showcase what you build with.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity timeline */}
      <div className={`${cardBase} p-6`}>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-sky-600 dark:text-cyan-400" />
          <h3 className="font-semibold text-slate-950 dark:text-white">Recent Activity</h3>
        </div>

        {loading ? (
          <div className="mt-5 space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-3/4" />
          </div>
        ) : error ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">Could not load activity.</p>
        ) : activity.length > 0 ? (
          <div className="relative mt-5 space-y-5 pl-6">
            <span aria-hidden className="absolute bottom-2 left-[7px] top-2 w-px bg-slate-200 dark:bg-slate-800" />
            {activity.map((item) => {
              const meta = ACTIVITY_META[item.kind] || ACTIVITY_META.lesson
              const Icon = meta.icon
              return (
                <div key={item.id} className="relative">
                  <span aria-hidden className={`absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 bg-white dark:bg-[#0f1420] ${meta.dot}`} />
                  <div className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.chip}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">{item.sub}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">No activity yet — start learning to see it here!</p>
        )}
      </div>

      {/* Achievements */}
      <div
        id="achievements"
        className={`${cardBase} p-6 transition-all duration-500 scroll-mt-24 ${
          highlightAchievements
            ? 'border-sky-400/60 shadow-[0_0_24px_rgba(14,165,233,0.25)] ring-1 ring-sky-400/40'
            : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold text-slate-950 dark:text-white">Achievements</h3>
          {loading && <Skeleton className="ml-2 h-4 w-12" />}
        </div>
        {!loading && badges.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-amber-800/50 dark:bg-amber-950/60 dark:text-amber-300"
              >
                🏅 {b}
              </span>
            ))}
          </div>
        ) : (
          !loading && (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-500">Complete lessons and challenges to unlock badges.</p>
          )
        )}
      </div>

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={profile}
        onSaved={onSaved}
      />
    </div>
  )
}
