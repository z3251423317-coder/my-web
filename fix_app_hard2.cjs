const fs = require('fs');

let app = fs.readFileSync('App.tsx', 'utf-8');

// I will just use string replacement on the exact block using regex
// For screen 3:
app = app.replace(
/\{s\.id === 3 && screen3Tabs && screen3Tabs\.length > 0 && \([\s\S]*?\{s\.id === 7/m,
`{s.id === 3 && screen3Tabs && screen3Tabs.length > 0 && (
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
                    )}

                    {/* Category tabs for Screen 7 */}
                    {s.id === 7`
);

// For screen 7:
app = app.replace(
/\{s\.id === 7 && screen7Tabs && screen7Tabs\.length > 0 && \([\s\S]*?\{.*?ScrollMarquee/m,
`{s.id === 7 && screen7Tabs && screen7Tabs.length > 0 && (
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
                    )}

                    {/* Flex track running marquee animation with dragging/touch support. */}
                    <div className="relative w-screen left-1/2 -ml-[50vw] py-8 overflow-hidden select-none my-2 bg-transparent pointer-events-auto">
                      <ScrollMarquee`
);

// Now, what about the syntax errors after line 3806?
// Actually, earlier I did:
// `code = code.replace(regex3, '...');`
// And `regex3` was `/<div ... >/g`
// That only replaced the opening tag, it shouldn't have caused 3806.
// Let's check if the error goes away.
fs.writeFileSync('App.tsx', app);
