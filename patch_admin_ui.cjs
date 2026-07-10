const fs = require('fs');
let admin = fs.readFileSync('components/Admin.tsx', 'utf8');

const s7FormGroup = `
                {/* =================================================================================
                 * SCREEN 7: CARDS
                 * ================================================================================= */}
                {currentScreen.id === 7 && (
                  <CardListFormGroup 
                    title="流程式向左滑动的里程碑控制台 (Screen 7 Marquee Cards)" 
                    cards={screen7Cards} 
                    saveCards={(newCards) => {
                      if (typeof newCards === 'function') {
                         const evaled = newCards(screen7Cards);
                         setScreen7Cards(evaled);
                         saveScreen7Cards(evaled);
                      } else {
                         setScreen7Cards(newCards);
                         saveScreen7Cards(newCards);
                      }
                    }} 
                    selectedId={selectedTrialCardId} 
                    setSelectedId={setSelectedTrialCardId} 
                  />
                )}
`;

admin = admin.replace(/\{\/\* =================================================================================\s*\* SCREEN 6/, s7FormGroup + '\n                {/* =================================================================================\n                 * SCREEN 6');

fs.writeFileSync('components/Admin.tsx', admin);
console.log('patched admin form');
