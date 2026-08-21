const fs = require('fs');
const content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');
// Check chars around 1895-1905
for (let i = 1895; i < 1905 && i < content.length; i++) {
  console.log(`Char ${i}: code=${content.charCodeAt(i).toString(16).padStart(4,'0')} char=${JSON.stringify(content[i])}`);
}
