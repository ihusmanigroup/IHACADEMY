const fs = require('fs');
const content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');
const matches = [...content.matchAll(/content: `([\s\S]*?)`/g)];
matches.forEach((m, i) => {
  const backticks = (m[1].match(/`/g) || []).length;
  console.log('Match', i, 'has', backticks, 'backticks');
  if (backticks > 0) {
    const firstBacktick = m[1].indexOf('`');
    console.log('  First backtick context:', JSON.stringify(m[1].slice(Math.max(0, firstBacktick - 20), firstBacktick + 20)));
  }
});
