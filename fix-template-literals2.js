const fs = require('fs');
const content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');

const lines = content.split('\n');
const output = [];
let insideTemplate = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (!insideTemplate) {
    if (line.includes('content: `')) {
      insideTemplate = true;
      const idx = line.indexOf('content: `');
      const prefix = line.slice(0, idx + 'content: '.length);
      const rest = line.slice(idx + 'content: `.length);
      output.push(prefix + '`' + rest);
      continue;
    }
    output.push(line);
  } else {
    const trimmed = line.trimEnd();
    const lastBacktickIdx = trimmed.lastIndexOf('`');
    
    if (lastBacktickIdx !== -1 && !trimmed.includes('${')) {
      const before = line.slice(0, lastBacktickIdx);
      const after = line.slice(lastBacktickIdx);
      const escapedBefore = before.replace(/`/g, '\\`');
      output.push(escapedBefore + after);
      insideTemplate = false;
    } else {
      const escaped = line.replace(/`/g, '\\`');
      output.push(escaped);
    }
  }
}

fs.writeFileSync('scripts/insert-course-1-git-github.js', output.join('\n'), 'utf8');
console.log('Fixed template literals');
