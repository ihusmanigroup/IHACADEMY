import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import CommunityContent from '../components/CommunityContent'
import { timeAgo } from '../lib/notificationHelpers'
import { supabase } from '../lib/supabase'
import {
  AlertTriangle, ArrowDown, Loader2, Lock, MessageSquare, Reply, Send,
  ShieldCheck, ThumbsUp, Trash2, X,
} from 'lucide-react'
import {
  deriveProfileTier, hasValidStoredTier, roleForTier, tierFromStorage,
  tierToStorage, TIER_META, useUserTier,
} from '../utils/userTier'

// Community card styling — derived from the shared TIER_META (single source of
// truth for badges/rings). Chat uses `chatBadge` (null hides the pill, e.g.
// COURSE BUYER) and the ADMIN icon is a lucide shield.
const TIERS = Object.fromEntries(
  Object.entries(TIER_META).map(([key, meta]) => [
    key,
    { ...meta, icon: key === 'admin' ? ShieldCheck : meta.icon, badge: meta.chatBadge },
  ])
)

function initials(name) {
  return String(name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 3500)
    return () => clearTimeout(id)
  }, [onClose])
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-950/90 px-5 py-3 text-sm font-medium text-red-300 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      {message}
    </div>
  )
}

// Generated avatar placeholder for users who never set a photo.
function avatarFallback(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || '?')}&background=0ea5e9&color=fff&bold=true&size=96`
}

function Avatar({ name, avatar, tierKey }) {
  const t = TIERS[tierKey] || TIERS.free
  if (avatar) {
    return <img src={avatar} alt={name} className={`h-9 w-9 shrink-0 rounded-full object-cover ${t.ring}`} />
  }
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold text-white ${t.gradient} ${t.ring}`}>
      {initials(name)}
    </div>
  )
}

