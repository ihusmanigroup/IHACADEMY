const fs = require('fs');
const content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');

const lines = content.split('\n');
const output = [];
let insideTemplate = false;
let fixedCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (!insideTemplate) {
    if (line.includes('content: `')) {
      insideTemplate = true;
      const idx = line.indexOf('content: `');
      const marker = 'content: `';
      const prefix = line.slice(0, idx + 'content: '.length);
      const rest = line.slice(idx + marker.length);
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
      
      // Only escape backticks that are NOT already escaped
      const escapedBefore = before.replace(/(^|[^\\])`/g, '$1\\`');
      if (before !== escapedBefore) fixedCount++;
      
      output.push(escapedBefore + after);
      insideTemplate = false;
    } else {
      // Escape backticks that are NOT already escaped
      const escaped = line.replace(/(^|[^\\])`/g, '$1\\`');
      if (line !== escaped) fixedCount++;
      output.push(escaped);
    }
  }
}

fs.writeFileSync('scripts/insert-course-1-git-github.js', output.join('\n'), 'utf8');
console.log('Escaped backticks. Fixed', fixedCount, 'lines');
