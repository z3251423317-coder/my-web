const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

app = app.replace(
  /\{card\.isLit && !isCardGray && <div className="lit-border-container" \/>\}\n                                    >/,
  '{card.isLit && !isCardGray && <div className="lit-border-container" />}'
);

fs.writeFileSync('App.tsx', app);
console.log('fixed app glow');
