import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Clock, Zap, Loader2, CheckCircle, PlayCircle, Lock, Crown, ChevronDown, FileText, Code2, Video, ClipboardCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { recordTransaction } from '../lib/transactions'
import { useAuth } from '../context/AuthContext'
import { useCourseProgress } from '../hooks/useCourseProgress'
import EnrollModal from '../components/EnrollModal'

// Lessons stored with a module_order / module_title (structured curriculum)
// open in the LearnView workspace; legacy lessons open the LessonPlayer.
const learnPathFor = (courseId, lesson) =>
  lesson?.module_order
    ? `/courses/${courseId}/learn?lesson=${lesson.id}`
    : `/dashboard/learn/${courseId}/lesson/${lesson.id}`

const lessonTypeConfig = {
  reading: { label: 'Reading', icon: FileText, cls: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20' },
  theory: { label: 'Reading', icon: FileText, cls: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20' },
  code: { label: 'Code', icon: Code2, cls: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20' },
  video: { label: 'Video', icon: Video, cls: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20' },
  quiz: { label: 'Quiz', icon: ClipboardCheck, cls: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' },
}

function LessonTypeBadge({ type }) {
  const c = lessonTypeConfig[type] || lessonTypeConfig.reading
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${c.cls}`}>
      <Icon className="w-3 h-3" /> {c.label}
    </span>
  )
}

export default function CourseDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [collapsed, setCollapsed] = useState(() => new Set())

  useEffect(() => {
    const fetchData = async () => {
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()

      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('lesson_order', { ascending: true })

      let enrollmentData = null
      if (user) {
        const { data } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', id)
          .maybeSingle()
        enrollmentData = data
      }

      setCourse(courseData)
      setLessons(lessonsData || [])
      setEnrollment(enrollmentData)
      setLoading(false)
    }
    fetchData()
  }, [id, user])

  const {
    completedIds,
    completedCount,
    progressPercent,
    firstIncompleteId,
    allCompleted,
  } = useCourseProgress(id, lessons.map((l) => l.id))

  const handleEnrollConfirm = async () => {
    setEnrolling(true)
    const { data, error } = await supabase
      .from('enrollments')
      .insert({ user_id: user.id, course_id: id })
      .select()
      .single()
    if (!error) {
      setEnrollment(data)
      // Paid course unlocks land in the billing ledger too.
      if (isFree !== true && (Number(course?.price) || 0) > 0) {
        try {
          await recordTransaction({
            item_type: 'course',
            item_name: course.title,
            amount: Number(course.price),
          })
        } catch (txErr) {
          console.warn('Course transaction skipped:', (txErr && txErr.message) || txErr)
        }
      }
    }
    setEnrolling(false)
    setShowModal(false)
  }

  const isFree = course && (course.price === 0 || course.is_free === true)

  // Group lessons by module for the syllabus accordions
  const modules = useMemo(() => {
    const mods = []
    lessons.forEach((lesson, idx) => {
      const order = lesson.module_order || Math.ceil((lesson.lesson_order || idx + 1) / 4)
      let mod = mods.find((m) => m.order === order)
      if (!mod) {
        mod = { order, title: lesson.module_title || `Module ${order}`, lessons: [] }
        mods.push(mod)
      }
      mod.lessons.push({ ...lesson, syllabusIndex: idx })
    })
    mods.sort((a, b) => a.order - b.order)
    // Add topic numbers within each module
    mods.forEach((mod) => {
      mod.lessons.forEach((lesson, i) => {
        lesson.topicLabel = `${mod.order}.${i + 1}`
      })
    })
    return mods
  }, [lessons])

  const levelColors = {
    Beginner: 'text-green-600 dark:text-cyan-300 border-green-200 dark:border-cyan-400/30 bg-green-50 dark:bg-blue-500/10',
    Intermediate: 'text-yellow-600 dark:text-indigo-400 border-yellow-200 dark:border-indigo-500/30 bg-yellow-50 dark:bg-indigo-500/10',
    Advanced: 'text-red-600 dark:text-slate-300 border-red-200 dark:border-slate-500/30 bg-red-50 dark:bg-slate-500/10',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#07090e] flex items-center justify-center transition-colors duration-300">
        <Loader2 className="w-6 h-6 animate-spin text-slate-600 dark:text-slate-300" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#07090e] flex items-center justify-center transition-colors duration-300">
        <p className="text-slate-600 dark:text-slate-300">Course not found.</p>
      </div>
    )
  }

  const totalLessons = lessons.length || course.total_lessons || 0
  const isEnrolled = !!enrollment
  const isCompleted = enrollment?.status === 'completed' || allCompleted

  // Sequential unlock: everything up to and including the current active
  // lesson (the first incomplete one) is unlocked; the rest stay locked.
  const firstIncompleteIndex = firstIncompleteId
    ? lessons.findIndex((l) => l.id === firstIncompleteId)
    : lessons.length
  const isLessonUnlocked = (idx) => idx <= firstIncompleteIndex

  const continueTarget = firstIncompleteId
    ? learnPathFor(course.id, lessons.find((l) => l.id === firstIncompleteId))
    : `/courses/${course.id}/learn`

  return (
    <div className="min-h-screen bg-white dark:bg-[#07090e] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-cyan-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${levelColors[course.level] || levelColors.Beginner}`}>
                  {course.level || 'Beginner'}
                </span>
                {course.category && (
                  <span className="text-xs text-slate-600 dark:text-slate-300 uppercase tracking-wider">{course.category}</span>
                )}
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isFree
                    ? 'border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                    : 'bg-[#6366F1] text-white'
                }`}>
                  {isFree ? 'Free' : 'Premium'}
                </span>
              </div>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                {course.description || 'No description available.'}
              </p>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Est. {lessons.reduce((s, l) => s + (l.duration_mins || 0), 0)} min
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                {course.xp_reward} XP reward
              </span>
            </div>

            {/* Syllabus — grouped by module with accordions */}
            <div>
              <h2 className="text-xl font-bold mb-4">Course Syllabus</h2>
              <div className="space-y-3">
                {modules.length === 0 && (
                  <p className="text-sm text-slate-600 dark:text-slate-300">Lessons coming soon.</p>
                )}
                {modules.map((mod) => {
                  const modCompleted = mod.lessons.filter((l) => completedIds.has(l.id)).length
                  const modDone = modCompleted === mod.lessons.length
                  const isCollapsed = collapsed.has(mod.title)
                  return (
                    <div key={mod.title} className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <button
                        onClick={() => {
                          const next = new Set(collapsed)
                          if (next.has(mod.title)) next.delete(mod.title)
                          else next.add(mod.title)
                          setCollapsed(next)
                        }}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            modDone
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20'
                          }`}>
                            {modDone ? <CheckCircle className="w-3 h-3" /> : null}
                            {modCompleted}/{mod.lessons.length} completed
                          </span>
                          <span className="text-sm font-bold tracking-wide text-slate-900 dark:text-slate-100 truncate">{mod.title}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                      </button>
                      {!isCollapsed && (
                        <div className="p-2 flex flex-col gap-2">
                          {mod.lessons.map((lesson) => {
                            const isCompletedLesson = completedIds.has(lesson.id)
                            const isCurrent = lesson.id === firstIncompleteId
                            const isPreview = lesson.is_preview === true
                            const lessonType = lesson.lesson_type || 'reading'
                            // Access logic: preview lessons accessible for everyone, otherwise require enrollment
                            const canAccess = isFree || isEnrolled || isPreview
                            const isLocked = isEnrolled && !isCompletedLesson && !isLessonUnlocked(lesson.syllabusIndex)
                            const showLock = !canAccess
                            return (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-4 bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-slate-800 rounded-lg p-4 transition-colors"
                              >
                                {isCompletedLesson ? (
                                  <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                                ) : showLock ? (
                                  <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
                                ) : (
                                  <div className="w-8 h-5 flex items-center justify-center text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
                                    {lesson.topicLabel}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className={`text-sm font-medium truncate ${showLock ? 'text-slate-500 dark:text-slate-400' : isCompletedLesson ? 'text-slate-800 dark:text-slate-200' : 'text-slate-900 dark:text-slate-100'}`}>
                                      {lesson.title}
                                    </p>
                                    <LessonTypeBadge type={lessonType} />
                                    {isPreview && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                        Preview
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {lesson.duration_mins || 0} min
                                  </p>
                                </div>
                                {canAccess ? (
                                  isEnrolled ? (
                                    isLocked ? (
                                      <span className="flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500 shrink-0">
                                        <Lock className="w-3.5 h-3.5" /> Locked
                                      </span>
                                    ) : (
                                      <Link
                                        to={learnPathFor(course.id, lesson)}
                                        className="flex items-center gap-1 text-xs font-medium text-sky-600 dark:text-cyan-400 hover:underline shrink-0"
                                      >
                                        {isCompletedLesson ? 'Review' : isCurrent ? 'Continue' : 'Start'} <PlayCircle className="w-4 h-4" />
                                      </Link>
                                    )
                                  ) : (
                                    <Link
                                      to={learnPathFor(course.id, lesson)}
                                      className="flex items-center gap-1 text-xs font-medium text-sky-600 dark:text-cyan-400 hover:underline shrink-0"
                                    >
                                      {isPreview ? 'Preview' : 'Start'} <PlayCircle className="w-4 h-4" />
                                    </Link>
                                  )
                                ) : (
                                  <Lock className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className={`rounded-xl p-6 sticky top-6 transition-all bg-white dark:bg-[#0f1420]/80 border ${
              isFree
                ? 'border-slate-200 dark:border-slate-800'
                : 'border-cyan-400/30 dark:border-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.08)] dark:shadow-[0_0_15px_rgba(6,182,212,0.12)]'
            }`}>
              {/* Thumbnail */}
              <div className={`h-40 rounded-lg flex items-center justify-center mb-5 bg-gradient-to-br ${
                isFree
                  ? 'from-cyan-500/10 to-indigo-500/10 dark:from-cyan-500/10 dark:to-indigo-500/5'
                  : 'from-indigo-500/15 to-cyan-500/10 dark:from-indigo-500/15 dark:to-cyan-500/5'
              }`}>
                <BookOpen className={`w-10 h-10 opacity-50 ${
                  isFree ? 'text-sky-600 dark:text-cyan-400' : 'text-indigo-600 dark:text-indigo-400'
                }`} />
              </div>

              {/* Badge */}
              <div className={`flex items-center gap-1.5 justify-center mb-4 text-xs font-bold uppercase tracking-wider ${
                isFree ? 'text-indigo-600 dark:text-indigo-400' : 'text-sky-600 dark:text-cyan-300'
              }`}>
                {isFree ? <BookOpen className="w-3.5 h-3.5" /> : <Crown className="w-3.5 h-3.5" />}
                {isFree ? 'Free Course' : 'Premium Course'}
              </div>

              {/* Progress — computed live from lesson_completions */}
              {isEnrolled && (
                <div className="mb-5">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-cyan-600 dark:text-cyan-300 font-medium text-xs">Progress</span>
                    <span className="font-medium text-cyan-600 dark:text-cyan-300 text-xs">{progressPercent}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-cyan-600 dark:text-cyan-300/70 mt-1.5">
                    {completedCount} of {totalLessons} lessons completed
                  </p>
                </div>
              )}

              {/* Action Button */}
              {!isEnrolled ? (
                <button
                  onClick={() => setShowModal(true)}
                  className={`w-full font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] ${
                    isFree
                      ? 'bg-blue-500 hover:bg-cyan-400 text-black shadow-sm shadow-cyan-500/25'
                      : 'bg-[#6366F1] hover:bg-[#5558E6] text-white shadow-lg shadow-indigo-500/25'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Enroll {isFree ? 'Free' : 'Now'}
                </button>
              ) : isCompleted ? (
                <div className="text-center py-3">
                  <CheckCircle className="w-8 h-8 text-sky-600 dark:text-cyan-400 mx-auto mb-1" />
                  <p className="text-sm font-medium text-sky-600 dark:text-cyan-300">Completed</p>
                  <Link
                    to={`/courses/${course.id}/learn`}
                    className="mt-2 inline-block text-xs font-semibold text-sky-600 dark:text-cyan-400 hover:underline"
                  >
                    Review course
                  </Link>
                </div>
              ) : (
                <Link
                  to={continueTarget}
                  className="block w-full bg-sky-600 dark:bg-blue-500 hover:bg-blue-600 dark:hover:bg-cyan-300 text-white font-semibold py-2.5 rounded-lg text-center transition"
                >
                  Continue Learning
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <EnrollModal
          course={course}
          onConfirm={handleEnrollConfirm}
          onCancel={() => setShowModal(false)}
          enrolling={enrolling}
        />
      )}
    </div>
  )
}
