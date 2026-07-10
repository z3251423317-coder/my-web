const fs = require('fs');
let admin = fs.readFileSync('components/Admin.tsx', 'utf8');

admin = admin.replace(/if \(Array\.isArray\(data\.relationshipCards\)\) setRelationshipCards\(data\.relationshipCards\);/, 'if (Array.isArray(data.relationshipCards)) setRelationshipCards(data.relationshipCards);\n    if (Array.isArray(data.screen7Cards)) setScreen7Cards(data.screen7Cards);');

fs.writeFileSync('components/Admin.tsx', admin);
console.log('patched import config');
