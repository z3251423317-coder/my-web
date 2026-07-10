const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

// Add import
if (!app.includes('DEFAULT_SCREEN7_CARDS')) {
  app = app.replace('DEFAULT_DOME_CARDS', 'DEFAULT_DOME_CARDS, DEFAULT_SCREEN7_CARDS');
}

// Add state
if (!app.includes('const [screen7Cards, setScreen7Cards]')) {
  const trialCardsStateRegex = /const \[trialCards\, setTrialCards\].*?\}\)\;/s;
  const trialCardsMatch = app.match(trialCardsStateRegex);
  if (trialCardsMatch) {
    const screen7State = `
  const [screen7Cards, setScreen7Cards] = useState<MarqueeCard[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("alphaqubit_screen7_cards");
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error("Failed to parse saved screen 7 cards", e);
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_SCREEN7_CARDS));
  });

  const saveScreen7Cards = (updated: MarqueeCard[]) => {
    setScreen7Cards(updated);
    localStorage.setItem("alphaqubit_screen7_cards", JSON.stringify(updated));
    
    // Also save to firebase if possible
    if (db && typeof window !== 'undefined') {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        setDoc(doc(db, 'system_config', 'screen7Cards'), { data: updated }).catch(console.error);
      });
    }
  };
`;
    app = app.replace(trialCardsMatch[0], trialCardsMatch[0] + '\n' + screen7State);
  }
}

// Ensure effects listen to it
app = app.replace(/trialCards\, marqueeCards\, sphereCards\, domeCards\, restored\]\)\;/g, 'trialCards, marqueeCards, sphereCards, domeCards, screen7Cards, restored]);');

// Listen to firebase snapshot
if (!app.includes('doc(db, "system_config", "screen7Cards")')) {
  const unsubRegex = /const unsubDome = onSnapshot\(doc\(db, "system_config", "domeCards"\).*?\}\)\;/s;
  const unsubMatch = app.match(unsubRegex);
  if (unsubMatch) {
    const s7Unsub = `
        const unsubS7 = onSnapshot(doc(db, "system_config", "screen7Cards"), (doc) => {
          if (doc.exists() && doc.data().data) {
            setScreen7Cards(doc.data().data);
            localStorage.setItem("alphaqubit_screen7_cards", JSON.stringify(doc.data().data));
          }
        });
`;
    app = app.replace(unsubMatch[0], unsubMatch[0] + s7Unsub);
    app = app.replace(/unsubDome\(\)\;/g, 'unsubDome();\n          unsubS7();');
  }
}

// Modify Screen 7 UI
const s7UiRegex = /\{\/\* Screen 7\: Dynamic Operations.*?\{s\.id === 7 && \((.*?)\)\}/s;
// We actually need to replace everything in screen 7. 
// It currently has two blocks `s.id === 7 && (...)`. One for the buttons, one for the detailed view.
// We will replace both blocks or rewrite them.

fs.writeFileSync('App.tsx', app);
console.log('patched App.tsx part 1');
