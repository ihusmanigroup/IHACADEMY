const fs = require('fs');
const content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');

// We need to escape backticks that are inside template literals.
// Strategy: find template literal regions and escape backticks inside them.
// Template literals start with `content: ` or similar patterns.

// Actually, simpler approach: find all backticks and decide if they need escaping.
// Backticks that are NOT preceded by $ (i.e., not part of ${) and are inside 
// a template literal context need escaping.

// Let's use a state machine to track whether we're inside a template literal.
let result = '';
let inTemplate = false;
let i = 0;

while (i < content.length) {
  if (content.charCodeAt(i) === 96) { // `
    if (!inTemplate) {
      // Check if this is starting a template literal
      // Template literals in this file start after `content: ` or `title: `
      // But actually any ` that's not preceded by = or : might start one
      // Let's just check: if the previous non-whitespace char is : or , or { or =, it's likely a template literal start
      let j = i - 1;
      while (j >= 0 && (content.charCodeAt(j) === 32 || content.charCodeAt(j) === 9)) j--;
      const prev = j >= 0 ? content[j] : '';
      if (prev === ':' || prev === '=' || prev === ',' || prev === '{') {
        inTemplate = true;
        result += '`';
        i++;
        continue;
      }
    }
    
    if (inTemplate) {
      // Check if this is part of ${ interpolation
      if (i + 1 < content.length && content.charCodeAt(i + 1) === 123) { // {
        // This is ${, leave it alone
        result += '`';
        i++;
        continue;
      }
      
      // This backtick closes the template literal
      inTemplate = false;
      result += '`';
      i++;
      continue;
    }
  }
  
  result += content[i];
  i++;
}

fs.writeFileSync('scripts/insert-course-1-git-github.js', result, 'utf8');
console.log('Escaped backticks inside template literals');
