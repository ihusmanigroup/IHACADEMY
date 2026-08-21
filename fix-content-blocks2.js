const fs = require('fs');
const content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');

const lines = content.split('\n');
const output = [];
let insideContent = false;
let contentLines = [];
let fixedCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (!insideContent) {
    if (line.includes('content: `')) {
      insideContent = true;
      contentLines = [line];
      continue;
    }
    output.push(line);
  } else {
    contentLines.push(line);
    
    const trimmed = line.trimEnd();
    const lastBacktickIdx = trimmed.lastIndexOf('`');
    
    if (lastBacktickIdx !== -1) {
      const afterBacktick = trimmed.slice(lastBacktickIdx + 1).trim();
      if (afterBacktick === '' || afterBacktick === ',' || afterBacktick === '},') {
        const processed = processContentLines(contentLines);
        output.push(...processed);
        contentLines = [];
        insideContent = false;
        fixedCount++;
      }
    }
  }
}

if (contentLines.length > 0) {
  output.push(...contentLines);
}

fs.writeFileSync('scripts/insert-course-1-git-github.js', output.join('\n'), 'utf8');
console.log('Fixed', fixedCount, 'content blocks');

function processContentLines(lines) {
  if (lines.length === 0) return [];
  
  const result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (i === 0) {
      const marker = 'content: `';
      const idx = line.indexOf(marker);
      const prefix = line.slice(0, idx + 'content: '.length);
      const rest = line.slice(idx + marker.length);
      result.push(prefix + '`' + rest);
    } else if (i === lines.length - 1) {
      result.push(line);
    } else {
      const escaped = line.replace(/(^|[^\\])`/g, '$1\\`');
      result.push(escaped);
    }
  }
  
  return result;
}
