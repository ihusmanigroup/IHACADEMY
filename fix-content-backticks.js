const fs = require('fs');
let content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');

// Find both template literals containing lesson content
const regex = /content: `([\s\S]*?)`/g;
let match;
let replacements = 0;

while ((match = regex.exec(content)) !== null) {
  const full = match[0];
  const inner = match[1];
  const startIdx = match.index;
  const endIdx = startIdx + full.length;
  
  // Escape backticks in the inner content
  const escapedInner = inner.replace(/`/g, '\\`');
  
  if (inner !== escapedInner) {
    content = content.slice(0, startIdx + 'content: `'.length) + escapedInner + content.slice(endIdx - 1);
    replacements += (inner.match(/`/g) || []).length;
    // Reset regex index since content changed
    regex.lastIndex = startIdx + 'content: `'.length + escapedInner.length;
  }
}

fs.writeFileSync('scripts/insert-course-1-git-github.js', content, 'utf8');
console.log('Escaped', replacements, 'backticks inside lesson content template literals');
