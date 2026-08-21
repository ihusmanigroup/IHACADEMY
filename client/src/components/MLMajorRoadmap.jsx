import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Zap, CheckCircle2, Lock, Play, Target, Clock,
  Trophy, Rocket, Award, GraduationCap, Layers,
} from 'lucide-react'
import { mlMajorCourse } from '../data/mlCourseData'
import { MAJOR_COURSE_DB_ID, localResumeLesson } from '../data/coursesData'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useActiveCourse } from '../context/CourseContext'
import {
  MODULE_XP_REWARD, COMPLETED_KEY, CAPSTONE_STATUS_KEY, lsKey, loadJson,
  flatLessonsOf, computeUnlockedLessons, computeMajorProgress, nextLessonToDo,
} from '../utils/mlMajorProgress'

const nodeColors = {
  completed: {
    dot: 'bg-emerald-500 border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.55)] text-white',
    ring: 'ring-4 ring-emerald-500/25',
    chip: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
  },
  active: {
    dot: 'bg-gradient-to-br from-sky-400 to-cyan-500 border-sky-300 shadow-[0_0_22px_rgba(14,165,233,0.7)] text-white',
    ring: 'ring-4 ring-sky-500/25',
    chip: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30',
  },
  open: {
    dot: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-300',
    ring: 'ring-4 ring-slate-500/10',
    chip: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border border-slate-200 dark:border-slate-700',
  },
  locked: {
    dot: 'bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-600',
    ring: '',
    chip: 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-600 border border-slate-200 dark:border-slate-800',
  },
}

