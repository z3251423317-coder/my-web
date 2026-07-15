const fs = require('fs');

let code = fs.readFileSync('components/TopologyCanvas.tsx', 'utf-8');

const targetHandlesOld = `<Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-indigo-500" />
      
      {/* Allows connecting from any side if needed, but top/bottom is standard */}
      <Handle type="target" position={Position.Left} id="left-t" isConnectable={isConnectable} className="w-3 h-3 bg-indigo-500" />
      <Handle type="source" position={Position.Right} id="right-s" isConnectable={isConnectable} className="w-3 h-3 bg-amber-500" />`;

const newHandles = `{/* Top Handles */}
      <Handle type="target" position={Position.Top} id="t-top" isConnectable={isConnectable} className="w-4 h-4 bg-transparent border-none z-0" />
      <Handle type="source" position={Position.Top} id="s-top" isConnectable={isConnectable} className="w-3 h-3 bg-amber-500 z-10" />
      
      {/* Left Handles */}
      <Handle type="target" position={Position.Left} id="t-left" isConnectable={isConnectable} className="w-4 h-4 bg-transparent border-none z-0" />
      <Handle type="source" position={Position.Left} id="s-left" isConnectable={isConnectable} className="w-3 h-3 bg-amber-500 z-10" />
      
      {/* Right Handles */}
      <Handle type="target" position={Position.Right} id="t-right" isConnectable={isConnectable} className="w-4 h-4 bg-transparent border-none z-0" />
      <Handle type="source" position={Position.Right} id="s-right" isConnectable={isConnectable} className="w-3 h-3 bg-amber-500 z-10" />`;

code = code.replace(targetHandlesOld, newHandles);

const bottomHandleOld = `<Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-amber-500" />`;
const bottomHandleNew = `{/* Bottom Handles */}
      <Handle type="target" position={Position.Bottom} id="t-bottom" isConnectable={isConnectable} className="w-4 h-4 bg-transparent border-none z-0" />
      <Handle type="source" position={Position.Bottom} id="s-bottom" isConnectable={isConnectable} className="w-3 h-3 bg-amber-500 z-10" />`;

code = code.replace(bottomHandleOld, bottomHandleNew);

fs.writeFileSync('components/TopologyCanvas.tsx', code);
console.log('Fixed CustomNode handles');
