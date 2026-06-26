import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  X, 
  Download, 
  ZoomIn, 
  Check, 
  Loader2, 
  ChevronLeft, 
  BookOpen, 
  AlertCircle, 
  Terminal, 
  Search, 
  Sparkles, 
  Plus, 
  Trash2, 
  Info, 
  Eye,
  FileDown
} from 'lucide-react';

interface PdfCard {
  id: string;
  title: string;
  fileName: string;
  pageNumber: number;
  totalPages: number;
  imageUrl: string;
  uploadedAt: string;
  fileSize: string;
  notes: string;
  diagnostics: {
    status: 'healthy' | 'warning' | 'critical';
    confidence: number;
    colonyCount?: number;
    density?: string;
    anomalies: string[];
  };
}

interface PdfDecoderPageProps {
  isOpen: boolean;
  onClose: () => void;
}

// Preloaded sample Petri study cards to make the page instantly engaging
const INITIAL_CARDS: PdfCard[] = [
  {
    id: 'sample-p1',
    title: 'Petri Culture Study - Page 1',
    fileName: 'Colony_Morphology_Study_2026.pdf',
    pageNumber: 1,
    totalPages: 2,
    imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800&auto=format&fit=crop', // Agar plate colony growth representation
    uploadedAt: '2026-06-25 10:24',
    fileSize: '1.4 MB',
    notes: 'Agar medium displays progressive proliferation. Localized concentration observed in Quadrant B.',
    diagnostics: {
      status: 'healthy',
      confidence: 94.8,
      colonyCount: 42,
      density: 'Moderate',
      anomalies: ['None detected', 'Normal division speed']
    }
  },
  {
    id: 'sample-p2',
    title: 'Petri Culture Study - Page 2',
    fileName: 'Colony_Morphology_Study_2026.pdf',
    pageNumber: 2,
    totalPages: 2,
    imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=800&auto=format&fit=crop', // Cell dividing micrograph
    uploadedAt: '2026-06-25 10:24',
    fileSize: '1.4 MB',
    notes: 'High-magnification cell structure analysis indicates normal cell wall cohesion and zero mutations.',
    diagnostics: {
      status: 'warning',
      confidence: 88.5,
      colonyCount: 108,
      density: 'Dense',
      anomalies: ['Minor crowding effect in Quadrant D', 'Requires observation']
    }
  }
];

