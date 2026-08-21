import { supabase } from './supabase'

/**
 * Fallback catalog used only when the live `courses` fetch fails or returns
 * nothing. Mirrors the free ($0) courses IH Academy publishes — the dynamic
 * query is the source of truth and this array simply guarantees the page
 * still renders offline.
 */
export const FALLBACK_FREE_COURSES = [
  { id: 'fallback-git', title: 'Git & GitHub Fundamentals', description: 'Version control essentials: commits, branching, pull requests, and collaborative workflows.', category: 'Tools', level: 'Beginner', total_lessons: 5 },
  { id: 'fallback-ai-fluency', title: 'AI Fluency', description: 'Understand core AI concepts, terminology, and real-world applications without a technical background.', category: 'AI Fundamentals', level: 'Beginner', total_lessons: 4 },
  { id: 'fallback-prompting', title: 'Prompt Engineering', description: 'Learn prompt design patterns, chain-of-thought, and advanced techniques to get the best from LLMs.', category: 'AI Tools', level: 'Beginner', total_lessons: 5 },
  { id: 'fallback-coding', title: 'AI-Assisted Coding', description: 'Use AI coding assistants to write, debug, and refactor code faster and more effectively.', category: 'AI Tools', level: 'Beginner', total_lessons: 5 },
  { id: 'fallback-llms', title: 'Introduction to LLMs', description: 'Understand how large language models work, their capabilities, and their limitations.', category: 'AI Fundamentals', level: 'Beginner', total_lessons: 4 },
  { id: 'fallback-api', title: 'API Fundamentals', description: 'Understand REST, GraphQL, request/response patterns, and how to integrate third-party APIs.', category: 'Fundamentals', level: 'Beginner', total_lessons: 4 },
  { id: 'fallback-db', title: 'Database Fundamentals', description: 'Learn relational design, SQL queries, and basic data modeling for applications.', category: 'Fundamentals', level: 'Beginner', total_lessons: 5 },
  { id: 'fallback-linux', title: 'Linux & Command Line Basics', description: 'Navigate the filesystem, manage processes, and write shell scripts with confidence.', category: 'Tools', level: 'Beginner', total_lessons: 4 },
]

/** Approximate completion hours from the catalog's real lesson count (~30 min/lesson). */
export function courseHours(course) {
  const lessons = Number(course?.total_lessons) || 4
  return Math.max(1, Math.round(lessons * 0.5))
}

/**
 * Fetch every free course published in the IH Academy catalog. No `.limit()`,
 * no track-restricted filtering — the full catalog is returned so the intern
 * portal can treat each free course as a mandatory requirement.
 */
export async function fetchFreeCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_free', true)
  if (error || !Array.isArray(data) || data.length === 0) {
    return FALLBACK_FREE_COURSES
  }
  return data
}