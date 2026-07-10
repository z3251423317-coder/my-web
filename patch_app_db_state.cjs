const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

app = app.replace(
  /if \(data\.relationshipCards\) setRelationshipCards\(data\.relationshipCards\);/g,
  'if (data.relationshipCards) setRelationshipCards(data.relationshipCards);\n            if (data.screen7Cards) setScreen7Cards(data.screen7Cards);'
);

app = app.replace(
  /if \(fallback\.relationshipCards\) setRelationshipCards\(fallback\.relationshipCards\);/g,
  'if (fallback.relationshipCards) setRelationshipCards(fallback.relationshipCards);\n          if (fallback.screen7Cards) setScreen7Cards(fallback.screen7Cards);'
);

app = app.replace(
  /relationshipCards: relationshipCards,/,
  'relationshipCards: relationshipCards,\n      screen7Cards: screen7Cards,'
);

fs.writeFileSync('App.tsx', app);
console.log('patched app db state');
