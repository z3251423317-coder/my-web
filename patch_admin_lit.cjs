const fs = require('fs');
let admin = fs.readFileSync('components/Admin.tsx', 'utf8');

const litToggle = `
              {/* Lit Status Toggle Block */}
              <div className="bg-zinc-950/40 p-3 rounded-lg border border-zinc-850 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-bold">✨ 卡片高亮状态 (Highlight Status)</span>
                    <span className="text-[9px] text-zinc-500 block">开关关闭状态下卡片为灰色，打开状态下为彩色高亮</span>
                  </div>
                  <button
                    onClick={() => updateCardField(activeCard.id, 'isLit', !activeCard.isLit)}
                    className={\`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none \${
                      activeCard.isLit ? 'bg-amber-500' : 'bg-zinc-800'
                    }\`}
                  >
                    <span className={\`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform \${
                      activeCard.isLit ? 'translate-x-4' : 'translate-x-1'
                    }\`} />
                  </button>
                </div>
              </div>
`;

admin = admin.replace(
  /\{\/\* Encryption Protection Block \*\/\}/,
  litToggle + '\n              {/* Encryption Protection Block */}'
);

fs.writeFileSync('components/Admin.tsx', admin);
console.log('patched admin lit');
