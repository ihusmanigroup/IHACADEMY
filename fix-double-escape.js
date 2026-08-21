const fs = require('fs');
const content = fs.readFileSync('scripts/insert-course-1-git-github.js', 'utf8');

// The file currently has triple backslash-backtick (\\`) due to double-escaping.
// We need to fix it to have single backslash-backtick (\`)
// Inside template literals, \` is the correct escape for a literal backtick.

let fixed = content;
let count = 0;

// Replace \\` with \` globally
// But we need to be careful not to replace outside template literals
// For simplicity, just replace all occurrences since this file only has backticks inside template literals
fixed = fixed.replace(/\\\\`/g, '\\`');
count++;

fs.writeFileSync('scripts/insert-course-1-git-github.js', fixed, 'utf8');
console.log('Fixed double-escaped backticks');
