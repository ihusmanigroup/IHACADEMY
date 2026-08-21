const fs = require('fs');
const content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');

const lines = content.split('\n');
let insideTemplate = false;

for (let i = 34; i < 70; i++) {
  const line = lines[i];
  
  if (!insideTemplate) {
    if (line.includes('content: `')) {
      insideTemplate = true;
      console.log('Line', i + 1, ':', 'START TEMPLATE');
      continue;
    }
  } else {
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
    console.log('Line', i + 1, ':', unescapedBacktickCount, 'unescaped backticks, content:', JSON.stringify(line.slice(0, 60)));
    
    if (unescapedBacktickCount === 1) {
      console.log('  -> CLOSING TEMPLATE');
      insideTemplate = false;
    } else if (unescapedBacktickCount > 1) {
      console.log('  -> WOULD ESCAPE ALL BUT LAST');
    }
  }
}
