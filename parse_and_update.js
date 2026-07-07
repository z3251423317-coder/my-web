const fs = require('fs');

const userDataStr = fs.readFileSync('user_data.json', 'utf8');
const userData = JSON.parse(userDataStr);

let appTsx = fs.readFileSync('App.tsx', 'utf8');

// 1. Update DEFAULT_SCREENS
const screensJson = JSON.stringify(userData.screens, null, 2).replace(/"([^"]+)":/g, '$1:');
appTsx = appTsx.replace(
  /const DEFAULT_SCREENS: ScreenData\[\] = \[\s*\{[\s\S]*?\n\];/,
  `const DEFAULT_SCREENS: ScreenData[] = ${screensJson};`
);

// 2. Update pillNavItems default
const pillNavItemsJson = JSON.stringify(userData.pillNavItems, null, 6).replace(/"([^"]+)":/g, '$1:').trim();
appTsx = appTsx.replace(
  /return \[\s*\{\s*label:\s*"[^"]*",\s*href:\s*"[^"]*"\s*\}[\s\S]*?\];/m,
  `return ${pillNavItemsJson};`
);

// We'll write it back to App.tsx
fs.writeFileSync('App.tsx', appTsx);

// Update cardData.ts
let cardDataTs = fs.readFileSync('src/cardData.ts', 'utf8');

const marqueeCardsJson = JSON.stringify(userData.marqueeCards, null, 2).replace(/"([^"]+)":/g, '$1:');
cardDataTs = cardDataTs.replace(
  /export const DEFAULT_MARQUEE_CARDS: MarqueeCard\[\] = \[\s*\{[\s\S]*?\n\];/,
  `export const DEFAULT_MARQUEE_CARDS: MarqueeCard[] = ${marqueeCardsJson};`
);

const sphereCardsJson = JSON.stringify(userData.sphereCards, null, 2).replace(/"([^"]+)":/g, '$1:');
cardDataTs = cardDataTs.replace(
  /export const DEFAULT_QUANTUM_CARDS: MarqueeCard\[\] = \[\s*\{[\s\S]*?\n\];/,
  `export const DEFAULT_QUANTUM_CARDS: MarqueeCard[] = ${sphereCardsJson};`
);

fs.writeFileSync('src/cardData.ts', cardDataTs);

console.log("Updated App.tsx and src/cardData.ts");
