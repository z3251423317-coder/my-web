const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

app = app.replace(
  /const loadConfig = async \(\) => \{[\s\S]*?if \(isMounted\) setConfigLoaded\(true\);\s*\}\s*\};\s*/,
  `const loadConfig = async () => {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          setDbConnected(true);
          if (data.screens) setScreens(data.screens);
          if (data.pillNavItems) setPillNavItems(data.pillNavItems);
          if (data.marqueeCards) setMarqueeCards(data.marqueeCards);
          if (data.sphereCards) setSphereCards(data.sphereCards);
          if (data.domeCards) setDomeCards(data.domeCards);
          if (data.trialCards) setTrialCards(data.trialCards);
          if (data.relationshipCards) setRelationshipCards(data.relationshipCards);
        } else {
          if (isMounted) setDbConnected(false);
        }
      } catch (err) {
        console.error("Failed to load config via proxy", err);
        if (isMounted) setDbConnected(false);
      } finally {
        if (isMounted) setConfigLoaded(true);
      }
    };
    `
);

fs.writeFileSync('App.tsx', app);
console.log("Fixed loadConfig");
