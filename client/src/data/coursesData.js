// ---------------------------------------------------------------------------
// IH Academy — Premium PRO Major Tracks (local catalog source of truth)
// `id` is a FIXED UUID matching supabase/migrations/
// 20260731000001_seed_pro_major_courses.sql so enrollment FK constraints
// resolve once the migration is pushed, and dedupe-by-id keeps Pro (5).
// ---------------------------------------------------------------------------

import { mlMajorCourse } from './mlCourseData'
import { agenticAIMajorCourse } from './agenticAICourseData'
import { backendMajorCourse } from './backendCourseData'
import { frontendMajorCourse } from './frontendCourseData'
import { genAIMajorCourse } from './genaiCourseData'
import { loadJson, computeUnlockedLessons, nextLessonToDo } from '../utils/mlMajorProgress'
import { getPlan, PAID_FROM_LABEL } from './pricingData'

// Paid courses are unlocked through the pricing plans (Pro $30 / Premium $60 /
// Exclusive $100) — the catalog shows the entry tier, never a hardcoded amount.
const PRO_PRICE = getPlan('pro')?.price ? `From ${getPlan('pro').price}` : PAID_FROM_LABEL

export const PRO_MAJOR_COURSES = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    title: 'Machine Learning Engineering Major Course',
    description: 'Complete Beginner → Advanced Applied ML: Python, NumPy, Pandas, Scikit-Learn, PyTorch. The flagship AI/ML track.',
    category: 'AI & Data',
    level: 'Advanced',
    total_lessons: 93,
    xp_reward: 1200,
    price: PRO_PRICE,
    is_free: false,
    pro: true,
    trackLabel: 'AI/ML Track',
    modulesCount: 10,
    duration_hours: 45,
    thumbnail: '/thumbnails/ml-major.jpg',
    ebook: {
      title: 'Machine Learning Engineering — The Complete Field Guide',
      pages: 128,
      edition: '2026 Edition',
    },
  },
  {
    id: '00000000-0000-4000-8000-000000000005',
    title: 'Agentic AI Engineering Major Course',
    description: 'Autonomous Agents, Multi-Agent Swarms, Tool Use, LangGraph & Production AI.',
    category: 'AI & Data',
    level: 'Advanced Applied AI',
    total_lessons: 100,
    xp_reward: 1600,
    price: PRO_PRICE,
    is_free: false,
    pro: true,
    trackLabel: 'Agentic AI Track',
    modulesCount: 10,
    duration_hours: 40,
    thumbnail: '/thumbnails/agentic-ai-major.jpg',
    ebook: {
      title: 'Agentic AI Engineering — Building Autonomous Agents That Ship',
      pages: 124,
      edition: '2026 Edition',
    },
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    title: 'Backend Engineering Major Course',
    description: 'Node.js, Express, Databases, API Design, Security & Scalable Systems.',
    category: 'Backend',
    level: 'Beginner → Professional Backend Engineer',
    total_lessons: 100,
    xp_reward: 1300,
    price: PRO_PRICE,
    is_free: false,
    pro: true,
    trackLabel: 'Backend Track',
    modulesCount: 10,
    duration_hours: 40,
    thumbnail: '/thumbnails/backend-major.jpg',
    ebook: {
      title: 'Backend Engineering — Systems Design & Production APIs',
      pages: 132,
      edition: '2026 Edition',
    },
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    title: 'Frontend Engineering Major Course',
    description: 'HTML, CSS, JavaScript, React, State Management & Production UI Engineering.',
    category: 'Frontend',
    level: 'Beginner → Professional Frontend Engineer',
    total_lessons: 100,
    xp_reward: 1300,
    price: PRO_PRICE,
    is_free: false,
    pro: true,
    trackLabel: 'Frontend Track',
    modulesCount: 10,
    duration_hours: 40,
    thumbnail: '/thumbnails/frontend-major.jpg',
    ebook: {
      title: 'Frontend Engineering — Modern UI at Production Scale',
      pages: 126,
      edition: '2026 Edition',
    },
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    title: 'Generative AI Engineering Major Course',
    description: 'Transformers, Hugging Face, Prompt Engineering, LoRA Fine-Tuning, RAG & AI Agents.',
    category: 'AI & Data',
    level: 'Advanced Applied AI',
    total_lessons: 95,
    xp_reward: 1500,
    price: PRO_PRICE,
    is_free: false,
    pro: true,
    trackLabel: 'Generative AI Track',
    modulesCount: 10,
    duration_hours: 45,
    thumbnail: '/thumbnails/genai-major.jpg',
    ebook: {
      title: 'Generative AI Engineering — Transformers, RAG & AI Agents',
      pages: 136,
      edition: '2026 Edition',
    },
  },
]

// Rich course objects (full module/lesson data) keyed by catalog UUID, and
// catalog entries keyed by rich id — used to bridge the roadmap modal
// (needs rich data) and enrollment (needs the DB UUID).
const RICH_COURSES = [mlMajorCourse, agenticAIMajorCourse, backendMajorCourse, frontendMajorCourse, genAIMajorCourse]

