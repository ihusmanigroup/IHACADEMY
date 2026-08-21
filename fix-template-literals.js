const fs = require('fs');
const content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');

// Split into lines for easier processing
const lines = content.split('\n');
const output = [];
let insideTemplate = false;
let templateStartLine = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (!insideTemplate) {
    // Check if this line starts a template literal
    if (line.includes('content: `')) {
      insideTemplate = true;
      templateStartLine = i;
      // Escape the backtick that opens the template literal content
      const idx = line.indexOf('content: `');
      output.push(line.slice(0, idx + 'content: '.length) + '`' + line.slice(idx + 'content: `.length));
      continue;
    }
    output.push(line);
  } else {
    // We're inside a template literal
    // Check if this line contains the closing backtick
    // The closing backtick is typically at the end of the content, followed by comma or nothing
    const trimmed = line.trimEnd();
    
    // Look for a backtick that's not part of ${ interpolation
    // The closing backtick will be the last significant backtick on the line
    const lastBacktickIdx = trimmed.lastIndexOf('`');
    
    if (lastBacktickIdx !== -1 && !trimmed.includes('${')) {
      // This line has the closing backtick
      // Escape all backticks before the last one, keep the last one as closing
      const before = line.slice(0, lastBacktickIdx);
      const after = line.slice(lastBacktickIdx);
      
      const escapedBefore = before.replace(/`/g, '\\`');
      output.push(escapedBefore + after);
      insideTemplate = false;
    } else {
      // Escape all backticks on this line
      const escaped = line.replace(/`/g, '\\`');
      output.push(escaped);
    }
  }
}

fs.writeFileSync('scripts/insert-course-1-git-github.js', output.join('\n'), 'utf8');
console.log('Escaped backticks inside template literals');
console.log('Template literal started at line:', templateStartLine + 1);
