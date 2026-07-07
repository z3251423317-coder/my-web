const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(/app\.post\("\/api\/config", \(req, res\) => \{\s*try \{\s*fs\.writeFileSync[\s\S]*?\} catch \(error: any\) \{\s*res\.status\(500\)\.json\(\{ error: error\.message \}\);\s*\}\s*\}\);/, '');
fs.writeFileSync('server.ts', server);
console.log("Fixed server duplicate");
