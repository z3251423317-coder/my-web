const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

const stateCode = `  const [configLoaded, setConfigLoaded] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [dbErrorMsg, setDbErrorMsg] = useState<string>("");
  const [isRetryingDb, setIsRetryingDb] = useState<boolean>(false);
  const [showDbDiagnostics, setShowDbDiagnostics] = useState<boolean>(false);

  const loadConfigRef = useRef<() => Promise<void>>();

  useEffect(() => {
    let isMounted = true;
    const load = async (manual = false) => {
      if (manual && isMounted) setIsRetryingDb(true);
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          setDbConnected(true);
          setDbErrorMsg("");
          if (data.screens) setScreens(data.screens);
          if (data.pillNavItems) setPillNavItems(data.pillNavItems);
          if (data.marqueeCards) setMarqueeCards(data.marqueeCards);
          if (data.sphereCards) setSphereCards(data.sphereCards);
          if (data.domeCards) setDomeCards(data.domeCards);
          if (data.trialCards) setTrialCards(data.trialCards);
          if (data.relationshipCards) setRelationshipCards(data.relationshipCards);
        } else {
          if (isMounted) {
            setDbConnected(false);
            setDbErrorMsg(\`HTTP \${res.status} \${res.statusText}\`);
          }
        }
      } catch (err) {
        console.error("Failed to load config via proxy", err);
        if (isMounted) {
          setDbConnected(false);
          setDbErrorMsg(err.message || String(err));
        }
      } finally {
        if (isMounted) {
          setConfigLoaded(true);
          setIsRetryingDb(false);
        }
      }
    };

    loadConfigRef.current = () => load(true);

    load();
    const interval = setInterval(() => load(), 10000); // Poll every 10 seconds for updates
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);`;

// Replace from const [configLoaded, setConfigLoaded] = useState(false); down to the end of the useEffect block
const targetPattern = /const \[configLoaded, setConfigLoaded\] = useState\(false\);\s*const \[dbConnected, setDbConnected\] = useState<boolean \| null>\(null\);\s*useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/;

if (targetPattern.test(app)) {
  app = app.replace(targetPattern, stateCode);
  console.log("Regex replacement succeeded");
} else {
  // Try substring replacement if regex fails
  const searchStr = `  const [configLoaded, setConfigLoaded] = useState(false);

  
  
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
    loadConfig();
    const interval = setInterval(loadConfig, 10000); // Poll every 10 seconds for updates
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);`;
  
  const startIdx = app.indexOf("const [configLoaded, setConfigLoaded]");
  const endIdx = app.indexOf("}, []);", startIdx);
  if (startIdx !== -1 && endIdx !== -1) {
    app = app.substring(0, startIdx) + stateCode + app.substring(endIdx + 7);
    console.log("Substring replacement succeeded");
  } else {
    console.log("Search string not found!");
  }
}

fs.writeFileSync('App.tsx', app);
