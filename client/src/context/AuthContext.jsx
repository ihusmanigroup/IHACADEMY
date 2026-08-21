import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  // Populated when a Google OAuth sign-in fails strict intent validation
  // (e.g. signing up with an existing account, or signing in without one).
  // AppContent listens to this and re-opens the auth modal with the error.
  const [oauthAuthError, setOauthAuthError] = useState(null)
  // While a password reset is mid-flight, `verifyOtp` establishes a session
  // which would otherwise flip the app to the dashboard layout and unmount the
  // auth modal. This flag keeps the user logged-out UI mounted until the new
  // password is actually saved.
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const isResettingPasswordRef = useRef(false)
  // Holds the resolved OAuth-intent decision so a getSession snapshot racing
  // the SIGNED_IN event in the same callback burst returns the same verdict
  // instead of re-checking (and possibly promoting) the user twice.
  const oauthIntentHandledRef = useRef(null)

const fetchProfile = useCallback(async (userId) => {
     const { data, error } = await supabase
       .from('profiles')
       .select('*')
       .eq('id', userId)
       .maybeSingle()
     if (!error && data) setProfile(data)
   }, [])

   const upsertProfile = useCallback(async (user, extra = {}) => {
     if (!user) return
     const fullName = user.user_metadata?.full_name || extra.name || ''
     const avatarUrl = user.user_metadata?.avatar_url || null
     await supabase
       .from('profiles')
       .upsert({
         id: user.id,
         full_name: fullName,
         avatar_url: avatarUrl,
       }, { onConflict: 'id' })
     await fetchProfile(user.id)
   }, [fetchProfile])

  /**
   * Strict intent-based Google OAuth validation. Reads the intent saved by the
   * auth modal before redirecting ('signup' | 'signin') and cross-checks it
   * against whether a profile already exists for this user.
   *
   * Returns { ok: false, message, tab } when the flow must be rejected (the
   * caller signs the user out and surfaces the error), or { ok: true } when the
   * sign-in is valid. Returns null when there is no pending OAuth intent.
   */
  const resolveOAuthIntent = useCallback(async (user) => {
    if (!user || user.app_metadata?.provider !== 'google') return null
    if (oauthIntentHandledRef.current) return oauthIntentHandledRef.current
    const intent = localStorage.getItem('oauth_intent')
    if (!intent) return null

    localStorage.removeItem('oauth_intent')

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    let decision
    // Case A: user tried to sign up but an account already exists
    if (intent === 'signup' && profile) {
      decision = {
        ok: false,
        message: 'An account with this Google email already exists. Please log in from the Sign In tab.',
        tab: 'signin',
      }
    }
    // Case C: user tried to sign in but no account exists yet
    else if (intent === 'signin' && !profile) {
      decision = {
        ok: false,
        message: 'No account found with this Google email. Please create an account first from the Sign Up tab.',
        tab: 'signup',
      }
    }
    // Cases B & D: valid — allow the session and upsert the profile row.
    else {
      decision = { ok: true }
    }
    oauthIntentHandledRef.current = decision
    return decision
  }, [])

  // AppContent consumes the OAuth error after displaying it in the modal.
  const clearOauthAuthError = useCallback(() => setOauthAuthError(null), [])

useEffect(() => {
     const applyAuthState = async (session) => {
       const nextUser = session?.user ?? null
       if (nextUser) {
         const oauthResult = await resolveOAuthIntent(nextUser)
         if (oauthResult && !oauthResult.ok) {
           await supabase.auth.signOut()
           setUser(null)
           setSession(null)
           setProfile(null)
           setOauthAuthError({ message: oauthResult.message, tab: oauthResult.tab })
           return
         }
       }
       setUser(nextUser)
       if (nextUser) {
         await upsertProfile(nextUser)
       } else {
         setProfile(null)
       }
     }

     // Hard safety timeout: `getSession`/profile upserts must never leave the
     // app on the splash — force loading to false after 1.5s no matter what.
     const loadingSafetyTimer = setTimeout(() => setLoading(false), 1500)

     supabase.auth.getSession()
       .then(async ({ data: { session } }) => {
         setSession(session)
         await applyAuthState(session)
         if (session) {
           window.history.replaceState({}, document.title, window.location.pathname)
         }
       })
       .catch(() => {
         // Network/auth failures are swallowed — loading still resolves below.
       })
       .finally(() => {
         setLoading(false)
         clearTimeout(loadingSafetyTimer)
       })

     const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
       setSession(session)
       if (!isResettingPasswordRef.current) {
         try {
           await applyAuthState(session)
         } catch {}
       }
       setLoading(false)
       if (session) {
         window.history.replaceState({}, document.title, window.location.pathname)
       }
     })

     return () => {
       clearTimeout(loadingSafetyTimer)
       subscription.unsubscribe()
     }
   }, [resolveOAuthIntent, upsertProfile])

