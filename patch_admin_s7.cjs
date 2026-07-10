const fs = require('fs');
let admin = fs.readFileSync('components/Admin.tsx', 'utf8');

// Add state
if (!admin.includes('const [screen7Cards, setScreen7Cards] = useState')) {
  admin = admin.replace(/const \[trialCards, setTrialCards\] = useState<MarqueeCard\[\]>\(\[\]\);/, 
  `const [trialCards, setTrialCards] = useState<MarqueeCard[]>([]);\n  const [screen7Cards, setScreen7Cards] = useState<MarqueeCard[]>([]);`);
}

// Ensure loadConfig fetches screen7Cards
if (!admin.includes('const localScreen7 = localStorage.getItem("alphaqubit_screen7_cards");')) {
  const trialMatch = `const localTrial = localStorage.getItem("alphaqubit_trial_cards");
      if (localTrial) setTrialCards(JSON.parse(localTrial));`;
  admin = admin.replace(trialMatch, trialMatch + `\n      const localScreen7 = localStorage.getItem("alphaqubit_screen7_cards");
      if (localScreen7) setScreen7Cards(JSON.parse(localScreen7));`);
}

// Ensure activeCards points to screen7Cards for screen 7
const activeCardsRegex = /const activeCards = currentScreen\.id === 3 \? marqueeCards\n\s*: currentScreen\.id === 4 \? sphereCards\n\s*: currentScreen\.id === 5 \? domeCards\n\s*: currentScreen\.id === 6 \? trialCards\n\s*: \[\];/;
admin = admin.replace(activeCardsRegex, `const activeCards = currentScreen.id === 3 ? marqueeCards
                    : currentScreen.id === 4 ? sphereCards
                    : currentScreen.id === 5 ? domeCards
                    : currentScreen.id === 6 ? trialCards
                    : currentScreen.id === 7 ? screen7Cards
                    : [];`);

// Ensure save functions
if (!admin.includes('const saveScreen7Cards = (updated: MarqueeCard[])')) {
  const saveTrial = `const saveTrialCards = (updated: MarqueeCard[]) => {
    setTrialCards(updated);
    localStorage.setItem("alphaqubit_trial_cards", JSON.stringify(updated));
  };`;
  admin = admin.replace(saveTrial, saveTrial + `\n  const saveScreen7Cards = (updated: MarqueeCard[]) => {
    setScreen7Cards(updated);
    localStorage.setItem("alphaqubit_screen7_cards", JSON.stringify(updated));
    import('../firebase-config').then(({ db }) => {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        setDoc(doc(db, 'system_config', 'screen7Cards'), { data: updated }).catch(console.error);
      });
    });
  };`);
}

// Ensure add card
const addTrial = /else if \(currentScreen\.id === 6\) \{\s*saveTrialCards\(\[\.\.\.trialCards, newCard\]\);\s*\}/;
admin = admin.replace(addTrial, `else if (currentScreen.id === 6) {
        saveTrialCards([...trialCards, newCard]);
      } else if (currentScreen.id === 7) {
        saveScreen7Cards([...screen7Cards, newCard]);
      }`);
      
// Ensure remove card
const delTrial = /else if \(currentScreen\.id === 6\) \{\s*saveTrialCards\(trialCards\.filter\(c => c\.id !== id\)\);\s*\}/;
admin = admin.replace(delTrial, `else if (currentScreen.id === 6) {
        saveTrialCards(trialCards.filter(c => c.id !== id));
      } else if (currentScreen.id === 7) {
        saveScreen7Cards(screen7Cards.filter(c => c.id !== id));
      }`);

// Ensure update card
const upTrial = /else if \(currentScreen\.id === 6\) \{\s*saveTrialCards\(trialCards\.map\(c => c\.id === id \? \{ \.\.\.c, \.\.\.fields \} \: c\)\);\s*\}/;
admin = admin.replace(upTrial, `else if (currentScreen.id === 6) {
      saveTrialCards(trialCards.map(c => c.id === id ? { ...c, ...fields } : c));
    } else if (currentScreen.id === 7) {
      saveScreen7Cards(screen7Cards.map(c => c.id === id ? { ...c, ...fields } : c));
    }`);

// Ensure UI for isLit toggle
const formUI = `<div className="space-y-0.5">
                                  <span className="text-[9px] text-zinc-500 font-bold block">加密密码:</span>`;
const newFormUI = `<div className="space-y-0.5 flex items-center justify-between">
                                  <span className="text-[9px] text-zinc-500 font-bold block">点亮状态 (Screen 7 Only):</span>
                                  <input 
                                    type="checkbox" 
                                    checked={activeCard.isLit || false}
                                    onChange={(e) => updateCardField(activeCard.id, 'isLit', e.target.checked)}
                                    className="cursor-pointer"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[9px] text-zinc-500 font-bold block">加密密码:</span>`;
admin = admin.replace(formUI, newFormUI);

fs.writeFileSync('components/Admin.tsx', admin);
console.log('patched admin');
