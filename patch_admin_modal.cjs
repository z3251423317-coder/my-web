const fs = require('fs');
let code = fs.readFileSync('components/Admin.tsx', 'utf-8');

// 1. Add states
const stateCode = `  const [promptState, setPromptState] = useState<{isOpen: boolean, message: string, defaultValue: string, resolve: (val: string | null) => void} | null>(null);
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, message: string, resolve: (val: boolean) => void} | null>(null);

  const customPrompt = (message: string, defaultValue: string): Promise<string | null> => {
    return new Promise((resolve) => {
      setPromptState({ isOpen: true, message, defaultValue, resolve });
    });
  };

  const customConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ isOpen: true, message, resolve });
    });
  };
`;

code = code.replace(/(const \[activeScreen3CardId, setActiveScreen3CardId\] = useState<number \| null>\(null\);)/, `$1\n${stateCode}`);

// 2. Add Modal UI at the bottom, just before the last closing div of Admin
const modalUI = `
      {/* Custom Prompt Modal */}
      {promptState?.isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-[400px] shadow-2xl space-y-4">
            <h3 className="text-white font-bold">{promptState.message}</h3>
            <input 
              id="custom-prompt-input"
              type="text" 
              defaultValue={promptState.defaultValue}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = e.currentTarget.value;
                  setPromptState(null);
                  promptState.resolve(val);
                } else if (e.key === 'Escape') {
                  setPromptState(null);
                  promptState.resolve(null);
                }
              }}
            />
            <div className="flex justify-end gap-3 pt-2">
              <button 
                className="px-4 py-2 text-zinc-400 hover:text-white"
                onClick={() => { setPromptState(null); promptState.resolve(null); }}
              >
                取消
              </button>
              <button 
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl"
                onClick={() => {
                  const val = (document.getElementById('custom-prompt-input') as HTMLInputElement).value;
                  setPromptState(null);
                  promptState.resolve(val);
                }}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirmState?.isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-[400px] shadow-2xl space-y-4">
            <h3 className="text-white font-bold whitespace-pre-wrap">{confirmState.message}</h3>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                className="px-4 py-2 text-zinc-400 hover:text-white"
                onClick={() => { setConfirmState(null); confirmState.resolve(false); }}
              >
                取消
              </button>
              <button 
                className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl"
                onClick={() => { setConfirmState(null); confirmState.resolve(true); }}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(/(<\/_div>|\s*<\/div>\s*)$/, `${modalUI}\n$1`); // replace near end. Let's just find the last </div>
// Actually, let's insert it right before the last </div>
let lastDivIndex = code.lastIndexOf('</div>');
code = code.substring(0, lastDivIndex) + modalUI + code.substring(lastDivIndex);


// 3. Replace window.prompt and window.confirm
// Make the click handlers async if they are not.
code = code.replace(/onClick=\{\(\) => \{/g, 'onClick={async () => {');
code = code.replace(/window\.prompt\(/g, 'await customPrompt(');
code = code.replace(/window\.confirm\(/g, 'await customConfirm(');

// Also handle handleResetToDefault
code = code.replace(/const handleResetToDefault = async \(\) => \{/g, 'const handleResetToDefault = async () => {\n    if (await customConfirm("确定要重置为系统默认配置吗？这会覆盖云端当前的修改。")) {\n      importConfig(defaultUserData);\n      showToast("已重置为本地默认数据，请点击“发布保存”同步至云端。", "info");\n    }\n  };\n  //');
code = code.replace(/if \(window\.confirm\("确定要重置为系统默认配置吗\？这会覆盖云端当前的修改。"\)\) \{[\s\S]*?\n  \}/g, '');

fs.writeFileSync('components/Admin.tsx', code);
