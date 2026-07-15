const fs = require('fs');
let code = fs.readFileSync('components/Admin.tsx', 'utf-8');

if (!code.includes('const [topologyNodes')) {
  code = code.replace(
    'const [screen7GlowColor, setScreen7GlowColor] = useState(\'#fbbf24\');',
    'const [screen7GlowColor, setScreen7GlowColor] = useState(\'#fbbf24\');\n  const [topologyNodes, setTopologyNodes] = useState<any[]>([]);\n  const [topologyEdges, setTopologyEdges] = useState<any[]>([]);'
  );
  fs.writeFileSync('components/Admin.tsx', code);
  console.log('Added topologyNodes state to Admin.tsx');
}