const signUp = async ({ email, password, name, phone, residence }) => {
     const normalizedEmail = email.trim().toLowerCase()
     const { data, error } = await supabase.auth.signUp({
       email: normalizedEmail,
       password,
       options: {
         data: {
           full_name: name?.trim() ?? '',
           phone_number: phone?.trim() ?? '',
           residence: residence?.trim() ?? '',
         },
       },
     })
     if (error) throw error

     // Direct instant account creation: if Supabase didn't return a session
     // (email confirmation disabled), sign in with the same credentials so the
     // user is authenticated immediately with no verification step.
     let session = data?.session
     if (!session) {
       const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
         email: normalizedEmail,
         password,
       })
       if (!signInError) session = signInData?.session
     }

     // Hydrate auth state immediately instead of waiting on onAuthStateChange.
     if (session) {
       setUser(session.user)
       setSession(session)
       if (session.user) await upsertProfile(session.user, { name })
     }
     return { ...data, session }
   }

  const signInWithPassword = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error) throw error
    return data
  }

  const signInWithOAuth = async (provider = 'google') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
    return data
  }

  const signInWithGoogle = async () => {
    // New OAuth attempt — allow the intent check to run again on callback.
    oauthIntentHandledRef.current = null
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) console.error('Google Auth Error:', error.message)
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase())
    if (error) throw error
  }

  /**
   * Pre-flight check before sending a reset code:
   * - If the email doesn't exist in `profiles`, reject with a "no account" message.
   * - If the account was created via Google OAuth, reject and direct to Google sign-in.
   * Returns { ok: true } when a password-based account exists.
   */
  const checkAccountForReset = async (email) => {
    const normalized = email.trim().toLowerCase()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, provider, auth_provider, created_at')
      .ilike('email', normalized)
      .maybeSingle()

    // Table/column may be restricted or not exist — treat as "can't verify" and
    // let Supabase decide (safer than blocking legit resets on schema drift).
    if (error) {
      console.warn('Account check unavailable, proceeding:', error.message)
      return { ok: true }
    }
    if (!data) {
      return { ok: false, message: 'No account found with this email address. Please check your email or sign up.' }
    }
    const provider = ((data.provider || data.auth_provider || '') + '').toLowerCase()
    if (provider && !['email', 'email_password', 'password'].includes(provider)) {
      return { ok: false, message: "This account was created using Google Sign-In. Please click 'Continue with Google' to log in." }
    }
    return { ok: true }
  }

  const verifyOtp = async ({ email, token, type = 'recovery' }) => {
    // Supabase auto-establishes a session on success. Suppress the automatic
    // UI promotion (dashboard redirect) until the new password is saved.
    isResettingPasswordRef.current = true
    setIsResettingPassword(true)
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type,
    })
    if (error) {
      isResettingPasswordRef.current = false
      setIsResettingPassword(false)
      throw error
    }
    return data
  }

  const updatePassword = async (password) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    // Complete the reset: drop the recovery session so the user must sign in
    // again with the new password. `isResettingPassword` is cleared first so
    // the onAuthStateChange handler resumes normal routing afterwards.
    isResettingPasswordRef.current = false
    setIsResettingPassword(false)
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) throw signOutError
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  const refreshProfile = useCallback(async () => {
    if (!user) return
    await fetchProfile(user.id)
  }, [user, fetchProfile])

  // Optimistic local XP bump — navbar/global counters update instantly,
  // then refreshProfile() re-syncs the authoritative value from the DB.
  const bumpXp = useCallback((amount) => {
    setProfile((p) => (p ? { ...p, xp: (p.xp || 0) + amount } : p))
  }, [])

  const addXp = useCallback(
    async (points, reason = 'activity') => {
      if (!user) return null
      const { data, error } = await supabase.rpc('add_xp', { points, reason })
      if (error) throw error
      if (data && data.length) setProfile(data[0])
      return data && data[0]
    },
    [user]
  )

  const signOut = async () => {
    setProfile(null)
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

const value = {
     user, session, profile, loading, isResettingPassword, oauthAuthError,
     signUp, signInWithPassword, signInWithOAuth, signInWithGoogle, resetPassword, checkAccountForReset, verifyOtp, updatePassword, signOut,
     refreshProfile, addXp, bumpXp, upsertProfile, clearOauthAuthError,
   }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
