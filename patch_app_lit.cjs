const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

// App.tsx line 2969:
// className={`w-[270px] shrink-0 p-5 rounded-2xl glassmorphism-card hover:-translate-y-1.5 hover:scale-[1.01] flex flex-col justify-between text-left group/card cursor-pointer ${colorStyle} ${card.isLit ? 'shadow-[0_0_20px_rgba(251,191,36,0.3)] border-amber-500/50' : ''}`}

app = app.replace(
  /const \{ style: colorStyle, icon: CardIcon \} = getCardColorAndIcon\(card\.colorType\);/,
  `const isCardGray = s.id === 7 && !card.isLit;
                                  const { style: colorStyle, icon: CardIcon } = getCardColorAndIcon(isCardGray ? 'gray' : card.colorType);`
);

app = app.replace(
  / className=\{\`w-\[270px\] shrink-0 p-5 rounded-2xl glassmorphism-card hover:-translate-y-1\.5 hover:scale-\[1\.01\] flex flex-col justify-between text-left group\/card cursor-pointer \$\{colorStyle\} \$\{card\.isLit \? 'shadow-\[0_0_20px_rgba\(251,191,36,0\.3\)\] border-amber-500\/50' : ''\}\`\}/,
  ` className={\`w-[270px] shrink-0 p-5 rounded-2xl glassmorphism-card hover:-translate-y-1.5 hover:scale-[1.01] flex flex-col justify-between text-left group/card cursor-pointer \${colorStyle} \${card.isLit && !isCardGray ? 'shadow-[0_0_20px_rgba(251,191,36,0.3)] border-amber-500/50' : ''} \${isCardGray ? 'opacity-70 grayscale' : ''}\`}`
);

fs.writeFileSync('App.tsx', app);
console.log('patched app lit');