export const PRO_MAJOR_RICH_BY_UUID = {}
export const PRO_MAJOR_CATALOG_BY_ID = {}
PRO_MAJOR_COURSES.forEach((c, i) => {
  const rich = RICH_COURSES[i]
  if (rich) {
    PRO_MAJOR_RICH_BY_UUID[c.id] = rich
    PRO_MAJOR_CATALOG_BY_ID[rich.id] = c
  }
})

export const PRO_MAJOR_IDS = new Set(PRO_MAJOR_COURSES.map((c) => c.id))

// The flagship ML Major's real `courses.id` (catalog UUID), used for Supabase
// queries against `enrollments` / `user_course_progress` whose `course_id` is
// a uuid FK — the local rich slug ("ml-engineering-major") would otherwise
// trigger PostgREST 400 "invalid input syntax for type uuid".
export const MAJOR_COURSE_DB_ID = PRO_MAJOR_CATALOG_BY_ID[mlMajorCourse.id]?.id || PRO_MAJOR_COURSES[0].id

// ---------------------------------------------------------------------------
// Local-content resolution + resume helpers.
//
// The PRO majors ship their full module/lesson content in the repo, so the
// UI can open them WITHOUT any Supabase round-trip. `resolveLocalCourse`
// accepts a catalog UUID, a rich course id, or a course object and returns
// the rich course (full lessons) or null when the course has no local data.
// ---------------------------------------------------------------------------
export function resolveLocalCourse(input) {
  if (!input) return null
  const id = typeof input === 'string' ? input : input.id
  if (PRO_MAJOR_RICH_BY_UUID[id]) return PRO_MAJOR_RICH_BY_UUID[id]
  const catalog = PRO_MAJOR_CATALOG_BY_ID[id]
  return catalog ? PRO_MAJOR_RICH_BY_UUID[catalog.id] || null : null
}

// Flatten ANY rich course's modules into a lesson list (same shape the ML
// progress engine expects: each lesson tagged with its module metadata).
export function localLessonList(course) {
  if (!course?.modules) return []
  return course.modules.flatMap((m) =>
    (m.lessons || []).map((l) => ({
      ...l,
      moduleId: m.id,
      moduleNumber: m.number,
      moduleTitle: m.title,
      moduleDifficulty: m.difficulty,
    }))
  )
}

// Per-course local progress lives under this key (shared by CourseViewer,
// Courses.jsx card resumes, and the roadmap modal "Start Module" actions).
export const localProgressKey = (courseId) => `ih_local_progress_${courseId}`

// First lesson the user should open for a local course: the next uncompleted
// unlocked lesson, falling back to the explicit target or the very first
// lesson when progress is empty.
export function localResumeLesson(course, fallbackLessonId = null) {
  const flat = localLessonList(course)
  if (!flat.length) return null
  const completed = new Set(loadJson(localProgressKey(course.id), []))
  const unlocked = computeUnlockedLessons(flat, completed)
  const resume = nextLessonToDo(flat, completed, unlocked)
  return resume?.id || fallbackLessonId || flat[0].id
}

// Per-course quiz + capstone submission state (CourseViewer persists here).
export const localQuizKey = (courseId) => `ih_local_quiz_${courseId}`
export const localCapstoneKey = (courseId) => `ih_local_capstone_${courseId}`

// ---------------------------------------------------------------------------
// Module tree sections — the 10 content modules PLUS the two special
// interactive sections appended after Module 10:
//   Section 11 · Grand Quiz & Final Assessment  (20-question grand quiz)
//   Section 12 · Final Capstone Certification Project (3 capstone options)
// The quiz questions + capstone projects themselves live on the rich course
// (`course.grandQuiz`, `course.capstones`) and are rendered interactively by
// the CourseViewer.
// ---------------------------------------------------------------------------
export function localSections(course) {
  const modules = course?.modules || []
  return [
    ...modules,
    {
      id: 'quiz-section',
      number: 11,
      title: 'Grand Quiz & Final Assessment',
      kind: 'QUIZ',
      lessons: [
        { id: '11.1', title: '20-Question Grand Assessment Quiz', type: 'quiz', section: 'quiz' },
      ],
    },
    {
      id: 'capstone-section',
      number: 12,
      title: 'Final Capstone Certification Project',
      kind: 'CAPSTONE',
      lessons: [
        { id: '12.1', title: 'Choose & Submit Your Capstone Project', type: 'capstone', section: 'capstone' },
      ],
    },
  ]
}

// Flatten every section (modules + quiz + capstone) into one lesson list —
// used for sidebar rendering, navigation, and deep links (`?lesson=11.1`).
export function localAllLessons(course) {
  return localSections(course).flatMap((m) =>
    (m.lessons || []).map((l) => ({
      ...l,
      moduleId: m.id,
      moduleNumber: m.number,
      moduleTitle: m.title,
      moduleDifficulty: m.difficulty,
    }))
  )
}
