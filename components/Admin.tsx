import TopologyCanvas from './TopologyCanvas';
import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { CheckInCalendar } from '../src/components/CheckInCalendar';
import { 
  Layers, Palette, Shield, Zap, ChevronLeft, ChevronRight, HelpCircle, 
  RefreshCw, CheckCircle, Database, AlertCircle, Play, Pause, Save, 
  Home, FileText, Globe, Cpu, Sliders, Music, Lock, Layout, ArrowRight, 
  Trash2, Plus, Edit3, Info, Eye, Upload, Video, Image as ImageIcon, AlertTriangle, Copy, Check, X,
  ChevronDown, ChevronUp, Folder, FolderPlus
} from 'lucide-react';
import defaultUserData from '../user_data.json';

// Define TS interfaces for safety
interface PillNavItem {
  id: string;
  label: string;
  href: string;
}

interface AudioModule {
  id: string;
  name: string;
  audioUrl: string;
  duration: string;
  rating: number;
  status: "启用" | "禁用" | string;
  createdAt: string;
  updatedAt: string;
  user: string;
  desc?: string;
}

interface SubCard {
  id: string;
  title: string;
  desc?: string;
  image?: string;
  audioModules?: AudioModule[];
}

interface MarqueeCard {
  id: number;
  title: string;
  cat: string;
  desc: string;
  url: string;
  colorType?: string;
  image?: string;
  isEncrypted?: boolean;
  password?: string;
  isLit?: boolean;
  glowEnabled?: boolean;
  glowColor?: string;
  checkInEnabled?: boolean;
  checkInDates?: string[];
  checkInQuote?: string;
  subCards?: SubCard[];
  audioModules?: AudioModule[];
}

interface RelationshipCard {
  id: string;
  title: string;
  cat: string;
  desc: string;
  imageUrl: string;
  pdfUrl: string;
  pdfPageImages: string[];
  imbalanceScore: number;
  notes: string;
  lastUpdated: string;
  audioModules?: AudioModule[];
  colorType?: string;
}

interface ScreenData {
  id: number;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  subtitleDelay?: number;
  descriptionDelay?: number;
  bgType: 'video' | 'image' | 'gradient' | string;
  bgUrl: string;
  bgTypeMobile?: 'video' | 'image' | 'gradient' | string;
  bgUrlMobile?: string;
  overlayOpacity?: number;
  overlayBlur?: number;
  tintColor?: string;
  align?: 'left' | 'center' | 'right' | string;
  ctaText?: string;
  ctaUrl?: string;
  bgMusicUrl?: string;
  mobileMusicUrl?: string;
  useVideoAudio?: boolean;
  guideEnabled?: boolean;
  guideIdleGif?: string;
  guideActiveGif?: string;
  guideDragGif?: string;
  guideAudio?: string;
  guideAutoPlay?: boolean;
}

