const fs = require('fs');
const content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');

const lines = content.split('\n');
const output = [];
let inside = false;
let opened = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (!inside) {
    if (line.includes('content: `')) {
      inside = true;
      opened = false;
      output.push(line);
      continue;
    }
    output.push(line);
  } else {
    if (!opened) {
      opened = true;
      output.push(line);
      continue;
    }
    
    const trimmed = line.trimEnd();
    const lastBacktick = trimmed.lastIndexOf('`');
    
    if (lastBacktick !== -1) {
      const after = trimmed.slice(lastBacktick + 1).trim();
      if (after === '' || after === ',' || after === '},' || after === '},') {
        const before = line.slice(0, lastBacktick);
        const at = line.slice(lastBacktick);
        const escaped = before.replace(/`/g, '\\`');
        output.push(escaped + at);
        inside = false;
        continue;
      }
    }
    
    const escaped = line.replace(/`/g, '\\`');
    output.push(escaped);
  }
}

fs.writeFileSync('scripts/insert-course-1-git-github.js', output.join('\n'), 'utf8');
console.log('Done');
