const fs = require('fs');
let css = fs.readFileSync('index.css', 'utf8');

css = css.replace(
  /background: conic-gradient\(from 0deg, transparent 0%, transparent 70%, rgba\(251, 191, 36, 1\) 100%\);/,
  'background: conic-gradient(from 0deg, transparent 0%, transparent 40%, rgba(251,191,36,0.2) 60%, rgba(251,191,36,0.8) 80%, rgba(251,191,36,1) 100%);'
);

css = css.replace(/inset: 0px;/, 'inset: -1px;');

fs.writeFileSync('index.css', css);
console.log('fixed css 2');
