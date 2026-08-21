const fs = require('fs');
const content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');
let count = 0;
for (let i = 0; i < content.length; i++) {
  if (content.charCodeAt(i) === 96) count++;
}
console.log('Total backticks:', count);

// Find the first template literal and check if it's closed
const firstStart = content.indexOf('content: `');
console.log('First template starts at:', firstStart);

// Count backticks after the first start
let inTemplate = false;
let balance = 0;
for (let i = firstStart + 8; i < content.length; i++) {
  if (content.charCodeAt(i) === 96) {
    balance++;
    if (balance === 1 && !inTemplate) {
      inTemplate = true;
      console.log('Template opened at char', i);
    } else if (balance === 2 && inTemplate) {
      console.log('Template closed at char', i);
      console.log('Content around close:', JSON.stringify(content.slice(i - 20, i + 20)));
      break;
    }
  }
}
