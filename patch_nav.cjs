const fs = require('fs');

let app = fs.readFileSync('App.tsx', 'utf8');

app = app.replace(
  /\{!isMobile && \(\s*<div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2 pointer-events-auto">/,
  `<div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2 pointer-events-auto">`
);

app = app.replace(
  /<\/button>\s*<\/div>\s*\)\}/,
  `</button>
        </div>`
);

app = app.replace(
  /<a\s*href="\/admin"\s*className="absolute bottom-6 right-6 z-\[9999\]/,
  `<a 
        href="/admin" 
        className="absolute bottom-6 left-6 z-[9999]`
);

fs.writeFileSync('App.tsx', app);
console.log("Patched App.tsx for mobile navigation.");
