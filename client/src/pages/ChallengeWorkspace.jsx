import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Code2, Play, Rocket, Loader2, CheckCircle2, XCircle, Zap, AlertTriangle, FileDown, Lock, Gauge } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { challengeById, DIFFICULTY_META } from '../data/arenaChallenges'

const LANGUAGES = ['javascript', 'python', 'cpp']
const LANGUAGE_LABELS = { javascript: 'JavaScript', python: 'Python', cpp: 'C++' }
const FILE_EXT = { javascript: 'solution.js', python: 'solution.py', cpp: 'solution.cpp' }

const TIMEOUT_MS = 3000

const buildWorkerSource = (code, challenge, runId) => {
  const inputs = challenge.testCases.map((t) => t.input)
  const expected = challenge.testCases.map((t) => t.expectedOutput)
  const hiddenFlags = challenge.testCases.map((t) => Boolean(t.hidden))
  const harness = `
self.onmessage = function (evt) {
  var testInputs = ${JSON.stringify(inputs)};
  var testExpected = ${JSON.stringify(expected)};
  var testHidden = ${JSON.stringify(hiddenFlags)};
  var compareMode = ${JSON.stringify(challenge.compare)};
  var runType = ${JSON.stringify(challenge.type)};
  var fnName = ${JSON.stringify(challenge.functionName)};
  var results = [];

  function deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-9;
    if (a === null || a === undefined || b === null || b === undefined) return a === b;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (var i = 0; i < a.length; i++) { if (!deepEqual(a[i], b[i])) return false; }
      return true;
    }
    if (typeof a === 'object' && typeof b === 'object') {
      var ka = Object.keys(a), kb = Object.keys(b);
      if (ka.length !== kb.length) return false;
      for (var i = 0; i < ka.length; i++) { if (!deepEqual(a[ka[i]], b[ka[i]])) return false; }
      return true;
    }
    return false;
  }

  function canonGroup(group) {
    if (!Array.isArray(group)) return null;
    return JSON.stringify(group.slice().sort());
  }

  function sameGroups(actual, expected) {
    if (!Array.isArray(actual) || actual.length !== expected.length) return false;
    var a = actual.map(canonGroup).sort();
    var e = expected.map(canonGroup).sort();
    for (var i = 0; i < a.length; i++) { if (a[i] !== e[i]) return false; }
    return true;
  }

  function sortPair(arr) {
    if (Array.isArray(arr) && arr.length === 2) {
      return arr.slice().sort(function (a, b) { return a - b; });
    }
    return arr;
  }

  var fn = null;
  try { fn = eval(fnName); } catch (e) {}
  if (typeof fn !== 'function') {
    for (var i = 0; i < testInputs.length; i++) {
      results.push({ passed: false, hidden: !!testHidden[i], input: testInputs[i], error: "Could not find function or class '" + fnName + "'" });
    }
  } else {
    for (var i = 0; i < testInputs.length; i++) {
      var passed = false, actual = null, error = null;
      var t0 = Date.now();
      try {
        if (runType === 'class') {
          var capacity = testInputs[i][0];
          var ops = testInputs[i][1];
          var obj = new fn(capacity);
          var collected = [];
          for (var j = 0; j < ops.length; j++) {
            var op = ops[j];
            if (op[0] === 'get') collected.push(obj.get(op[1]));
            else if (op[0] === 'put') obj.put(op[1], op[2]);
          }
          actual = collected;
        } else {
          actual = fn.apply(null, testInputs[i]);
        }
      } catch (e) {
        error = (e && e.message) ? e.message : String(e);
      }
      if (error) {
        results.push({ passed: false, hidden: !!testHidden[i], input: testInputs[i], error: error });
      } else if (Date.now() - t0 > 2000) {
        results.push({ passed: false, hidden: !!testHidden[i], input: testInputs[i], error: '⏱️ Time Limit Exceeded (2000ms) — improve your algorithm' });
      } else {
        var expected = testExpected[i];
        var actualCmp = compareMode === 'pair' ? sortPair(actual) : actual;
        var expectedCmp = compareMode === 'pair' ? sortPair(expected) : expected;
        var ok = compareMode === 'unordered' ? sameGroups(actualCmp, expectedCmp) : deepEqual(actualCmp, expectedCmp);
        results.push({ passed: ok, hidden: !!testHidden[i], input: testInputs[i], expected: expected, actual: ok ? undefined : actual });
      }
    }
  }
  self.postMessage({ type: '__arenaResults', runId: ${JSON.stringify(String(runId))}, results: results, passed: results.filter(function (r) { return r.passed; }).length, total: results.length });
};
`
  return `${code}\n${harness}`
}

