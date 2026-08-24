import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'

const ThemeContext = createContext()

const THEME_STORAGE_KEY = 'app-theme'

function getSystemPrefersDark() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'light'
    } catch {
      return 'light'
    }
  })
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark)

  // Guests (signed-out visitors) always get the light, frosted white + blue theme.
  const { user } = useAuth()
  const isGuest = !user

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => setSystemPrefersDark(e.matches)
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handleChange)
    } else {
      mq.addListener(handleChange)
    }
    return () => {
      if (typeof mq.removeEventListener === 'function') {
        mq.removeEventListener('change', handleChange)
      } else {
        mq.removeListener(handleChange)
      }
    }
  }, [])

  const isDark = useMemo(
    () => !isGuest && (theme === 'dark' || (theme === 'system' && systemPrefersDark)),
    [theme, systemPrefersDark, isGuest],
  )

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
    root.classList.toggle('guest', isGuest)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {}
  }, [theme, isDark, isGuest])

  const setTheme = useCallback((next) => {
    if (next === 'dark' || next === 'light' || next === 'system') {
      setThemeState(next)
    }
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme, isDark }),
    [theme, setTheme, isDark],
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
