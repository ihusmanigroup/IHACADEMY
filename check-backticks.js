const fs = require('fs');
const content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const matches = lines[i].match(/`/g);
  if (matches) {
    console.log('Line', i + 1, 'has', matches.length, 'backticks:', JSON.stringify(lines[i]));
  }
}
