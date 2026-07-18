import React, { useCallback, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  NodeProps,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  MarkerType,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Trash2, Edit3, Image as ImageIcon, Link as LinkIcon, X, Settings, Maximize, ChevronUp, ChevronDown } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';

export type TopologyNodeData = {
  label: string;
  copy: string;
  imageUrl: string;
  isMainNode: boolean;
  linkUrl?: string;
  onEdit?: (id: string) => void;
  onAddChild?: (id: string) => void;
  isAdmin?: boolean;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
};

const CustomNode = ({ id, data, isConnectable }: NodeProps<Node<TopologyNodeData>>) => {
  const hasLink = !!data.linkUrl;
  const handleClick = (e: React.MouseEvent) => {
    if (!data.isAdmin && hasLink) {
      e.stopPropagation();
      const url = data.linkUrl!;
      if (url.startsWith('#')) {
        // Smooth scroll to a screen section if it's an anchor link
        const targetElement = document.getElementById(url.substring(1));
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.hash = url;
        }
      } else {
        window.open(url, '_blank');
      }
    }
  };

  const inlineStyles: React.CSSProperties = {};
  if (data.bgColor) inlineStyles.backgroundColor = data.bgColor;
  if (data.borderColor) inlineStyles.borderColor = data.borderColor;
  if (data.textColor) inlineStyles.color = data.textColor;

  return (
    <div 
      onClick={handleClick}
      className={`p-4 rounded-xl border-2 shadow-lg backdrop-blur-md min-w-[200px] max-w-[300px] transition-all relative
        ${!data.bgColor ? (data.isMainNode ? 'bg-zinc-900/90' : 'bg-zinc-800/90') : ''}
        ${!data.borderColor ? (data.isMainNode ? 'border-amber-500 shadow-amber-500/10' : 'border-zinc-600') : ''}
        ${!data.isAdmin && hasLink ? 'nopan nodrag hover:scale-[1.03] hover:border-amber-400 cursor-pointer hover:shadow-amber-500/20 active:scale-[0.98]' : ''}
      `}
      style={inlineStyles}
    >
      {/* Top Handles */}
      <Handle type="target" position={Position.Top} id="t-top" isConnectable={isConnectable} className="w-4 h-4 bg-transparent border-none z-0" />
      <Handle type="source" position={Position.Top} id="s-top" isConnectable={isConnectable} className="w-3 h-3 bg-amber-500 z-10" />
      
      {/* Left Handles */}
      <Handle type="target" position={Position.Left} id="t-left" isConnectable={isConnectable} className="w-4 h-4 bg-transparent border-none z-0" />
      <Handle type="source" position={Position.Left} id="s-left" isConnectable={isConnectable} className="w-3 h-3 bg-amber-500 z-10" />
      
      {/* Right Handles */}
      <Handle type="target" position={Position.Right} id="t-right" isConnectable={isConnectable} className="w-4 h-4 bg-transparent border-none z-0" />
      <Handle type="source" position={Position.Right} id="s-right" isConnectable={isConnectable} className="w-3 h-3 bg-amber-500 z-10" />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 
            className="font-bold text-lg"
            style={{ color: data.textColor || (data.isMainNode ? '#f59e0b' : '#f4f4f5') }}
          >
            {data.label || '未命名节点'}
          </h3>
          {hasLink && (
            <span title={data.isAdmin ? `配置了链接: ${data.linkUrl}` : '点击跳转链接'}>
              <LinkIcon 
                size={14} 
                className={`shrink-0 ${!data.isAdmin ? 'animate-pulse' : ''}`}
                style={{ color: data.textColor || (data.isMainNode ? '#f59e0b' : '#a1a1aa') }}
              />
            </span>
          )}
        </div>
        {data.imageUrl && (
          <img src={data.imageUrl} alt={data.label} className="w-full h-auto rounded-md object-cover" />
        )}
        {data.copy && (
          <p 
            className="text-sm break-words whitespace-pre-wrap"
            style={data.textColor ? { color: data.textColor, opacity: 0.85 } : { color: '#d4d4d8' }}
          >
            {data.copy}
          </p>
        )}
        
        {data.isAdmin && (
          <div className="mt-2 pt-2 border-t border-zinc-700 flex justify-end gap-2">
            <button onClick={(e) => { e.stopPropagation(); data.onAddChild?.(id); }} className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white" title="添加子节点">
              <Plus size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); data.onEdit?.(id); }} className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white" title="编辑节点">
              <Edit3 size={14} />
            </button>
          </div>
        )}
      </div>
      {/* Bottom Handles */}
      <Handle type="target" position={Position.Bottom} id="t-bottom" isConnectable={isConnectable} className="w-4 h-4 bg-transparent border-none z-0" />
      <Handle type="source" position={Position.Bottom} id="s-bottom" isConnectable={isConnectable} className="w-3 h-3 bg-amber-500 z-10" />
    </div>
  );
};


