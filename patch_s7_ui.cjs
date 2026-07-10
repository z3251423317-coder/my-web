const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf8');

// 1. Add modal state for enlarged card
if (!app.includes('const [enlargedCard, setEnlargedCard]')) {
  const activeConsoleRegex = /const \[activeConsoleScreenId, setActiveConsoleScreenId\] = useState<number \| null>\(null\)\;/;
  app = app.replace(activeConsoleRegex, `const [activeConsoleScreenId, setActiveConsoleScreenId] = useState<number | null>(null);\n  const [enlargedCard, setEnlargedCard] = useState<MarqueeCard | null>(null);`);
}

// 2. We need to handle screen 7 layout. Let's find `s.id === 3 ? (` and change it to handle screen 7 as well or create a separate block.
// It's probably safer to create a separate block for screen 7.
// The structure is: 
// {s.id === 3 ? (
//    ...
// ) : s.id === 7 ? (
//    <div className="relative w-full py-12 flex flex-col justify-between h-auto min-h-[500px]">
//        ... screen 7 marquee layout ...
//    </div>
// ) : (
//    <div className="grid lg:grid-cols-12 ...
// )}

app = app.replace(/\{s\.id === 3 \? \(/, `{s.id === 3 ? (`);

fs.writeFileSync('App.tsx', app);
