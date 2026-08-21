/**
 * Shared helpers for generating the 8 new free-course JSON files.
 * Each course script builds a course object and calls writeCourseFile().
 */

const fs = require('fs')
const path = require('path')

function writeCourseFile(course, num) {
  const filePath = path.join(__dirname, '..', 'course-data', `course-${num}.json`)
  fs.writeFileSync(filePath, JSON.stringify(course, null, 2), 'utf-8')
  console.log(`  ✅ Wrote course-${num}.json — ${course.title} (${course.lessons.length} modules)`)
}

function quiz(title, questions) {
  return { title, questions }
}

module.exports = { writeCourseFile, quiz }