const CanvasTools = ({ isMobile, isAdmin }: { isMobile: boolean, isAdmin: boolean }) => {
  const { fitView } = useReactFlow();
  return (
    <>
      <div className="absolute top-[calc(1rem+env(safe-area-inset-top,0px))] right-4 z-10 flex gap-2">
        <button 
          onClick={() => fitView({ duration: 800, padding: 0.2 })}
          className="flex items-center justify-center p-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg backdrop-blur-md shadow-lg border border-zinc-700 transition-colors"
          title="居中视图"
        >
          <Maximize size={20} />
        </button>
      </div>
      {!isAdmin && (
        <div className="absolute left-1/2 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-auto">
          {/* Scroll Navigation Overlay for mobile to easily escape the canvas */}
          <div className="flex gap-4">
             <button onClick={() => { const el = document.getElementById('screen-7'); if(el) el.scrollIntoView({behavior: 'smooth'})}} className="p-3 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-full shadow-xl border border-zinc-700 backdrop-blur-md transition-colors"><ChevronUp size={24}/></button>
             <button onClick={() => { const el = document.getElementById('screen-9'); if(el) el.scrollIntoView({behavior: 'smooth'})}} className="p-3 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-full shadow-xl border border-zinc-700 backdrop-blur-md transition-colors"><ChevronDown size={24}/></button>
          </div>
          <span className="text-[10px] text-zinc-400 bg-zinc-900/60 px-2 py-1 rounded backdrop-blur">点击切换屏幕</span>
        </div>
      )}
    </>
  );
};

const nodeTypes = {
  customNode: CustomNode,
};

function deduplicateEdges(edgesList: Edge[]): Edge[] {
  const seenIds = new Set<string>();
  const seenConnections = new Set<string>();
  const result: Edge[] = [];

  for (const edge of edgesList) {
    const connectionKey = `${edge.source}-${edge.sourceHandle || ''}-${edge.target}-${edge.targetHandle || ''}`;
    const edgeId = edge.id || `e-${connectionKey}`;
    
    if (!seenIds.has(edgeId) && !seenConnections.has(connectionKey)) {
      seenIds.add(edgeId);
      seenConnections.add(connectionKey);
      result.push({
        ...edge,
        id: edgeId
      });
    }
  }
  return result;
}

