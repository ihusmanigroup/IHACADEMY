import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Settings, Trophy, LogOut, ChevronDown, Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { TIER_META, useUserTier } from '../utils/userTier'

export default function UserDropdown() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Resolve the current user's membership tier for badge + avatar ring styling.
  const { tier: tierKey, loading: tierLoading } = useUserTier()
  const tierMeta = TIER_META[tierKey] || TIER_META.free
  const tierBadgeClass = useMemo(
    () =>
      tierMeta.badge ||
      'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500',
    [tierMeta]
  )
  const avatarRingClass = useMemo(() => tierMeta.ring || 'ring-1 ring-slate-200', [tierMeta])

  const userInitial = (profile?.full_name?.[0] || user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const username = profile?.username || user?.email?.split('@')[0] || 'student'
  const xp = profile?.xp ?? 0

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  function handleNav(path) {
    setOpen(false)
    navigate(path)
  }

  async function handleLogout() {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  const menuItem =
    'flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-slate-300 text-sm font-medium hover:bg-sky-500/15 hover:text-white transition-all duration-150 cursor-pointer'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 pl-3 transition-opacity duration-200 hover:opacity-80 cursor-pointer"
      >
        <div className="relative">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${tierMeta.gradient} flex items-center justify-center text-xs font-bold text-white overflow-hidden ${avatarRingClass}`}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              userInitial
            )}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#0f1420]/80 rounded-full" />
        </div>
        <span className="text-sm font-semibold text-slate-800 dark:text-white transition-colors duration-300 hidden lg:inline">
          {displayName}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-50 min-w-[270px] p-3 bg-[#0c162d]/95 backdrop-blur-xl border border-sky-500/20 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.5)] text-slate-200 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
          {/* ─── Profile Header ─── */}
          <div className="p-1 mb-1.5">
             <div className="flex items-center gap-3">
               <div className="relative shrink-0">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden ${tierMeta.gradient} ${avatarRingClass}`}>
                   {profile?.avatar_url ? (
                     <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                   ) : (
                     userInitial
                   )}
                 </div>
                 <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0c162d] rounded-full" />
               </div>
               <div className="min-w-0 flex-1">
                 <p className="font-semibold text-base text-white truncate">{displayName}</p>
                 <p className="text-xs text-slate-400 truncate">@{username}</p>
                 {!tierLoading && (
                   <span className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${tierBadgeClass}`}>
                     {tierMeta.label}
                   </span>
                 )}
               </div>
             </div>
          </div>

          {/* ─── Navigation List ─── */}
          <div className="py-1">
            <button onClick={() => handleNav('/profile')} className={menuItem}>
              <User className="text-sky-400 size-4 stroke-[2]" />
              <span>My Profile</span>
            </button>
            <button onClick={() => handleNav('/settings')} className={menuItem}>
              <Settings className="text-sky-400 size-4 stroke-[2]" />
              <span>Account Settings</span>
            </button>
            <button
              onClick={() => {
                navigate('/profile#achievements')
                setOpen(false)
              }}
              className={menuItem}
            >
              <Trophy className="text-sky-400 size-4 stroke-[2]" />
              <span className="flex-1">My Achievements</span>
              <span className="flex items-center gap-1 ms-auto bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs px-2 py-0.5 rounded-md font-semibold">
                <Zap className="w-3 h-3" /> {xp.toLocaleString()} XP
              </span>
            </button>
          </div>

          <div className="border-t border-slate-800/80 my-1.5" />
          <div className="py-1">
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition-all duration-150 cursor-pointer">
              <LogOut className="text-sky-400 size-4 stroke-[2]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
