const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

app = app.replace(
  /<\/button>\n        <\/div>\n      \)\}\n\n      \{\/\* Developer Settings/,
  `</button>
        </div>
      

      {/* Developer Settings`
);

fs.writeFileSync('App.tsx', app);
console.log("Fixed syntax error 2");
