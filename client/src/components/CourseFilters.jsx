import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Search, ChevronDown, X } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'xp', label: 'XP: High to Low' },
  { value: 'alpha', label: 'Alphabetical (A-Z)' },
]

export default function CourseFilters({ courses, onFilteredCourses }) {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedCategories, setSelectedCategories] = useState(new Set())
  const [sortBy, setSortBy] = useState('popular')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const triggerRef = useRef(null)
  const dropdownRef = useRef(null)
  const menuWidth = 200

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 250)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (!dropdownOpen) return

    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setDropdownOpen(false)
      }
    }

    const handleKey = (e) => {
      if (e.key === 'Escape') setDropdownOpen(false)
    }

    const handleReposition = () => setDropdownOpen(false)

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [dropdownOpen])

  const openDropdown = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownStyle({
        top: rect.bottom + 8,
        left: Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 16),
      })
      setDropdownOpen(true)
    }
  }, [])

  const isFree = (c) => c.is_free === true || c.price === 0
  const allCoursesCount = courses.length
  const freeCourses = courses.filter((c) => isFree(c))
  const proCourses = courses.filter((c) => !isFree(c))

  const categories = useMemo(() => {
    const cats = [...new Set(courses.map((c) => c.category).filter(Boolean))]
    return cats.sort()
  }, [courses])

  const filtered = useMemo(() => {
    let result = [...courses]

    if (activeTab === 'free') result = result.filter((c) => isFree(c))
    else if (activeTab === 'pro') result = result.filter((c) => !isFree(c))

    if (selectedCategories.size > 0) {
      result = result.filter((c) => selectedCategories.has(c.category))
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      )
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        break
      case 'xp':
        result.sort((a, b) => (b.xp_reward || 0) - (a.xp_reward || 0))
        break
      case 'alpha':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        result.sort((a, b) => (b.xp_reward || 0) - (a.xp_reward || 0))
    }

    return result
  }, [courses, activeTab, selectedCategories, debouncedSearch, sortBy])

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const clearFilters = () => {
    setSearchInput('')
    setDebouncedSearch('')
    setActiveTab('all')
    setSelectedCategories(new Set())
    setSortBy('popular')
  }

  const hasActiveFilters =
    activeTab !== 'all' || selectedCategories.size > 0 || debouncedSearch !== '' || sortBy !== 'popular'

  useEffect(() => {
    onFilteredCourses(filtered)
  }, [filtered, onFilteredCourses])

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-300" />
        <input
          type="text"
          placeholder="Search courses by title or description..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-500 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
        />
        {searchInput && (
          <button
            onClick={() => { setSearchInput(''); setDebouncedSearch('') }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Pill tabs + Sort row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[
            { key: 'all', label: `All Courses (${allCoursesCount})` },
            { key: 'free', label: `Free (${freeCourses.length})` },
            { key: 'pro', label: `Pro (${proCourses.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-500 hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort trigger */}
        <div className="relative">
          <button
            ref={triggerRef}
            onClick={openDropdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-500 hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-white transition-all duration-200"
          >
            {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Sort'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category chips row */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-200 ${
                selectedCategories.has(cat)
                  ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30'
                  : 'border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-500 hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Results summary + clear filters */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-300">
          Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{filtered.length}</span> of {allCoursesCount} course{allCoursesCount !== 1 ? 's' : ''}
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-slate-500 dark:text-slate-300" />
          </div>
          <p className="text-slate-900 dark:text-slate-100 font-medium">No courses match your filters</p>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1 mb-4">Try adjusting your search or filter criteria.</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Portal-based sort dropdown */}
      {dropdownOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownStyle.top,
            left: dropdownStyle.left,
            zIndex: 9999,
            width: menuWidth,
          }}
          className="bg-white dark:bg-[#0f1420]/80 border border-slate-200 dark:border-white/10 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.2)] overflow-hidden"
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setSortBy(opt.value); setDropdownOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                sortBy === opt.value
                  ? 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 font-medium'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}
