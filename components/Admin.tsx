import React, { useState, useEffect } from 'react';
import { 
  Layers, Palette, Shield, Zap, ChevronLeft, ChevronRight, HelpCircle, 
  RefreshCw, CheckCircle, Database, AlertCircle, Play, Pause, Save, 
  Home, FileText, Globe, Cpu, Sliders, Music, Lock, Layout, ArrowRight, 
  Trash2, Plus, Edit3, Info, Eye, Upload, Video, Image as ImageIcon, AlertTriangle, Copy, Check
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
}

interface MarqueeCard {
  id: number;
  title: string;
  cat: string;
  desc: string;
  url: string;
  colorType?: string;
  isEncrypted?: boolean;
  password?: string;
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
  const [relationshipCards, setRelationshipCards] = useState<RelationshipCard[]>([]);

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
    } catch (err: any) {
      console.warn("API proxy load failed, fallback to local defaults...", err);
      importConfig(defaultUserData);
      showToast('拉取云端数据失败，已载入本地默认配置缓存。请检查您的网络连接！', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Helper to parse loaded data safely into states
  const importConfig = (data: any) => {
    if (data.version) setVersion(data.version);
    if (data.timestamp) setTimestamp(data.timestamp);
    if (Array.isArray(data.screens)) setScreens(data.screens);
    if (Array.isArray(data.pillNavItems)) setPillNavItems(data.pillNavItems);
    if (Array.isArray(data.marqueeCards)) setMarqueeCards(data.marqueeCards);
    if (Array.isArray(data.sphereCards)) setSphereCards(data.sphereCards);
    if (Array.isArray(data.domeCards)) setDomeCards(data.domeCards);
    if (Array.isArray(data.trialCards)) setTrialCards(data.trialCards);
    if (Array.isArray(data.relationshipCards)) setRelationshipCards(data.relationshipCards);
  };

  // Helper to construct the unified config object
  const exportConfig = () => {
    return {
      version,
      timestamp: new Date().toISOString(),
      screens,
      pillNavItems,
      marqueeCards,
      sphereCards,
      domeCards,
      trialCards,
      relationshipCards
    };
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
        showToast('保存并发布成功！客户端将在 3 秒内自动刷新呈现。', 'success');
        setSaving(false);
        return;
      }
      throw new Error("Proxy API returned error status: " + res.status);
    } catch (proxyErr: any) {
      console.error("API proxy save failed:", proxyErr);
      showToast('同步至云端失败: ' + (proxyErr.message || String(proxyErr)), 'error');
    }
    setSaving(false);
  };

  // Reset to static system defaults with confirmation
  const handleResetToDefault = async () => {
    if (window.confirm("确定要重置为系统默认配置吗？这会覆盖云端当前的修改。")) {
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
                      if (window.confirm("这会直接清除云端并重写本地自带的默认数据配置文件到云端，确定吗？")) {
                        setSaving(true);
                        try {
                          const res = await fetch('/api/config', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(defaultUserData)
                          });
                          if (res.ok) {
                            importConfig(defaultUserData);
                            showToast("已成功通过代理一键重置云端为系统原装数据！前台已实时刷新同步。", "success");
                          } else {
                            throw new Error("代理重写失败，状态码: " + res.status);
                          }
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
                    value={JSON.stringify(exportConfig(), null, 2)}
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
                    onClick={() => {
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
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">板块独立背景音乐 (BGM URL)</label>
                    <input 
                      type="text" 
                      value={currentScreen.bgMusicUrl || ''} 
                      onChange={(e) => updateScreenField(currentScreen.id, 'bgMusicUrl', e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                      placeholder="https://..."
                    />
                  </div>
                </div>
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
                        onClick={() => {
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
                        onClick={() => {
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
                  <CardListFormGroup 
                    title="递归大脑底层滚动单元 (Marquee Cards)" 
                    cards={marqueeCards} 
                    saveCards={setMarqueeCards} 
                    selectedId={selectedMarqueeCardId} 
                    setSelectedId={setSelectedMarqueeCardId} 
                  />
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
                  />
                )}

                {/* =================================================================================
                 * ■ CHILD DATA: SCREEN 7, 8, 9 (HARDCODED VIEWS METADATA NOTE)
                 * ================================================================================= */}
                {[7, 8, 9].includes(currentScreen.id) && (
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
    </div>
  );
}

// =================================================================================
// ■ INLINE FORM GROUP HELPER TO RENDER COMPLEX REUSABLE CARD COLLECTIONS
// =================================================================================
interface CardListProps {
  title: string;
  cards: MarqueeCard[];
  saveCards: React.Dispatch<React.SetStateAction<MarqueeCard[]>>;
  selectedId: number | null;
  setSelectedId: React.Dispatch<React.SetStateAction<number | null>>;
}

function CardListFormGroup({ title, cards, saveCards, selectedId, setSelectedId }: CardListProps) {
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);

  const addCard = () => {
    const nextId = cards.length > 0 ? Math.max(...cards.map(c => c.id)) + 1 : 1;
    const newCard: MarqueeCard = {
      id: nextId,
      title: '新模块卡片',
      cat: '诊断分类',
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

  const deleteCard = (id: number) => {
    if (cards.length <= 1) {
      alert("请保留至少一张卡片，以确保前台板块不白屏！");
      return;
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
                编辑卡片属性 (ID: #{activeCard.id})
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-400 block font-bold">卡片名称/标题</label>
                  <input 
                    type="text"
                    value={activeCard.title}
                    onChange={(e) => updateCardField(activeCard.id, 'title', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-400 block font-bold">分类标识 (Category)</label>
                  <input 
                    type="text"
                    value={activeCard.cat}
                    onChange={(e) => updateCardField(activeCard.id, 'cat', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                  />
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
                <label className="text-[9px] text-zinc-400 block font-bold">卡片简介 (Description)</label>
                <textarea 
                  value={activeCard.desc}
                  onChange={(e) => updateCardField(activeCard.id, 'desc', e.target.value)}
                  className="w-full h-14 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-sans"
                />
              </div>

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

              {/* Audio Modules Block */}
              <div className="space-y-3 pt-2 border-t border-zinc-850">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-wider text-amber-400 block font-bold uppercase">🔊 绑定卡片音频单元 (Audio Modules)</span>
                  <button
                    onClick={() => {
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
