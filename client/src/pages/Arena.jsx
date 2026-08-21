import { useState, useEffect } from 'react'
import { Trophy, Users, Calendar, Medal, Star, Code, Swords, ArrowRight } from 'lucide-react'

const TABS = ['Hackathons', 'Daily Challenges', 'Leaderboard']

const HACKATHONS = [
  {
    id: 'ai-hackathon-2026',
    title: 'AI Innovation Hackathon 2026',
    description: 'Build an AI-powered educational tool using LLMs, RAG pipelines, and modern web technologies. Top 3 teams win cash prizes and mentorship.',
    date: '2026-09-15',
    prize: '$5,000',
    status: 'upcoming',
    teamSize: '2-4',
    registrations: 47,
  },
  {
    id: 'web3-sprint',
    title: 'Web3 / Fullstack Sprint',
    description: 'A 48-hour sprint to build decentralized applications or full-stack solutions. Focus on practical, shippable products.',
    date: '2026-08-20',
    prize: '$3,000',
    status: 'upcoming',
    teamSize: '1-3',
    registrations: 32,
  },
  {
    id: 'code-quest-july',
    title: 'Code Quest: July 2026',
    description: 'Solve algorithmic challenges across multiple rounds. Eliminate your way to the finals for a grand prize.',
    date: '2026-07-28',
    prize: '$2,000',
    status: 'active',
    teamSize: 'Solo',
    registrations: 128,
  },
]

const CHALLENGES = [
  { id: 'ch-1', title: 'Two Sum', difficulty: 'Easy', category: 'Arrays', solved: 245, xp: 10 },
  { id: 'ch-2', title: 'Valid Parentheses', difficulty: 'Easy', category: 'Stacks', solved: 198, xp: 10 },
  { id: 'ch-3', title: 'Reverse Linked List', difficulty: 'Easy', category: 'Linked Lists', solved: 176, xp: 15 },
  { id: 'ch-4', title: 'LRU Cache', difficulty: 'Medium', category: 'Design', solved: 89, xp: 25 },
  { id: 'ch-5', title: 'Course Schedule', difficulty: 'Medium', category: 'Graphs', solved: 72, xp: 30 },
  { id: 'ch-6', title: 'Merge Intervals', difficulty: 'Medium', category: 'Arrays', solved: 65, xp: 25 },
  { id: 'ch-7', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', category: 'Binary Search', solved: 34, xp: 50 },
  { id: 'ch-8', title: 'Word Ladder II', difficulty: 'Hard', category: 'BFS/Graph', solved: 21, xp: 50 },
]

const LEADERBOARD_DATA = [
  { rank: 1, user: 'AlexChen', xp: 8450, badges: 7, avatar: 'AC' },
  { rank: 2, user: 'SarahDev', xp: 7200, badges: 5, avatar: 'SD' },
  { rank: 3, user: 'MikoW', xp: 6890, badges: 6, avatar: 'MW' },
  { rank: 4, user: 'RajatK', xp: 6120, badges: 4, avatar: 'RK' },
  { rank: 5, user: 'PriyaS', xp: 5800, badges: 5, avatar: 'PS' },
  { rank: 6, user: 'JamesB', xp: 5400, badges: 3, avatar: 'JB' },
  { rank: 7, user: 'LeilaM', xp: 4950, badges: 4, avatar: 'LM' },
  { rank: 8, user: 'TomW', xp: 4600, badges: 3, avatar: 'TW' },
]

const DIFFICULTY_COLORS = { Easy: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10', Medium: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10', Hard: 'text-red-500 bg-red-50 dark:bg-red-500/10' }
const RANK_COLORS = { 1: 'text-yellow-500', 2: 'text-gray-500 dark:text-gray-400', 3: 'text-amber-700' }

function Countdown({ dateStr }) {
  const [remaining, setRemaining] = useState('')
  useEffect(() => {
    const tick = () => {
      const diff = new Date(dateStr).getTime() - Date.now()
      if (diff <= 0) return setRemaining('Starts soon!')
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      setRemaining(`${d}d ${h}h`)
    }
    tick()
    const interval = setInterval(tick, 60000)
    return () => clearInterval(interval)
  }, [dateStr])
  return <span>{remaining}</span>
}

export default function Arena() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="min-h-screen bg-white dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Arena</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">Compete in hackathons, solve daily challenges, and climb the leaderboard</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-slate-200/50 dark:bg-[#0f1420]/80 p-1 rounded-xl w-fit">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === i
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {i === 0 && <Swords className="w-4 h-4" />}
              {i === 1 && <Code className="w-4 h-4" />}
              {i === 2 && <Trophy className="w-4 h-4" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Hackathons */}
        {activeTab === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {HACKATHONS.map((h) => (
              <div key={h.id} className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-cyan-400/30 hover:shadow-md transition-all group">
                <div className={`h-2 ${h.status === 'active' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      h.status === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-blue-500/10 text-sky-600 dark:text-cyan-400'
                    }`}>
                      {h.status === 'active' ? '● Active' : 'Upcoming'}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300">
                      <Countdown dateStr={h.date} />
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{h.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">{h.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 mb-4">
                    <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-amber-500" /> {h.prize}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {h.teamSize}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {h.registrations} reg</span>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-[#6366F1] hover:bg-[#5558E6] text-white transition-all">
                    {h.status === 'active' ? 'Join Now' : 'Register Team'} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Daily Challenges */}
        {activeTab === 1 && (
          <div className="space-y-3">
            {CHALLENGES.map((ch) => (
              <div key={ch.id} className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-cyan-400/30 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                    ch.difficulty === 'Easy' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' :
                    ch.difficulty === 'Medium' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' :
                    'bg-red-50 dark:bg-red-500/10 text-red-500'
                  }`}>
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{ch.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${DIFFICULTY_COLORS[ch.difficulty]}`}>
                        {ch.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-300">{ch.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-600 dark:text-slate-300">{ch.solved} solved</p>
                    <p className="text-xs font-medium text-sky-600 dark:text-cyan-400">+{ch.xp} XP</p>
                  </div>
                  <button className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                    Solve Challenge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard */}
        {activeTab === 2 && (
          <div className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Global Leaderboard</h3>
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-300">Updated daily</span>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {LEADERBOARD_DATA.map((entry) => (
                <div key={entry.rank} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-[#0f1420] transition-colors">
                  <div className="w-8 text-center">
                    {entry.rank <= 3 ? (
                      <Medal className={`w-5 h-5 mx-auto ${RANK_COLORS[entry.rank] || 'text-slate-600 dark:text-slate-300'}`} />
                    ) : (
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{entry.rank}</span>
                    )}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-black shrink-0">
                    {entry.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{entry.user}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <Star className="w-3 h-3 inline mr-0.5 text-amber-500" />
                      {entry.badges} badges
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-sky-600 dark:text-cyan-400">{entry.xp.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300">XP</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 text-center">
              <button className="text-sm font-medium text-sky-600 dark:text-cyan-400 hover:underline">View Full Leaderboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
