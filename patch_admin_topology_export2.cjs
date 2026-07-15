const fs = require('fs');
let code = fs.readFileSync('components/Admin.tsx', 'utf-8');

code = code.replace(
  'screen3Tabs\n    };',
  'screen3Tabs,\n      topologyNodes,\n      topologyEdges\n    };'
);

fs.writeFileSync('components/Admin.tsx', code);
console.log('Fixed exportConfig for topology data.');
