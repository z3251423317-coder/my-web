const fs = require('fs');
let code = fs.readFileSync('components/TopologyCanvas.tsx', 'utf-8');

if (!code.includes('useReactFlow()')) {
  code = code.replace(
    "import { Plus, Trash2, Edit3, Image as ImageIcon, Link as LinkIcon, X, Settings } from '@xyflow/react'",
    "import { Plus, Trash2, Edit3, Image as ImageIcon, Link as LinkIcon, X, Settings, Maximize, ChevronUp, ChevronDown } from 'lucide-react';\nimport { useReactFlow } from '@xyflow/react';"
  );
  
  // Actually, wait, let's just do a normal replace without confusing quote escapes
  code = code.replace(
    "import { Plus, Trash2, Edit3, Image as ImageIcon, Link as LinkIcon, X, Settings } from 'lucide-react';",
    "import { Plus, Trash2, Edit3, Image as ImageIcon, Link as LinkIcon, X, Settings, Maximize, ChevronUp, ChevronDown } from 'lucide-react';\nimport { useReactFlow } from '@xyflow/react';"
  );
}

// Add MiniMap and RecenterButton components
const newComponents = `
const CanvasTools = ({ isMobile, isAdmin }: { isMobile: boolean, isAdmin: boolean }) => {
  const { fitView } = useReactFlow();
  return (
    <>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button 
          onClick={() => fitView({ duration: 800, padding: 0.2 })}
          className="flex items-center justify-center p-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg backdrop-blur-md shadow-lg border border-zinc-700 transition-colors"
          title="居中视图"
        >
          <Maximize size={20} />
        </button>
      </div>
      {!isAdmin && (
        <div className="absolute left-1/2 bottom-4 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-auto">
          {/* Scroll Navigation Overlay for mobile to easily escape the canvas */}
          <div className="flex gap-4">
             <button onClick={() => { const el = document.getElementById('screen-7'); if(el) el.scrollIntoView({behavior: 'smooth'})}} className="p-3 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-full shadow-xl border border-zinc-700 backdrop-blur-md transition-colors"><ChevronUp size={24}/></button>
             <button onClick={() => { const el = document.getElementById('screen-9'); if(el) el.scrollIntoView({behavior: 'smooth'})}} className="p-3 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-full shadow-xl border border-zinc-700 backdrop-blur-md transition-colors"><ChevronDown size={24}/></button>
          </div>
          <span className="text-[10px] text-zinc-400 bg-zinc-900/60 px-2 py-1 rounded backdrop-blur">点击切换屏幕</span>
        </div>
      )}
    </>
  );
};
`;

if (!code.includes('CanvasTools')) {
  code = code.replace(
    'const nodeTypes = {',
    newComponents + '\nconst nodeTypes = {'
  );
}

if (!code.includes('<MiniMap')) {
  code = code.replace(
    '<Controls className="bg-zinc-800 text-white fill-white border-zinc-700 [&>button]:border-zinc-700 [&>button]:hover:bg-zinc-700" />',
    `<Controls className="bg-zinc-800 text-white fill-white border-zinc-700 [&>button]:border-zinc-700 [&>button]:hover:bg-zinc-700" />
          <MiniMap 
            nodeColor={(n) => {
              return n.data?.isMainNode ? '#f59e0b' : '#52525b';
            }}
            maskColor="rgba(0, 0, 0, 0.7)"
            className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl"
          />
          <CanvasTools isMobile={isMobile} isAdmin={isAdmin} />`
  );
}

fs.writeFileSync('components/TopologyCanvas.tsx', code);
console.log('TopologyCanvas updated with MiniMap and Tools.');