// ---------------------------------------------------------------------------
// Roadmap body — shared by the standalone page (default export) and the modal
// (RoadmapModal). Renders a vertical winding roadmap path for ANY PRO major:
// module cards alternate left and right along a central connecting line, with
// a milestone pin at each node. Every surface uses light/dark Tailwind
// variants so the component follows the app theme both inside the drawer and
// on the standalone page (the drawer itself owns the single clean header).
// ---------------------------------------------------------------------------
export function RoadmapContent({ course = mlMajorCourse, inModal = false, onStart = null }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { markCourseStarted } = useActiveCourse()
  const isMajor = course.id === mlMajorCourse.id
  const trackModules = isMajor ? null : course.roadmap?.modules || []

  const [completedLessons, setCompletedLessons] = useState(() => new Set(loadJson(COMPLETED_KEY, [])))
  const [quizSubmitted, setQuizSubmitted] = useState(() => loadJson(lsKey('quiz_submitted'), false))
  const [capstoneStatuses, setCapstoneStatuses] = useState(() => loadJson(CAPSTONE_STATUS_KEY, {}))
  const [selected, setSelected] = useState(null)
  const userSprite = (() => {
    try { return localStorage.getItem('ih_user_sprite') || '🧑‍💻' } catch { return '🧑‍💻' }
  })()

  // Star rating per module based on completion percentage
  const getModuleStars = (moduleId) => {
    const lessons = flatLessons.filter((l) => l.moduleId === moduleId)
    if (lessons.length === 0) return 0
    const done = lessons.filter((l) => completedLessons.has(l.id)).length
    const pct = (done / lessons.length) * 100
    if (pct >= 100) return 3
    if (pct >= 70) return 2
    if (done > 0) return 1
    return 0
  }

  const flatLessons = useMemo(() => (isMajor ? flatLessonsOf() : []), [isMajor])
  const unlockedLessons = useMemo(
    () => computeUnlockedLessons(flatLessons, completedLessons),
    [flatLessons, completedLessons]
  )
  const progress = useMemo(
    () =>
      isMajor
        ? computeMajorProgress(flatLessons, completedLessons, quizSubmitted, capstoneStatuses, 0)
        : {
            totalLessons: course.total_lessons || 0,
            quizTotal: 0,
            capstoneTotal: 0,
            lessonPercent: 0,
            quizPercent: 0,
            capstonePercent: 0,
            overallProgress: 0,
            courseComplete: true,
            certificateUnlocked: false,
            pendingCapstone: false,
            capstoneSubmittedCount: 0,
            capstoneInReviewCount: 0,
          },
    [isMajor, flatLessons, completedLessons, quizSubmitted, capstoneStatuses, course]
  )

  const lessonsOf = (moduleId) => flatLessons.filter((l) => l.moduleId === moduleId)
  const moduleCompleted = (moduleId) => {
    const lessons = lessonsOf(moduleId)
    return lessons.length > 0 && lessons.every((l) => completedLessons.has(l.id))
  }

  // Node states ------------------------------------------------------------
  const activeModuleId = useMemo(() => {
    if (isMajor) {
      const incomplete = mlMajorCourse.modules.find((m) => {
        const lessons = lessonsOf(m.id)
        return !moduleCompleted(m.id) && lessons.some((l) => unlockedLessons.has(l.id))
      })
      return incomplete?.id || null
    }
    return null
  }, [isMajor, completedLessons, unlockedLessons]) // eslint-disable-line react-hooks/exhaustive-deps

  const nodes = useMemo(() => {
    if (!isMajor) {
      return (trackModules || []).map((mod, index) => ({
        type: 'module',
        id: `gen-${index + 1}`,
        title: mod.title,
        number: index + 1,
        difficulty: mod.difficulty || course.level || 'Advanced',
        summary: mod.summary || course.description,
        objectives: mod.objectives || [`Complete all ${mod.lessons} lessons in Module ${index + 1}`, 'Practice with the built-in coding exercises', 'Pass the module checkpoint to advance'],
        durationMin: mod.lessons * 20,
        lessonCount: mod.lessons,
        completed: 0,
        unlocked: true,
        state: index === 0 ? 'active' : 'open',
      }))
    }

    const moduleNodes = mlMajorCourse.modules.map((mod) => {
      const lessons = lessonsOf(mod.id)
      const done = lessons.filter((l) => completedLessons.has(l.id)).length
      const unlockedCount = lessons.filter((l) => unlockedLessons.has(l.id)).length
      let state = 'locked'
      if (moduleCompleted(mod.id)) state = 'completed'
      else if (mod.id === activeModuleId) state = 'active'
      else if (unlockedCount > 0) state = 'open'
      return {
        type: 'module',
        id: mod.id,
        title: mod.title,
        number: mod.number,
        difficulty: mod.difficulty,
        summary: mod.summary,
        objectives: mod.objectives,
        durationMin: lessons.length * 20,
        lessonCount: lessons.length,
        completed: done,
        unlocked: state !== 'locked',
        state,
      }
    })

    const quizNode = {
      type: 'quiz',
      id: 'quiz',
      title: 'Grand Quiz',
      subtitle: '20 MCQs · 2 per module',
      state: quizSubmitted ? 'completed' : progress.courseComplete ? 'active' : 'locked',
      unlocked: progress.courseComplete,
      lessonCount: progress.quizTotal,
      durationMin: 30,
      summary: 'The comprehensive Grand Quiz covering every module of the course.',
      objectives: ['Answer 20 multiple-choice questions, 2 from each module', 'Score 70%+ to prove you are capstone-ready', 'Retake as many times as you need'],
      completed: quizSubmitted ? progress.quizTotal : 0,
    }

    const capstoneNode = {
      type: 'capstone',
      id: 'capstone',
      title: 'Capstone Projects',
      subtitle: 'Choose one to earn your certificate',
      state: progress.capstoneSubmittedCount >= 1 ? 'completed' : quizSubmitted ? 'active' : 'open',
      unlocked: true,
      lessonCount: mlMajorCourse.capstones.length,
      durationMin: 720,
      summary: 'Build a complete end-to-end ML project. This is the final gate to your certificate.',
      objectives: ['Build a full ML pipeline with clean, documented code', 'Follow the professional project structure from Module 7', 'Submit one capstone to unlock your certificate'],
      completed: progress.capstoneSubmittedCount,
    }

    return [...moduleNodes, quizNode, capstoneNode]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMajor, trackModules, completedLessons, unlockedLessons, quizSubmitted, progress, activeModuleId])

  const resumeLesson = useMemo(
    () => (isMajor ? nextLessonToDo(flatLessons, completedLessons, unlockedLessons) : null),
    [isMajor, flatLessons, completedLessons, unlockedLessons]
  )

  // Remote sync (read-only; only the ML Major persists to Supabase)
  useEffect(() => {
    if (!user || !isMajor) return
    let cancelled = false
    const loadRemote = async () => {
      const { data } = await supabase
        .from('user_course_progress')
        .select('lessons_completed, quiz_submitted, capstone_status')
        .eq('user_id', user.id)
        .eq('course_id', MAJOR_COURSE_DB_ID)
        .maybeSingle()
      if (cancelled || !data) return
      const remote = new Set(Array.isArray(data.lessons_completed) ? data.lessons_completed : [])
      setCompletedLessons((prev) => {
        const merged = new Set([...prev, ...remote])
        if (merged.size > prev.size) localStorage.setItem(COMPLETED_KEY, JSON.stringify(Array.from(merged)))
        return merged
      })
      if (data.quiz_submitted) setQuizSubmitted(true)
      if (data.capstone_status && data.capstone_status !== 'pending') {
        setCapstoneStatuses((prev) => {
          const next = { ...prev }
          for (const cap of mlMajorCourse.capstones) {
            if (!next[cap.id]) next[cap.id] = data.capstone_status
          }
          return next
        })
      }
    }
    loadRemote()
    return () => { cancelled = true }
  }, [user, isMajor])

  const openNode = (node) => {
    if (!node.unlocked) return
    setSelected(node.id === selected ? null : node.id)
  }

  const startNode = (node) => {
    markCourseStarted(course)
    if (!isMajor) {
      // Non-ML tracks: hand the exact module back to the parent so it can
      // close the modal and open the CourseViewer on that module's first
      // lesson (node.number == 1-based module index in `course.modules`).
      const mod = (course.modules || [])[node.number - 1]
      const lessonId = mod?.lessons?.[0]?.id || null
      onStart?.(course, { moduleId: mod?.id || null, lessonId })
      return
    }
    if (node.type === 'module') {
      const first = lessonsOf(node.id)[0]
      navigate(`/ml-major-course?lesson=${first.id}`)
    } else if (node.type === 'quiz') {
      navigate('/ml-major-course?tab=quiz')
    } else {
      navigate('/ml-major-course?tab=capstone')
    }
  }

  const cardBase = (node) => {
    if (node.state === 'active') {
      return 'bg-sky-500/5 border-sky-500/40 shadow-md shadow-sky-500/10'
    }
    if (node.state === 'completed') {
      return 'bg-emerald-500/5 border-emerald-500/40'
    }
    return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 shadow-md'
  }

  const renderNodePin = (node, index) => {
    const c = nodeColors[node.state]
    // Sprite position: show user's sprite on the active/completed node
    const showSprite = node.unlocked && (node.state === 'active' || node.state === 'completed')
    const moduleStars = node.type === 'module' ? getModuleStars(node.id) : 0

    return (
      <div className="relative flex flex-col items-center">
        <button
          onClick={() => openNode(node)}
          disabled={!node.unlocked}
          className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-sm shadow-lg border-4 transition-transform duration-300 ${c.dot} ${c.ring} ${
            node.unlocked ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-60'
          } ${node.state === 'active' ? 'animate-pulse' : ''}`}
          title={node.unlocked ? `Preview ${node.title}` : 'Locked'}
        >
          {showSprite && node.type === 'module' ? (
            <span className="text-2xl animate-bounce" style={{ animationDelay: `${index * 150}ms` }}>{userSprite}</span>
          ) : node.state === 'completed' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : node.state === 'locked' ? (
            <Lock className="w-4 h-4" />
          ) : node.type === 'quiz' ? (
            <Trophy className="w-4 h-4" />
          ) : node.type === 'capstone' ? (
            <Rocket className="w-4 h-4" />
          ) : node.state === 'active' ? (
            <Play className="w-4 h-4" />
          ) : (
            index + 1
          )}
        </button>
        {/* Star rating for modules */}
        {node.type === 'module' && moduleStars > 0 && (
          <div className="mt-1.5 flex items-center gap-0.5" style={{ animationDelay: `${index * 100}ms` }}>
            {[1, 2, 3].map((s) => (
              <span key={s} className={`text-[10px] ${s <= moduleStars ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}>★</span>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderNodeCard = (node, isEven) => {
    const moduleStars = node.type === 'module' ? getModuleStars(node.id) : 0
    return (
      <button
        onClick={() => openNode(node)}
        disabled={!node.unlocked}
        className={`w-full p-4 rounded-2xl border transition-all duration-300 ${cardBase(node)} ${isEven ? 'text-right' : 'text-left'} ${
          node.unlocked
            ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:border-cyan-500/50'
            : 'opacity-50 cursor-not-allowed'
        }`}
      >
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
          {node.type === 'module' ? `Module ${node.number}` : node.type === 'quiz' ? 'Grand Quiz' : 'Capstone Projects'}
        </span>
        <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 mb-1 leading-snug">
          {node.type === 'module' ? `${node.number}. ${node.title}` : node.title}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {node.lessonCount} lessons • ~{node.durationMin} min
          {node.type === 'module' && node.completed > 0 && ` · ${node.completed}/${node.lessonCount} done`}
          {node.state === 'completed' && ' · completed'}
        </p>
        {node.type === 'module' && node.completed > 0 && (
          <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
              style={{ width: `${Math.round((node.completed / node.lessonCount) * 100)}%` }}
            />
          </div>
        )}
        {/* Star rating */}
        {node.type === 'module' && moduleStars > 0 && (
          <div className="mt-2 flex items-center justify-end gap-0.5">
            {[1, 2, 3].map((s) => (
              <span key={s} className={`text-sm ${s <= moduleStars ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}>★</span>
            ))}
            <span className="text-[10px] text-slate-500 dark:text-slate-500 ml-1">{moduleStars}/3</span>
          </div>
        )}
      </button>
    )
  }

  const selectedNode = nodes.find((n) => n.id === selected)

  return (
    <div className="text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className={`max-w-5xl mx-auto px-4 sm:px-6 ${inModal ? 'py-6' : 'py-8'}`}>
        {!inModal && (
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <Link
              to="/courses"
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Courses
            </Link>
            {isMajor && (
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  <Zap className="w-3 h-3" /> +{MODULE_XP_REWARD} XP per module
                </span>
              </div>
            )}
          </div>
        )}

        {/* Hero (standalone page only — the drawer owns its own single header) */}
        {!inModal && (
          <div className="bg-gradient-to-br from-white via-slate-50 to-sky-100/70 dark:from-[#111827] dark:via-[#0F172A] dark:to-[#0369A1]/20 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 mb-10 relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none bg-sky-500/10" />
            <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full blur-3xl pointer-events-none bg-cyan-500/5 dark:bg-cyan-500/10" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  <Layers className="w-3 h-3" /> Pro Track · Visual Roadmap
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-md bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                  {isMajor
                    ? `${mlMajorCourse.modules.length} Modules + Quiz + Capstones`
                    : `${course.modulesCount || trackModules?.length} Modules · ${course.total_lessons} Lessons`}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold leading-snug text-slate-900 dark:text-white">
                {isMajor ? 'Your Machine Learning Journey' : course.title}
              </h1>
              <p className="text-sm mt-1 max-w-xl leading-relaxed text-slate-500 dark:text-slate-400">
                {isMajor
                  ? progress.certificateUnlocked
                    ? 'Certificate unlocked — every node complete. Outstanding work!'
                    : progress.overallProgress >= 90
                      ? 'Just the capstone left — finish strong and claim your certificate.'
                      : 'Follow the path: complete lessons to unlock modules, conquer the Grand Quiz, and submit a capstone to earn your IH Academy certificate.'
                  : course.description}
              </p>
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Path completion</span>
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                      {isMajor ? `${progress.overallProgress}%` : 'Not started'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        progress.certificateUnlocked ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r from-sky-500 to-cyan-400 shadow-[0_0_8px_rgba(14,165,233,0.5)]'
                      }`}
                      style={{ width: `${progress.overallProgress}%` }}
                    />
                  </div>
                </div>
                {!isMajor ? (
                  <button
                    onClick={() => { markCourseStarted(course); onStart?.(course, { lessonId: localResumeLesson(course) }) }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-sky-500/30 cursor-pointer"
                  >
                    <Play className="w-4 h-4" /> Start the Track
                  </button>
                ) : resumeLesson ? (
                  <button
                    onClick={() => { markCourseStarted(course); navigate(`/ml-major-course?lesson=${resumeLesson.id}`) }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-sky-500/30 cursor-pointer"
                  >
                    <Play className="w-4 h-4" /> Resume Lesson {resumeLesson.id}
                  </button>
                ) : !progress.certificateUnlocked ? (
                  <button
                    onClick={() => { markCourseStarted(course); navigate('/ml-major-course?tab=quiz') }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-sky-500/30 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" /> Take the Grand Quiz
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Vertical winding roadmap path */}
        <div className="w-full max-w-xl mx-auto relative flex flex-col items-center">
          {/* Central connecting road / path line */}
          <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 via-blue-500 to-slate-300 dark:to-slate-700 rounded-full z-0" />

          {/* ROADMAP MODULE NODES (Alternating Left & Right) */}
          {nodes.map((node, index) => {
            const isEven = index % 2 === 0
            const isSelected = selected === node.id
            return (
              <div key={node.id} className="relative z-10 w-full my-6">
                <div className={`w-full flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                  {/* Card Content (Alternates sides) */}
                  <div className="w-[42%]">{renderNodeCard(node, isEven)}</div>
                  {/* Central Milestone Pin / Node Icon */}
                  <div className="w-[16%] flex justify-center">{renderNodePin(node, index)}</div>
                  {/* Empty Spacer Side */}
                  <div className="w-[42%]" />
                </div>

                {/* Preview popover */}
                {isSelected && selectedNode && (
                  <div className="mt-4 max-w-2xl mx-auto rounded-2xl p-6 shadow-2xl animate-fade-in border border-slate-200 dark:border-slate-700/70 border-t-2 border-t-sky-500 bg-white dark:bg-slate-800/90">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${nodeColors[selectedNode.state].chip}`}>
                            {selectedNode.type === 'module' ? `Module ${selectedNode.number}` : selectedNode.type === 'quiz' ? 'Grand Quiz' : 'Capstone'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            <Clock className="w-3 h-3" /> ~{selectedNode.durationMin} min
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            <Layers className="w-3 h-3" /> {selectedNode.lessonCount} lessons
                          </span>
                        </div>
                        <h3 className="text-base font-bold mt-2 leading-snug text-slate-900 dark:text-white">{selectedNode.title}</h3>
                        <p className="text-xs mt-1 leading-relaxed text-slate-500 dark:text-slate-400">{selectedNode.summary}</p>
                      </div>
                      <button
                        onClick={() => setSelected(null)}
                        className="text-xs font-bold transition-colors cursor-pointer text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        Close ✕
                      </button>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-sky-600 dark:text-sky-400 mb-2">
                        <Target className="w-3.5 h-3.5" /> Module Objectives
                      </div>
                      <ul className="space-y-1.5">
                        {selectedNode.objectives.map((obj) => (
                          <li key={obj} className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="w-3 h-3 text-sky-500 mt-0.5 shrink-0" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={() => startNode(selectedNode)}
                      className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-sky-500/30 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {selectedNode.type === 'module' ? (
                        <><Play className="w-4 h-4" /> Start Module {selectedNode.number}</>
                      ) : selectedNode.type === 'quiz' ? (
                        <><Trophy className="w-4 h-4" /> Start the Grand Quiz</>
                      ) : (
                        <><Rocket className="w-4 h-4" /> View Capstone Projects</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Certificate teaser */}
        {!inModal && (
          <div className="mt-10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 text-center md:text-left relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-transparent to-emerald-500/10 border border-slate-200 dark:border-slate-800">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(245,158,11,0.25)]">
              <Award className="w-6 h-6 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">IH Academy Certificate</p>
              <p className="text-xs mt-0.5 leading-relaxed text-slate-500 dark:text-slate-400">
                {isMajor
                  ? 'Complete all 10 modules, the Grand Quiz, and submit one capstone to unlock your Machine Learning Engineering certificate.'
                  : `Complete all ${course.modulesCount || trackModules?.length} modules (${course.total_lessons} lessons) to earn your ${course.title.split(' (')[0]} certificate.`}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
              <GraduationCap className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              {isMajor
                ? progress.certificateUnlocked
                  ? 'Unlocked — 100%'
                  : `${progress.overallProgress}% complete`
                : 'Ready to start'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MLMajorRoadmap() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-sky-50/40 dark:from-[#07090e] dark:via-[#0A0C12] dark:to-[#0C1220] transition-colors duration-300">
      <RoadmapContent />
    </div>
  )
}
