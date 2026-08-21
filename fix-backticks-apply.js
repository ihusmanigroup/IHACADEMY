const fs = require('fs');
const path = require('path');
const files = [
  path.join(__dirname, 'scripts', 'insert-course-1-git-github.js'),
  path.join(__dirname, 'insert-course-2-simple.js')
];

for (const f of files) {
  if (!fs.existsSync(f)) { console.warn('File not found, skipping:', f); continue }
  let s = fs.readFileSync(f, 'utf8');
  // Replace triple backticks followed immediately by newline (no language) with ```text\n
  s = s.replace(/```[ \t]*\r?\n/g, '```text\n');
  fs.writeFileSync(f, s, 'utf8');
  console.log('Patched file:', f);
}
