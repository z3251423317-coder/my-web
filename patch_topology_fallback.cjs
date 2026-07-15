const fs = require('fs');
let code = fs.readFileSync('components/TopologyCanvas.tsx', 'utf-8');

const oldLoad = `  const loadData = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.topologyNodes) {
          setNodes(data.topologyNodes);
        } else {
          // Default initial node
          setNodes([
            {
              id: 'root-1',
              type: 'customNode',
              position: { x: 250, y: 100 },
              data: { label: '核心主题', copy: '这是拓扑画布的核心起点...', imageUrl: '', isMainNode: true }
            }
          ]);
        }
        if (data.topologyEdges) setEdges(data.topologyEdges);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };`;

const newLoad = `  const loadData = async () => {
    try {
      let data = null;
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          data = await res.json();
        }
      } catch (localErr) {
        console.warn("Local config failed, falling back to COS remote...", localErr);
      }
      
      if (!data) {
        try {
          const remoteRes = await fetch(\`https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/user_data.json?t=\${Date.now()}\`, {
            cache: 'no-store'
          });
          if (remoteRes.ok) {
            data = await remoteRes.json();
          }
        } catch (e) {}
      }

      if (data) {
        if (data.topologyNodes) {
          setNodes(data.topologyNodes);
        } else {
          // Default initial node
          setNodes([
            {
              id: 'root-1',
              type: 'customNode',
              position: { x: 250, y: 100 },
              data: { label: '核心主题', copy: '这是拓扑画布的核心起点...', imageUrl: '', isMainNode: true }
            }
          ]);
        }
        if (data.topologyEdges) setEdges(data.topologyEdges);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };`;

code = code.replace(oldLoad, newLoad);
fs.writeFileSync('components/TopologyCanvas.tsx', code);
console.log('TopologyCanvas loadData patched with remote fallback.');
