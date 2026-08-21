/**
 * IH Academy — Quiz Expander
 * Adds 5-7 extra MCQs to each lesson's final topic so each lesson has 8-10 total.
 *
 * Usage:
 *   node scripts/expand-quizzes.js
 *   node scripts/seed-all-courses.js
 */

const fs = require('fs')
const path = require('path')

function expandMCQs(existing, extra) {
  const labels = ['A', 'B', 'C', 'D']
  let s = existing
  extra.forEach((q) => {
    s += `\n\n**Q${q.id}. ${q.q}**\n\n`
    q.options.forEach((opt, oi) => {
      if (oi < labels.length) s += `${labels[oi]}) ${opt}\n`
    })
    s += `\n> **Answer:** ${labels[q.answer]})\n\n`
  })
  return s
}

// ── Lesson 1: Version Control (existing Q1-Q3) ──
const lesson1Extra = [
  { id: 4, q: 'What is the difference between git reset --soft and git reset --hard?', options: ['--soft discards changes, --hard keeps them staged', '--soft keeps changes staged, --hard discards everything', 'Both are identical', '--hard keeps changes unstaged, --soft discards'], answer: 1 },
  { id: 5, q: 'Which command displays commit history in compact one-line format?', options: ['git log', 'git log --oneline', 'git history', 'git show'], answer: 1 },
  { id: 6, q: 'What does the .git directory contain?', options: ['Project source code only', 'Complete version history, config, and branch references', 'Dependencies and node_modules', 'Only the latest commit'], answer: 1 },
  { id: 7, q: 'What is the purpose of a .gitignore file?', options: ['To list ignored files in commits', 'To tell Git which files to exclude from tracking', 'To configure Git user identity', 'To store encrypted passwords'], answer: 1 },
  { id: 8, q: 'Which command unstages a file while preserving your changes?', options: ['git reset --hard', 'git restore --staged', 'git checkout -- file', 'git rm --cached'], answer: 1 },
  { id: 9, q: 'How does Git uniquely identify each commit?', options: ['By commit number', 'By SHA-1 cryptographic hash', 'By timestamp', 'By author name'], answer: 1 },
  { id: 10, q: 'What are the four Git operational areas in order?', options: ['Remote → Local → Stage → Working', 'Working → Staging → Local → Remote', 'Stage → Working → Remote → Local', 'Local → Remote → Staging → Working'], answer: 1 },
]

// ── Lesson 2: Branching & GitHub (existing Q1-Q3) ──
const lesson2Extra = [
  { id: 4, q: 'What does git fetch origin do?', options: ['Downloads and merges remote changes', 'Downloads remote data without merging', 'Uploads local commits to remote', 'Deletes remote branches'], answer: 1 },
  { id: 5, q: 'How do you delete a remote branch?', options: ['git branch -d remote-branch', 'git push origin --delete branch-name', 'git remote delete branch-name', 'git branch --delete --remote'], answer: 1 },
  { id: 6, q: 'What is a Pull Request primarily used for?', options: ['Requesting access to a repository', 'Proposing code changes for review before merging', 'Downloading changes from a remote', 'Creating a new repository'], answer: 1 },
  { id: 7, q: 'What does git push -u origin main accomplish?', options: ['Pushes and sets upstream tracking', 'Only pushes to origin', 'Pushes all branches', 'Creates a new main branch'], answer: 0 },
  { id: 8, q: 'Which merge strategy combines all feature commits into one?', options: ['Merge commit', 'Squash merge', 'Rebase', 'Fast-forward merge'], answer: 1 },
  { id: 9, q: 'What does the HEAD pointer reference in Git?', options: ['The latest commit on the current branch', 'The remote repository', 'The staging area', 'The project root directory'], answer: 0 },
  { id: 10, q: 'What is the purpose of CI checks on pull requests?', options: ['To automatically deploy code to production', 'To run tests and linting before merging', 'To assign reviewers', 'To close stale PRs'], answer: 1 },
]

