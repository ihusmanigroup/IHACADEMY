const fs = require('fs');
const content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');
const regex = /content: `([\s\S]*?)`/g;
const matches = [...content.matchAll(regex)];
console.log('Matches:', matches.length);
if (matches[0]) {
  const innerBackticks = (matches[0][1].match(/`/g) || []).length;
  console.log('Match 0 inner backticks:', innerBackticks);
}
