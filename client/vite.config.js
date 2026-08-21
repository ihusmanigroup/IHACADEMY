import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// Auto-start the Express email backend (server/index.js) whenever the Vite dev
// server runs, and proxy /api -> it. This means `npm run dev` is self-contained:
// no separate "run the server" step (so no 502 when it's forgotten) and the call
// stays same-origin (so no CORS preflight errors).
function startEmailServerPlugin() {
  let child
  return {
    name: 'start-email-server',
    configureServer() {
      child = spawn(process.execPath, ['server/index.js'], {
        cwd: ROOT,
        env: { ...process.env, PORT: '8787' },
        stdio: 'inherit',
      })
      child.on('error', (e) => console.error('[email-server] failed to start:', e.message))
      const shutdown = () => {
        try {
          child.kill()
        } catch {}
      }
      process.on('exit', shutdown)
      process.on('SIGINT', shutdown)
      process.on('SIGTERM', shutdown)
    },
  }
}

export default defineConfig({
  plugins: [react(), startEmailServerPlugin()],
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
  preview: {
    allowedHosts: true,
  },
})