const getLocalDateStr = () => {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

const pretty = (value) => {
  try {
    if (typeof value === 'string') return JSON.stringify(value)
    if (value === undefined) return 'undefined'
    if (value === null) return 'null'
    return JSON.stringify(value)
  } catch (_) {
    return String(value)
  }
}

export default function ChallengeWorkspace() {
  const { id } = useParams()
  const { user, profile, addXp, refreshProfile } = useAuth()
  const challenge = challengeById(id)
  const completedChallengeIds = Array.isArray(profile?.solved_challenges) ? profile.solved_challenges : []
  const isCompleted = Boolean(challenge && completedChallengeIds.includes(challenge.id))

  const [language, setLanguage] = useState('javascript')
  const [userCode, setUserCode] = useState({})
  const [tab, setTab] = useState('Description')
  const [results, setResults] = useState([])
  const [running, setRunning] = useState(false)
  const [awarding, setAwarding] = useState(false)
  const [awarded, setAwarded] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [toast, setToast] = useState(null)
  const [dateStr] = useState(getLocalDateStr)

  const codeAtRunRef = useRef(null)
  const resetTimerRef = useRef(null)

  const code = userCode[language] || ''

  useEffect(() => {
    if (!challenge) return
    const initial = {}
    LANGUAGES.forEach((lang) => {
      initial[lang] = challenge.starterCode[lang] || ''
    })
    setUserCode(initial)
    setLanguage('javascript')
    setTab('Description')
    setResults([])
    setRunning(false)
    setAwarded(false)
    setConfirmReset(false)
  }, [id, challenge])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  // Daily completion + XP persist for the arena (Solved Today / XP Earned Today).
  // Keys (per-day): arena_completed_tasks_{YYYY-MM-DD} + arena_daily_xp_{YYYY-MM-DD}.
  // This is NOT a draft: code stays in React state only and is discarded on exit,
  // so every re-entry starts 100% fresh from the starter template.
  const persistDailyCompletion = useCallback(() => {
    if (!user || !challenge) return
    try {
      const completedKey = `arena_completed_tasks_${dateStr}`
      const xpKey = `arena_daily_xp_${dateStr}`
      const raw = localStorage.getItem(completedKey)
      const current = raw ? JSON.parse(raw) : []
      const next = Array.isArray(current) ? Array.from(new Set([...current, challenge.id])) : [challenge.id]
      localStorage.setItem(completedKey, JSON.stringify(next))
      localStorage.setItem(xpKey, JSON.stringify(Number(localStorage.getItem(xpKey) || 0) + challenge.xp))
    } catch (_) {}
  }, [user, challenge, dateStr])

  // Runs user code inside a Web Worker (separate thread — infinite loops cannot
  // freeze the UI). A hard 3s watchdog terminates the worker if it never replies.
  const execute = useCallback((runCode, runChallenge, runId) => {
    return new Promise((resolve) => {
      let settled = false
      let worker = null
      let url = null
      const finish = (payload) => {
        if (settled) return
        settled = true
        if (worker) worker.terminate()
        if (url) URL.revokeObjectURL(url)
        resolve(payload)
      }

      const source = buildWorkerSource(runCode, runChallenge, runId)
      url = URL.createObjectURL(new Blob([source], { type: 'application/javascript' }))
      worker = new Worker(url)
      const watchdog = setTimeout(() => finish({ timedOut: true }), TIMEOUT_MS)

      worker.onmessage = (e) => {
        clearTimeout(watchdog)
        if (e.data && e.data.type === '__arenaResults') finish(e.data)
      }
      worker.onerror = () => {
        clearTimeout(watchdog)
        finish({ compileError: true })
      }
      worker.postMessage({ runId })
    })
  }, [])

  const executeTests = useCallback(async () => {
    if (!challenge || running) return null
    if (language !== 'javascript') {
      setToast({ type: 'error', message: 'In-browser execution supports JavaScript — switch to JS to run tests' })
      return null
    }
    if (!code.trim()) {
      setToast({ type: 'error', message: 'Write a solution before running tests' })
      return null
    }
    const runId = Date.now()
    codeAtRunRef.current = code
    setTab('Results')
    setResults([])
    setAwarded(false)
    setRunning(true)
    try {
      const res = await execute(code, challenge, runId)
      if (res.timedOut) {
        const rows = challenge.testCases.map((t) => ({ passed: false, input: t.input, error: '⏱️ Time Limit Exceeded (3000ms)' }))
        setResults(rows)
        return { results: rows, passed: 0, total: challenge.testCases.length }
      }
      if (res.compileError) {
        const rows = challenge.testCases.map((t) => ({
          passed: false,
          input: t.input,
          error: `Your code failed to load in the sandbox — syntax error or top-level exception (missing '${challenge.functionName}')`,
        }))
        setResults(rows)
        return { results: rows, passed: 0, total: challenge.testCases.length }
      }
      setResults(res.results)
      return res
    } catch (err) {
      setToast({ type: 'error', message: `Test runner failed: ${err.message}` })
      return null
    } finally {
      setRunning(false)
    }
  }, [challenge, code, language, running, execute])

  const runTests = () => {
    executeTests()
  }

  const switchLanguage = (lang) => {
    if (lang === language) return
    setLanguage(lang)
    setResults([])
    setAwarded(false)
    setConfirmReset(false)
  }

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
      resetTimerRef.current = setTimeout(() => setConfirmReset(false), 3000)
      return
    }
    setConfirmReset(false)
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    setUserCode((prev) => ({ ...prev, [language]: challenge.starterCode[language] || '' }))
    setResults([])
    setAwarded(false)
    setToast({ type: 'success', message: `Starter template restored for ${LANGUAGE_LABELS[language]}` })
  }

  const submitSolution = async () => {
    if (awarding || running) return
    if (isCompleted) {
      setToast({ type: 'error', message: 'This challenge is already completed — XP can only be claimed once' })
      return
    }
    const res = await executeTests()
    if (!res || res.passed !== res.total) {
      if (res) setToast({ type: 'error', message: `Pass all ${res.total} test cases to earn XP (${res.passed}/${res.total})` })
      return
    }
    if (code !== codeAtRunRef.current) {
      setToast({ type: 'error', message: 'Code changed after the last run — run the tests again before submitting' })
      return
    }

    setAwarding(true)
    try {
      let updatedProfile = null
      try {
        updatedProfile = await addXp(challenge.xp, 'challenge')
      } catch (xpErr) {
        console.warn('addXp RPC unavailable, using direct update:', xpErr.message)
        const { data, error } = await supabase
          .from('profiles')
          .update({ xp: (profile?.xp ?? 0) + challenge.xp })
          .eq('id', user.id)
          .select()
          .maybeSingle()
        if (error) throw error
        updatedProfile = data
        await refreshProfile()
      }

      const currentSolved = Array.isArray(updatedProfile?.solved_challenges)
        ? updatedProfile.solved_challenges
        : Array.isArray(profile?.solved_challenges)
          ? profile.solved_challenges
          : []
      const solvedList = [...new Set([...currentSolved, challenge.id])]
      const { error: solvedError } = await supabase
        .from('profiles')
        .update({ solved_challenges: solvedList })
        .eq('id', user.id)
      if (solvedError) {
        console.warn('solved_challenges column unavailable:', solvedError.message)
      }

      persistDailyCompletion()
      await refreshProfile()
      setAwarded(true)
      setToast({ type: 'success', message: `🎉 All Test Cases Passed! +${challenge.xp} XP Awarded` })
    } catch (err) {
      setToast({ type: 'error', message: `Could not award XP: ${err.message}` })
    } finally {
      setAwarding(false)
    }
  }

  const handleEditorKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.target
      const start = el.selectionStart
      const end = el.selectionEnd
      const next = code.slice(0, start) + '  ' + code.slice(end)
      setUserCode((prev) => ({ ...prev, [language]: next }))
      requestAnimationFrame(() => {
        el.selectionStart = start + 2
        el.selectionEnd = start + 2
      })
    }
  }

  if (!challenge) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-10 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Challenge not found.</p>
        <Link to="/challenges" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Coding Arena
        </Link>
      </div>
    )
  }

  const totalTests = challenge.testCases.length
  const hiddenCount = challenge.testCases.filter((t) => t.hidden).length
  const passedCount = results.filter((r) => r.passed).length
  const allPassed = results.length === totalTests && passedCount === totalTests

  const leftTabs = [
    { key: 'Description', label: 'Description' },
    { key: 'Constraints', label: 'Constraints' },
    { key: 'Examples', label: 'Examples' },
    { key: 'Results', label: `Results ${results.length ? `(${passedCount}/${totalTests})` : ''}` },
  ]

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/challenges"
            className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors shrink-0"
            title="Back to Coding Arena"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-bold text-slate-950 dark:text-white truncate">{challenge.title}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${DIFFICULTY_META[challenge.difficulty].cls}`}>
                {challenge.difficulty}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
                <Zap className="w-3 h-3" /> +{challenge.xp} XP
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {challenge.category} · {DIFFICULTY_META[challenge.difficulty].xpRange} · {totalTests} test cases ({hiddenCount} hidden)
            </p>
          </div>
        </div>
        {isCompleted && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed ✓
          </span>
        )}
      </div>

      {isCompleted && (
        <div className="sticky top-3 z-30 rounded-2xl px-4 py-3 bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl shadow-lg shadow-amber-500/10 flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-xs md:text-sm font-bold text-amber-700 dark:text-amber-300">
            🔒 You have already completed this challenge today. XP has been claimed.
          </p>
        </div>
      )}

      {awarded && (
        <div className="rounded-2xl px-5 py-4 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Challenge Solved!</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                All {totalTests} test cases passed · +{challenge.xp} XP added to your profile · Leaderboard updated
              </p>
            </div>
          </div>
          <Link
            to="/challenges"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold shadow-md shadow-cyan-500/20 hover:from-blue-700 hover:to-cyan-600 transition-all"
          >
            Back to Arena
          </Link>
        </div>
      )}

      {/* Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-[calc(100vh-14rem)]">
        {/* Left: problem panel */}
        <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg flex flex-col min-h-0">
          <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80 overflow-x-auto">
            {leftTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  tab === t.key
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-5 space-y-4">
            {tab === 'Description' && (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/30">
                    <Gauge className="w-3 h-3" /> Required: {challenge.requiredComplexity}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/60">
                    <Lock className="w-3 h-3" /> {hiddenCount} hidden edge cases
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{challenge.statement}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{challenge.desc}</p>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 p-4">
                  <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mb-2">💡 Key Requirements:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 mt-0.5 shrink-0" />
                      Your function must be named <code className="font-mono text-cyan-600 dark:text-cyan-400">{challenge.functionName}</code>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 mt-0.5 shrink-0" />
                      Handle edge cases (empty input, duplicates, large values)
                    </li>
                    <li className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 mt-0.5 shrink-0" />
                      Aim for the required time complexity where stated
                    </li>
                  </ul>
                </div>
              </>
            )}

            {tab === 'Constraints' && (
              <>
                <div className="rounded-xl bg-violet-500/10 border border-violet-500/30 px-4 py-3 flex items-start gap-2.5">
                  <Gauge className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-violet-600 dark:text-violet-400">Required Time Complexity: {challenge.requiredComplexity}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Enforced by hidden stress inputs (up to 50k elements) — slower solutions hit the per-test time limit and fail.
                    </p>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {challenge.constraints.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
                      <code className="font-mono text-xs md:text-sm">{c}</code>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {tab === 'Examples' && (
              <div className="space-y-3">
                {challenge.examples.map((ex, i) => (
                  <div key={i} className="rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 p-4 space-y-1.5">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Example {i + 1}:</p>
                    <p className="text-xs md:text-sm font-mono text-slate-800 dark:text-slate-200">
                      <span className="text-cyan-600 dark:text-cyan-400">Input: </span>{ex.input}
                    </p>
                    <p className="text-xs md:text-sm font-mono text-slate-800 dark:text-slate-200">
                      <span className="text-emerald-600 dark:text-emerald-400">Output: </span>{ex.output}
                    </p>
                    {ex.explanation && <p className="text-xs text-slate-600 dark:text-slate-400">{ex.explanation}</p>}
                  </div>
                ))}
              </div>
            )}

            {tab === 'Results' && (
              results.length === 0 ? (
                running ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Evaluating in sandboxed worker...</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Hard 3s timeout — infinite loops are auto-terminated</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                    <Code2 className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Run the tests to see per-case results here</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">XP is awarded only when every test case passes</p>
                  </div>
                )
              ) : (
                <div className="space-y-2.5">
                  <div className={`flex items-center gap-2 text-sm font-bold ${allPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {allPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {passedCount}/{totalTests} test cases passed
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    <Lock className="w-3 h-3 inline-block mr-1 -mt-0.5" />
                    {hiddenCount} hidden case{hiddenCount === 1 ? '' : 's'} — inputs & expected outputs stay secret. XP requires all {totalTests} to pass.
                  </p>
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border p-3.5 space-y-1.5 ${
                        r.passed
                          ? 'bg-emerald-500/5 border-emerald-500/25'
                          : 'bg-rose-500/5 border-rose-500/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {r.hidden ? (
                            <span className="inline-flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" /> Hidden Case {i + 1}
                            </span>
                          ) : (
                            <>Test Case {i + 1}</>
                          )}
                        </span>
                        {r.passed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Passed
                          </span>
                        ) : r.error ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5">
                            <AlertTriangle className="w-3 h-3" /> Error
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-full px-2 py-0.5">
                            <XCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </div>
                      {r.hidden ? (
                        r.error ? (
                          <p className="text-xs font-mono text-amber-600 dark:text-amber-400">
                            <span className="text-slate-400 dark:text-slate-500">Error: </span>{r.error}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {r.passed
                              ? 'Hidden stress/edge case passed.'
                              : 'Input & expected output hidden — this case blocks hardcoded or slow solutions.'}
                          </p>
                        )
                      ) : (
                        <>
                          <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                            <span className="text-slate-400 dark:text-slate-500">Input: </span>{pretty(r.input)}
                          </p>
                          {r.error ? (
                            <p className="text-xs font-mono text-amber-600 dark:text-amber-400">
                              <span className="text-slate-400 dark:text-slate-500">Error: </span>{r.error}
                            </p>
                          ) : (
                            !r.passed && (
                              <div className="space-y-1">
                                <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                                  <span className="text-slate-400 dark:text-slate-500">Expected: </span>{pretty(r.expected)}
                                </p>
                                <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                                  <span className="text-slate-400 dark:text-slate-500">Actual: </span>{pretty(r.actual)}
                                </p>
                              </div>
                            )
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Right: editor panel */}
        <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200/80 dark:border-slate-800/80 gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
              <Code2 className="w-3.5 h-3.5 text-cyan-500" /> {FILE_EXT[language]}
            </span>
            <div className="flex items-center gap-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => switchLanguage(lang)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    language === lang
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              ))}
              <button
                onClick={handleReset}
                className={`ml-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  confirmReset
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
                title="Restore the fresh starter template for this language"
              >
                <FileDown className="w-3 h-3" /> {confirmReset ? 'Confirm Reset?' : 'Starter'}
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setUserCode((prev) => ({ ...prev, [language]: e.target.value }))}
            onKeyDown={handleEditorKeyDown}
            spellCheck={false}
            placeholder="Write your solution here..."
            className="flex-1 min-h-0 w-full bg-[#0B0F17] text-slate-100 font-mono text-xs md:text-sm p-4 outline-none resize-none leading-relaxed shadow-inner placeholder-slate-600 custom-scrollbar"
          />

          {/* Action bar */}
          <div className="bg-slate-900/90 border-t border-slate-800 backdrop-blur-md px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-[11px] font-semibold text-slate-400">
              {language !== 'javascript' ? (
                <span className="inline-flex items-center gap-1 text-amber-400">
                  <AlertTriangle className="w-3 h-3" /> In-browser execution supports JavaScript — switch to JS to run tests
                </span>
              ) : (
                'Sandboxed JS Environment • 3s Timeout Limit'
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={runTests}
                disabled={running || awarding}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {running ? 'Running...' : 'Run Tests'}
              </button>
              <button
                onClick={submitSolution}
                disabled={running || awarding || isCompleted}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold px-5 py-2 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                title={isCompleted ? 'Challenge already completed' : 'Submit when all test cases pass'}
              >
                {awarding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                {awarding ? 'Awarding XP...' : isCompleted ? 'Completed ✓' : 'Submit Solution'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-semibold animate-[fadeIn_0.2s_ease-out] border ${
            toast.type === 'error'
              ? 'bg-red-950 border-red-500/40 text-red-100'
              : 'bg-[#0F172A] border-cyan-500/40 text-slate-100'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <Rocket className="w-4 h-4 text-cyan-400 shrink-0" />
          )}
          <span className="max-w-[75vw]">{toast.message}</span>
        </div>
      )}
    </div>
  )
}
