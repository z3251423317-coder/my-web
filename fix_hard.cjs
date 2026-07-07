const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

const lines = app.split('\n');
const startIdx = lines.findIndex(l => l.includes('const [dbConnected, setDbConnected] = useState<boolean | null>(null);'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('clearInterval(interval);'));

// Find where the next block starts (after return () => ...)
let endBlockIdx = endIdx;
while (endBlockIdx < lines.length && !lines[endBlockIdx].includes('}, []);')) {
  endBlockIdx++;
}

lines.splice(startIdx, endBlockIdx - startIdx + 1, 
`  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  useEffect(() => {
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
    const interval = setInterval(loadConfig, 10000); // Poll every 10 seconds for updates
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);`
);

fs.writeFileSync('App.tsx', lines.join('\n'));
console.log("Fixed lines");
