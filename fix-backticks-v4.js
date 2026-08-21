const fs = require('fs');
const content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');

const lines = content.split('\n');
const output = [];
let insideTemplate = false;
let skipFirstLine = false;
let fixedCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (!insideTemplate) {
    if (line.includes('content: `')) {
      insideTemplate = true;
      skipFirstLine = true;
      const idx = line.indexOf('content: `');
      const marker = 'content: `';
      const prefix = line.slice(0, idx + 'content: '.length);
      const rest = line.slice(idx + marker.length);
      output.push(prefix + '`' + rest);
      continue;
    }
    output.push(line);
  } else {
    if (skipFirstLine) {
      skipFirstLine = false;
      output.push(line);
      continue;
    }
    
    let unescapedBacktickCount = 0;
    let lastUnecscapedIdx = -1;
    for (let j = 0; j < line.length; j++) {
      if (line.charCodeAt(j) === 96) {
        if (j === 0 || line.charCodeAt(j - 1) !== 92) {
          unescapedBacktickCount++;
          lastUnecscapedIdx = j;
        }
      }
    }
    
    if (unescapedBacktickCount === 1) {
      const before = line.slice(0, lastUnecscapedIdx);
      const after = line.slice(lastUnecscapedIdx);
      output.push(before + after);
      insideTemplate = false;
    } else if (unescapedBacktickCount > 1) {
      let escaped = '';
      let unescapedSeen = 0;
      for (let j = 0; j < line.length; j++) {
        if (line.charCodeAt(j) === 96 && (j === 0 || line.charCodeAt(j - 1) !== 92)) {
          unescapedSeen++;
          if (unescapedSeen < unescapedBacktickCount) {
            escaped += '\\`';
          } else {
            escaped += '`';
          }
        } else {
          escaped += line[j];
        }
      }
      output.push(escaped);
      fixedCount++;
    } else {
      output.push(line);
    }
  }
}

fs.writeFileSync('scripts/insert-course-1-git-github.js', output.join('\n'), 'utf8');
console.log('Fixed backticks. Modified', fixedCount, 'lines');
