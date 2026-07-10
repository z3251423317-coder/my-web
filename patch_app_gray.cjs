const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

app = app.replace(
  /case "fuchsia": return \{ style: "border-fuchsia-500\/30 text-fuchsia-400 bg-fuchsia-500\/10 hover:border-fuchsia-400\/50 hover:shadow-fuchsia-500\/10", glow: "from-fuchsia-500\/25 to-transparent", icon: Monitor \};/,
  'case "fuchsia": return { style: "border-fuchsia-500/30 text-fuchsia-400 bg-fuchsia-500/10 hover:border-fuchsia-400/50 hover:shadow-fuchsia-500/10", glow: "from-fuchsia-500/25 to-transparent", icon: Monitor };\n    case "gray": return { style: "border-zinc-500/30 text-zinc-400 bg-zinc-800/50 hover:border-zinc-400/50 hover:shadow-zinc-500/10", glow: "from-zinc-500/25 to-transparent", icon: LayoutGrid };'
);

fs.writeFileSync('App.tsx', app);
console.log('patched app gray');
