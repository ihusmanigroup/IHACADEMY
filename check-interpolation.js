const fs = require('fs');
const lines = fs.readFileSync('test-parse.js', 'utf8').split('\n');
for (let i = 34; i < 50; i++) {
  const line = lines[i];
  if (line.includes('${')) {
    console.log('Line', i + 1, 'has ${');
  }
}
