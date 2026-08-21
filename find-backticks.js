const fs = require('fs');
const content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');
const matches = [...content.matchAll(/`/g)];
console.log('Total backticks:', matches.length);
matches.forEach((m, i) => {
  if (i < 20) {
    const ctx = content.slice(Math.max(0, m.index - 10), m.index + 10);
    console.log(`Backtick ${i + 1} at ${m.index}: ${JSON.stringify(ctx)}`);
  }
});
