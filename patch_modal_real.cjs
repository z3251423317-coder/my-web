const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

const modalCode = `
      {/* Enlarged Card Modal for Screen 7 */}
      <AnimatePresence>
      {enlargedCard && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/80 pointer-events-auto" onClick={() => setEnlargedCard(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-2xl"
          >
            <button onClick={() => setEnlargedCard(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer z-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="mb-6 relative z-10">
              <span className="text-amber-500 font-mono text-xs tracking-widest block mb-2">{enlargedCard.cat}</span>
              <h2 className="text-3xl font-display font-bold text-white">{enlargedCard.title}</h2>
            </div>
            <p className="text-zinc-300 text-lg leading-relaxed relative z-10">{enlargedCard.desc}</p>
            {enlargedCard.isLit && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />
            )}
          </motion.div>
        </div>
      )}
      </AnimatePresence>
`;

app = app.replace(/\{\/\* Global Master Config Modal/, modalCode + '\n      {/* Global Master Config Modal');

fs.writeFileSync('App.tsx', app);
console.log('patched modal real');
