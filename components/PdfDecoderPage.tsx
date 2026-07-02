import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  X, 
  ZoomIn, 
  Check, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  BookOpen, 
  AlertCircle, 
  Terminal, 
  Search, 
  Sparkles, 
  Plus, 
  Trash2, 
  Info, 
  ExternalLink,
  Edit,
  Heart,
  Sliders,
  FileDown,
  RefreshCw,
  ImageIcon,
  Maximize2,
  ArrowLeftRight,
  ArrowLeft,
  ArrowRight,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface RelationshipCard {
  id: string;
  title: string;
  cat: string;
  desc: string;
  imageUrl: string;
  pdfUrl: string;
  pdfPageImages?: string[]; // Array of pages extracted from PDF / uploaded by user
  imbalanceScore: number;
  notes: string;
  lastUpdated: string;
}

interface PdfDecoderPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_PDF_URL = "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/1.%E6%AD%A4%E4%B8%BA%E7%94%98%E9%A5%B4%EF%BC%8C%E5%BD%BC%E4%B9%8B%E8%8B%A6%E8%8D%AF%E2%80%94%E2%80%94%E2%80%94%E8%AE%BA%E4%B8%8D%E5%90%88%E9%80%82%E7%9A%84%E8%83%8C%E5%90%8E%E4%BA%B2%E5%AF%86%E5%85%B3%E7%B3%BB%E4%B8%AD%E6%83%85%E6%84%9F%E4%BE%9B%E9%9C%80%E7%9A%84%E7%BB%93%E6%9E%84%E6%80%A7%E5%A4%B1%E8%A1%A1%EF%BC%88WXJB-2663-001%EF%BC%89.pdf";

// Default curated PDF page screenshots/scans to make the experience extremely realistic and high-fidelity
const INITIAL_RELATIONSHIP_CARDS: RelationshipCard[] = [
  {
    id: 'rel-1',
    title: '此为甘露，彼之苦药',
    cat: '核心供需错位 / Misalignment',
    desc: '一方全力付出的温存关怀，对另一方却成为沉重的道德绑架与心理负累，探究“好意”转化为关系毒药的逆转机制。',
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop',
    pdfUrl: DEFAULT_PDF_URL,
    pdfPageImages: [
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop', // page 1: paper cover
      'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200&auto=format&fit=crop', // page 2: relationship grid
      'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1200&auto=format&fit=crop', // page 3: analysis model
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop'  // page 4: summary notes
    ],
    imbalanceScore: 88,
    notes: '论文深度阐述：付出者潜意识里带有极高的期待值，当接收者由于性格依恋类型（如回避型）无法给予等价情绪反馈时，关系迅速进入系统性失衡。付出作为一种债务，让对方窒息。',
    lastUpdated: '2026-07-01 10:00'
  },
  {
    id: 'rel-2',
    title: '焦虑型与回避型的依恋对抗',
    cat: '底层依恋动力 / Attachment',
    desc: '追逐与逃避的无限循环。深度剖析情感世界中最经典的结构性死锁——渴望融合的焦虑型与需要边界的回避型。',
    imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop',
    pdfUrl: DEFAULT_PDF_URL,
    pdfPageImages: [
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1200&auto=format&fit=crop', // page 1: attachment cycle
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop', // page 2: research stats
      'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop'  // page 3: interactive model
    ],
    imbalanceScore: 94,
    notes: '不合适的背后，是双方对“安全边界”的定义存在质的差异。这种失衡不是任何一方的刻意伤害，而是供需底座的结构性不兼容。一方越追，另一方越逃。',
    lastUpdated: '2026-07-01 10:15'
  },
  {
    id: 'rel-3',
    title: '隐性情感控制的虚妄',
    cat: '权利不对等 / Power Balance',
    desc: '付出作为一种微型筹码，在无形中争夺关系的主导权。当爱变成了一种不得不偿还的债务，逃离成为了唯一的解脱。',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop',
    pdfUrl: DEFAULT_PDF_URL,
    pdfPageImages: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop', // page 1: power dynamic
      'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200&auto=format&fit=crop'  // page 2: debt model
    ],
    imbalanceScore: 75,
    notes: '当情感倾注失去对等的倾听与适配，过度的、不契合的迎合反而窒息了交流通道，形成了微型权力高压。付出者把自己的牺牲当做至高无上的筹码。',
    lastUpdated: '2026-07-01 10:30'
  },
  {
    id: 'rel-4',
    title: '安全感逆差下的零和博弈',
    cat: '深层代偿机制 / Compensation',
    desc: '双方试图在对方身上填补童年或过往体验中遗留的匮乏感，最终将本应滋养彼此的避风港扭曲为不断透支能耗的战场。',
    imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=800&auto=format&fit=crop',
    pdfUrl: DEFAULT_PDF_URL,
    pdfPageImages: [
      'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop', // page 1: zero-sum balance
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200&auto=format&fit=crop'  // page 2: research spectrum
    ],
    imbalanceScore: 82,
    notes: '为了满足自我安全感，过度迎合或冷酷防御都是代偿行为。唯有认清结构失衡，才能从博弈走向成熟和解。本章深度剖析代偿心理解析。',
    lastUpdated: '2026-07-01 10:45'
  }
];

