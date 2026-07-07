const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

app = app.replace(
  /BG & AUDIO \/ 背景与音频\n                <\/button>\n        <\/div>/,
  `BG & AUDIO / 背景与音频
                </button>
              </div>
            )}`
);

fs.writeFileSync('App.tsx', app);
console.log("Fixed syntax error");
