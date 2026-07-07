const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

app = app.replace(
  /className="absolute bottom-6 left-6 z-\[9999\] px-4 py-2 bg-zinc-800\/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-full text-sm backdrop-blur shadow-lg border border-zinc-700\/50 transition-all font-medium pointer-events-auto"/,
  `className="hidden lg:flex absolute bottom-6 left-6 z-[9999] px-4 py-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-full text-sm backdrop-blur shadow-lg border border-zinc-700/50 transition-all font-medium pointer-events-auto items-center justify-center"`
);

fs.writeFileSync('App.tsx', app);
console.log("Fixed Admin button visibility");
