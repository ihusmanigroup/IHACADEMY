import { useState } from 'react'
import { FileText, ChevronRight, X, Tag, Download } from 'lucide-react'
import SpotlightCard from '../components/SpotlightCard'

const TABS = ['Cheat Sheets', 'Developer Notes & Guides']

const CHEAT_SHEETS = [
  {
    title: 'Git CLI',
    description: 'Essential Git commands for version control, branching, merging, and collaboration workflows.',
    tags: ['Version Control', 'CLI'],
    icon: '🔧',
    content: `## Git CLI — Quick Reference
\`\`\`bash
# Configuration
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Repository
git init                    # Init new repo
git clone <url>             # Clone remote repo

# Changes
git status                  # Check working tree
git add <file>              # Stage changes
git commit -m "message"     # Commit staged

# Branching
git branch <name>           # Create branch
git checkout <name>         # Switch branch
git merge <branch>          # Merge into current

# Remote
git push origin <branch>    # Push to remote
git pull origin <branch>    # Pull from remote
git fetch origin            # Fetch without merge

# History
git log --oneline --graph   # Compact history
git diff                    # Unstaged changes
\`\`\``
  },
  {
    title: 'HTML5 / CSS3',
    description: 'Modern HTML5 semantic elements and CSS3 layout, flexbox, grid, and animation properties.',
    tags: ['Frontend', 'Fundamentals'],
    icon: '🌐',
    content: `## HTML5 & CSS3 — Quick Reference
\`\`\`html
<!-- HTML5 Semantic Structure -->
<header></header>
<nav></nav>
<main></main>
<section></section>
<article></article>
<aside></aside>
<footer></footer>

<!-- Forms -->
<input type="email" required />
<input type="date" />
<textarea></textarea>
<select><option></option></select>
\`\`\`

\`\`\`css
/* Flexbox */
display: flex;
justify-content: center;
align-items: center;
gap: 1rem;

/* Grid */
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 1.5rem;

/* CSS Variables */
:root { --primary: #0891b2; }
color: var(--primary);

/* Animations */
transition: all 0.3s ease;
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
\`\`\``
  },
  {
    title: 'JavaScript ES6+',
    description: 'Modern JavaScript syntax including arrow functions, promises, destructuring, and modules.',
    tags: ['Frontend', 'Backend', 'Fundamentals'],
    icon: '⚡',
    content: `## JavaScript ES6+ — Quick Reference
\`\`\`js
// Arrow Functions
const add = (a, b) => a + b

// Destructuring
const { name, age } = person
const [first, ...rest] = arr

// Spread
const clone = { ...obj, newKey: val }

// Promises
fetch(url)
  .then(res => res.json())
  .catch(err => console.error(err))

// Async/Await
async function load() {
  const res = await fetch(url)
  return res.json()
}

// Modules
export const foo = () => {}
import { foo } from './module.js'

// Optional Chaining
const val = obj?.prop?.nested

// Nullish Coalescing
const val = input ?? 'default'
\`\`\``
  },
  {
    title: 'React Hooks',
    description: 'Core React hooks for state management, side effects, context, and performance optimization.',
    tags: ['Frontend', 'React'],
    icon: '⚛️',
    content: `## React Hooks — Quick Reference
\`\`\`jsx
import { useState, useEffect, useCallback, useMemo, useRef, useContext } from 'react'

// State
const [count, setCount] = useState(0)

// Side Effects
useEffect(() => {
  fetchData()
  return () => cleanup() // Cleanup
}, [deps])

// Performance
const memoized = useMemo(() => compute(a, b), [a, b])
const callback = useCallback(() => doThing(), [deps])

// Refs
const ref = useRef(null)
// <div ref={ref} />

// Context
const value = useContext(MyContext)

// Custom Hook
function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) || initial }
    catch { return initial }
  })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)) }, [key, val])
  return [val, setVal]
}
\`\`\``
  },
  {
    title: 'Python Basics',
    description: 'Python fundamentals: data types, control flow, functions, list comprehensions, and file I/O.',
    tags: ['Backend', 'AI Basics'],
    icon: '🐍',
    content: `## Python Basics — Quick Reference
\`\`\`python
# Data Types
int, float, str, bool, list, dict, tuple, set

# List Comprehension
squares = [x**2 for x in range(10) if x % 2 == 0]

# Functions
def greet(name: str, excited: bool = False) -> str:
    return f"Hello {name}{'!' if excited else '.'}"

# Lambda
double = lambda x: x * 2

# File I/O
with open('file.txt', 'r') as f:
    content = f.read()

# Dict Methods
d.get('key', default)
d.items()
d.keys()
d.values()

# Error Handling
try:
    result = risky_operation()
except ValueError as e:
    print(f"Error: {e}")
finally:
    cleanup()

# Enumerate / Zip
for i, item in enumerate(items):
    print(i, item)

for a, b in zip(list1, list2):
    print(a, b)
\`\`\``
  },
  {
    title: 'SQL Queries',
    description: 'Essential SQL patterns: SELECT, JOINs, aggregations, subqueries, and window functions.',
    tags: ['Backend', 'Databases'],
    icon: '🗄️',
    content: `## SQL Queries — Quick Reference
\`\`\`sql
-- Basic SELECT
SELECT column1, column2
FROM table
WHERE condition
ORDER BY column DESC
LIMIT 10;

-- JOINs
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- Aggregation
SELECT category, COUNT(*) as count, AVG(price) as avg_price
FROM products
GROUP BY category
HAVING COUNT(*) > 5;

-- Subquery
SELECT * FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- Window Functions
SELECT name, department, salary,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank
FROM employees;

-- CTE
WITH recent AS (
  SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '7 days'
)
SELECT * FROM recent;

-- Indexes
CREATE INDEX idx_email ON users(email);
\`\`\``
  },
]

