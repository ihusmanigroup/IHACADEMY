import { createContext, useContext, useEffect, useMemo } from 'react'

const ThemeContext = createContext()

// The site uses one fixed designed look: white sections with dark bands and
// dark headings (styled per-section in the components themselves). No
// user-facing theme switching.
export function ThemeProvider({ children }) {
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    root.classList.add('light')
    try {
      localStorage.setItem('app-theme', 'light')
    } catch {}
  }, [])

  const value = useMemo(
    () => ({ theme: 'light', setTheme: () => {}, isDark: false }),
    [],
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
