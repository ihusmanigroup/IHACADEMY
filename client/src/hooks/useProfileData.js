import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { challengeById } from '../data/arenaChallenges'

export const LEAGUE_TIERS = [
  { name: 'Bronze', min: 0 },
  { name: 'Silver', min: 1000 },
  { name: 'Gold', min: 2500 },
  { name: 'Platinum', min: 5000 },
  { name: 'Diamond', min: 10000 },
]

export function calcLeague(xp = 0) {
  let current = LEAGUE_TIERS[0]
  for (const tier of LEAGUE_TIERS) {
    if (xp >= tier.min) current = tier
    else break
  }
  return current
}

export function leagueProgress(xp = 0) {
  let idx = 0
  LEAGUE_TIERS.forEach((t, i) => { if (xp >= t.min) idx = i })
  const current = LEAGUE_TIERS[idx]
  const next = LEAGUE_TIERS[idx + 1] || null
  const pct = next ? Math.max(0, Math.min(100, Math.round(((xp - current.min) / Math.max(1, next.min - current.min)) * 100))) : 100
  return { league: current.name, nextLeague: next ? next.name : null, pct }
}

const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

export default function useProfileData() {
  const { user, profile: contextProfile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    authUser: null,
    profile: null,
    lessonCompletions: [],
    enrollments: [],
    xpTransactions: [],
  })

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [{ data: { user: authUser } }, { data: profile }, { data: lessonCompletions }, { data: enrollments }, { data: xpTransactions }] =
        await Promise.all([
          supabase.auth.getUser(),
          supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
          supabase
            .from('lesson_completions')
            .select('id, completed_at, course_id, lessons(title)')
            .order('completed_at', { ascending: false })
            .limit(20),
          supabase
            .from('enrollments')
            .select('id, enrolled_at, course_id, courses(title)')
            .order('enrolled_at', { ascending: false })
            .limit(10),
          supabase
            .from('xp_transactions')
            .select('id, source, xp_amount, created_at')
            .order('created_at', { ascending: false })
            .limit(20),
        ])
      setData({
        authUser,
        profile: profile || contextProfile,
        lessonCompletions: lessonCompletions || [],
        enrollments: enrollments || [],
        xpTransactions: xpTransactions || [],
      })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [user, contextProfile])

  useEffect(() => {
    load()
  }, [load])

  const p = data.profile || {}
  const xp = p.xp ?? 0
  const solvedIds = Array.isArray(p.solved_challenges) ? p.solved_challenges : []
  const badges = Array.isArray(p.badges) ? p.badges : []
  const skills = Array.isArray(p.skill_tags) ? p.skill_tags : []
  const solvedChallenges = solvedIds
    .slice()
    .reverse()
    .map((id) => challengeById(id) || { id, title: `Challenge #${id}`, xp: 0, difficulty: '' })

  const activity = [
    ...data.lessonCompletions.map((lc) => ({
      id: `lesson-${lc.id}`,
      kind: 'lesson',
      title: `Completed ${lc.lessons?.title || 'a lesson'}`,
      sub: fmtDate(lc.completed_at),
      at: lc.completed_at,
    })),
    ...data.enrollments.map((en) => ({
      id: `enroll-${en.id}`,
      kind: 'enroll',
      title: `Enrolled in ${en.courses?.title || 'a course'}`,
      sub: fmtDate(en.enrolled_at),
      at: en.enrolled_at,
    })),
    ...data.xpTransactions.map((tx) => ({
      id: `xp-${tx.id}`,
      kind: 'xp',
      title: `${(tx.source || 'Activity').replace(/_/g, ' ')} — +${tx.xp_amount || 0} XP`,
      sub: fmtDate(tx.created_at),
      at: tx.created_at,
    })),
    ...solvedChallenges.map((c) => ({
      id: `challenge-${c.id}`,
      kind: 'challenge',
      title: `Solved ${c.title} in Coding Arena (+${c.xp || 0} XP)`,
      sub: 'Challenge completed',
      at: '',
    })),
  ]
    .filter((a) => !!a.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 5)

  const { league, nextLeague, pct } = leagueProgress(xp)

  const updateSkills = async (next) => {
    if (!user) return
    const { error: err } = await supabase
      .from('profiles')
      .update({ skill_tags: next, updated_at: new Date().toISOString() })
      .eq('id', user.id)
    if (err) throw err
    setData((d) => ({ ...d, profile: { ...d.profile, skill_tags: next } }))
    refreshProfile()
  }

  return {
    loading,
    error,
    profile: p,
    authUser: data.authUser,
    refresh: load,
    xp,
    streak: p.streak_count ?? 0,
    solvedIds,
    solvedChallenges,
    solvedCount: solvedIds.length,
    badges,
    skills,
    league,
    nextLeague,
    leaguePct: pct,
    activity,
    lessonCount: data.lessonCompletions.length,
    xpLedgerSum: data.xpTransactions.reduce((s, t) => s + (t.xp_amount || 0), 0),
    updateSkills,
  }
}
