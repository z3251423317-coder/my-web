const fs = require('fs');
let code = fs.readFileSync('components/TopologyCanvas.tsx', 'utf-8');

const oldSave = `  const saveData = async (newNodes: Node[], newEdges: Edge[]) => {
    if (!isAdmin) return;
    try {
      const res = await fetch('/api/config');
      const data = res.ok ? await res.json() : {};
      data.topologyNodes = newNodes;
      data.topologyEdges = newEdges;
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (onDataChange) onDataChange(newNodes, newEdges);
    } catch (e) {
      console.error(e);
    }
  };`;

const newSave = `  const saveData = async (newNodes: Node[], newEdges: Edge[]) => {
    if (!isAdmin) return;
    // Strip out internal ReactFlow properties that might cause circular JSON errors
    const cleanNodes = newNodes.map(n => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
      width: n.width,
      height: n.height
    }));
    const cleanEdges = newEdges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type,
      animated: e.animated,
      style: e.style
    }));
    
    if (onDataChange) onDataChange(cleanNodes, cleanEdges);
  };`;

code = code.replace(oldSave, newSave);

fs.writeFileSync('components/TopologyCanvas.tsx', code);
console.log('Patched TopologyCanvas saveData');
