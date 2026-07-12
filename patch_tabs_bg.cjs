const fs = require('fs');

// Patch App.tsx
let appCode = fs.readFileSync('App.tsx', 'utf-8');

const appStateCode = `  const [screen3TabsBg, setScreen3TabsBg] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem("alphaqubit_screen3_tabs_bg") || "transparent";
    return "transparent";
  });
  const [screen7TabsBg, setScreen7TabsBg] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem("alphaqubit_screen7_tabs_bg") || "transparent";
    return "transparent";
  });
`;

appCode = appCode.replace(/(const \[activeScreen3Tab, setActiveScreen3Tab\] = useState<string>\("全部"\);)/, `$1\n${appStateCode}`);

// Handle config updates from Admin (inside importConfig in App.tsx)
appCode = appCode.replace(/(if \(data\.screen3Tabs\) \{)/, `if (data.screen3TabsBg) {
              setScreen3TabsBg(data.screen3TabsBg);
              localStorage.setItem("alphaqubit_screen3_tabs_bg", data.screen3TabsBg);
            }
            if (data.screen7TabsBg) {
              setScreen7TabsBg(data.screen7TabsBg);
              localStorage.setItem("alphaqubit_screen7_tabs_bg", data.screen7TabsBg);
            }
            $1`);

appCode = appCode.replace(/(if \(fallback\.screen3Tabs\) \{)/, `if (fallback.screen3TabsBg) {
            setScreen3TabsBg(fallback.screen3TabsBg);
            localStorage.setItem("alphaqubit_screen3_tabs_bg", fallback.screen3TabsBg);
          }
          if (fallback.screen7TabsBg) {
            setScreen7TabsBg(fallback.screen7TabsBg);
            localStorage.setItem("alphaqubit_screen7_tabs_bg", fallback.screen7TabsBg);
          }
          $1`);

// Inject into style of the tabs wrapper
// Screen 3:
appCode = appCode.replace(
  /<div className="flex items-center gap-2 md:gap-3 bg-transparent p-1\.5 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth flex-nowrap"/g,
  '<div className="flex items-center gap-2 md:gap-3 p-1.5 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth flex-nowrap" style={{ backgroundColor: screen3TabsBg }}'
);
appCode = appCode.replace(
  /<div className="flex items-center gap-2 md:gap-3 bg-transparent p-1\.5 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth">/g, // if flex-nowrap not there
  '<div className="flex items-center gap-2 md:gap-3 p-1.5 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth flex-nowrap" style={{ backgroundColor: screen3TabsBg }}'
);
// Screen 7:
appCode = appCode.replace(
  /\{s\.id === 7 && screen7Tabs && screen7Tabs\.length > 0 && \(\s*<div className="w-full flex justify-center py-2 px-4 select-none pointer-events-auto mb-2">\s*<div className="flex items-center gap-2 md:gap-3 bg-transparent p-1\.5 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth( flex-nowrap)?">/g,
  `{s.id === 7 && screen7Tabs && screen7Tabs.length > 0 && (
                      <div className="w-full flex justify-center py-2 px-4 select-none pointer-events-auto mb-2">
                        <div className="flex items-center gap-2 md:gap-3 p-1.5 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth flex-nowrap" style={{ backgroundColor: screen7TabsBg }}>`
);

fs.writeFileSync('App.tsx', appCode);

// Patch Admin.tsx
let adminCode = fs.readFileSync('components/Admin.tsx', 'utf-8');

const adminStateCode = `  const [screen3TabsBg, setScreen3TabsBg] = useState<string>("transparent");
  const [screen7TabsBg, setScreen7TabsBg] = useState<string>("transparent");
`;
adminCode = adminCode.replace(/(const \[activeScreen3CardId, setActiveScreen3CardId\] = useState<number \| null>\(null\);)/, `$1\n${adminStateCode}`);

adminCode = adminCode.replace(/(if \(Array\.isArray\(data\.screen7Tabs\)\) setScreen7Tabs\(data\.screen7Tabs\);)/, `$1\n    if (data.screen3TabsBg) setScreen3TabsBg(data.screen3TabsBg);\n    if (data.screen7TabsBg) setScreen7TabsBg(data.screen7TabsBg);`);

adminCode = adminCode.replace(/(screen3Tabs)/, `screen3Tabs, screen3TabsBg, screen7TabsBg`);

// Insert color picker UI in Admin for screen 3 and screen 7
const screen3UI = `                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-zinc-950/40 rounded-xl border border-zinc-850 mt-3">
                        <span className="text-xs text-zinc-400 font-bold">标签容器背景色 (Tab Bg Color)</span>
                        <input type="color" value={screen3TabsBg === 'transparent' ? '#000000' : screen3TabsBg} onChange={(e) => setScreen3TabsBg(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                      </div>
                      
                      <p className="text-\\[11px\\]`;

adminCode = adminCode.replace(/                      <\/div>\s*<p className="text-\[11px\]/, screen3UI);

const screen7UI = `                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-zinc-950/40 rounded-xl border border-zinc-850 mt-3">
                        <span className="text-xs text-zinc-400 font-bold">标签容器背景色 (Tab Bg Color)</span>
                        <input type="color" value={screen7TabsBg === 'transparent' ? '#000000' : screen7TabsBg} onChange={(e) => setScreen7TabsBg(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                      </div>
                      
                      <p className="text-\\[11px\\]`;

adminCode = adminCode.replace(/                      <\/div>\s*<p className="text-\[11px\]/, screen7UI); // Only matches first occurence?
// Wait, to be safe, I will replace the exact text in Admin for Screen 7

fs.writeFileSync('components/Admin.tsx', adminCode);
