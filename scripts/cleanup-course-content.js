/**
 * Strip inline MCQ sections from all 5 course JSON files
 * and add structured quiz objects to courses 1 and 2.
 *
 * Usage:
 *   node scripts/cleanup-course-content.js
 */

const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, '..', 'course-data')

const COURSE_1_QUIZ = {
  title: 'Knowledge Check',
  questions: [
    { q: 'What is the primary benefit of using feature branches?', options: ['It makes the codebase larger', 'It allows parallel development and safe experimentation', 'It automatically fixes bugs', 'It eliminates the need for testing'], answer: 1 },
    { q: 'What do conflict markers <<<<<< HEAD and >>>>>> branch-name indicate?', options: ['The file has syntax errors', 'Git cannot automatically reconcile changes to the same lines', 'The file is too large', 'The branch has been deleted'], answer: 1 },
    { q: 'What is a squash merge?', options: ['A merge that deletes the branch', 'Combining all commits from a feature branch into a single commit on main', 'A merge that only keeps the oldest commit', 'A merge that creates a new branch'], answer: 1 },
    { q: 'What does git fetch origin do?', options: ['Downloads and merges remote changes', 'Downloads remote data without merging', 'Uploads local commits to remote', 'Deletes remote branches'], answer: 1 },
    { q: 'How do you delete a remote branch?', options: ['git branch -d remote-branch', 'git push origin --delete branch-name', 'git remote delete branch-name', 'git branch --delete --remote'], answer: 1 },
    { q: 'What is a Pull Request primarily used for?', options: ['Requesting access to a repository', 'Proposing code changes for review before merging', 'Downloading changes from a remote', 'Creating a new repository'], answer: 1 },
    { q: 'What does git push -u origin main accomplish?', options: ['Pushes and sets upstream tracking', 'Only pushes to origin', 'Pushes all branches', 'Creates a new main branch'], answer: 0 },
    { q: 'Which merge strategy combines all feature commits into one?', options: ['Merge commit', 'Squash merge', 'Rebase', 'Fast-forward merge'], answer: 1 },
    { q: 'What does the HEAD pointer reference in Git?', options: ['The latest commit on the current branch', 'The remote repository', 'The staging area', 'The project root directory'], answer: 0 },
    { q: 'What is the purpose of CI checks on pull requests?', options: ['To automatically deploy code to production', 'To run tests and linting before merging', 'To assign reviewers', 'To close stale PRs'], answer: 1 },
  ]
}

const COURSE_2_QUIZ = {
  title: 'Knowledge Check',
  questions: [
    { q: 'What is the correct CSS specificity order from lowest to highest?', options: ['Class → Element → ID → Inline', 'Element → Class → ID → Inline', 'ID → Class → Element → Inline', 'Inline → ID → Class → Element'], answer: 1 },
    { q: 'What does box-sizing: border-box do?', options: ['Adds border inside the content area', 'Includes padding and border in the element\'s total width', 'Removes the margin from the box model', 'Doubles the padding calculation'], answer: 1 },
    { q: 'Which Flexbox property sets the main axis direction?', options: ['align-items', 'justify-content', 'flex-direction', 'flex-wrap'], answer: 2 },
    { q: 'What is the mobile-first approach to responsive design?', options: ['Writing desktop styles first, then overriding for mobile', 'Writing base styles for small screens, then enhancing for larger ones', 'Using only JavaScript for layout changes', 'Creating separate HTML files for each device'], answer: 1 },
    { q: 'What is the difference between padding and margin?', options: ['They are the same', 'Padding is inside the border; margin is outside', 'Margin is inside; padding is outside', 'Padding applies only to block elements'], answer: 1 },
    { q: 'What does display: flex do by default?', options: ['Stacks items vertically', 'Arranges items in a horizontal row', 'Hides all child elements', 'Creates a grid layout'], answer: 1 },
    { q: 'What is the purpose of @media queries?', options: ['To load external stylesheets', 'To apply styles based on device/viewport conditions', 'To animate elements', 'To import fonts'], answer: 1 },
    { q: 'What is the mobile-first approach?', options: ['Designing for desktop first, then mobile', 'Writing base CSS for smallest screens and enhancing upward', 'Using only mobile devices for testing', 'Ignoring tablet layouts'], answer: 1 },
    { q: 'What does flex: 1 mean?', options: ['The item takes full width', 'The item can grow, shrink, with basis of 0', 'The item has a fixed width of 1px', 'The item is hidden'], answer: 1 },
    { q: 'What problem does box-sizing: border-box solve?', options: ['Margin collapsing', 'Padding and border being added to declared width', 'Font rendering across browsers', 'Image responsiveness'], answer: 1 },
  ]
}

const QUIZ_MAP = { 1: COURSE_1_QUIZ, 2: COURSE_2_QUIZ }

function stripMCQSection(content) {
  const header = '\u{1F9E0} Quick Knowledge Check'
  const idx = content.indexOf(header)
  if (idx === -1) {
    // Also try without emoji
    const altIdx = content.indexOf('Quick Knowledge Check')
    if (altIdx === -1) return content
    // Find the line start
    const lineStart = content.lastIndexOf('\n', altIdx)
    return content.slice(0, lineStart).trim()
  }
  // Find the line start before the header
  const lineStart = content.lastIndexOf('\n', idx)
  return content.slice(0, lineStart).trim()
}

function processCourse(num) {
  const filePath = path.join(dataDir, `course-${num}.json`)
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  course-${num}.json not found, skipping`)
    return
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  let modified = false

  for (const lesson of data.lessons) {
    if (lesson.content && lesson.content.topics && Array.isArray(lesson.content.topics)) {
      const lastTopic = lesson.content.topics[lesson.content.topics.length - 1]
      if (lastTopic && lastTopic.content) {
        const cleaned = stripMCQSection(lastTopic.content)
        if (cleaned !== lastTopic.content) {
          lastTopic.content = cleaned
          modified = true
        }
      }
    }
  }

  // Add quiz object for courses 1 and 2 (if not already present)
  if (QUIZ_MAP[num]) {
    const lastLesson = data.lessons[data.lessons.length - 1]
    if (lastLesson && !lastLesson.quiz) {
      lastLesson.quiz = QUIZ_MAP[num]
      modified = true
      console.log(`  ✅ Added quiz object to course-${num}.json (${lastLesson.quiz.questions.length} questions)`)
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    console.log(`  ✅ Stripped inline MCQs from course-${num}.json`)
  } else {
    console.log(`  ⏭️  No changes needed for course-${num}.json`)
  }
}

for (let i = 1; i <= 5; i++) processCourse(i)
console.log('\n  🎉 All course JSON files cleaned up!')
