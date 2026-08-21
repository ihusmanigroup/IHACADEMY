const fs = require('fs');
const content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');
const regex = /content: `([\s\S]*?)`/g;
const matches = [...content.matchAll(regex)];
matches.forEach((m, i) => {
  console.log('Match', i, 'index:', m.index, 'full length:', m[0].length);
  console.log('  Start:', JSON.stringify(content.slice(m.index, m.index + 30)));
  console.log('  End:', JSON.stringify(content.slice(m.index + m[0].length - 30, m.index + m[0].length)));
  const innerBackticks = (m[1].match(/`/g) || []).length;
  console.log('  Inner backticks:', innerBackticks);
});
