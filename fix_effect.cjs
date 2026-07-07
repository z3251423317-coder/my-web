const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

const regex = /useEffect\(\(\) => \{\s*let isMounted = true;[\s\S]*?return \(\) => \{\s*isMounted = false;\s*clearInterval\(interval\);\s*\};\s*\}, \[\]\);/g;

const correctEffect = `useEffect(() => {
    let isMounted = true;
    const loadConfig = async () => {
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
    loadConfig();
    const interval = setInterval(loadConfig, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);`;

app = app.replace(regex, correctEffect);

// Wait, the regex might not match because the previous block has an extra "};" or something. Let's just substring replace.
