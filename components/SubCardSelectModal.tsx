import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ChevronRight, Music, ArrowRight, CirclePlay } from 'lucide-react';
import { MarqueeCard, SubCard } from '../src/cardData';

interface SubCardSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentCard: MarqueeCard | null;
  onSelectSubCard: (subCard: SubCard) => void;
}

export const SubCardSelectModal: React.FC<SubCardSelectModalProps> = ({
  isOpen,
  onClose,
  parentCard,
  onSelectSubCard,
}) => {
  if (!isOpen || !parentCard) return null;

  const subCards = parentCard.subCards || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-zinc-900/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10"
        >
          {/* Subtle glow background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

          {/* Header */}
          <div className="relative px-6 py-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-mono text-zinc-500 tracking-widest uppercase">子分类选择 / Subcategories</h3>
                <h2 className="text-lg font-bold text-white tracking-tight">{parentCard.title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subcard List Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            {subCards.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Music className="w-10 h-10 text-zinc-600 mx-auto stroke-[1.5]" />
                <p className="text-sm text-zinc-400 font-sans">该卡片暂无设置月份或子分类</p>
                <p className="text-xs text-zinc-600 font-mono">请在后台管理面板 (Admin) 中添加子分类与音频数据</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subCards.map((sub, idx) => {
                  const audioCount = sub.audioModules?.length || 0;
                  return (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => onSelectSubCard(sub)}
                      className="group relative bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-amber-500/30 p-5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between h-40 overflow-hidden"
                    >
                      {/* Subcard Background Image with overlay if available */}
                      {sub.image && (
                        <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-all duration-300">
                          <img
                            src={sub.image}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      <div className="relative z-10 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            {audioCount} TRACKS / {audioCount} 个音轨
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                          {sub.title}
                        </h4>
                        {sub.desc && (
                          <p className="text-xs text-zinc-400 font-sans line-clamp-2">
                            {sub.desc}
                          </p>
                        )}
                      </div>

                      <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase group-hover:text-zinc-300 transition-colors">
                          Explore / 进入研读
                        </span>
                        <div className="w-7 h-7 bg-white/5 border border-white/10 group-hover:bg-amber-500 group-hover:border-amber-400 group-hover:text-zinc-950 rounded-full flex items-center justify-center transition-all">
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="px-6 py-4 bg-zinc-950/40 border-t border-white/5 flex justify-between items-center text-[11px] text-zinc-500">
            <span className="font-mono">SELECT A MONTH OR GROUP TO LISTEN</span>
            <span className="font-sans">共 {subCards.length} 个分类区块</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
