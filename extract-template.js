const fs = require('fs');
const lines = fs.readFileSync('test-parse.js', 'utf8').split('\n');
// Find the first backtick (line 35)
const start = lines[34].indexOf('`');
const firstPart = lines.slice(0, 35).join('\n') + lines[34].slice(start);
// Find the closing backtick on line 373
const endLine = lines[372];
const endIdx = endLine.lastIndexOf('`');
const templateContent = firstPart + '\n' + lines.slice(35, 373).join('\n') + '\n' + endLine.slice(0, endIdx + 1);
const fullFile = templateContent + '\nconsole.log("OK");\n';
fs.writeFileSync('test-template.js', fullFile);
