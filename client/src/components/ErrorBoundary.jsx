import { Component } from 'react'

/**
 * Catches render-time crashes in a route subtree and shows a friendly error
 * state instead of a blank page.
 *
 * Pass a `resetKey` tied to the active route: when it changes, the error state
 * is cleared WITHOUT remounting `children`, so navigating between portal tabs
 * never unmounts the page or re-triggers its data fetches. (A `key` prop would
 * force a full remount and defeat the cached portal store.)
 */
export default class ErrorBoundary extends Component {
  state = { error: null, lastResetKey: null }

  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.lastResetKey) {
      return { error: null, lastResetKey: props.resetKey }
    }
    return null
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10">
            <svg className="h-8 w-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-950 dark:text-white">Something went wrong</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-500">
              An unexpected error interrupted this page. Reload to try again — your saved progress is safe.
            </p>
            {this.props.showDetails && this.state.error?.message && (
              <p className="mx-auto mt-3 max-w-md rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/5 dark:text-rose-300">
                {this.state.error.message}
              </p>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 dark:bg-blue-600 dark:hover:bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Reload page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
