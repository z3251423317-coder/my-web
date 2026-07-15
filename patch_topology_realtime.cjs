const fs = require('fs');
let code = fs.readFileSync('components/TopologyCanvas.tsx', 'utf-8');

const oldImports = `import { useReactFlow } from '@xyflow/react';`;
const newImports = `import { useReactFlow } from '@xyflow/react';\nimport { doc, onSnapshot } from 'firebase/firestore';\nimport { db } from '../firebase-config';`;

if (!code.includes('onSnapshot')) {
  code = code.replace(oldImports, newImports);
  
  const oldUseEffect = `  useEffect(() => {
    loadData();
  }, []);`;
  
  const newUseEffect = `  useEffect(() => {
    loadData();
    if (!isAdmin) {
      const unsub = onSnapshot(doc(db, "app_config", "master"), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.topologyNodes) setNodes(data.topologyNodes);
          if (data.topologyEdges) setEdges(data.topologyEdges);
        }
      });
      return () => unsub();
    }
  }, [isAdmin]);`;
  
  code = code.replace(oldUseEffect, newUseEffect);
  fs.writeFileSync('components/TopologyCanvas.tsx', code);
  console.log('TopologyCanvas updated for realtime sync.');
}
