import { useEffect, useState, useCallback, useRef } from 'react'
import { Trophy, Flame, Zap, Medal, Star, RefreshCw, Crown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const leagueChipStyles = {
  Diamond: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800/50',
  Platinum: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-400 dark:border-cyan-800/50',
  Gold: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800/50',
  Silver: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  Bronze: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800/50',
}

const podiumStyles = [
  { wrapper: 'bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700', medal: 'text-slate-500', label: '2nd Place', order: 'order-1 lg:mt-8' },
  { wrapper: 'bg-amber-100 border-amber-300 dark:bg-amber-950 dark:border-amber-700', medal: 'text-amber-500', label: '1st Place', order: 'order-0 lg:mt-0 lg:scale-105' },
  { wrapper: 'bg-orange-100 border-orange-300 dark:bg-orange-950 dark:border-orange-800', medal: 'text-orange-600', label: '3rd Place', order: 'order-2 lg:mt-14' },
]

const initialsOf = (name = '') =>
  name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

const calcLeague = (xp = 0) => {
  if (xp >= 10000) return 'Diamond'
  if (xp >= 5000) return 'Platinum'
  if (xp >= 2500) return 'Gold'
  if (xp >= 1000) return 'Silver'
  return 'Bronze'
}

const BASE_COLS = 'id, full_name, avatar_url, xp, streak_count'
const GAMING_COLS = 'badges, league'

function PodiumSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm animate-pulse ${i === 1 ? 'lg:scale-105' : i === 2 ? 'lg:mt-14' : 'lg:mt-8'}`}>
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 mx-auto" />
          <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 mx-auto mt-4" />
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded mx-auto mt-4" />
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded mx-auto mt-2" />
        </div>
      ))}
    </div>
  )
}

export default function Leaderboard() {
  const { user, profile } = useAuth()
  const [rows, setRows] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let { data, error } = await supabase
        .from('profiles')
        .select(`${BASE_COLS}, ${GAMING_COLS}`)
        .order('xp', { ascending: false })
        .limit(50)

      if (error) {
        console.warn('Gamified columns unavailable, falling back to base profile columns:', error.message)
        const { data: fallback, error: fallbackError } = await supabase
          .from('profiles')
          .select(BASE_COLS)
          .order('xp', { ascending: false })
          .limit(50)
        if (fallbackError) throw fallbackError
        data = fallback
      }

      if (data) {
        const normalized = data.map((row, i) => ({
          id: row.id,
          rank: i + 1,
          name: row.full_name || row.name || 'Developer',
          avatar: row.avatar_url || '',
          xp: row.xp ?? 0,
          streak: row.streak_count ?? row.streak ?? 0,
          badges: Array.isArray(row.badges) ? row.badges : [],
          league: row.league || calcLeague(row.xp ?? 0),
        }))
        setRows(normalized)

        const meInBoard = normalized.find((r) => r.id === user?.id)
        setMyRank(meInBoard ? { rank: meInBoard.rank, total: null } : null)
      }
    } catch (err) {
      console.error('Leaderboard direct fetch error:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  const skipFirstXpSync = useRef(true)
  useEffect(() => {
    if (skipFirstXpSync.current) {
      skipFirstXpSync.current = false
      return
    }
    if (profile?.xp != null) fetchLeaderboard()
  }, [profile?.xp, fetchLeaderboard])

  const top3 = rows.slice(0, 3)
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)
  const rest = rows.slice(3)
  const isMe = (id) => id === user?.id

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Global Leaderboard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-500 mt-1">Live rankings across {rows.length}+ active students, updated in real-time</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {myRank && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800/50">
              <Crown className="w-3.5 h-3.5" /> Your Rank: #{myRank.rank}
              {myRank.total ? ` of ${myRank.total}` : ''}
            </span>
          )}
          <button
            onClick={fetchLeaderboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Refresh leaderboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-2xl p-5 text-center">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">Could not load the leaderboard</p>
          <p className="text-xs text-red-500 dark:text-red-400/70 mt-1">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {!error && loading && <PodiumSkeleton />}

      {!error && !loading && (
        <>
          {podiumOrder.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
              {podiumOrder.map((userRow, i) => {
                const style = podiumOrder.length === 3 ? podiumStyles[i === 1 ? 1 : i === 0 ? 2 : 0] : podiumStyles[i]
                const isCurrentUser = isMe(userRow.id)
                return (
                  <div
                    key={userRow.id}
                    className={`${style.wrapper} ${style.order} border rounded-2xl p-6 text-center shadow-sm transition-all ${isCurrentUser ? 'ring-2 ring-sky-500/60 dark:ring-blue-500/60' : ''}`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <Medal className={`w-8 h-8 ${style.medal}`} />
                      {isCurrentUser && <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500 text-white dark:bg-blue-600">You</span>}
                    </div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-500 mt-2">{style.label}</p>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg mx-auto mt-3">
                      {initialsOf(userRow.name)}
                    </div>
                    <p className="font-bold text-slate-950 dark:text-white mt-3 truncate">{userRow.name}</p>
                    <p className="text-xs font-semibold text-sky-600 dark:text-blue-400 mt-0.5">{userRow.league} League</p>
                    <div className="flex items-center justify-center gap-4 mt-3">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <Zap className="w-3.5 h-3.5 text-amber-500" /> {userRow.xp.toLocaleString()} XP
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <Flame className="w-3.5 h-3.5 text-amber-500" /> {userRow.streak} day
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-950 dark:text-white">Full Rankings</h3>
              {profile && (
                <span className="ml-auto text-xs font-semibold text-slate-500 dark:text-slate-500">
                  You: {profile.xp || 0} XP · {profile.league || 'Bronze'} League
                </span>
              )}
            </div>
            {rest.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-500 py-6 text-center">Only {rows.length} students ranked so far — be the first to climb!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <th className="pb-3 font-extrabold">Rank</th>
                      <th className="pb-3 font-extrabold">Student</th>
                      <th className="pb-3 font-extrabold">XP Score</th>
                      <th className="pb-3 font-extrabold">Daily Streak</th>
                      <th className="pb-3 font-extrabold">Badges</th>
                      <th className="pb-3 font-extrabold text-right">League</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rest.map((u) => {
                      const mine = isMe(u.id)
                      const badgeCount = Array.isArray(u.badges) ? u.badges.length : Number(u.badges) || 0
                      return (
                        <tr key={u.id} className={`transition-colors ${mine ? 'bg-sky-500/10 border-sky-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                          <td className="py-3.5">
                            <span className={`w-7 h-7 inline-flex items-center justify-center rounded-lg text-xs font-bold ${mine
                              ? 'bg-sky-500 text-white dark:bg-blue-600'
                              : 'bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-500'
                            }`}>
                              {u.rank}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {initialsOf(u.name)}
                              </div>
                              <span className="font-semibold text-slate-950 dark:text-white">{u.name}</span>
                              {mine && (
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500 text-white dark:bg-blue-600">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span className="inline-flex items-center gap-1 font-bold text-slate-950 dark:text-white">
                              <Zap className="w-3.5 h-3.5 text-amber-500" /> {u.xp.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-500">
                              <Flame className="w-3.5 h-3.5 text-amber-500" /> {u.streak} days
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-500">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {badgeCount}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${leagueChipStyles[u.league] || leagueChipStyles.Bronze}`}>
                              {u.league}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
