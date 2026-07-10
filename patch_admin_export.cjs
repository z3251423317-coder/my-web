const fs = require('fs');
let admin = fs.readFileSync('components/Admin.tsx', 'utf8');

const exportRegex = /trialCards,\s*relationshipCards\s*\};/;
admin = admin.replace(exportRegex, 'trialCards,\n      relationshipCards,\n      screen7Cards\n    };');

const importRegex = /setRelationshipCards\(data\.relationshipCards \|\| \[\]\);/;
admin = admin.replace(importRegex, 'setRelationshipCards(data.relationshipCards || []);\n    setScreen7Cards(data.screen7Cards || []);');

fs.writeFileSync('components/Admin.tsx', admin);
console.log('patched export config');
