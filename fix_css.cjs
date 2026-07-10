const fs = require('fs');
let css = fs.readFileSync('index.css', 'utf8');

css = css.replace(/width: 150%;\n  height: 150%;/, 'width: 200%;\n  height: 200%;');

fs.writeFileSync('index.css', css);
console.log('fixed css');
