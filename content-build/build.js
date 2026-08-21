/**
 * Builds course-data/course-N.json files from the content source files in
 * content-build/course-N/module-M.md
 *
 * Source file format:
 *   Line 1:     # MODULE: <module title>
 *   Line 2:     # DURATION: <minutes>
 *   Then for each topic:
 *     ## TOPIC: <topic title>
 *     ...markdown content until the next ## TOPIC or ## QUIZ line...
 *   Then:
 *     ## QUIZ: <quiz title>
 *     Q: <question>
 *     A: <option 1>
 *     A: <option 2>
 *     A: <option 3>
 *     A: <option 4>
 *     ANS: <index of correct option, 0-based>
 *     (repeat Q/A blocks)
 *
 * Usage:
 *   node content-build/build.js
 */

const fs = require('fs')
const path = require('path')

const CONTENT_DIR = path.join(__dirname, 'course-src')
const OUT_DIR = path.join(__dirname, '..', 'course-data')

if (!fs.existsSync(CONTENT_DIR)) {
  console.error('Missing content-build/course-src directory.')
  process.exit(1)
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

function parseModuleFile(raw) {
  const lines = raw.split(/\r?\n/)
  const module = { title: null, duration: 30, topics: [], quiz: null }

  let currentTopic = null
  let currentQuiz = null
  let currentQuizQuestion = null

  const flushTopic = () => {
    if (currentTopic) {
      if (currentTopic.content.trim().length > 0) {
        module.topics.push({
          topic_id: module.topics.length + 1,
          title: currentTopic.title.trim(),
          content: currentTopic.content.trim(),
        })
      }
      currentTopic = null
    }
  }

  const flushQuizQuestion = () => {
    if (currentQuizQuestion) {
      if (currentQuizQuestion.q && currentQuizQuestion.options.length === 4) {
        currentQuiz.questions.push(currentQuizQuestion)
      }
      currentQuizQuestion = null
    }
  }

  for (const line of lines) {
    if (line.startsWith('# MODULE:')) {
      module.title = line.slice('# MODULE:'.length).trim()
    } else if (line.startsWith('# DURATION:')) {
      const d = parseInt(line.slice('# DURATION:'.length).trim(), 10)
      if (!isNaN(d)) module.duration = d
    } else if (line.startsWith('## TOPIC:')) {
      flushTopic()
      flushQuizQuestion()
      currentTopic = { title: line.slice('## TOPIC:'.length).trim(), content: '' }
    } else if (line.startsWith('## QUIZ:')) {
      flushTopic()
      flushQuizQuestion()
      currentQuiz = { title: line.slice('## QUIZ:'.length).trim(), questions: [] }
      module.quiz = currentQuiz
    } else if (line.startsWith('Q: ') && currentQuiz) {
      flushQuizQuestion()
      currentQuizQuestion = { q: line.slice(3).trim(), options: [], answer: -1 }
    } else if (line.startsWith('A: ') && currentQuizQuestion) {
      currentQuizQuestion.options.push(line.slice(3).trim())
    } else if (line.startsWith('ANS: ') && currentQuizQuestion) {
      currentQuizQuestion.answer = parseInt(line.slice(5).trim(), 10)
    } else if (currentQuizQuestion) {
      // ignore stray lines inside a quiz question
    } else if (currentTopic) {
      currentTopic.content += line + '\n'
    }
  }
  flushTopic()
  flushQuizQuestion()
  return module
}

function buildCourse(courseDir, num, courseMeta) {
  const files = fs
    .readdirSync(courseDir)
    .filter((f) => f.endsWith('.md'))
    .sort((a, b) => {
      const na = parseInt(a.match(/module-(\d+)/)?.[1] || '0', 10)
      const nb = parseInt(b.match(/module-(\d+)/)?.[1] || '0', 10)
      return na - nb
    })

  const lessons = files.map((f, i) => {
    const mod = parseModuleFile(fs.readFileSync(path.join(courseDir, f), 'utf-8'))
    return {
      title: mod.title || `Module ${i + 1}`,
      content: { topics: mod.topics },
      duration_mins: mod.duration,
      lesson_order: i + 1,
      ...(mod.quiz ? { quiz: mod.quiz } : {}),
    }
  })

  const course = {
    title: courseMeta.title,
    description: courseMeta.description,
    category: courseMeta.category,
    level: courseMeta.level,
    pricing_type: 'Free',
    price: 0,
    xp_reward: courseMeta.xp_reward,
    thumbnail_url: null,
    lessons,
  }

  const outPath = path.join(OUT_DIR, `course-${num}.json`)
  fs.writeFileSync(outPath, JSON.stringify(course, null, 2), 'utf-8')
  const topicCount = lessons.reduce((a, l) => a + (l.content.topics?.length || 0), 0)
  const quizCount = lessons.filter((l) => l.quiz).length
  console.log(`  ✅ course-${num}.json — ${course.title}: ${lessons.length} modules, ${topicCount} topics, ${quizCount} quizzes`)
}

const COURSES = [
  {
    num: 1,
    title: 'HTML for Absolute Beginners',
    description: 'Master the structural language of the web: elements, attributes, links, images, lists, tables, forms, and semantic HTML5.',
    category: 'Frontend',
    level: 'Beginner',
    xp_reward: 100,
  },
  {
    num: 2,
    title: 'CSS for Absolute Beginners',
    description: 'Style the web: selectors, the cascade, box model, colors, typography, Flexbox, positioning, and responsive design.',
    category: 'Frontend',
    level: 'Beginner',
    xp_reward: 100,
  },
  {
    num: 3,
    title: 'JavaScript for Absolute Beginners',
    description: 'Make pages interactive: variables, data types, operators, conditionals, loops, functions, arrays, objects, the DOM, and events.',
    category: 'Frontend',
    level: 'Beginner',
    xp_reward: 120,
  },
  {
    num: 4,
    title: 'React.js for Absolute Beginners',
    description: 'Build modern UIs with components, JSX, props, state, events, hooks, and the React Developer mindset.',
    category: 'Frontend',
    level: 'Beginner',
    xp_reward: 120,
  },
  {
    num: 5,
    title: 'Node.js for Absolute Beginners',
    description: 'Run JavaScript outside the browser: modules, npm, the file system, asynchronous programming, and building web servers with Express.',
    category: 'Backend',
    level: 'Beginner',
    xp_reward: 120,
  },
  {
    num: 6,
    title: 'API Fundamentals for Absolute Beginners',
    description: 'Understand how software talks to software: HTTP methods, endpoints, status codes, JSON, authentication, rate limits, and REST.',
    category: 'Fundamentals',
    level: 'Beginner',
    xp_reward: 100,
  },
  {
    num: 7,
    title: 'Large Language Models (LLMs) for Absolute Beginners',
    description: 'Understand how ChatGPT-style models work: tokens, parameters, training, prompting, context windows, hallucinations, and responsible use.',
    category: 'AI Fundamentals',
    level: 'Beginner',
    xp_reward: 100,
  },
  {
    num: 8,
    title: 'Git & GitHub for Absolute Beginners',
    description: 'Master version control: the Git lifecycle, commits, branches, merging, remotes, and GitHub collaboration workflows.',
    category: 'Tools',
    level: 'Beginner',
    xp_reward: 100,
  },
]

for (const meta of COURSES) {
  const dir = path.join(CONTENT_DIR, `course-${meta.num}`)
  if (!fs.existsSync(dir)) {
    console.log(`  ⚠️  Skipping course-${meta.num}: no content directory`)
    continue
  }
  buildCourse(dir, meta.num, meta)
}

console.log('\n  ✅ Build complete.')
