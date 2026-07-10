const fs = require('fs');

// 1. Update src/cardData.ts
let cardData = fs.readFileSync('src/cardData.ts', 'utf8');
if (!cardData.includes('isLit?: boolean;')) {
  cardData = cardData.replace(/password\?\: string;/, "password?: string;\n  isLit?: boolean;");
}
if (!cardData.includes('DEFAULT_SCREEN7_CARDS')) {
  cardData += `\nexport const DEFAULT_SCREEN7_CARDS: MarqueeCard[] = [\n  {\n    "id": 1,\n    "title": "Roadmap Card 1",\n    "cat": "PHASE 1",\n    "desc": "Description here.",\n    "url": "",\n    "colorType": "indigo",\n    "isLit": true\n  }\n];\n`;
}
fs.writeFileSync('src/cardData.ts', cardData);
console.log('patched cardData.ts');