export default function TopologyCanvas({ 
  isAdmin = false, 
  isMobile = false, 
  onDataChange,
  initialNodes,
  initialEdges
}: { 
  isAdmin?: boolean, 
  isMobile?: boolean, 
  onDataChange?: (nodes: any[], edges: any[]) => void,
  initialNodes?: any[],
  initialEdges?: any[]
}) {
  const [nodes, setNodes] = useState<Node<TopologyNodeData>[]>(() => {
    if (isAdmin && initialNodes && initialNodes.length > 0) {
      return initialNodes;
    }
    return [];
  });
  const [edges, setEdges] = useState<Edge[]>(() => {
    if (isAdmin && initialEdges && initialEdges.length > 0) {
      return deduplicateEdges(initialEdges);
    }
    return [];
  });
  const [loading, setLoading] = useState(true);
  
  // Editing state
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<TopologyNodeData>>({});
  
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [edgeFormData, setEdgeFormData] = useState<{ stroke: string; dashed: boolean }>({ stroke: '#ffffff', dashed: false });

  // Add touch panning on mobile by avoiding ReactFlow capturing everything? 
  // Actually ReactFlow supports panOnDrag and zoomOnPinch natively.
  
  const loadData = async () => {
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
          const remoteRes = await fetch(`https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/user_data.json?t=${Date.now()}`, {
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
        if (data.topologyEdges) setEdges(deduplicateEdges(data.topologyEdges));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && nodes.length > 0) {
      setLoading(false);
    } else {
      loadData();
    }
    if (!isAdmin) {
      const unsub = onSnapshot(doc(db, "app_config", "master"), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.topologyNodes) setNodes(data.topologyNodes);
          if (data.topologyEdges) setEdges(deduplicateEdges(data.topologyEdges));
        }
      });
      return () => unsub();
    }
  }, [isAdmin]);

  const saveData = async (newNodes: Node[], newEdges: Edge[]) => {
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
    const cleanEdges = deduplicateEdges(newEdges).map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      type: e.type,
      animated: e.animated,
      style: e.style
    }));
    
    if (onDataChange) onDataChange(cleanNodes, cleanEdges);
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const next = applyNodeChanges(changes, nds) as Node<TopologyNodeData>[];
        saveData(next, edges);
        return next;
      });
    },
    [edges, isAdmin]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const next = applyEdgeChanges(changes, eds);
        saveData(nodes, next);
        return next;
      });
    },
    [nodes, isAdmin]
  );

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      if (!isAdmin) return;
      setEdges((eds) => {
        const next = addEdge({ ...params, type: 'default', animated: true, style: { stroke: '#ffffff' } } as any, eds);
        const uniqueNext = deduplicateEdges(next);
        saveData(nodes, uniqueNext);
        return uniqueNext;
      });
    },
    [nodes, isAdmin]
  );

  // Inject callbacks into node data
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        isAdmin,
        onEdit: (id: string) => {
          const node = nodes.find(x => x.id === id);
          if (node) {
            setEditFormData(node.data);
            setEditingNodeId(id);
          }
        },
        onAddChild: (id: string) => {
          const parentNode = nodes.find(x => x.id === id);
          if (!parentNode) return;
          const newNodeId = `node-${Date.now()}`;
          const newNode: Node<TopologyNodeData> = {
            id: newNodeId,
            type: 'customNode',
            position: { x: parentNode.position.x, y: parentNode.position.y + 150 },
            data: { label: '新子节点', copy: '', imageUrl: '', isMainNode: false }
          };
          const newEdge: Edge = {
            id: `e-${id}-${newNodeId}`,
            source: id,
            target: newNodeId,
            animated: true,
            style: { stroke: '#ffffff' }
          };
          const nextNodes = [...nodes, newNode];
          const nextEdges = deduplicateEdges([...edges, newEdge]);
          setNodes(nextNodes);
          setEdges(nextEdges);
          saveData(nextNodes, nextEdges);
        }
      }
    }));
  }, [nodes, isAdmin, edges]);

  const addMainNode = () => {
    if (!isAdmin) return;
    const newNodeId = `node-${Date.now()}`;
    const newNode: Node<TopologyNodeData> = {
      id: newNodeId,
      type: 'customNode',
      position: { x: Math.random() * 200 + 100, y: Math.random() * 100 + 100 },
      data: { label: '新主节点', copy: '', imageUrl: '', isMainNode: true }
    };
    const nextNodes = [...nodes, newNode];
    setNodes(nextNodes);
    saveData(nextNodes, edges);
  };

  const saveNodeEdit = () => {
    if (!editingNodeId) return;
    const nextNodes = nodes.map(n => {
      if (n.id === editingNodeId) {
        return { ...n, data: { ...n.data, ...editFormData } };
      }
      return n;
    });
    setNodes(nextNodes);
    saveData(nextNodes, edges);
    setEditingNodeId(null);
  };

  const deleteNode = () => {
    if (!editingNodeId) return;
    const nextNodes = nodes.filter(n => n.id !== editingNodeId);
    const nextEdges = edges.filter(e => e.source !== editingNodeId && e.target !== editingNodeId);
    setNodes(nextNodes);
    setEdges(nextEdges);
    saveData(nextNodes, nextEdges);
    setEditingNodeId(null);
  };

  const onEdgeClick = (e: React.MouseEvent, edge: Edge) => {
    if (!isAdmin) return;
    e.stopPropagation();
    setEditingEdgeId(edge.id);
    setEdgeFormData({
      stroke: edge.style?.stroke?.toString() || '#ffffff',
      dashed: !!edge.style?.strokeDasharray
    });
  };

  const saveEdgeEdit = () => {
    if (!editingEdgeId) return;
    const nextEdges = edges.map(e => {
      if (e.id === editingEdgeId) {
        return {
          ...e,
          animated: edgeFormData.dashed,
          style: {
            ...e.style,
            stroke: edgeFormData.stroke,
            strokeDasharray: edgeFormData.dashed ? '5,5' : 'none'
          }
        };
      }
      return e;
    });
    setEdges(nextEdges);
    saveData(nodes, nextEdges);
    setEditingEdgeId(null);
  };

  const deleteEdge = () => {
    if (!editingEdgeId) return;
    const nextEdges = edges.filter(e => e.id !== editingEdgeId);
    setEdges(nextEdges);
    saveData(nodes, nextEdges);
    setEditingEdgeId(null);
  };

  if (loading) return <div className="w-full h-full flex items-center justify-center text-white">Loading Topology...</div>;

  return (
    <div className="w-full h-full relative" style={{ touchAction: 'none' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodesWithCallbacks}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ maxZoom: isMobile ? 0.42 : 0.9, padding: isMobile ? 0.3 : 0.15 }}
          minZoom={0.05}
          maxZoom={4}
          panOnDrag={true} // Allow dragging canvas
          panOnScroll={false} // Allow scrolling canvas only on desktop
          zoomOnScroll={true} // Scroll to zoom on desktop
          zoomOnPinch={true}
          nodesDraggable={isAdmin}
          elementsSelectable={isAdmin}
          edgesFocusable={isAdmin}
          proOptions={{ hideAttribution: true }}
          className="bg-zinc-950"
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#3f3f46" />
          <Controls className="bg-zinc-800 text-white fill-white border-zinc-700 [&>button]:border-zinc-700 [&>button]:hover:bg-zinc-700" />
          <MiniMap 
            nodeColor={(n) => {
              return n.data?.isMainNode ? '#f59e0b' : '#52525b';
            }}
            maskColor="rgba(0, 0, 0, 0.7)"
            className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl"
          />
          <CanvasTools isMobile={isMobile} isAdmin={isAdmin} />
        </ReactFlow>
      </ReactFlowProvider>

      {isAdmin && (
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button 
            onClick={addMainNode}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg shadow-lg"
          >
            <Plus size={16} /> 添加主节点
          </button>
        </div>
      )}

      {/* Node Edit Modal */}
      {isAdmin && editingNodeId && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0 pb-3 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">编辑节点</h2>
              <button onClick={() => setEditingNodeId(null)} className="text-zinc-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 py-2 min-h-0">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">节点标题</label>
                <input 
                  type="text" 
                  value={editFormData.label || ''} 
                  onChange={e => setEditFormData({...editFormData, label: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs text-zinc-400 mb-1">节点文案</label>
                <textarea 
                  value={editFormData.copy || ''} 
                  onChange={e => setEditFormData({...editFormData, copy: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white h-24"
                />
              </div>
              
              <div>
                <label className="block text-xs text-zinc-400 mb-1">图片链接 (可选)</label>
                <input 
                  type="text" 
                  value={editFormData.imageUrl || ''} 
                  onChange={e => setEditFormData({...editFormData, imageUrl: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">跳转链接 (可选)</label>
                <input 
                  type="text" 
                  value={editFormData.linkUrl || ''} 
                  onChange={e => setEditFormData({...editFormData, linkUrl: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white font-mono text-xs"
                  placeholder="https://... 或 anchor锚点 (如: #screen-1)"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-semibold">卡片颜色样式</label>
                
                <div className="space-y-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                  {/* Preset Buttons */}
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold block mb-1.5">快捷主题预设</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditFormData({
                          ...editFormData,
                          bgColor: '#18181b',
                          borderColor: '#f59e0b',
                          textColor: '#f59e0b'
                        })}
                        className="px-2 py-1 bg-zinc-900 border border-amber-500 text-amber-500 text-[10px] rounded hover:bg-zinc-850 active:scale-95 transition-all truncate text-left flex items-center gap-1.5"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                        Quantum Amber
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditFormData({
                          ...editFormData,
                          bgColor: '#0f172a',
                          borderColor: '#06b6d4',
                          textColor: '#22d3ee'
                        })}
                        className="px-2 py-1 bg-slate-900 border border-cyan-500 text-cyan-400 text-[10px] rounded hover:bg-slate-850 active:scale-95 transition-all truncate text-left flex items-center gap-1.5"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
                        Tech Cyan
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditFormData({
                          ...editFormData,
                          bgColor: '#1e1b4b',
                          borderColor: '#a855f7',
                          textColor: '#c084fc'
                        })}
                        className="px-2 py-1 bg-indigo-950 border border-purple-500 text-purple-400 text-[10px] rounded hover:bg-indigo-900 active:scale-95 transition-all truncate text-left flex items-center gap-1.5"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                        Cyber Purple
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditFormData({
                          ...editFormData,
                          bgColor: '#064e3b',
                          borderColor: '#10b981',
                          textColor: '#34d399'
                        })}
                        className="px-2 py-1 bg-emerald-950 border border-emerald-500 text-emerald-400 text-[10px] rounded hover:bg-emerald-900 active:scale-95 transition-all truncate text-left flex items-center gap-1.5"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        Bio Emerald
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditFormData({
                          ...editFormData,
                          bgColor: '#451a03',
                          borderColor: '#f97316',
                          textColor: '#fdba74'
                        })}
                        className="px-2 py-1 bg-orange-950 border border-orange-500 text-orange-400 text-[10px] rounded hover:bg-orange-900 active:scale-95 transition-all truncate text-left flex items-center gap-1.5"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                        Solar Flare
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditFormData({
                          ...editFormData,
                          bgColor: undefined,
                          borderColor: undefined,
                          textColor: undefined
                        })}
                        className="px-2 py-1 bg-zinc-800 border border-zinc-600 text-zinc-300 text-[10px] rounded hover:bg-zinc-700 active:scale-95 transition-all truncate text-left flex items-center gap-1.5"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 shrink-0" />
                        恢复默认样式
                      </button>
                    </div>
                  </div>

                  {/* Custom Color Inputs */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800">
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">背景</label>
                      <div className="flex items-center gap-1">
                        <input 
                          type="color" 
                          value={editFormData.bgColor || '#27272a'} 
                          onChange={e => setEditFormData({...editFormData, bgColor: e.target.value})}
                          className="w-6 h-6 bg-transparent border-0 cursor-pointer rounded overflow-hidden flex-shrink-0"
                        />
                        <input 
                          type="text" 
                          value={editFormData.bgColor || ''} 
                          placeholder="默认"
                          onChange={e => setEditFormData({...editFormData, bgColor: e.target.value || undefined})}
                          className="w-full bg-zinc-800 text-[10px] p-1 text-white border border-zinc-700 rounded font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">边框</label>
                      <div className="flex items-center gap-1">
                        <input 
                          type="color" 
                          value={editFormData.borderColor || '#52525b'} 
                          onChange={e => setEditFormData({...editFormData, borderColor: e.target.value})}
                          className="w-6 h-6 bg-transparent border-0 cursor-pointer rounded overflow-hidden flex-shrink-0"
                        />
                        <input 
                          type="text" 
                          value={editFormData.borderColor || ''} 
                          placeholder="默认"
                          onChange={e => setEditFormData({...editFormData, borderColor: e.target.value || undefined})}
                          className="w-full bg-zinc-800 text-[10px] p-1 text-white border border-zinc-700 rounded font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">文字</label>
                      <div className="flex items-center gap-1">
                        <input 
                          type="color" 
                          value={editFormData.textColor || '#f4f4f5'} 
                          onChange={e => setEditFormData({...editFormData, textColor: e.target.value})}
                          className="w-6 h-6 bg-transparent border-0 cursor-pointer rounded overflow-hidden flex-shrink-0"
                        />
                        <input 
                          type="text" 
                          value={editFormData.textColor || ''} 
                          placeholder="默认"
                          onChange={e => setEditFormData({...editFormData, textColor: e.target.value || undefined})}
                          className="w-full bg-zinc-800 text-[10px] p-1 text-white border border-zinc-700 rounded font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isMainNode"
                  checked={editFormData.isMainNode || false} 
                  onChange={e => setEditFormData({...editFormData, isMainNode: e.target.checked})}
                />
                <label htmlFor="isMainNode" className="text-sm text-zinc-300">设为主节点 (黄色高亮)</label>
              </div>
            </div>

            <div className="mt-6 flex justify-between flex-shrink-0 pt-4 border-t border-zinc-800">
              <button onClick={deleteNode} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded flex items-center gap-1 transition-colors">
                <Trash2 size={16}/> 删除节点
              </button>
              <div className="flex gap-2">
                <button onClick={() => setEditingNodeId(null)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded">取消</button>
                <button onClick={saveNodeEdit} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded">保存</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edge Edit Modal */}
      {isAdmin && editingEdgeId && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">编辑连线</h2>
              <button onClick={() => setEditingEdgeId(null)} className="text-zinc-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">线条颜色</label>
                <input 
                  type="color" 
                  value={edgeFormData.stroke} 
                  onChange={e => setEdgeFormData({...edgeFormData, stroke: e.target.value})}
                  className="w-full h-10 bg-zinc-800 border border-zinc-700 rounded p-1 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="dashedEdge"
                  checked={edgeFormData.dashed} 
                  onChange={e => setEdgeFormData({...edgeFormData, dashed: e.target.checked})}
                />
                <label htmlFor="dashedEdge" className="text-sm text-zinc-300">使用虚线样式 (并开启动画)</label>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={deleteEdge} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded flex items-center gap-1 transition-colors">
                <Trash2 size={16}/> 一键断开
              </button>
              <div className="flex gap-2">
                <button onClick={() => setEditingEdgeId(null)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded">取消</button>
                <button onClick={saveEdgeEdit} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded">保存</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
