import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

// The `notifications` table is not yet deployed (no migration exists), so every
// Supabase call against it returns HTTP 404 (PGRST116 "relation not found") and
// spams the console. Gate ALL DB access behind this flag. Until the table is
// created and this is flipped on (VITE_NOTIFICATIONS_ENABLED=true), the Activity
// Hub runs purely on the local-storage fallback and makes zero network calls.
const NOTIFICATIONS_DB_ENABLED = import.meta.env.VITE_NOTIFICATIONS_ENABLED === 'true'

// ---------------------------------------------------------------------------
// Localized persistent state (fallback). Used when the user is signed out or
// when the Supabase `notifications` table is unreachable/empty. The seed below
// gives the Activity Hub its first-run content so the dropdown never looks bare.
// ---------------------------------------------------------------------------
const LOCAL_KEY = 'ih_notifications_v1'

const nowIso = (offsetMin = 0) => new Date(Date.now() - offsetMin * 60000).toISOString()

const SEED_NOTIFICATIONS = [
  {
    id: 'seed-1', user_id: 'local', type: 'leaderboard',
    title: 'Leaderboard & Ranks',
    message: 'Rank Updated! You moved up to #2 place in Bronze League.',
    link: '/leaderboard', is_read: false, created_at: nowIso(5),
  },
  {
    id: 'seed-2', user_id: 'local', type: 'course',
    title: 'Course Activity',
    message: 'Module completed! You earned 50 XP in Generative AI Engineering.',
    link: '/course/genai', is_read: false, created_at: nowIso(60 * 4),
  },
  {
    id: 'seed-3', user_id: 'local', type: 'internship',
    title: 'Internship & Submissions',
    message: 'Your Assignment #1: REST Notes API submission is under review.',
    link: '/intern-portal', is_read: false, created_at: nowIso(60 * 24),
  },
  {
    id: 'seed-4', user_id: 'local', type: 'ai',
    title: 'AI Tutor',
    message: 'Your Overall Course Master Notes are ready for download.',
    link: '/ml-major-course', is_read: false, created_at: nowIso(60 * 24 * 2),
  },
  {
    id: 'seed-5', user_id: 'local', type: 'activity',
    title: 'Activity',
    message: 'You completed 3 lessons today — keep the streak going!',
    link: '/dashboard', is_read: false, created_at: nowIso(60 * 24 * 3),
  },
  {
    id: 'seed-6', user_id: 'local', type: 'system',
    title: 'System / Announcements',
    message: 'Winter Internship 2026-27 schedule updated.',
    link: '/internship', is_read: true, created_at: nowIso(60 * 24 * 4),
  },
]

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // corrupted storage — reseed
  }
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(SEED_NOTIFICATIONS))
  } catch {
    // storage unavailable — keep in-memory only
  }
  return SEED_NOTIFICATIONS
}

function saveLocal(list) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
  } catch {
    // storage unavailable — ignore
  }
}

const byNewest = (a, b) => new Date(b.created_at) - new Date(a.created_at)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  // Pull notifications from Supabase when signed in, else local storage.
  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications(loadLocal())
      setLoading(false)
      return
    }
    if (!NOTIFICATIONS_DB_ENABLED) {
      setNotifications(loadLocal())
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      if (Array.isArray(data) && data.length > 0) {
        // Normalize snake_case rows into the shared shape.
        setNotifications(
          data.map((n) => ({
            id: n.id,
            user_id: n.user_id,
            title: n.title,
            message: n.message,
            type: n.type || 'system',
            is_read: !!n.is_read,
            link: n.link || null,
            created_at: n.created_at,
          }))
        )
      } else {
        // Table empty/unavailable → fall back to localized persistent state.
        setNotifications(loadLocal())
      }
    } catch {
      setNotifications(loadLocal())
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    setLoading(true)
    refresh()
  }, [refresh])

  // addNotification({ type, title, message, link }) — other parts of the app
  // (quiz completion, submissions, AI master notes generation, XP events…)
  // call this to raise a new unread notification. Optimistic local update,
  // then best-effort Supabase insert when signed in.
  const addNotification = useCallback(
    async ({ type, title, message, link }) => {
      const created = {
        id: (user?.id ? `n-` : 'local-') + Date.now(),
        user_id: user?.id || 'local',
        type: type || 'general',
        title,
        message,
        link: link || null,
        is_read: false,
        created_at: new Date().toISOString(),
      }
      setNotifications((prev) => [created, ...prev].sort(byNewest))
      if (!user || !NOTIFICATIONS_DB_ENABLED) {
        setNotifications((prev) => {
          saveLocal(prev)
          return prev
        })
        return
      }
      try {
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: created.type,
          title,
          message,
          link: link || null,
          is_read: false,
        })
      } catch {
        // DB write failed — the optimistic local copy still shows it.
      }
    },
    [user]
  )

  const markAsRead = useCallback(
    async (id) => {
      setNotifications((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        if (!user) saveLocal(next)
        return next
      })
      if (!user || !NOTIFICATIONS_DB_ENABLED) return
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
      } catch {
        // best-effort
      }
    },
    [user]
  )

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, is_read: true }))
        if (!user) saveLocal(next)
        return next
      })
      if (!user || !NOTIFICATIONS_DB_ENABLED) return
      try {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    } catch {
      // best-effort
    }
  }, [user])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  )

  const value = {
    notifications,
    unreadCount,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    refresh,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}