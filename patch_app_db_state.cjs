const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

const newEffect = `
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

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
`;

app = app.replace(
  /useEffect\(\(\) => \{\s*let isMounted = true;\s*const loadConfig = async \(\) => \{\s*try \{\s*const res = await fetch\('\/api\/config'\);\s*if \(res\.ok\) \{\s*const data = await res\.json\(\);\s*if \(!isMounted\) return;\s*if \(data\.screens\)/,
  newEffect
);

fs.writeFileSync('App.tsx', app);
console.log("Patched App.tsx db state");
