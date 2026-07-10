const fs = require('fs');
let admin = fs.readFileSync('components/Admin.tsx', 'utf8');

admin = admin.replace(
  /\{\[7, 8, 9\]\.includes\(currentScreen\.id\) && \(/,
  `{currentScreen.id === 7 && (
                  <CardListFormGroup 
                    title="流程式向左滑动的里程碑控制台 (Screen 7 Marquee Cards)" 
                    cards={screen7Cards} 
                    saveCards={setScreen7Cards} 
                    selectedId={selectedTrialCardId} 
                    setSelectedId={setSelectedTrialCardId} 
                    enableSubCards={false}
                  />
                )}
                
                {[8, 9].includes(currentScreen.id) && (`
);

fs.writeFileSync('components/Admin.tsx', admin);
console.log('patched admin screen 7');
