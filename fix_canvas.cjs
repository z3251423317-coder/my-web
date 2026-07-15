const fs = require('fs');

let code = fs.readFileSync('components/TopologyCanvas.tsx', 'utf-8');

// Fix applyNodeChanges
code = code.replace(
  "const next = applyNodeChanges(changes, nds);",
  "const next = applyNodeChanges(changes, nds) as Node<TopologyNodeData>[];"
);

// Fix addEdge
code = code.replace(
  "const next = addEdge({ ...params, animated: true, style: { stroke: '#ffffff' } }, eds);",
  "const next = addEdge({ ...params, type: 'default', animated: true, style: { stroke: '#ffffff' } } as any, eds);"
);

fs.writeFileSync('components/TopologyCanvas.tsx', code);
console.log('Fixed TopologyCanvas.tsx');
