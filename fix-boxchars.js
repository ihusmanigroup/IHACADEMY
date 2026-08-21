const fs = require('fs');
const path = 'scripts/insert-course-1-git-github.js';
let content = fs.readFileSync(path, 'utf8');

const replacements = {
  '┌': '+', '┐': '+', '└': '+', '┘': '+',
  '├': '+', '┤': '+', '┬': '+', '┴': '+', '┼': '+',
  '─': '-', '│': '|',
  '◄': '<', '►': '>'
};

let changed = 0;
for (const [unicode, ascii] of Object.entries(replacements)) {
  const escaped = unicode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = content.match(new RegExp(escaped, 'g')) || [];
  if (matches.length > 0) {
    content = content.split(unicode).join(ascii);
    changed += matches.length;
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced', changed, 'box-drawing characters with ASCII');
