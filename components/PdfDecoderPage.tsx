import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  X, 
  ZoomIn, 
  ZoomOut,
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
  ChevronUp,
  Share2,
  Copy
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
    id: "rel-1782978620375",
    title: "22",
    cat: "自定义分析 / Custom",
    desc: "自定义创建的情感供需分析卡片。",
    imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
    pdfUrl: "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/%E6%9E%84%E7%9F%B3%E6%96%87%E6%A1%A3/1.%E6%AD%A4%E4%B8%BA%E7%94%98%E9%A5%B4%EF%BC%8C%E5%BD%BC%E4%B9%8B%E8%8B%A6%E8%8D%AF%E2%80%94%E2%80%94%E8%AE%BA%E4%B8%8D%E5%90%88%E9%80%82%E7%9A%84%E8%83%8C%E5%90%8E%E4%BA%B2%E5%AF%86%E5%85%B3%E7%B3%BB%E4%B8%AD%E6%83%85%E6%84%9F%E4%BE%9B%E9%9C%80%E7%9A%84%E7%BB%93%E6%9E%84%E6%80%A7%E5%A4%B1%E8%A1%A1%EF%BC%88WXJB-2663-001%EF%BC%89.pdf",
    pdfPageImages: [
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200&auto=format&fit=crop"
    ],
    imbalanceScore: 50,
    notes: "可编辑深度论文研读笔记或分析心得...",
    lastUpdated: "2026-07-02 07:50"
  },
  {
    id: "rel-1782974086095",
    title: "11",
    cat: "自定义分析 / Custom",
    desc: "自定义创建的情感供需 analysis 卡片。",
    imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
    pdfUrl: "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/1.%E6%AD%A4%E4%B8%BA%E7%94%98%E9%A5%B4%EF%BC%8C%E5%BD%BC%E4%B9%8B%E8%8B%A6%E8%8D%AF%E2%80%94%E2%5%94%E2%80%94%E8%AE%BA%E4%B8%8D%E5%90%88%E9%80%82%E7%9A%84%E8%83%8C%E5%90%8E%E4%BA%B2%E5%AF%86%E5%85%B3%E7%B3%BB%E4%B8%AD%E6%83%85%E6%84%9F%E4%BE%9B%E9%9C%80%E7%9A%84%E7%BB%93%E6%9E%84%E6%80%A7%E5%A4%B1%E8%A1%A1%EF%BC%88WXJB-2663-001%EF%BC%89.pdf",
    pdfPageImages: [
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200&auto=format&fit=crop"
    ],
    imbalanceScore: 50,
    notes: "可编辑深度论文研读笔记或分析心得...",
    lastUpdated: "2026-07-02 06:34"
  },
  {
    id: "rel-4",
    title: "安全感逆差下的零和博弈",
    cat: "深层代偿机制 / Compensation",
    desc: "双方试图在对方身上填补童年或过往体验中遗留的匮乏感，最终将本应滋养彼此的避风港扭曲为不断透支能耗的战场。",
    imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=800&auto=format&fit=crop",
    pdfUrl: "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/1.%E6%AD%A4%E4%B8%BA%E7%94%98%E9%A5%B4%EF%BC%8C%E5%BD%BC%E4%B9%8B%E8%8B%A6%E8%8D%AF%E2%80%94%E2%5%94%E2%80%94%E8%AE%BA%E4%B8%8D%E5%90%88%E9%80%82%E7%9A%84%E8%83%8C%E5%90%8E%E4%BA%B2%E5%AF%86%E5%85%B3%E7%B3%BB%E4%B8%AD%E6%83%85%E6%84%9F%E4%BE%9B%E9%9C%80%E7%9A%84%E7%BB%93%E6%9E%84%E6%80%A7%E5%A4%B1%E8%A1%A1%EF%BC%88WXJB-2663-001%EF%BC%89.pdf",
    pdfPageImages: [
      "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200&auto=format&fit=crop"
    ],
    imbalanceScore: 82,
    notes: "为了满足自我安全感，过度迎合或冷酷防御都是代偿行为。唯有认清结构失衡，才能从博弈走向成熟和解。本章深度剖析代偿心理解析。",
    lastUpdated: "2026-07-01 10:45"
  }
];