export const PdfDecoderPage: React.FC<PdfDecoderPageProps> = ({ isOpen, onClose }) => {
  const [cards, setCards] = useState<RelationshipCard[]>(() => {
    const saved = localStorage.getItem('relationship_pdf_cards_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(c => ({
            ...c,
            pdfUrl: DEFAULT_PDF_URL
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_RELATIONSHIP_CARDS;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<RelationshipCard | null>(null);
  
  // Current active page in the PDF Content Image slide show
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState<boolean>(false);

  // Mode Toggles for Interactive PDF Display
  const [workspaceMode, setWorkspaceMode] = useState<'image' | 'pdf'>('image');
  const [cardPdfMode, setCardPdfMode] = useState<Record<string, 'image' | 'pdf'>>({});

  // Card PDF Preview Loader States
  const [loadingPdfId, setLoadingPdfId] = useState<string | null>(null);
  const [loadedPdfIds, setLoadedPdfIds] = useState<Record<string, boolean>>({});
  const [pdfProgress, setPdfProgress] = useState<Record<string, number>>({});
  const [pdfStepText, setPdfStepText] = useState<Record<string, string>>({});
  const [cardActivePage, setCardActivePage] = useState<Record<string, number>>({});

  const handleLoadPdf = (cardId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (loadedPdfIds[cardId]) {
      // Toggle back to normal cover
      setLoadedPdfIds(prev => ({ ...prev, [cardId]: false }));
      return;
    }

    setLoadingPdfId(cardId);
    setPdfProgress(prev => ({ ...prev, [cardId]: 0 }));
    setPdfStepText(prev => ({ ...prev, [cardId]: '初始化学术数据流...' }));

    let currentProgress = 0;
    const steps = [
      { threshold: 25, text: '解析 PDF 数据包结构...' },
      { threshold: 50, text: '提取多尺度图表与文本...' },
      { threshold: 75, text: '重构供需平衡矢量图...' },
      { threshold: 90, text: '生成分页预览渲染...' },
      { threshold: 100, text: '解构就绪' }
    ];

    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 12) + 6;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setPdfProgress(prev => ({ ...prev, [cardId]: 100 }));
        setPdfStepText(prev => ({ ...prev, [cardId]: '加载完成' }));
        setLoadedPdfIds(prev => ({ ...prev, [cardId]: true }));
        setLoadingPdfId(null);
      } else {
        const step = steps.find(s => currentProgress <= s.threshold) || steps[steps.length - 1];
        setPdfProgress(prev => ({ ...prev, [cardId]: currentProgress }));
        setPdfStepText(prev => ({ ...prev, [cardId]: step.text }));
      }
    }, 120);
  };

  const handleCardPagePrev = (cardId: string, maxPages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardActivePage(prev => {
      const current = prev[cardId] || 0;
      const next = current === 0 ? maxPages - 1 : current - 1;
      return { ...prev, [cardId]: next };
    });
  };

  const handleCardPageNext = (cardId: string, maxPages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardActivePage(prev => {
      const current = prev[cardId] || 0;
      const next = current === maxPages - 1 ? 0 : current + 1;
      return { ...prev, [cardId]: next };
    });
  };

  // Edit fields temporary state
  const [editTitle, setEditTitle] = useState('');
  const [editCat, setEditCat] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editScore, setEditScore] = useState<number>(50);
  const [editPdfUrl, setEditPdfUrl] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editPdfPageImages, setEditPdfPageImages] = useState<string[]>([]);

  const cardCoverInputRef = useRef<HTMLInputElement>(null);
  const pdfPageInputRef = useRef<HTMLInputElement>(null);

  // Controller State
  const [controllerTitle, setControllerTitle] = useState('');
  const [controllerDesc, setControllerDesc] = useState('');
  const [controllerPdfUrl, setControllerPdfUrl] = useState('');
  const [isControllerMinimized, setIsControllerMinimized] = useState(false);

  // Save cards to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('relationship_pdf_cards_v2', JSON.stringify(cards));
  }, [cards]);

  // Handle setting temporary state when a card is selected
  const handleSelectCard = (card: RelationshipCard) => {
    setSelectedCard(card);
    setEditTitle(card.title);
    setEditCat(card.cat);
    setEditDesc(card.desc);
    setEditNotes(card.notes);
    setEditScore(card.imbalanceScore);
    setEditPdfUrl(card.pdfUrl);
    setEditImageUrl(card.imageUrl);
    
    // Support migrating cards that might have legacy formatting
    const pages = card.pdfPageImages && card.pdfPageImages.length > 0 
      ? card.pdfPageImages 
      : [card.imageUrl];
    setEditPdfPageImages(pages);
    setActivePageIndex(0);
  };

  // Controller Action: Add a new custom analysis card
  const handleCreateCustomCard = () => {
    if (!controllerTitle.trim()) {
      alert("请输入卡片标题 / Please enter a card title");
      return;
    }
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newCard: RelationshipCard = {
      id: `rel-${Date.now()}`,
      title: controllerTitle,
      cat: '自定义分析 / Custom',
      desc: controllerDesc || '自定义创建的情感供需分析卡片。',
      imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop',
      pdfUrl: controllerPdfUrl || DEFAULT_PDF_URL,
      pdfPageImages: [
        'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200&auto=format&fit=crop'
      ],
      imbalanceScore: 50,
      notes: '可编辑深度论文研读笔记或分析心得...',
      lastUpdated: timestamp
    };
    setCards(prev => [newCard, ...prev]);
    setControllerTitle('');
    setControllerDesc('');
    setControllerPdfUrl('');
  };

  // Quick Action: Remove selected or last card
  const handleDeleteCard = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCards(prev => prev.filter(c => c.id !== id));
    if (selectedCard?.id === id) {
      setSelectedCard(null);
    }
  };

  // Save modifications to the current selected card
  const handleSaveCard = () => {
    if (!selectedCard) return;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updatedCard: RelationshipCard = {
      ...selectedCard,
      title: editTitle,
      cat: editCat,
      desc: editDesc,
      notes: editNotes,
      imbalanceScore: editScore,
      pdfUrl: editPdfUrl,
      imageUrl: editImageUrl,
      pdfPageImages: editPdfPageImages,
      lastUpdated: timestamp
    };

    setCards(prev => prev.map(c => c.id === selectedCard.id ? updatedCard : c));
    setSelectedCard(updatedCard);
    alert('修改已成功保存并同步。');
  };

  // Handle local card cover image upload and converting to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择有效的图片文件 (JPG/PNG/WEBP)。');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setEditImageUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle local upload of a specific PDF content page
  const handlePdfPageImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择有效的图片文件 (JPG/PNG/WEBP)。');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setEditPdfPageImages(prev => {
          const updated = [...prev, dataUrl];
          setActivePageIndex(updated.length - 1); // Switch view to the newly added page
          return updated;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Delete a specific page image from the deck
  const handleDeletePageImage = (index: number) => {
    if (editPdfPageImages.length <= 1) {
      alert('每个卡片至少需要保留 1 页 PDF 内容图片以供翻页查阅。');
      return;
    }
    setEditPdfPageImages(prev => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (activePageIndex >= updated.length) {
        setActivePageIndex(updated.length - 1);
      }
      return updated;
    });
  };

  // Reorder page image
  const handleMovePageImage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === editPdfPageImages.length - 1) return;

    setEditPdfPageImages(prev => {
      const updated = [...prev];
      const swapIndex = direction === 'left' ? index - 1 : index + 1;
      const temp = updated[index];
      updated[index] = updated[swapIndex];
      updated[swapIndex] = temp;
      
      setActivePageIndex(swapIndex);
      return updated;
    });
  };

  // Navigate pages inside slider
  const handlePrevPage = () => {
    if (editPdfPageImages.length === 0) return;
    setActivePageIndex(prev => (prev === 0 ? editPdfPageImages.length - 1 : prev - 1));
  };

  const handleNextPage = () => {
    if (editPdfPageImages.length === 0) return;
    setActivePageIndex(prev => (prev === editPdfPageImages.length - 1 ? 0 : prev + 1));
  };

  // Listen to keyboard shortcuts for elegant left/right arrow sliding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCard) return;
      if (e.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        handleNextPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCard, editPdfPageImages]);

  const filteredCards = cards.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-zinc-950/95 backdrop-blur-2xl z-50 overflow-y-auto flex flex-col p-4 md:p-6 lg:p-8 select-text"
      >
        {/* Floating Draggable Controller */}
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-10 right-10 z-50 p-5 w-80 rounded-2xl border border-amber-500/40 bg-zinc-950/90 backdrop-blur-xl shadow-2xl flex flex-col cursor-move"
          style={{ touchAction: "none" }}
        >
          <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/20 text-amber-500 rounded-lg">
                <Settings className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-amber-500 text-sm tracking-wider">新增卡片控制器</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[10px] text-zinc-500 font-mono">拖动</div>
              <button 
                onPointerDown={e => e.stopPropagation()} 
                onClick={() => setIsControllerMinimized(!isControllerMinimized)}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title={isControllerMinimized ? "展开" : "最小化"}
              >
                {isControllerMinimized ? <ChevronUp className="w-4 h-4 pointer-events-none" /> : <ChevronDown className="w-4 h-4 pointer-events-none" />}
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {!isControllerMinimized && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden flex flex-col gap-4"
              >
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono mb-1 block">卡片标题 (Title)</label>
                    <input 
                      type="text" 
                      value={controllerTitle}
                      onChange={e => setControllerTitle(e.target.value)}
                      placeholder="例如: 依恋类型冲突"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 cursor-text"
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono mb-1 block">PDF 链接 (PDF URL)</label>
                    <input 
                      type="text" 
                      value={controllerPdfUrl}
                      onChange={e => setControllerPdfUrl(e.target.value)}
                      placeholder="https://... (.pdf 链接)"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 cursor-text"
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono mb-1 block">描述 (Description)</label>
                    <textarea 
                      value={controllerDesc}
                      onChange={e => setControllerDesc(e.target.value)}
                      placeholder="简单描述此维度的特征..."
                      rows={2}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 resize-none cursor-text"
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={handleCreateCustomCard}
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold font-display rounded-lg tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <Plus className="w-4 h-4 pointer-events-none" />
                      <span>新增分析卡片</span>
                    </button>
                    <button
                      onClick={() => {
                        setCards(INITIAL_RELATIONSHIP_CARDS);
                        localStorage.removeItem('relationship_pdf_cards_v2');
                        setSelectedCard(null);
                      }}
                      className="px-2.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-mono rounded-lg transition-all cursor-pointer"
                      title="重置到预设卡片"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <RefreshCw className="w-4 h-4 pointer-events-none" />
                    </button>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-zinc-800/50">
                    <div className="text-[10px] text-zinc-400 font-mono mb-2">已上传列表 (点击快速删除)</div>
                    <div className="max-h-64 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-zinc-800" onPointerDown={e => e.stopPropagation()}>
                      {cards.map(c => (
                        <div key={c.id} className="flex items-center justify-between gap-2 bg-zinc-900 border border-zinc-800/50 rounded p-1.5 cursor-default" onPointerDown={e => e.stopPropagation()}>
                          <span className="text-[10px] text-zinc-300 truncate w-40">{c.title}</span>
                          <button 
                            onPointerDown={(e) => { e.stopPropagation(); handleDeleteCard(c.id, e as any); }}
                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer bg-black/20 rounded relative z-50"
                            title="精准删除此条"
                          >
                            <Trash2 className="w-3 h-3 pointer-events-none" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Fullscreen Zoom Viewer for high-res PDF image reading */}
        {isFullscreenOpen && selectedCard && editPdfPageImages[activePageIndex] && (
          <div 
            className="fixed inset-0 bg-black/95 z-55 flex flex-col justify-between p-4"
            onClick={() => setIsFullscreenOpen(false)}
          >
            <div className="flex items-center justify-between text-white p-2">
              <span className="font-mono text-xs bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-amber-500">
                {selectedCard.title} • 第 {activePageIndex + 1} 页 / 共 {editPdfPageImages.length} 页
              </span>
              <button 
                onClick={() => setIsFullscreenOpen(false)}
                className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 border border-zinc-850 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 relative" onClick={(e) => e.stopPropagation()}>
              {/* Prev */}
              <button 
                onClick={handlePrevPage}
                className="absolute left-4 p-4 rounded-full bg-black/80 text-white border border-zinc-800 hover:bg-zinc-900 hover:scale-105 transition-all cursor-pointer z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              {/* PDF Content Page Image */}
              <img 
                src={editPdfPageImages[activePageIndex]} 
                alt={`PDF Content page ${activePageIndex + 1}`} 
                referrerPolicy="no-referrer"
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl border border-zinc-900/80"
              />

              {/* Next */}
              <button 
                onClick={handleNextPage}
                className="absolute right-4 p-4 rounded-full bg-black/80 text-white border border-zinc-800 hover:bg-zinc-900 hover:scale-105 transition-all cursor-pointer z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            <div className="text-center text-xs text-zinc-500 font-mono pb-2">
              点击空白区域或右上角关闭 [Esc] • 支持左右方向键切换
            </div>
          </div>
        )}


        {/* Main Workspace Centered at 1700px */}
        <div className="w-full max-w-[1700px] mx-auto flex-1 flex flex-col h-full">
          
          {/* Header Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-zinc-800/80 pb-6 mb-6 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="font-mono text-amber-500 text-xs tracking-wider font-bold uppercase">Relationship Ecology Analyzer</span>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-3 mt-1">
                甘露与苦药 • 亲密关系情感供需失衡解析看板
                <span className="hidden md:inline text-zinc-500 font-serif italic text-lg font-normal">/ Sweet Nectar & Bitter Medicine Decoder</span>
              </h1>
            </div>

            {/* Controller / Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="搜索分析卡片 (Search query)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <button
                onClick={onClose}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer shadow-lg"
              >
                返回主页 / BACK
              </button>
            </div>
          </div>



          {/* Main Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-stretch min-h-0">
            
            {/* Left Side: Cards Grid (span 6 or 12 depending on if a card is open) */}
            <div className={`${selectedCard ? 'lg:col-span-6' : 'lg:col-span-12'} flex flex-col gap-6`}>
              <div className="flex flex-col gap-4">
                {filteredCards.map((card) => {
                  return (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:bg-zinc-900/60 ${
                        selectedCard?.id === card.id 
                          ? 'bg-zinc-900/80 border-amber-500/50 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                          : 'bg-zinc-900/40 border-zinc-850/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20 mt-0.5 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <p className="text-xs text-zinc-400 font-mono font-semibold">{card.cat} / CATEGORY</p>
                          <h4 className="text-sm font-bold text-zinc-100 flex items-center flex-wrap gap-x-2">
                            <span className="truncate">{card.title}</span>
                            <a 
                              href={card.pdfUrl || DEFAULT_PDF_URL}
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 font-semibold underline decoration-dotted transition-colors shrink-0"
                              onClick={e => e.stopPropagation()}
                            >
                              <span>[直接下载原著]</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </h4>
                          {card.desc && (
                            <p className="text-xs text-zinc-500 max-w-2xl mt-1.5 line-clamp-2">
                              {card.desc}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 flex-wrap md:flex-nowrap">
                        <div className="px-3 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-[10px] font-mono text-zinc-500 text-left shrink-0">
                          失衡度: <span className={card.imbalanceScore >= 85 ? "text-red-400" : card.imbalanceScore >= 70 ? "text-amber-400" : "text-teal-400"}>{card.imbalanceScore}%</span>
                        </div>
                        <button 
                          onPointerDown={(e) => { e.stopPropagation(); handleDeleteCard(card.id, e as any); }} 
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                          title="删除此卡片"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Split View (PDF Reader Carousel + Custom Card Editor, span 6) */}
            {selectedCard && (
              <div className="lg:col-span-6 flex flex-col gap-5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-md animate-fadeIn">
                
                {/* Right Panel Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    <span className="font-mono text-xs text-zinc-300 font-bold uppercase">维度解构工作室 / Card Workspace</span>
                  </div>
                  <button 
                    onClick={() => setSelectedCard(null)}
                    className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                 {/* PDF Content Viewer Frame (Sliders showing Page Images from PDF or Live PDF Embed) */}
                <div className="space-y-3">
                  {/* View Mode Toggle Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-zinc-950/60 p-1.5 rounded-xl border border-zinc-850/80">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setWorkspaceMode('image')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          workspaceMode === 'image'
                            ? 'bg-amber-500 text-zinc-950 shadow-md scale-105'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>论文大纲解构图 ({editPdfPageImages.length} 页)</span>
                      </button>
                      <button
                        onClick={() => setWorkspaceMode('pdf')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          workspaceMode === 'pdf'
                            ? 'bg-amber-500 text-zinc-950 shadow-md scale-105'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>在线 PDF 原著阅读</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {workspaceMode === 'image' ? (
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900/80 px-2 py-1 border border-zinc-800 rounded">
                          第 {activePageIndex + 1} / {editPdfPageImages.length} 页
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 border border-emerald-500/20 rounded animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>极速原件嵌入中</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* High Quality Responsive Container Box */}
                  <div className="w-full h-96 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 relative group/slider flex items-center justify-center shadow-2xl">
                    {workspaceMode === 'pdf' ? (
                      /* Embed Interactive Live PDF document */
                      <iframe 
                        src={`${editPdfUrl || DEFAULT_PDF_URL}#toolbar=1`} 
                        className="w-full h-full border-0 bg-zinc-950"
                        title="Associated Academic PDF document"
                      />
                    ) : (
                      /* Original beautiful slideshow code */
                      <>
                        {/* Carousel Navigation: Left Arrow */}
                        <button 
                          onClick={handlePrevPage}
                          className="absolute left-3 p-2 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-750 text-white transition-all hover:scale-110 cursor-pointer z-10 opacity-60 group-hover/slider:opacity-100"
                          title="上一页"
                        >
                          <ChevronLeft className="w-5 h-5 text-amber-500" />
                        </button>

                        {/* PDF Page Image Container */}
                        <div 
                          className="w-full h-full p-4 flex items-center justify-center bg-zinc-950 cursor-zoom-in"
                          onClick={() => setIsFullscreenOpen(true)}
                          title="点击放大阅览全屏 PDF"
                        >
                          <AnimatePresence mode="wait">
                            <motion.img 
                              key={activePageIndex}
                              src={editPdfPageImages[activePageIndex] || editImageUrl}
                              alt={`PDF Page content index ${activePageIndex}`}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.2 }}
                              referrerPolicy="no-referrer"
                              className="max-h-full max-w-full object-contain rounded shadow-lg border border-zinc-900"
                            />
                          </AnimatePresence>
                        </div>

                        {/* Carousel Navigation: Right Arrow */}
                        <button 
                          onClick={handleNextPage}
                          className="absolute right-3 p-2 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-750 text-white transition-all hover:scale-110 cursor-pointer z-10 opacity-60 group-hover/slider:opacity-100"
                          title="下一页"
                        >
                          <ChevronRight className="w-5 h-5 text-amber-500" />
                        </button>

                        {/* Fullscreen icon */}
                        <button 
                          onClick={() => setIsFullscreenOpen(true)}
                          className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/75 border border-zinc-850 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title="全屏放大阅读 PDF / Zoom-In"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Hint overlay */}
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[9px] text-zinc-400 font-mono border border-zinc-850">
                          学术论文大纲图表
                        </div>
                      </>
                    )}
                  </div>

                  {workspaceMode === 'image' && (
                    /* Thumbnail pagination underneath for easy direct page jumping */
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {editPdfPageImages.map((imgUrl, idx) => {
                      const isActive = idx === activePageIndex;
                      return (
                        <button
                          key={idx}
                          onClick={() => setActivePageIndex(idx)}
                          className={`relative w-12 h-9 rounded overflow-hidden border shrink-0 transition-all cursor-pointer ${
                            isActive 
                              ? 'border-amber-500 scale-105 ring-1 ring-amber-500/20' 
                              : 'border-zinc-850 hover:border-zinc-700'
                          }`}
                        >
                          <img 
                            src={imgUrl} 
                            alt={`Thumb ${idx + 1}`} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className={`absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold ${isActive ? 'bg-amber-500/20 text-white' : 'bg-black/60 text-zinc-400'}`}>
                            P{idx + 1}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

                {/* Card Configuration & Editing Form */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-5 max-h-[45vh] scrollbar-thin scrollbar-thumb-zinc-800">
                  
                  {/* Category & Title */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 block">分析维度分类 Category / Tag</label>
                      <input 
                        type="text" 
                        value={editCat}
                        onChange={(e) => setEditCat(e.target.value)}
                        placeholder="e.g. 核心成因"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 block">维度分析标题 Title</label>
                      <input 
                        type="text" 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="e.g. 付出的权力高压"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs font-sans font-bold"
                      />
                    </div>
                  </div>

                  {/* Summary Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block">核心表现描述 Description (卡片正面文字)</label>
                    <textarea 
                      rows={2}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="简述该特征表现..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs leading-relaxed font-sans"
                    />
                  </div>

                  {/* Custom In-Depth Notes */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block">深度研读随笔与笔记 Notes (点击卡片查看的说明)</label>
                    <textarea 
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="结合论文具体段落撰写您的分析体会与批注..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs leading-relaxed font-sans"
                    />
                  </div>

                  {/* PDF Content Pages Management Area */}
                  <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] text-zinc-300 uppercase font-bold font-mono">
                          PDF 内容翻页图片管理 (PDF Slides Deck)
                        </span>
                      </div>
                      <span className="text-[9px] text-zinc-500">共 {editPdfPageImages.length} 页</span>
                    </div>

                    {/* Interactive list of page images */}
                    <div className="space-y-2">
                      {editPdfPageImages.map((pageImg, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-850 hover:border-zinc-800 transition-colors gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[10px] font-mono font-bold text-zinc-500">P{idx + 1}</span>
                            <img 
                              src={pageImg} 
                              alt={`Page index ${idx}`} 
                              referrerPolicy="no-referrer"
                              className="w-10 h-7 object-cover rounded border border-zinc-800 shrink-0"
                            />
                            <span className="text-[9px] font-mono text-zinc-400 truncate max-w-[120px] md:max-w-[180px]">
                              {pageImg.startsWith('data:') ? '本地上传 Base64 数据流' : pageImg}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Move Left/Up */}
                            <button
                              onClick={() => handleMovePageImage(idx, 'left')}
                              disabled={idx === 0}
                              className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                              title="上移一页"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            
                            {/* Move Right/Down */}
                            <button
                              onClick={() => handleMovePageImage(idx, 'right')}
                              disabled={idx === editPdfPageImages.length - 1}
                              className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                              title="下移一页"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Page */}
                            <button
                              onClick={() => handleDeletePageImage(idx)}
                              className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              title="删除此页"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Append new page control */}
                    <div className="flex items-center gap-2 pt-1">
                      <input 
                        type="file" 
                        ref={pdfPageInputRef}
                        onChange={handlePdfPageImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => pdfPageInputRef.current?.click()}
                        className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-inner"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-500" />
                        <span>上传本地图片作为 PDF 第 {editPdfPageImages.length + 1} 页</span>
                      </button>
                    </div>
                  </div>

                  {/* Imbalance Slider */}
                  <div className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-900/60 space-y-2">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-500">
                      <span>情感结构失衡指数 / Imbalance Rate</span>
                      <span className="text-amber-500 font-mono font-black">{editScore}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      step="1"
                      value={editScore}
                      onChange={(e) => setEditScore(parseInt(e.target.value))}
                      className="w-full accent-amber-500 bg-zinc-800 cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                      <span>和谐共振 (Teal)</span>
                      <span>中度失配 (Amber)</span>
                      <span>深度断裂 (Red)</span>
                    </div>
                  </div>

                  {/* Primary Cover Upload Zone */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-3 bg-zinc-950/30 border border-zinc-800 rounded-xl">
                    
                    {/* Left side: Upload Button & Input */}
                    <div className="md:col-span-8 space-y-2">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block font-mono">上传卡片封面 Image Cover (列表主缩略图)</span>
                      
                      <div className="flex items-center gap-2">
                        {/* Hidden file selector */}
                        <input 
                          type="file" 
                          ref={cardCoverInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          onClick={() => cardCoverInputRef.current?.click()}
                          className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-inner"
                        >
                          <Upload className="w-3.5 h-3.5 text-amber-500" />
                          <span>上传本地封面</span>
                        </button>

                        <button
                          onClick={() => {
                            const newPreset = [
                              'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop',
                              'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop',
                              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop',
                              'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=800&auto=format&fit=crop'
                            ][Math.floor(Math.random() * 4)];
                            setEditImageUrl(newPreset);
                          }}
                          className="px-2.5 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-[10px] font-mono text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
                        >
                          随机换库图
                        </button>
                      </div>
                    </div>

                    {/* Right side: Thumbnail preview */}
                    <div className="md:col-span-4 flex justify-center">
                      <div className="w-24 h-16 rounded-lg bg-zinc-950 border border-zinc-800 relative overflow-hidden shrink-0">
                        <img 
                          src={editImageUrl} 
                          alt="Cover Thumbnail" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-zinc-400 opacity-60" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manual PDF Link input */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">PDF数据链自定义 URL Source</label>
                      <button 
                        onClick={() => setEditPdfUrl(DEFAULT_PDF_URL)}
                        className="text-[9px] text-zinc-500 hover:text-zinc-300 font-mono uppercase"
                      >
                        恢复默认 PDF 链接
                      </button>
                    </div>
                    <input 
                      type="text" 
                      value={editPdfUrl}
                      onChange={(e) => setEditPdfUrl(e.target.value)}
                      placeholder="PDF 链接 (如 cos、oss 直链或 pdf 文件链接)"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-[10px] font-mono text-indigo-300 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                </div>

                {/* Work Area actions */}
                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>自动同步至 localStorage</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCard(null)}
                      className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                    >
                      取消编辑 / CLOSE
                    </button>
                    <button
                      onClick={handleSaveCard}
                      className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold font-display rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg cursor-pointer hover:scale-[1.02]"
                    >
                      保存修改 / SAVE
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
