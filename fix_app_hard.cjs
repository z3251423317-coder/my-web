const fs = require('fs');

let app = fs.readFileSync('App.tsx', 'utf-8');

// The block for screen 3 tabs:
const s3start = app.indexOf('{s.id === 3 && screen3Tabs && screen3Tabs.length > 0 && (');
if (s3start !== -1) {
    const s3end = app.indexOf(')}', s3start) + 2;
    // Let's replace the whole block
    const correctS3 = `{s.id === 3 && screen3Tabs && screen3Tabs.length > 0 && (
                      <div className="w-full flex justify-center py-2 px-4 select-none pointer-events-auto mb-2">
                        <div className="flex items-center gap-2 md:gap-3 p-1.5 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth flex-nowrap" style={{ backgroundColor: screen3TabsBg }}>
                          {/* 全部 Button */}
                          <button
                            type="button"
                            onClick={() => setActiveScreen3Tab("全部")}
                            className={\`px-4 py-1.5 rounded-full text-xs font-sans tracking-wide transition-all duration-300 \${
                              activeScreen3Tab === "全部"
                                ? "bg-amber-500 text-zinc-950 font-extrabold shadow-lg shadow-amber-500/35 scale-[1.02]"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
                            }\`}
                          >
                            全部
                          </button>
                          
                          {/* Custom Tab Buttons */}
                          {screen3Tabs.map((tab, tIdx) => (
                            <button
                              key={tIdx}
                              type="button"
                              onClick={() => setActiveScreen3Tab(tab)}
                              className={\`px-4 py-1.5 rounded-full text-xs font-sans tracking-wide whitespace-nowrap transition-all duration-300 \${
                                activeScreen3Tab === tab
                                  ? "bg-amber-500 text-zinc-950 font-extrabold shadow-lg shadow-amber-500/35 scale-[1.02]"
                                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
                              }\`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}`;
    app = app.substring(0, s3start) + correctS3 + app.substring(s3end);
}

// The block for screen 7 tabs:
const s7start = app.indexOf('{s.id === 7 && screen7Tabs && screen7Tabs.length > 0 && (');
if (s7start !== -1) {
    const s7end = app.indexOf(')}', s7start) + 2;
    const correctS7 = `{s.id === 7 && screen7Tabs && screen7Tabs.length > 0 && (
                      <div className="w-full flex justify-center py-2 px-4 select-none pointer-events-auto mb-2">
                        <div className="flex items-center gap-2 md:gap-3 p-1.5 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth flex-nowrap" style={{ backgroundColor: screen7TabsBg }}>
                          {/* 全部 Button */}
                          <button
                            type="button"
                            onClick={() => setActiveScreen7Tab("全部")}
                            className={\`px-4 py-1.5 rounded-full text-xs font-sans tracking-wide transition-all duration-300 \${
                              activeScreen7Tab === "全部"
                                ? "bg-amber-500 text-zinc-950 font-extrabold shadow-lg shadow-amber-500/35 scale-[1.02]"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
                            }\`}
                          >
                            全部
                          </button>
                          
                          {/* Custom Tab Buttons */}
                          {screen7Tabs.map((tab, tIdx) => (
                            <button
                              key={tIdx}
                              type="button"
                              onClick={() => setActiveScreen7Tab(tab)}
                              className={\`px-4 py-1.5 rounded-full text-xs font-sans tracking-wide whitespace-nowrap transition-all duration-300 \${
                                activeScreen7Tab === tab
                                  ? "bg-amber-500 text-zinc-950 font-extrabold shadow-lg shadow-amber-500/35 scale-[1.02]"
                                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
                              }\`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}`;
    app = app.substring(0, s7start) + correctS7 + app.substring(s7end);
}

fs.writeFileSync('App.tsx', app);
