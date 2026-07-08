import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, Music, Plus, Trash2, Play, Pause, Star, 
  Settings, Clock, User, Calendar, ExternalLink, RefreshCw,
  Search, SlidersHorizontal, LayoutGrid, List as ListIcon,
  Lock, Unlock, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { AudioModule } from '../types';
import { MarqueeCard } from '../src/cardData';

interface AudioSecondaryPageProps {
  isOpen: boolean;
  onClose: () => void;
  activeCard: MarqueeCard | null;
  onUpdateCard: (updatedCard: MarqueeCard) => void;
  isAiStudio?: boolean;
}

export const AudioSecondaryPage: React.FC<AudioSecondaryPageProps> = ({ 
  isOpen, 
  onClose, 
  activeCard,
  onUpdateCard,
  isAiStudio: isAiStudioProp
}) => {
  const isAiStudio = isAiStudioProp !== undefined ? isAiStudioProp : (
    typeof window !== 'undefined' && (
      window.location.hostname.includes('ais-dev-') || 
      window.location.hostname.includes('localhost') || 
      window.location.hostname.includes('127.0.0.1')
    )
  );
  const [audioModules, setAudioModules] = useState<AudioModule[]>([]);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [activeAudioObj, setActiveAudioObj] = useState<HTMLAudioElement | null>(null);
  
  // States for zooming/expanding card detail and editing its description text
  const [zoomedModule, setZoomedModule] = useState<AudioModule | null>(null);
  const [zoomedEditDesc, setZoomedEditDesc] = useState<string>('');
  const [isEditingZoomed, setIsEditingZoomed] = useState<boolean>(false);
  
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [isControllerOpen, setIsControllerOpen] = useState(!isMobile);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Encryption states
  const [isLocked, setIsLocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isPasswordError, setIsPasswordError] = useState(false);

  // Form states for adding new module
  const [newName, setNewName] = useState('');
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [newDuration, setNewDuration] = useState('02:30');
  const [newRating, setNewRating] = useState(5);
  const [newDesc, setNewDesc] = useState('');

  const touchStartRef = useRef<{ x: number, y: number } | null>(null);

  // Stop playing audio when component unmounts or activeAudioObj changes
  useEffect(() => {
    return () => {
      activeAudioObj?.pause();
    };
  }, [activeAudioObj]);

  // Reset lock state whenever the page is opened or the card changes
  useEffect(() => {
    if (isOpen && activeCard) {
      setAudioModules(activeCard.audioModules || []);
      
      // Always reset lock state based on card encryption
      if (activeCard.isEncrypted) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }
      
      // Clear password input and errors
      setPasswordInput('');
      setIsPasswordError(false);
    }
  }, [isOpen, activeCard]);

  if (!isOpen || !activeCard) return null;

  const handleUpdate = (updatedModules: AudioModule[]) => {
    setAudioModules(updatedModules);
    onUpdateCard({
      ...activeCard,
      audioModules: updatedModules
    });
  };

  const handleAddModule = () => {
    if (!newName.trim() || !newAudioUrl.trim()) {
      alert('请输入名称和音频链接');
      return;
    }
    const timestamp = new Date().toLocaleString();
    const newModule: AudioModule = {
      id: `mod-${Date.now()}`,
      name: newName,
      audioUrl: newAudioUrl,
      duration: newDuration,
      rating: newRating,
      status: '启用',
      createdAt: timestamp,
      updatedAt: timestamp,
      user: '管理员',
      desc: newDesc
    };
    handleUpdate([...audioModules, newModule]);
    setNewName('');
    setNewAudioUrl('');
    setNewDesc('');
  };

  const handleDeleteModule = (id: string) => {
    if (playingAudioId === id && activeAudioObj) {
      activeAudioObj.pause();
      setPlayingAudioId(null);
    }
    handleUpdate(audioModules.filter(m => m.id !== id));
  };

  const handleVerifyPassword = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (passwordInput === activeCard.password) {
      setIsLocked(false);
      setIsPasswordError(false);
    } else {
      setIsPasswordError(true);
      setTimeout(() => setIsPasswordError(false), 2000);
    }
  };

  const handleTogglePlay = (mod: AudioModule) => {
    if (isLocked) {
      return; // Do nothing if locked, though button is disabled/lock-styled
    }

    if (playingAudioId === mod.id) {
      activeAudioObj?.pause();
      setPlayingAudioId(null);
      setActiveAudioObj(null);
    } else {
      activeAudioObj?.pause();
      const audio = new Audio(mod.audioUrl);
      audio.play();
      setActiveAudioObj(audio);
      setPlayingAudioId(mod.id);
      audio.onended = () => {
        setPlayingAudioId(null);
        setActiveAudioObj(null);
      };
    }
  };

  const filteredModules = audioModules.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col text-white overflow-hidden"
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }
        }}
        onTouchEnd={(e) => {
          if (!touchStartRef.current || e.changedTouches.length !== 1) return;
          const start = touchStartRef.current;
          touchStartRef.current = null;
          const deltaX = e.changedTouches[0].clientX - start.x;
          const deltaY = e.changedTouches[0].clientY - start.y;
          
          const target = e.target as HTMLElement;
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('input[type="range"]')) {
            return;
          }

          if (deltaX > 80 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
            activeAudioObj?.pause();
            onClose();
          }
        }}
      >
        {/* Header Section */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                activeAudioObj?.pause();
                onClose();
              }}
              className="p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-white" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight uppercase">{activeCard.title}</h1>
                {activeCard.isEncrypted && (
                  <span className={`p-0.5 rounded ${isLocked ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">SECONDARY AUDIO MANAGEMENT</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="搜索音频..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs w-40 placeholder-zinc-600"
                />
             </div>
             <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                <button 
                   onClick={() => setViewMode('grid')}
                   className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                >
                   <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                   onClick={() => setViewMode('list')}
                   className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                >
                   <ListIcon className="w-4 h-4" />
                </button>
             </div>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-zinc-950">
             <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h2 className="text-2xl font-display font-bold">音频矩阵</h2>
                      <p className="text-sm text-zinc-500 mt-1">独立管理该卡片下的所有音频资源及反馈数据</p>
                   </div>
                   {!isMobile && isAiStudio && (
                     <button 
                        onClick={() => setIsControllerOpen(!isControllerOpen)}
                        className={`md:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isControllerOpen ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'}`}
                     >
                        <Settings className="w-4 h-4" />
                        <span>{isControllerOpen ? '关闭控制' : '打开控制'}</span>
                     </button>
                   )}
                </div>

                {/* Lock Overlay Content */}
                {isLocked && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 p-8 rounded-3xl bg-zinc-900/50 border border-amber-500/20 backdrop-blur-sm flex flex-col items-center text-center max-w-2xl mx-auto"
                  >
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                      <Lock className="w-8 h-8 text-amber-500 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">此页面内容已加密保护</h3>
                    <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                      该卡片包含受保护的音频资源。请输入访问密码以解锁完整的功能和播放权限。
                    </p>
                    
                    <form onSubmit={handleVerifyPassword} className="w-full max-w-sm flex items-center gap-2">
                      <div className="relative flex-1">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                          type="password" 
                          placeholder="输入访问密码..."
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          className={`w-full bg-zinc-950 border ${isPasswordError ? 'border-rose-500' : 'border-white/10'} rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-amber-500/50 transition-all`}
                        />
                      </div>
                      <button 
                        type="submit"
                        className="p-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-2xl transition-all active:scale-95 flex items-center justify-center"
                      >
                        <Unlock className="w-5 h-5" />
                      </button>
                    </form>
                    {isPasswordError && (
                      <motion.p 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="text-rose-500 text-[10px] font-mono mt-3 uppercase font-bold tracking-widest"
                      >
                        Invalid Password / 密码错误
                      </motion.p>
                    )}
                  </motion.div>
                )}

                {filteredModules.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                     <Music className="w-10 h-10 mb-4" />
                     <p className="text-sm font-mono uppercase tracking-widest">No Audio Modules Found</p>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                    : "flex flex-col gap-3"
                  }>
                    {filteredModules.map((mod) => (
                      <motion.div
                        layout
                        key={mod.id}
                        onClick={() => {
                          if (!isLocked) {
                            setZoomedModule(mod);
                            setZoomedEditDesc(mod.desc || '');
                            setIsEditingZoomed(false);
                          }
                        }}
                        className={`group relative border transition-all duration-300 cursor-pointer ${
                          viewMode === 'grid' 
                            ? 'bg-zinc-900/40 border-white/5 rounded-3xl p-6 hover:border-amber-500/30 hover:bg-zinc-900/60' 
                            : 'bg-zinc-900/40 border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-amber-500/30'
                        } ${isLocked ? 'grayscale opacity-60' : ''}`}
                      >
                         <div className={viewMode === 'grid' ? "space-y-4" : "flex items-center gap-6 flex-1"}>
                            <div className={viewMode === 'grid' ? "flex items-start justify-between" : "flex items-center gap-4 min-w-[240px]"}>
                               <div className={`p-3 rounded-2xl transition-transform ${isLocked ? 'bg-zinc-800 text-zinc-500' : 'bg-amber-500/10 text-amber-500 group-hover:scale-110'}`}>
                                  {isLocked ? <Lock className="w-5 h-5" /> : <Music className="w-5 h-5" />}
                               </div>
                               <div>
                                  <h4 className="font-bold text-base line-clamp-1">{mod.name}</h4>
                                  <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500 font-mono">
                                     <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {mod.duration}</span>
                                     <span className="flex items-center gap-1 text-amber-500/80"><Star className="w-3 h-3 fill-amber-500/20" /> {mod.rating} PTS</span>
                                  </div>
                               </div>
                            </div>

                            {viewMode === 'grid' && (
                              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                                {mod.desc ? mod.desc : (isLocked ? "此项内容当前处于加密状态，解锁后可查看详情并播放。" : "点击卡片可放大查看详情并编辑文字。此项内容独立控制卡片特征，包含音频链接及评分维度。")}
                              </p>
                            )}

                            <div className={viewMode === 'grid' ? "flex items-center justify-between pt-2" : "flex items-center gap-4 ml-auto"}>
                               <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }}
                                  className="p-2 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 z-10"
                                  title="Delete audio module"
                                >
                                  <Trash2 className="w-4 h-4" />
                               </button>

                               <button 
                                  onClick={(e) => { e.stopPropagation(); handleTogglePlay(mod); }}
                                  disabled={isLocked}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all z-10 ${
                                    isLocked 
                                      ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                      : playingAudioId === mod.id 
                                        ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' 
                                        : 'bg-white/5 text-white hover:bg-white/10'
                                  }`}
                               >
                                  {isLocked ? <Lock className="w-4 h-4" /> : playingAudioId === mod.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                  <span>{isLocked ? 'LOCKED' : playingAudioId === mod.id ? 'PAUSE' : 'PLAY'}</span>
                               </button>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                  </div>
                )}
             </div>
          </div>

          {/* Sidebar Controller */}
          <AnimatePresence>
            {isControllerOpen && isAiStudio && (
              <motion.aside
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                className="w-full md:w-80 border-l border-white/5 bg-zinc-950/80 backdrop-blur-xl flex flex-col fixed md:relative inset-0 md:inset-auto z-20"
              >
                <div className="p-6 flex-1 overflow-y-auto space-y-8">
                   <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                         <Settings className="w-5 h-5 text-amber-500" />
                         <span>二级页面控制器</span>
                      </h3>
                      <button 
                        onClick={() => setIsControllerOpen(false)}
                        className="md:hidden p-2 hover:bg-white/5 rounded-full"
                      >
                         <X className="w-5 h-5" />
                      </button>
                   </div>

                   <div className="space-y-4">
                      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-[10px] text-zinc-400 font-mono uppercase tracking-wider leading-relaxed">
                         Card ID: {activeCard.id}<br/>
                         Modules: {audioModules.length} Active<br/>
                         Status: Independent Page
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                         <div className="space-y-1.5">
                            <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest ml-1">音频名称</label>
                            <input 
                              type="text" 
                              placeholder="例如: 亲密关系录音 01"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                            />
                         </div>

                         <div className="space-y-1.5">
                            <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest ml-1">音频链接 (URL)</label>
                            <input 
                              type="text" 
                              placeholder="https://example.com/audio.mp3"
                              value={newAudioUrl}
                              onChange={(e) => setNewAudioUrl(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                            />
                         </div>

                         <div className="space-y-1.5">
                            <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest ml-1">音频描述 / 笔记 (Text Content)</label>
                            <textarea 
                              placeholder="输入此卡片放大后展示的文字笔记、论点或音频解读内容..."
                              value={newDesc}
                              onChange={(e) => setNewDesc(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors h-20 resize-none scrollbar-thin"
                            />
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                               <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest ml-1">时长</label>
                               <input 
                                 type="text" 
                                 placeholder="00:00"
                                 value={newDuration}
                                 onChange={(e) => setNewDuration(e.target.value)}
                                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors text-center"
                               />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest ml-1">评分</label>
                               <input 
                                 type="number" 
                                 min="1" 
                                 max="5"
                                 value={newRating}
                                 onChange={(e) => setNewRating(parseInt(e.target.value))}
                                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors text-center"
                               />
                            </div>
                         </div>

                         <button 
                           onClick={handleAddModule}
                           className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-2xl text-xs font-bold tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-amber-500/10"
                         >
                            <Plus className="w-4 h-4" />
                            <span>增加一条音频内容</span>
                         </button>

                         <button 
                           onClick={() => {
                              const dataToExport = {
                                ...activeCard,
                                audioModules: audioModules
                              };
                              navigator.clipboard.writeText(JSON.stringify(dataToExport, null, 2));
                              alert('数据已复制到剪贴板！请发送给 AI 以便部署到 Git。');
                           }}
                           className="w-full py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl text-xs font-bold tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                         >
                            <RefreshCw className="w-4 h-4" />
                            <span>复制全量数据 (部署用)</span>
                         </button>
                      </div>
                   </div>

                   {!isMobile && (
                     <div className="pt-6 border-t border-white/5">
                        <button 
                          onClick={() => {
                             if (window.confirm('确定要清空所有音频吗？')) handleUpdate([]);
                          }}
                          className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-rose-500 hover:border-rose-500/30 rounded-2xl text-[10px] font-bold tracking-widest flex items-center justify-center gap-2 transition-all"
                        >
                           <Trash2 className="w-3.5 h-3.5" />
                           <span>清空所有数据内容</span>
                        </button>
                     </div>
                   )}
                </div>

                <div className="p-6 border-t border-white/5 bg-zinc-900/20">
                   <p className="text-[10px] text-zinc-500 leading-relaxed font-sans italic">
                      提示：此二级管理页面为该卡片的独立沙盒。您在此处添加的每一条音频、时长和评分数据都将永久绑定于此卡片。
                   </p>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </main>

        {/* Zoomed/Expanded Module Card Details Overlay Modal */}
        <AnimatePresence>
          {zoomedModule && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-md z-[120] flex items-center justify-center p-4 pointer-events-auto"
              onClick={() => setZoomedModule(null)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative space-y-6 overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Decorative background glow based on rating */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4 relative z-10 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 shadow-lg shadow-amber-500/5">
                      <Music className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base font-display tracking-tight">音频详细维度卡片</h3>
                      <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">ID: {zoomedModule.id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setZoomedModule(null)}
                    className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body Scrollable Area */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-1 scrollbar-thin scrollbar-thumb-zinc-800 relative z-10">
                  
                  {/* Audio Name Display */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">AUDIO MODULE NAME / 模块名称</span>
                    <h4 className="text-xl font-extrabold text-white font-display tracking-tight leading-tight">{zoomedModule.name}</h4>
                  </div>

                  {/* Metadata Badges Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-zinc-950/40 p-4 rounded-2xl border border-zinc-850/60 font-sans">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block">Duration / 时长</span>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-200 font-medium">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{zoomedModule.duration}</span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block">Fidelity Score / 评分</span>
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < zoomedModule.rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-700'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-0.5 col-span-2 sm:col-span-1">
                      <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block">Created / 创建时间</span>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="truncate">{zoomedModule.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Audio Player Core Controller */}
                  <div className="hidden p-5 bg-gradient-to-br from-zinc-950 to-zinc-900 rounded-2xl border border-zinc-800/80 shadow-inner flex flex-col items-center gap-4">
                    
                    {/* Equalizer Waveform animation if playing */}
                    <div className="h-8 flex items-end gap-1.5 justify-center w-full max-w-[180px]">
                      {playingAudioId === zoomedModule.id ? (
                        [...Array(12)].map((_, i) => {
                          const delay = (i % 4) * 0.15;
                          return (
                            <motion.div 
                              key={i}
                              animate={{ height: [8, 32, 10, 24, 8] }}
                              transition={{ repeat: Infinity, duration: 1.2, delay: delay, ease: 'easeInOut' }}
                              className="w-1.5 bg-amber-500 rounded-full"
                            />
                          );
                        })
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 font-mono uppercase tracking-widest h-full">
                          <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-ping mr-1" />
                          <span>PLAYER STANDBY</span>
                        </div>
                      )}
                    </div>

                    {/* Large Circular Play Button */}
                    <button 
                      onClick={() => handleTogglePlay(zoomedModule)}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                        playingAudioId === zoomedModule.id 
                          ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95' 
                          : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95'
                      }`}
                    >
                      {playingAudioId === zoomedModule.id ? (
                        <Pause className="w-7 h-7" />
                      ) : (
                        <Play className="w-7 h-7 translate-x-0.5" />
                      )}
                    </button>

                    {/* Info & Duration status */}
                    <div className="text-center">
                      <span className="text-[10px] text-zinc-400 font-mono font-bold tracking-widest uppercase">
                        {playingAudioId === zoomedModule.id ? "NOW PLAYING / 正在播放" : "CLICK TO PLAY / 点击播放"}
                      </span>
                      {playingAudioId === zoomedModule.id && (
                        <p className="text-[9px] text-amber-500 font-mono mt-0.5">
                          STREAMING LIVE AUDIO FROM CLOUD STORAGE
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description / Edited text content section */}
                  <div className="space-y-2 border-t border-zinc-800/80 pt-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-bold">
                        音频描述与文字笔记 / Description & Notes
                      </span>
                      {!isEditingZoomed && (
                        <button
                          onClick={() => {
                            setZoomedEditDesc(zoomedModule.desc || '');
                            setIsEditingZoomed(true);
                          }}
                          className="hidden text-[11px] font-bold text-amber-500 hover:text-amber-400 transition-colors uppercase flex items-center gap-1 cursor-pointer bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
                        >
                          <span>Edit Notes / 编辑文字</span>
                        </button>
                      )}
                    </div>

                    {isEditingZoomed ? (
                      <div className="space-y-3">
                        <textarea
                          value={zoomedEditDesc}
                          onChange={(e) => setZoomedEditDesc(e.target.value)}
                          placeholder="在此输入、编辑或修改此卡片的文字内容、深度论文笔记或详细音频描述..."
                          className="w-full h-32 bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded-2xl p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors resize-none scrollbar-thin"
                        />
                        <div className="flex justify-end gap-2.5">
                          <button
                            onClick={() => setIsEditingZoomed(false)}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                          >
                            取消 (Cancel)
                          </button>
                          <button
                            onClick={() => {
                              const updatedModules = audioModules.map(m => 
                                m.id === zoomedModule.id ? { ...m, desc: zoomedEditDesc, updatedAt: new Date().toLocaleString() } : m
                              );
                              handleUpdate(updatedModules);
                              setZoomedModule({ ...zoomedModule, desc: zoomedEditDesc });
                              setIsEditingZoomed(false);
                            }}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                          >
                            保存修改 (Save Notes)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-850/80 text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap font-sans min-h-[80px] flex flex-col justify-between">
                        {zoomedModule.desc ? (
                          <span>{zoomedModule.desc}</span>
                        ) : (
                          <span className="text-zinc-600 italic">暂无文字内容。请点击右上角“编辑文字”按钮来添加研读笔记或文字详情。</span>
                        )}
                        <div className="text-[9px] text-zinc-500 font-mono mt-4 text-right">
                          LAST UPDATED / 上次更新: {zoomedModule.updatedAt || zoomedModule.createdAt}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

// Internal Helper
const ArrowLeft: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);
