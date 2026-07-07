const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

app = app.replace(/import \{ db \} from '\.\/firebase-config';\nimport \{ doc, onSnapshot \} from 'firebase\/firestore';\n/, '');

fs.writeFileSync('App.tsx', app);
console.log("Cleaned App.tsx");
