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
import { Plus, Trash2, Edit3, Image as ImageIcon, Link as LinkIcon, X, Settings } from 'lucide-react';

export type TopologyNodeData = {
  label: string;
  copy: string;
  imageUrl: string;
  isMainNode: boolean;
  onEdit?: (id: string) => void;
  onAddChild?: (id: string) => void;
  isAdmin?: boolean;
};

const CustomNode = ({ id, data, isConnectable }: NodeProps<Node<TopologyNodeData>>) => {
  return (
    <div className={`p-4 rounded-xl border-2 shadow-lg backdrop-blur-md min-w-[200px] max-w-[300px] transition-colors
      ${data.isMainNode ? 'bg-zinc-900/90 border-amber-500' : 'bg-zinc-800/90 border-zinc-600'}
    `}>
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
          <h3 className={`font-bold text-lg ${data.isMainNode ? 'text-amber-400' : 'text-zinc-100'}`}>
            {data.label || '未命名节点'}
          </h3>
        </div>
        {data.imageUrl && (
          <img src={data.imageUrl} alt={data.label} className="w-full h-auto rounded-md object-cover" />
        )}
        {data.copy && (
          <p className="text-sm text-zinc-300 break-words whitespace-pre-wrap">{data.copy}</p>
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

const nodeTypes = {
  customNode: CustomNode,
};

export default function TopologyCanvas({ isAdmin = false, isMobile = false }) {
  const [nodes, setNodes] = useState<Node<TopologyNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
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
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveData = async (newNodes: Node[], newEdges: Edge[]) => {
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
    } catch (e) {
      console.error(e);
    }
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
        saveData(nodes, next);
        return next;
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
          const nextEdges = [...edges, newEdge];
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
          minZoom={0.1}
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
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">编辑节点</h2>
              <button onClick={() => setEditingNodeId(null)} className="text-zinc-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
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

            <div className="mt-6 flex justify-between">
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
