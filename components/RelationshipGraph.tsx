import React, { useState, useRef, useEffect } from "react";
import { GraphNode, GraphLink } from "../types";
import { Cpu, Network, HelpCircle, X, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, ChevronRight } from "lucide-react";

interface RelationshipGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  isScreenEight?: boolean;
  screenTitle?: string;
  screenSubtitle?: string;
  screenDesc?: string;
  screenCtaText?: string;
  screenCtaUrl?: string;
  onCtaClick?: () => void;
}

export function RelationshipGraph({ 
  nodes, 
  links,
  isScreenEight = false,
  screenTitle = "",
  screenSubtitle = "",
  screenDesc = "",
  screenCtaText = "",
  screenCtaUrl = "",
  onCtaClick
}: RelationshipGraphProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Pan and Zoom States for the Infinite Canvas feel
  const [scale, setScale] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isComponentFullScreen, setIsComponentFullScreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Bind mouse wheel for zooming to prevent page scroll during canvas interaction
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1.08;
      setScale(prev => {
        const newScale = e.deltaY < 0 ? prev * zoomFactor : prev / zoomFactor;
        return Math.max(0.3, Math.min(3.5, newScale));
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Listen to Escape key to exit fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsComponentFullScreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan on left click
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  // Touch pan handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsPanning(true);
    setPanStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPanOffset({
      x: touch.clientX - panStart.x,
      y: touch.clientY - panStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(3.5, prev * 1.2));
  const zoomOut = () => setScale(prev => Math.max(0.3, prev / 1.2));
  const resetView = () => {
    setScale(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Helper to check if a node is connected to the hovered node
  const isConnectedToHovered = (nodeId: string) => {
    if (!hoveredNodeId) return true;
    if (nodeId === hoveredNodeId) return true;
    return links.some(l => 
      (l.source === hoveredNodeId && l.target === nodeId) ||
      (l.target === hoveredNodeId && l.source === nodeId)
    );
  };

  // Helper to check if a link is connected to the hovered node
  const isLinkActive = (link: GraphLink) => {
    if (!hoveredNodeId) return true;
    return link.source === hoveredNodeId || link.target === hoveredNodeId;
  };

  return (
    <div 
      className={`flex flex-col justify-between relative overflow-hidden backdrop-blur-md transition-all duration-300 ${
        isComponentFullScreen 
          ? "fixed inset-0 w-screen h-screen z-[9999] bg-zinc-950/98 rounded-none border-none p-0" 
          : "w-full h-full min-h-[500px] bg-zinc-950/25 border border-zinc-900/60 rounded-3xl shadow-2xl"
      }`}
    >
      {/* Dynamic flow animation styles */}
      <style>{`
        @keyframes graph-flow {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-flow-line {
          stroke-dasharray: 6 4;
          animation: graph-flow 1.2s linear infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.08); }
        }
        .animate-glow-underlay {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>

      {/* Floating Info Overlay for Screen Eight (Title, Description, CTA) */}
      {isScreenEight && !isComponentFullScreen && (
        <div className="absolute top-6 left-6 z-50 max-w-sm bg-zinc-950/85 backdrop-blur-xl border border-zinc-900 rounded-2xl p-6 shadow-2xl pointer-events-auto space-y-4">
          <span className="font-mono text-amber-500 text-[9px] tracking-widest font-bold uppercase block bg-amber-500/10 px-2 py-0.5 rounded w-fit border border-amber-500/20">
            08. Perspective • Quantum Topology
          </span>
          <div className="space-y-1">
            <h1 className="font-display font-extrabold text-xl md:text-2xl text-white tracking-tight leading-tight">
              {screenTitle}
            </h1>
            {screenSubtitle && (
              <p className="font-serif italic text-xs text-zinc-300 font-light">{screenSubtitle}</p>
            )}
          </div>
          {screenDesc && (
            <p className="text-zinc-400 text-[11px] leading-relaxed font-sans font-light">
              {screenDesc}
            </p>
          )}
          {screenCtaText && (
            <button 
              onClick={onCtaClick}
              className="group inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-[10px] font-bold font-display tracking-widest uppercase rounded-lg shadow-md hover:scale-[1.01] transition-all cursor-pointer"
            >
              <span>{screenCtaText}</span>
              <ChevronRight className="w-3 h-3 translate-x-0 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      )}

      {/* Interactive Controls Bar */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 pointer-events-auto">
        <div className="flex bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-1 shadow-xl backdrop-blur-md">
          <button
            onClick={zoomIn}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="放大 / Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="缩小 / Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="重置视图 / Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="w-[1px] bg-zinc-800 my-1 mx-1" />
          <button
            onClick={() => setIsComponentFullScreen(!isComponentFullScreen)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title={isComponentFullScreen ? "退出全屏 / Exit Fullscreen" : "全屏体验 / Immersive Fullscreen"}
          >
            {isComponentFullScreen ? <Minimize2 className="w-4 h-4 text-amber-500" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Infinite Canvas Container */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative flex-1 w-full overflow-hidden select-none cursor-grab active:cursor-grabbing ${
          isComponentFullScreen ? "h-screen" : "min-h-[480px]"
        }`}
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1.5px, transparent 1.5px)',
          backgroundSize: '30px 30px'
        }}
      >
        {/* Dynamic Transformed Vector Canvas Area */}
        <div 
          className="w-full h-full absolute inset-0 transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
            transformOrigin: "center center"
          }}
        >
          {/* Connection Lines Vector Space */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            {links.map((link) => {
              const srcNode = nodes.find(n => n.id === link.source);
              const tgtNode = nodes.find(n => n.id === link.target);
              if (!srcNode || !tgtNode) return null;

              const active = isLinkActive(link);
              const color = link.color || '#fbbf24';

              return (
                <line
                  key={link.id}
                  x1={`${srcNode.x}%`}
                  y1={`${srcNode.y}%`}
                  x2={`${tgtNode.x}%`}
                  y2={`${tgtNode.y}%`}
                  stroke={color}
                  strokeWidth={active ? (hoveredNodeId ? 3.0 : 2.0) : 0.8}
                  strokeOpacity={active ? 0.95 : 0.12}
                  className={`transition-all duration-300 ${active ? 'animate-flow-line' : ''}`}
                />
              );
            })}
          </svg>

          {/* Nodes Layer */}
          {nodes.map((node) => {
            const hovered = hoveredNodeId === node.id;
            const active = isConnectedToHovered(node.id);
            const isSelected = selectedNodeId === node.id;

            return (
              <div
                key={node.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer flex flex-col items-center group ${
                  hovered ? 'scale-110 z-30' : 'z-10'
                }`}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  opacity: active ? 1 : 0.22
                }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={(e) => {
                  e.stopPropagation(); // Stop background pan triggering
                  setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
                }}
              >
                {/* Character Image OR High-tech Icon */}
                {node.imageUrl ? (
                  <div 
                    className="relative flex items-center justify-center transition-all duration-300"
                    style={{
                      width: `${node.width || 85}px`
                    }}
                  >
                    {/* Subtle radial glow underlay behind the character image */}
                    {(hovered || isSelected) && (
                      <div 
                        className="absolute -inset-4 rounded-full blur-xl opacity-35 pointer-events-none animate-glow-underlay"
                        style={{
                          background: `radial-gradient(circle, ${node.color || '#fbbf24'} 0%, transparent 70%)`
                        }}
                      />
                    )}
                    {/* Ping effect at the base of selected or main character */}
                    {(node.type === 'main' || isSelected) && (
                      <div 
                        className="absolute bottom-0 w-8 h-2 rounded-full blur-sm animate-ping opacity-30 pointer-events-none"
                        style={{ backgroundColor: node.color || '#fbbf24' }}
                      />
                    )}
                    {/* Transparent Character/GIF */}
                    <img 
                      src={node.imageUrl} 
                      alt={node.name}
                      className={`w-full h-auto object-contain pointer-events-none transition-all duration-300 ${
                        isSelected 
                          ? 'drop-shadow-[0_0_12px_rgba(251,191,36,0.7)] scale-105 brightness-110' 
                          : hovered 
                            ? 'brightness-105' 
                            : 'brightness-90'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  /* Fallback sleek non-circular geometric glowing box */
                  <div 
                    className={`relative p-3 backdrop-blur-md transition-all duration-300 flex items-center justify-center ${
                      isSelected 
                        ? 'bg-zinc-900 border-2 shadow-[0_0_15px_rgba(251,191,36,0.3)] scale-105' 
                        : hovered
                          ? 'bg-zinc-900 border shadow-md scale-105'
                          : 'bg-zinc-950/80 border'
                    }`}
                    style={{
                      width: `${node.width || 75}px`,
                      height: `${node.width || 75}px`,
                      borderColor: isSelected || hovered ? (node.color || '#fbbf24') : 'rgba(63, 63, 70, 0.4)',
                      borderRadius: node.type === 'main' ? '12px' : '6px'
                    }}
                  >
                    {(node.type === 'main' || isSelected) && (
                      <div 
                        className="absolute inset-0 rounded-lg animate-ping opacity-15 pointer-events-none"
                        style={{ backgroundColor: node.color || '#fbbf24' }}
                      />
                    )}
                    {node.type === 'main' ? (
                      <Cpu className="w-6 h-6" style={{ color: node.color || '#fbbf24' }} />
                    ) : (
                      <Network className="w-5 h-5" style={{ color: node.color || '#3b82f6' }} />
                    )}
                  </div>
                )}

                {/* Node Label Badge */}
                <div 
                  className={`mt-2 px-2.5 py-0.5 bg-zinc-950/90 border rounded-lg text-[10px] font-mono font-bold tracking-wide shadow-lg max-w-[140px] truncate text-center backdrop-blur-md transition-all duration-300 ${
                    isSelected 
                      ? 'border-amber-500 text-amber-400' 
                      : hovered 
                        ? 'border-zinc-500 text-white' 
                        : 'border-zinc-800/80 text-zinc-300'
                  }`}
                >
                  {node.name}
                </div>
                <div className="text-[8px] text-zinc-500 font-mono mt-0.5 tracking-wider uppercase">
                  {node.type === 'main' ? '👑 主点' : '📎 分点'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Info panel / description detail card */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/90 border border-zinc-800/80 p-4 rounded-xl shadow-2xl z-45 flex flex-col md:flex-row gap-4 animate-slideUp backdrop-blur-xl pointer-events-auto">
          <button 
            onClick={() => setSelectedNodeId(null)}
            className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {selectedNode.imageUrl && (
            <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-900/40 border border-zinc-800/50 rounded-lg flex items-center justify-center p-1.5 overflow-hidden shrink-0">
              <img 
                src={selectedNode.imageUrl} 
                alt={selectedNode.name} 
                className="w-full h-full object-contain rounded"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div className="flex-1 space-y-1.5 text-left">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white tracking-wide">{selectedNode.name}</h4>
              <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                selectedNode.type === 'main' 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}>
                {selectedNode.type === 'main' ? '👑 主点 (Main)' : '📎 分点 (Sub)'}
              </span>
            </div>
            
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans pr-6 whitespace-pre-wrap">
              {selectedNode.desc || "暂无对此节点的详细介绍。您可以在后台 (Admin) 中添加针对该节点的深度讲解与相关背景信息。"}
            </p>
          </div>
        </div>
      )}

      {/* Bottom status/hint */}
      {!selectedNode && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-zinc-950/85 border border-zinc-800/60 px-4 py-1.5 rounded-full text-[9px] font-mono text-zinc-400 tracking-wider flex items-center gap-1.5 pointer-events-none backdrop-blur-md shadow-md z-30">
          <HelpCircle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>提示：拖拽背景可平移画布，鼠标滚轮可缩放，点击节点查看介绍</span>
        </div>
      )}
    </div>
  );
}
