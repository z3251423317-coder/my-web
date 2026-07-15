const fs = require('fs');
let code = fs.readFileSync('components/Admin.tsx', 'utf-8');

if (!code.includes('const [topologyNodes, setTopologyNodes]')) {
  code = code.replace(
    'const [screen7GlowColor, setScreen7GlowColor] = useState<string>("#3b82f6");',
    `const [screen7GlowColor, setScreen7GlowColor] = useState<string>("#3b82f6");
  const [topologyNodes, setTopologyNodes] = useState<any[]>([]);
  const [topologyEdges, setTopologyEdges] = useState<any[]>([]);`
  );
}

if (code.includes('if (data.screen7GlowColor) setScreen7GlowColor(data.screen7GlowColor);')) {
  code = code.replace(
    'if (data.screen7GlowColor) setScreen7GlowColor(data.screen7GlowColor);',
    `if (data.screen7GlowColor) setScreen7GlowColor(data.screen7GlowColor);
    if (Array.isArray(data.topologyNodes)) setTopologyNodes(data.topologyNodes);
    if (Array.isArray(data.topologyEdges)) setTopologyEdges(data.topologyEdges);`
  );
}

if (code.includes('exportConfig = () => {') && !code.includes('topologyNodes,')) {
  code = code.replace(
    'screen7GlowColor\n    };',
    `screen7GlowColor,
      topologyNodes,
      topologyEdges
    };`
  );
}

fs.writeFileSync('components/Admin.tsx', code);
console.log('Fixed exportConfig for topology data.');