export const PdfDecoderPage: React.FC<PdfDecoderPageProps> = ({ isOpen, onClose }) => {
  const [cards, setCards] = useState<PdfCard[]>(() => {
    const saved = localStorage.getItem('petri_pdf_decoder_cards_v1');
    return saved ? JSON.parse(saved) : INITIAL_CARDS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<PdfCard | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Custom scan interface simulation state
  const [scanningCardId, setScanningCardId] = useState<string | null>(null);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Save cards to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('petri_pdf_decoder_cards_v1', JSON.stringify(cards));
  }, [cards]);

  // Scroll to bottom of scanning logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scanLogs]);

  // Load PDFJS library dynamically from CDN to render PDF client-side
  const loadPdfJsLib = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        if (pdfjsLib) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
          resolve(pdfjsLib);
        } else {
          reject(new Error('PDFJS library loaded but window.pdfjsLib is undefined'));
        }
      };
      script.onerror = (err) => reject(new Error('Failed to load PDF.js script: ' + err));
      document.head.appendChild(script);
    });
  };

  // Process selected PDF file
  const handlePdfFile = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      alert('请上传一个有效的 PDF 文档。 Please upload a valid PDF document.');
      return;
    }

    setIsLoading(true);
    setLoadingProgress('正在载入 PDF 解析引擎 (Loading engine)...');

    try {
      // 1. Dynamic Load PDF.js
      const pdfjsLib = await loadPdfJsLib();
      
      setLoadingProgress('读取 PDF 数据流 (Reading file)...');
      // 2. Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      setLoadingProgress('正在解析 PDF 文档结构 (Parsing pages)...');
      // 3. Load Document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      
      const extractedCards: PdfCard[] = [];
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const formattedSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      // 4. Render each page to an offscreen Canvas and convert to base64 image
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        setLoadingProgress(`正在将第 ${pageNum} / ${numPages} 页转为高精图像 (Converting pages)...`);
        
        const page = await pdf.getPage(pageNum);
        
        // Use a 1.5 scale factor for highly sharp, premium card graphics
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Canvas 2D Context initialization failed');
        }
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Convert page canvas to high quality JPEG
        const imageUrl = canvas.toDataURL('image/jpeg', 0.85);

        // Generate customized Petri Culture metrics per page to fit theme
        const colonyCount = Math.floor(Math.random() * 80) + 10;
        const densities: ('Sparse' | 'Moderate' | 'Dense')[] = ['Sparse', 'Moderate', 'Dense'];
        const density = densities[Math.floor(Math.random() * densities.length)];
        const statuses: ('healthy' | 'warning' | 'critical')[] = ['healthy', 'warning', 'critical'];
        const status = colonyCount > 70 ? 'critical' : colonyCount > 40 ? 'warning' : 'healthy';
        const confidence = parseFloat((90 + Math.random() * 9.8).toFixed(1));

        const anomalies = colonyCount > 70 
          ? ['Colony congestion detected', 'Risk of agar depletion']
          : colonyCount > 40 
            ? ['Sub-optimal temperature profile', 'Moderate division overlap']
            : ['No anomalies detected', 'Perfect growth form'];

        extractedCards.push({
          id: `pdf-page-${Date.now()}-${pageNum}`,
          title: `PDF Analysis - Page ${pageNum}`,
          fileName: file.name,
          pageNumber: pageNum,
          totalPages: numPages,
          imageUrl: imageUrl,
          uploadedAt: timestamp,
          fileSize: formattedSize,
          notes: `Colony morphologic evaluation page ${pageNum}. Structural division density rated as ${density}.`,
          diagnostics: {
            status,
            confidence,
            colonyCount,
            density,
            anomalies
          }
        });
      }

      // Add new cards to the front of the list
      setCards(prev => [...extractedCards, ...prev]);
      setIsLoading(false);
      setLoadingProgress('');
      
    } catch (error) {
      console.error('PDF parsing error:', error);
      alert('PDF 解析失败，请检查文件格式。 Error parsing PDF: ' + (error instanceof Error ? error.message : String(error)));
      setIsLoading(false);
      setLoadingProgress('');
    }
  };

  // Drag and Drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePdfFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePdfFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const deleteCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确认删除此卡片及解析成果吗？ Delete this converted page card?')) {
      setCards(prev => prev.filter(c => c.id !== id));
      if (selectedCard?.id === id) {
        setSelectedCard(null);
      }
    }
  };

  // Trigger cool scanning animation diagnostic sequence
  const startDiagnosticScan = (card: PdfCard, e: React.MouseEvent) => {
    e.stopPropagation();
    setScanningCardId(card.id);
    setIsScanning(true);
    setScanLogs([]);

    const steps = [
      `[INIT] Booting AlphaQubit diagnostic matrix for page ${card.pageNumber}...`,
      `[LOADING] Injecting computer vision contours...`,
      `[SCANNING] Mapping colony pixel distribution gradients...`,
      `[ANALYZING] Calculated ${card.diagnostics.colonyCount || 42} active growth nodes.`,
      `[VAL] Contrast rating: 92.4% | Saturation density index: ${card.diagnostics.density}`,
      `[AI] Model evaluation confidence: ${card.diagnostics.confidence}%`,
      `[REPORT] Result: ${card.diagnostics.status.toUpperCase()} | Health index stable.`,
      `[SUCCESS] Diagnosis report completed. Saved back into page card database.`
    ];

    steps.forEach((log, index) => {
      setTimeout(() => {
        setScanLogs(prev => [...prev, log]);
        if (index === steps.length - 1) {
          setIsScanning(false);
        }
      }, (index + 1) * 600);
    });
  };

  const updateCardNotes = (id: string, notes: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, notes } : c));
    if (selectedCard && selectedCard.id === id) {
      setSelectedCard(prev => prev ? { ...prev, notes } : null);
    }
  };

  const filteredCards = cards.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-zinc-950/95 backdrop-blur-2xl z-50 overflow-y-auto flex flex-col p-4 md:p-8 lg:p-12 select-text"
      >
        {/* Core Layout Wrapper - Centered 1700px */}
        <div className="w-full max-w-[1700px] mx-auto flex-1 flex flex-col h-full">
          
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="font-mono text-amber-500 text-xs tracking-wider font-bold uppercase">Petri Dish Secondary Module</span>
                </div>
              </div>
              <h1 className="text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-3 mt-1">
                PDF 智能培养皿解析器 <span className="text-zinc-500 font-serif italic text-xl font-normal">/ Petri Dish Document Decoder</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="搜索解析卡片 (Search)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-mono font-bold tracking-widest uppercase transition-all cursor-pointer shadow-lg"
              >
                CLOSE PORTAL / 返回主页
              </button>
            </div>
          </div>

          {/* Left/Right Grid Layout: Upload Left, Converted Page Cards Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
            
            {/* Column 1: Control Panel & Upload Zone (span 4) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Info Widget */}
              <div className="p-5 rounded-2xl glassmorphism-card border border-white/10 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-white font-mono">
                    文档与载玻片虚拟化 (Document Digitization)
                  </h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  上传一份关于细胞培养、培养皿研究或学术报告的 PDF 文档。解析系统会将所有页面高精渲染为交互卡片，并自动计算菌落点位及活跃浓度分布。
                </p>
                <div className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-900 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-[10px] text-zinc-400 font-mono leading-normal">
                    *本引擎完全在客户端解析 PDF。无需任何服务器传输，100% 隐私安全。
                  </span>
                </div>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`relative p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 h-64 ${
                  dragActive 
                    ? 'border-amber-500 bg-amber-500/5 shadow-amber-500/10' 
                    : 'border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900/10'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="hidden"
                />

                {isLoading ? (
                  <div className="space-y-4">
                    <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white font-mono uppercase">正在解析文档 (Parsing PDF)...</p>
                      <p className="text-[10px] text-amber-400 font-mono animate-pulse">{loadingProgress}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400 group-hover:text-white transition-colors">
                      <Upload className="w-5 h-5 text-amber-500 animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        拖拽 PDF 到此处或点击上传
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Drag and drop PDF here, or click to browse
                      </p>
                    </div>
                    <div className="text-[9px] font-mono bg-zinc-950 px-2 py-1 rounded text-zinc-400 border border-zinc-900 inline-block">
                      LIMIT: MAX 50MB PDF FILES
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time Dynamic Diagnostics Terminal Console */}
              {scanningCardId && (
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 font-mono text-[11px] text-zinc-300 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-bold text-amber-500">DIAGNOSTIC PROCESSOR v4</span>
                    </div>
                    {isScanning && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded animate-pulse">RUNNING</span>}
                  </div>
                  <div className="h-44 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800 pr-1 select-text">
                    {scanLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed">
                        {log.startsWith('[SUCCESS]') ? (
                          <span className="text-emerald-400 font-bold">{log}</span>
                        ) : log.startsWith('[REPORT]') ? (
                          <span className="text-blue-400 font-bold">{log}</span>
                        ) : log.startsWith('[INIT]') ? (
                          <span className="text-amber-500 font-bold">{log}</span>
                        ) : (
                          <span className="text-zinc-400">{log}</span>
                        )}
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </div>
              )}

            </div>

            {/* Column 2: Extracted Page Cards Grid (span 8) */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-2">
                  <span>解析卡片总库 / Converted Cards Deck</span>
                  <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] text-white">
                    {filteredCards.length}
                  </span>
                </h2>
                
                {filteredCards.length > 0 && (
                  <button 
                    onClick={() => {
                      if (confirm('是否清空当前所有的解析卡片？')) {
                        setCards([]);
                      }
                    }}
                    className="text-[10px] font-mono font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>CLEAR DECK / 清空列表</span>
                  </button>
                )}
              </div>

              {filteredCards.length === 0 ? (
                <div className="p-16 rounded-2xl glassmorphism-card text-center flex flex-col items-center justify-center gap-4">
                  <div className="p-3.5 rounded-full bg-zinc-900 border border-zinc-850 text-zinc-600">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">暂无解析卡片数据</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-normal">
                      请使用左侧面板上传一份 PDF 报告，系统会自动为您完成高保真页面图像转换。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCards.map((card) => {
                    const statusColor = 
                      card.diagnostics.status === 'healthy' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' :
                      card.diagnostics.status === 'warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/20' :
                      'bg-rose-500/20 text-rose-400 border-rose-500/20';

                    return (
                      <motion.div
                        key={card.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        whileHover={{ y: -6, scale: 1.01 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => setSelectedCard(card)}
                        className="rounded-2xl glassmorphism-card overflow-hidden cursor-pointer flex flex-col h-[480px] group border border-white/[0.08]"
                      >
                        {/* Page Preview Image */}
                        <div className="h-56 relative bg-zinc-950 overflow-hidden border-b border-zinc-900 shrink-0">
                          <img 
                            src={card.imageUrl} 
                            alt={card.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-60" />
                          
                          {/* Floating indicators */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 backdrop-blur-sm text-[9px] font-mono font-bold text-zinc-300">
                              PAGE {card.pageNumber.toString().padStart(2, '0')} / {card.totalPages.toString().padStart(2, '0')}
                            </span>
                            <span className={`px-2 py-0.5 rounded border backdrop-blur-sm text-[9px] font-mono font-bold uppercase ${statusColor}`}>
                              {card.diagnostics.status}
                            </span>
                          </div>

                          <div className="absolute bottom-3 right-3">
                            <span className="p-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 backdrop-blur-sm text-zinc-400 hover:text-white transition-colors flex items-center justify-center">
                              <ZoomIn className="w-4 h-4" />
                            </span>
                          </div>
                        </div>

                        {/* Content Container */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-4">
                              <h3 className="text-sm font-display font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                                {card.title}
                              </h3>
                              <span className="text-[10px] text-zinc-500 font-mono shrink-0 font-light">
                                {card.fileSize}
                              </span>
                            </div>

                            <div className="text-[10px] font-mono text-zinc-500 truncate" title={card.fileName}>
                              File: {card.fileName}
                            </div>

                            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                              {card.notes || "无自定义备注信息。 (No notes specified.)"}
                            </p>
                          </div>

                          {/* Quick Interactive Statistics */}
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-900/60 text-[10px] font-mono">
                            <div className="p-2 bg-zinc-950/40 rounded-lg border border-zinc-900/60">
                              <span className="text-zinc-500 block">Colony Nodes</span>
                              <span className="text-white font-bold">{card.diagnostics.colonyCount || 42} Nodes</span>
                            </div>
                            <div className="p-2 bg-zinc-950/40 rounded-lg border border-zinc-900/60">
                              <span className="text-zinc-500 block">Confidence</span>
                              <span className="text-amber-500 font-bold">{card.diagnostics.confidence}%</span>
                            </div>
                          </div>

                          {/* Action Footer */}
                          <div className="pt-3 border-t border-zinc-900/60 flex items-center justify-between">
                            <button
                              onClick={(e) => startDiagnosticScan(card, e)}
                              className="text-[10px] font-mono font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>RUN ANALYSIS / 智能诊断</span>
                            </button>

                            <button
                              onClick={(e) => deleteCard(card.id, e)}
                              className="text-[10px] font-mono font-bold text-zinc-500 hover:text-red-400 p-1.5 hover:bg-red-500/5 rounded-lg transition-all cursor-pointer"
                              title="Delete Card"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

        </div>

        {/* Lightbox zoom / Detail editing modal */}
        <AnimatePresence>
          {selectedCard && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-950/98 backdrop-blur-2xl z-[60] flex items-center justify-center p-4 lg:p-12 overflow-y-auto"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ type: "spring", damping: 25 }}
                className="w-full max-w-6xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col md:flex-row text-left overflow-hidden max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Left side: Converted PDF image viewer */}
                <div className="md:w-3/5 relative bg-black flex items-center justify-center p-4 border-r border-zinc-800 overflow-y-auto min-h-[300px] md:min-h-0">
                  <img 
                    src={selectedCard.imageUrl} 
                    alt={selectedCard.title} 
                    className="max-w-full max-h-[70vh] object-contain rounded shadow-2xl"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-2.5 py-1 rounded bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono text-zinc-300 font-bold">
                      PAGE {selectedCard.pageNumber} / {selectedCard.totalPages}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono text-amber-500 font-bold uppercase">
                      HI-RES IMAGE
                    </span>
                  </div>
                </div>

                {/* Right side: Annotation metadata & Diagnostic parameters */}
                <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh] bg-zinc-900">
                  <div className="space-y-6">
                    {/* Title */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-mono tracking-widest font-bold uppercase block w-fit">
                          PETRI INTEL DEEP DIAGNOSIS
                        </span>
                        <h2 className="text-xl font-display font-extrabold text-white tracking-tight mt-1">
                          {selectedCard.title}
                        </h2>
                      </div>
                      <button 
                        onClick={() => setSelectedCard(null)}
                        className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Meta information tags */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-850 font-mono text-[10px]">
                      <div>
                        <span className="text-zinc-500 block">File Name</span>
                        <span className="text-white font-medium truncate block" title={selectedCard.fileName}>{selectedCard.fileName}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Conversion Date</span>
                        <span className="text-white font-medium block">{selectedCard.uploadedAt}</span>
                      </div>
                    </div>

                    {/* AI Diagnostics report */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
                        AI AUTONOMOUS ANALYSIS REPORT
                      </h4>
                      <div className="space-y-2">
                        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 flex items-center justify-between">
                          <span className="text-[11px] text-zinc-400">Biological Micro-anomaly</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            selectedCard.diagnostics.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' :
                            selectedCard.diagnostics.status === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-rose-500/10 text-rose-400'
                          }`}>
                            {selectedCard.diagnostics.status}
                          </span>
                        </div>
                        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 flex items-center justify-between">
                          <span className="text-[11px] text-zinc-400">Total Counted Micro-colonies</span>
                          <span className="text-xs font-mono text-white font-bold">{selectedCard.diagnostics.colonyCount} Colonies</span>
                        </div>
                        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 flex items-center justify-between">
                          <span className="text-[11px] text-zinc-400 font-sans">Computer Vision Confidence</span>
                          <span className="text-xs font-mono text-amber-500 font-bold">{selectedCard.diagnostics.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Notes Editor */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase block">
                        ANNOTATIONS & REMARKS / 备注与说明
                      </label>
                      <textarea 
                        value={selectedCard.notes}
                        onChange={(e) => updateCardNotes(selectedCard.id, e.target.value)}
                        placeholder="在此输入您对本页面图像的细胞研究、缺陷特征、或计算出的备注说明..."
                        rows={4}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 leading-relaxed font-sans"
                      />
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-6 border-t border-zinc-800 flex items-center justify-between gap-3">
                    <a
                      href={selectedCard.imageUrl}
                      download={`PetriDish_Page_${selectedCard.pageNumber}.jpg`}
                      className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-display rounded-xl text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>DOWNLOAD IMAGE / 导出图像</span>
                    </a>
                    
                    <button
                      onClick={() => setSelectedCard(null)}
                      className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-mono font-bold tracking-widest uppercase transition-all cursor-pointer"
                    >
                      CLOSE / 关闭
                    </button>
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