function MessageCard({ m, userId, isAdmin, currentUserAvatar, authorTiers, confirmId, setConfirmId, onDelete, reactionCount, hasReacted, toggleReaction, onReply }) {
  // Normalize stored tier (handles 'COURSE_BUYER', 'course_buyer', 'Course_Buyer', etc.)
  const rawTier = (m.user_tier || '').toString().toLowerCase()
  const isCourseBuyer = rawTier === 'course_buyer'
  const isPro = rawTier === 'pro'
  const isExclusive = rawTier === 'exclusive'
  const isFree = rawTier === 'free'

  // DEBUG
  console.log('DEBUG MESSAGE TIER:', { id: m.id, rawTier, isCourseBuyer, isPro, isExclusive, isFree })

  const tierKey = isCourseBuyer ? 'course_buyer' : isPro ? 'pro' : isExclusive ? 'exclusive' : 'free'
  const tier = TIERS[tierKey] || TIERS.free
  const TierIcon = typeof tier.icon === 'string' || !tier.icon ? null : tier.icon
  const canDelete = isAdmin || m.user_id === userId
  const mine = m.user_id === userId
  const liked = hasReacted(m.id, 'like')
  const likeCount = reactionCount(m.id, 'like')

  // Render-level avatar override: the current user's own messages always use
  // their LIVE avatar from auth state, even if the historical `user_avatar`
  // snapshot on the row is stale (e.g. before the DB backfill landed).
  // Everyone else uses their stored avatar, falling back to a generated
  // placeholder when they never uploaded a photo.
  const activeAvatar =
    m.user_id === userId && currentUserAvatar
      ? currentUserAvatar
      : m.user_avatar || avatarFallback(m.user_name)

  return (
    <div className={`group rounded-xl border p-3 transition ${
      mine
        ? 'border-sky-200/80 bg-sky-50/60 dark:border-sky-500/25 dark:bg-sky-500/[0.06]'
        : 'border-slate-200/80 bg-white dark:border-slate-700/60 dark:bg-white/[0.02]'
    }`}>
      <div className="flex gap-3">
        <Avatar name={m.user_name} avatar={activeAvatar} tierKey={tierKey} />

        <div className="min-w-0 flex-1">
          {/* Author row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`text-sm font-bold ${tier.name}`}>{m.user_name}</span>
            {tier.label && tier.badge && (
              <span className={`inline-flex items-center gap-1 ${tier.badge}`}>
                {TierIcon ? <TierIcon className="w-3 h-3" /> : tier.icon}
                {tier.label}
              </span>
            )}
            <span className="text-[11px] text-slate-400">{timeAgo(m.created_at)}</span>

            {canDelete &&
              (confirmId === m.id ? (
                <span className="ml-auto inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onDelete(m.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-rose-700"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  aria-label="Delete message"
                  onClick={() => setConfirmId(m.id)}
                  className="ml-auto rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ))}
          </div>

          {/* Message content */}
          <div className="mt-1">
            <CommunityContent content={m.content} />
          </div>

          {/* Minimal actions */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleReaction(m.id, 'like')}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                liked
                  ? 'border-amber-300 bg-amber-500/10 text-amber-600 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-amber-200 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-amber-500/30' : ''}`} />
              {likeCount > 0 ? likeCount : 'Like'}
            </button>

            <button
              type="button"
              onClick={() => onReply(m)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-sky-200 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-sky-500/40 dark:hover:text-sky-300"
            >
              <Reply className="w-3.5 h-3.5" /> Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Community() {
  const { user, profile } = useAuth()
  const isAdmin = !!profile?.is_admin
  // Live avatar for the current user (auth state) — used to override their own
  // historical message rows at render time.
  const currentUserAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || ''

  // Resolve the user's tier straight from Supabase records (plan from profile
  // metadata + completed paid-course transactions) — shared with the Profile
  // page via utils/userTier.js. Strict hierarchy: EXCLUSIVE > PRO >
  // COURSE_BUYER > FREE.
  const { tier: myTier } = useUserTier()

  // Backfill the sender's historical messages on page load with their LIVE
  // avatar image and current tier, so every legacy row shows the correct
  // badge + avatar to all viewers. Realtime UPDATE events keep clients in sync.
  useEffect(() => {
    if (!user || !myTier) return
    supabase
      .from('community_messages')
      .update({
        user_avatar: currentUserAvatar || null,
        user_tier: tierToStorage(myTier),
        user_role: roleForTier(myTier),
      })
      .eq('user_id', user.id)
      .then(() => {})
      .catch(() => {})
  }, [user, myTier, currentUserAvatar])

  const [messages, setMessages] = useState([])
  const [reactionCounts, setReactionCounts] = useState({})
  const [myReactions, setMyReactions] = useState({})
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const meId = user?.id

  // Current profile tier for every message author (used to dynamically map
  // legacy rows that carry no valid stored tier). Own rows resolve with the
  // full transaction-aware tier; other authors use their public profile flags.
  // Enrollment in courses does NOT affect tier — only plan flags do.
  const [authorTiers, setAuthorTiers] = useState({})
  useEffect(() => {
    const ids = [...new Set(messages.map((m) => m.user_id).filter(Boolean))]
    const otherIds = ids.filter((id) => id !== meId)
    if (otherIds.length === 0) {
      if (meId && myTier) setAuthorTiers((prev) => ({ ...prev, [meId]: myTier }))
      return
    }
    let active = true
    supabase
      .from('profiles')
      .select('id, is_admin, is_pro, is_exclusive, plan')
      .in('id', otherIds)
      .then(({ data }) => {
        if (!active) return
        const map = {}
        for (const p of data || []) map[p.id] = deriveProfileTier(p)
        if (meId && myTier) map[meId] = myTier
        setAuthorTiers(map)
      })
      .catch(() => {})
    return () => { active = false }
  }, [messages, meId, myTier])

  // 1. Load every message + reaction row directly from the DB on page load,
  //    ordered oldest → newest (chronological feed).
  useEffect(() => {
    let active = true
    const load = async () => {
      const [msgResult, reactResult] = await Promise.all([
        supabase.from('community_messages').select('*').order('created_at', { ascending: true }),
        supabase.from('community_message_reactions').select('message_id, reaction, user_id'),
      ])
      if (!active) return

      if (msgResult.error) {
        setError(msgResult.error.message)
      } else {
        setMessages(msgResult.data || [])
      }

      if (!reactResult.error && reactResult.data) {
        const counts = {}
        const mine = {}
        for (const r of reactResult.data) {
          counts[r.message_id] = counts[r.message_id] || {}
          counts[r.message_id][r.reaction] = (counts[r.message_id][r.reaction] || 0) + 1
          if (r.user_id === meId) {
            mine[r.message_id] = mine[r.message_id] || {}
            mine[r.message_id][r.reaction] = true
          }
        }
        setReactionCounts(counts)
        setMyReactions(mine)
      }
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [meId])

  // 2. Realtime — INSERT appends the new message, DELETE removes it instantly
  //    (UPDATE keeps tier/avatar backfills in sync). Reactions bump counters.
  useEffect(() => {
    const channel = supabase
      .channel('community-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_messages' },
        (payload) => {
          setMessages((prev) =>
            prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]
          )
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_messages' },
        (payload) => setMessages((prev) => prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m)))
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'community_messages' },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id))
          setReactionCounts((prev) => {
            if (!prev[payload.old.id]) return prev
            const next = { ...prev }
            delete next[payload.old.id]
            return next
          })
          setMyReactions((prev) => {
            if (!prev[payload.old.id]) return prev
            const next = { ...prev }
            delete next[payload.old.id]
            return next
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_message_reactions' },
        (payload) => {
          const r = payload.new
          if (r.user_id === meId) {
            setMyReactions((prev) => {
              const next = { ...prev }
              const cur = next[r.message_id] || {}
              next[r.message_id] = { ...cur, [r.reaction]: true }
              return next
            })
          } else {
            setReactionCounts((prev) => {
              const next = { ...prev }
              const cur = next[r.message_id] || {}
              next[r.message_id] = { ...cur, [r.reaction]: (cur[r.reaction] || 0) + 1 }
              return next
            })
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'community_message_reactions' },
        (payload) => {
          const r = payload.old
          if (r.user_id === meId) {
            setMyReactions((prev) => {
              const next = { ...prev }
              const cur = next[r.message_id] || {}
              next[r.message_id] = { ...cur, [r.reaction]: false }
              return next
            })
          } else {
            setReactionCounts((prev) => {
              const next = { ...prev }
              const cur = next[r.message_id] || {}
              next[r.message_id] = { ...cur, [r.reaction]: Math.max(0, (cur[r.reaction] || 0) - 1) }
              return next
            })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [meId])

  // 3. Send a message — persist straight to the DB with the author's live
  //    name, Cloudinary avatar, and resolved tier (EXCLUSIVE / PRO /
  //    COURSE_BUYER / FREE).
  const sendMessage = async (content, opts = {}) => {
    const text = String(content || '').trim()
    if (!text) return { success: false, message: 'Message cannot be empty.' }
    if (!user) return { success: false, message: 'Sign in to join the conversation.' }

    const tier = opts.tier || myTier
    setSending(true)
    try {
      const { data, error: insertError } = await supabase
        .from('community_messages')
        .insert({
          user_id: user.id,
          user_name: profile?.full_name || user.user_metadata?.full_name || user.email || 'Developer',
          user_avatar: profile?.avatar_url || user.user_metadata?.avatar_url || null,
          content: text,
          user_role: roleForTier(tier),
          user_tier: tierToStorage(tier),
          topic: opts.topic || 'General',
          reply_to_id: opts.replyToId || null,
        })
        .select()
        .single()

      if (insertError) return { success: false, message: insertError.message }
      // Authoritative row — the realtime INSERT echo is deduped by id.
      if (data) {
        setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]))
      }
      return { success: true }
    } finally {
      setSending(false)
    }
  }

  const deleteMessage = async (id) => {
    const { error: deleteError } = await supabase.from('community_messages').delete().eq('id', id)
    if (deleteError) return { success: false, message: deleteError.message }
    // Optimistic local removal; the realtime DELETE echo makes it idempotent.
    setMessages((prev) => prev.filter((m) => m.id !== id))
    return { success: true }
  }

  const toggleReaction = async (messageId, reaction) => {
    if (!user) return { success: false, message: 'Sign in to react.' }
    const hadIt = !!myReactions[messageId]?.[reaction]

    setMyReactions((prev) => {
      const next = { ...prev }
      const cur = next[messageId] || {}
      next[messageId] = { ...cur, [reaction]: !hadIt }
      return next
    })
    if (hadIt) {
      const { error: delError } = await supabase
        .from('community_message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('reaction', reaction)
      if (delError) {
        setMyReactions((prev) => {
          const next = { ...prev }
          const cur = next[messageId] || {}
          next[messageId] = { ...cur, [reaction]: true }
          return next
        })
        return { success: false, message: delError.message }
      }
    } else {
      const { error: insError } = await supabase
        .from('community_message_reactions')
        .insert({ message_id: messageId, user_id: user.id, reaction })
      if (insError) {
        setMyReactions((prev) => {
          const next = { ...prev }
          const cur = next[messageId] || {}
          next[messageId] = { ...cur, [reaction]: false }
          return next
        })
        return { success: false, message: insError.message }
      }
    }
    return { success: true }
  }

  const reactionCount = (messageId, reaction) => reactionCounts[messageId]?.[reaction] || 0
  const hasReacted = (messageId, reaction) => !!myReactions[messageId]?.[reaction]

  const [draft, setDraft] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [toast, setToast] = useState(null)
  const [atBottom, setAtBottom] = useState(true)

  const listRef = useRef(null)
  const stickRef = useRef(true)

  // Keep the newest message in view when already near the bottom.
  const handleScroll = () => {
    const el = listRef.current
    if (!el) return
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 90
    stickRef.current = near
    setAtBottom(near)
  }

  const scrollToBottom = (smooth = false) => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  }

  useEffect(() => {
    if (stickRef.current) scrollToBottom()
  }, [messages.length])

  const submit = async (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || sending) return
    const result = await sendMessage(text, {
      topic: 'General',
      replyToId: replyTo?.id || null,
      tier: myTier,
    })
    if (result.success) {
      setDraft('')
      setReplyTo(null)
      stickRef.current = true
      scrollToBottom()
    } else {
      setToast(result.message)
    }
  }

  const onDelete = async (id) => {
    const result = await deleteMessage(id)
    setConfirmId(null)
    if (!result.success) setToast(result.message)
  }

  const onReact = async (id, reaction) => {
    const result = await toggleReaction(id, reaction)
    if (!result.success) setToast(result.message)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Developer Community</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-500">
          Live chat with the IH Academy community — ask questions and share wins in real time.
        </p>
      </div>

      {/* Feed */}
      <div className="relative flex h-[calc(100vh-20rem)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111827]">
        {error && (
          <p className="flex items-start gap-1.5 border-b border-rose-200/80 bg-rose-50/80 px-4 py-2 text-xs font-medium text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" /> Failed to load messages: {error}
          </p>
        )}

        {/* Message feed */}
        <div ref={listRef} onScroll={handleScroll} className="flex-1 space-y-3 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-xs font-medium">Loading conversation…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No messages yet — say hi!</p>
              <p className="text-xs text-slate-500">Be the first to start the conversation.</p>
            </div>
          ) : (
            messages.map((m) => (
              <MessageCard
                key={m.id}
                m={m}
                userId={user?.id}
                currentUserAvatar={currentUserAvatar}
                isAdmin={isAdmin}
                authorTiers={authorTiers}
                confirmId={confirmId}
                setConfirmId={setConfirmId}
                onDelete={onDelete}
                reactionCount={reactionCount}
                hasReacted={hasReacted}
                toggleReaction={onReact}
                onReply={(msg) => setReplyTo({ id: msg.id, userName: msg.user_name })}
              />
            ))
          )}
        </div>

        {/* Jump to latest */}
        {!atBottom && messages.length > 0 && (
          <button
            type="button"
            onClick={() => { stickRef.current = true; scrollToBottom(true) }}
            className="absolute bottom-20 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-lg transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <ArrowDown className="w-3.5 h-3.5" /> Jump to latest
          </button>
        )}

        {/* Input bar */}
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          {user ? (
            <div>
              {replyTo && (
                <div className="mb-2 flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50/70 px-3 py-1.5 text-xs font-medium text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
                  <Reply className="w-3 h-3 shrink-0" />
                  <span className="truncate">Replying to <span className="font-bold">@{replyTo.userName}</span></span>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="ml-auto rounded p-0.5 text-sky-500 transition hover:bg-sky-100 dark:hover:bg-sky-500/20"
                    aria-label="Cancel reply"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <form onSubmit={submit} className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message…"
                  maxLength={2000}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-950 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:focus:border-sky-500"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
                </button>
              </form>
            </div>
          ) : (
            <p className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-500 dark:border-slate-700">
              <Lock className="w-4 h-4" /> Sign in to join the conversation
            </p>
          )}
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}