export const PdfDecoderPage: React.FC<PdfDecoderPageProps> = ({ isOpen, onClose }) => {
  const [cards, setCards] = useState<RelationshipCard[]>(() => {
    const saved = localStorage.getItem("alphaqubit_relationship_cards_v4");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved relationship cards", e);
      }
    }
    return INITIAL_RELATIONSHIP_CARDS;
  });

  const saveCards = (updater: RelationshipCard[] | ((prev: RelationshipCard[]) => RelationshipCard[])) => {
    setCards(prev => {
      const updated = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem("alphaqubit_relationship_cards_v4", JSON.stringify(updated));
      return updated;
    });
  };

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<RelationshipCard | null>(null);
  
  // Mobile check
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setWorkspaceMode('pdf');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Current active page in the PDF Content Image slide show
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [fullscreenSource, setFullscreenSource] = useState<{ type: 'pdfjs' } | { type: 'image'; url: string } | null>(null);
  const isFullscreenOpen = fullscreenSource !== null;

  // Mode Toggles for Interactive PDF Display
  const [workspaceMode, setWorkspaceMode] = useState<'image' | 'pdf'>('pdf');
  const [cardPdfMode, setCardPdfMode] = useState<Record<string, 'image' | 'pdf'>>({});
  const [pdfEngine, setPdfEngine] = useState<'microsoft' | 'native' | 'pdfjs'>('pdfjs');

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

  // PDF.js Client-Side Live Viewer States
  const [pdfjsDoc, setPdfjsDoc] = useState<any>(null);
  const [pdfjsCurrentPage, setPdfjsCurrentPage] = useState<number>(1);
  const [pdfjsTotalPages, setPdfjsTotalPages] = useState<number>(0);
  const [pdfjsLoading, setPdfjsLoading] = useState<boolean>(false);
  const [pdfjsError, setPdfjsError] = useState<string | null>(null);
  const [pdfjsZoom, setPdfjsZoom] = useState<number>(1.2);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfFullscreenCanvasRef = useRef<HTMLCanvasElement>(null);

  // Effect to load PDF Document via PDF.js client-side
  useEffect(() => {
    let active = true;
    if (workspaceMode !== 'pdf' || pdfEngine !== 'pdfjs') {
      return;
    }

    const loadPdfDoc = async () => {
      setPdfjsLoading(true);
      setPdfjsError(null);
      setPdfjsDoc(null);

      const targetUrl = editPdfUrl || DEFAULT_PDF_URL;
      if (!targetUrl) {
        setPdfjsLoading(false);
        return;
      }

      try {
        // 1. Dynamic PDFJS script load
        const pdfjsLib = await new Promise<any>((resolve, reject) => {
          if ((window as any).pdfjsLib) {
            resolve((window as any).pdfjsLib);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.onload = () => {
            const lib = (window as any).pdfjsLib;
            lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve(lib);
          };
          script.onerror = (err) => reject(new Error('PDFJS 库加载失败，请检查网络连接。'));
          document.head.appendChild(script);
        });

        if (!active) return;

        // 2. Fetch PDF ArrayBuffer with CORS proxy fallback
        let arrayBuffer: ArrayBuffer;
        try {
          const directResponse = await fetch(targetUrl);
          if (!directResponse.ok) throw new Error('CORS restriction');
          arrayBuffer = await directResponse.arrayBuffer();
        } catch (directErr) {
          const proxyUrl = `/api/proxy-pdf?url=${encodeURIComponent(targetUrl)}`;
          const proxyResponse = await fetch(proxyUrl);
          if (!proxyResponse.ok) throw new Error('加载 PDF 失败，请确保链接有效且可下载。');
          arrayBuffer = await proxyResponse.arrayBuffer();
        }

        if (!active) return;

        // 3. Load PDF
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdfDoc = await loadingTask.promise;
        
        if (!active) return;

        setPdfjsDoc(pdfDoc);
        setPdfjsTotalPages(pdfDoc.numPages);
        setPdfjsCurrentPage(1);
        setPdfjsLoading(false);
      } catch (err: any) {
        console.error(err);
        if (active) {
          setPdfjsError(err.message || '加载 PDF 失败，请确保链接有效且支持跨域下载。');
          setPdfjsLoading(false);
        }
      }
    };

    loadPdfDoc();

    return () => {
      active = false;
    };
  }, [editPdfUrl, workspaceMode, pdfEngine]);

  // Effect to render the active PDF.js page on the canvas
  useEffect(() => {
    let active = true;
    if (!pdfjsDoc || workspaceMode !== 'pdf' || pdfEngine !== 'pdfjs' || !pdfCanvasRef.current) {
      return;
    }

    const renderPage = async () => {
      try {
        const page = await pdfjsDoc.getPage(pdfjsCurrentPage);
        if (!active || !pdfCanvasRef.current) return;

        const viewport = page.getViewport({ scale: pdfjsZoom });
        const canvas = pdfCanvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Failed to render PDF page on canvas:', err);
      }
    };

    renderPage();

    return () => {
      active = false;
    };
  }, [pdfjsDoc, pdfjsCurrentPage, pdfjsZoom, workspaceMode, pdfEngine]);

  // Effect to render the active PDF.js page on the fullscreen canvas
  useEffect(() => {
    let active = true;

    const renderFullscreenPage = async () => {
      if (!pdfjsDoc || !isFullscreenOpen || fullscreenSource?.type !== 'pdfjs' || workspaceMode !== 'pdf' || pdfEngine !== 'pdfjs') {
        return;
      }
      try {
        // Wait up to 5 frames if canvas is not immediately ready to resolve React mounting delay
        let canvas = pdfFullscreenCanvasRef.current;
        if (!canvas) {
          for (let i = 0; i < 5; i++) {
            await new Promise(r => requestAnimationFrame(r));
            canvas = pdfFullscreenCanvasRef.current;
            if (canvas) break;
          }
        }
        if (!active || !canvas) return;

        const page = await pdfjsDoc.getPage(pdfjsCurrentPage);
        if (!active || !pdfFullscreenCanvasRef.current) return;

        const scaleToUse = Math.max(1.8, pdfjsZoom * 1.5);
        const viewport = page.getViewport({ scale: scaleToUse });
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Failed to render PDF page on fullscreen canvas:', err);
      }
    };

    renderFullscreenPage();

    return () => {
      active = false;
    };
  }, [pdfjsDoc, pdfjsCurrentPage, pdfjsZoom, isFullscreenOpen, fullscreenSource, workspaceMode, pdfEngine]);

  const cardCoverInputRef = useRef<HTMLInputElement>(null);
  const pdfPageInputRef = useRef<HTMLInputElement>(null);

  // States for dynamic client-side PDF.js content extraction
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionLog, setExtractionLog] = useState<string[]>([]);

  const handleExtractPdf = async (urlToExtract: string) => {
    if (!urlToExtract) {
      alert('请先输入有效的 PDF 链接！');
      return;
    }
    
    setIsExtracting(true);
    setExtractionLog(['[INFO] 正在挂载全球 CDN PDFJS 高效解析引擎...']);
    
    try {
      // 1. Dynamic PDFJS script load
      const pdfjsLib = await new Promise<any>((resolve, reject) => {
        if ((window as any).pdfjsLib) {
          resolve((window as any).pdfjsLib);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          const lib = (window as any).pdfjsLib;
          lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve(lib);
        };
        script.onerror = (err) => reject(new Error('PDFJS 库加载失败，请检查网络或稍后重试。'));
        document.head.appendChild(script);
      });

      setExtractionLog(prev => [...prev, '[INFO] 正在建立跨域安全数据流代理通道，下载原著 PDF 文件...']);

      // 2. Fetch PDF ArrayBuffer with CORS proxy fallback
      let arrayBuffer: ArrayBuffer;
      try {
        const directResponse = await fetch(urlToExtract);
        if (!directResponse.ok) throw new Error('CORS restriction');
        arrayBuffer = await directResponse.arrayBuffer();
        setExtractionLog(prev => [...prev, '[SUCCESS] PDF 核心通道建立成功，直接读取完成！']);
      } catch (directErr) {
        setExtractionLog(prev => [...prev, '[WARN] 检测到第三方服务器跨域拦截 (CORS)，已自动接入高速跨域代理，继续握手...']);
        const proxyUrl = `/api/proxy-pdf?url=${encodeURIComponent(urlToExtract)}`;
        const proxyResponse = await fetch(proxyUrl);
        if (!proxyResponse.ok) throw new Error('通过代理提取 PDF 文件失败。请确保链接可被直接下载且是有效的 PDF 文件。');
        arrayBuffer = await proxyResponse.arrayBuffer();
        setExtractionLog(prev => [...prev, '[SUCCESS] 跨域代理握手成功，PDF 数据流已全量接通！']);
      }

      setExtractionLog(prev => [...prev, '[INFO] 正在反序列化 PDF 二进制流，解构文档目录...']);

      // 3. Load PDF via PDFJS
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdfDoc = await loadingTask.promise;
      const totalPages = pdfDoc.numPages;
      
      setExtractionLog(prev => [...prev, `[SUCCESS] 目录解析完毕！文档共计 ${totalPages} 页。`]);
      setExtractionLog(prev => [...prev, `[INFO] 为了保障本地浏览器存储效率，正在并行高精度渲染前 ${Math.min(totalPages, 8)} 页画册原件...`]);

      // 4. Render first Math.min(totalPages, 8) pages to high quality JPGs
      const renderedImages: string[] = [];
      const numToRender = Math.min(totalPages, 8);
      
      for (let pageNum = 1; pageNum <= numToRender; pageNum++) {
        setExtractionLog(prev => [...prev, `[RENDER] 正在渲染并生成内容：第 ${pageNum}/${numToRender} 页...`]);
        const page = await pdfDoc.getPage(pageNum);
        
        // Render at scale 1.5 to have great quality but compressed size
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;
          
          // Use JPEG format with 0.82 compression ratio to fit within localStorage (5MB) seamlessly
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          renderedImages.push(dataUrl);
        }
      }

      setExtractionLog(prev => [...prev, `[SUCCESS] 全部 ${numToRender} 页高清晰度大纲原画生成完毕！`]);
      setExtractionLog(prev => [...prev, `[INFO] 正在为您全量同步到本地状态与缓存仓库中...`]);

      setEditPdfPageImages(renderedImages);
      setActivePageIndex(0);
      
      setExtractionLog(prev => [...prev, `[SUCCESS] ✨ 恭喜！原著内容已全量同步到您的看板大纲中。`]);
      setTimeout(() => {
        setIsExtracting(false);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setExtractionLog(prev => [...prev, `[ERROR] 解析提取失败: ${err.message || err}`]);
      setTimeout(() => {
        setIsExtracting(false);
        alert(`PDF 提取失败：${err.message || '请确保这是一个有效的 PDF 链接且可以正常公开访问。'}`);
      }, 3000);
    }
  };

  // Controller State
  const [controllerTitle, setControllerTitle] = useState('');
  const [controllerDesc, setControllerDesc] = useState('');
  const [controllerPdfUrl, setControllerPdfUrl] = useState('');
  const [isControllerMinimized, setIsControllerMinimized] = useState(false);

  // Save modifications locally in current session
  useEffect(() => {
    // Session state only
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
    saveCards(prev => [newCard, ...prev]);
    setControllerTitle('');
    setControllerDesc('');
    setControllerPdfUrl('');
  };

  // Quick Action: Remove selected or last card
  const handleDeleteCard = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    saveCards(prev => prev.filter(c => c.id !== id));
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

    saveCards(prev => prev.map(c => c.id === selectedCard.id ? updatedCard : c));
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
        {import.meta.env.DEV && !isMobile && (
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
                {/* Dynamic Card Count Control */}
                <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-300 font-medium">卡片数量控制 (Count)</span>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => {
                          if (cards.length > 1) {
                            saveCards(cards.slice(0, cards.length - 1));
                          }
                        }}
                        disabled={cards.length <= 1}
                        className="p-1 px-2.5 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 text-white rounded-lg cursor-pointer transition-all active:scale-95"
                        onPointerDown={e => e.stopPropagation()}
                        title="减少一张卡片"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold text-amber-500 w-6 text-center">{cards.length}</span>
                      <button 
                        onClick={() => {
                          const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
                          const newCard: RelationshipCard = {
                            id: `rel-${Date.now()}`,
                            title: `新分析卡片 ${cards.length + 1}`,
                            cat: '自定义分析 / Custom',
                            desc: '自定义创建的情感供需分析卡片。',
                            imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop',
                            pdfUrl: DEFAULT_PDF_URL,
                            pdfPageImages: [
                              'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop',
                              'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200&auto=format&fit=crop'
                            ],
                            imbalanceScore: 50,
                            notes: '可编辑深度论文研读笔记或分析心得...',
                            lastUpdated: timestamp
                          };
                          saveCards([...cards, newCard]);
                        }}
                        className="p-1 px-2.5 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg cursor-pointer transition-all active:scale-95"
                        onPointerDown={e => e.stopPropagation()}
                        title="增加一张卡片"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (window.confirm("确定要恢复列表为默认的 3 张卡片吗？这会覆盖当前的所有自定义改动。")) {
                        saveCards(INITIAL_RELATIONSHIP_CARDS);
                        setSelectedCard(null);
                      }
                    }}
                    className="w-full py-1.5 bg-zinc-950 hover:bg-red-950/20 border border-zinc-800/80 hover:border-red-900/30 text-zinc-400 hover:text-red-400 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                    onPointerDown={e => e.stopPropagation()}
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>恢复默认的 3 张卡片</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-mono mb-1 block">卡片标题 (Card title)</label>
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
                    <label className="text-[10px] text-zinc-400 font-mono mb-1 block">PDF 链接 (PDF link)</label>
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
                        navigator.clipboard.writeText(JSON.stringify(cards, null, 2));
                        alert('全部卡片数据已复制，请发送给 AI 进行部署');
                      }}
                      className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-500 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg"
                      onPointerDown={(e) => e.stopPropagation()}
                      title="复制全部卡片 JSON 数据用于 Git 部署"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>复制数据</span>
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
        )}

        {/* Fullscreen Zoom Viewer for high-res PDF image/canvas reading */}
        {fullscreenSource && selectedCard && (
          <div 
            className="fixed inset-0 bg-black/95 z-[999] flex flex-col justify-between p-4 animate-fadeIn"
            onClick={() => setFullscreenSource(null)}
          >
            <div className="flex items-center justify-between text-white p-2">
              <span className="font-mono text-xs bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-amber-500">
                {selectedCard.title} • 
                {fullscreenSource.type === 'pdfjs' ? (
                  ` PDF直解 • 第 ${pdfjsCurrentPage} / ${pdfjsTotalPages} 页`
                ) : (
                  ' 研读图稿放大'
                )}
              </span>
              <button 
                onClick={() => setFullscreenSource(null)}
                className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 border border-zinc-850 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 relative" onClick={(e) => e.stopPropagation()}>
              {/* Prev Button */}
              {fullscreenSource.type === 'pdfjs' && (
                <button 
                  disabled={pdfjsCurrentPage <= 1}
                  onClick={(e) => { e.stopPropagation(); setPdfjsCurrentPage(prev => Math.max(1, prev - 1)); }}
                  className="absolute left-4 p-4 rounded-full bg-black/80 text-white border border-zinc-850 hover:bg-zinc-900 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer z-10"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              )}

              {/* Main Content (Canvas for PDF.js, Image otherwise) */}
              {fullscreenSource.type === 'pdfjs' ? (
                <div className="max-h-[85vh] max-w-[90vw] overflow-auto rounded-xl shadow-2xl border border-zinc-900/80 bg-zinc-950">
                  <canvas 
                    ref={pdfFullscreenCanvasRef} 
                    className="max-h-[85vh] max-w-full block cursor-zoom-out hover:opacity-90 transition-all"
                    onClick={() => setFullscreenSource(null)}
                    title="点击画布返回"
                  />
                </div>
              ) : (
                <div className="max-h-[85vh] max-w-[90vw] overflow-auto rounded-xl shadow-2xl border border-zinc-900/80 bg-zinc-950 flex items-center justify-center">
                  <img 
                    src={fullscreenSource.url} 
                    alt="Enlarged reading resource" 
                    referrerPolicy="no-referrer"
                    onClick={() => setFullscreenSource(null)}
                    className="max-h-[85vh] max-w-full object-contain cursor-zoom-out hover:opacity-90 active:scale-98 transition-all"
                    title="点击图片返回"
                  />
                </div>
              )}

              {/* Next Button */}
              {fullscreenSource.type === 'pdfjs' && (
                <button 
                  disabled={pdfjsCurrentPage >= pdfjsTotalPages}
                  onClick={(e) => { e.stopPropagation(); setPdfjsCurrentPage(prev => Math.min(pdfjsTotalPages, prev + 1)); }}
                  className="absolute right-4 p-4 rounded-full bg-black/80 text-white border border-zinc-850 hover:bg-zinc-900 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer z-10"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              )}
            </div>

            <div className="text-center text-xs text-zinc-500 font-mono pb-2">
              点击空白区域或图片本身即可退出 [Esc] {fullscreenSource.type === 'pdfjs' && '• 支持点击左右箭头翻页'}
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
                      onClick={() => handleSelectCard(card)}
                      className={`p-5 rounded-xl border backdrop-blur-md transition-all duration-300 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        selectedCard?.id === card.id 
                          ? 'bg-white/[0.08] border-amber-500/80 ring-1 ring-amber-500/30 shadow-[0_8px_32px_rgba(245,158,11,0.15)] scale-[1.01]' 
                          : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.08] hover:border-amber-500/40 hover:backdrop-blur-xl hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(251,191,36,0.12)]'
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
                          onPointerDown={(e) => { 
                            e.stopPropagation(); 
                            navigator.clipboard.writeText(JSON.stringify(card, null, 2));
                            alert('单条卡片数据已复制');
                          }} 
                          className="p-1.5 text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors shrink-0"
                          title="复制此卡片数据"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
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

            {/* Backdrop for mobile popup view */}
            {selectedCard && (
              <div 
                className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[55] lg:hidden cursor-pointer animate-fadeIn"
                onClick={() => setSelectedCard(null)}
              />
            )}

            {/* Right Side: Split View (PDF Reader Carousel + Custom Card Editor, span 6) */}
            {selectedCard && (
              <div className="fixed inset-x-4 inset-y-10 lg:static lg:inset-auto z-[60] lg:z-0 lg:col-span-6 flex flex-col gap-5 bg-zinc-900 lg:bg-zinc-900/30 border border-zinc-800 lg:border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl lg:shadow-none backdrop-blur-xl lg:backdrop-blur-md overflow-y-auto lg:overflow-y-visible lg:h-auto animate-fadeIn">
                
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
                  {/* View Mode Header - Only showing Live PDF */}
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850/80 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-mono font-bold text-zinc-200">在线原著 PDF 阅读器</span>
                    </div>

                    <div className="flex items-center gap-2 self-start xl:self-auto">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 border border-emerald-500/20 rounded flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>多引擎 PDF 实时阅读中</span>
                      </span>
                    </div>
                  </div>

                  {/* High Quality Responsive Container Box */}
                  <div className="w-full h-[450px] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 relative group/slider flex items-center justify-center shadow-2xl">
                    {/* Embed Interactive Live PDF document with dynamic engine selectors */}
                    <div className="w-full h-full flex flex-col bg-zinc-950">
                      {/* Engine Selector Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 bg-zinc-900/50 border-b border-zinc-800 gap-2 text-[10px] text-zinc-400 font-mono">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-zinc-500">阅读渲染引擎:</span>
                          <button
                            onClick={() => setPdfEngine('pdfjs')}
                            className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${
                              pdfEngine === 'pdfjs'
                                ? 'bg-amber-500/25 text-amber-400 border border-amber-500/40 font-mono text-[9px]'
                                : 'bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 font-mono text-[9px]'
                            }`}
                            title="使用高科技前端 PDF.js 渲染引擎，100% 本地解构，中国区免翻墙，手机端最流畅"
                          >
                            浏览器极速直解 (免服务器/推荐) ✨
                          </button>
                          <button
                            onClick={() => setPdfEngine('native')}
                            className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${
                              pdfEngine === 'native'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-[9px]'
                                : 'bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 font-mono text-[9px]'
                            }`}
                            title="使用浏览器原生 PDF 渲染，最省流量，100% 在中国正常使用"
                          >
                            本地原生嵌入 (电脑推荐)
                          </button>
                          <button
                            onClick={() => setPdfEngine('microsoft')}
                            className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${
                              pdfEngine === 'microsoft'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-[9px]'
                                : 'bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 font-mono text-[9px]'
                            }`}
                            title="通过微软 Office 官方代理服务进行在线渲染，完美支持中国大陆免翻墙访问"
                          >
                            微软高速代理 (适合部分安卓手机)
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                          <a 
                            href={editPdfUrl || DEFAULT_PDF_URL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-amber-500 hover:text-amber-400 hover:underline flex items-center gap-1 font-bold bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/20 transition-all active:scale-95"
                            title="直接在外部浏览器中打开并使用手机自带的最佳阅读器阅览 PDF 原著"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>外部原生态打开</span>
                          </a>
                        </div>
                      </div>

                      {/* Actual Viewport */}
                      <div className="flex-1 relative bg-zinc-950 overflow-hidden flex flex-col">
                        {pdfEngine === 'pdfjs' ? (
                          <div className="flex-1 flex flex-col min-h-0 bg-zinc-950">
                            {/* Canvas Viewport Box */}
                            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-zinc-950 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                              {pdfjsLoading ? (
                                <div className="flex flex-col items-center gap-3 text-center">
                                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                                  <span className="text-xs font-mono text-zinc-400">本地解码并渲染 PDF 数据流中...</span>
                                </div>
                              ) : pdfjsError ? (
                                <div className="flex flex-col items-center gap-4 text-center max-w-sm px-4">
                                  <AlertCircle className="w-8 h-8 text-red-500 animate-pulse" />
                                  <div className="text-xs font-mono text-zinc-400 leading-relaxed">
                                    {pdfjsError}
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setPdfEngine('native');
                                      }}
                                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-mono font-bold rounded-lg border border-zinc-850 cursor-pointer"
                                    >
                                      切换至：本地原生渲染
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  onClick={() => setFullscreenSource({ type: 'pdfjs' })}
                                  className="relative shadow-2xl border border-zinc-900 rounded-lg overflow-hidden my-auto cursor-zoom-in hover:opacity-95 transition-all"
                                  title="点击放大阅览全屏 PDF"
                                >
                                  <canvas ref={pdfCanvasRef} className="max-w-full block" />
                                </div>
                              )}
                            </div>

                            {/* Canvas Toolbar Footer */}
                            {!pdfjsLoading && !pdfjsError && pdfjsDoc && (
                              <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/80 border-t border-zinc-800/80 font-mono text-[10px] text-zinc-400 shrink-0">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    disabled={pdfjsCurrentPage <= 1}
                                    onClick={() => setPdfjsCurrentPage(prev => Math.max(1, prev - 1))}
                                    className="p-1 rounded bg-zinc-950 border border-zinc-850 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 transition-colors cursor-pointer"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="px-1 text-zinc-200 font-bold">
                                    第 {pdfjsCurrentPage} / {pdfjsTotalPages} 页
                                  </span>
                                  <button
                                    disabled={pdfjsCurrentPage >= pdfjsTotalPages}
                                    onClick={() => setPdfjsCurrentPage(prev => Math.min(pdfjsTotalPages, prev + 1))}
                                    className="p-1 rounded bg-zinc-950 border border-zinc-850 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 transition-colors cursor-pointer"
                                  >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setPdfjsZoom(prev => Math.max(0.6, prev - 0.2))}
                                    title="缩小 (Zoom Out)"
                                    className="p-1 rounded bg-zinc-950 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                                  >
                                    <ZoomOut className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-[9px] text-zinc-500 font-bold w-8 text-center">
                                    {Math.round(pdfjsZoom * 100)}%
                                  </span>
                                  <button
                                    onClick={() => setPdfjsZoom(prev => Math.min(2.5, prev + 0.2))}
                                    title="放大 (Zoom In)"
                                    className="p-1 rounded bg-zinc-950 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                                  >
                                    <ZoomIn className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : pdfEngine === 'microsoft' ? (
                          <iframe 
                            src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(editPdfUrl || DEFAULT_PDF_URL)}`} 
                            className="w-full h-full border-0 bg-zinc-900"
                            title="Microsoft Office Online PDF Reader"
                          />
                        ) : (
                          <iframe 
                            src={`${editPdfUrl || DEFAULT_PDF_URL}#toolbar=1`} 
                            className="w-full h-full border-0 bg-zinc-950"
                            title="Standard Native PDF Document Reader"
                          />
                        )}
                      </div>
                    </div>
                  </div>
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
                              onClick={() => setFullscreenSource({ type: 'image', url: pageImg })}
                              className="w-10 h-7 object-cover rounded border border-zinc-800 hover:border-amber-500/50 hover:scale-110 cursor-zoom-in transition-all shrink-0"
                              title="点击放大查看此页图片"
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
                      <div 
                        onClick={() => setFullscreenSource({ type: 'image', url: editImageUrl })}
                        className="w-24 h-16 rounded-lg bg-zinc-950 border border-zinc-800 relative overflow-hidden shrink-0 cursor-zoom-in hover:border-amber-500/50 transition-colors group"
                        title="点击放大预览封面"
                      >
                        <img 
                          src={editImageUrl} 
                          alt="Cover Thumbnail" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                          <ImageIcon className="w-4 h-4 text-amber-500" />
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
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={editPdfUrl}
                        onChange={(e) => setEditPdfUrl(e.target.value)}
                        placeholder="PDF 链接 (如 cos、oss 直链或 pdf 文件链接)"
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-[10px] font-mono text-indigo-300 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleExtractPdf(editPdfUrl)}
                        disabled={isExtracting || !editPdfUrl}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[10px] font-mono font-bold rounded flex items-center gap-1 shrink-0 shadow transition-all active:scale-95 cursor-pointer"
                        title="使用 PDFJS 引擎智能解构提取 PDF 每一页高清原件内容"
                      >
                        <span>✨ 智能解析提取</span>
                      </button>
                    </div>
                    <p className="text-[9px] text-zinc-500 leading-normal font-sans">
                      💡 提示：输入您的 PDF 链接并点击【智能解析提取】，系统将自动运行浏览器端 PDF 解析引擎，将文档的前 8 页实时转化为可视交互卡片，解决您上传链接后无法获取内容的痛点。
                    </p>
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

      {/* High-Tech PDF Parsing Terminal Overlay */}
      {isExtracting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 backdrop-blur-md">
          <div className="w-full max-w-xl mx-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden font-mono flex flex-col h-[380px]">
            {/* Terminal Header */}
            <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-[11px] text-zinc-400 font-bold ml-2">ALPHA DECODER: PDF_PARSER_CORE.bin</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                <span className="text-[10px] text-zinc-500">ENGINE_BUSY</span>
              </div>
            </div>

            {/* Terminal Output Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-2 text-xs text-zinc-300">
              {extractionLog.map((log, index) => {
                let colorClass = "text-zinc-400";
                if (log.startsWith("[SUCCESS]")) colorClass = "text-emerald-400 font-bold";
                if (log.startsWith("[ERROR]")) colorClass = "text-rose-400 font-bold";
                if (log.startsWith("[WARN]")) colorClass = "text-amber-400";
                if (log.startsWith("[RENDER]")) colorClass = "text-indigo-300";
                return (
                  <div key={index} className={`leading-normal ${colorClass}`}>
                    {log}
                  </div>
                );
              })}
              
              {/* Spinning cursor at the end */}
              <div className="flex items-center gap-1.5 text-zinc-500">
                <span className="animate-pulse">_</span>
              </div>
            </div>

            {/* Terminal Footer Progress indicator */}
            <div className="px-4 py-2.5 bg-zinc-950 border-t border-zinc-850 text-[10px] text-zinc-500 flex justify-between items-center">
              <span>PDFJS DECRYPTION PIPELINE ACTIVE</span>
              <span className="text-zinc-400">MEMORY ALLOCATION: STABLE</span>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
