const fs = require('fs');
let code = fs.readFileSync('components/Admin.tsx', 'utf-8');

if (!code.includes('onDataChange={')) {
  code = code.replace(
    '<TopologyCanvas isAdmin={true} isMobile={false} />',
    '<TopologyCanvas isAdmin={true} isMobile={false} onDataChange={(n, e) => { setTopologyNodes(n); setTopologyEdges(e); }} />'
  );
}

fs.writeFileSync('components/Admin.tsx', code);
console.log('Patched Admin to pass onDataChange');
