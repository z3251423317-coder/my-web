const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

app = app.replace(
  /setRelationshipCards\(parsed\.relationshipCards\);\s+localStorage\.setItem\("alphaqubit_relationship_cards_v5", JSON\.stringify\(parsed\.relationshipCards\)\);/g,
  'setRelationshipCards(parsed.relationshipCards);\n        localStorage.setItem("alphaqubit_relationship_cards_v5", JSON.stringify(parsed.relationshipCards));\n      }\n      if (Array.isArray(parsed.screen7Cards)) {\n        setScreen7Cards(parsed.screen7Cards);\n        localStorage.setItem("alphaqubit_screen7_cards", JSON.stringify(parsed.screen7Cards));'
);

fs.writeFileSync('App.tsx', app);
console.log('patched app db state import');
