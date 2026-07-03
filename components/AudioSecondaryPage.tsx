import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, Music, Plus, Trash2, Play, Pause, Star, 
  Settings, Clock, User, Calendar, ExternalLink, RefreshCw,
  Search, SlidersHorizontal, LayoutGrid, List as ListIcon
} from 'lucide-react';
import { MarqueeCard } from '../src/cardData';

interface AudioModule {
  id: string;
  name: string;
  createdAt: string;
  status: '启用' | '禁用';
  updatedAt: string;
  user: string;
  audioUrl: string;
  duration: string;
  rating: number;
}

interface AudioSecondaryPageProps {
  isOpen: boolean;
  onClose: () => void;
  activeCard: MarqueeCard | null;
  onUpdateCard: (updatedCard: MarqueeCard) => void;
}

export const AudioSecondaryPage: React.FC<AudioSecondaryPageProps> = ({ 
  isOpen, 
  onClose, 
  activeCard,
  onUpdateCard
}) => {
  const [audioModules, setAudioModules] = useState<AudioModule[]>([]);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [activeAudioObj, setActiveAudioObj] = useState<HTMLAudioElement | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isControllerOpen, setIsControllerOpen] = useState(import.meta.env.DEV);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form states for adding new module
  const [newName, setNewName] = useState('');
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [newDuration, setNewDuration] = useState('02:30');
  const [newRating, setNewRating] = useState(5);

  useEffect(() => {
    if (activeCard) {
      setAudioModules(activeCard.audioModules || []);
    }
  }, [activeCard]);

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
      user: '管理员'
    };
    handleUpdate([...audioModules, newModule]);
    setNewName('');
    setNewAudioUrl('');
  };

  const handleDeleteModule = (id: string) => {
    if (playingAudioId === id && activeAudioObj) {
      activeAudioObj.pause();
      setPlayingAudioId(null);
    }
    handleUpdate(audioModules.filter(m => m.id !== id));
  };

  const handleTogglePlay = (mod: AudioModule) => {
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
      >
        {/* Header Section */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-white" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold tracking-tight uppercase">{activeCard.title}</h1>
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
                   {import.meta.env.DEV && (
                     <button 
                        onClick={() => setIsControllerOpen(!isControllerOpen)}
                        className={`md:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isControllerOpen ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'}`}
                     >
                        <Settings className="w-4 h-4" />
                        <span>{isControllerOpen ? '关闭控制' : '打开控制'}</span>
                     </button>
                   )}
                </div>

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
                        className={`group relative border transition-all duration-300 ${
                          viewMode === 'grid' 
                            ? 'bg-zinc-900/40 border-white/5 rounded-3xl p-6 hover:border-amber-500/30 hover:bg-zinc-900/60' 
                            : 'bg-zinc-900/40 border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-amber-500/30'
                        }`}
                      >
                         <div className={viewMode === 'grid' ? "space-y-4" : "flex items-center gap-6 flex-1"}>
                            <div className={viewMode === 'grid' ? "flex items-start justify-between" : "flex items-center gap-4 min-w-[240px]"}>
                               <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
                                  <Music className="w-5 h-5" />
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
                                此项内容独立控制卡片特征，包含音频链接及评分维度。删除此卡片时该子页数据将自动销毁。
                              </p>
                            )}

                            <div className={viewMode === 'grid' ? "flex items-center justify-between pt-2" : "flex items-center gap-4 ml-auto"}>
                               {import.meta.env.DEV && (
                                 <button 
                                    onClick={() => handleDeleteModule(mod.id)}
                                    className="p-2 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                               )}

                               <button 
                                  onClick={() => handleTogglePlay(mod)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    playingAudioId === mod.id 
                                      ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' 
                                      : 'bg-white/5 text-white hover:bg-white/10'
                                  }`}
                               >
                                  {playingAudioId === mod.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                  <span>{playingAudioId === mod.id ? 'PAUSE' : 'PLAY'}</span>
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
            {isControllerOpen && import.meta.env.DEV && (
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
                      </div>
                   </div>

                   {import.meta.env.DEV && (
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
