const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

// Use screen7Cards in the layout
app = app.replace(/\{s\.id === 3 \? \(/, `{s.id === 3 || s.id === 7 ? (`);

// Replace `marqueeCards` with `(s.id === 7 ? screen7Cards : marqueeCards)` in the marquee loop
app = app.replace(/const repeats = Math\.ceil\(minCardsRequired \/ Math\.max\(1, marqueeCards\.length\)\);/, `const displayCards = s.id === 7 ? screen7Cards : marqueeCards;\n                        const repeats = Math.ceil(minCardsRequired / Math.max(1, displayCards.length));`);
app = app.replace(/const singleGroupCards: typeof marqueeCards = \[\];/, `const singleGroupCards: typeof displayCards = [];`);
app = app.replace(/singleGroupCards\.push\(\.\.\.marqueeCards\);/, `singleGroupCards.push(...displayCards);`);

// Replace onClick handler and class name
const origCardRender = `className={\`w-[270px] shrink-0 p-5 rounded-2xl glassmorphism-card hover:-translate-y-1.5 hover:scale-[1.01] flex flex-col justify-between text-left group/card cursor-pointer \${colorStyle}\`}`;
const newCardRender = `className={\`w-[270px] shrink-0 p-5 rounded-2xl glassmorphism-card hover:-translate-y-1.5 hover:scale-[1.01] flex flex-col justify-between text-left group/card cursor-pointer \${colorStyle} \${card.isLit ? 'shadow-[0_0_20px_rgba(251,191,36,0.3)] border-amber-500/50' : ''}\`}`;
app = app.replace(origCardRender, newCardRender);

app = app.replace(/onClick=\{\(\) => handleCardClick\(card\)\}/, `onClick={() => {
                                      if (s.id === 7) {
                                        setEnlargedCard(card);
                                      } else {
                                        handleCardClick(card);
                                      }
                                    }}`);

// Remove old Screen 7 blocks in the `else` section
app = app.replace(/\{s\.id === 7 && \(\s*<div className="pt-2">\s*<div className="grid.*?<\/div>\s*<\/div>\s*\)\}/s, '');
app = app.replace(/\{s\.id === 7 && \(\s*<div className="w-full max-w-md aspect-\[4\/3\] glassmorphism-card.*?<\/div>\s*\)\}/s, '');
app = app.replace(/\{\/\* Screen 7\: Dynamic Operations.*?\{\/\* Screen 9/s, '{/* Screen 9');
app = app.replace(/\{\/\* Screen 7\: Dynamic selected step.*?\{\/\* Screen 8/s, '{/* Screen 8');

// Add Enlarged Card Modal
const modalCode = `
      {/* Enlarged Card Modal for Screen 7 */}
      {enlargedCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60 pointer-events-auto" onClick={() => setEnlargedCard(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-2xl"
          >
            <button onClick={() => setEnlargedCard(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="mb-6">
              <span className="text-amber-500 font-mono text-xs tracking-widest">{enlargedCard.cat}</span>
              <h2 className="text-3xl font-display font-bold text-white mt-2">{enlargedCard.title}</h2>
            </div>
            <p className="text-zinc-300 text-lg leading-relaxed">{enlargedCard.desc}</p>
          </motion.div>
        </div>
      )}
`;
app = app.replace(/\{\/\* Password Protection Overlay \*\/\}/, modalCode + '\n      {/* Password Protection Overlay */}');

fs.writeFileSync('App.tsx', app);
console.log('patched app ui');
