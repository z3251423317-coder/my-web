const fs = require('fs');
const content = fs.readFileSync('components/Admin.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('updateCardField') || line.includes('isLit')) {
    console.log(`${i+1}: ${line}`);
  }
});
