const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

app = app.replace(
  /\{enlargedCard\.isLit && \(\n              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500\/20 blur-3xl rounded-full pointer-events-none" \/>\n            \)\}/,
  '{enlargedCard.isLit && (\n              <>\n                <div className="lit-border-container" />\n                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />\n              </>\n            )}'
);

fs.writeFileSync('App.tsx', app);
console.log('patched enlarged card glow');
