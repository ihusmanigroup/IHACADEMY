import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { TIER_META, useUserTier } from '../utils/userTier'
import {
  User, Shield, SettingsIcon, Crown, CheckCircle, X,
  Camera, Code2, Globe, BriefcaseBusiness, Save, Loader2, Key, Eye, EyeOff,
  Mail, Moon, Sun, Monitor, Bell, Award, Zap, Flame, ExternalLink, BookOpen,
  ReceiptText, CreditCard, CalendarDays, TrendingUp,
} from 'lucide-react'

const SKILL_PRESETS = ['React', 'Node.js', 'Python', 'SQL', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Git', 'Docker', 'PostgreSQL', 'MongoDB', 'GraphQL', 'REST APIs', 'JavaScript', 'HTML/CSS']

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 3500)
    return () => clearTimeout(id)
  }, [])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all animate-[fadeIn_0.2s_ease-out] ${
      type === 'success'
        ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
        : 'bg-red-950/90 border-red-500/30 text-red-300'
    }`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
      {message}
    </div>
  )
}

export default function Settings() {
  const { user, profile, refreshProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const fileInputRef = useRef(null)

  const isProfileView = location.pathname === '/dashboard/profile'
  const isBillingView = location.pathname === '/dashboard/billing'

  // Membership tier for avatar ring + badge on the profile view.
  const { tier: tierKey, loading: tierLoading } = useUserTier()
  const tierMeta = TIER_META[tierKey] || TIER_META.free
  const avatarRingClass = useMemo(
    () => tierMeta.ring || 'ring-1 ring-slate-200',
    [tierMeta]
  )

  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [skillTags, setSkillTags] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [changingPw, setChangingPw] = useState(false)

  const [emailNotifs, setEmailNotifs] = useState({ course_updates: true, certificate_alerts: true, arena_announcements: true, career_opportunities: true })
  const [certCount, setCertCount] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [txLoading, setTxLoading] = useState(true)

  const showToast = useCallback((msg, type) => {
    setToast({ message: msg, type: type || 'success' })
  }, [])

  useEffect(() => {
    if (!profile) return
    try {
      setFullName(profile.full_name || '')
      setAvatarUrl(profile.avatar_url || '')
      setUsername(profile.username || '')
      setHeadline(profile.headline || '')
      setBio(profile.bio || '')
      setSkillTags(Array.isArray(profile.skill_tags) ? profile.skill_tags : [])
      setGithubUrl(profile.github_url || '')
      setLinkedinUrl(profile.linkedin_url || '')
      setPortfolioUrl(profile.portfolio_url || '')
      if (profile.email_notifications) {
        try {
          const n = typeof profile.email_notifications === 'string' ? JSON.parse(profile.email_notifications) : profile.email_notifications
          if (n && typeof n === 'object') {
            setEmailNotifs(prev => ({ ...prev, ...n }))
          }
        } catch {}
      }
    } catch {}
  }, [profile])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      try {
        const { count } = await supabase
          .from('enrollments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed')
        if (!cancelled) setCertCount(count || 0)
      } catch {}
    })()
    return () => { cancelled = true }
  }, [user])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      setTxLoading(true)
      try {
        const { data } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (!cancelled) setTransactions(data || [])
      } catch {}
      if (!cancelled) setTxLoading(false)
    })()
    return () => { cancelled = true }
  }, [user])

  const handleAvatarUpload = async (e) => {
    const file = e.target.files ? e.target.files[0] : null
    if (!file || !user) return
    setAvatarUploading(true)
    try {
      const ext = (file.name || '').split('.').pop()
      const filePath = 'avatars/' + user.id + '_' + Date.now() + '.' + ext
      const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      setAvatarUrl(publicUrl)
      await refreshProfile()
      showToast('Avatar updated successfully!', 'success')
    } catch (err) {
      showToast((err && err.message) || 'Avatar upload failed', 'error')
    }
    setAvatarUploading(false)
  }

  const addSkill = (skill) => {
    const s = (skill || '').trim()
    if (s && !(skillTags || []).includes(s)) setSkillTags([].concat(skillTags || [], [s]))
    setSkillInput('')
  }

  const removeSkill = (skill) => setSkillTags((skillTags || []).filter(s => s !== skill))

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName || '',
        username: username || null,
        headline: headline || null,
        bio: bio || null,
        skill_tags: skillTags || [],
        github_url: githubUrl || null,
        linkedin_url: linkedinUrl || null,
        portfolio_url: portfolioUrl || null,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      await refreshProfile()
      showToast('Profile updated successfully!', 'success')
    } catch (err) {
      showToast((err && err.message) || 'Failed to save profile', 'error')
    }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) return showToast('Password must be at least 6 characters', 'error')
    if (newPassword !== confirmPassword) return showToast('Passwords do not match', 'error')
    setChangingPw(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      showToast('Password changed successfully!', 'success')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (err) {
      showToast((err && err.message) || 'Failed to change password', 'error')
    }
    setChangingPw(false)
  }

  const handleSavePreferences = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        email_notifications: emailNotifs,
        theme,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      await refreshProfile()
      showToast('Preferences saved successfully!', 'success')
    } catch (err) {
      showToast((err && err.message) || 'Failed to save preferences', 'error')
    }
    setSaving(false)
  }

  const displayName = (profile && profile.full_name) || (user && user.user_metadata && user.user_metadata.full_name) || (user && user.email && user.email.split('@')[0]) || 'User'
  const initials = displayName && displayName.length > 0 ? displayName[0] : 'U'
  const isOAuth = user && user.app_metadata && (user.app_metadata.provider === 'google' || user.app_metadata.provider === 'github')

  const formatBillingDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  const latestPlanTx = transactions.find((t) => t.item_type === 'plan')
  const activePlanName = latestPlanTx ? latestPlanTx.item_name : 'IH Academy Free Tier'
  const totalSpent = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  return (
    <div className="min-h-screen bg-white dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {isProfileView ? 'My Profile' : isBillingView ? 'Billing & Purchases' : 'Account Settings'}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
            {isProfileView
              ? 'Manage your public developer profile'
              : isBillingView
                ? 'Your transactions, invoices, and active plan'
                : 'Manage your preferences, security, and plan'}
          </p>
        </div>

        {isProfileView ? (
          <div className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 transition-colors duration-300">
            <div className="flex items-start gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="relative shrink-0">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white overflow-hidden ${tierMeta.gradient} ${avatarRingClass}`}>
                  {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
                </div>
                <button
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  disabled={avatarUploading}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#6366F1] hover:bg-[#5558E6] text-white flex items-center justify-center border-2 border-white dark:border-[#0f1420]/80 transition-colors"
                >
                  {avatarUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">{displayName}</h2>
                  {!tierLoading && tierKey !== 'free' && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tierMeta.badge}`}>
                      {tierMeta.label}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{user && user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-sky-600 dark:focus:border-cyan-400 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="yourhandle" className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-sky-600 dark:focus:border-cyan-400 transition-colors" />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">Headline / Target Role</label>
                <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Full-Stack Developer" className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-sky-600 dark:focus:border-cyan-400 transition-colors" />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">Bio <span className="text-slate-600 dark:text-slate-300 font-normal">({(bio || '').length}/240)</span></label>
                <textarea value={bio} onChange={e => setBio((e.target.value || '').slice(0, 240))} rows={3} placeholder="Tell us about yourself..." className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-sky-600 dark:focus:border-cyan-400 transition-colors resize-none" />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">Technical Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(skillTags || []).map(s => (
                    <span key={s} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-sky-600 dark:text-cyan-400 border border-cyan-400/20">
                      {s}
                      <button onClick={() => removeSkill(s)} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                    <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput) } }} placeholder="Type a skill and press Enter" className="flex-1 bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-sky-600 dark:focus:border-cyan-400 transition-colors" />
                    <button onClick={() => addSkill(skillInput)} className="px-3 py-2 rounded-lg bg-[#6366F1] hover:bg-[#5558E6] text-white text-sm font-medium transition-colors">Add</button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {(SKILL_PRESETS || []).filter(s => !(skillTags || []).includes(s)).slice(0, 6).map(s => (
                      <button key={s} onClick={() => addSkill(s)} className="text-[10px] px-2 py-0.5 rounded-full border border-dashed border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-cyan-400/30 hover:text-sky-600 dark:hover:text-cyan-400 transition-colors">+ {s}</button>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">Professional Links</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Code2 className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                    <input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/yourhandle" className="flex-1 bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-sky-600 dark:focus:border-cyan-400 transition-colors" />
                  </div>
                  <div className="flex items-center gap-3">
                    <BriefcaseBusiness className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                    <input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourhandle" className="flex-1 bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-sky-600 dark:focus:border-cyan-400 transition-colors" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                    <input value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="https://yourportfolio.com" className="flex-1 bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-sky-600 dark:focus:border-cyan-400 transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#5558E6] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        ) : isBillingView ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 transition-colors duration-300">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sky-600 dark:text-cyan-400" /> Active Plan & Summary
              </h3>

              <div className="flex items-center justify-between bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">IH</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{activePlanName}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {latestPlanTx
                        ? `Subscribed on ${formatBillingDate(latestPlanTx.created_at)}`
                        : 'All courses free — unlimited access'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Active</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Total Spent</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalSpent > 0 ? `$${totalSpent}` : '$0'}</p>
                </div>
                <div className="bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                      <ReceiptText className="w-5 h-5 text-indigo-500" />
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Purchases</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{transactions.length}</p>
                </div>
                <div className="bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-amber-500" />
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Active Plan</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">{activePlanName}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 transition-colors duration-300">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-sky-600 dark:text-cyan-400" /> Transaction History
              </h3>

              {txLoading ? (
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm py-6">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading your transactions...
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-10">
                  <ReceiptText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No transactions yet</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">When you select a plan or buy a course, it will appear here.</p>
                  <Link to="/pricing" className="inline-flex items-center gap-2 mt-4 bg-[#6366F1] hover:bg-[#5558E6] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
                    <CreditCard className="w-4 h-4" /> View Plans
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-4 bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.item_type === 'plan'
                          ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-600 dark:text-cyan-400'
                          : 'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        {tx.item_type === 'plan' ? <Crown className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{tx.item_name}</p>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            tx.item_type === 'plan'
                              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                              : 'bg-indigo-500/10 text-indigo-500'
                          }`}>{tx.item_type}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-1.5">
                          <CalendarDays className="w-3 h-3" /> {formatBillingDate(tx.created_at)}
                          <span className="text-slate-400 dark:text-slate-500">·</span> #{tx.id.slice(0, 8)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{Number(tx.amount) > 0 ? `$${Number(tx.amount)}` : 'Free'}</p>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 mt-1 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {tx.status || 'completed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 transition-colors duration-300">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-sky-600 dark:text-cyan-400" /> General & Preferences
              </h3>

              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-3">System Theme</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'dark', label: 'Dark Mode', icon: Moon, activeCls: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300' },
                    { key: 'light', label: 'Light Mode', icon: Sun, activeCls: 'bg-amber-500/15 border-amber-500/40 text-amber-500' },
                    { key: 'system', label: 'System (Auto)', icon: Monitor, activeCls: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400' },
                  ].map((opt) => {
                    const Icon = opt.icon
                    const isActive = theme === opt.key
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setTheme(opt.key)}
                        className={`flex flex-col items-center justify-center gap-2.5 px-4 py-4 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                          isActive
                            ? opt.activeCls
                            : 'bg-white dark:bg-[#07090e] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3">
                  {theme === 'system'
                    ? 'Following your device (OS) light/dark preference automatically.'
                    : 'Theme is persisted automatically in your browser.'}
                </p>
              </div>

              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-3">Email Notifications</h4>
                <div className="space-y-3">
                  {[
                    { key: 'course_updates', label: 'Course Updates & New Lessons', desc: 'Get notified when new content is published' },
                    { key: 'certificate_alerts', label: 'Certificate Generation Alerts', desc: 'Receive alerts when certificates are issued' },
                    { key: 'arena_announcements', label: 'Arena Hackathon & Challenge Announcements', desc: 'Stay updated on competitions and events' },
                    { key: 'career_opportunities', label: 'Career & Internship Opportunities', desc: 'Be the first to know about new openings' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setEmailNotifs(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className={`relative w-10 h-5 rounded-full transition-colors ${emailNotifs[item.key] ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${emailNotifs[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSavePreferences} disabled={saving} className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#5558E6] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 transition-colors duration-300">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-sky-600 dark:text-cyan-400" /> Security & Plan
              </h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-600 dark:text-slate-300">Registered Email</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user && user.email}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Verified</span>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isOAuth ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'bg-amber-50 dark:bg-amber-500/10'}`}>
                    <Shield className={`w-5 h-5 ${isOAuth ? 'text-indigo-500' : 'text-amber-500'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-600 dark:text-slate-300">Security Status</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {isOAuth ? 'OAuth Provider Login' : 'Email & Password Login'}
                    </p>
                  </div>
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
                    {isOAuth ? 'Google / GitHub' : 'Password'}
                  </span>
                </div>
              </div>

              {!isOAuth && (
                <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-3">Change Password</h4>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">New Password</label>
                      <div className="relative">
                        <input type={showPw.new ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-sky-600 dark:focus:border-cyan-400 transition-colors" />
                        <button onClick={() => setShowPw({ ...showPw, new: !showPw.new })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                          {showPw.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <input type={showPw.confirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" className="w-full bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-sky-600 dark:focus:border-cyan-400 transition-colors" />
                        <button onClick={() => setShowPw({ ...showPw, confirm: !showPw.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                          {showPw.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button onClick={handleChangePassword} disabled={changingPw || !newPassword} className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#5558E6] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50">
                      {changingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                      {changingPw ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-3">Current Plan</h4>
                <div className="flex items-center justify-between bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">IH</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">IH Academy Free Tier</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">All courses free — unlimited access</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Active</span>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-3">Stats</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-indigo-500" />
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Total XP</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{(profile && profile.xp) || 0}</p>
                  </div>
                  <div className="bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-amber-500" />
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Streak</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{(profile && profile.streak_count) || 0} days</p>
                  </div>
                  <div className="bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                        <Award className="w-5 h-5 text-emerald-500" />
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Certificates</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{certCount}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-3">Quick Links</h4>
                <div className="flex flex-wrap gap-3">
                  <Link to="/certifications" className="flex items-center gap-2 bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 hover:border-cyan-400/30 transition-all">
                    <Award className="w-4 h-4 text-amber-500" /> View Certifications <ExternalLink className="w-3 h-3" />
                  </Link>
                  <Link to="/courses" className="flex items-center gap-2 bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 hover:border-cyan-400/30 transition-all">
                    <BookOpen className="w-4 h-4 text-sky-600 dark:text-cyan-400" /> Browse Courses <ExternalLink className="w-3 h-3" />
                  </Link>
                  <Link to="/dashboard" className="flex items-center gap-2 bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 hover:border-cyan-400/30 transition-all">
                    <User className="w-4 h-4 text-indigo-500" /> Dashboard Home <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
