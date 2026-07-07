const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

// Replace useEffect for Firebase with fetch
const newEffect = `
  useEffect(() => {
    let isMounted = true;
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          if (data.screens) setScreens(data.screens);
          if (data.pillNavItems) setPillNavItems(data.pillNavItems);
          if (data.marqueeCards) setMarqueeCards(data.marqueeCards);
          if (data.sphereCards) setSphereCards(data.sphereCards);
          if (data.domeCards) setDomeCards(data.domeCards);
          if (data.trialCards) setTrialCards(data.trialCards);
          if (data.relationshipCards) setRelationshipCards(data.relationshipCards);
        }
      } catch (err) {
        console.error("Failed to load config via proxy", err);
      } finally {
        if (isMounted) setConfigLoaded(true);
      }
    };
    
    loadConfig();
    const interval = setInterval(loadConfig, 10000); // Poll every 10 seconds for updates
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);
`;

app = app.replace(
  /useEffect\(\(\) => \{\s*const unsub = onSnapshot\(doc\(db, 'app_config', 'master'\),[\s\S]*?return \(\) => unsub\(\);\s*\}, \[\]\);/,
  newEffect
);

fs.writeFileSync('App.tsx', app);
console.log("Patched App.tsx");
