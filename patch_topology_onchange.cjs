const fs = require('fs');
let code = fs.readFileSync('components/TopologyCanvas.tsx', 'utf-8');

if (!code.includes('onDataChange')) {
  code = code.replace(
    'export default function TopologyCanvas({ isAdmin = false, isMobile = false }) {',
    'export default function TopologyCanvas({ isAdmin = false, isMobile = false, onDataChange }: { isAdmin?: boolean, isMobile?: boolean, onDataChange?: (nodes: any[], edges: any[]) => void }) {'
  );

  code = code.replace(
    'body: JSON.stringify(data)\n      });\n    } catch',
    'body: JSON.stringify(data)\n      });\n      if (onDataChange) onDataChange(newNodes, newEdges);\n    } catch'
  );
}

fs.writeFileSync('components/TopologyCanvas.tsx', code);
console.log('Patched TopologyCanvas to support onDataChange');
