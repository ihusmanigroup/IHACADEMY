const fs = require('fs');
const content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');

// Find template literals by looking for patterns like: content: `...`
// We need to escape backticks inside these template literals.
const regex = /(content:\s*`)([\s\S]*?)(?=`\s*[,\n\r])/g;

let fixed = content;
let count = 0;

const matches = [...content.matchAll(regex)];
for (const match of matches) {
  const prefix = match[1]; // "content: `"
  const inner = match[2];  // the content inside the backticks
  const suffix = '`';      // closing backtick
  
  // Escape any backticks in the inner content
  const escapedInner = inner.replace(/`/g, '\\`');
  
  if (inner !== escapedInner) {
    const fullMatch = match[0];
    const replacement = prefix + escapedInner + suffix;
    fixed = fixed.replace(fullMatch, replacement);
    count++;
  }
}

if (count > 0) {
  fs.writeFileSync('scripts/insert-course-1-git-github.js', fixed, 'utf8');
  console.log(`Fixed ${count} template literal(s) by escaping internal backticks`);
} else {
  console.log('No backticks found inside template literals');
}