export default function Admin() {
  // Global sync states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [copied, setCopied] = useState(false);

  // Active Tab: 0 = Overview, 1-9 = Screen 1-9 controllers, 10 = Backup & Raw JSON
  const [activeTab, setActiveTab] = useState<number>(0);

  // Core Data States
  const [version, setVersion] = useState('1.0_master');
  const [timestamp, setTimestamp] = useState('');
  const [screens, setScreens] = useState<ScreenData[]>([]);
  const [pillNavItems, setPillNavItems] = useState<PillNavItem[]>([]);
  const [marqueeCards, setMarqueeCards] = useState<MarqueeCard[]>([]);
  const [sphereCards, setSphereCards] = useState<MarqueeCard[]>([]);
  const [domeCards, setDomeCards] = useState<MarqueeCard[]>([]);
  const [trialCards, setTrialCards] = useState<MarqueeCard[]>([]);
  const [screen7Cards, setScreen7Cards] = useState<MarqueeCard[]>([]);
  const [screen7Tabs, setScreen7Tabs] = useState<string[]>([]);
  const [collapsedScreen7Cats, setCollapsedScreen7Cats] = useState<Record<string, boolean>>({});
  const [activeScreen7CardId, setActiveScreen7CardId] = useState<number | null>(null);
  const [screen3Tabs, setScreen3Tabs] = useState<string[]>([]);
  const [collapsedScreen3Cats, setCollapsedScreen3Cats] = useState<Record<string, boolean>>({});
  const [activeScreen3CardId, setActiveScreen3CardId] = useState<number | null>(null);
  const [screen3TabsBg, setScreen3TabsBg] = useState<string>("transparent");
  const [screen7TabsBg, setScreen7TabsBg] = useState<string>("transparent");

  const [promptState, setPromptState] = useState<{isOpen: boolean, message: string, defaultValue: string, resolve: (val: string | null) => void} | null>(null);
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, message: string, resolve: (val: boolean) => void} | null>(null);

  const customPrompt = (message: string, defaultValue: string): Promise<string | null> => {
    return new Promise((resolve) => {
      setPromptState({ isOpen: true, message, defaultValue, resolve });
    });
  };

  const customConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ isOpen: true, message, resolve });
    });
  };

  const [relationshipCards, setRelationshipCards] = useState<RelationshipCard[]>([]);
  const [screen7GlowEnabled, setScreen7GlowEnabled] = useState(true);
  const [screen7GlowColor, setScreen7GlowColor] = useState('#fbbf24');
  const [topologyNodes, setTopologyNodes] = useState<any[]>([]);
  const [topologyEdges, setTopologyEdges] = useState<any[]>([]);
  const [canvasResetKey, setCanvasResetKey] = useState(0);

  const [linkNodeBg, setLinkNodeBg] = useState<string>('#1e1b4b');
  const [linkNodeBorder, setLinkNodeBorder] = useState<string>('#a855f7');
  const [linkNodeText, setLinkNodeText] = useState<string>('#c084fc');
  const [nonLinkNodeBg, setNonLinkNodeBg] = useState<string>('#0f172a');
  const [nonLinkNodeBorder, setNonLinkNodeBorder] = useState<string>('#06b6d4');
  const [nonLinkNodeText, setNonLinkNodeText] = useState<string>('#22d3ee');

  // Selected sub-elements for active editing
  const [selectedPillNavId, setSelectedPillNavId] = useState<string | null>(null);
  const [selectedRelCardId, setSelectedRelCardId] = useState<string | null>(null);
  const [selectedMarqueeCardId, setSelectedMarqueeCardId] = useState<number | null>(null);
  const [selectedSphereCardId, setSelectedSphereCardId] = useState<number | null>(null);
  const [selectedDomeCardId, setSelectedDomeCardId] = useState<number | null>(null);
  const [selectedTrialCardId, setSelectedTrialCardId] = useState<number | null>(null);

  // Load configuration initially
  const loadConfig = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data && !data.error) {
            importConfig(data);
            showToast('数据载入成功 (Proxy API)', 'success');
            setLoading(false);
            return;
          }
        }
      }
      throw new Error("Proxy API not available or invalid format");
    } catch (err) {
      console.warn("API proxy load failed, falling back to direct Firestore get...", err);
      try {
        const docSnap = await getDoc(doc(db, 'app_config', 'master'));
        if (docSnap.exists()) {
          importConfig(docSnap.data());
          showToast('数据载入成功 (Firestore)', 'success');
        } else {
          // Auto-seed or fallback to defaultUserData
          importConfig(defaultUserData);
          showToast('加载了本地默认配置模版。数据库尚未初始化，保存后将自动同步至云端。', 'info');
        }
      } catch (fErr: any) {
        console.error("Direct Firestore load failed:", fErr);
        showToast('加载失败: ' + (fErr.message || String(fErr)), 'error');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Helper to parse loaded data safely into states
  const importConfig = (data: any) => {
    setSelectedPillNavId(null);
    if (data.version) setVersion(data.version);
    if (data.timestamp) setTimestamp(data.timestamp);
    if (Array.isArray(data.screens)) setScreens(data.screens);
    if (Array.isArray(data.pillNavItems)) {
      setPillNavItems(
        data.pillNavItems.map((item: any, idx: number) => ({
          id: item.id || `nav_${idx}_${Date.now()}`,
          label: item.label,
          href: item.href
        }))
      );
    }
    if (Array.isArray(data.marqueeCards)) setMarqueeCards(data.marqueeCards);
    if (Array.isArray(data.sphereCards)) setSphereCards(data.sphereCards);
    if (Array.isArray(data.domeCards)) setDomeCards(data.domeCards);
    if (Array.isArray(data.trialCards)) setTrialCards(data.trialCards);
    if (Array.isArray(data.relationshipCards)) setRelationshipCards(data.relationshipCards);
    if (Array.isArray(data.screen7Cards)) setScreen7Cards(data.screen7Cards);
    if (Array.isArray(data.screen7Tabs)) setScreen7Tabs(data.screen7Tabs);
    if (data.screen3TabsBg) setScreen3TabsBg(data.screen3TabsBg);
    if (data.screen7TabsBg) setScreen7TabsBg(data.screen7TabsBg);
    if (Array.isArray(data.screen3Tabs)) {
      setScreen3Tabs(data.screen3Tabs);
    } else {
      setScreen3Tabs(["HARDWARE ENGINE", "METRIC ANALYZIS", "OPTIMIZER"]);
    }
    if (data.screen7GlowEnabled !== undefined) setScreen7GlowEnabled(!!data.screen7GlowEnabled);
    if (data.screen7GlowColor) setScreen7GlowColor(data.screen7GlowColor);
    
    setLinkNodeBg(data.linkNodeBg || '#1e1b4b');
    setLinkNodeBorder(data.linkNodeBorder || '#a855f7');
    setLinkNodeText(data.linkNodeText || '#c084fc');
    setNonLinkNodeBg(data.nonLinkNodeBg || '#0f172a');
    setNonLinkNodeBorder(data.nonLinkNodeBorder || '#06b6d4');
    setNonLinkNodeText(data.nonLinkNodeText || '#22d3ee');

    if (Array.isArray(data.topologyNodes)) setTopologyNodes(data.topologyNodes);
    if (Array.isArray(data.topologyEdges)) setTopologyEdges(data.topologyEdges);
    setCanvasResetKey(prev => prev + 1);
  };

  // Helper to remove any fields that are undefined recursively so Firestore setDoc doesn't fail
  const removeUndefined = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(removeUndefined);
    } else if (obj !== null && typeof obj === 'object') {
      return Object.entries(obj).reduce((acc, [key, val]) => {
        if (val !== undefined) {
          acc[key] = removeUndefined(val);
        }
        return acc;
      }, {} as any);
    }
    return obj;
  };

  // Helper to construct the unified config object
  const exportConfig = () => {
    // Safely strip circular refs from topology if any
    const safeTopologyNodes = Array.isArray(topologyNodes) ? topologyNodes.map(n => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
      width: n.width,
      height: n.height
    })) : [];
    
    const safeTopologyEdges = Array.isArray(topologyEdges) ? topologyEdges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      type: e.type,
      animated: e.animated,
      style: e.style
    })) : [];

    return removeUndefined({
      version,
      timestamp: new Date().toISOString(),
      screens,
      pillNavItems,
      marqueeCards,
      sphereCards,
      domeCards,
      trialCards,
      relationshipCards,
      screen7Cards,
      screen7Tabs,
      screen7GlowEnabled,
      screen7GlowColor,
      screen3Tabs,
      topologyNodes: safeTopologyNodes,
      topologyEdges: safeTopologyEdges,
      linkNodeBg,
      linkNodeBorder,
      linkNodeText,
      nonLinkNodeBg,
      nonLinkNodeBorder,
      nonLinkNodeText
    });
  };

  // Toast feedback helper
  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage((prev) => prev === msg ? '' : prev);
    }, 5000);
  };

  // Save changes to backend
  const handleSave = async () => {
    setSaving(true);
    const data = exportConfig();
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        showToast('保存成功！主站所有端已实时发布并生效！', 'success');
        setSaving(false);
        return;
      }
      throw new Error("Proxy API returned error status: " + res.status);
    } catch (proxyErr) {
      console.warn("API proxy save failed, falling back to direct Firestore write...", proxyErr);
      try {
        await setDoc(doc(db, 'app_config', 'master'), data);
        showToast('发布成功！数据已直接同步到云端 Firestore，所有客户端自动刷新更新。', 'success');
      } catch (fWriteErr: any) {
        console.error("Direct Firestore write failed:", fWriteErr);
        showToast('同步失败: ' + (fWriteErr.message || String(fWriteErr)), 'error');
      }
    }
    setSaving(false);
  };

  // Reset to static system defaults with confirmation
  const handleResetToDefault = async () => {
    if (await customConfirm("确定要重置为系统默认配置吗？这会覆盖云端当前的修改。")) {
      importConfig(defaultUserData);
      showToast("已重置为本地默认数据，请点击“发布保存”同步至云端。", "info");
    }
  };
  // Copy raw JSON to clipboard
  const handleCopyJSON = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(exportConfig(), null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("复制失败，请手动选择输入框内容进行复制。");
    }
  };

  // Load custom pasted JSON
  const handleImportJSON = (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      importConfig(parsed);
      showToast("JSON 成功导入到编辑器中！别忘了点击右上角的保存发布噢。", "success");
    } catch (err: any) {
      showToast("解析粘贴的 JSON 失败: " + err.message, "error");
    }
  };

  // Helper to update specific fields in a screen
  const updateScreenField = (id: number, field: keyof ScreenData, value: any) => {
    setScreens(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mb-4"></div>
        <div className="text-zinc-400 font-medium tracking-wide">正在装载 AlphaQubit 数据库控制台...</div>
      </div>
    );
  }

  // Find active screen being edited
  const currentScreen = screens.find(s => s.id === activeTab);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-200 font-sans overflow-hidden select-text">
      
      {/* =================================================================================
       * ■ SIDEBAR: NAVIGATION CLASSIFIED BY EACH SCREEN CONTROLLER
       * ================================================================================= */}
      <div className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Cpu className="w-4 h-4 text-zinc-950 font-bold" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wider uppercase font-mono">AlphaQubit</h1>
              <span className="text-[10px] text-zinc-400 font-mono tracking-widest block uppercase">Visual Console v2.0</span>
            </div>
          </div>
          <a 
            href="/"
            className="flex items-center gap-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-2 py-1 rounded transition-all"
            title="返回前台主页"
          >
            <Home className="w-3 h-3" />
            主页
          </a>
        </div>

        {/* Tab Selection */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <span className="px-3 py-1.5 text-[9px] font-mono tracking-widest text-zinc-500 block uppercase font-bold">概览与系统</span>
          
          <button 
            onClick={() => setActiveTab(0)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
              activeTab === 0 
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-sm' 
                : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Database className="w-4 h-4 text-zinc-400" />
            <span>📊 运行概览与全局重置</span>
          </button>

          <div className="pt-2"></div>
          <span className="px-3 py-1.5 text-[9px] font-mono tracking-widest text-zinc-500 block uppercase font-bold">每一屏控制器 (Screen Editors)</span>

          {screens.map((s) => {
            const HeartIcon = Layers; // Use Layers instead of heart icon for visual consistency
            const screenIcons: Record<number, any> = {
              1: Globe,
              2: HeartIcon, // Used custom placeholder fallback
              3: Zap,
              4: Sliders,
              5: Cpu,
              6: Shield,
              7: Layout,
              8: Eye,
              9: FileText
            };
            const Icon = screenIcons[s.id] || FileText;

            return (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  activeTab === s.id 
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-sm font-bold' 
                    : 'hover:bg-zinc-800/40 text-zinc-350 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[9px] font-bold ${
                  activeTab === s.id ? 'bg-amber-500/20 text-amber-300' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  0{s.id}
                </div>
                <div className="flex-1 truncate">
                  <div className="font-bold text-[11px] truncate leading-tight text-zinc-200 group-hover:text-white">
                    {s.title}
                  </div>
                  <div className="text-[9px] text-zinc-500 truncate leading-snug font-mono">
                    {s.label}
                  </div>
                </div>
              </button>
            );
          })}

          <div className="pt-2"></div>
          <span className="px-3 py-1.5 text-[9px] font-mono tracking-widest text-zinc-500 block uppercase font-bold">系统备份与维护</span>
          
          <button 
            onClick={() => setActiveTab(10)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
              activeTab === 10 
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-sm' 
                : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Copy className="w-4 h-4 text-zinc-400" />
            <span>💾 备份配置 (Raw JSON Backup)</span>
          </button>
        </div>

        {/* Global Action Footer */}
        <div className="p-4 border-t border-zinc-850 bg-zinc-950/80 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>同步状态:</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              已联云
            </span>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/20 cursor-pointer"
          >
            <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
            {saving ? '正在发布同步...' : '🚀 发布更新至云端 (Publish)'}
          </button>
        </div>
      </div>

      {/* =================================================================================
       * ■ MAIN CONTENT CONTAINER: RENDERS SPECIFIC SELECTED CONTROLLER
       * ================================================================================= */}
      <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
        
        {/* Status Toast Header Bar */}
        {message && (
          <div className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between gap-3 animate-fade-in ${
            messageType === 'success' ? 'bg-emerald-950/70 border-b border-emerald-900/50 text-emerald-300' :
            messageType === 'error' ? 'bg-red-950/70 border-b border-red-900/50 text-red-300' :
            'bg-amber-950/70 border-b border-amber-900/50 text-amber-300'
          }`}>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage('')} className="text-[10px] underline hover:no-underline opacity-70">
              知道了
            </button>
          </div>
        )}

        {/* Tab-driven Form Container */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">

          {/* =================================================================================
           * ■ TAB 0: SYSTEM OVERVIEW
           * ================================================================================= */}
          {activeTab === 0 && (
            <div className="max-w-4xl space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-400" />
                  可视化配置控制面板
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  欢迎进入后台数据控制中心。在这里，您可以针对本网站的全部 9 屏展示页面及其相关的卡片和音频组件，进行精细、独立的可视化参数配置，而无须再面对杂乱庞杂的 raw JSON。数据通过云端 Firestore 实施订阅，一旦保存，前台用户可立即同步渲染，无需重启部署！
                </p>
              </div>

              {/* Status Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-bold">配置版本 / Version</span>
                  <span className="text-lg font-bold text-white font-mono mt-1.5">{version}</span>
                  <span className="text-[10px] text-zinc-500 font-sans block mt-1">主配置架构控制字段</span>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-bold">上次更新时间 / Timestamp</span>
                  <span className="text-[11px] font-mono font-medium text-amber-300 mt-2 truncate" title={timestamp}>
                    {timestamp ? new Date(timestamp).toLocaleString() : '暂未发布'}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-sans block mt-1">云端数据最后存入戳</span>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-bold">受控单元总数 / Modules</span>
                  <div className="flex gap-4 items-center mt-1">
                    <div className="text-sm font-bold text-white">
                      <span className="text-lg text-amber-400">{screens.length}</span> 屏
                    </div>
                    <div className="text-sm font-bold text-white">
                      <span className="text-lg text-amber-400">
                        {relationshipCards.length + marqueeCards.length + sphereCards.length + domeCards.length + trialCards.length}
                      </span> 卡
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-sans block mt-1">独立绑定控制的多维度卡片</span>
                </div>
              </div>

              {/* Diagnostic Quick Reset */}
              <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-xl space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    紧急故障修复与一键初始化
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    若发生数据损坏、错乱、白屏、或云端被空文档初始化，您可以使用以下功能快速重构和校正数据。
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleResetToDefault}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-zinc-700/60 text-zinc-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    重置本地缓存默认配置
                  </button>
                  <button
                    onClick={async () => {
                      if (await customConfirm("这会直接清除云端并重写本地自带的默认数据配置文件到云端，确定吗？")) {
                        setSaving(true);
                        try {
                          await setDoc(doc(db, 'app_config', 'master'), defaultUserData);
                          importConfig(defaultUserData);
                          showToast("已强行一键重写云端 Firestore 为系统原装数据！前台已实时刷新同步。", "success");
                        } catch (err: any) {
                          showToast("云端写入失败: " + err.message, "error");
                        } finally {
                          setSaving(false);
                        }
                      }
                    }}
                    className="px-4 py-2 bg-amber-600/25 hover:bg-amber-600 border border-amber-500/30 text-amber-300 hover:text-zinc-950 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    一键强行覆写云端 (Force Overwrite)
                  </button>
                  <button
                    onClick={loadConfig}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5" />
                    重新自云端拉取 (Reload)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================================
           * ■ TAB 10: BACKUP & IMPORT/EXPORT RAW JSON
           * ================================================================================= */}
          {activeTab === 10 && (
            <div className="max-w-4xl space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Copy className="w-5 h-5 text-amber-400" />
                  配置备份、导入与导出 (Raw JSON Backup)
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  在此处，您可以备份全站一整套 JSON 文件的原始内容。您可以点击下方复制按钮直接带走（对应“进入后台 (Admin)”按钮所需要的内容），也可以在右侧直接贴入旧有的合法 JSON 数据配置，再点击“导入配置并覆盖”来整体覆盖当前的后台编辑缓存。
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-2 flex flex-col h-[500px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-zinc-500 block uppercase font-bold">全站整包 Master Config 源码 (JSON)</span>
                    <button
                      onClick={handleCopyJSON}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? '已复制到剪贴板！' : '一键复制全包配置'}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={(() => { try { return JSON.stringify(exportConfig(), null, 2); } catch (e) { return "Error parsing config for display: " + e; } })()}
                    className="flex-1 w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-xs text-zinc-400 focus:outline-none select-all"
                  />
                </div>

                <div className="lg:col-span-4 bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-xl space-y-4 self-start">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest font-mono">
                      📥 导入配置
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      如果您之前备份了网站的 JSON，或者有别人发给您的配置，您可以直接贴到下方进行快速导入。
                    </p>
                  </div>

                  <textarea
                    placeholder="在此粘贴先前备份的合法 JSON 字符串..."
                    id="pasted_json_input"
                    className="w-full h-40 p-3 bg-zinc-950 border border-zinc-850 rounded-lg text-xs font-mono text-zinc-300 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/25"
                  />

                  <button
                    onClick={async () => {
                      const input = document.getElementById('pasted_json_input') as HTMLTextAreaElement;
                      if (input && input.value.trim()) {
                        handleImportJSON(input.value);
                      } else {
                        alert("请先输入合法的 JSON 内容！");
                      }
                    }}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    导入配置并覆盖缓存
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================================
           * ■ TAB 1-9: INDIVIDUAL SCREEN CONTROLLERS (FORM BUILDERS)
           * ================================================================================= */}
          {currentScreen && (
            <div className="max-w-4xl space-y-8">
              
              {/* Screen Info Banner */}
              <div className="p-6 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded text-[10px] font-mono tracking-wider font-bold">
                    SCREEN 0{currentScreen.id} CONTROLLER
                  </span>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-1">
                    {currentScreen.title || '（未命名屏幕）'}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    此控制板块只绑定第 {currentScreen.id} 屏 (<strong>{currentScreen.label}</strong>) 的页面图文层、层背景、按钮及属于该板块的所有卡片。
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <a 
                    href={`#screen-${currentScreen.id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    跳转预览这一屏
                  </a>
                </div>
              </div>

              {/* SECTION: SCREEN 8 TOPOLOGY */}
              <div style={{ display: currentScreen.id === 8 ? 'block' : 'none' }}>
                <div className="bg-zinc-900/20 border border-amber-500/30 rounded-xl p-5 space-y-4 shadow-xl mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-zinc-850 pb-3 mb-4">
                    <Database className="w-5 h-5 text-amber-400" />
                    第八屏：全屏一体化无限拓扑画布控制台
                  </h3>

                  {/* 全局节点颜色统一修改面板 */}
                  <div className="bg-zinc-950/60 p-4 border border-zinc-800 rounded-xl mb-4 space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-amber-500 font-bold">
                      🎨 画布节点色彩统一配置 (Global Node Color Presets)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 带链接的节点 */}
                      <div className="bg-purple-950/20 border border-purple-900/40 p-3 rounded-lg space-y-2.5">
                        <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          带有跳转链接的卡片 (With Links)
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-1">背景</label>
                            <div className="flex items-center gap-1">
                              <input 
                                type="color" 
                                value={linkNodeBg} 
                                onChange={(e) => setLinkNodeBg(e.target.value)} 
                                className="w-5 h-5 border-0 bg-transparent cursor-pointer rounded shrink-0"
                              />
                              <input 
                                type="text" 
                                value={linkNodeBg} 
                                onChange={(e) => setLinkNodeBg(e.target.value)} 
                                className="w-full bg-zinc-900 border border-zinc-800 text-[10px] px-1 py-0.5 text-white rounded font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-1">边框</label>
                            <div className="flex items-center gap-1">
                              <input 
                                type="color" 
                                value={linkNodeBorder} 
                                onChange={(e) => setLinkNodeBorder(e.target.value)} 
                                className="w-5 h-5 border-0 bg-transparent cursor-pointer rounded shrink-0"
                              />
                              <input 
                                type="text" 
                                value={linkNodeBorder} 
                                onChange={(e) => setLinkNodeBorder(e.target.value)} 
                                className="w-full bg-zinc-900 border border-zinc-800 text-[10px] px-1 py-0.5 text-white rounded font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-1">文字</label>
                            <div className="flex items-center gap-1">
                              <input 
                                type="color" 
                                value={linkNodeText} 
                                onChange={(e) => setLinkNodeText(e.target.value)} 
                                className="w-5 h-5 border-0 bg-transparent cursor-pointer rounded shrink-0"
                              />
                              <input 
                                type="text" 
                                value={linkNodeText} 
                                onChange={(e) => setLinkNodeText(e.target.value)} 
                                className="w-full bg-zinc-900 border border-zinc-800 text-[10px] px-1 py-0.5 text-white rounded font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 不带链接的节点 */}
                      <div className="bg-cyan-950/20 border border-cyan-900/40 p-3 rounded-lg space-y-2.5">
                        <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                          不带跳转链接的卡片 (No Links)
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-1">背景</label>
                            <div className="flex items-center gap-1">
                              <input 
                                type="color" 
                                value={nonLinkNodeBg} 
                                onChange={(e) => setNonLinkNodeBg(e.target.value)} 
                                className="w-5 h-5 border-0 bg-transparent cursor-pointer rounded shrink-0"
                              />
                              <input 
                                type="text" 
                                value={nonLinkNodeBg} 
                                onChange={(e) => setNonLinkNodeBg(e.target.value)} 
                                className="w-full bg-zinc-900 border border-zinc-800 text-[10px] px-1 py-0.5 text-white rounded font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-1">边框</label>
                            <div className="flex items-center gap-1">
                              <input 
                                type="color" 
                                value={nonLinkNodeBorder} 
                                onChange={(e) => setNonLinkNodeBorder(e.target.value)} 
                                className="w-5 h-5 border-0 bg-transparent cursor-pointer rounded shrink-0"
                              />
                              <input 
                                type="text" 
                                value={nonLinkNodeBorder} 
                                onChange={(e) => setNonLinkNodeBorder(e.target.value)} 
                                className="w-full bg-zinc-900 border border-zinc-800 text-[10px] px-1 py-0.5 text-white rounded font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-1">文字</label>
                            <div className="flex items-center gap-1">
                              <input 
                                type="color" 
                                value={nonLinkNodeText} 
                                onChange={(e) => setNonLinkNodeText(e.target.value)} 
                                className="w-5 h-5 border-0 bg-transparent cursor-pointer rounded shrink-0"
                              />
                              <input 
                                type="text" 
                                value={nonLinkNodeText} 
                                onChange={(e) => setNonLinkNodeText(e.target.value)} 
                                className="w-full bg-zinc-900 border border-zinc-800 text-[10px] px-1 py-0.5 text-white rounded font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-[600px] border border-zinc-700/50 rounded-xl overflow-hidden bg-zinc-950 shadow-inner relative z-10 pointer-events-auto">
                    <TopologyCanvas 
                      key={`${canvasResetKey}-${linkNodeBg}-${linkNodeBorder}-${linkNodeText}-${nonLinkNodeBg}-${nonLinkNodeBorder}-${nonLinkNodeText}`}
                      isAdmin={true} 
                      isMobile={false} 
                      initialNodes={topologyNodes}
                      initialEdges={topologyEdges}
                      onDataChange={(n, e) => { setTopologyNodes(n); setTopologyEdges(e); }} 
                      linkNodeBg={linkNodeBg}
                      linkNodeBorder={linkNodeBorder}
                      linkNodeText={linkNodeText}
                      nonLinkNodeBg={nonLinkNodeBg}
                      nonLinkNodeBorder={nonLinkNodeBorder}
                      nonLinkNodeText={nonLinkNodeText}
                    />
                  </div>
                  <p className="text-xs text-zinc-400">
                    提示：可以直接按住任意主点/分点并在画布上拖动，点击任意节点或新增节点即可进入专项编辑面板。支持设置、（主点/分点）支持在任意节点（主点与主点、分点与分点，或跨级主分点）之间自由创建关系连线。提供自定义选项，支持连线一键断开管理。虚线样式 (Dashed) 和线条颜色。
                  </p>
                </div>
              </div>

              {/* SECTION: SCREEN TEXTS & CONTENT */}
              <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-5 space-y-4">
                <h3 className="text-[10px] font-mono tracking-widest text-zinc-500 block uppercase font-bold border-b border-zinc-850 pb-2">
                  ■ 第一部分：屏内文本与布局信息 (Screen Text & Layout)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">主标题 (Main Title)</label>
                    <input 
                      type="text" 
                      value={currentScreen.title} 
                      onChange={(e) => updateScreenField(currentScreen.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">模块标志 (Label)</label>
                    <input 
                      type="text" 
                      value={currentScreen.label} 
                      onChange={(e) => updateScreenField(currentScreen.id, 'label', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">副标题 (Subtitle)</label>
                    <textarea 
                      value={currentScreen.subtitle} 
                      onChange={(e) => updateScreenField(currentScreen.id, 'subtitle', e.target.value)}
                      className="w-full h-16 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:border-amber-500/50 focus:outline-none font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">正文描叙 (Description)</label>
                    <textarea 
                      value={currentScreen.description} 
                      onChange={(e) => updateScreenField(currentScreen.id, 'description', e.target.value)}
                      className="w-full h-16 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:border-amber-500/50 focus:outline-none font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">副标题渐显延迟 (Subtitle Delay) - 秒</label>
                    <input 
                      type="number"
                      step="0.1"
                      min="0"
                      value={currentScreen.subtitleDelay || 0} 
                      onChange={(e) => updateScreenField(currentScreen.id, 'subtitleDelay', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">正文渐显延迟 (Description Delay) - 秒</label>
                    <input 
                      type="number"
                      step="0.1"
                      min="0"
                      value={currentScreen.descriptionDelay || 0} 
                      onChange={(e) => updateScreenField(currentScreen.id, 'descriptionDelay', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">对齐方式 (Alignment)</label>
                    <select
                      value={currentScreen.align || 'left'}
                      onChange={(e) => updateScreenField(currentScreen.id, 'align', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:border-amber-500/50 focus:outline-none cursor-pointer"
                    >
                      <option value="left">左对齐 (Left)</option>
                      <option value="center">居中对齐 (Center)</option>
                      <option value="right">右对齐 (Right)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">行为按钮文本 (CTA Text)</label>
                    <input 
                      type="text" 
                      value={currentScreen.ctaText || ''} 
                      onChange={(e) => updateScreenField(currentScreen.id, 'ctaText', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">行为链接 (CTA Url)</label>
                    <input 
                      type="text" 
                      value={currentScreen.ctaUrl || ''} 
                      onChange={(e) => updateScreenField(currentScreen.id, 'ctaUrl', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: SCREEN BACKGROUND & GRAPHICS */}
              <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-5 space-y-4">
                <h3 className="text-[10px] font-mono tracking-widest text-zinc-500 block uppercase font-bold border-b border-zinc-850 pb-2">
                  ■ 第二部分：多端背景材质与音效配置 (Background layers & Music)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Desktop Background */}
                  <div className="space-y-3.5 bg-zinc-900/30 p-4 rounded-xl border border-zinc-850">
                    <span className="text-[10px] text-amber-400 font-mono tracking-wider block font-bold uppercase">🖥️ 桌面端背景设定</span>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-zinc-400 block font-bold">背景类型 (Desktop Type)</label>
                      <select
                        value={currentScreen.bgType}
                        onChange={(e) => updateScreenField(currentScreen.id, 'bgType', e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-white focus:outline-none cursor-pointer"
                      >
                        <option value="video">自定MP4视频流 (Video)</option>
                        <option value="image">静态画质图 (Image)</option>
                        <option value="gradient">网格渐变/纯色 (Gradient)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-zinc-400 block font-bold">背景资源链接/CSS (Desktop URL/Style)</label>
                      <input 
                        type="text" 
                        value={currentScreen.bgUrl} 
                        onChange={(e) => updateScreenField(currentScreen.id, 'bgUrl', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Mobile Background */}
                  <div className="space-y-3.5 bg-zinc-900/30 p-4 rounded-xl border border-zinc-850">
                    <span className="text-[10px] text-amber-400 font-mono tracking-wider block font-bold uppercase">📱 移动端自适应背景</span>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-zinc-400 block font-bold">背景类型 (Mobile Type)</label>
                      <select
                        value={currentScreen.bgTypeMobile || 'image'}
                        onChange={(e) => updateScreenField(currentScreen.id, 'bgTypeMobile', e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-white focus:outline-none cursor-pointer"
                      >
                        <option value="video">自定MP4视频流 (Video)</option>
                        <option value="image">静态画质图 (Image)</option>
                        <option value="gradient">网格渐变/纯色 (Gradient)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-zinc-400 block font-bold">背景资源链接/CSS (Mobile URL/Style)</label>
                      <input 
                        type="text" 
                        value={currentScreen.bgUrlMobile || ''} 
                        onChange={(e) => updateScreenField(currentScreen.id, 'bgUrlMobile', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">蒙层不透明度 (Overlay Opacity)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="100"
                        value={currentScreen.overlayOpacity ?? 50} 
                        onChange={(e) => updateScreenField(currentScreen.id, 'overlayOpacity', parseInt(e.target.value))}
                        className="flex-1 accent-amber-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs font-mono w-8 text-right">{currentScreen.overlayOpacity ?? 50}%</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">背景模糊度 (Overlay Blur)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="20"
                        value={currentScreen.overlayBlur ?? 0} 
                        onChange={(e) => updateScreenField(currentScreen.id, 'overlayBlur', parseInt(e.target.value))}
                        className="flex-1 accent-amber-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs font-mono w-8 text-right">{currentScreen.overlayBlur ?? 0}px</span>
                    </div>
                  </div>

                  <div className="sm:col-span-3 flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 my-1">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-200">🔊 使用背景视频原声 / Use Video Audio</span>
                      <span className="text-[10px] text-zinc-500 leading-normal">勾选后将自动静音并替换此屏配置的主音频，直接播放背景 MP4 视频自带的音轨，避免音视频对不上的问题。</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={!!currentScreen.useVideoAudio}
                        onChange={(e) => updateScreenField(currentScreen.id, 'useVideoAudio', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">板块独立背景音乐 - PC端 (BGM URL - PC)</label>
                    <input 
                      type="text" 
                      value={currentScreen.bgMusicUrl || ''} 
                      onChange={(e) => updateScreenField(currentScreen.id, 'bgMusicUrl', e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">移动端专属背景音乐 (Mobile BGM URL)</label>
                    <input 
                      type="text" 
                      value={currentScreen.mobileMusicUrl || ''} 
                      onChange={(e) => updateScreenField(currentScreen.id, 'mobileMusicUrl', e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: VOICE GUIDE & ASSISTANT SETTINGS */}
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="text-amber-400">🎙️</span>
                      <span>本屏专属语音讲解与虚拟助手 (Voice Guide & Avatar Assistant)</span>
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">配置此屏的悬浮讲解动图和讲解语音。点击动图可自动播放讲解语音，每一屏的内容完全独立。</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={!!currentScreen.guideEnabled}
                      onChange={(e) => updateScreenField(currentScreen.id, 'guideEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                </div>

                {currentScreen.guideEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">讲解语音音频链接 (Guide Audio URL)</label>
                      <input 
                        type="text" 
                        value={currentScreen.guideAudio || ''} 
                        onChange={(e) => updateScreenField(currentScreen.id, 'guideAudio', e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                        placeholder="https://... (建议使用 mp3 格式)"
                      />
                      <span className="text-[9.5px] text-zinc-500 block">点击悬浮动图时会播放此音频，支持输入任何有效的音频 MP3/WAV/AAC 链接。</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">空闲/默认状态动图 (Idle GIF URL)</label>
                      <input 
                        type="text" 
                        value={currentScreen.guideIdleGif || ''} 
                        onChange={(e) => updateScreenField(currentScreen.id, 'guideIdleGif', e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                        placeholder="https://... (留空则使用默认可爱机器人空闲动图)"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">播放/讲解中状态动图 (Active Speaking GIF URL)</label>
                      <input 
                        type="text" 
                        value={currentScreen.guideActiveGif || ''} 
                        onChange={(e) => updateScreenField(currentScreen.id, 'guideActiveGif', e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                        placeholder="https://... (留空则使用默认可爱机器人开口动图)"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">拖拽/跑步状态动图 (Dragging/Running GIF URL)</label>
                      <input 
                        type="text" 
                        value={currentScreen.guideDragGif || ''} 
                        onChange={(e) => updateScreenField(currentScreen.id, 'guideDragGif', e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                        placeholder="https://... (留空则使用默认可爱机器人跑步动图)"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-850">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-200">🔄 进入此屏时自动播放语音 (Auto-play voice on enter)</span>
                        <span className="text-[10px] text-zinc-500 leading-normal">开启后，用户在切到本屏时会自动触发播放讲解，无需手动点击。受浏览器安全限制，部分浏览器需要用户先前有任意点击交互。</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={!!currentScreen.guideAutoPlay}
                          onChange={(e) => updateScreenField(currentScreen.id, 'guideAutoPlay', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: SCREEN-ASSOCIATED CHILD DATA DIRECTLY ATTACHED (千万不能串!) */}
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-6">
                <div>
                  <h3 className="text-[10px] font-mono tracking-widest text-amber-400 block uppercase font-bold border-b border-zinc-800 pb-2">
                    ■ 第三部分：专属本屏控制卡片与组件列表 (Exclusive Screen Sub-Components)
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    以下内容、卡片和音频模组直接注入到 <strong>Screen 0{currentScreen.id}</strong> 页面模块中。在此处的修改会严格绑定该屏，绝对不会混淆或串到其他板块。
                  </p>
                </div>

                {/* =================================================================================
                 * ■ CHILD DATA: SCREEN 1 (PILLNAV ITEMS)
                 * ================================================================================= */}
                {currentScreen.id === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono tracking-wider text-zinc-400 block font-bold uppercase">首屏顶部圆柱药丸导航 (PillNav items)</span>
                      <button
                        onClick={async () => {
                          const newId = `nav_${Date.now()}`;
                          const newItem = { id: newId, label: '新导航链接', href: '#screen-1' };
                          setPillNavItems([...pillNavItems, newItem]);
                          setSelectedPillNavId(newId);
                        }}
                        className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        添加导航链接
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      <div className="md:col-span-5 border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/60 max-h-60 overflow-y-auto">
                        {pillNavItems.map((item) => (
                          <div 
                            key={item.id}
                            onClick={() => setSelectedPillNavId(item.id)}
                            className={`p-2.5 border-b border-zinc-850 text-xs cursor-pointer flex justify-between items-center transition-all ${
                              selectedPillNavId === item.id ? 'bg-amber-500/10 text-amber-300 font-semibold' : 'hover:bg-zinc-900 text-zinc-400'
                            }`}
                          >
                            <span>{item.label} ({item.href})</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPillNavItems(pillNavItems.filter(p => p.id !== item.id));
                                if (selectedPillNavId === item.id) setSelectedPillNavId(null);
                              }}
                              className="text-zinc-600 hover:text-red-400 p-1"
                              title="删除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="md:col-span-7 bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                        {selectedPillNavId ? (
                          (() => {
                            const activeNav = pillNavItems.find(p => p.id === selectedPillNavId);
                            if (!activeNav) return <span className="text-zinc-600 text-xs">选择一个链接进行编辑</span>;
                            return (
                              <div className="space-y-3">
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">编辑导航链接属性</span>
                                <div className="space-y-1.5">
                                  <label className="text-[9px] text-zinc-400">导航名称 (Label)</label>
                                  <input 
                                    type="text"
                                    value={activeNav.label}
                                    onChange={(e) => {
                                      setPillNavItems(pillNavItems.map(p => p.id === activeNav.id ? { ...p, label: e.target.value } : p));
                                    }}
                                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[9px] text-zinc-400">跳转锚点/链接 (Href Anchor)</label>
                                  <input 
                                    type="text"
                                    value={activeNav.href}
                                    onChange={(e) => {
                                      setPillNavItems(pillNavItems.map(p => p.id === activeNav.id ? { ...p, href: e.target.value } : p));
                                    }}
                                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-mono"
                                  />
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="h-full flex items-center justify-center text-zinc-600 text-xs p-6 border border-dashed border-zinc-800 rounded-lg">
                            点击左侧链接进行配置编辑，或点击右上方添加全新链接。
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* =================================================================================
                 * ■ CHILD DATA: SCREEN 2 (RELATIONSHIP CARDS - PDF DECODER VIEW)
                 * ================================================================================= */}
                {currentScreen.id === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono tracking-wider text-zinc-400 block font-bold uppercase">情感特征分析档案 (Relationship Cards / PDF files)</span>
                      <button
                        onClick={async () => {
                          const newId = `rel_${Date.now()}`;
                          const newCard: RelationshipCard = {
                            id: newId,
                            title: '新分析档案',
                            cat: '供需关系失衡',
                            desc: '深度解码特征属性描述。',
                            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
                            pdfUrl: '',
                            pdfPageImages: [],
                            imbalanceScore: 50,
                            notes: '',
                            lastUpdated: new Date().toLocaleDateString(),
                            audioModules: [],
                            colorType: 'blue'
                          };
                          setRelationshipCards([...relationshipCards, newCard]);
                          setSelectedRelCardId(newId);
                        }}
                        className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        添加新档案卡片
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      <div className="md:col-span-4 border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/60 max-h-96 overflow-y-auto">
                        {relationshipCards.map((card) => (
                          <div 
                            key={card.id}
                            onClick={() => setSelectedRelCardId(card.id)}
                            className={`p-3 border-b border-zinc-850 text-xs cursor-pointer flex justify-between items-center transition-all ${
                              selectedRelCardId === card.id ? 'bg-amber-500/10 text-amber-300 font-semibold border-l-2 border-amber-500' : 'hover:bg-zinc-900 text-zinc-400'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <span className="text-[9px] font-mono uppercase bg-zinc-850 text-zinc-500 px-1 py-0.5 rounded mr-1">
                                {card.colorType || 'blue'}
                              </span>
                              {card.title}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRelationshipCards(relationshipCards.filter(c => c.id !== card.id));
                                if (selectedRelCardId === card.id) setSelectedRelCardId(null);
                              }}
                              className="text-zinc-600 hover:text-red-400 p-1 shrink-0"
                              title="删除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="md:col-span-8 bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg overflow-y-auto max-h-[450px]">
                        {selectedRelCardId ? (
                          (() => {
                            const card = relationshipCards.find(c => c.id === selectedRelCardId);
                            if (!card) return <span className="text-zinc-600 text-xs">请选择卡片</span>;
                            return (
                              <div className="space-y-4">
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold border-b border-zinc-850 pb-1">
                                  编辑情感卡片 #{card.id}
                                </span>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] text-zinc-400 block font-bold">档案标题</label>
                                    <input 
                                      type="text"
                                      value={card.title}
                                      onChange={(e) => {
                                        setRelationshipCards(relationshipCards.map(c => c.id === card.id ? { ...c, title: e.target.value } : c));
                                      }}
                                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] text-zinc-400 block font-bold">分类标签</label>
                                    <input 
                                      type="text"
                                      value={card.cat}
                                      onChange={(e) => {
                                        setRelationshipCards(relationshipCards.map(c => c.id === card.id ? { ...c, cat: e.target.value } : c));
                                      }}
                                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[9px] text-zinc-400 block font-bold">档案背景封面图片 (Image URL)</label>
                                  <input 
                                    type="text"
                                    value={card.imageUrl}
                                    onChange={(e) => {
                                      setRelationshipCards(relationshipCards.map(c => c.id === card.id ? { ...c, imageUrl: e.target.value } : c));
                                    }}
                                    className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-mono"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] text-zinc-400 block font-bold">失衡深度系数 (0 - 100)</label>
                                    <input 
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={card.imbalanceScore}
                                      onChange={(e) => {
                                        setRelationshipCards(relationshipCards.map(c => c.id === card.id ? { ...c, imbalanceScore: parseInt(e.target.value) || 0 } : c));
                                      }}
                                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-mono"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] text-zinc-400 block font-bold">视觉色彩类型</label>
                                    <select
                                      value={card.colorType || 'blue'}
                                      onChange={(e) => {
                                        setRelationshipCards(relationshipCards.map(c => c.id === card.id ? { ...c, colorType: e.target.value } : c));
                                      }}
                                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                                    >
                                      <option value="blue">蓝色 (Blue / Cyan)</option>
                                      <option value="indigo">靛青 (Indigo / Purple)</option>
                                      <option value="amber">琥珀金 (Amber / Gold)</option>
                                      <option value="emerald">翡翠绿 (Emerald / Green)</option>
                                      <option value="red">绯红色 (Red / Crimson)</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[9px] text-zinc-400 block font-bold">情感解析文本 (Description)</label>
                                  <textarea 
                                    value={card.desc}
                                    onChange={(e) => {
                                      setRelationshipCards(relationshipCards.map(c => c.id === card.id ? { ...c, desc: e.target.value } : c));
                                    }}
                                    className="w-full h-16 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-sans"
                                  />
                                </div>

                                <div className="space-y-1.5 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850">
                                  <label className="text-[9px] text-amber-400 block font-bold uppercase">📂 PDF 深度自定解码器配置</label>
                                  <div className="space-y-2 mt-1">
                                    <div className="space-y-1">
                                      <span className="text-[9px] text-zinc-500">关联 PDF 文档地址:</span>
                                      <input 
                                        type="text"
                                        value={card.pdfUrl}
                                        onChange={(e) => {
                                          setRelationshipCards(relationshipCards.map(c => c.id === card.id ? { ...c, pdfUrl: e.target.value } : c));
                                        }}
                                        className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300 font-mono"
                                        placeholder="如: /public/relationship.pdf"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[9px] text-zinc-500">PDF 分页解析渲染图 (每行一个图片 URL):</span>
                                      <textarea 
                                        value={(card.pdfPageImages || []).join('\n')}
                                        onChange={(e) => {
                                          const urls = e.target.value.split('\n').map(u => u.trim()).filter(Boolean);
                                          setRelationshipCards(relationshipCards.map(c => c.id === card.id ? { ...c, pdfPageImages: urls } : c));
                                        }}
                                        className="w-full h-20 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300 font-mono"
                                        placeholder="贴入图片链接，一行一个..."
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="h-full flex items-center justify-center text-zinc-600 text-xs p-6 border border-dashed border-zinc-800 rounded-lg">
                            点击左侧卡片档案进行详细属性修改。
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* =================================================================================
                 * ■ CHILD DATA: SCREEN 3 (MARQUEE CARDS)
                 * ================================================================================= */}
                {currentScreen.id === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Upper Category Creator */}
                    <div className="p-5 bg-zinc-950/60 border border-zinc-850 rounded-2xl space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                        <div className="flex items-center gap-2">
                          <FolderPlus className="w-5 h-5 text-amber-500 animate-pulse" />
                          <span className="text-xs font-mono tracking-wider text-amber-400 font-bold uppercase">
                            第三屏分类管理中心 (Category Management)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">
                          已建分类: {screen3Tabs.length} 个
                        </span>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1">
                          <input
                            id="new-category-input-screen3"
                            type="text"
                            placeholder="输入要创建的分类名称（例如：HARDWARE ENGINE、OPTIMIZER）..."
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-sans"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = e.currentTarget.value.trim();
                                if (val) {
                                  if (screen3Tabs.includes(val)) {
                                    alert("该分类已存在！");
                                  } else {
                                    setScreen3Tabs([...screen3Tabs, val]);
                                    e.currentTarget.value = '';
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            const input = document.getElementById('new-category-input-screen3') as HTMLInputElement;
                            const val = input?.value.trim();
                            if (val) {
                              if (screen3Tabs.includes(val)) {
                                alert("该分类已存在！");
                              } else {
                                setScreen3Tabs([...screen3Tabs, val]);
                                if (input) input.value = '';
                              }
                            } else {
                              alert("请输入分类名称！");
                            }
                          }}
                          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                          <span>创建新分类 / Add Category</span>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-zinc-950/40 rounded-xl border border-zinc-850 mt-3">
                        <span className="text-xs text-zinc-400 font-bold">标签容器背景色 (Tab Bg Color)</span>
                        <input type="color" value={screen3TabsBg === 'transparent' ? '#000000' : screen3TabsBg} onChange={(e) => setScreen3TabsBg(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                      </div>
                      
                      <p className="text-\[11px\] text-zinc-400 leading-relaxed">
                        💡 <strong>操作指南：</strong>创建完上方的主题分类后，它将以独立的文件夹面板显示在下方。您可以直接在所属面板中<strong>添加并配置其专属的技术卡片</strong>，使整个后台结构更加清晰。
                      </p>
                    </div>

                    {/* Collapsible & Nested Category List */}
                    <div className="space-y-4">
                      {(() => {
                        // Gather uncategorized cards that don't belong to any tab
                        const uncategorizedCards = marqueeCards.filter(c => !screen3Tabs.includes(c.cat));
                        const allCategories = [...screen3Tabs];
                        if (uncategorizedCards.length > 0) {
                          allCategories.push("__uncategorized__");
                        }

                        if (allCategories.length === 0) {
                          return (
                            <div className="p-8 bg-zinc-950/20 border border-dashed border-zinc-800 rounded-2xl text-center space-y-3">
                              <Folder className="w-8 h-8 text-zinc-600 mx-auto" />
                              <div className="space-y-1">
                                <p className="text-xs text-zinc-400 font-bold">暂无任何分类内容</p>
                                <p className="text-[11px] text-zinc-500">请在上方输入框中添加第一个分类，开始整理卡片模块！</p>
                              </div>
                            </div>
                          );
                        }

                        return allCategories.map((catName) => {
                          const isUncategorized = catName === "__uncategorized__";
                          const displayName = isUncategorized ? "未分类 / 默认卡片" : catName;
                          const catCards = isUncategorized 
                            ? uncategorizedCards 
                            : marqueeCards.filter(c => c.cat === catName);
                          
                          const isCollapsed = !!collapsedScreen3Cats[catName];
                          
                          // Toggle collapse
                          const toggleCollapse = () => {
                            setCollapsedScreen3Cats(prev => ({
                              ...prev,
                              [catName]: !prev[catName]
                            }));
                          };

                          // Add card to this category
                          const addCardToCategory = () => {
                            const nextId = marqueeCards.length > 0 ? Math.max(...marqueeCards.map(c => c.id)) + 1 : 1;
                            const newCard: MarqueeCard = {
                              id: nextId,
                              title: `新${isUncategorized ? "默认" : catName}节点卡片`,
                              cat: isUncategorized ? (screen3Tabs[0] || '默认') : catName,
                              desc: '请在此输入该节点的具体技术原理或诊断介绍。',
                              url: '',
                              colorType: 'blue',
                              isLit: true
                            };
                            setMarqueeCards([...marqueeCards, newCard]);
                            setActiveScreen3CardId(nextId);
                            // Auto expand if collapsed
                            if (isCollapsed) {
                              setCollapsedScreen3Cats(prev => ({
                                ...prev,
                                [catName]: false
                              }));
                            }
                          };

                          return (
                            <div 
                              key={catName} 
                              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                                isUncategorized 
                                  ? 'bg-red-950/10 border-red-900/30' 
                                  : 'bg-zinc-950/40 border-zinc-850 hover:border-zinc-800'
                              }`}
                            >
                              {/* Category Header */}
                              <div className="flex items-center justify-between p-4 bg-zinc-950/85 border-b border-zinc-850 select-none">
                                <div 
                                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                                  onClick={toggleCollapse}
                                >
                                  <div className={`p-1.5 rounded-lg ${isUncategorized ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                    <Folder className="w-4 h-4" />
                                  </div>
                                  <div className="truncate">
                                    <h4 className="text-xs font-bold text-white tracking-wide font-sans flex items-center gap-2">
                                      <span>{displayName}</span>
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono font-normal">
                                        {catCards.length} 个技术节点
                                      </span>
                                    </h4>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 pl-4">
                                  {/* Rename Category (Skip if uncategorized) */}
                                  {!isUncategorized && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const newName = await customPrompt(`重命名分类“${catName}”：`, catName);
                                        if (newName && newName.trim() && newName.trim() !== catName) {
                                          const trimmed = newName.trim();
                                          if (screen3Tabs.includes(trimmed)) {
                                            alert("此名称已存在！");
                                            return;
                                          }
                                          // Update screen3Tabs
                                          setScreen3Tabs(screen3Tabs.map(t => t === catName ? trimmed : t));
                                          // Update cards with this category
                                          setMarqueeCards(marqueeCards.map(c => c.cat === catName ? { ...c, cat: trimmed } : c));
                                        }
                                      }}
                                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 text-[11px] font-medium transition-all"
                                      title="重命名该分类"
                                    >
                                      重命名
                                    </button>
                                  )}

                                  {/* Delete Category (Skip if uncategorized) */}
                                  {!isUncategorized && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (await customConfirm(`确定要删除分类“${catName}”吗？\n警告：删除后，该分类下的 ${catCards.length} 张卡片将自动归为“未分类”。`)) {
                                          setScreen3Tabs(screen3Tabs.filter(t => t !== catName));
                                        }
                                      }}
                                      className="p-1.5 bg-red-950/35 hover:bg-red-500 hover:text-zinc-950 text-red-400 rounded-lg border border-red-900/30 text-[11px] font-medium transition-all"
                                      title="删除该分类"
                                    >
                                      删除
                                    </button>
                                  )}

                                  {/* Collapse Toggle button */}
                                  <button
                                    type="button"
                                    onClick={toggleCollapse}
                                    className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 transition-all"
                                  >
                                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>

                              {/* Category Content */}
                              {!isCollapsed && (
                                <div className="p-4 space-y-4 bg-zinc-900/20">
                                  {/* Category Toolbar / Quick Add inside category */}
                                  <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-850">
                                    <span className="text-[10px] font-mono text-zinc-400">
                                      {displayName}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={addCardToCategory}
                                      className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500 hover:text-zinc-950 text-amber-400 font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
                                      <span>在此分类下直接添加节点</span>
                                    </button>
                                  </div>

                                  {/* Cards List in this category */}
                                  <div className="space-y-2.5">
                                    {catCards.length === 0 ? (
                                      <div className="py-6 text-center text-zinc-500 text-xs italic border border-dashed border-zinc-850 rounded-xl">
                                        暂无属于该分类的内容，请点击上方按钮添加。
                                      </div>
                                    ) : (
                                      catCards.map((card) => {
                                        const isCardActive = activeScreen3CardId === card.id;

                                        // Update card logic
                                        const updateCardFieldLocal = (fields: Partial<MarqueeCard>) => {
                                          setMarqueeCards(marqueeCards.map(c => c.id === card.id ? { ...c, ...fields } : c));
                                        };

                                        // Delete card logic
                                        const deleteCardLocal = async () => {
                                          if (await customConfirm(`确定要删除技术节点“${card.title}”吗？`)) {
                                            setMarqueeCards(marqueeCards.filter(c => c.id !== card.id));
                                            if (isCardActive) setActiveScreen3CardId(null);
                                          }
                                        };

                                        return (
                                          <div 
                                            key={card.id}
                                            className={`border rounded-xl transition-all duration-300 ${
                                              isCardActive 
                                                ? 'bg-zinc-950 border-amber-500/50 shadow-lg shadow-amber-500/[0.03]' 
                                                : 'bg-zinc-950/30 border-zinc-850 hover:bg-zinc-950/60 hover:border-zinc-800'
                                            }`}
                                          >
                                            {/* Card row header */}
                                            <div className="flex items-center justify-between p-3 select-none">
                                              <div 
                                                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                                                onClick={() => setActiveScreen3CardId(isCardActive ? null : card.id)}
                                              >
                                                {/* Color Type dot indicator */}
                                                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                                  card.colorType === 'emerald' ? 'bg-emerald-500' :
                                                  card.colorType === 'amber' ? 'bg-amber-500' :
                                                  card.colorType === 'red' ? 'bg-red-500' :
                                                  card.colorType === 'purple' ? 'bg-purple-500' : 'bg-blue-500'
                                                }`} />
                                                
                                                <div className="truncate flex-1">
                                                  <span className="text-xs font-bold text-white block">
                                                    {card.title || <span className="text-zinc-500 italic">未命名卡片</span>}
                                                  </span>
                                                  <span className="text-[10px] text-zinc-400 block truncate mt-0.5">
                                                    {card.desc || "无描述..."}
                                                  </span>
                                                </div>

                                                {/* IsLit glow pill */}
                                                <div className="shrink-0 flex items-center gap-1.5">
                                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                                    card.isLit 
                                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                                  }`}>
                                                    {card.isLit ? 'GLOW/高亮' : 'OFF/普通'}
                                                  </span>
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-1.5 pl-3 shrink-0">
                                                {/* Edit Button */}
                                                <button
                                                  type="button"
                                                  onClick={() => setActiveScreen3CardId(isCardActive ? null : card.id)}
                                                  className={`p-1.5 rounded-lg border text-xs transition-all ${
                                                    isCardActive 
                                                      ? 'bg-amber-500 text-zinc-950 border-amber-500 font-extrabold' 
                                                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                                                  }`}
                                                >
                                                  {isCardActive ? '收起' : '编辑内容'}
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                  type="button"
                                                  onClick={deleteCardLocal}
                                                  className="p-1.5 bg-zinc-900 hover:bg-red-500 hover:text-zinc-950 text-zinc-400 border border-zinc-800 hover:border-red-500 rounded-lg transition-all"
                                                  title="删除此卡片"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </div>

                                            {/* Card row active fields */}
                                            {isCardActive && (
                                              <div className="p-4 border-t border-zinc-850 bg-zinc-950/85 rounded-b-xl space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  {/* Title */}
                                                  <div className="space-y-1.5">
                                                    <label className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
                                                      卡片标题 (Title)
                                                    </label>
                                                    <input 
                                                      type="text"
                                                      value={card.title}
                                                      onChange={(e) => updateCardFieldLocal({ title: e.target.value })}
                                                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:ring-1 focus:ring-amber-500/50 focus:outline-none"
                                                      placeholder="卡片主标题"
                                                    />
                                                  </div>

                                                  {/* Color Type */}
                                                  <div className="space-y-1.5">
                                                    <label className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
                                                      高亮颜色主题 (Color Theme)
                                                    </label>
                                                    <select
                                                      value={card.colorType || 'blue'}
                                                      onChange={(e) => updateCardFieldLocal({ colorType: e.target.value as any })}
                                                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:ring-1 focus:ring-amber-500/50 focus:outline-none"
                                                    >
                                                      <option value="blue">蓝色光束 (Blue)</option>
                                                      <option value="emerald">翠绿微芒 (Emerald)</option>
                                                      <option value="amber">琥珀金黄 (Amber)</option>
                                                      <option value="red">猩红预警 (Red)</option>
                                                      <option value="purple">量子幻紫 (Purple)</option>
                                                    </select>
                                                  </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  {/* Detail link URL */}
                                                  <div className="space-y-1.5">
                                                    <label className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
                                                      外部详情链接 (Details Link URL - 选填)
                                                    </label>
                                                    <input 
                                                      type="text"
                                                      value={card.url || ''}
                                                      onChange={(e) => updateCardFieldLocal({ url: e.target.value })}
                                                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:ring-1 focus:ring-amber-500/50 focus:outline-none font-mono"
                                                      placeholder="例：https://example.com/paper"
                                                    />
                                                  </div>

                                                  {/* Move Category */}
                                                  <div className="space-y-1.5">
                                                    <label className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
                                                      移动所属分类 (Move to Category)
                                                    </label>
                                                    <select
                                                      value={card.cat}
                                                      onChange={(e) => updateCardFieldLocal({ cat: e.target.value })}
                                                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:ring-1 focus:ring-amber-500/50 focus:outline-none"
                                                    >
                                                      {screen3Tabs.map((tabOpt, optIdx) => (
                                                        <option key={optIdx} value={tabOpt}>{tabOpt}</option>
                                                      ))}
                                                    </select>
                                                  </div>
                                                </div>

                                                {/* Description */}
                                                <div className="space-y-1.5">
                                                  <label className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
                                                    核心技术细节 / 详细描述 (Technical Details)
                                                  </label>
                                                  <textarea 
                                                    value={card.desc}
                                                    rows={3}
                                                    onChange={(e) => updateCardFieldLocal({ desc: e.target.value })}
                                                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:ring-1 focus:ring-amber-500/50 focus:outline-none resize-y leading-relaxed"
                                                    placeholder="请输入该节点的具体功能 and 技术原理，这会显示在卡片的详细视窗中..."
                                                  />
                                                </div>

                                                {/* isLit & glowEnabled Switches */}
                                                <div className="space-y-3 text-left">
                                                  {/* 1. isLit Toggle (卡片高亮) */}
                                                  <div className="flex items-center justify-between p-2.5 bg-zinc-900 rounded-xl border border-zinc-850">
                                                    <div className="space-y-0.5">
                                                      <span className="text-xs font-bold text-white block">卡片高亮 (Card Highlight)</span>
                                                      <span className="text-[10px] text-zinc-400 block">高亮显示该项，使其在前台处于亮色激活状态</span>
                                                    </div>
                                                    <button
                                                      type="button"
                                                      onClick={() => updateCardFieldLocal({ isLit: !card.isLit })}
                                                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                                                        card.isLit 
                                                          ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                                                          : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                                                      }`}
                                                    >
                                                      {card.isLit ? "已启用 HIGH-LIGHT" : "未启用 GRAYSCALE"}
                                                    </button>
                                                  </div>

                                                  {/* 2. glowEnabled Toggle (卡片流光), only visible if isLit is true */}
                                                  {card.isLit && (
                                                    <div className="space-y-3 p-2.5 bg-zinc-900/60 border border-zinc-850 rounded-xl">
                                                      <div className="flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                          <span className="text-xs font-bold text-white block">量子流发光特效 (Glow Effect / 卡片流光)</span>
                                                          <span className="text-[10px] text-zinc-400 block font-sans">启用炫酷边缘呼吸灯流光效果</span>
                                                        </div>
                                                        <button
                                                          type="button"
                                                          onClick={() => updateCardFieldLocal({ glowEnabled: card.glowEnabled === false ? true : false })}
                                                          className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                                                            card.glowEnabled !== false 
                                                              ? 'bg-blue-500 text-white font-extrabold shadow-[0_0_8px_rgba(59,130,246,0.4)]' 
                                                              : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                                                          }`}
                                                        >
                                                          {card.glowEnabled !== false ? "已启用 GLOWING" : "未启用 STATIC"}
                                                        </button>
                                                      </div>

                                                      {/* Glow Color Picker */}
                                                      {card.glowEnabled !== false && (
                                                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                                                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">流光颜色 / Glow Color</span>
                                                          <div className="flex items-center gap-2">
                                                            <input 
                                                              type="color" 
                                                              value={card.glowColor || "#fbbf24"}
                                                              onChange={(e) => updateCardFieldLocal({ glowColor: e.target.value })}
                                                              className="w-8 h-8 bg-zinc-950 border border-zinc-800 rounded cursor-pointer p-0"
                                                            />
                                                            <span className="text-xs font-mono text-zinc-400">{card.glowColor || "#fbbf24"}</span>
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* =================================================================================
                 * ■ CHILD DATA: SCREEN 4 (SPHERE CARDS)
                 * ================================================================================= */}
                {currentScreen.id === 4 && (
                  <CardListFormGroup 
                    title="3D 球体信息节点 (Sphere Matrix Cards)" 
                    cards={sphereCards} 
                    saveCards={setSphereCards} 
                    selectedId={selectedSphereCardId} 
                    setSelectedId={setSelectedSphereCardId} 
                  />
                )}

                {/* =================================================================================
                 * ■ CHILD DATA: SCREEN 5 (DOME CARDS)
                 * ================================================================================= */}
                {currentScreen.id === 5 && (
                  <CardListFormGroup 
                    title="3D 穹顶画廊单元 (Dome Gallery Cards)" 
                    cards={domeCards} 
                    saveCards={setDomeCards} 
                    selectedId={selectedDomeCardId} 
                    setSelectedId={setSelectedDomeCardId} 
                  />
                )}

                {/* =================================================================================
                 * ■ CHILD DATA: SCREEN 6 (TRIAL CARDS)
                 * ================================================================================= */}
                {currentScreen.id === 6 && (
                  <CardListFormGroup 
                    title="诊断控制流滑板组件 (Trial diagnostic Cards)" 
                    cards={trialCards} 
                    saveCards={setTrialCards} 
                    selectedId={selectedTrialCardId} 
                    setSelectedId={setSelectedTrialCardId} 
                    enableSubCards={true}
                  />
                )}

                {/* =================================================================================
                 * ■ CHILD DATA: SCREEN 7, 8, 9 (HARDCODED VIEWS METADATA NOTE)
                 * ================================================================================= */}
                {currentScreen.id === 7 && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Upper Category Creator */}
                    <div className="p-5 bg-zinc-950/60 border border-zinc-850 rounded-2xl space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                        <div className="flex items-center gap-2">
                          <FolderPlus className="w-5 h-5 text-amber-500 animate-pulse" />
                          <span className="text-xs font-mono tracking-wider text-amber-400 font-bold uppercase">
                            第七屏分类管理中心 (Category Management)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">
                          已建分类: {screen7Tabs.length} 个
                        </span>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1">
                          <input
                            id="new-category-input"
                            type="text"
                            placeholder="输入要创建的分类名称（例如：硬件设计、物理实验）..."
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-sans"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = e.currentTarget.value.trim();
                                if (val) {
                                  if (screen7Tabs.includes(val)) {
                                    alert("该分类已存在！");
                                  } else {
                                    setScreen7Tabs([...screen7Tabs, val]);
                                    e.currentTarget.value = '';
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            const input = document.getElementById('new-category-input') as HTMLInputElement;
                            const val = input?.value.trim();
                            if (val) {
                              if (screen7Tabs.includes(val)) {
                                alert("该分类已存在！");
                              } else {
                                setScreen7Tabs([...screen7Tabs, val]);
                                if (input) input.value = '';
                              }
                            } else {
                              alert("请输入分类名称！");
                            }
                          }}
                          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                          <span>创建新分类 / Add Category</span>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-zinc-950/40 rounded-xl border border-zinc-850 mt-3">
                        <span className="text-xs text-zinc-400 font-bold">标签容器背景色 (Tab Bg Color)</span>
                        <input type="color" value={screen7TabsBg === 'transparent' ? '#000000' : screen7TabsBg} onChange={(e) => setScreen7TabsBg(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                      </div>
                      
                      <p className="text-\[11px\] text-zinc-400 leading-relaxed">
                        💡 <strong>操作指南：</strong>创建完上方的主题分类后，它将以独立的文件夹面板显示在下方。您可以直接在所属面板中<strong>添加并配置其专属的技术卡片</strong>，使整个后台结构更加清晰。
                      </p>
                    </div>

                    {/* Collapsible & Nested Category List */}
                    <div className="space-y-4">
                      {(() => {
                        // Gather uncategorized cards that don't belong to any tab
                        const uncategorizedCards = screen7Cards.filter(c => !screen7Tabs.includes(c.cat));
                        const allCategories = [...screen7Tabs];
                        if (uncategorizedCards.length > 0) {
                          allCategories.push("__uncategorized__");
                        }

                        if (allCategories.length === 0) {
                          return (
                            <div className="p-8 bg-zinc-950/20 border border-dashed border-zinc-800 rounded-2xl text-center space-y-3">
                              <Folder className="w-8 h-8 text-zinc-600 mx-auto" />
                              <div className="space-y-1">
                                <p className="text-xs text-zinc-400 font-bold">暂无任何分类内容</p>
                                <p className="text-[11px] text-zinc-500">请在上方输入框中添加第一个分类，开始整理卡片模块！</p>
                              </div>
                            </div>
                          );
                        }

                        return allCategories.map((catName) => {
                          const isUncategorized = catName === "__uncategorized__";
                          const displayName = isUncategorized ? "未分类 / 默认卡片" : catName;
                          const catCards = isUncategorized 
                            ? uncategorizedCards 
                            : screen7Cards.filter(c => c.cat === catName);
                          
                          const isCollapsed = !!collapsedScreen7Cats[catName];
                          
                          // Toggle collapse
                          const toggleCollapse = () => {
                            setCollapsedScreen7Cats(prev => ({
                              ...prev,
                              [catName]: !prev[catName]
                            }));
                          };

                          // Add card to this category
                          const addCardToCategory = () => {
                            const nextId = screen7Cards.length > 0 ? Math.max(...screen7Cards.map(c => c.id)) + 1 : 1;
                            const newCard: MarqueeCard = {
                              id: nextId,
                              title: `新${isUncategorized ? "默认" : catName}节点卡片`,
                              cat: isUncategorized ? (screen7Tabs[0] || '默认') : catName,
                              desc: '请在此输入该节点的具体技术原理或诊断介绍。',
                              url: '',
                              colorType: 'blue',
                              isLit: true
                            };
                            setScreen7Cards([...screen7Cards, newCard]);
                            setActiveScreen7CardId(nextId);
                            // Auto expand if collapsed
                            if (isCollapsed) {
                              setCollapsedScreen7Cats(prev => ({
                                ...prev,
                                [catName]: false
                              }));
                            }
                          };

                          return (
                            <div 
                              key={catName} 
                              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                                isUncategorized 
                                  ? 'bg-red-950/10 border-red-900/30' 
                                  : 'bg-zinc-950/40 border-zinc-850 hover:border-zinc-800'
                              }`}
                            >
                              {/* Category Header */}
                              <div className="flex items-center justify-between p-4 bg-zinc-950/85 border-b border-zinc-850 select-none">
                                <div 
                                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                                  onClick={toggleCollapse}
                                >
                                  <div className={`p-1.5 rounded-lg ${isUncategorized ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                    <Folder className="w-4 h-4" />
                                  </div>
                                  <div className="truncate">
                                    <h4 className="text-xs font-bold text-white tracking-wide font-sans flex items-center gap-2">
                                      <span>{displayName}</span>
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono font-normal">
                                        {catCards.length} 个技术节点
                                      </span>
                                    </h4>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 pl-4">
                                  {/* Rename Category (Skip if uncategorized) */}
                                  {!isUncategorized && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const newName = await customPrompt(`重命名分类“${catName}”：`, catName);
                                        if (newName && newName.trim() && newName.trim() !== catName) {
                                          const trimmed = newName.trim();
                                          if (screen7Tabs.includes(trimmed)) {
                                            alert("此名称已存在！");
                                            return;
                                          }
                                          // Update screen7Tabs
                                          setScreen7Tabs(screen7Tabs.map(t => t === catName ? trimmed : t));
                                          // Update cards with this category
                                          setScreen7Cards(screen7Cards.map(c => c.cat === catName ? { ...c, cat: trimmed } : c));
                                        }
                                      }}
                                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 text-[11px] font-medium transition-all"
                                      title="重命名该分类"
                                    >
                                      重命名
                                    </button>
                                  )}

                                  {/* Delete Category (Skip if uncategorized) */}
                                  {!isUncategorized && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (await customConfirm(`确定要删除分类“${catName}”吗？\n警告：删除后，该分类下的 ${catCards.length} 张卡片将自动归为“未分类”。`)) {
                                          setScreen7Tabs(screen7Tabs.filter(t => t !== catName));
                                        }
                                      }}
                                      className="p-1.5 bg-red-950/35 hover:bg-red-500 hover:text-zinc-950 text-red-400 rounded-lg border border-red-900/30 text-[11px] font-medium transition-all"
                                      title="删除该分类"
                                    >
                                      删除
                                    </button>
                                  )}

                                  {/* Collapse Toggle button */}
                                  <button
                                    type="button"
                                    onClick={toggleCollapse}
                                    className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 transition-all"
                                  >
                                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>

                              {/* Category Content */}
                              {!isCollapsed && (
                                <div className="p-4 space-y-4 bg-zinc-900/20">
                                  {/* Category Toolbar / Quick Add inside category */}
                                  <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-850">
                                    <span className="text-[10px] font-mono text-zinc-400">
                                      {displayName}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={addCardToCategory}
                                      className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500 hover:text-zinc-950 text-amber-400 font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
                                      <span>在此分类下直接添加节点</span>
                                    </button>
                                  </div>

                                  {/* Cards List in this category */}
                                  <div className="space-y-2.5">
                                    {catCards.length === 0 ? (
                                      <div className="py-6 text-center text-zinc-500 text-xs italic border border-dashed border-zinc-850 rounded-xl">
                                        暂无属于该分类的内容，请点击上方按钮添加。
                                      </div>
                                    ) : (
                                      catCards.map((card) => {
                                        const isCardActive = activeScreen7CardId === card.id;

                                        // Update card logic
                                        const updateCardFieldLocal = (fields: Partial<MarqueeCard>) => {
                                          setScreen7Cards(screen7Cards.map(c => c.id === card.id ? { ...c, ...fields } : c));
                                        };

                                        // Delete card logic
                                        const deleteCardLocal = async () => {
                                          if (await customConfirm(`确定要删除技术节点“${card.title}”吗？`)) {
                                            setScreen7Cards(screen7Cards.filter(c => c.id !== card.id));
                                            if (isCardActive) setActiveScreen7CardId(null);
                                          }
                                        };

                                        return (
                                          <div 
                                            key={card.id}
                                            className={`border rounded-xl transition-all duration-300 ${
                                              isCardActive 
                                                ? 'bg-zinc-950 border-amber-500/50 shadow-lg shadow-amber-500/[0.03]' 
                                                : 'bg-zinc-950/30 border-zinc-850 hover:bg-zinc-950/60 hover:border-zinc-800'
                                            }`}
                                          >
                                            {/* Card row header */}
                                            <div className="flex items-center justify-between p-3 select-none">
                                              <div 
                                                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                                                onClick={() => setActiveScreen7CardId(isCardActive ? null : card.id)}
                                              >
                                                {/* Color Type dot indicator */}
                                                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                                  card.colorType === 'emerald' ? 'bg-emerald-500' :
                                                  card.colorType === 'amber' ? 'bg-amber-500' :
                                                  card.colorType === 'red' ? 'bg-red-500' :
                                                  card.colorType === 'purple' ? 'bg-purple-500' : 'bg-blue-500'
                                                }`} />
                                                
                                                <div className="truncate flex-1">
                                                  <span className="text-xs font-bold text-white block">
                                                    {card.title || <span className="text-zinc-500 italic">未命名卡片</span>}
                                                  </span>
                                                  <span className="text-[10px] text-zinc-400 block truncate mt-0.5">
                                                    {card.desc || "无描述..."}
                                                  </span>
                                                </div>

                                                {/* IsLit glow pill */}
                                                <div className="shrink-0 flex items-center gap-1.5">
                                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                                    card.isLit 
                                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                                  }`}>
                                                    {card.isLit ? 'GLOW/高亮' : 'OFF/普通'}
                                                  </span>
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-1.5 pl-3 shrink-0">
                                                {/* Edit Button */}
                                                <button
                                                  type="button"
                                                  onClick={() => setActiveScreen7CardId(isCardActive ? null : card.id)}
                                                  className={`p-1.5 rounded-lg border text-xs transition-all ${
                                                    isCardActive 
                                                      ? 'bg-amber-500 text-zinc-950 border-amber-500 font-extrabold' 
                                                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                                                  }`}
                                                >
                                                  {isCardActive ? '收起' : '编辑内容'}
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                  type="button"
                                                  onClick={deleteCardLocal}
                                                  className="p-1.5 bg-zinc-900 hover:bg-red-500 hover:text-zinc-950 text-zinc-400 border border-zinc-800 hover:border-red-500 rounded-lg transition-all"
                                                  title="删除此卡片"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </div>

                                            {/* Card row active fields */}
                                            {isCardActive && (
                                              <div className="p-4 border-t border-zinc-850 bg-zinc-950/85 rounded-b-xl space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  {/* Title */}
                                                  <div className="space-y-1.5">
                                                    <label className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
                                                      卡片标题 (Title)
                                                    </label>
                                                    <input 
                                                      type="text"
                                                      value={card.title}
                                                      onChange={(e) => updateCardFieldLocal({ title: e.target.value })}
                                                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:ring-1 focus:ring-amber-500/50 focus:outline-none"
                                                      placeholder="卡片主标题"
                                                    />
                                                  </div>

                                                  {/* Color Type */}
                                                  <div className="space-y-1.5">
                                                    <label className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
                                                      高亮颜色主题 (Color Theme)
                                                    </label>
                                                    <select
                                                      value={card.colorType || 'blue'}
                                                      onChange={(e) => updateCardFieldLocal({ colorType: e.target.value as any })}
                                                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:ring-1 focus:ring-amber-500/50 focus:outline-none"
                                                    >
                                                      <option value="blue">蓝色光束 (Blue)</option>
                                                      <option value="emerald">翠绿微芒 (Emerald)</option>
                                                      <option value="amber">琥珀金黄 (Amber)</option>
                                                      <option value="red">猩红预警 (Red)</option>
                                                      <option value="purple">量子幻紫 (Purple)</option>
                                                    </select>
                                                  </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  {/* Detail link URL */}
                                                  <div className="space-y-1.5">
                                                    <label className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
                                                      外部详情链接 (Details Link URL - 选填)
                                                    </label>
                                                    <input 
                                                      type="text"
                                                      value={card.url || ''}
                                                      onChange={(e) => updateCardFieldLocal({ url: e.target.value })}
                                                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:ring-1 focus:ring-amber-500/50 focus:outline-none font-mono"
                                                      placeholder="例：https://example.com/paper"
                                                    />
                                                  </div>

                                                  {/* Move Category */}
                                                  <div className="space-y-1.5">
                                                    <label className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
                                                      移动所属分类 (Move to Category)
                                                    </label>
                                                    <select
                                                      value={card.cat}
                                                      onChange={(e) => updateCardFieldLocal({ cat: e.target.value })}
                                                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:ring-1 focus:ring-amber-500/50 focus:outline-none"
                                                    >
                                                      {screen7Tabs.map((tabOpt, optIdx) => (
                                                        <option key={optIdx} value={tabOpt}>{tabOpt}</option>
                                                      ))}
                                                    </select>
                                                  </div>
                                                </div>

                                                {/* Description */}
                                                <div className="space-y-1.5">
                                                  <label className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
                                                    核心技术细节 / 详细描述 (Technical Details)
                                                  </label>
                                                  <textarea 
                                                    value={card.desc}
                                                    rows={3}
                                                    onChange={(e) => updateCardFieldLocal({ desc: e.target.value })}
                                                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:ring-1 focus:ring-amber-500/50 focus:outline-none resize-y leading-relaxed"
                                                    placeholder="请输入该节点的具体功能和技术原理，这会显示在卡片的详细视窗中..."
                                                  />
                                                </div>

                                                {/* isLit & glowEnabled Switches */}
                                                <div className="space-y-3 text-left">
                                                  {/* 1. isLit Toggle (卡片高亮) */}
                                                  <div className="flex items-center justify-between p-2.5 bg-zinc-900 rounded-xl border border-zinc-850">
                                                    <div className="space-y-0.5">
                                                      <span className="text-xs font-bold text-white block">卡片高亮 (Card Highlight)</span>
                                                      <span className="text-[10px] text-zinc-400 block">高亮显示该项，使其在前台处于亮色激活状态</span>
                                                    </div>
                                                    <button
                                                      type="button"
                                                      onClick={() => updateCardFieldLocal({ isLit: !card.isLit })}
                                                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                                                        card.isLit 
                                                          ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                                                          : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                                                      }`}
                                                    >
                                                      {card.isLit ? "已启用 HIGH-LIGHT" : "未启用 GRAYSCALE"}
                                                    </button>
                                                  </div>

                                                  {/* 2. glowEnabled Toggle (卡片流光), only visible if isLit is true */}
                                                  {card.isLit && (
                                                    <div className="space-y-3 p-2.5 bg-zinc-900/60 border border-zinc-850 rounded-xl">
                                                      <div className="flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                          <span className="text-xs font-bold text-white block">量子流发光特效 (Glow Effect / 卡片流光)</span>
                                                          <span className="text-[10px] text-zinc-400 block font-sans">启用炫酷边缘呼吸灯流光效果</span>
                                                        </div>
                                                        <button
                                                          type="button"
                                                          onClick={() => updateCardFieldLocal({ glowEnabled: card.glowEnabled === false ? true : false })}
                                                          className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                                                            card.glowEnabled !== false 
                                                              ? 'bg-blue-500 text-white font-extrabold shadow-[0_0_8px_rgba(59,130,246,0.4)]' 
                                                              : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                                                          }`}
                                                        >
                                                          {card.glowEnabled !== false ? "已启用 GLOWING" : "未启用 STATIC"}
                                                        </button>
                                                      </div>

                                                      {/* Glow Color Picker */}
                                                      {card.glowEnabled !== false && (
                                                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                                                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">流光颜色 / Glow Color</span>
                                                          <div className="flex items-center gap-2">
                                                            <input 
                                                              type="color" 
                                                              value={card.glowColor || "#fbbf24"}
                                                              onChange={(e) => updateCardFieldLocal({ glowColor: e.target.value })}
                                                              className="w-8 h-8 bg-zinc-950 border border-zinc-800 rounded cursor-pointer p-0"
                                                            />
                                                            <span className="text-xs font-mono text-zinc-400">{card.glowColor || "#fbbf24"}</span>
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}

                                                  {/* 3. checkInEnabled Toggle (卡片打卡功能) */}
                                                  <div className="flex items-center justify-between p-2.5 bg-zinc-900 rounded-xl border border-zinc-850">
                                                    <div className="space-y-0.5">
                                                      <span className="text-xs font-bold text-white block">每日打卡功能 (Check-in Calendar)</span>
                                                      <span className="text-[10px] text-zinc-400 block">开启该卡片专属的日历打卡与连续签到统计功能</span>
                                                    </div>
                                                    <button
                                                      type="button"
                                                      onClick={() => updateCardFieldLocal({ checkInEnabled: !card.checkInEnabled })}
                                                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                                                        card.checkInEnabled 
                                                          ? 'bg-emerald-500 text-zinc-950 font-extrabold shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                                                          : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                                                      }`}
                                                    >
                                                      {card.checkInEnabled ? "已开启 CHECK-IN" : "已关闭 DISABLED"}
                                                    </button>
                                                  </div>

                                                  {card.checkInEnabled && (
                                                    <div className="space-y-3 mt-3">
                                                      {/* 每日寄语编辑输入框 */}
                                                      <div className="space-y-1.5 p-3.5 bg-zinc-900 rounded-xl border border-zinc-850">
                                                        <div className="flex items-center justify-between mb-1">
                                                          <span className="text-[11px] font-bold text-white block">自定义每日寄语 (Daily Motivational Quote)</span>
                                                          <span className="text-[9px] text-zinc-500 font-mono">卡片专属文案</span>
                                                        </div>
                                                        <textarea
                                                          rows={3}
                                                          value={card.checkInQuote || ""}
                                                          onChange={(e) => updateCardFieldLocal({ checkInQuote: e.target.value })}
                                                          placeholder="在此输入当天的学习/打卡寄语。留空时，系统将智能根据打卡状态自动切换默认鼓励文案..."
                                                          className="w-full text-xs bg-zinc-950 text-white border border-zinc-800 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
                                                        />
                                                        <span className="text-[9.5px] text-zinc-400 block font-sans">
                                                          * 支持纯文本、中英文。编辑后将即时更新至该卡片的打卡详情弹窗中。
                                                        </span>
                                                      </div>

                                                      <CheckInCalendar 
                                                        cardId={card.id}
                                                        cardTitle={card.title}
                                                        checkInDates={card.checkInDates || []}
                                                        checkInQuote={card.checkInQuote}
                                                        onCheckInDatesChange={(newDates) => updateCardFieldLocal({ checkInDates: newDates })}
                                                        readOnly={false}
                                                      />
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
                
                {[8, 9].includes(currentScreen.id) && (
                  <div className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-lg text-xs space-y-1">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">板块提示</span>
                    <p className="text-zinc-400">
                      该屏幕内包含的图形要素（如全球时间表进度、路线图阶段，以及底部页脚和订阅表单）属于直接通过上方的 <strong>屏内文本与布局信息</strong> 所编辑的模块。修改上方的“主标题”、“副标题”和“正文描述”即可实现对这些图形区域文案的整体更新。
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Prompt Modal */}
      {promptState && promptState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white tracking-wide">提示 / Prompt</h3>
              <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">{promptState.message}</p>
            </div>
            <input
              type="text"
              id="custom-prompt-input-element"
              defaultValue={promptState.defaultValue}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.currentTarget as HTMLInputElement).value;
                  promptState.resolve(val);
                  setPromptState(null);
                } else if (e.key === 'Escape') {
                  promptState.resolve(null);
                  setPromptState(null);
                }
              }}
              autoFocus
            />
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  promptState.resolve(null);
                  setPromptState(null);
                }}
                className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-all cursor-pointer"
              >
                取消 / Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('custom-prompt-input-element') as HTMLInputElement;
                  promptState.resolve(el ? el.value : null);
                  setPromptState(null);
                }}
                className="px-4 py-2 text-xs font-bold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-all cursor-pointer"
              >
                确定 / OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirmState && confirmState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-850 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white tracking-wide">确认 / Confirm</h3>
              <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">{confirmState.message}</p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  confirmState.resolve(false);
                  setConfirmState(null);
                }}
                className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-all cursor-pointer"
              >
                取消 / Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmState.resolve(true);
                  setConfirmState(null);
                }}
                className="px-4 py-2 text-xs font-bold text-zinc-950 bg-red-500 hover:bg-red-400 rounded-lg transition-all cursor-pointer"
              >
                确定 / OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CardListProps {
  title: string;
  cards: MarqueeCard[];
  saveCards: React.Dispatch<React.SetStateAction<MarqueeCard[]>>;
  selectedId: number | null;
  setSelectedId: React.Dispatch<React.SetStateAction<number | null>>;
  enableSubCards?: boolean;
  availableCategories?: string[];
}

function CardListFormGroup({ title, cards, saveCards, selectedId, setSelectedId, enableSubCards, availableCategories }: CardListProps) {
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);
  const [selectedSubCardId, setSelectedSubCardId] = useState<string | null>(null);
  const [selectedSubAudioId, setSelectedSubAudioId] = useState<string | null>(null);

  const isDomeGallery = title.includes("穹顶") || title.includes("Dome");

  const addCard = () => {
    const nextId = cards.length > 0 ? Math.max(...cards.map(c => c.id)) + 1 : 1;
    const newCard: MarqueeCard = {
      id: nextId,
      title: '新模块卡片',
      cat: availableCategories && availableCategories.length > 0 ? availableCategories[0] : '诊断分类',
      desc: '请在这里配置卡片的详细介绍。',
      url: '',
      colorType: 'blue',
      isEncrypted: false,
      password: '',
      audioModules: []
    };
    saveCards([...cards, newCard]);
    setSelectedId(nextId);
  };

  const deleteCard = async (id: number) => {
    if (cards.length <= 1) {
      if (!window.confirm("这是最后一张卡片。删除它后该板块可能会显示为空（白屏）。您确定要删除最后一张卡片吗？")) {
        return;
      }
    }
    saveCards(cards.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateCardField = (id: number, field: keyof MarqueeCard, value: any) => {
    saveCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const activeCard = cards.find(c => c.id === selectedId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-wider text-zinc-400 block font-bold uppercase">{title}</span>
        <button
          onClick={addCard}
          className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          添加新卡片
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Card list on left */}
        <div className="md:col-span-4 border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/60 max-h-96 overflow-y-auto">
          {cards.map((card) => (
            <div 
              key={card.id}
              onClick={() => setSelectedId(card.id)}
              className={`p-3 border-b border-zinc-850 text-xs cursor-pointer flex justify-between items-center transition-all ${
                selectedId === card.id ? 'bg-amber-500/10 text-amber-300 font-semibold border-l-2 border-amber-500' : 'hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <div className="truncate pr-2">
                <span className="text-[9px] font-mono uppercase bg-zinc-850 text-zinc-500 px-1 py-0.5 rounded mr-1">
                  #{card.id}
                </span>
                {card.title}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCard(card.id);
                }}
                className="text-zinc-600 hover:text-red-400 p-1 shrink-0"
                title="删除"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Card form on right */}
        <div className="md:col-span-8 bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg overflow-y-auto max-h-[480px]">
          {activeCard ? (
            <div className="space-y-4">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold border-b border-zinc-850 pb-1">
                {isDomeGallery ? `编辑画廊图片属性 (ID: #${activeCard.id})` : `编辑卡片属性 (ID: #${activeCard.id})`}
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-400 block font-bold">{isDomeGallery ? "图片名称/标题" : "卡片名称/标题"}</label>
                  <input 
                    type="text"
                    value={activeCard.title}
                    onChange={(e) => updateCardField(activeCard.id, 'title', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-400 block font-bold">{isDomeGallery ? "所属分类/标签" : "分类标识 (Category)"}</label>
                  {availableCategories && availableCategories.length > 0 ? (
                    <select
                      value={activeCard.cat}
                      onChange={(e) => updateCardField(activeCard.id, 'cat', e.target.value)}
                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                    >
                      <option value="">-- 请选择分类 --</option>
                      {availableCategories.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      value={activeCard.cat}
                      onChange={(e) => updateCardField(activeCard.id, 'cat', e.target.value)}
                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-400 block font-bold">色彩风格类 (Color Style)</label>
                  <select
                    value={activeCard.colorType || 'blue'}
                    onChange={(e) => updateCardField(activeCard.id, 'colorType', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                  >
                    <option value="blue">经典科技蓝 (Blue)</option>
                    <option value="indigo">极客紫罗兰 (Indigo)</option>
                    <option value="amber">轻奢黄金 (Amber/Gold)</option>
                    <option value="emerald">智能翡翠绿 (Emerald)</option>
                    <option value="red">严峻绯红 (Red)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-400 block font-bold">关联链接地址 (URL)</label>
                  <input 
                    type="text"
                    value={activeCard.url || ''}
                    onChange={(e) => updateCardField(activeCard.id, 'url', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-zinc-400 block font-bold">
                  {isDomeGallery ? "画廊图片链接 (Image URL - 支持上传/任意比例大图自适应)" : "卡片图片/圈圈背景图片链接 (Image URL)"}
                </label>
                <input 
                  type="text"
                  value={activeCard.image || ''}
                  onChange={(e) => updateCardField(activeCard.id, 'image', e.target.value)}
                  placeholder={isDomeGallery ? "请输入画廊大图链接 (可使用您上传的链接，支持任意比例的长图、竖图、方形图等)" : "请输入图片链接 (如: https://images.unsplash.com/...)"}
                  className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-zinc-400 block font-bold">
                  {isDomeGallery ? "点击放大后蒙层显示的详细描述文字 (Description shown on Mask)" : "卡片简介 (Description)"}
                </label>
                <textarea 
                  value={activeCard.desc}
                  onChange={(e) => updateCardField(activeCard.id, 'desc', e.target.value)}
                  className="w-full h-14 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-sans"
                />
              </div>

              
              {/* Lit Status Toggle Block */}
              <div className="bg-zinc-950/40 p-3 rounded-lg border border-zinc-850 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-bold">✨ 卡片高亮状态 (Highlight Status)</span>
                    <span className="text-[9px] text-zinc-500 block">开关关闭状态下卡片为灰色，打开状态下为彩色高亮</span>
                  </div>
                  <button
                    onClick={() => updateCardField(activeCard.id, 'isLit', !activeCard.isLit)}
                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${
                      activeCard.isLit ? 'bg-amber-500' : 'bg-zinc-800'
                    }`}
                  >
                    <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                      activeCard.isLit ? 'translate-x-4' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Stream Glow Effect Block (Shows up only after isLit is true) */}
              {activeCard.isLit && (
                <div className="bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-800/80 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-450 block font-bold flex items-center gap-1.5" style={{ color: activeCard.glowColor || '#fbbf24' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ backgroundColor: activeCard.glowColor || '#fbbf24' }}></span>
                        💫 炫酷边缘流光特效 (Glow Border Light)
                      </span>
                      <span className="text-[9px] text-zinc-500 block">开启后，前台此卡片边缘将环绕运行一圈跑马灯炫光</span>
                    </div>

                    {/* Highly stylized cool glowing toggle button */}
                    <div className="relative p-[1.5px] rounded-lg overflow-hidden shrink-0 transition-transform hover:scale-[1.03]">
                      {activeCard.glowEnabled !== false && (
                        <div 
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: `conic-gradient(from 0deg, transparent 40%, ${activeCard.glowColor || '#fbbf24'} 100%)`,
                            animation: 'border-spin 2s linear infinite',
                            borderRadius: '8px',
                            scale: '1.4'
                          }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => updateCardField(activeCard.id, 'glowEnabled', activeCard.glowEnabled === false ? true : false)}
                        className={`relative px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          activeCard.glowEnabled !== false 
                            ? 'bg-zinc-950/90 text-white shadow-[0_0_10px_rgba(251,191,36,0.1)]' 
                            : 'bg-zinc-900/85 text-zinc-500 border border-zinc-800'
                        }`}
                      >
                        <span 
                          className={`w-2 h-2 rounded-full transition-all ${activeCard.glowEnabled !== false ? 'shadow-[0_0_8px_rgba(251,191,36,1)]' : 'bg-zinc-600'}`} 
                          style={{ backgroundColor: activeCard.glowEnabled !== false ? (activeCard.glowColor || '#fbbf24') : undefined }}
                        />
                        {activeCard.glowEnabled !== false ? '开启 (ON)' : '关闭 (OFF)'}
                      </button>
                    </div>
                  </div>

                  {/* Flow Light Color picker and hex input */}
                  {activeCard.glowEnabled !== false && (
                    <div className="pt-2.5 border-t border-zinc-900 flex items-center gap-2.5 animate-fade-in">
                      <div className="flex-1">
                        <span className="text-[8px] text-zinc-500 block font-bold uppercase mb-1">自定义跑马灯流光色值</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color"
                            value={activeCard.glowColor || '#fbbf24'}
                            onChange={(e) => updateCardField(activeCard.id, 'glowColor', e.target.value)}
                            className="w-7 h-7 rounded border border-zinc-800 bg-transparent cursor-pointer p-0.5 shrink-0"
                          />
                          <input 
                            type="text"
                            value={activeCard.glowColor || ''}
                            onChange={(e) => updateCardField(activeCard.id, 'glowColor', e.target.value)}
                            placeholder="#FBBF24"
                            className="w-full px-2 py-1 bg-zinc-950 border border-zinc-850 rounded text-xs font-mono text-zinc-350 focus:outline-none focus:border-amber-500/50"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateCardField(activeCard.id, 'glowColor', '#fbbf24')}
                        className="px-2 py-1 bg-zinc-900 text-zinc-500 hover:text-white rounded text-[8px] font-mono border border-zinc-800/80 mt-4 h-6 transition-colors"
                      >
                        默认色
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Encryption Protection Block */}
              <div className="bg-zinc-950/40 p-3 rounded-lg border border-zinc-850 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-bold">🔒 卡片安全密码访问保护 (Password Protected)</span>
                    <span className="text-[9px] text-zinc-500 block">如果启用，前台点击播放或访问时必须输入密码验证</span>
                  </div>
                  <button
                    onClick={() => updateCardField(activeCard.id, 'isEncrypted', !activeCard.isEncrypted)}
                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${
                      activeCard.isEncrypted ? 'bg-amber-500' : 'bg-zinc-800'
                    }`}
                  >
                    <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                      activeCard.isEncrypted ? 'translate-x-4' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {activeCard.isEncrypted && (
                  <div className="space-y-1.5 animate-fade-in pt-1 border-t border-zinc-900">
                    <label className="text-[9px] text-zinc-500 font-bold block uppercase">设置访问密码 (Set Password)</label>
                    <input 
                      type="text"
                      value={activeCard.password || ''}
                      onChange={(e) => updateCardField(activeCard.id, 'password', e.target.value)}
                      className="w-full max-w-xs px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-amber-300 font-mono"
                      placeholder="设置保护密码..."
                    />
                  </div>
                )}
              </div>

              {enableSubCards ? (
                /* Sub-cards (Months/Categories) Block */
                <div className="space-y-4 pt-2 border-t border-zinc-850">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-wider text-amber-400 block font-bold uppercase">📅 子分类/月份卡片管理 (Sub-cards / Months)</span>
                    <button
                      onClick={async () => {
                        const subCardsList = activeCard.subCards || [];
                        const nextSubId = `sub_${Date.now()}`;
                        const newSub = {
                          id: nextSubId,
                          title: '新子分类 (如: 7月份)',
                          desc: '在此子分类下配置专属的音频列表内容。',
                          audioModules: []
                        };
                        updateCardField(activeCard.id, 'subCards', [...subCardsList, newSub]);
                        setSelectedSubCardId(nextSubId);
                        setSelectedSubAudioId(null);
                      }}
                      className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 text-[10px] font-bold rounded cursor-pointer"
                    >
                      + 添加新月份/子分类
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Subcards list on left */}
                    <div className="md:col-span-4 border border-zinc-800 rounded bg-zinc-950/60 max-h-48 overflow-y-auto">
                      {(activeCard.subCards || []).length === 0 ? (
                        <div className="p-3 text-[11px] text-zinc-500 text-center font-sans">
                          暂无子分类，请点击上方按钮添加
                        </div>
                      ) : (
                        (activeCard.subCards || []).map((sub) => (
                          <div 
                            key={sub.id}
                            onClick={async () => {
                              setSelectedSubCardId(sub.id);
                              setSelectedSubAudioId(null);
                            }}
                            className={`p-2 border-b border-zinc-850 text-xs cursor-pointer flex justify-between items-center ${
                              selectedSubCardId === sub.id ? 'bg-amber-500/10 text-amber-300 font-semibold' : 'hover:bg-zinc-900 text-zinc-400'
                            }`}
                          >
                            <span className="truncate pr-1">{sub.title}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const subCardsList = activeCard.subCards || [];
                                updateCardField(activeCard.id, 'subCards', subCardsList.filter(s => s.id !== sub.id));
                                if (selectedSubCardId === sub.id) {
                                  setSelectedSubCardId(null);
                                  setSelectedSubAudioId(null);
                                }
                              }}
                              className="text-zinc-600 hover:text-red-400 p-0.5"
                              title="删除子分类"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Subcard editor on right */}
                    <div className="md:col-span-8 bg-zinc-950/40 p-3 rounded border border-zinc-800">
                      {selectedSubCardId ? (
                        (() => {
                          const subCardsList = activeCard.subCards || [];
                          const activeSub = subCardsList.find(s => s.id === selectedSubCardId);
                          if (!activeSub) return <div className="text-zinc-500 text-xs text-center py-4">分类不存在</div>;
                          return (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <span className="text-[9px] text-zinc-400 font-bold block uppercase">子分类/月份名称:</span>
                                  <input 
                                    type="text"
                                    value={activeSub.title}
                                    onChange={(e) => {
                                      const updated = subCardsList.map(s => s.id === activeSub.id ? { ...s, title: e.target.value } : s);
                                      updateCardField(activeCard.id, 'subCards', updated);
                                    }}
                                    className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[9px] text-zinc-400 font-bold block uppercase">子分类图片链接 (可选):</span>
                                  <input 
                                    type="text"
                                    value={activeSub.image || ''}
                                    onChange={(e) => {
                                      const updated = subCardsList.map(s => s.id === activeSub.id ? { ...s, image: e.target.value } : s);
                                      updateCardField(activeCard.id, 'subCards', updated);
                                    }}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-300 font-mono"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[9px] text-zinc-400 font-bold block uppercase">子分类简介 (可选):</span>
                                <input 
                                  type="text"
                                  value={activeSub.desc || ''}
                                  onChange={(e) => {
                                    const updated = subCardsList.map(s => s.id === activeSub.id ? { ...s, desc: e.target.value } : s);
                                    updateCardField(activeCard.id, 'subCards', updated);
                                  }}
                                  placeholder="关于该月份或子分类的简短说明"
                                  className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                                />
                              </div>

                              {/* Nested Audio Modules list for this specific subcard */}
                              <div className="pt-2 border-t border-zinc-900 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-mono tracking-wider text-amber-400 block font-bold uppercase">🔊 绑定子分类音频单元 ({activeSub.title})</span>
                                  <button
                                    onClick={async () => {
                                      const modules = activeSub.audioModules || [];
                                      const nextModId = `audio_${Date.now()}`;
                                      const newMod: AudioModule = {
                                        id: nextModId,
                                        name: '新音频单元',
                                        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                                        duration: '3:45',
                                        rating: 5,
                                        status: '启用',
                                        createdAt: new Date().toLocaleDateString(),
                                        updatedAt: new Date().toLocaleDateString(),
                                        user: 'Admin'
                                      };
                                      const updatedSubCards = subCardsList.map(s => s.id === activeSub.id ? { ...s, audioModules: [...modules, newMod] } : s);
                                      updateCardField(activeCard.id, 'subCards', updatedSubCards);
                                      setSelectedSubAudioId(nextModId);
                                    }}
                                    className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 text-[9px] font-bold rounded cursor-pointer"
                                  >
                                    + 添加子音频
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                  <div className="sm:col-span-5 border border-zinc-900 rounded bg-zinc-950/80 max-h-32 overflow-y-auto">
                                    {(activeSub.audioModules || []).map((mod) => (
                                      <div 
                                        key={mod.id}
                                        onClick={() => setSelectedSubAudioId(mod.id)}
                                        className={`p-1 border-b border-zinc-900 text-[10px] cursor-pointer flex justify-between items-center ${
                                          selectedSubAudioId === mod.id ? 'bg-amber-500/10 text-amber-300 font-semibold' : 'hover:bg-zinc-900 text-zinc-400'
                                        }`}
                                      >
                                        <span className="truncate pr-1">{mod.name}</span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const updatedMods = (activeSub.audioModules || []).filter(m => m.id !== mod.id);
                                            const updatedSubCards = subCardsList.map(s => s.id === activeSub.id ? { ...s, audioModules: updatedMods } : s);
                                            updateCardField(activeCard.id, 'subCards', updatedSubCards);
                                            if (selectedSubAudioId === mod.id) setSelectedSubAudioId(null);
                                          }}
                                          className="text-zinc-600 hover:text-red-400 p-0.5"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="sm:col-span-7 bg-zinc-950/90 p-2 rounded border border-zinc-900">
                                    {selectedSubAudioId ? (
                                      (() => {
                                        const modules = activeSub.audioModules || [];
                                        const activeMod = modules.find(m => m.id === selectedSubAudioId);
                                        if (!activeMod) return <span className="text-zinc-600 text-[9px]">请选择音频进行配置</span>;
                                        return (
                                          <div className="space-y-2 text-[11px]">
                                            <div className="space-y-0.5">
                                              <span className="text-[9px] text-zinc-500 font-bold block">音频名称:</span>
                                              <input 
                                                type="text"
                                                value={activeMod.name}
                                                onChange={(e) => {
                                                  const updatedMods = modules.map(m => m.id === activeMod.id ? { ...m, name: e.target.value } : m);
                                                  const updatedSubCards = subCardsList.map(s => s.id === activeSub.id ? { ...s, audioModules: updatedMods } : s);
                                                  updateCardField(activeCard.id, 'subCards', updatedSubCards);
                                                }}
                                                className="w-full px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                                              />
                                            </div>
                                            <div className="space-y-0.5">
                                              <span className="text-[9px] text-zinc-500 font-mono font-bold block">音频资源地址 (URL):</span>
                                              <input 
                                                type="text"
                                                value={activeMod.audioUrl}
                                                onChange={(e) => {
                                                  const updatedMods = modules.map(m => m.id === activeMod.id ? { ...m, audioUrl: e.target.value } : m);
                                                  const updatedSubCards = subCardsList.map(s => s.id === activeSub.id ? { ...s, audioModules: updatedMods } : s);
                                                  updateCardField(activeCard.id, 'subCards', updatedSubCards);
                                                }}
                                                className="w-full px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[9px] text-zinc-300 font-mono"
                                              />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div className="space-y-0.5">
                                                <span className="text-[9px] text-zinc-500 font-bold block">音频时长:</span>
                                                <input 
                                                  type="text"
                                                  value={activeMod.duration}
                                                  onChange={(e) => {
                                                    const updatedMods = modules.map(m => m.id === activeMod.id ? { ...m, duration: e.target.value } : m);
                                                    const updatedSubCards = subCardsList.map(s => s.id === activeSub.id ? { ...s, audioModules: updatedMods } : s);
                                                    updateCardField(activeCard.id, 'subCards', updatedSubCards);
                                                  }}
                                                  className="w-full px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white font-mono"
                                                />
                                              </div>
                                              <div className="space-y-0.5">
                                                <span className="text-[9px] text-zinc-500 font-bold block">发布状态:</span>
                                                <select
                                                  value={activeMod.status}
                                                  onChange={(e) => {
                                                    const updatedMods = modules.map(m => m.id === activeMod.id ? { ...m, status: e.target.value as any } : m);
                                                    const updatedSubCards = subCardsList.map(s => s.id === activeSub.id ? { ...s, audioModules: updatedMods } : s);
                                                    updateCardField(activeCard.id, 'subCards', updatedSubCards);
                                                  }}
                                                  className="w-full px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                                                >
                                                  <option value="启用">启用</option>
                                                  <option value="禁用">禁用</option>
                                                </select>
                                              </div>
                                            </div>
                                            <div className="space-y-0.5">
                                              <span className="text-[9px] text-zinc-500 font-bold block">音频描述与笔记 (Notes):</span>
                                              <textarea
                                                value={activeMod.desc || ''}
                                                onChange={(e) => {
                                                  const updatedMods = modules.map(m => m.id === activeMod.id ? { ...m, desc: e.target.value } : m);
                                                  const updatedSubCards = subCardsList.map(s => s.id === activeSub.id ? { ...s, audioModules: updatedMods } : s);
                                                  updateCardField(activeCard.id, 'subCards', updatedSubCards);
                                                }}
                                                className="w-full h-10 px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                                                placeholder="研读笔记等..."
                                              />
                                            </div>
                                          </div>
                                        );
                                      })()
                                    ) : (
                                      <div className="text-zinc-600 text-[10px] text-center py-6 font-mono">
                                        ← 请选择一个子音频进行编辑，或添加新音频
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="text-zinc-600 text-xs text-center py-10 font-mono">
                          ← 请选择左侧的一个月份/子分类进行编辑
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Regular Audio Modules Block */
                <div className="space-y-3 pt-2 border-t border-zinc-850">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-wider text-amber-400 block font-bold uppercase">🔊 绑定卡片音频单元 (Audio Modules)</span>
                    <button
                      onClick={async () => {
                        const modules = activeCard.audioModules || [];
                        const nextModId = `audio_${Date.now()}`;
                        const newMod: AudioModule = {
                          id: nextModId,
                          name: '新音频单元',
                          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                          duration: '3:45',
                          rating: 5,
                          status: '启用',
                          createdAt: new Date().toLocaleDateString(),
                          updatedAt: new Date().toLocaleDateString(),
                          user: 'Admin'
                        };
                        updateCardField(activeCard.id, 'audioModules', [...modules, newMod]);
                        setSelectedAudioId(nextModId);
                      }}
                      className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 text-[10px] font-bold rounded cursor-pointer"
                    >
                      + 添加音频
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-5 border border-zinc-800 rounded bg-zinc-950/60 max-h-32 overflow-y-auto">
                      {(activeCard.audioModules || []).map((mod) => (
                        <div 
                          key={mod.id}
                          onClick={() => setSelectedAudioId(mod.id)}
                          className={`p-1.5 border-b border-zinc-850 text-[11px] cursor-pointer flex justify-between items-center ${
                            selectedAudioId === mod.id ? 'bg-amber-500/10 text-amber-300 font-semibold' : 'hover:bg-zinc-900 text-zinc-400'
                          }`}
                        >
                          <span className="truncate pr-1">{mod.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const updatedMods = (activeCard.audioModules || []).filter(m => m.id !== mod.id);
                              updateCardField(activeCard.id, 'audioModules', updatedMods);
                              if (selectedAudioId === mod.id) setSelectedAudioId(null);
                            }}
                            className="text-zinc-600 hover:text-red-400 p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="sm:col-span-7 bg-zinc-950/50 p-2.5 rounded border border-zinc-800">
                      {selectedAudioId ? (
                        (() => {
                          const modules = activeCard.audioModules || [];
                          const activeMod = modules.find(m => m.id === selectedAudioId);
                          if (!activeMod) return <span className="text-zinc-600 text-[10px]">请选择音频进行配置</span>;
                          return (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <span className="text-[9px] text-zinc-500">音频名称:</span>
                                <input 
                                  type="text"
                                  value={activeMod.name}
                                  onChange={(e) => {
                                    const updated = modules.map(m => m.id === activeMod.id ? { ...m, name: e.target.value } : m);
                                    updateCardField(activeCard.id, 'audioModules', updated);
                                  }}
                                  className="w-full px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] text-zinc-500 font-mono">音频资源地址 (URL):</span>
                                <input 
                                  type="text"
                                  value={activeMod.audioUrl}
                                  onChange={(e) => {
                                    const updated = modules.map(m => m.id === activeMod.id ? { ...m, audioUrl: e.target.value } : m);
                                    updateCardField(activeCard.id, 'audioModules', updated);
                                  }}
                                  className="w-full px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-300 font-mono"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <span className="text-[9px] text-zinc-500">音频时长:</span>
                                  <input 
                                    type="text"
                                    value={activeMod.duration}
                                    onChange={(e) => {
                                      const updated = modules.map(m => m.id === activeMod.id ? { ...m, duration: e.target.value } : m);
                                      updateCardField(activeCard.id, 'audioModules', updated);
                                    }}
                                    className="w-full px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white font-mono"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[9px] text-zinc-500">发布状态:</span>
                                  <select
                                    value={activeMod.status}
                                    onChange={(e) => {
                                      const updated = modules.map(m => m.id === activeMod.id ? { ...m, status: e.target.value } : m);
                                      updateCardField(activeCard.id, 'audioModules', updated);
                                    }}
                                    className="w-full px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                                  >
                                    <option value="启用">启用 (Active)</option>
                                    <option value="禁用">禁用 (Disabled)</option>
                                  </select>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <span className="text-[9px] text-zinc-500">星级评分 (1-5):</span>
                                  <input 
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={activeMod.rating || 5}
                                    onChange={(e) => {
                                      const updated = modules.map(m => m.id === activeMod.id ? { ...m, rating: Number(e.target.value) } : m);
                                      updateCardField(activeCard.id, 'audioModules', updated);
                                    }}
                                    className="w-full px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[9px] text-zinc-500">上传者/用户:</span>
                                  <input 
                                    type="text"
                                    value={activeMod.user || 'Admin'}
                                    onChange={(e) => {
                                      const updated = modules.map(m => m.id === activeMod.id ? { ...m, user: e.target.value } : m);
                                      updateCardField(activeCard.id, 'audioModules', updated);
                                    }}
                                    className="w-full px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] text-zinc-500">音频描述与文字笔记 (Notes):</span>
                                <textarea
                                  value={activeMod.desc || ''}
                                  onChange={(e) => {
                                    const updated = modules.map(m => m.id === activeMod.id ? { ...m, desc: e.target.value, updatedAt: new Date().toLocaleDateString() } : m);
                                    updateCardField(activeCard.id, 'audioModules', updated);
                                  }}
                                  placeholder="输入该音频模块的研读笔记、音频描述或文字详情..."
                                  className="w-full h-16 px-1.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 resize-none scrollbar-thin"
                                />
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="h-full flex items-center justify-center text-zinc-600 text-[10px] text-center border border-dashed border-zinc-800 rounded p-4">
                          选择左侧列表中的音频以编辑音轨属性。
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-600 text-xs p-10 border border-dashed border-zinc-800 rounded-xl">
              请在左侧列表选择一张具体的卡片进行修改。
            </div>
          )}
        </div>
      </div>
    
      

    </div>
  );
}
