const fs = require('fs');

let adminCode = fs.readFileSync('components/Admin.tsx', 'utf-8');

if (!adminCode.includes('TopologyCanvas')) {
  adminCode = adminCode.replace("import { Trash2 } from 'lucide-react';", "import { Trash2 } from 'lucide-react';\nimport TopologyCanvas from './TopologyCanvas';");
  if (!adminCode.includes('./TopologyCanvas')) {
    adminCode = adminCode.replace("import { Download, Upload } from 'lucide-react';", "import { Download, Upload } from 'lucide-react';\nimport TopologyCanvas from './TopologyCanvas';");
  }
}

// Find a good place to inject the Canvas in Tab 8.
// There is a comment /* SECTION: SCREEN TEXTS & CONTENT */.
// Let's add it right after the closing div of the currentScreen wrapper.
const findString = "            </div>\n          )}\n        </div>";
const replaceString = `            </div>
          )}
          {currentScreen && currentScreen.id === 8 && (
            <div className="max-w-4xl space-y-8 mt-8">
              <h3 className="text-[10px] font-mono tracking-widest text-zinc-500 block uppercase font-bold border-b border-zinc-850 pb-2">
                ■ 全屏一体化无限拓扑画布 (Topology Canvas)
              </h3>
              <div className="w-full h-[600px] border border-zinc-700 rounded-xl overflow-hidden bg-zinc-950">
                <TopologyCanvas isAdmin={true} isMobile={false} />
              </div>
            </div>
          )}
        </div>`;

if (!adminCode.includes('TopologyCanvas isAdmin={true}')) {
  // Let's see if we can find the exact place to inject. 
  // Let's just find "    </div>\n    </div>\n  );\n}"
  adminCode = adminCode.replace(
    "        </div>\n      </div>\n    </div>\n  );\n}",
    `          {currentScreen && currentScreen.id === 8 && (
            <div className="max-w-4xl space-y-8 mt-8 pb-12">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
                <Database className="w-5 h-5 text-amber-400" />
                全屏一体化无限拓扑画布 (Topology Canvas)
              </h3>
              <div className="w-full h-[600px] border border-zinc-700 rounded-xl overflow-hidden bg-zinc-950 shadow-2xl relative z-10 pointer-events-auto">
                <TopologyCanvas isAdmin={true} isMobile={false} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`
  );
}

fs.writeFileSync('components/Admin.tsx', adminCode);
console.log('Admin.tsx patched for Screen 8 Canvas.');