// ── Lesson 3: HTML (existing Q1-Q3) ──
const lesson3Extra = [
  { id: 4, q: 'What is the purpose of the alt attribute on images?', options: ['To specify image dimensions', 'To provide alternative text for accessibility', 'To link to a high-res version', 'To add a caption below the image'], answer: 1 },
  { id: 5, q: 'Which HTML5 element defines a navigation section?', options: ['<navigation>', '<nav>', '<menu>', '<links>'], answer: 1 },
  { id: 6, q: 'What does aria-describedby do?', options: ['Hides an element from screen readers', 'Associates descriptive text with an element', 'Changes element color', 'Sets tab order'], answer: 1 },
  { id: 7, q: 'What is the correct way to link an external CSS file?', options: ['<css src="styles.css">', '<link rel="stylesheet" href="styles.css">', '<style src="styles.css">', '<script href="styles.css">'], answer: 1 },
  { id: 8, q: 'What does the required attribute do on form inputs?', options: ['Makes the input read-only', 'Marks the field as mandatory before submission', 'Adds a red border', 'Prefills the field with a value'], answer: 1 },
  { id: 9, q: 'What is semantic HTML?', options: ['HTML with inline styles', 'Using meaningful elements that describe content purpose', 'HTML that uses the fewest possible tags', 'HTML with JavaScript'], answer: 1 },
  { id: 10, q: 'Why should every <input> have a paired <label>?', options: ['For visual styling', 'For accessibility — screen readers associate labels with inputs', 'To reduce page load time', 'To enable form validation'], answer: 1 },
]

// ── Lesson 4: CSS (existing Q1-Q4) ──
const lesson4Extra = [
  { id: 5, q: 'What is the difference between padding and margin?', options: ['They are the same', 'Padding is inside the border; margin is outside', 'Margin is inside; padding is outside', 'Padding applies only to block elements'], answer: 1 },
  { id: 6, q: 'What does display: flex do by default?', options: ['Stacks items vertically', 'Arranges items in a horizontal row', 'Hides all child elements', 'Creates a grid layout'], answer: 1 },
  { id: 7, q: 'What is the purpose of @media queries?', options: ['To load external stylesheets', 'To apply styles based on device/viewport conditions', 'To animate elements', 'To import fonts'], answer: 1 },
  { id: 8, q: 'What is the mobile-first approach?', options: ['Designing for desktop first, then mobile', 'Writing base CSS for smallest screens and enhancing upward', 'Using only mobile devices for testing', 'Ignoring tablet layouts'], answer: 1 },
  { id: 9, q: 'What does flex: 1 mean?', options: ['The item takes full width', 'The item can grow, shrink, with basis of 0', 'The item has a fixed width of 1px', 'The item is hidden'], answer: 1 },
  { id: 10, q: 'What problem does box-sizing: border-box solve?', options: ['Margin collapsing', 'Padding and border being added to declared width', 'Font rendering across browsers', 'Image responsiveness'], answer: 1 },
]

// ── Process JSON files ──
const dataDir = path.join(__dirname, '..', 'course-data')
const extraMap = {
  'course-1.json': { 0: lesson1Extra, 1: lesson2Extra },
  'course-2.json': { 0: lesson3Extra, 1: lesson4Extra },
}

for (const [file, lessonExtras] of Object.entries(extraMap)) {
  const filePath = path.join(dataDir, file)
  const course = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  for (const [lessonIdx, extras] of Object.entries(lessonExtras)) {
    const idx = parseInt(lessonIdx)
    const lesson = course.lessons[idx]
    if (!lesson || !lesson.content || !lesson.content.topics) continue

    const lastTopic = lesson.content.topics[lesson.content.topics.length - 1]
    if (!lastTopic) continue

    lastTopic.content = expandMCQs(lastTopic.content, extras)
    console.log(`  ✅ ${file} lesson ${idx + 1}: ${extras.length} extra MCQs added to "${lastTopic.title}"`)
  }

  fs.writeFileSync(filePath, JSON.stringify(course, null, 2))
  console.log(`  ✅ ${file} updated`)
}

console.log('\n  🎉 Quizzes expanded to 8-10 MCQs per lesson!')
console.log('  Run node scripts/seed-all-courses.js to re-seed.')