const DEV_NOTES = [
  { title: 'Getting Started with React', description: 'A comprehensive guide to setting up and building your first React application from scratch.', tags: ['Frontend', 'React'], type: 'Guide' },
  { title: 'Node.js REST API Patterns', description: 'Best practices for designing and implementing RESTful APIs with Node.js and Express.', tags: ['Backend', 'Node.js'], type: 'Guide' },
  { title: 'Python for Data Science', description: 'Introduction to data analysis workflows using Python, pandas, and visualization libraries.', tags: ['AI Basics', 'Python'], type: 'Guide' },
  { title: 'Git Collaborative Workflows', description: 'Team-based Git workflows including Git Flow, trunk-based development, and code review practices.', tags: ['Frontend', 'Backend', 'DevOps'], type: 'Guide' },
  { title: 'CSS Grid & Flexbox Handbook', description: 'Complete visual reference for modern CSS layout techniques with practical examples.', tags: ['Frontend', 'CSS'], type: 'PDF' },
  { title: 'SQL Performance Tuning', description: 'Query optimization, index strategies, and database design patterns for performant applications.', tags: ['Backend', 'Databases'], type: 'PDF' },
]

function QuickSheetModal({ sheet, onClose }) {
  if (!sheet) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-[#0f1420]/80 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{sheet.icon}</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{sheet.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-900 dark:text-slate-300 [&_pre]:bg-slate-50 dark:[&_pre]:bg-[#131316] [&_pre]:border [&_pre]:border-slate-200 dark:[&_pre]:border-[#27272A] [&_pre]:rounded-xl [&_pre]:p-4 [&_code]:text-sm [&_code]:font-mono [&_h2]:text-slate-900 dark:[&_h2]:text-slate-100 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-6 [&_h2:first-child]:mt-0">
            <div dangerouslySetInnerHTML={{ __html: sheet.content
              .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
              .replace(/^## (.+)$/gm, '<h2>$1</h2>')
              .replace(/^### (.+)$/gm, '<h3>$1</h3>')
              .replace(/`([^`]+)`/g, '<code>$1</code>')
              .replace(/\n\n/g, '</p><p>')
              .replace(/^(?!<[hpc])(.+)$/gm, (m) => m.startsWith('<') ? m : m.trim() ? m : '')
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Resources() {
  const [activeTab, setActiveTab] = useState(0)
  const [quickSheet, setQuickSheet] = useState(null)

  return (
    <div className="min-h-screen bg-white dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Developer Resources</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">Cheat sheets, guides, and reference materials</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-slate-200/50 dark:bg-[#0f1420]/80 p-1 rounded-xl w-fit">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === i
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CHEAT_SHEETS.map((sheet) => (
              <SpotlightCard
                key={sheet.title}
                spotlightColor="rgba(6, 182, 212, 0.25)"
                onClick={() => setQuickSheet(sheet)}
                className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-cyan-400/30 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{sheet.icon}</span>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{sheet.title}</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">{sheet.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {sheet.tags.map((t) => (
                    <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-sky-600 dark:text-cyan-400 group-hover:gap-2 transition-all">
                  View Quick Sheet <ChevronRight className="w-3 h-3" />
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}

        {activeTab === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DEV_NOTES.map((note) => (
              <SpotlightCard
                key={note.title}
                spotlightColor="rgba(99, 102, 241, 0.25)"
                className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-indigo-500/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-indigo-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {note.type}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{note.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">{note.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {note.tags.map((t) => (
                    <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" /> {t}
                    </span>
                  ))}
                </div>
                <button className="flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-400 transition-all">
                  <Download className="w-3.5 h-3.5" /> Download Resource
                </button>
              </SpotlightCard>
            ))}
          </div>
        )}

        <QuickSheetModal sheet={quickSheet} onClose={() => setQuickSheet(null)} />
      </div>
    </div>
  )
}
