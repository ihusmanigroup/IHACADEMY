/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deep: '#09090B',
        charcoal: '#18181B',
        border: '#27272A',
        cyan: { DEFAULT: '#06B6D4' },
        blue: { DEFAULT: '#6366F1' },
        offwhite: '#F8FAFC',
        muted: '#A1A1AA',
      },
    },
  },
  safelist: [
    'bg-cyan-500', 'hover:bg-cyan-400', 'text-cyan-400', 'text-cyan-500', 'text-cyan-600',
    'text-cyan-700', 'hover:text-cyan-400', 'hover:text-cyan-600', 'border-cyan-500/30',
    'border-cyan-500/20', 'border-cyan-600', 'from-cyan-500', 'to-cyan-400',
    'via-cyan-500', 'bg-cyan-500/15', 'bg-cyan-500/10', 'bg-cyan-500/20', 'bg-cyan-50',
    'dark:bg-cyan-500', 'dark:bg-cyan-500/10', 'dark:bg-cyan-500/15',
    'dark:text-cyan-400', 'dark:text-cyan-500',
    'dark:hover:text-cyan-400', 'dark:hover:text-cyan-600',
    'bg-cyan-600', 'hover:bg-cyan-500', 'dark:hover:bg-cyan-400',
  ],
  plugins: [tailwindcssAnimate],
}
