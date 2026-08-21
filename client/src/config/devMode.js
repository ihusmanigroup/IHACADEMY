// DEV_MODE unlock switch.
//
// When true (VITE_DEV_MODE=true in client/.env), the Winter Internship is always
// open and every locked/date-based restriction is removed for development &
// testing. When false (or unset), the original production behavior is restored:
// opening date, locking, and restrictions work normally.
export const DEV_MODE = String(import.meta.env.VITE_DEV_MODE || '').toLowerCase() === 'true'