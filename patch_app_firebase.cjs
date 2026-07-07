const fs = require('fs');

let app = fs.readFileSync('App.tsx', 'utf8');

// Ensure firebase imports exist
if (!app.includes("import { db } from './firebase';")) {
  app = `import { db } from './firebase';\nimport { doc, onSnapshot } from 'firebase/firestore';\n` + app;
}

// Replace the existing useEffect for /api/config
app = app.replace(
  /useEffect\(\(\) => \{\n\s*fetch\('\/api\/config'\)[\s\S]*?\}\, \[\]\);/g,
  `useEffect(() => {
    const unsub = onSnapshot(doc(db, 'app_config', 'master'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.screens) setScreens(data.screens);
        if (data.pillNavItems) setPillNavItems(data.pillNavItems);
      }
      setConfigLoaded(true);
    }, (err) => {
      console.error("Failed to load config from Firebase", err);
      setConfigLoaded(true);
    });
    return () => unsub();
  }, []);`
);

fs.writeFileSync('App.tsx', app);
console.log("Patched App.tsx to use Firebase.");
