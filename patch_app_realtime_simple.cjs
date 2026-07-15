const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

const target = 'useEffect(() => {\n    let isMounted = true;\n    let unsubFirestore: (() => void) | null = null;';

if (code.includes(target)) {
  code = code.replace(target, `useEffect(() => {\n    let isMounted = true;\n    let unsubFirestore: (() => void) | null = null;\n\n    unsubFirestore = onSnapshot(doc(db, "app_config", "master"), (docSnap) => {\n      if (docSnap.exists() && isMounted) {\n        // Realtime update hook: we just reload from API or use data directly.\n        // Simpler: just call load() again!\n        load(false);\n      }\n    });`);
  fs.writeFileSync('App.tsx', code);
  console.log("App.tsx patched for realtime simply");
}
