const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

// I will just replace the screen3TabsBg div line completely
const regex3 = /<div className="flex items-center gap-2 md:gap-3 p-1\.5 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth flex-nowrap" style=\{\{ backgroundColor: screen3TabsBg \}\}>/g;
code = code.replace(regex3, '<div className="flex items-center gap-2 md:gap-3 p-1.5 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth flex-nowrap" style={{ backgroundColor: screen3TabsBg }}>\n');

const regex7 = /<div className="flex items-center gap-2 md:gap-3 p-1\.5 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth flex-nowrap" style=\{\{ backgroundColor: screen7TabsBg \}\}>/g;
code = code.replace(regex7, '<div className="flex items-center gap-2 md:gap-3 p-1.5 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth flex-nowrap" style={{ backgroundColor: screen7TabsBg }}>\n');

// Let's check what other syntax errors exist in App.tsx
// App.tsx(3806,18): error TS1381: Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
// Let's see if we messed up anything else.
// I only touched screen3TabsBg and screen7TabsBg in App.tsx! Why are there errors on 3806?
// Wait, my replacement for screen 7 was:
/*
appCode = appCode.replace(
  /\{s\.id === 7 && screen7Tabs && screen7Tabs\.length > 0 && \(\s*<div className="w-full flex justify-center py-2 px-4 select-none pointer-events-auto mb-2">\s*<div className="flex items-center gap-2 md:gap-3 bg-transparent p-1\.5 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth( flex-nowrap)?">/g,
  `{s.id === 7 && screen7Tabs && screen7Tabs.length > 0 && (
                      <div className="w-full flex justify-center py-2 px-4 select-none pointer-events-auto mb-2">
                        <div className="flex items-center gap-2 md:gap-3 p-1.5 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth flex-nowrap" style={{ backgroundColor: screen7TabsBg }}>`
);
*/
// Did I replace TOO MUCH? 
fs.writeFileSync('App.tsx', code);
