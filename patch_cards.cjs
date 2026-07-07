const fs = require('fs');

let app = fs.readFileSync('App.tsx', 'utf8');

app = app.replace(
  /if \(data\.pillNavItems\) setPillNavItems\(data\.pillNavItems\);/,
  `if (data.pillNavItems) setPillNavItems(data.pillNavItems);
        if (data.marqueeCards) setMarqueeCards(data.marqueeCards);
        if (data.sphereCards) setSphereCards(data.sphereCards);
        if (data.domeCards) setDomeCards(data.domeCards);
        if (data.trialCards) setTrialCards(data.trialCards);
        if (data.relationshipCards) setRelationshipCards(data.relationshipCards);`
);

fs.writeFileSync('App.tsx', app);
console.log("Patched App.tsx to set all cards from Firebase.");
