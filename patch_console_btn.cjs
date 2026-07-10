const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

app = app.replace(
  /setActiveConsoleScreenId\(activeConsoleScreenId === 3 \? null \: 3\)/g,
  'setActiveConsoleScreenId(activeConsoleScreenId === s.id ? null : s.id)'
);
app = app.replace(
  /activeConsoleScreenId === 3/g,
  'activeConsoleScreenId === s.id'
);

fs.writeFileSync('App.tsx', app);
console.log('patched console btn');
