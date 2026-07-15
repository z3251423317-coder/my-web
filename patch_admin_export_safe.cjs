const fs = require('fs');
let code = fs.readFileSync('components/Admin.tsx', 'utf-8');

const oldExport = `  // Helper to construct the unified config object
  const exportConfig = () => {
    return {
      version,
      timestamp: new Date().toISOString(),
      screens,
      pillNavItems,
      marqueeCards,
      sphereCards,
      domeCards,
      trialCards,
      relationshipCards,
      screen7Cards,
      screen7Tabs,
      screen7GlowEnabled,
      screen7GlowColor,
      screen3Tabs,
      topologyNodes,
      topologyEdges
    };
  };`;

const newExport = `  // Helper to construct the unified config object
  const exportConfig = () => {
    // Safely strip circular refs from topology if any
    const safeTopologyNodes = Array.isArray(topologyNodes) ? topologyNodes.map(n => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
      width: n.width,
      height: n.height
    })) : [];
    
    const safeTopologyEdges = Array.isArray(topologyEdges) ? topologyEdges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type,
      animated: e.animated,
      style: e.style
    })) : [];

    return {
      version,
      timestamp: new Date().toISOString(),
      screens,
      pillNavItems,
      marqueeCards,
      sphereCards,
      domeCards,
      trialCards,
      relationshipCards,
      screen7Cards,
      screen7Tabs,
      screen7GlowEnabled,
      screen7GlowColor,
      screen3Tabs,
      topologyNodes: safeTopologyNodes,
      topologyEdges: safeTopologyEdges
    };
  };`;

if (code.includes(oldExport)) {
  code = code.replace(oldExport, newExport);
} else {
  // If it didn't match perfectly, just replace the body of exportConfig
  code = code.replace(
    '      topologyNodes,\n      topologyEdges\n    };\n  };',
    '      topologyNodes: Array.isArray(topologyNodes) ? topologyNodes.map((n: any) => ({id: n.id, type: n.type, position: n.position, data: n.data})) : [],\n      topologyEdges: Array.isArray(topologyEdges) ? topologyEdges.map((e: any) => ({id: e.id, source: e.source, target: e.target, type: e.type, animated: e.animated, style: e.style})) : []\n    };\n  };'
  );
}

// Also fix textarea rendering to not crash on other potential circular refs
code = code.replace(
  '<textarea\n                    readOnly\n                    value={JSON.stringify(exportConfig(), null, 2)}',
  '<textarea\n                    readOnly\n                    value={(() => { try { return JSON.stringify(exportConfig(), null, 2); } catch (e) { return "Error parsing config for display: " + e; } })()}'
);

fs.writeFileSync('components/Admin.tsx', code);
console.log('Patched Admin exportConfig to be safe.');
