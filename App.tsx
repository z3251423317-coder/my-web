/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/* =================================================================================
 * ■ SECTION 1: IMPORTS & THIRD-PARTY LIBRARIES
 * ================================================================================= */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroScene, QuantumComputerScene } from './components/QuantumScene';
import { SurfaceCodeDiagram, TransformerDecoderDiagram, PerformanceMetricDiagram } from './components/Diagrams';
import { 
  ArrowDown, Menu, X, BookOpen, Layers, Eye, EyeOff, RotateCcw, 
  HelpCircle, Monitor, Compass, LayoutGrid, Check, Image as ImageIcon, 
  Video as VideoIcon, Sparkles, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Send, MapPin, 
  Phone, Globe, Copy, RefreshCw, Palette, UploadCloud, AlertTriangle, CheckCircle,
  Trash2, Plus, Minus, ExternalLink, Code, GripVertical, Smartphone, Music, Settings,
  Search, Star, Play, Pause, Edit3, Lock, Database, Download, Upload
} from 'lucide-react';
import { ScreenData, BackgroundType, RelationshipCard } from './types';
import PillNav, { PillNavItem } from './components/PillNav';
import LogoLoop from './components/LogoLoop';
import ErrorBoundary from './components/ErrorBoundary';
import InfiniteMenu from './components/InfiniteMenu';
import DomeGallery from './components/DomeGallery';
import ProfileCard from './components/ProfileCard';
import { PdfDecoderPage } from './components/PdfDecoderPage';
import { AudioSecondaryPage } from './components/AudioSecondaryPage';
import { SubCardSelectModal } from './components/SubCardSelectModal';
import ShinyText from './components/ShinyText';
import { MusicPlayer } from './components/MusicPlayer';
import { db } from './firebase-config';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import defaultUserData from './user_data.json';

import { DEFAULT_MARQUEE_CARDS, DEFAULT_QUANTUM_CARDS, DEFAULT_DOME_CARDS, DEFAULT_SCREEN7_CARDS, DEFAULT_SCREEN7_TABS, DEFAULT_SCREEN3_TABS, MarqueeCard } from './src/cardData';

/* =================================================================================
 * ■ SECTION 2: CONSTANTS, DEFAULT CONFIGURATIONS & COMPONENT SCHEMAS
 * ================================================================================= */

const getCardColorAndIcon = (colorType: string = "blue") => {
  switch (colorType.toLowerCase()) {
    case "indigo": return { style: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:border-indigo-400/50 hover:shadow-indigo-500/10", glow: "from-indigo-500/25 to-transparent", icon: Layers };
    case "teal": return { style: "border-teal-500/30 text-teal-400 bg-teal-500/10 hover:border-teal-400/50 hover:shadow-teal-500/10", glow: "from-teal-500/25 to-transparent", icon: Sparkles };
    case "amber": return { style: "border-amber-500/30 text-amber-400 bg-amber-500/10 hover:border-amber-400/50 hover:shadow-amber-500/10", glow: "from-amber-500/25 to-transparent", icon: RotateCcw };
    case "rose": return { style: "border-rose-500/30 text-rose-400 bg-rose-500/10 hover:border-rose-400/50 hover:shadow-rose-500/10", glow: "from-rose-500/25 to-transparent", icon: Compass };
    case "purple": return { style: "border-purple-500/30 text-purple-400 bg-purple-500/10 hover:border-purple-400/50 hover:shadow-purple-500/10", glow: "from-purple-500/25 to-transparent", icon: LayoutGrid };
    case "emerald": return { style: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:border-emerald-400/50 hover:shadow-emerald-500/10", glow: "from-emerald-500/25 to-transparent", icon: ChevronRight };
    case "pink": return { style: "border-pink-500/30 text-pink-400 bg-pink-500/10 hover:border-pink-400/50 hover:shadow-pink-500/10", glow: "from-pink-500/25 to-transparent", icon: CheckCircle };
    case "sky": return { style: "border-sky-500/30 text-sky-400 bg-sky-500/10 hover:border-sky-400/50 hover:shadow-sky-500/10", glow: "from-sky-500/25 to-transparent", icon: RefreshCw };
    case "fuchsia": return { style: "border-fuchsia-500/30 text-fuchsia-400 bg-fuchsia-500/10 hover:border-fuchsia-400/50 hover:shadow-fuchsia-500/10", glow: "from-fuchsia-500/25 to-transparent", icon: Monitor };
    case "gray": return { style: "border-zinc-500/30 text-zinc-400 bg-zinc-800/50 hover:border-zinc-400/50 hover:shadow-zinc-500/10", glow: "from-zinc-500/25 to-transparent", icon: LayoutGrid };
    case "blue":
    default: return { style: "border-blue-500/30 text-blue-400 bg-blue-500/10 hover:border-blue-400/50 hover:shadow-blue-500/10", glow: "from-blue-500/25 to-transparent", icon: Palette };
  }
};

/* =================================================================================
 * ■ ScrollMarquee Component (Enables smooth drag-to-scroll, touch swipe & autoscroll)
 * ================================================================================= */
interface ScrollMarqueeProps {
  items: any[];
  renderItem: (item: any, index: number, groupIdx: number) => React.ReactNode;
  speed?: number;
  reverse?: boolean;
  autoPlay?: boolean;
}

const ScrollMarquee: React.FC<ScrollMarqueeProps> = ({ 
  items, 
  renderItem, 
  speed = 1, 
  reverse = false,
  autoPlay = true 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const startXRef = useRef(0);
  const startScrollXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const [isHovered, setIsHovered] = useState(false);
  const scrollPosRef = useRef(0);

  const totalWidthRef = useRef(0);
  const singleSetWidthRef = useRef(0);

  // We repeat items 5 times to create a safe, infinite boundary for left/right swiping
  const repeats = 5;
  const repeatedItems = React.useMemo(() => {
    if (!items || items.length === 0) return [];
    return Array(repeats).fill(items).flat();
  }, [items]);

  // Use useLayoutEffect to measure dimensions and set initial position synchronously before paint
  React.useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner || items.length === 0) return;

    const updateDimensions = () => {
      const scrollWidth = inner.scrollWidth;
      if (scrollWidth > 0) {
        totalWidthRef.current = scrollWidth;
        const sw = scrollWidth / repeats;
        singleSetWidthRef.current = sw;
        
        // Position at the 2nd segment if start position is 0
        if (scrollPosRef.current === 0 && sw > 0) {
          scrollPosRef.current = sw * 2;
          inner.style.transform = `translate3d(${-scrollPosRef.current}px, 0, 0)`;
        }
      }
    };

    updateDimensions();

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });
    observer.observe(inner);

    // Multi-staged layout checks for slow-mounting elements/images
    const t1 = setTimeout(updateDimensions, 100);
    const t2 = setTimeout(updateDimensions, 400);
    const t3 = setTimeout(updateDimensions, 1200);

    return () => {
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [items]);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner || items.length === 0) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const singleSetWidth = singleSetWidthRef.current;
      
      // Calculate delta-time (elapsed seconds since last frame)
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Cap delta time to handle browser tab switching gracefully
      const clampedDt = Math.min(dt, 0.1);

      if (singleSetWidth > 0 && !isDown && !isHovered && autoPlay) {
        // Base scrolling speed in pixels per second: e.g. 0.15 * 480 = 72 pixels/sec
        const pixelsPerSecond = 480 * speed;
        const delta = (reverse ? -pixelsPerSecond : pixelsPerSecond) * clampedDt;

        scrollPosRef.current += delta;

        // Seamless wrap boundary checks
        if (scrollPosRef.current >= singleSetWidth * 3.5) {
          scrollPosRef.current -= singleSetWidth;
        } else if (scrollPosRef.current <= singleSetWidth * 0.5) {
          scrollPosRef.current += singleSetWidth;
        }

        // Single layout-free scroll write using high precision decimals
        inner.style.transform = `translate3d(${-scrollPosRef.current}px, 0, 0)`;
      } else {
        lastTime = time;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [items, speed, reverse, isDown, isHovered, autoPlay]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    setIsDown(true);
    isDraggingRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    startScrollXRef.current = scrollPosRef.current;
  };

  const handleMouseLeave = () => {
    setIsDown(false);
    setIsHovered(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown) return;
    const el = containerRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    e.preventDefault();

    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 4) {
      isDraggingRef.current = true;
    }

    let newScroll = startScrollXRef.current - walk;
    const singleSetWidth = singleSetWidthRef.current;
    
    if (singleSetWidth > 0) {
      if (newScroll >= singleSetWidth * 3.5) {
        newScroll -= singleSetWidth;
        startXRef.current = e.pageX - el.offsetLeft;
        startScrollXRef.current = newScroll;
      } else if (newScroll <= singleSetWidth * 0.5) {
        newScroll += singleSetWidth;
        startXRef.current = e.pageX - el.offsetLeft;
        startScrollXRef.current = newScroll;
      }
    }

    scrollPosRef.current = newScroll;
    inner.style.transform = `translate3d(${-newScroll}px, 0, 0)`;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDown(true);
    isDraggingRef.current = false;
    startXRef.current = e.touches[0].pageX;
    startScrollXRef.current = scrollPosRef.current;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDown) return;
    const inner = innerRef.current;
    if (!inner) return;

    const x = e.touches[0].pageX;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 4) {
      isDraggingRef.current = true;
    }

    let newScroll = startScrollXRef.current - walk;
    const singleSetWidth = singleSetWidthRef.current;

    if (singleSetWidth > 0) {
      if (newScroll >= singleSetWidth * 3.5) {
        newScroll -= singleSetWidth;
        startXRef.current = x;
        startScrollXRef.current = newScroll;
      } else if (newScroll <= singleSetWidth * 0.5) {
        newScroll += singleSetWidth;
        startXRef.current = x;
        startScrollXRef.current = newScroll;
      }
    }

    scrollPosRef.current = newScroll;
    inner.style.transform = `translate3d(${-newScroll}px, 0, 0)`;
  };

  const handleTouchEnd = () => {
    setIsDown(false);
  };

  if (!items || items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') {
          setIsHovered(true);
        }
      }}
      onPointerLeave={() => {
        setIsHovered(false);
        setIsDown(false);
      }}
      className="overflow-hidden w-full select-none relative cursor-grab active:cursor-grabbing pointer-events-auto"
      style={{ touchAction: "pan-y" }}
      onClickCapture={(e) => {
        if (isDraggingRef.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div
        ref={innerRef}
        className="flex flex-row flex-nowrap gap-6 py-4 w-max"
        style={{
          willChange: 'transform'
        }}
      >
        {repeatedItems.map((item, idx) => {
          const groupIdx = Math.floor(idx / items.length);
          const originalIndex = idx % items.length;
          return (
            <div key={`${idx}-${item.id}-${groupIdx}`} className="shrink-0 flex items-stretch">
              {renderItem(item, originalIndex, groupIdx)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/// Default Screen Templates
const DEFAULT_SCREENS: ScreenData[] = [
  {
    "id": 1,
    "label": "01. Title Hero",
    "title": "塑造",
    "subtitle": "我不在执迷寻找\n我是谁由我自己塑造",
    "subtitleDelay": 2.0,
    "description": "A state-of-the-art recurrent, transformer-based neural network model that learns to decode surface code errors with unprecedented reliability on real quantum processors.",
    "descriptionDelay": 3.5,
    "bgType": "video",
    "bgUrl": "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/%E5%8F%91%E7%8E%B0%E6%9B%B4%E5%A4%9A%E7%B2%BE%E5%BD%A9%E8%A7%86%E9%A2%91%20-%20%E6%8A%96%E9%9F%B3%E6%90%9C%E7%B4%A2.mp4",
    "bgTypeMobile": "video",
    "bgUrlMobile": "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/%E9%A6%96%E9%A1%B5%E8%A7%86%E9%A2%91/%E4%B8%80%E8%84%9A%E8%B8%A9%E5%88%B0%E6%B0%B4%E5%9D%91%E9%87%8C%E7%9A%84%E6%8A%96%E9%9F%B3%20-%20%E6%8A%96%E9%9F%B3.mp4",
    "overlayOpacity": 45,
    "overlayBlur": 0,
    "tintColor": "slate",
    "align": "left",
    "ctaText": "",
    "ctaUrl": "#screen-2",
    "bgMusicUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    "id": 2,
    "label": "02. Relationship Ecology",
    "title": "甘露与苦药：亲密关系生态解析",
    "subtitle": "论不合适背后亲密关系中情感供需的结构性失衡 (WXJB-2663-001)",
    "description": "点击下方按钮，进入专门为您构建的情感特征失衡解析看板。深度剖析付出者与接受者之间单向情感输出与接收的结构性逆差，将爱之“甘露”化作解构彼此亲密关系的微观密钥。",
    "bgType": "gradient",
    "bgUrl": "linear-gradient(to right, #0f172a, #050b14)",
    "bgTypeMobile": "video",
    "bgUrlMobile": "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/%E9%A6%96%E9%A1%B5%E8%A7%86%E9%A2%91/2.mp4",
    "bgOpacity": 55,
    "overlayOpacity": 20,
    "overlayBlur": 0,
    "tintColor": "none",
    "align": "left",
    "ctaText": "进入情感供需看板 / DECODE NOW",
    "ctaUrl": "#screen-3",
    "bgMusicUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    "id": 3,
    "label": "03. Recursive Brain",
    "title": "无限进步",
    "subtitle": "Parsing complex spatial & temporal error clusters",
    "description": "以矛盾观审视生活，用实践完成自我迭代",
    "bgType": "video",
    "bgUrl": "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/%E4%B8%80%E8%84%9A%E8%B8%A9%E5%88%B0%E6%B0%B4%E5%9D%91%E9%87%8C%E7%9A%84%E6%8A%96%E9%9F%B3%20-%20%E6%8A%96%E9%9F%B3.mp4",
    "bgTypeMobile": "video",
    "bgUrlMobile": "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/%E4%B8%89%E5%B1%8F%E7%A7%BB%E5%8A%A8%E7%AB%AF.mp4",
    "overlayOpacity": 70,
    "overlayBlur": 3,
    "tintColor": "indigo",
    "align": "right",
    "ctaText": "",
    "ctaUrl": "#screen-4",
    "bgMusicUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    "id": 4,
    "label": "04. Benchmarks",
    "title": "Empirical Precision Gains",
    "subtitle": "Lower logical error rates across code distances",
    "description": "AlphaQubit outscores modern industry-standard algorithms, like Minimum-Weight Perfect Matching (MWPM), on all standard scales. Click the dynamic distances (3, 5, or 11) to study absolute error decay.",
    "bgType": "image",
    "bgUrl": "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=2000&auto=format&fit=crop",
    "overlayOpacity": 40,
    "overlayBlur": 0,
    "tintColor": "none",
    "align": "center",
    "ctaText": "See Live Data Sheets",
    "ctaUrl": "#screen-5"
  },
  {
    "id": 5,
    "label": "05. Hardware Lab",
    "title": "Deep In-Processor Trial",
    "subtitle": "Sycamore Superconducting Processor Deployment",
    "description": "We validate our model against real physical data generated directly on Google's Sycamore quantum computer, yielding pristine predictions even on highly complex, asymmetric error signals.",
    "bgType": "image",
    "bgUrl": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2000&auto=format&fit=crop",
    "overlayOpacity": 50,
    "overlayBlur": 0,
    "tintColor": "none",
    "align": "left",
    "ctaText": "Hardware Specs",
    "ctaUrl": "#screen-6"
  },
  {
    "id": 6,
    "label": "06. Interactive Trial Deck",
    "title": "Sycamore Syndrome Diagnostic Suite",
    "subtitle": "Real-time spatial error patterns and physical latency metrics",
    "description": "Click any card in the continuous right-to-left feed to lock onto the signal, analyze real-time spatial error patterns, and review physical latency metrics.",
    "bgType": "image",
    "bgUrl": "",
    "overlayOpacity": 30,
    "overlayBlur": 0,
    "tintColor": "none",
    "align": "center",
    "ctaText": "Launch Diagnostics",
    "ctaUrl": "#screen-7"
  },
  {
    "id": 7,
    "label": "07. Global Roadmap",
    "title": "Evolution of Quantum Systems",
    "subtitle": "Timeline of the fault-tolerance horizon",
    "description": "Our blueprint stretches over key functional eras—from initial noisy hardware calibration (Phase 1) to scalable error correction (Phase 3) and full multi-thousand physical cubyte computational systems (Phase 4).",
    "bgType": "image",
    "bgUrl": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000",
    "overlayOpacity": 75,
    "overlayBlur": 1,
    "tintColor": "slate",
    "align": "center",
    "ctaText": "Join Team Pathway",
    "ctaUrl": "#screen-8"
  },
  {
    "id": 8,
    "label": "08. Perspective",
    "title": "Revolutionary Foundations",
    "subtitle": "The word from our leadership team",
    "description": "By utilizing direct machine-learned patterns over simulated templates, we break past theoretical algorithm boundaries, making physical quantum computers appear substantially cleaner than their physical components indicate.",
    "bgType": "image",
    "bgUrl": "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop",
    "overlayOpacity": 80,
    "overlayBlur": 2,
    "tintColor": "gold",
    "align": "left",
    "ctaText": "Read Joint Publication",
    "ctaUrl": "#screen-9"
  },
  {
    "id": 9,
    "label": "09. Access Point",
    "title": "Connect with AlphaQubit",
    "subtitle": "Enter the fault-tolerant era today",
    "description": "Be the first to access our open-source research code pipelines, test your customs models, or initiate corporate research partnerships with our high-performance simulation grid.",
    "bgType": "image",
    "bgUrl": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2000",
    "overlayOpacity": 65,
    "overlayBlur": 4,
    "tintColor": "slate",
    "align": "center",
    "ctaText": "Subscribe to Bulletins",
    "ctaUrl": "#"
  }
];

// Pre-defined Custom Theme Packs
const THEME_PACKS = [
  {
    id: "alpha-research",
    name: "AlphaQubit Editorial (Slate / Gold)",
    desc: "A stunning academic editorial visual showcase, with high-prestige gold and deep charcoal highlights.",
    tint: "slate",
    accent: "text-amber-400 border-amber-500 hover:bg-amber-500",
    screens: DEFAULT_SCREENS
  },
  {
    id: "cyber-matrix",
    name: "Cybernetic AI Core (Purple / Cyber Cyan)",
    desc: "Futuristic dark cyber grids, glowing code streams, high-intensity neon nodes, and space dust.",
    tint: "indigo",
    accent: "text-cyan-400 border-cyan-400 hover:bg-cyan-400",
    screens: DEFAULT_SCREENS.map((s, idx) => ({
      ...s,
      bgType: (idx % 2 === 0 ? "video" : "gradient") as BackgroundType,
      bgUrl: idx % 2 === 0 
        ? "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-3112-large.mp4"
        : "linear-gradient(225deg, #09090b 0%, #1e1b4b 70%, #581c87 100%)",
      tintColor: "indigo" as any,
      overlayOpacity: 45,
      overlayBlur: Math.min(2, idx)
    }))
  },
  {
    id: "luxury-hotel",
    name: "Luxury Interior Concept (Stone Cream / Brass)",
    desc: "Bright architectural shapes, warm designer shadows, chic golden hour light, mid-century elite luxury.",
    tint: "gold",
    accent: "text-[#c5a059] border-[#c5a059] hover:bg-[#c5a059]",
    screens: DEFAULT_SCREENS.map((s, idx) => ({
      ...s,
      bgType: "image" as BackgroundType,
      bgUrl: idx % 2 === 0
        ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000"
        : "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=2000",
      tintColor: "gold" as any,
      overlayOpacity: 40,
      overlayBlur: 0
    }))
  },
  {
    id: "ocean-climate",
    name: "Oceanic Science (Aqua Green / Marine Blue)",
    desc: "Deep marine exploration, serene slow ocean swells, teal gradients, and clear scientific layouts.",
    tint: "emerald",
    accent: "text-teal-400 border-teal-500 hover:bg-teal-500",
    screens: DEFAULT_SCREENS.map((s, idx) => ({
      ...s,
      bgType: (idx % 3 === 0 ? "video" : "image") as BackgroundType,
      bgUrl: idx % 3 === 0
        ? "https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-background-from-below-25804-large.mp4"
        : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000",
      tintColor: "emerald" as any,
      overlayOpacity: idx % 3 === 0 ? 55 : 30,
      overlayBlur: 1
    }))
  }
];

const PRESET_BG_IMAGES = [
  { name: "Digital Network", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000" },
  { name: "Architectural Lines", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000" },
  { name: "Ocean Horizon", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000" },
  { name: "Premium Villa", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000" },
  { name: "Office Glass", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000" },
  { name: "Alpine Sunrise", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2000" },
  { name: "Purple Aurora", url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000" }
];

const PRESET_BG_VIDEOS = [
  { name: "Digital Particles Network", url: "https://assets.mixkit.co/videos/preview/mixkit-digital-particles-and-glowing-nodes-43031-large.mp4" },
  { name: "Futuristic Laser Lights", url: "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-3112-large.mp4" },
  { name: "Infinite Stars Tunnel", url: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4" },
  { name: "Cosmic Neon Rings", url: "https://assets.mixkit.co/videos/preview/mixkit-tunnel-of-futuristic-blue-lights-42205-large.mp4" },
  { name: "Ethereal Sky Dynamics", url: "https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-background-from-below-25804-large.mp4" }
];

interface SafeVideoProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  muted?: boolean;
}

// Global tracker to handle cases where user has interacted with the page before a video component mounts
let globalHasInteracted = false;
if (typeof window !== "undefined") {
  const markInteracted = () => {
    globalHasInteracted = true;
    // We can't really remove these easily if we want them to catch everything, but 'once' helps for each specific trigger
  };
  window.addEventListener("click", markInteracted, { capture: true, passive: true });
  window.addEventListener("touchstart", markInteracted, { capture: true, passive: true });
}

const SafeVideo: React.FC<SafeVideoProps> = ({ src, className, style, muted = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force muted & playsinline programmatically to bypass React bugs & aggressive browser rules
    video.defaultMuted = muted;
    video.muted = muted;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    
    // Force browser to load the video since src changed
    try {
      video.load();
    } catch (e) {
      console.log("video.load() failed", e);
    }
    
    // Attempt playback
    const playVideo = () => {
      if (video) {
        const promise = video.play();
        if (promise !== undefined) {
          promise.catch(err => {
            console.log("SafeVideo autoPlay blocked, waiting for interaction:", err);
          });
        }
      }
    };

    // If we already know the user interacted, try playing immediately
    // Browsers often allow this if the user has touched the page once
    // Robust retry mechanism
    let retryInterval: any;
    const startRetryLoop = () => {
      if (retryInterval) clearInterval(retryInterval);
      let attempts = 0;
      retryInterval = setInterval(() => {
        attempts++;
        if (video && video.paused) {
          playVideo();
        }
        if (attempts > 5 || (video && !video.paused)) {
          clearInterval(retryInterval);
        }
      }, 1000);
    };

    playVideo();
    startRetryLoop();

    // Add robust video-ready events to trigger autoplay on slow networks or suspended loads
    video.addEventListener("loadedmetadata", playVideo);
    video.addEventListener("canplay", playVideo);
    video.addEventListener("suspend", playVideo);
    video.addEventListener("play", () => {
      if (retryInterval) clearInterval(retryInterval);
    });

    // WeChat Browser integration to trigger autoplay
    const handleWechat = () => {
      if (typeof window !== "undefined" && (window as any).WeixinJSBridge) {
        (window as any).WeixinJSBridge.invoke("getNetworkType", {}, () => {
          playVideo();
        });
      }
    };
    document.addEventListener("WeixinJSBridgeReady", handleWechat);

    // Listen for touch/click to play if autoplay was blocked by mobile settings or low power mode
    const handleInteraction = () => {
      globalHasInteracted = true;
      if (video && video.paused) {
        video.play().catch(err => {
          console.log("Interactive play failed:", err);
        });
      }
    };

    // We add listeners to the window so ANY click on the page triggers it
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });
    window.addEventListener("mousedown", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });

    return () => {
      if (retryInterval) clearInterval(retryInterval);
      if (video) {
        video.removeEventListener("loadedmetadata", playVideo);
        video.removeEventListener("canplay", playVideo);
        video.removeEventListener("suspend", playVideo);
      }
      document.removeEventListener("WeixinJSBridgeReady", handleWechat);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("mousedown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      style={style}
      src={src}
      loop
      muted={muted}
      playsInline
      webkit-playsinline="true"
      autoPlay
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
    />
  );
};

const DEFAULT_DATA_FINGERPRINT = "fp_v23_" + JSON.stringify(DEFAULT_MARQUEE_CARDS).length + "_" + JSON.stringify(DEFAULT_SCREENS).length + "_" + JSON.stringify(DEFAULT_QUANTUM_CARDS).length;

/* =================================================================================
 * ■ SECTION 3: CORE REACT COMPONENT & ROOT STATES
 * ================================================================================= */


function CardPasswordInput({ card, updateCard }: { card: MarqueeCard, updateCard: (id: number, fields: Partial<MarqueeCard>) => void }) {
  const [password, setPassword] = useState(card.password || "");
  const prevCardPassword = useRef(card.password);

  useEffect(() => {
    if (prevCardPassword.current !== card.password) {
      setPassword(card.password || "");
      prevCardPassword.current = card.password;
    }
  }, [card.password]);

  return (
    <input 
      type="password" 
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      onBlur={() => {
        prevCardPassword.current = password;
        updateCard(card.id, { password });
      }}
      className="w-full pl-8 pr-2.5 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white placeholder-zinc-700 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
      placeholder="Enter protection password..."
      autoComplete="new-password"
    />
  );
}

const App: React.FC = () => {
  const isAiStudio = typeof window !== 'undefined' && (
    window.location.hostname.includes('ais-dev-') || 
    window.location.hostname.includes('localhost') || 
    window.location.hostname.includes('127.0.0.1')
  );

  // Clear localStorage if code-defined defaults change to solve stale data issues from the root
  if (typeof window !== "undefined") {
    const currentFp = localStorage.getItem("alphaqubit_data_fingerprint");
    if (currentFp !== DEFAULT_DATA_FINGERPRINT) {
      localStorage.removeItem("alphaqubit_custom_screens_v11");
      localStorage.removeItem("alphaqubit_pill_nav_items_v5");
      localStorage.removeItem("alphaqubit_marquee_cards");
      localStorage.removeItem("alphaqubit_sphere_cards");
      localStorage.removeItem("alphaqubit_dome_cards");
      localStorage.removeItem("alphaqubit_trial_cards");
      localStorage.setItem("alphaqubit_data_fingerprint", DEFAULT_DATA_FINGERPRINT);
    }
  }

  const [screens, setScreens] = useState<ScreenData[]>(() => {
    const saved = localStorage.getItem("alphaqubit_custom_screens_v11");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: any) => {
            if (s.id === 1 || s.id === 3) {
              return { ...s, ctaText: "" };
            }
            return s;
          });
        }
      } catch (e) {
        console.error("Failed to parse screens from localStorage", e);
      }
    }
    return DEFAULT_SCREENS;
  });
  const [configLoaded, setConfigLoaded] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [isDbEmpty, setIsDbEmpty] = useState<boolean>(false);
  const [isInitializingDb, setIsInitializingDb] = useState<boolean>(false);
  const [dbErrorMsg, setDbErrorMsg] = useState<string>("");
  const [isRetryingDb, setIsRetryingDb] = useState<boolean>(false);
  const [showDbDiagnostics, setShowDbDiagnostics] = useState<boolean>(false);

  const loadConfigRef = useRef<(() => Promise<void>) | undefined>(undefined);

  /* =================================================================================
   * ■ SECTION 4: FIREBASE SYNC ENGINE & AUTO-INITIALIZATION
   * ================================================================================= */

  useEffect(() => {
    let isMounted = true;
    let unsubFirestore: (() => void) | null = null;

    const load = async (manual = false) => {
      if (manual && isMounted) setIsRetryingDb(true);
      
      try {
        let data: any = null;
        try {
          // Try local proxy API first in AI Studio environment
          const localRes = await fetch('/api/config');
          if (localRes.ok) {
            data = await localRes.json();
            console.log("Configuration loaded successfully from local proxy API (/api/config).");
          }
        } catch (localErr) {
          console.warn("Failed to fetch local proxy API, will try remote fallback...", localErr);
        }

        if (!data) {
          const remoteRes = await fetch(`https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/user_data.json?t=${Date.now()}`, {
            cache: 'no-store'
          });
          
          if (remoteRes.ok) {
            data = await remoteRes.json();
            console.log("Configuration loaded successfully from remote URL.");
          }
        }

        if (data) {
          if (isMounted) {
            setDbConnected(true);
            setIsDbEmpty(false);
            setDbErrorMsg("");
            if (data.screens) setScreens(data.screens);
            if (data.pillNavItems) setPillNavItems(data.pillNavItems);
            if (data.marqueeCards) setMarqueeCards(data.marqueeCards);
            if (data.sphereCards) setSphereCards(data.sphereCards);
            if (data.domeCards) setDomeCards(data.domeCards);
            if (data.trialCards) setTrialCards(data.trialCards);
            if (data.relationshipCards) setRelationshipCards(data.relationshipCards);
            if (data.screen7Cards) setScreen7Cards(data.screen7Cards);
            if (data.screen7Tabs) {
              setScreen7Tabs(data.screen7Tabs);
              localStorage.setItem("alphaqubit_screen7_tabs", JSON.stringify(data.screen7Tabs));
            }
            if (data.screen3TabsBg) {
              setScreen3TabsBg(data.screen3TabsBg);
              localStorage.setItem("alphaqubit_screen3_tabs_bg", data.screen3TabsBg);
            }
            if (data.screen7TabsBg) {
              setScreen7TabsBg(data.screen7TabsBg);
              localStorage.setItem("alphaqubit_screen7_tabs_bg", data.screen7TabsBg);
            }
            if (data.screen3Tabs) {
              setScreen3Tabs(data.screen3Tabs);
              localStorage.setItem("alphaqubit_screen3_tabs", JSON.stringify(data.screen3Tabs));
            }
            if (data.screen7GlowEnabled !== undefined) {
              setScreen7GlowEnabled(!!data.screen7GlowEnabled);
              localStorage.setItem("alphaqubit_screen7_glow_enabled", String(!!data.screen7GlowEnabled));
            }
            if (data.screen7GlowColor) {
              setScreen7GlowColor(data.screen7GlowColor);
              localStorage.setItem("alphaqubit_screen7_glow_color", data.screen7GlowColor);
            }
            setConfigLoaded(true);
            setIsRetryingDb(false);
            return;
          }
        }
        throw new Error("Failed to load valid configuration from local API or remote URL");
      } catch (err: any) {
        console.error("Failed to load configuration, falling back to local defaults...", err);
        
        // Fallback to default local data
        if (isMounted) {
          const fallback = defaultUserData as any;
          if (fallback.screens) setScreens(fallback.screens);
          if (fallback.pillNavItems) setPillNavItems(fallback.pillNavItems);
          if (fallback.marqueeCards) setMarqueeCards(fallback.marqueeCards);
          if (fallback.sphereCards) setSphereCards(fallback.sphereCards);
          if (fallback.domeCards) setDomeCards(fallback.domeCards);
          if (fallback.trialCards) setTrialCards(fallback.trialCards);
          if (fallback.relationshipCards) setRelationshipCards(fallback.relationshipCards);
          if (fallback.screen7Cards) setScreen7Cards(fallback.screen7Cards);
          if (fallback.screen7Tabs) {
            setScreen7Tabs(fallback.screen7Tabs);
            localStorage.setItem("alphaqubit_screen7_tabs", JSON.stringify(fallback.screen7Tabs));
          }
          if (fallback.screen3TabsBg) {
            setScreen3TabsBg(fallback.screen3TabsBg);
            localStorage.setItem("alphaqubit_screen3_tabs_bg", fallback.screen3TabsBg);
          }
          if (fallback.screen7TabsBg) {
            setScreen7TabsBg(fallback.screen7TabsBg);
            localStorage.setItem("alphaqubit_screen7_tabs_bg", fallback.screen7TabsBg);
          }
          if (fallback.screen3Tabs) {
            setScreen3Tabs(fallback.screen3Tabs);
            localStorage.setItem("alphaqubit_screen3_tabs", JSON.stringify(fallback.screen3Tabs));
          } else {
            setScreen3Tabs(DEFAULT_SCREEN3_TABS);
            localStorage.setItem("alphaqubit_screen3_tabs", JSON.stringify(DEFAULT_SCREEN3_TABS));
          }
          if (fallback.screen7GlowEnabled !== undefined) {
            setScreen7GlowEnabled(!!fallback.screen7GlowEnabled);
            localStorage.setItem("alphaqubit_screen7_glow_enabled", String(!!fallback.screen7GlowEnabled));
          }
          if (fallback.screen7GlowColor) {
            setScreen7GlowColor(fallback.screen7GlowColor);
            localStorage.setItem("alphaqubit_screen7_glow_color", fallback.screen7GlowColor);
          }
          
          setDbConnected(true);
          setIsDbEmpty(false);
          setDbErrorMsg("无法获取远程配置，已使用本地默认数据。");
          setConfigLoaded(true);
          setIsRetryingDb(false);
        }
      }
    };

    loadConfigRef.current = () => {
      // Manual retry: clean up old firestore subscription first to force a fresh test
      if (unsubFirestore) {
        unsubFirestore();
        unsubFirestore = null;
      }
      return load(true);
    };

    load();
    const interval = setInterval(() => {
      // Periodically attempt to refresh via proxy only if direct snapshot isn't listening or active
      if (!unsubFirestore) {
        load();
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (unsubFirestore) {
        unsubFirestore();
      }
    };
  }, []);


  const [activeId, setActiveId] = useState<number>(() => {
    const saved = sessionStorage.getItem("alphaqubit_last_active_id");
    if (saved) {
      const num = parseInt(saved, 10);
      if (!isNaN(num)) return num;
    }
    return 1;
  });

  const [pillNavItems, setPillNavItems] = useState<PillNavItem[]>(() => {
    const saved = localStorage.getItem("alphaqubit_pill_nav_items_v5");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.some((item: any) => item.href === "#screen-6")) {
          localStorage.removeItem("alphaqubit_pill_nav_items_v5");
          // return default below
        } else {
          return parsed;
        }
      } catch (e) { console.error(e); }
    }
    return [
      {
            "label": "首页",
            "href": "#screen-1"
      },
      {
            "label": "无限进步",
            "href": "#screen-3"
      },
      {
            "label": "建设中",
            "href": "#screen-5"
      },
      {
            "label": "建设中",
            "href": "#screen-6"
      },
      {
            "label": "建设中",
            "href": "#screen-7"
      }
];
  });

  const savePillNavItemsToStorage = (updated: PillNavItem[]) => {
    setPillNavItems(updated);
    localStorage.setItem("alphaqubit_pill_nav_items_v5", JSON.stringify(updated));
  };
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [scrollingTo, setScrollingTo] = useState<number | null>(null);
  const scrollingToRef = useRef<number | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("07:15:42");

  // Newsletter State
  const [subscriberMail, setSubscriberMail] = useState<string>("");
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success'>('idle');

  // Interactive Timeline state on Screen 7
  const [activeTimelinePhase, setActiveTimelinePhase] = useState<number>(1);

  // PDF Secondary Page Interactive State
  const [isPdfSecondaryPageOpen, setIsPdfSecondaryPageOpen] = useState<boolean>(false);

  // Missing editor state declarations
  const [editorOpen, setEditorOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'content' | 'background' | 'presets'>('content');

  // Dynamic Marquee Cards State for Screen 4 (which is the 3rd screen, index 2)
  const [marqueeCards, setMarqueeCards] = useState<MarqueeCard[]>(() => {
    const saved = localStorage.getItem("alphaqubit_marquee_cards");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved marquee cards", e);
      }
    }
    return DEFAULT_QUANTUM_CARDS;
  });

  // Migration: Automatically fix PDF URLs with wrong dash count in localStorage
  useEffect(() => {
    if (marqueeCards.length === 0) return;
    
    const wrongDashes = "E2%80%94%E2%80%94%E2%80%94%E2%80%94%E8";
    const correctDashes = "E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E8";
    
    const fixUrl = (url?: string) => {
      if (url && url.includes(wrongDashes) && !url.includes(correctDashes)) {
        return url.replace(wrongDashes, correctDashes);
      }
      return url;
    };

    let changed = false;
    const updated = marqueeCards.map(card => {
      const newUrl = fixUrl(card.pdfUrl);
      if (newUrl !== card.pdfUrl) {
        changed = true;
        return { ...card, pdfUrl: newUrl };
      }
      return card;
    });

    if (changed) {
      saveMarqueeCards(updated);
      console.log("Migrated PDF URLs to correct dash count in marqueeCards.");
    }

    // Also migrate other card sets
    const migrateSet = (set: MarqueeCard[], saver: (updated: MarqueeCard[]) => void, label: string) => {
      let setChanged = false;
      const updatedSet = set.map(card => {
        const newUrl = fixUrl(card.pdfUrl);
        if (newUrl !== card.pdfUrl) {
          setChanged = true;
          return { ...card, pdfUrl: newUrl };
        }
        return card;
      });
      if (setChanged) {
        saver(updatedSet);
        console.log(`Migrated PDF URLs in ${label}.`);
      }
    };

    migrateSet(sphereCards, saveSphereCards, "sphereCards");
    migrateSet(domeCards, saveDomeCards, "domeCards");
    migrateSet(trialCards, saveTrialCards, "trialCards");
  }, []);

  const saveMarqueeCards = (updated: MarqueeCard[]) => {
    setMarqueeCards(updated);
    localStorage.setItem("alphaqubit_marquee_cards", JSON.stringify(updated));
  };

  // Dynamic 3D Sphere Cards State for Screen 5 (which is the 4th screen, index 3)
  const [sphereCards, setSphereCards] = useState<MarqueeCard[]>(() => {
    const saved = localStorage.getItem("alphaqubit_sphere_cards");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved sphere cards", e);
      }
    }
    // Deep clone DEFAULT_QUANTUM_CARDS so changes are fully independent
    return JSON.parse(JSON.stringify(DEFAULT_QUANTUM_CARDS));
  });

  const saveSphereCards = (updated: MarqueeCard[]) => {
    setSphereCards(updated);
    localStorage.setItem("alphaqubit_sphere_cards", JSON.stringify(updated));
  };

  // Dome Cards State for Screen 6
  const [domeCards, setDomeCards] = useState<MarqueeCard[]>(() => {
    const saved = localStorage.getItem("alphaqubit_dome_cards");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved dome cards", e);
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_DOME_CARDS));
  });

  const saveDomeCards = (updated: MarqueeCard[]) => {
    setDomeCards(updated);
    localStorage.setItem("alphaqubit_dome_cards", JSON.stringify(updated));
  };

  // Trial Cards State for Screen 10
  const [trialCards, setTrialCards] = useState<MarqueeCard[]>(() => {
    const saved = localStorage.getItem("alphaqubit_trial_cards");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved trial cards", e);
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_MARQUEE_CARDS));
  });

  const [screen7Cards, setScreen7Cards] = useState<MarqueeCard[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("alphaqubit_screen7_cards");
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error("Failed to parse saved screen 7 cards", e);
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_SCREEN7_CARDS));
  });

  const [screen7GlowEnabled, setScreen7GlowEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("alphaqubit_screen7_glow_enabled");
      if (saved !== null) {
        return saved === "true";
      }
    }
    return true;
  });

  const [screen7GlowColor, setScreen7GlowColor] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("alphaqubit_screen7_glow_color");
      if (saved) {
        return saved;
      }
    }
    return "#fbbf24";
  });

  const saveScreen7GlowEnabled = (val: boolean) => {
    setScreen7GlowEnabled(val);
    localStorage.setItem("alphaqubit_screen7_glow_enabled", String(val));
    if (db && typeof window !== 'undefined') {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        setDoc(doc(db, 'system_config', 'screen7GlowEnabled'), { data: val }).catch(console.error);
      });
    }
  };

  const saveScreen7GlowColor = (val: string) => {
    setScreen7GlowColor(val);
    localStorage.setItem("alphaqubit_screen7_glow_color", val);
    if (db && typeof window !== 'undefined') {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        setDoc(doc(db, 'system_config', 'screen7GlowColor'), { data: val }).catch(console.error);
      });
    }
  };

  const saveScreen7Cards = (updated: MarqueeCard[]) => {
    setScreen7Cards(updated);
    localStorage.setItem("alphaqubit_screen7_cards", JSON.stringify(updated));
    
    // Also save to firebase if possible
    if (db && typeof window !== 'undefined') {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        setDoc(doc(db, 'system_config', 'screen7Cards'), { data: updated }).catch(console.error);
      });
    }
  };

  const [screen7Tabs, setScreen7Tabs] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("alphaqubit_screen7_tabs");
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error("Failed to parse saved screen 7 tabs", e);
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_SCREEN7_TABS));
  });

  const saveScreen7Tabs = (updated: string[]) => {
    setScreen7Tabs(updated);
    localStorage.setItem("alphaqubit_screen7_tabs", JSON.stringify(updated));
    if (db && typeof window !== 'undefined') {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        setDoc(doc(db, 'system_config', 'screen7Tabs'), { data: updated }).catch(console.error);
      });
    }
  };

  const [activeScreen7Tab, setActiveScreen7Tab] = useState<string>("全部");

  const [screen3Tabs, setScreen3Tabs] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("alphaqubit_screen3_tabs");
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error("Failed to parse saved screen 3 tabs", e);
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_SCREEN3_TABS));
  });

  const saveScreen3Tabs = (updated: string[]) => {
    setScreen3Tabs(updated);
    localStorage.setItem("alphaqubit_screen3_tabs", JSON.stringify(updated));
    if (db && typeof window !== 'undefined') {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        setDoc(doc(db, 'system_config', 'screen3Tabs'), { data: updated }).catch(console.error);
      });
    }
  };

  const [activeScreen3Tab, setActiveScreen3Tab] = useState<string>("全部");
  const [screen3TabsBg, setScreen3TabsBg] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem("alphaqubit_screen3_tabs_bg") || "transparent";
    return "transparent";
  });
  const [screen7TabsBg, setScreen7TabsBg] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem("alphaqubit_screen7_tabs_bg") || "transparent";
    return "transparent";
  });

  const [globalMuted, setGlobalMuted] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("alphaqubit_global_muted");
      return saved === "true";
    }
    return false;
  });

  const saveGlobalMuted = (muted: boolean) => {
    setGlobalMuted(muted);
    localStorage.setItem("alphaqubit_global_muted", String(muted));
  };




  const saveTrialCards = (updated: MarqueeCard[]) => {
    setTrialCards(updated);
    localStorage.setItem("alphaqubit_trial_cards", JSON.stringify(updated));
  };

  // Relationship Cards State for PdfDecoderPage (Screen 2 Secondary)
  const [relationshipCards, setRelationshipCards] = useState<RelationshipCard[]>(() => {
    const saved = localStorage.getItem("alphaqubit_relationship_cards_v5");
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
    // Hardcoded initial data from PdfDecoderPage.tsx
    return [
      {
        id: "rel-1783354475690",
        title: "2.基于日常吵架原因与深度聊天之间的几种可能性研究（WXJB-2668-002）",
        cat: "自定义分析 / Custom",
        desc: "自定义创建的情感供需分析卡片。",
        imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
        pdfUrl: "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/%E6%9E%84%E7%9F%B3%E6%96%87%E6%A1%A3/2.%E5%9F%BA%E4%BA%8E%E6%97%A5%E5%B8%B8%E5%90%B5%E6%9E%B6%E5%8E%9F%E5%9B%A0%E4%B8%8E%E6%B7%B1%E5%BA%A6%E8%81%8A%E5%A4%A9%E4%B9%8B%E9%97%B4%E7%9A%84%E5%87%A0%E7%A7%8D%E5%8F%AF%E8%83%BD%E6%80%A7%E7%A0%94%E7%A9%B6%EF%BC%88WXJB-2668-002%EF%BC%89.pdf",
        pdfPageImages: [
          "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200&auto=format&fit=crop"
        ],
        imbalanceScore: 50,
        notes: "可编辑深度论文研读笔记或分析心得...",
        lastUpdated: "2026-07-06 16:14",
        audioModules: [],
        colorType: "indigo"
      },
      {
        id: "rel-1783354155744",
        title: "1.此为甘饴，彼之苦药——论不合适的背后亲密关系中情感供需的结构性失衡（WXJB-2663-001）",
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
        lastUpdated: "2026-07-06 16:09",
        audioModules: [
          {
            id: "mod-1783061786526",
            name: "11",
            audioUrl: "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/%E5%BD%95%E9%9F%B3%E6%96%87%E4%BB%B6/%E6%9C%B1%E8%B4%B5%E5%93%B2/26.07.01.mp3",
            duration: "02:30",
            rating: 5,
            status: "启用",
            createdAt: "2026年7月3日 下午2:56:26",
            updatedAt: "2026年7月3日 下午2:56:26",
            user: "管理员"
          }
        ],
        colorType: "emerald"
      }
    ];
  });

  const saveRelationshipCards = (updated: RelationshipCard[]) => {
    setRelationshipCards(updated);
    localStorage.setItem("alphaqubit_relationship_cards_v5", JSON.stringify(updated));
  };

  const [activeConsoleScreenId, setActiveConsoleScreenId] = useState<number | null>(null);
  const [enlargedCard, setEnlargedCard] = useState<MarqueeCard | null>(null);
  const [consoleTab, setConsoleTab] = useState<'cards' | 'bg'>('cards');
  const [domeAutoRotate, setDomeAutoRotate] = useState<boolean>(true);
  const [domeAutoRotateSpeed, setDomeAutoRotateSpeed] = useState<number>(0.15);
  const [activeCardDetail, setActiveCardDetail] = useState<MarqueeCard | null>(null);
  const [selectedCard6, setSelectedCard6] = useState<MarqueeCard | null>(null);
  const [selectedSubCard, setSelectedSubCard] = useState<any | null>(null);
  const [isSubCardModalOpen, setIsSubCardModalOpen] = useState<boolean>(false);
  const [isAudioSecondaryPageOpen, setIsAudioSecondaryPageOpen] = useState<boolean>(false);
  const [formSearch6, setFormSearch6] = useState<string>("");
  const [formStatus6, setFormStatus6] = useState<string>("全部");
  const [activeFormSearch6, setActiveFormSearch6] = useState<string>("");
  const [activeFormStatus6, setActiveFormStatus6] = useState<string>("全部");
  const [editingModule6, setEditingModule6] = useState<any | null>(null);
  const [isAddingModule6, setIsAddingModule6] = useState<boolean>(false);
  const [playingAudioId6, setPlayingAudioId6] = useState<string | null>(null);
  const [activeAudioObj6, setActiveAudioObj6] = useState<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!selectedCard6 && activeAudioObj6) {
      activeAudioObj6.pause();
      setActiveAudioObj6(null);
      setPlayingAudioId6(null);
    }
  }, [selectedCard6, activeAudioObj6]);

  // Refs for tracking swipe gestures on mobile
  const appPageTouchStartRef = useRef<{ x: number, y: number } | null>(null);

  // 1. Sync isPdfSecondaryPageOpen with history
  useEffect(() => {
    if (isPdfSecondaryPageOpen) {
      if (window.history.state?.modal !== 'pdf') {
        window.history.pushState({ modal: 'pdf' }, '');
      }
    } else {
      if (window.history.state?.modal === 'pdf') {
        window.history.back();
      }
    }
  }, [isPdfSecondaryPageOpen]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isPdfSecondaryPageOpen && e.state?.modal !== 'pdf') {
        setIsPdfSecondaryPageOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isPdfSecondaryPageOpen]);

  // 2. Sync isAudioSecondaryPageOpen with history
  useEffect(() => {
    if (isAudioSecondaryPageOpen) {
      if (window.history.state?.modal !== 'audio') {
        window.history.pushState({ modal: 'audio' }, '');
      }
    } else {
      if (window.history.state?.modal === 'audio') {
        window.history.back();
      }
    }
  }, [isAudioSecondaryPageOpen]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isAudioSecondaryPageOpen && e.state?.modal !== 'audio') {
        setIsAudioSecondaryPageOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAudioSecondaryPageOpen]);

  // 3. Sync activeCardDetail with history
  useEffect(() => {
    if (activeCardDetail) {
      if (window.history.state?.modal !== 'card-detail') {
        window.history.pushState({ modal: 'card-detail' }, '');
      }
    } else {
      if (window.history.state?.modal === 'card-detail') {
        window.history.back();
      }
    }
  }, [activeCardDetail]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (activeCardDetail && e.state?.modal !== 'card-detail') {
        setActiveCardDetail(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeCardDetail]);

  // 4. Sync editorOpen with history
  useEffect(() => {
    if (editorOpen) {
      if (window.history.state?.modal !== 'editor') {
        window.history.pushState({ modal: 'editor' }, '');
      }
    } else {
      if (window.history.state?.modal === 'editor') {
        window.history.back();
      }
    }
  }, [editorOpen]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (editorOpen && e.state?.modal !== 'editor') {
        setEditorOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [editorOpen]);

  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [showMasterBackupModal, setShowMasterBackupModal] = useState<boolean>(false);
  const [importJsonInput, setImportJsonInput] = useState<string>("");

  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Automatically open the PDF reader if the URL parameter or hash is set
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'pdf-decoder' || window.location.hash === '#pdf-decoder') {
      setIsPdfSecondaryPageOpen(true);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // The copy toast is now manually closed by the user to ensure they have enough time to copy the content.
  }, [copyToast]);

  // Synchronize state back to sessionStorage to survive page redirects
  useEffect(() => {
    sessionStorage.setItem("alphaqubit_last_active_id", String(activeId));
  }, [activeId]);

  useEffect(() => {
    sessionStorage.setItem("alphaqubit_is_pdf_open", isPdfSecondaryPageOpen ? "true" : "false");
  }, [isPdfSecondaryPageOpen]);

  useEffect(() => {
    sessionStorage.setItem("alphaqubit_is_audio_open", isAudioSecondaryPageOpen ? "true" : "false");
  }, [isAudioSecondaryPageOpen]);

  useEffect(() => {
    sessionStorage.setItem("alphaqubit_is_subcard_modal_open", isSubCardModalOpen ? "true" : "false");
  }, [isSubCardModalOpen]);

  useEffect(() => {
    sessionStorage.setItem("alphaqubit_selected_card6_id", selectedCard6 ? String(selectedCard6.id) : "");
  }, [selectedCard6]);

  useEffect(() => {
    sessionStorage.setItem("alphaqubit_selected_subcard_id", selectedSubCard ? String(selectedSubCard.id) : "");
  }, [selectedSubCard]);

  useEffect(() => {
    sessionStorage.setItem("alphaqubit_active_card_detail_id", activeCardDetail ? String(activeCardDetail.id) : "");
  }, [activeCardDetail]);

  // Run restoration when configuration loads (asynchronously)
  const [restored, setRestored] = useState<boolean>(false);
  useEffect(() => {
    if (configLoaded && screens.length > 0 && !restored) {
      setRestored(true);

      // 1. Scroll activeId into view immediately (if not 1)
      const savedActiveId = sessionStorage.getItem("alphaqubit_last_active_id");
      if (savedActiveId) {
        const id = parseInt(savedActiveId, 10);
        if (!isNaN(id) && id !== 1) {
          setTimeout(() => {
            const container = document.getElementById('slides-container');
            const elem = document.getElementById(`screen-${id}`);
            if (container && elem) {
              elem.scrollIntoView({ behavior: 'auto', block: 'start' });
              setActiveId(id);
            }
          }, 150);
        }
      }

      // 2. Resolve selectedCard6 and selectedSubCard
      const savedCardId = sessionStorage.getItem("alphaqubit_selected_card6_id");
      let resolvedCard: MarqueeCard | null = null;
      if (savedCardId && trialCards.length > 0) {
        const cardId = parseInt(savedCardId, 10);
        const card = trialCards.find(c => c.id === cardId);
        if (card) {
          setSelectedCard6(card);
          resolvedCard = card;

          // Resolve selectedSubCard
          const savedSubCardId = sessionStorage.getItem("alphaqubit_selected_subcard_id");
          if (savedSubCardId && card.subCards) {
            const sub = card.subCards.find(s => s.id === savedSubCardId);
            if (sub) {
              setSelectedSubCard(sub);
            }
          }
        }
      }

      // 3. Resolve activeCardDetail
      const savedDetailId = sessionStorage.getItem("alphaqubit_active_card_detail_id");
      if (savedDetailId) {
        const detailId = parseInt(savedDetailId, 10);
        const foundCard = [...marqueeCards, ...sphereCards, ...domeCards, ...trialCards].find(c => c.id === detailId);
        if (foundCard) {
          setActiveCardDetail(foundCard);
        }
      }

      // 4. Restore open modal flags (safely after resolving card context)
      const savedIsPdfOpen = sessionStorage.getItem("alphaqubit_is_pdf_open");
      if (savedIsPdfOpen === "true") {
        setIsPdfSecondaryPageOpen(true);
      }

      const savedIsAudioOpen = sessionStorage.getItem("alphaqubit_is_audio_open");
      if (savedIsAudioOpen === "true" && resolvedCard) {
        setIsAudioSecondaryPageOpen(true);
      }

      const savedIsSubCardOpen = sessionStorage.getItem("alphaqubit_is_subcard_modal_open");
      if (savedIsSubCardOpen === "true" && resolvedCard) {
        setIsSubCardModalOpen(true);
      }
    }
  }, [configLoaded, screens, trialCards, marqueeCards, sphereCards, domeCards, screen7Cards, restored]);

  /* =================================================================================
   * ■ SECTION 5: CARDS & MODULES DATA MANIPULATION (CRUD ENGINE)
   * ================================================================================= */

  const addMarqueeCard = () => {
    const nextId = marqueeCards.length > 0 ? Math.max(...marqueeCards.map(c => c.id)) + 1 : 1;
    const defaultTemplates = [
      { title: "Fault-Tolerant Decoder", cat: "CORE SYSTEM", desc: "Predicts noise errors dynamically using neural inference thresholds.", colorType: "teal" },
      { title: "Sycamore Calibrator", cat: "HARDWARE ENGINE", desc: "Automated drift correction module optimizing microwave pulses.", colorType: "indigo" },
      { title: "Cosmic Event Tracker", cat: "METRIC ANALYZIS", desc: "High-density scintillation tracking mapping background radiation.", colorType: "rose" },
      { title: "MWPM Super Solver", cat: "OPTIMIZER", desc: "Parallel graph perfect matcher solving threshold parameters.", colorType: "amber" }
    ];
    const template = defaultTemplates[nextId % defaultTemplates.length];
    const newCard: MarqueeCard = {
      id: nextId,
      title: template.title,
      cat: template.cat,
      desc: template.desc,
      url: "",
      colorType: template.colorType
    };
    saveMarqueeCards([...marqueeCards, newCard]);
  };

  const removeLastMarqueeCard = () => {
    if (marqueeCards.length > 1) {
      saveMarqueeCards(marqueeCards.slice(0, -1));
    }
  };

  const deleteMarqueeCard = (id: number) => {
    if (marqueeCards.length > 1) {
      saveMarqueeCards(marqueeCards.filter(c => c.id !== id));
    } else {
      if (window.confirm("这是最后一张走马灯卡片。删除它后对应的走马灯板块可能会显示为空（白屏）。您确定要删除最后一张卡片吗？")) {
        saveMarqueeCards(marqueeCards.filter(c => c.id !== id));
      }
    }
  };

  const updateMarqueeCard = (id: number, fields: Partial<MarqueeCard>) => {
    const updated = marqueeCards.map(c => c.id === id ? { ...c, ...fields } : c);
    saveMarqueeCards(updated);
  };

  const resetMarqueeCards = () => {
    if (window.confirm("Reset card matrices to Google default setup?")) {
      saveMarqueeCards(DEFAULT_MARQUEE_CARDS);
    }
  };

  const addSphereCard = () => {
    const nextId = sphereCards.length > 0 ? Math.max(...sphereCards.map(c => c.id)) + 1 : 1;
    const defaultTemplates = [
      { title: "Fault-Tolerant Decoder", cat: "CORE SYSTEM", desc: "Predicts noise errors dynamically using neural inference thresholds.", colorType: "teal" },
      { title: "Sycamore Calibrator", cat: "HARDWARE ENGINE", desc: "Automated drift correction module optimizing microwave pulses.", colorType: "indigo" },
      { title: "Cosmic Event Tracker", cat: "METRIC ANALYZIS", desc: "High-density scintillation tracking mapping background radiation.", colorType: "rose" },
      { title: "MWPM Super Solver", cat: "OPTIMIZER", desc: "Parallel graph perfect matcher solving threshold parameters.", colorType: "amber" }
    ];
    const template = defaultTemplates[nextId % defaultTemplates.length];
    const newCard: MarqueeCard = {
      id: nextId,
      title: template.title,
      cat: template.cat,
      desc: template.desc,
      url: "",
      colorType: template.colorType
    };
    saveSphereCards([...sphereCards, newCard]);
  };

  const removeLastSphereCard = () => {
    if (sphereCards.length > 1) {
      saveSphereCards(sphereCards.slice(0, -1));
    }
  };

  const deleteSphereCard = (id: number) => {
    if (sphereCards.length > 1) {
      saveSphereCards(sphereCards.filter(c => c.id !== id));
    } else {
      if (window.confirm("这是最后一张球形卡片。删除它后对应的球形板块可能会显示为空（白屏）。您确定要删除最后一张卡片吗？")) {
        saveSphereCards(sphereCards.filter(c => c.id !== id));
      }
    }
  };

  const updateSphereCard = (id: number, fields: Partial<MarqueeCard>) => {
    const updated = sphereCards.map(c => c.id === id ? { ...c, ...fields } : c);
    saveSphereCards(updated);
  };

  const resetSphereCards = () => {
    if (window.confirm("Reset 3D sphere card matrices to Google default setup?")) {
      saveSphereCards(DEFAULT_MARQUEE_CARDS);
    }
  };

  const updateCardInActiveList = (id: number, fields: Partial<MarqueeCard>) => {
    if (marqueeCards.some(c => c.id === id)) {
      updateMarqueeCard(id, fields);
    }
    if (sphereCards.some(c => c.id === id)) {
      updateSphereCard(id, fields);
    }
  };

  const handleCardClick = (card: MarqueeCard) => {
    setActiveCardDetail(card);
  };

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [terminalInput, setTerminalInput] = useState<string>("");
  const [activeCardLogs, setActiveCardLogs] = useState<string[]>([]);

  useEffect(() => {
    if (activeCardDetail) {
      const savedLogs = localStorage.getItem(`quantum_logs_card_${activeCardDetail.id}`);
      if (savedLogs) {
        try {
          setActiveCardLogs(JSON.parse(savedLogs));
        } catch {
          setActiveCardLogs([
            `[SYS/INIT] Establishing physical qubit diagnostic link for "${activeCardDetail.title}" (ID: ${activeCardDetail.id})...`,
            `[SYS/OK] Connected to hardware diagnostic port DX-${activeCardDetail.id.toString().padStart(4, '0')}.`,
            `[SYS/INFO] Input diagnostic notes or commands in the console below to update this card.`
          ]);
        }
      } else {
        setActiveCardLogs([
          `[SYS/INIT] Establishing physical qubit diagnostic link for "${activeCardDetail.title}" (ID: ${activeCardDetail.id})...`,
          `[SYS/OK] Connected to hardware diagnostic port DX-${activeCardDetail.id.toString().padStart(4, '0')}.`,
          `[SYS/INFO] Input diagnostic notes or commands in the console below to update this card.`
        ]);
      }
    } else {
      setActiveCardLogs([]);
    }
  }, [activeCardDetail]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeCardLogs]);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim() || !activeCardDetail) return;

    const userInput = terminalInput.trim();
    const updatedUserLogs = [
      ...activeCardLogs,
      `guest@alphaqubit:~$ ${userInput}`
    ];

    let reply = "";
    const cleanCmd = userInput.toLowerCase();

    if (cleanCmd === "help") {
      reply = `[HELP] Available system triggers:
  - set title <text>  | Standard name mapping update.
  - set desc <text>   | Writes new description to physical chassis ROM.
  - set cat <text>    | Changes the node category classification.
  - clear             | Clears system console buffer memory.
  Any other string inputs will directly update the card's active description block state!`;
    } else if (cleanCmd === "clear") {
      const cleared = [
        `[SYS] Console log buffer flushed.`,
        `[SYS/PROMPT] Input commands or description notes below:`
      ];
      setActiveCardLogs(cleared);
      localStorage.setItem(`quantum_logs_card_${activeCardDetail.id}`, JSON.stringify(cleared));
      setTerminalInput("");
      return;
    } else if (cleanCmd.startsWith("set title ")) {
      const val = userInput.substring(10).trim();
      if (val) {
        updateCardInActiveList(activeCardDetail.id, { title: val });
        setActiveCardDetail(prev => prev ? { ...prev, title: val } : null);
        reply = `[SUCCESS] Chassis title updated successfully to: "${val}"`;
      } else {
        reply = `[ERROR] Invalid parameter. Usage: set title <your text>`;
      }
    } else if (cleanCmd.startsWith("set desc ")) {
      const val = userInput.substring(9).trim();
      if (val) {
        updateCardInActiveList(activeCardDetail.id, { desc: val });
        setActiveCardDetail(prev => prev ? { ...prev, desc: val } : null);
        reply = `[SUCCESS] Core description ROM overwritten: "${val}"`;
      } else {
        reply = `[ERROR] Invalid parameter. Usage: set desc <your text>`;
      }
    } else if (cleanCmd.startsWith("set cat ")) {
      const val = userInput.substring(8).trim().toUpperCase();
      if (val) {
        updateCardInActiveList(activeCardDetail.id, { cat: val });
        setActiveCardDetail(prev => prev ? { ...prev, cat: val } : null);
        reply = `[SUCCESS] Node category code updated to: "${val}"`;
      } else {
        reply = `[ERROR] Invalid parameter. Usage: set cat <your category>`;
      }
    } else {
      updateCardInActiveList(activeCardDetail.id, { desc: userInput });
      setActiveCardDetail(prev => prev ? { ...prev, desc: userInput } : null);
      reply = `[ROM/WRITE] Captured console notes! Overwrote card text: "${userInput}"`;
    }

    const finalLogs = [...updatedUserLogs, reply];
    setActiveCardLogs(finalLogs);
    localStorage.setItem(`quantum_logs_card_${activeCardDetail.id}`, JSON.stringify(finalLogs));
    setTerminalInput("");
  };

  // Synchronize dynamic system hours
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save changes to localStorage
  const saveToStorage = (updated: ScreenData[]) => {
    setScreens(updated);
    localStorage.setItem("alphaqubit_custom_screens_v11", JSON.stringify(updated));
  };

  const updateScreenField = (field: keyof ScreenData, value: any) => {
    setScreens(prev => {
      const updated = prev.map(s => {
        if (s.id === activeId) {
          let extra = {};
          if (field === 'bgUrl' && typeof value === 'string') {
            const lowerVal = value.toLowerCase().trim();
            if (
              lowerVal.endsWith('.mp4') || 
              lowerVal.endsWith('.mov') || 
              lowerVal.endsWith('.webm') || 
              lowerVal.includes('.mp4?') ||
              lowerVal.includes('mixkit.co/videos') ||
              lowerVal.includes('myqcloud.com/') && lowerVal.includes('.mp4')
            ) {
              extra = { bgType: 'video' };
            } else if (
              lowerVal.endsWith('.jpg') || 
              lowerVal.endsWith('.jpeg') || 
              lowerVal.endsWith('.png') || 
              lowerVal.endsWith('.gif') || 
              lowerVal.endsWith('.webp') || 
              lowerVal.endsWith('.svg') ||
              lowerVal.includes('images.unsplash.com')
            ) {
              extra = { bgType: 'image' };
            }
          }
          return { ...s, [field]: value, ...extra };
        }
        return s;
      });
      localStorage.setItem("alphaqubit_custom_screens_v11", JSON.stringify(updated));
      return updated;
    });
  };

  const updateScreenFields = (fields: Partial<ScreenData>) => {
    setScreens(prev => {
      const updated = prev.map(s => s.id === activeId ? { ...s, ...fields } : s);
      localStorage.setItem("alphaqubit_custom_screens_v11", JSON.stringify(updated));
      return updated;
    });
  };

  const handleResetToDefault = () => {
    if (window.confirm("确定要重置当前的所有自定义文案、图片、视频背景以及导航选项吗？")) {
      saveToStorage(DEFAULT_SCREENS);
      localStorage.removeItem("alphaqubit_pill_nav_items_v5");
      setPillNavItems([
        { label: "首页", href: "#screen-1" },
        { label: "无限进步", href: "#screen-3" },
        { label: "建设中", href: "#screen-5" },
        { label: "建设中", href: "#screen-6" },
        { label: "建设中", href: "#screen-7" },
      ]);
      setActiveId(1);
    }
  };

  const applyThemePack = (packId: string) => {
    const pack = THEME_PACKS.find(p => p.id === packId);
    if (pack) {
      saveToStorage(pack.screens);
      alert(`已成功应用「${pack.name}」主题预设模板！`);
    }
  };

  const handleExportMasterConfig = () => {
    const masterData = {
      version: "1.0_master",
      timestamp: new Date().toISOString(),
      screens: screens,
      pillNavItems: pillNavItems,
      marqueeCards: marqueeCards,
      sphereCards: sphereCards,
      domeCards: domeCards,
      trialCards: trialCards,
      relationshipCards: relationshipCards,
      screen7Cards: screen7Cards,
      screen7Tabs: screen7Tabs,
    };
    const codeStr = JSON.stringify(masterData, null, 2);
    setCopyToast(codeStr);
  };

  const handleImportMasterConfig = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== "object") {
        alert("格式错误！必须为合法的 JSON 对象。");
        return false;
      }
      
      let importCount = 0;
      if (Array.isArray(parsed.screens) && parsed.screens.length > 0) {
        setScreens(parsed.screens);
        localStorage.setItem("alphaqubit_custom_screens_v11", JSON.stringify(parsed.screens));
        importCount++;
      }
      if (Array.isArray(parsed.pillNavItems) && parsed.pillNavItems.length > 0) {
        setPillNavItems(parsed.pillNavItems);
        localStorage.setItem("alphaqubit_pill_nav_items_v5", JSON.stringify(parsed.pillNavItems));
        importCount++;
      }
      if (Array.isArray(parsed.marqueeCards) && parsed.marqueeCards.length > 0) {
        setMarqueeCards(parsed.marqueeCards);
        localStorage.setItem("alphaqubit_marquee_cards", JSON.stringify(parsed.marqueeCards));
        importCount++;
      }
      if (Array.isArray(parsed.sphereCards) && parsed.sphereCards.length > 0) {
        setSphereCards(parsed.sphereCards);
        localStorage.setItem("alphaqubit_sphere_cards", JSON.stringify(parsed.sphereCards));
        importCount++;
      }
      if (Array.isArray(parsed.domeCards) && parsed.domeCards.length > 0) {
        setDomeCards(parsed.domeCards);
        localStorage.setItem("alphaqubit_dome_cards", JSON.stringify(parsed.domeCards));
        importCount++;
      }
      if (Array.isArray(parsed.trialCards) && parsed.trialCards.length > 0) {
        setTrialCards(parsed.trialCards);
        localStorage.setItem("alphaqubit_trial_cards", JSON.stringify(parsed.trialCards));
        importCount++;
      }
      if (Array.isArray(parsed.relationshipCards) && parsed.relationshipCards.length > 0) {
        setRelationshipCards(parsed.relationshipCards);
        localStorage.setItem("alphaqubit_relationship_cards_v5", JSON.stringify(parsed.relationshipCards));
      }
      if (Array.isArray(parsed.screen7Cards)) {
        setScreen7Cards(parsed.screen7Cards);
        localStorage.setItem("alphaqubit_screen7_cards", JSON.stringify(parsed.screen7Cards));
        importCount++;
      }
      if (Array.isArray(parsed.screen7Tabs)) {
        setScreen7Tabs(parsed.screen7Tabs);
        localStorage.setItem("alphaqubit_screen7_tabs", JSON.stringify(parsed.screen7Tabs));
        importCount++;
      }

      if (importCount > 0) {
        alert(`🎉 一键全局配置导入成功！已成功应用并同步了 ${importCount} 个核心模块的自定义数据！`);
        return true;
      } else {
        alert("未能在此 JSON 中找到可识别的模块。请确保导入的配置是由「导出全局大师备份」生成的合法数据。");
        return false;
      }
    } catch (e) {
      alert(`导入解析失败，请检查 JSON 格式是否完整：\n${e instanceof Error ? e.message : '未知错误'}`);
      return false;
    }
  };

  const activeScreen = screens.find(s => s.id === activeId) || screens[0];

  // Helper code to smooth scroll to screen id
  const scrollToScreen = (id: number) => {
    setActiveId(id);
    setScrollingTo(id);
    scrollingToRef.current = id;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const elem = document.getElementById(`screen-${id}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setScrollingTo(null);
      scrollingToRef.current = null;
    }, 1000); // 1 second safe fallback to release scroll state locks
  };

  useEffect(() => {
    (window as any).alphaQubitScrollToScreen = scrollToScreen;
    return () => {
      delete (window as any).alphaQubitScrollToScreen;
    };
  }, [scrollToScreen]);

  // Sync scroll detection for header logo
  useEffect(() => {
    const container = document.getElementById('slides-container');
    const handleScroll = () => {
      if (container && screens.length > 0) {
        setScrolled(container.scrollTop > 40);
        
        // Compute which screen occupies the most visible area in the scroll container viewport
        const containerRect = container.getBoundingClientRect();
        let bestScreenId = activeId;
        let maxVisibleHeight = -1;

        for (const s of screens) {
          const el = document.getElementById(`screen-${s.id}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            const visibleTop = Math.max(containerRect.top, rect.top);
            const visibleBottom = Math.min(containerRect.bottom, rect.bottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            if (visibleHeight > maxVisibleHeight) {
              maxVisibleHeight = visibleHeight;
              bestScreenId = s.id;
            }
          }
        }

        // If programmatically scrolling to a specific slide, lock out manual intermediate triggers
        if (scrollingToRef.current !== null) {
          if (bestScreenId === scrollingToRef.current) {
            setScrollingTo(null);
            scrollingToRef.current = null;
          }
          return;
        }

        if (bestScreenId !== activeId) {
          setActiveId(bestScreenId);
        }
      }
    };
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [activeId, screens]);

  // Color Filter Class Utility
  const getTintColorMapClass = (tint: string) => {
    switch (tint) {
      case 'slate': return 'bg-slate-950/70';
      case 'indigo': return 'bg-indigo-950/70';
      case 'emerald': return 'bg-emerald-950/70';
      case 'gold': return 'bg-[#1e1a14]/80';
      case 'rose': return 'bg-rose-950/70';
      default: return 'bg-black/40';
    }
  };

  // Legacy consoles disabled
  const renderMarqueeConsole = () => null;
  const renderSphereConsole = () => null;

  const renderGenericConsole = (
    screenId: number | null,
    onClose: () => void
  ) => {
    if (screenId === null) return null;

    const currentScreen = screens.find(s => s.id === screenId) || screens[0];
    const onUpdateScreen = (updated: ScreenData) => {
      setScreens(prev => prev.map(s => s.id === updated.id ? updated : s));
    };

    const hasCards = [3, 4, 5, 6, 7].includes(screenId);

    let cards: MarqueeCard[] | null = null;
    let saveCards: ((updated: MarqueeCard[]) => void) | null = null;

    if (screenId === 3) {
      cards = marqueeCards;
      saveCards = saveMarqueeCards;
    } else if (screenId === 4) {
      cards = sphereCards;
      saveCards = saveSphereCards;
    } else if (screenId === 5) {
      cards = domeCards;
      saveCards = saveDomeCards;
    } else if (screenId === 6) {
      cards = trialCards;
      saveCards = saveTrialCards;
    } else if (screenId === 7) {
      cards = screen7Cards;
      saveCards = saveScreen7Cards;
    }

    const showRotateControls = screenId === 5;

    let consoleTitle = `BACKGROUND & TEMP SETTINGS (SCREEN ${screenId} / 第 ${screenId} 屏)`;
    let screenLabel = `Configure background layers and ambient temperature for Screen ${screenId}`;

    if (screenId === 3) {
      consoleTitle = "MARQUEE CONSOLE (SCREEN 3) / 走马灯控制台 (第3屏)";
      screenLabel = "Configure sliding noise matrices on Screen 3 (Third Slide)";
    } else if (screenId === 4) {
      consoleTitle = "3D SPHERE CONSOLE (SCREEN 4) / 3D球形控制台 (第4屏)";
      screenLabel = "Configure spherical noise matrices on Screen 4 (Fourth Slide)";
    } else if (screenId === 5) {
      consoleTitle = "3D DOME GALLERY CONSOLE (SCREEN 5) / 穹顶画廊控制台 (第5屏)";
      screenLabel = "Configure 3D Dome Gallery and cards metadata on Screen 5";
    } else if (screenId === 6) {
      consoleTitle = "SLIDER CARD CONSOLE (SCREEN 6) / 移动卡片控制台 (第6屏)";
      screenLabel = "Configure sliding diagnostic cards and metadata on Screen 6";
    } else if (screenId === 7) {
      consoleTitle = "ROADMAP CONSOLE (SCREEN 7) / 路线图控制台 (第7屏)";
      screenLabel = "Configure roadmap milestones and glowing cards on Screen 7";
    }

    const addCard = () => {
      if (!cards || !saveCards) return;
      const nextId = cards.length > 0 ? Math.max(...cards.map(c => c.id)) + 1 : 1;
      const defaultTemplates = [
        { title: "Fault-Tolerant Decoder", cat: "CORE SYSTEM", desc: "Predicts noise errors dynamically using neural inference thresholds.", colorType: "teal" },
        { title: "Sycamore Calibrator", cat: "HARDWARE ENGINE", desc: "Automated drift correction module optimizing microwave pulses.", colorType: "indigo" },
        { title: "Cosmic Event Tracker", cat: "METRIC ANALYZIS", desc: "High-density scintillation tracking mapping background radiation.", colorType: "rose" },
        { title: "MWPM Super Solver", cat: "OPTIMIZER", desc: "Parallel graph perfect matcher solving threshold parameters.", colorType: "amber" }
      ];
      const template = defaultTemplates[nextId % defaultTemplates.length];
      const newCard: MarqueeCard = {
        id: nextId,
        title: template.title,
        cat: template.cat,
        desc: template.desc,
        url: "",
        colorType: template.colorType
      };
      saveCards([...cards, newCard]);
    };

    const removeLastCard = () => {
      if (!cards || !saveCards) return;
      if (cards.length > 1) {
        saveCards(cards.slice(0, -1));
      }
    };

    const deleteCard = (id: number | string) => {
      if (!cards || !saveCards) return;
      if (cards.length <= 1) {
        if (!window.confirm("这是最后一张卡片。删除它后前台对应的板块可能会显示为空（白屏）。您确定要删除最后一张卡片吗？")) {
          return;
        }
      }
      saveCards(cards.filter(c => c.id !== id));
    };

    const updateCard = (id: number, fields: Partial<MarqueeCard>) => {
      console.log("updateCard called", id, fields);
      if (!cards || !saveCards) return;
      const updated = cards.map(c => c.id === id ? { ...c, ...fields } : c);
      saveCards(updated);
    };

    const resetCards = () => {
      if (!saveCards) return;
      if (window.confirm("Reset card matrices to Google default setup?")) {
        saveCards(DEFAULT_MARQUEE_CARDS);
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, mode: 'bg' | 'temp' | 'mobile' = 'bg') => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const isVideo = file.type.startsWith('video/');
        
        if (isVideo) {
          const objectUrl = URL.createObjectURL(file);
          if (mode === 'temp') {
            onUpdateScreen({ ...currentScreen, tempBgUrl: objectUrl, tempBgType: 'video' });
          } else if (mode === 'mobile') {
            onUpdateScreen({ ...currentScreen, bgUrlMobile: objectUrl, bgTypeMobile: 'video' });
          } else {
            onUpdateScreen({ ...currentScreen, bgUrl: objectUrl, bgType: 'video' });
          }
          alert("已成功加载本地视频流（Blob）。由于移动端浏览器对 Base64 视频存在硬性解码限制，本地视频已使用高性能临时流（Blob）通道加载，在此浏览器窗口内可完美播放背景视频的原声轨。温馨提示：临时流仅在当前网页会话中有效，刷新后大文件背景将重置。若需跨设备或永久部署，建议在输入框中填入 MP4 在线直链。");
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          if (mode === 'temp') {
            onUpdateScreen({ ...currentScreen, tempBgUrl: reader.result as string, tempBgType: 'image' });
          } else if (mode === 'mobile') {
            onUpdateScreen({ ...currentScreen, bgUrlMobile: reader.result as string, bgTypeMobile: 'image' });
          } else {
            onUpdateScreen({ ...currentScreen, bgUrl: reader.result as string, bgType: 'image' });
          }
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <AnimatePresence>
        {screenId !== null && (
          <motion.div
            initial={{ opacity: 0, x: 250 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 250 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-lg lg:max-w-xl h-full bg-zinc-950/98 border-l border-zinc-800 backdrop-blur-xl shadow-2xl z-[100] flex flex-col pointer-events-auto text-zinc-300"
          >
            {/* Console Header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <div>
                  <h2 className="text-xs font-mono font-bold tracking-widest text-white uppercase">
                    {consoleTitle}
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-light font-sans">
                    {screenLabel}
                  </p>
                </div>
              </div>
              <div 
                role="button"
                id="close-console"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onClose();
                }}
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all cursor-pointer relative z-[999] pointer-events-auto flex items-center justify-center min-w-[32px] min-h-[32px]"
              >
                <X className="w-4 h-4" />
              </div>
            </div>

            {/* Console Tab Selector */}
            {hasCards && (
              <div className="px-5 py-2 border-b border-zinc-850 bg-zinc-900/30 flex gap-4 text-xs font-mono">
                <button
                  onClick={() => setConsoleTab('cards')}
                  className={`pb-1.5 border-b-2 transition-all cursor-pointer font-bold tracking-wider ${
                    consoleTab === 'cards' 
                      ? 'border-amber-500 text-amber-500 font-bold' 
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  CARD CONFIG / 卡片配置
                </button>
                <button
                  onClick={() => setConsoleTab('bg')}
                  className={`pb-1.5 border-b-2 transition-all cursor-pointer font-bold tracking-wider ${
                    consoleTab === 'bg' 
                      ? 'border-amber-500 text-amber-500 font-bold' 
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  BG & AUDIO / 背景与音频
                </button>
              </div>
            )}

            {/* Background & Temperature Control Panels */}
            {(!hasCards || consoleTab === 'bg') && (
              <>
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">Background / 背景管理</h3>
                     <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{currentScreen.bgType}</span>
                  </div>
                  <div className="flex gap-2">
                     <input 
                        type="text" 
                        value={currentScreen.bgUrl}
                        onChange={(e) => onUpdateScreen({...currentScreen, bgUrl: e.target.value})}
                        placeholder="Enter image/video URL"
                        className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                     />
                     <label className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer text-xs">
                        <UploadCloud className="w-3 h-3" />
                        <span>Upload</span>
                        <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleFileChange(e, 'bg')} />
                     </label>
                  </div>
                </div>

                {/* Music Management Section */}
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 space-y-3">
                  <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                    <Music className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">音乐管理 (Audio Management)</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800 my-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-zinc-350">使用视频原声</span>
                      <span className="text-[9px] text-zinc-500">播放背景视频自带的音轨</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={!!currentScreen.useVideoAudio}
                        onChange={(e) => onUpdateScreen({...currentScreen, useVideoAudio: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                    </label>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block">主音频链接 Music URL</label>
                    <input 
                      type="text" 
                      value={currentScreen.bgMusicUrl || ''}
                      onChange={(e) => onUpdateScreen({...currentScreen, bgMusicUrl: e.target.value})}
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono"
                      placeholder="http://..."
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block">移动端专属音乐 Mobile Music URL</label>
                    <input 
                      type="text" 
                      value={currentScreen.mobileMusicUrl || ''}
                      onChange={(e) => onUpdateScreen({...currentScreen, mobileMusicUrl: e.target.value})}
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono"
                      placeholder="http://..."
                    />
                  </div>
                </div>

                {/* Mobile Overrides UI in BG settings */}
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1">
                       <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                       <span>Mobile Override / 移动端专属背景</span>
                     </h3>
                     <button
                       onClick={() => {
                         if (currentScreen.bgUrlMobile) {
                           onUpdateScreen({
                             ...currentScreen,
                             bgUrlMobile: undefined,
                             bgTypeMobile: undefined
                           });
                         } else {
                           onUpdateScreen({
                             ...currentScreen,
                             bgUrlMobile: currentScreen.bgUrl,
                             bgTypeMobile: currentScreen.bgType
                           });
                         }
                       }}
                       className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wide uppercase transition-all cursor-pointer ${
                         currentScreen.bgUrlMobile 
                           ? 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 font-bold' 
                           : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-zinc-300'
                       }`}
                     >
                       {currentScreen.bgUrlMobile ? "已开启 OVERRIDE" : "未开启 INHERIT"}
                     </button>
                  </div>
                  {currentScreen.bgUrlMobile !== undefined && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 block">移动端背景格式 Mobile Type</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['image', 'video', 'gradient'].map((bt) => (
                            <button
                              key={`mobile-bt-${bt}`}
                              onClick={() => {
                                onUpdateScreen({
                                  ...currentScreen,
                                  bgTypeMobile: bt as BackgroundType
                                });
                              }}
                              className={`py-1 rounded uppercase font-mono text-[9px] font-bold flex items-center justify-center gap-1 border cursor-pointer ${
                                (currentScreen.bgTypeMobile || currentScreen.bgType) === bt 
                                  ? 'bg-indigo-600 text-white border-indigo-500' 
                                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                              }`}
                            >
                              <span>{bt}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                         <input 
                            type="text" 
                            value={currentScreen.bgUrlMobile || ''}
                            onChange={(e) => onUpdateScreen({...currentScreen, bgUrlMobile: e.target.value})}
                            placeholder="Enter mobile background URL / gradient"
                            className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                         />
                         <label className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer text-xs">
                            <UploadCloud className="w-3 h-3" />
                            <span>Upload</span>
                            <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleFileChange(e, 'mobile')} />
                         </label>
                      </div>
                      
                      <div className="text-[9px] text-zinc-500 leading-normal flex items-start gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span>开启后，若使用手机（屏幕宽规格小）查看本屏，背景会自动变为此专属背景（可上传竖屏版视频或轻量渐变），有效防止横屏大视频在手机上错位显示不全。</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">Temperature / 温度控制</h3>
                     <span className="text-xs font-mono font-bold text-amber-400">{currentScreen.temperature || 25}°C</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={currentScreen.temperature || 25}
                    onChange={(e) => onUpdateScreen({...currentScreen, temperature: parseInt(e.target.value)})}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex gap-2">
                     <input 
                        type="text" 
                        value={currentScreen.tempBgUrl || ''}
                        onChange={(e) => onUpdateScreen({...currentScreen, tempBgUrl: e.target.value})}
                        placeholder="Enter temp background URL"
                        className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs"
                     />
                     <label className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer text-xs">
                        <UploadCloud className="w-3 h-3" />
                        <span>Upload BG</span>
                        <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleFileChange(e, 'temp')} />
                     </label>
                  </div>
                </div>
              </>
            )}

            {hasCards && consoleTab === 'cards' && cards && saveCards && (
              <>
            {/* Console Quick Toolbar Actions */}
            <div className="p-4 bg-zinc-900/30 border-b border-zinc-850/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={addCard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:border-amber-500/50 rounded-lg text-[10px] font-mono tracking-widest uppercase transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>ADD CARD / 增加卡片</span>
                </button>
                
                <button
                  onClick={removeLastCard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg text-[10px] font-mono tracking-widest uppercase transition-all cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                  <span>REMOVE LAST / 减少卡片</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    try {
                      const codeStr = JSON.stringify(cards, null, 2);
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(codeStr);
                      }
                      setCopyToast(codeStr);
                    } catch (e) {
                      alert("Oops, automatic clipboard blocked! Please copy from the pop-up field instead.");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] font-mono tracking-widest uppercase transition-all shadow-md cursor-pointer"
                >
                  <Code className="w-3 h-3" />
                  <span>COPY DATA / 复制数据</span>
                </button>

                <button
                  onClick={resetCards}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                  title="Reset layout"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Editable List Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-270px)]">
              <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/60 text-[10.5px] leading-relaxed font-sans text-zinc-400">
                💡 <span className="font-semibold text-zinc-200">互动卡片编辑：</span>这些修改仅会对当前屏幕的卡片生效。
              </div>

              {/* Auto Rotate Control Panel */}
              {showRotateControls && (
                <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-mono text-zinc-300 font-bold tracking-wider uppercase block">
                        AUTO ROTATION / 自动旋转
              </span>
                      <span className="text-[10px] text-zinc-500 block">
                        Enable continuous slow horizontal rotation / 启用持续缓慢的水平旋转
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={domeAutoRotate} 
                        onChange={(e) => setDomeAutoRotate(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-\x27\x27 after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-zinc-950"></div>
                    </label>
                  </div>

                  {domeAutoRotate && (
                    <div className="space-y-1.5 pt-2 border-t border-zinc-850">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span>ROTATION SPEED / 旋转速度</span>
                        <span className="text-amber-500 font-bold">{domeAutoRotateSpeed.toFixed(2)} deg/frame</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.02" 
                        max="1.0" 
                        step="0.02" 
                        value={domeAutoRotateSpeed} 
                        onChange={(e) => setDomeAutoRotateSpeed(parseFloat(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  )}
                </div>
              )}
              {cards.map((card, idx) => {
                return (
                  <div 
                    key={card.id}
                    className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-850 hover:border-zinc-800 transition-all space-y-3 relative group"
                  >
                    {/* Item Header */}
                    <div className="flex items-center justify-between border-b border-zinc-800/40 pb-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 font-mono text-[9px] rounded uppercase font-bold shrink-0">
                          UNIT {idx + 1}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-300 font-bold truncate max-w-[150px]">
                          {card.title || "Untitled Card"}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600 shrink-0">#{card.id}</span>
                      </div>
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="flex items-center gap-1 text-[9px] font-mono font-bold text-rose-500/60 hover:text-rose-500 px-2 py-1 transition-all rounded hover:bg-rose-500/10 cursor-pointer uppercase tracking-tighter"
                        title="Delete card"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>

                    {/* Title & Category Form Rows */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                          Title / 卡片标题
                        </label>
                        <input 
                          type="text" 
                          value={card.title}
                          onChange={(e) => updateCard(card.id, { title: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white placeholder-zinc-700 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                          placeholder="e.g. Qubit Topology"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                          Sub-Category / 副类别
                        </label>
                        <input 
                          type="text" 
                          value={card.cat}
                          onChange={(e) => updateCard(card.id, { cat: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white placeholder-zinc-700 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                          placeholder="e.g. NOISE VECTOR"
                        />
                      </div>
                    </div>

                    {/* Description Form Row */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                        Detailed Description / 详细描述
                      </label>
                      <textarea 
                        rows={2}
                        value={card.desc}
                        onChange={(e) => updateCard(card.id, { desc: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white placeholder-zinc-700 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20 font-sans resize-none"
                        placeholder="Detail about this noise threshold..."
                      />
                    </div>

                    {/* Custom URL Form Row */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                        Interactive Action Link / 点击跳转链接 (可选)
                      </label>
                      <input 
                        type="text" 
                        value={card.url}
                        onChange={(e) => updateCard(card.id, { url: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono placeholder-zinc-700 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                        placeholder="https://..."
                      />
                    </div>

                    {/* Custom Image Form Row */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                        Circle Background Image URL / 圈圈背景图片链接
                      </label>
                      <input 
                        type="text" 
                        value={card.image || ""}
                        onChange={(e) => updateCard(card.id, { image: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono placeholder-zinc-700 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                        placeholder="https://images.unsplash.com/photo-..."
                      />
                    </div>

                    {/* Color Picker Row */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                        Accent Theme / 系统色系
                      </span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {[
                          { name: "indigo", bg: "bg-indigo-500 border-indigo-400" },
                          { name: "teal", bg: "bg-teal-500 border-teal-400" },
                          { name: "amber", bg: "bg-amber-500 border-amber-400" },
                          { name: "rose", bg: "bg-rose-500 border-rose-400" },
                          { name: "purple", bg: "bg-purple-500 border-purple-400" },
                          { name: "emerald", bg: "bg-emerald-500 border-emerald-400" },
                          { name: "pink", bg: "bg-pink-500 border-pink-400" },
                          { name: "sky", bg: "bg-sky-500 border-sky-400" },
                          { name: "fuchsia", bg: "bg-fuchsia-500 border-fuchsia-400" },
                          { name: "blue", bg: "bg-blue-500 border-blue-400" }
                        ].map((color) => {
                          const isSelected = (card.colorType || "blue") === color.name;
                          return (
                            <button
                              key={color.name}
                              onClick={() => updateCard(card.id, { colorType: color.name })}
                              className={`h-4.5 w-4.5 rounded-full ${color.bg} border transition-transform duration-200 cursor-pointer ${
                                isSelected ? 'scale-125 ring-2 ring-white/50 border-white' : 'scale-100 hover:scale-110 border-transparent opacity-80'
                              }`}
                              title={color.name.toUpperCase()}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Glow & Appearance Row */}
                    <div className="pt-2 border-t border-zinc-800/40 space-y-4">
                      {/* Primary Toggle: Card Highlight */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-zinc-300 uppercase tracking-widest block font-bold">
                            CARD HIGHLIGHT / 卡片高亮
                          </label>
                          <span className="text-[9px] text-zinc-500 block">点亮该节点卡片使其非灰度显示</span>
                        </div>
                        <button
                          onClick={() => updateCard(card.id, { isLit: !card.isLit })}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                            card.isLit ? 'bg-amber-500' : 'bg-zinc-800'
                          }`}
                        >
                          <span className={`${card.isLit ? 'translate-x-5' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
                        </button>
                      </div>

                      {/* Secondary Toggles: Only visible if isLit is true */}
                      {card.isLit && (
                        <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <label className="text-[9px] font-mono text-zinc-300 uppercase tracking-widest block font-bold">
                                GLOW EFFECT / 流光特效
                              </label>
                              <span className="text-[9px] text-zinc-500 block">炫酷边缘呼吸灯效</span>
                            </div>
                            <button
                              onClick={() => updateCard(card.id, { glowEnabled: card.glowEnabled === false ? true : false })}
                              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                                card.glowEnabled !== false ? 'bg-blue-500' : 'bg-zinc-800'
                              }`}
                            >
                              <span className={`${card.glowEnabled !== false ? 'translate-x-5' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
                            </button>
                          </div>

                          {card.glowEnabled !== false && (
                            <div className="space-y-1 animate-fadeIn">
                              <label className="text-[9px] font-mono text-zinc-300 uppercase tracking-widest block font-bold">
                                Glow Color / 流光颜色
                              </label>
                              <input 
                                type="color" 
                                value={card.glowColor || "#fbbf24"}
                                onChange={(e) => updateCard(card.id, { glowColor: e.target.value })}
                                className="w-full h-7 bg-zinc-950 border border-zinc-800 rounded cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Encryption Settings */}
                    <div className="pt-2 border-t border-zinc-800/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-zinc-300 uppercase tracking-widest block font-bold">
                            Encryption Protection / 加密保护
                          </label>
                          <span className="text-[10px] text-zinc-500 block font-sans">
                            Require password to play audio content
                          </span>
                        </div>
                        <button
                          onClick={() => updateCard(card.id, { isEncrypted: !card.isEncrypted })}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                            card.isEncrypted ? 'bg-amber-500' : 'bg-zinc-800'
                          }`}
                        >
                          <span
                            className={`${
                              card.isEncrypted ? 'translate-x-5' : 'translate-x-1'
                            } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                          />
                        </button>
                      </div>
                      
                      {card.isEncrypted && (
                        <div className="space-y-1.5 animate-fadeIn">
                          <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                            Set Access Password / 设置访问密码
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-amber-500/70" />
                            <CardPasswordInput card={card} updateCard={updateCard} />
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
              </>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const isAnyModalOpen = isAudioSecondaryPageOpen || isPdfSecondaryPageOpen || isSubCardModalOpen || (activeCardDetail !== null);

  /* =================================================================================
   * ■ SECTION 6: MAIN LAYOUT, DOM TREE & SCREEN-BY-SCREEN RENDERING
   * ================================================================================= */

  return (
    <div className="relative w-full max-w-full h-screen overflow-hidden bg-zinc-950 select-none flex flex-col font-sans shadow-none">
      {!configLoaded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
      
      {isAiStudio && (
        <a 
          href="/admin" 
          className="hidden lg:flex absolute bottom-6 left-6 z-[9999] px-4 py-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-full text-sm backdrop-blur shadow-lg border border-zinc-700/50 transition-all font-medium pointer-events-auto items-center justify-center"
        >
          进入后台 (Admin)
        </a>
      )}

      {/* PillNav centered navigation header - permanently displayed on all screens */}
      <PillNav 
        logo="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=100&h=100&fit=crop"
        logoAlt="α"
        items={pillNavItems}
        activeHref={`#screen-${activeId}`}
        onItemClick={(item) => {
          if (item.href.startsWith('#screen-')) {
            const num = parseInt(item.href.replace('#screen-', ''));
            if (!isNaN(num)) scrollToScreen(num);
          } else if (item.href.startsWith('#')) {
            const el = document.querySelector(item.href);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.open(item.href, '_blank');
          }
        }}
        baseColor="#ffffff"
        pillColor="rgba(255, 255, 255, 0.05)"
        pillTextColor="#ffffff"
        hoveredPillTextColor="#000000"
      />

      {/* DB Status Dot (Only visible inside AI Studio Dev/Localhost) */}
      {/* {dbConnected !== null && isAiStudio && (
        <div 
          onClick={() => setShowDbDiagnostics(true)}
          className="fixed top-6 right-6 z-[100] flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950/85 border border-zinc-800/80 hover:bg-zinc-900 rounded-full text-[10px] font-mono tracking-wider text-zinc-300 backdrop-blur shadow-lg transition-all cursor-pointer pointer-events-auto active:scale-95 select-none animate-fade-in"
          title={dbConnected ? (isDbEmpty ? "Database Connected, but Master Config Empty" : "Database Connected") : "Database Disconnected"}
        >
          <div className={`w-2 h-2 rounded-full ${!dbConnected ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : isDbEmpty ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}></div>
          <span className="text-zinc-400 font-bold">
            DB: {!dbConnected ? 'ERR' : isDbEmpty ? 'EMPTY' : 'OK'}
          </span>
        </div>
      )} */}

      {/* Diagnostics Panel Modal */}
      {showDbDiagnostics && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-sm pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm p-5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col text-zinc-300 font-sans"
          >
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">数据库网络连接诊断</h3>
              </div>
              <button 
                onClick={() => setShowDbDiagnostics(false)}
                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 mb-5 text-xs">
              <div className="flex justify-between items-center bg-zinc-950/40 p-2 rounded-lg border border-zinc-850">
                <span className="text-zinc-400">连接状态:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${!dbConnected ? 'bg-red-500/10 text-red-400 border border-red-500/20' : isDbEmpty ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {!dbConnected ? '已断开 (DISCONNECTED)' : isDbEmpty ? '已连接 (空库/EMPTY)' : '已连接 (CONNECTED)'}
                </span>
              </div>

              <div className="flex flex-col gap-1 bg-zinc-950/40 p-2 rounded-lg border border-zinc-850">
                <span className="text-zinc-400">请求端点:</span>
                <span className="font-mono text-[10px] text-zinc-300 select-all overflow-x-auto whitespace-nowrap scrollbar-none">
                  GET {window.location.origin}/api/config
                </span>
              </div>

              {!dbConnected && (
                <div className="flex flex-col gap-1.5 bg-red-950/20 border border-red-900/30 p-2.5 rounded-lg">
                  <span className="text-red-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> 错误诊断原因:
                  </span>
                  <p className="font-mono text-[10px] text-red-350 break-all leading-relaxed bg-red-950/40 p-2 rounded border border-red-900/20">
                    {dbErrorMsg || "网络连接超时或被墙。由于您在中国大陆区，直连 Firebase 可能会受到 DNS 污染或网络封锁。建议开启 VPN 后点击下方重试，或者检查代理设置。"}
                  </p>
                </div>
              )}

              {dbConnected && isDbEmpty && (
                <div className="flex flex-col gap-1.5 bg-amber-950/20 border border-amber-900/30 p-2.5 rounded-lg">
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> 数据库配置未初始化:
                  </span>
                  <p className="text-[10px] leading-relaxed text-zinc-350">
                    已成功建立 Firebase 连接，但是在指定的数据库和项目位置中未检测到配置文档 `app_config/master`。目前已自动为您加载了本地默认配置（网站可正常运行）。
                  </p>
                  <button
                    onClick={async () => {
                      setIsInitializingDb(true);
                      try {
                        const { doc, setDoc } = await import('firebase/firestore');
                        await setDoc(doc(db, "app_config", "master"), defaultUserData);
                        setIsDbEmpty(false);
                        if (loadConfigRef.current) {
                          await loadConfigRef.current();
                        }
                        alert("数据库初始化成功！所有页面数据已成功写入并同步至您的云端 Firestore。");
                      } catch (err: any) {
                        console.error("Failed to initialize database:", err);
                        alert("初始化失败: " + (err.message || String(err)));
                      } finally {
                        setIsInitializingDb(false);
                      }
                    }}
                    disabled={isInitializingDb}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer pointer-events-auto"
                  >
                    <UploadCloud className={`w-3.5 h-3.5 ${isInitializingDb ? 'animate-spin' : ''}`} />
                    {isInitializingDb ? '正在初始化...' : '💡 一键写入默认数据到云端'}
                  </button>
                </div>
              )}

              {dbConnected && !isDbEmpty && (
                <div className="flex flex-col gap-1.5 bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-lg text-emerald-300">
                  <span className="font-semibold flex items-center gap-1 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" /> 运行状态良好
                  </span>
                  <p className="text-[10px] leading-relaxed">
                    所有数据已通过国内中转代理服务器 (Cloud Run Node.js App) 实时同步至 Firebase Firestore。
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (loadConfigRef.current) {
                    loadConfigRef.current();
                  }
                }}
                disabled={isRetryingDb}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetryingDb ? 'animate-spin' : ''}`} />
                {isRetryingDb ? '正在重试...' : '重新检测连接'}
              </button>
              <button
                onClick={() => setShowDbDiagnostics(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                关闭
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Elegant, Minimalist Page-Level Navigation Suite (Fixed on Display Page) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2 pointer-events-auto">
          {/* Screen Counter Badge */}
          <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full font-mono text-[9px] tracking-widest text-zinc-200 font-bold backdrop-blur-md shadow-lg select-none">
            {activeId.toString().padStart(2, '0')} / {screens.length.toString().padStart(2, '0')}
          </div>

          {/* Up/Prev Button */}
          <button 
            onClick={() => {
              if (scrollingTo !== null) return;
              const currentIndex = screens.findIndex(s => s.id === activeId);
              if (currentIndex > 0) {
                const prevId = screens[currentIndex - 1].id;
                scrollToScreen(prevId);
              }
            }}
            disabled={activeId === screens[0]?.id || scrollingTo !== null}
            title="Previous Screen / 上一屏"
            className="p-2.5 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-full backdrop-blur-md text-zinc-300 hover:text-white transition-all cursor-pointer shadow-lg disabled:opacity-30 disabled:pointer-events-none active:scale-90"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Down/Next Button */}
          <button 
            onClick={() => {
              if (scrollingTo !== null) return;
              const currentIndex = screens.findIndex(s => s.id === activeId);
              if (currentIndex < screens.length - 1) {
                const nextId = screens[currentIndex + 1].id;
                scrollToScreen(nextId);
              }
            }}
            disabled={activeId === screens[screens.length - 1]?.id || scrollingTo !== null}
            title="Next Screen / 下一屏"
            className="p-2.5 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-full backdrop-blur-md text-zinc-300 hover:text-white transition-all cursor-pointer shadow-lg disabled:opacity-30 disabled:pointer-events-none active:scale-90"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      

      {/* Developer Settings Control Panel (Only visible in DEV, draggable, clean and elegant) */}
      {!isMobile && isAiStudio && (
        <motion.div 
          drag
          dragMomentum={false}
          dragElastic={0.1}
          className="fixed top-6 right-6 z-50 flex items-center gap-2 p-1.5 bg-zinc-950/90 border border-zinc-800/85 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-auto select-none"
        >
          {/* Grab/Drag Handle */}
          <div className="pl-1.5 pr-0.5 text-zinc-500 hover:text-zinc-300 cursor-grab active:cursor-grabbing flex items-center justify-center" title="Drag me anywhere! / 拖动我到任意位置">
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          {/* BG settings controller trigger */}
          <button
            onClick={() => setActiveConsoleScreenId(activeConsoleScreenId === activeId ? null : activeId)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-mono tracking-widest uppercase transition-all shadow-md cursor-pointer ${
              activeConsoleScreenId !== null
                ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-550 font-bold' 
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-700 hover:bg-zinc-850'
            }`}
          >
            <Settings className={`w-3.5 h-3.5 ${activeConsoleScreenId !== null ? 'animate-spin' : ''}`} />
            <span>{activeConsoleScreenId !== null ? 'HIDE BG SETTINGS' : 'BG SETTINGS'}</span>
          </button>

          {/* Deploy to Git */}
          <button
            onClick={async () => {
              const appState = {
                screens,
                relationshipCards
              };
              const codeStr = JSON.stringify(appState, null, 2);
              const prompt = `Please sync my background and audio settings. Here is the data:\n\n${codeStr}\n\nPlease apply this configuration.`;
              
              const doCopy = async (text: string) => {
                if (navigator.clipboard && window.isSecureContext) {
                  try {
                    await navigator.clipboard.writeText(text);
                    return true;
                  } catch (err) {
                    console.error('Clipboard API failed', err);
                  }
                }
                
                // Fallback: execCommand('copy')
                try {
                  const textArea = document.createElement("textarea");
                  textArea.value = text;
                  textArea.style.position = "fixed";
                  textArea.style.left = "-9999px";
                  textArea.style.top = "0";
                  document.body.appendChild(textArea);
                  textArea.focus();
                  textArea.select();
                  const successful = document.execCommand('copy');
                  document.body.removeChild(textArea);
                  return successful;
                } catch (err) {
                  console.error('Fallback copy failed', err);
                  return false;
                }
              };

              const success = await doCopy(prompt);
              if (success) {
                alert("App state copied! Paste it in the chat for the AI to deploy to git.\n应用状态已复制！请粘贴到对话框中以便同步。");
              } else {
                alert("Copy failed. Please check console (F12) for the data.\n复制失败，请在控制台(F12)中查看数据。");
                console.log('--- APP STATE START ---');
                console.log(prompt);
                console.log('--- APP STATE END ---');
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl border border-emerald-500/50 text-[10px] font-mono tracking-widest uppercase transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Code className="w-3.5 h-3.5" />
            <span>DEPLOY TO GIT</span>
          </button>
        </motion.div>
      )}

      {/* Global Console (Supports Background Settings & Cards Configuration) */}
      {renderGenericConsole(
        activeConsoleScreenId,
        () => setActiveConsoleScreenId(null)
      )}

      {/* Global Animated Background Container */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        {(() => {
          const bgUrlToUse = (isMobile && activeScreen.bgUrlMobile) ? activeScreen.bgUrlMobile : activeScreen.bgUrl;
          const bgTypeToUse = (isMobile && activeScreen.bgUrlMobile) ? (activeScreen.bgTypeMobile || activeScreen.bgType) : activeScreen.bgType;
          return (
            <AnimatePresence>
              <motion.div
                key={`global-bg-${activeScreen.id}-${bgUrlToUse}-${bgTypeToUse}-${activeScreen.tintColor}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.0 }}
                className="absolute inset-0 w-full h-full"
              >
                {bgTypeToUse === 'image' && (
                  <img 
                    src={bgUrlToUse} 
                    alt={`bg-${activeScreen.id}`} 
                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-transform duration-[6000ms] scale-100 filter brightness-95" 
                    style={{ opacity: activeScreen.bgOpacity !== undefined ? activeScreen.bgOpacity / 100 : undefined }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000";
                    }}
                  />
                )}
                
                {bgTypeToUse === 'video' && (
                  <SafeVideo 
                    src={bgUrlToUse}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ opacity: activeScreen.bgOpacity !== undefined ? activeScreen.bgOpacity / 100 : undefined }}
                    muted={globalMuted || !activeScreen.useVideoAudio}
                  />
                )}

                {bgTypeToUse === 'gradient' && (
                  <div 
                    className="absolute inset-0 w-full h-full filter brightness-90" 
                    style={{ 
                      background: bgUrlToUse,
                      opacity: activeScreen.bgOpacity !== undefined ? activeScreen.bgOpacity / 100 : undefined 
                    }}
                  />
                )}

            {/* Temperature-controlled secondary background layer */}
            {activeScreen.tempBgUrl && activeScreen.tempBgType === 'image' && (
              <img 
                src={activeScreen.tempBgUrl} 
                alt={`temp-bg-${activeScreen.id}`} 
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-300 mix-blend-screen"
                style={{ opacity: (activeScreen.temperature ?? 25) / 100 }}
              />
            )}
            {activeScreen.tempBgUrl && activeScreen.tempBgType === 'video' && (
              <SafeVideo 
                src={activeScreen.tempBgUrl}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 mix-blend-screen"
                style={{ opacity: (activeScreen.temperature ?? 25) / 100 }}
              />
            )}

            {/* Customizable blur backdrop and color mask overlay */}
            <div 
              className={`absolute inset-0 transition-all duration-[600ms] ${getTintColorMapClass(activeScreen.tintColor)}`} 
              style={{ 
                opacity: activeScreen.overlayOpacity / 100, 
                backdropFilter: activeScreen.overlayBlur > 0 ? `blur(${activeScreen.overlayBlur}px)` : 'none' 
              }} 
            />
          </motion.div>
        </AnimatePresence>
          );
        })()}
      </div>

      {/* Primary vertical scroll presenter with snapping behavior */}
      <div 
        id="slides-container"
        className="flex-1 w-full h-full overflow-x-hidden overflow-y-auto snap-y snap-mandatory scroll-smooth relative z-10 bg-transparent pl-0 mb-[-145px]"
      >
        {screens.map((s, idx) => {
          const isSelected = s.id === activeId;
          
          if (s.id === 4) {
            return (
              <section 
                key={s.id}
                id={`screen-${s.id}`}
                className="snap-start snap-always relative w-full h-screen overflow-hidden flex items-center justify-center bg-transparent"
              >
                {/* Floating controls specifically for Screen 4 to toggle the drawer */}
                {!isMobile && isAiStudio && (
                  <div className="absolute top-20 right-6 lg:top-6 lg:right-44 z-50 pointer-events-auto flex items-center gap-3">
                    <button
                      onClick={() => setActiveConsoleScreenId(activeConsoleScreenId === 4 ? null : 4)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-mono tracking-widest uppercase transition-all duration-300 shadow-lg cursor-pointer backdrop-blur-md ${
                        activeConsoleScreenId === 4 
                          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-550 font-bold' 
                          : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-700 hover:bg-zinc-850'
                      }`}
                    >
                      <Settings className={`w-3.5 h-3.5 ${activeConsoleScreenId === 4 ? 'animate-spin' : ''}`} />
                      <span>{activeConsoleScreenId === 4 ? "HIDE CONSOLE / 隐藏控制台" : "CARD CONSOLE / 打开控制台"}</span>
                    </button>
                  </div>
                )}

                <div className="absolute inset-0 w-full h-full pointer-events-auto">
                  {sphereCards.length > 0 ? (
                    <InfiniteMenu
                      active={isSelected}
                      scale={1.4}
                      items={sphereCards.map((card, idx) => ({
                        id: card.id,
                        image: card.image || [
                          "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop", // Qubit Topology
                          "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=600&auto=format&fit=crop", // Primal Syndrome
                          "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=600&auto=format&fit=crop", // Stabilizer Parity
                          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop", // Decoder Mesh
                          "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop", // Cosmic Ray Shield
                          "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600&auto=format&fit=crop", // Synergy Routing
                          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop", // Coherent Decay
                          "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop", // MWPM Solver
                          "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop", // Decoder Latency
                          "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop"  // Weight Distribution
                        ][idx % 10],
                        title: card.title,
                        description: card.desc,
                        link: card.url,
                        category: card.cat
                      }))}
                      onItemClick={(item) => {
                        const originalCard = sphereCards.find(c => c.id === item.id);
                        if (originalCard) {
                          handleCardClick(originalCard);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#070913]/95 text-center px-6 relative overflow-hidden">
                      {/* Grid overlay for a gorgeous techy background */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                      
                      <div className="relative z-10 max-w-md space-y-6">
                        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto animate-pulse">
                          <Settings className="w-8 h-8 text-amber-500" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold font-display tracking-widest text-white uppercase">
                            CRYOGENIC CORE STANDBY
                          </h3>
                          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                            球形粒子系统当前未加载任何信息节点。
                            <br />
                            请点击右上角「打开控制台」或进入后台管理添加卡片以激活系统。
                          </p>
                        </div>
                        {isAiStudio && (
                          <button
                            onClick={() => setActiveConsoleScreenId(4)}
                            className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-mono tracking-widest uppercase rounded-lg transition-all duration-300 font-extrabold cursor-pointer shadow-lg shadow-amber-500/10"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <span>打开控制台 / Configure Nodes</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Centered Scroll Indicator at bottom of each slide */}
                {idx < screens.length - 1 && (
                  <div className="absolute bottom-6 left-0 w-full flex justify-center z-20 animate-bounce pointer-events-none">
                    <button 
                      onClick={() => {
                        const nextScreen = screens[idx + 1];
                        if (nextScreen) scrollToScreen(nextScreen.id);
                      }}
                      className="flex flex-col items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors pointer-events-auto"
                    >
                      <span>下移一屏</span>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </section>
            );
          }

          if (s.id === 5) {
            return (
              <section 
                key={s.id}
                id={`screen-${s.id}`}
                className="snap-start snap-always relative w-full h-screen overflow-hidden flex items-center justify-center bg-transparent"
              >
                {/* Floating controls specifically for Screen 5 to toggle the dome drawer */}
                {!isMobile && isAiStudio && (
                  <div className="absolute top-24 right-6 lg:top-6 lg:right-6 z-50 pointer-events-auto flex items-center gap-3">
                    <button
                      onClick={() => setActiveConsoleScreenId(activeConsoleScreenId === 5 ? null : 5)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-mono tracking-widest uppercase transition-all duration-300 shadow-lg cursor-pointer backdrop-blur-md ${
                        activeConsoleScreenId === 5 
                          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-550 font-bold' 
                          : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-700 hover:bg-zinc-850'
                      }`}
                    >
                      <Settings className={`w-3.5 h-3.5 ${activeConsoleScreenId === 5 ? 'animate-spin' : ''}`} />
                      <span>{activeConsoleScreenId === 5 ? "HIDE CONSOLE / 隐藏控制台" : "DOME CONSOLE / 打开画廊控制台"}</span>
                    </button>
                  </div>
                )}

                <div className="absolute inset-0 w-full h-full pointer-events-auto">
                  <DomeGallery
                    active={isSelected}
                    images={domeCards.map((card, idx) => ({
                      src: card.image || [
                        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop", // Qubit Topology
                        "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=600&auto=format&fit=crop", // Primal Syndrome
                        "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=600&auto=format&fit=crop", // Stabilizer Parity
                        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop", // Decoder Mesh
                        "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop", // Cosmic Ray Shield
                        "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600&auto=format&fit=crop", // Synergy Routing
                        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop", // Coherent Decay
                        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop", // MWPM Solver
                        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop", // Decoder Latency
                        "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop"  // Weight Distribution
                      ][idx % 10],
                      alt: card.title,
                      title: card.title,
                      desc: card.desc
                    }))}
                    grayscale={false}
                    autoRotate={domeAutoRotate}
                    autoRotateSpeed={domeAutoRotateSpeed}
                  />
                </div>

                {/* Centered Scroll Indicator at bottom of each slide */}
                {idx < screens.length - 1 && (
                  <div className="absolute bottom-6 left-0 w-full flex justify-center z-20 animate-bounce pointer-events-none">
                    <button 
                      onClick={() => {
                        const nextScreen = screens[idx + 1];
                        if (nextScreen) scrollToScreen(nextScreen.id);
                      }}
                      className="flex flex-col items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors pointer-events-auto"
                    >
                      <span>下移一屏</span>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </section>
            );
          }

          if (s.id === 6) {
            const activeCard6 = selectedCard6 ? (trialCards.find(c => c.id === selectedCard6.id) || selectedCard6) : null;
            return (
              <section 
                key={s.id}
                id={`screen-${s.id}`}
                className="snap-start snap-always relative w-full min-h-screen lg:h-screen overflow-hidden flex items-center justify-center bg-transparent"
              >
                {/* Floating controls specifically for Screen 6 to toggle the console drawer */}
                {!isMobile && isAiStudio && (
                  <div className="absolute top-24 right-6 lg:top-6 lg:right-6 z-50 pointer-events-auto flex items-center gap-3">
                    <button
                      onClick={() => setActiveConsoleScreenId(activeConsoleScreenId === 6 ? null : 6)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-mono tracking-widest uppercase transition-all duration-300 shadow-lg cursor-pointer backdrop-blur-md ${
                        activeConsoleScreenId === 6 
                          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-550 font-bold' 
                          : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-700 hover:bg-zinc-850'
                      }`}
                    >
                      <Settings className={`w-3.5 h-3.5 ${activeConsoleScreenId === 6 ? 'animate-spin' : ''}`} />
                      <span>{activeConsoleScreenId === 6 ? "HIDE CONSOLE / 隐藏控制台" : "CARD CONSOLE / 打开卡片控制台"}</span>
                    </button>
                  </div>
                )}

                {/* Main Content Area */}
                <div className="relative z-10 w-full h-full max-w-[1700px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col justify-start pt-12 md:pt-1 lg:pt-2 text-white pointer-events-auto">
                  <AnimatePresence mode="wait">
                      {/* State 1: Horizontal Sliding Marquee List of Cards (From Right to Left) */}
                      <motion.div
                        key="marquee-list"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="w-full flex flex-col gap-3 mt-2 md:mt-4"
                      >
                        {/* Title and Instruction Header */}
                        <div className="text-center space-y-3 mb-2 mt-1 md:mt-2">
                          <h2 className="text-3xl md:text-5xl font-display font-black tracking-tighter text-white uppercase leading-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]">
                            {s.title || "Sycamore Syndrome Diagnostic Suite"}
                          </h2>
                          <p className="text-[11px] md:text-sm text-zinc-200 max-w-2xl mx-auto font-sans font-medium leading-relaxed">
                            {s.description || s.subtitle || "Click any card in the continuous right-to-left feed to lock onto the signal, analyze real-time spatial error patterns, and review physical latency metrics."}
                          </p>
                        </div>

                        {/* Infinite Right-to-Left Scrolling Track */}
                        <div className="relative -mx-6 md:-mx-12 lg:-mx-16 overflow-hidden py-4 select-none">
                          <ScrollMarquee
                            items={trialCards}
                            speed={domeAutoRotateSpeed || 1}
                            reverse={false}
                            autoPlay={domeAutoRotate && !isAnyModalOpen}
                            renderItem={(card, idx, groupIdx) => {
                              const glowColors: Record<string, string> = {
                                indigo: 'rgba(99, 102, 241, 0.65)',
                                teal: 'rgba(20, 184, 166, 0.65)',
                                amber: 'rgba(245, 158, 11, 0.65)',
                                rose: 'rgba(244, 63, 94, 0.65)',
                                purple: 'rgba(168, 85, 247, 0.65)',
                                emerald: 'rgba(16, 185, 129, 0.65)',
                                pink: 'rgba(236, 72, 153, 0.65)',
                                sky: 'rgba(14, 165, 233, 0.65)',
                                fuchsia: 'rgba(217, 70, 239, 0.65)'
                              };
                              const glowColor = glowColors[card.colorType || ''] || 'rgba(59, 130, 246, 0.65)';

                              return (
                                <div
                                  className="flex-shrink-0 cursor-pointer pointer-events-auto px-3"
                                  style={{ width: isMobile ? '200px' : '240px' }}
                                  onClick={() => {
                                    setSelectedCard6(card);
                                    if (card.subCards && card.subCards.length > 0) {
                                      setSelectedSubCard(null);
                                      setIsSubCardModalOpen(true);
                                    } else {
                                      setSelectedSubCard(null);
                                      setIsAudioSecondaryPageOpen(true);
                                    }
                                  }}
                                >
                                  <ProfileCard
                                    name={card.title}
                                    title={card.desc}
                                    handle={card.cat || "TELEMETRY"}
                                    status="DIAGNOSTIC ACTIVE"
                                    contactText="Analyze / 诊断"
                                    avatarUrl={card.image || ''}
                                    enableTilt={true}
                                    behindGlowEnabled={true}
                                    behindGlowColor={glowColor}
                                    isEncrypted={card.isEncrypted}
                                  />
                                </div>
                              );
                            }}
                          />
                        </div>
                      </motion.div>
                  </AnimatePresence>
                </div>

                {/* Centered Scroll Indicator at bottom of each slide */}
                {idx < screens.length - 1 && (
                  <div className="absolute bottom-6 left-0 w-full flex justify-center z-20 animate-bounce pointer-events-none">
                    <button 
                      onClick={() => {
                        const nextScreen = screens[idx + 1];
                        if (nextScreen) scrollToScreen(nextScreen.id);
                      }}
                      className="flex flex-col items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors pointer-events-auto"
                    >
                      <span>下移一屏</span>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </section>
            );
          }

          return (
            <section 
              key={s.id}
              id={`screen-${s.id}`}
              className={`snap-start snap-always relative w-full min-h-screen lg:h-screen lg:min-h-[600px] overflow-visible lg:overflow-hidden flex items-center justify-center bg-transparent py-12 lg:py-0 ${s.id === 7 ? 'pt-[48px] pl-0' : ''}`}
            >
              {/* 1700px Content Core ("版心控制在 1700px 左右") */}
              <div className="relative z-10 w-full h-auto lg:h-full max-w-[1700px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col justify-center text-white pointer-events-auto">
                {s.id === 3 || s.id === 7 ? (
                  /* Disabled Marquee Screen */
                  <div className="relative w-full py-12 flex flex-col justify-between h-auto min-h-[500px]">
                    
                    {/* Header Info + Controls Button */}
                    <div className="flex flex-col md:flex-row items-center md:items-end text-center md:text-left justify-between gap-6 mb-4">
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.1 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-3 max-w-3xl flex flex-col items-center md:items-start"
                      >
                        {s.id !== 3 && s.id !== 7 && (
                          <span className="font-mono text-amber-500 text-[10px] tracking-widest font-bold uppercase block bg-amber-500/10 px-2.5 py-1 rounded w-fit border border-amber-500/20">
                            {s.label} • SYSTEM CHASSIS ARCHITECTURE
                          </span>
                        )}
                        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-none text-center md:text-left">
                          <ShinyText 
                            text={s.title} 
                            color="#bdbdbd" 
                            shineColor="#ffffff" 
                            speed={3} 
                            style={{ 
                              marginTop: '17px', 
                              paddingLeft: '0px', 
                              paddingTop: '12px', 
                              marginRight: '0px', 
                              paddingBottom: '11px', 
                              paddingRight: '7px', 
                              fontSize: '49px', 
                              fontStyle: 'normal' 
                            }} 
                          />
                        </h1>
                        {s.subtitle && (
                          <h2 className="font-serif italic text-[15px] md:text-[18px] text-zinc-300 font-light tracking-wide drop-shadow-sm whitespace-pre-line text-center md:text-left">
                            {s.subtitle}
                          </h2>
                        )}
                        <p 
                          onClick={() => setActiveCardDetail({ id: -idx, title: s.title, cat: s.label, desc: s.description, colorType: 'amber' } as any)}
                          className="text-zinc-400 text-xs md:text-sm font-sans font-light leading-relaxed max-w-lg text-center md:text-left line-clamp-3 cursor-pointer hover:text-zinc-300 transition-colors"
                        >
                          {s.description}
                        </p>
                      </motion.div>

                      {/* Controls Toggle Trigger (Visible only on this screen, fulfilling user's '控制台只在该页显示') */}
                      {!isMobile && isAiStudio && (
                        <div className="flex items-center gap-3">
                          <button
                            id="console-toggle-btn"
                            onClick={() => setActiveConsoleScreenId(activeConsoleScreenId === s.id ? null : s.id)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-mono tracking-widest uppercase transition-all duration-300 shadow-md cursor-pointer ${
                              activeConsoleScreenId === s.id 
                                ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-550 font-bold' 
                                : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-700 hover:bg-zinc-850'
                            }`}
                          >
                            <Settings className={`w-3.5 h-3.5 ${activeConsoleScreenId === s.id ? 'animate-spin' : ''}`} />
                            <span>{activeConsoleScreenId === s.id ? "HIDE CONSOLE / 隐藏控制台" : "CARD CONSOLE / 打开控制台"}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Category tabs for Screen 3 */}
                    {s.id === 3 && screen3Tabs && screen3Tabs.length > 0 && (
                      <div className="w-full flex justify-center py-2 px-4 select-none pointer-events-auto mb-2">
                        <div className="flex items-center gap-2 md:gap-3 p-1.5 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth flex-nowrap" style={{ backgroundColor: screen3TabsBg }}>
                          {/* 全部 Button */}
                          <button
                            type="button"
                            onClick={() => setActiveScreen3Tab("全部")}
                            className={`px-4 py-1.5 rounded-full text-xs font-sans tracking-wide transition-all duration-300 ${
                              activeScreen3Tab === "全部"
                                ? "bg-amber-500 text-zinc-950 font-extrabold shadow-lg shadow-amber-500/35 scale-[1.02]"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
                            }`}
                          >
                            全部
                          </button>
                          
                          {/* Custom Tab Buttons */}
                          {screen3Tabs.map((tab, tIdx) => (
                            <button
                              key={tIdx}
                              type="button"
                              onClick={() => setActiveScreen3Tab(tab)}
                              className={`px-4 py-1.5 rounded-full text-xs font-sans tracking-wide whitespace-nowrap transition-all duration-300 ${
                                activeScreen3Tab === tab
                                  ? "bg-amber-500 text-zinc-950 font-extrabold shadow-lg shadow-amber-500/35 scale-[1.02]"
                                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category tabs for Screen 7 */}
                    {s.id === 7 && screen7Tabs && screen7Tabs.length > 0 && (
                      <div className="w-full flex justify-center py-2 px-4 select-none pointer-events-auto mb-2">
                        <div className="flex items-center gap-2 md:gap-3 p-1.5 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth flex-nowrap" style={{ backgroundColor: screen7TabsBg }}>
                          {/* 全部 Button */}
                          <button
                            type="button"
                            onClick={() => setActiveScreen7Tab("全部")}
                            className={`px-4 py-1.5 rounded-full text-xs font-sans tracking-wide transition-all duration-300 ${
                              activeScreen7Tab === "全部"
                                ? "bg-amber-500 text-zinc-950 font-extrabold shadow-lg shadow-amber-500/35 scale-[1.02]"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
                            }`}
                          >
                            全部
                          </button>
                          
                          {/* Custom Tab Buttons */}
                          {screen7Tabs.map((tab, tIdx) => (
                            <button
                              key={tIdx}
                              type="button"
                              onClick={() => setActiveScreen7Tab(tab)}
                              className={`px-4 py-1.5 rounded-full text-xs font-sans tracking-wide whitespace-nowrap transition-all duration-300 ${
                                activeScreen7Tab === tab
                                  ? "bg-amber-500 text-zinc-950 font-extrabold shadow-lg shadow-amber-500/35 scale-[1.02]"
                                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Flex track running marquee animation with dragging/touch support. */}
                    <div className="relative -mx-6 md:-mx-12 lg:-mx-16 py-8 overflow-hidden select-none my-2 bg-transparent pointer-events-auto -translate-y-8 lg:-translate-y-12 transition-transform duration-300">
                      <ScrollMarquee
                        items={
                          s.id === 7 
                            ? screen7Cards.filter(card => activeScreen7Tab === "全部" || card.cat === activeScreen7Tab) 
                            : marqueeCards.filter(card => activeScreen3Tab === "全部" || card.cat === activeScreen3Tab)
                        }
                        speed={domeAutoRotateSpeed || 1}
                        reverse={s.id !== 7} // s.id === 3 will scroll reverse (left to right / RTL-LTR), s.id === 7 will scroll forward
                        autoPlay={domeAutoRotate && !isAnyModalOpen}
                        renderItem={(card, idx, groupIdx) => {
                          const isCardGray = s.id === 7 && !card.isLit;
                          const isGlowActive = card.isLit && card.glowEnabled !== false;
                          const glowColor = card.glowColor || '#fbbf24';
                          const { style: colorStyle, icon: CardIcon } = getCardColorAndIcon(isCardGray ? 'gray' : card.colorType);

                          return (
                            <div 
                              onClick={() => {
                                if (s.id === 7) {
                                  setEnlargedCard(card);
                                } else {
                                  handleCardClick(card);
                                }
                              }}
                              className={`relative w-[270px] h-[220px] shrink-0 p-5 rounded-2xl glassmorphism-card no-shadow hover:-translate-y-1.5 hover:scale-[1.01] flex flex-col justify-between text-left group/card cursor-pointer ${colorStyle} ${isGlowActive && !isCardGray ? 'border' : ''} ${isCardGray ? 'opacity-70 grayscale' : ''}`}
                              style={isGlowActive && !isCardGray ? {
                                borderColor: `${glowColor}80`
                              } : undefined}
                            >
                              {isGlowActive && !isCardGray && (
                                <div 
                                  className="lit-border-container" 
                                  style={{
                                    '--glow-color': glowColor
                                  } as React.CSSProperties}
                                />
                              )}
                              <div>
                                <div className={`flex items-center justify-between ${s.id === 3 ? 'mb-2.5' : 'mb-4'}`}>
                                  <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
                                    {card.cat || "GENERAL"}
                                  </span>
                                  <div className="p-1.5 rounded-lg border border-current opacity-85">
                                    <CardIcon className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <h3 
                                  className="font-display font-bold text-white text-sm md:text-base group-hover/card:text-amber-400 transition-colors mb-2"
                                  style={s.id === 3 ? { fontSize: '17px', height: '39px', lineHeight: '1.3' } : undefined}
                                >
                                  {card.title.length > 20 ? card.title.substring(0, 20) + "..." : card.title}
                                </h3>
                                <p 
                                  className="text-zinc-200 text-[10.5px] font-sans font-light line-clamp-3 h-auto"
                                  style={s.id === 3 ? { lineHeight: '1.6' } : { lineHeight: '1.4' }}
                                >
                                  {card.desc}
                                </p>
                              </div>
                              <div className="mt-4 pt-3 border-t border-zinc-800/40 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                                <span>MATRIX: {card.id.toString().padStart(2, '0')}</span>
                                <span className="text-amber-500/80 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-1 font-bold">
                                  {card.url ? "OPEN LINK" : "ENTER NODE"} <ExternalLink className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            </div>
                          );
                        }}
                      />
                    </div>

                    {/* Bottom Action Footer for Screen 4 */}
                    {s.id !== 3 && s.id !== 7 && (
                      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-4">
                        {s.ctaText && (
                          <div>
                            <a 
                              href={s.ctaUrl || "#"}
                              onClick={(e) => {
                                if (s.ctaUrl?.startsWith('#')) {
                                  e.preventDefault();
                                  const targetId = parseInt(s.ctaUrl.replace('#screen-', '')) || (s.id + 1);
                                  scrollToScreen(targetId <= 9 ? targetId : 1);
                                }
                              }}
                              className="group inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold font-display tracking-widest uppercase rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                            >
                              <span>{s.ctaText}</span>
                              <ChevronRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                            </a>
                          </div>
                        )}
                        
                        <div className="text-zinc-500 font-mono text-[10px] tracking-wider uppercase">
                          Current Frame: {marqueeCards.length} Syndrome Cells • Auto Scroll: Left to Right (Hover to Pause)
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className={`w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center py-12 ${
                    s.align === 'center' ? 'text-center' : s.align === 'right' ? 'text-center lg:text-right' : 'text-center lg:text-left'
                  }`}>
                    
                    {/* Left Column Content - Standard Layouts */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.15 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className={`${
                      s.align === 'center'
                        ? 'lg:col-span-12 max-w-5xl mx-auto flex flex-col items-center text-center' 
                        : s.align === 'right' 
                          ? 'lg:col-span-7 lg:col-start-6 order-1 flex flex-col items-center text-center lg:items-end lg:text-right' 
                          : s.id === 1
                            ? 'lg:col-span-7 order-1 lg:order-1 z-50 relative pointer-events-auto flex flex-col items-center text-center lg:items-start lg:text-left'
                            : 'lg:col-span-7 order-1 lg:order-1 flex flex-col items-center text-center lg:items-start lg:text-left'
                    } space-y-6 md:space-y-8`}
                  >
                    
                    {/* Highly polished headline */}
                    <h1 className={`${s.id === 1 ? 'font-calligraphy font-normal text-[112px] leading-[1.1]' : 'font-display font-extrabold text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-tight leading-none'} text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]`}>
                      <ShinyText text={s.title} color="#bdbdbd" shineColor="#ffffff" speed={3} style={s.id === 2 ? { fontSize: '46px' } : undefined} />
                    </h1>

                    {/* Subheading */}
                    {s.subtitle && (
                      <motion.h2 
                        initial={{ opacity: s.subtitleDelay !== undefined ? (s.subtitleDelay ? 0 : 1) : (s.id === 1 ? 0 : 1) }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: false, amount: 0.15 }}
                        transition={{ duration: 1, delay: s.subtitleDelay ?? (s.id === 1 ? 2 : 0) }}
                        className={`font-serif italic text-[18px] text-zinc-300 font-light max-w-4xl tracking-wide drop-shadow-sm whitespace-pre-line ${
                        s.align === 'center' ? 'mx-auto' : s.align === 'right' ? 'mx-auto lg:ml-auto lg:mr-0 text-center lg:text-right' : 'mx-auto lg:ml-0 lg:mr-auto text-center lg:text-left'
                      }`}>
                        {s.subtitle}
                      </motion.h2>
                    )}

                    {/* Core narrative description paragraph */}
                    {s.description && (
                      <motion.p 
                        initial={{ opacity: s.descriptionDelay !== undefined ? (s.descriptionDelay ? 0 : 1) : (s.id === 1 ? 0 : 1) }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: false, amount: 0.15 }}
                        transition={{ duration: 1, delay: s.descriptionDelay ?? (s.id === 1 ? 3.5 : 0) }}
                        onClick={() => setActiveCardDetail({ id: -idx - 100, title: s.title, cat: s.label, desc: s.description, colorType: 'amber' } as any)}
                        className={`text-zinc-300 text-sm md:text-base leading-relaxed font-sans font-light max-w-xl line-clamp-4 cursor-pointer hover:text-white transition-colors ${
                        s.align === 'center' ? 'mx-auto' : s.align === 'right' ? 'mx-auto lg:ml-auto lg:mr-0 text-center lg:text-right' : 'mx-auto lg:ml-0 lg:mr-auto text-center lg:text-left'
                      }`}>
                        {s.description}
                      </motion.p>
                    )}

                    {/* Render custom integrated interactive widgets depending on the screen index */}
                    
                    {/* Screen 9: Footer Input form & metadata cards */}
                    {s.id === 9 && (
                      <div className="w-full max-w-xl pt-3 mx-auto flex flex-col items-center justify-center">
                        {subscribeStatus === 'success' ? (
                          <div className="p-4 bg-emerald-950/40 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs font-medium flex items-center gap-2 w-full max-w-lg">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>订阅成功！您的邮箱已成功加入 AlphaQubit 开放日通报名单。</span>
                          </div>
                        ) : (
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (subscriberMail.includes('@')) {
                                setSubscribeStatus('success');
                              } else {
                                alert("请输入有效的邮箱地址");
                              }
                            }}
                            className="w-full flex items-center gap-2 p-1.5 bg-zinc-900/80 border border-zinc-700 rounded-xl max-w-lg shadow-lg backdrop-blur-md mx-auto"
                          >
                            <input 
                              type="email" 
                              placeholder="输入您的电子邮箱加入邮件简讯..."
                              value={subscriberMail}
                              onChange={(e) => setSubscriberMail(e.target.value)}
                              className="bg-transparent text-xs text-white placeholder-zinc-500 px-3 py-2.5 focus:outline-none flex-1 font-sans min-w-0"
                              required
                            />
                            <button 
                              type="submit"
                              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold font-display rounded-lg tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer flex-shrink-0"
                            >
                              <span>立即订阅</span>
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    {/* Primary Button */}
                    {s.ctaText && s.id !== 1 && (
                      <div className={`flex w-full ${s.align === 'center' ? 'justify-center' : s.align === 'right' ? 'justify-center lg:justify-end' : 'justify-center lg:justify-start'} pt-3`}>
                        <a 
                          href={s.ctaUrl || "#"}
                          onClick={(e) => {
                            if (s.id === 2) {
                              e.preventDefault();
                              setIsPdfSecondaryPageOpen(true);
                              return;
                            }
                            if (s.ctaUrl?.startsWith('#')) {
                              e.preventDefault();
                              const targetId = parseInt(s.ctaUrl.replace('#screen-', '')) || (s.id + 1);
                              scrollToScreen(targetId <= 9 ? targetId : 1);
                            }
                          }}
                          className="group inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold font-display tracking-widest uppercase rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                        >
                          <span>{s.ctaText}</span>
                          <ChevronRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </div>
                    )}

                  </motion.div>

                  {/* Right Column / Dedicated Content Container */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.15 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className={`${
                      s.align === 'center'
                        ? 'hidden' 
                        : s.align === 'right' 
                          ? 'lg:col-span-5 order-2 lg:order-1 z-30' 
                          : s.id === 1 
                            ? 'lg:col-span-5 order-2 lg:order-2 z-40' 
                            : 'lg:col-span-5 order-2 lg:order-2 z-50'
                    } w-full flex justify-center py-4 relative pointer-events-auto`}
                  >
                    
                    {/* Render unique live visualizations on selected sections */}

                    {/* Screen 2: Removed Game section as per user request */}
                    {s.id === 2 && (
                      <div className="w-full max-w-md hidden">
                        {/* Removed SurfaceCodeDiagram */}
                      </div>
                    )}

                    {/* Screen 3: Embed TransformerDecoderDiagram */}
                    {s.id === 3 && (
                      <div className="w-full max-w-md scale-[1.02] transition-transform duration-300 text-zinc-900">
                        <TransformerDecoderDiagram />
                      </div>
                    )}

                    {/* Screen 4: Embed PerformanceMetricDiagram */}
                    {s.id === 4 && (
                      <div className="w-full max-w-md scale-[1.02] transition-transform duration-300">
                        <PerformanceMetricDiagram />
                      </div>
                    )}

                    {/* Screen 5: Embed QuantumComputerScene */}
                    {s.id === 5 && (
                      <div className="w-full max-w-md aspect-square bg-[#101424]/30 border border-zinc-800/80 rounded-2xl shadow-inner p-4 relative overflow-hidden group flex items-center justify-center">
                        {isSelected ? (
                          <QuantumComputerScene />
                        ) : (
                          <div className="text-zinc-600 font-mono text-[10px] uppercase tracking-wider animate-pulse flex flex-col items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500/50" />
                            <span>CRYOGENIC RECIRCULATION IDLE</span>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-zinc-950/80 border border-zinc-800/80 px-2.5 py-1 rounded text-[9px] text-amber-500 font-mono tracking-widest uppercase">
                          {isSelected ? "SLOW SPIN ACTIVE" : "STANDBY"}
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-zinc-950/90 to-zinc-900/90 border border-zinc-800 p-3 rounded-xl backdrop-blur-sm z-10 h-32 flex flex-col">
                          <code className="text-[10px] text-zinc-400 font-mono block mb-1">SUITE SYCAMORE ENVIRONMENT</code>
                          <p className="text-xs text-zinc-300 font-sans leading-normal overflow-y-auto pr-2 flex-grow">Interactive 3D cryostat chandelier executing qubit operations at millivelvin degrees.</p>
                        </div>
                      </div>
                    )}

                    {/* Screen 8: Rich visual testimonial card wrapper with golden glow */}
                    {s.id === 8 && (
                      <div className="w-full max-w-md aspect-[4/3] glassmorphism-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-xl rounded-full" />
                        <div className="text-4xl text-amber-400 font-serif leading-none">“</div>
                        <p className="text-sm md:text-base text-zinc-200 font-serif italic leading-relaxed relative z-10">
                          "By training decoders directly on hardware data, machine learning unlocks hidden efficiency. We push logical fidelity past the limits of human-coded heuristics."
                        </p>
                        
                        <div className="pt-4 border-t border-zinc-800 flex items-center gap-3">
                          <img 
                            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&h=120&auto=format&fit=crop" 
                            className="w-10 h-10 rounded-full border border-zinc-700 object-cover" 
                            alt="author avatar" 
                          />
                          <div>
                            <p className="text-xs font-bold text-white uppercase font-display tracking-wider">Dr. Elena Bausch</p>
                            <p className="text-[10px] text-zinc-500 font-sans">Lead Researcher • Google Quantum AI</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Screen 9: Mock headquarters location address and real clock */}
                    {s.id === 9 && (
                      <div className="w-full max-w-md glassmorphism-card text-zinc-300 rounded-2xl p-6 space-y-4 -translate-y-8 lg:-translate-y-14 transition-transform duration-300">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                          <span className="text-xs text-white uppercase tracking-wider font-bold font-display">AlphaQubit Headquarters</span>
                          <span className="text-xs text-amber-500 font-mono font-bold animate-pulse">{currentTime} UTC</span>
                        </div>

                        <div className="space-y-2 text-xs leading-relaxed">
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <span>1600 Amphitheatre Pkwy, Mountain View, CA 94043, United States</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>+1 (650) 253-0000 (Research Relations)</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <span>ai.google/research/alphaqubit</span>
                          </div>
                        </div>

                        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-zinc-500 block uppercase font-mono font-bold">Research Code Sandbox</span>
                            <span className="text-xs text-zinc-300 font-mono">github/google-deepmind/alphaqubit</span>
                          </div>
                          <button 
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText("https://github.com/google-deepmind/alphaqubit");
                                alert("已复制 GitHub 仓库地址！");
                              } catch (e) {
                                alert("https://github.com/google-deepmind/alphaqubit");
                              }
                            }}
                            className="p-2 bg-zinc-820 hover:bg-zinc-700 hover:text-white rounded border border-zinc-700/60 transition-colors"
                            title="复制链接"
                          >
                            <Copy className="w-3.5 h-3.5 text-zinc-300" />
                          </button>
                        </div>
                      </div>
                    )}

                  </motion.div>

                </div>
                )}
              </div>

              {/* Centered Scroll Indicator at bottom of each slide */}
              {idx < screens.length - 1 && (
                <div className="absolute bottom-6 left-0 w-full flex justify-center z-20 animate-bounce pointer-events-none">
                  <button 
                    onClick={() => {
                      const nextScreen = screens[idx + 1];
                      if (nextScreen) scrollToScreen(nextScreen.id);
                    }}
                    className="flex flex-col items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors pointer-events-auto"
                  >
                    <span>下移一屏</span>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Floating Right Indicator Navigation Dots */}
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 hidden md:flex flex-col gap-3 p-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-md shadow-lg">
        {screens.map(s => (
          <button 
            key={s.id}
            onClick={() => scrollToScreen(s.id)}
            className="group relative flex items-center justify-center p-1"
            title={s.label}
          >
            {/* Tooltip trigger name */}
            <span className="absolute right-8 px-2 py-0.5 bg-zinc-950/90 border border-white/10 rounded text-[10px] text-white tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap uppercase backdrop-blur-md">
              {s.label}
            </span>
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              activeId === s.id ? 'bg-amber-400 scale-125 ring-2 ring-amber-500/50' : 'bg-zinc-600/60 hover:bg-zinc-100'
            }`} />
          </button>
        ))}
      </div>

      /* =================================================================================
       * ■ SECTION 7: INTERACTIVE EDITOR FLOATING DRAWERS & MODALS
       * ================================================================================= */

      {/* Interactive Editor Floating Drawer Control Panel */}
      {editorOpen && (
        <div className="fixed top-24 right-5 z-40 w-[420px] max-w-[95%] h-[calc(100vh-120px)] bg-zinc-900/95 border border-zinc-800/80 shadow-2xl rounded-2xl flex flex-col backdrop-blur-md overflow-hidden select-text text-zinc-300 animate-slide-in">
          
          {/* Editor Header */}
          <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <div>
                <h3 className="font-display font-medium text-sm text-white">AlphaQubit 可视化自定后台</h3>
                <p className="text-[10px] text-zinc-500">PC 版心 1700px 控制 • 支持替换每屏图片/视频</p>
              </div>
            </div>
            
            <button 
              onClick={() => setEditorOpen(false)}
              className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
              title="折叠面板"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Page Selector */}
          <div className="px-4 py-3 bg-zinc-950/30 border-b border-zinc-850 flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 font-mono tracking-wider">选择自定分屏（共{screens.length}屏）:</span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => {
                  const activeIndex = screens.findIndex(s => s.id === activeId);
                  const prevIndex = activeIndex > 0 ? activeIndex - 1 : screens.length - 1;
                  const targetScreen = screens[prevIndex];
                  if (targetScreen) scrollToScreen(targetScreen.id);
                }}
                className="p-1 bg-zinc-850 hover:bg-zinc-805 rounded border border-zinc-700/60 text-zinc-400 hover:text-white transition-colors"
                title="上一屏"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <select 
                value={activeId}
                onChange={(e) => scrollToScreen(parseInt(e.target.value))}
                className="bg-zinc-850 font-mono font-bold text-xs text-white border border-zinc-700 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {screens.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <button 
                onClick={() => {
                  const activeIndex = screens.findIndex(s => s.id === activeId);
                  const nextIndex = activeIndex < screens.length - 1 ? activeIndex + 1 : 0;
                  const targetScreen = screens[nextIndex];
                  if (targetScreen) scrollToScreen(targetScreen.id);
                }}
                className="p-1 bg-zinc-850 hover:bg-zinc-805 rounded border border-zinc-700/60 text-zinc-400 hover:text-white transition-colors"
                title="下一屏"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => {
                  if (screens.length <= 1) {
                    alert("最少必须保留 1 个分屏！");
                    return;
                  }
                  const currentScreen = screens.find(s => s.id === activeId);
                  if (window.confirm(`确定要彻底删除当前分屏吗？\n「${currentScreen?.label || ''} - ${currentScreen?.title || ''}」`)) {
                    const activeIndex = screens.findIndex(s => s.id === activeId);
                    const updated = screens.filter(s => s.id !== activeId);
                    
                    // re-label remaining screens to keep 01, 02 sequential
                    const relabeled = updated.map((scr, idx) => {
                      const numStr = (idx + 1).toString().padStart(2, '0');
                      const baseLabel = scr.label.replace(/^\d+\.\s*/, '');
                      return {
                        ...scr,
                        label: `${numStr}. ${baseLabel}`
                      };
                    });
                    
                    saveToStorage(relabeled);
                    
                    // switch active page to previous or new last
                    const nextIndex = activeIndex > 0 ? activeIndex - 1 : 0;
                    scrollToScreen(relabeled[nextIndex].id);
                  }
                }}
                disabled={screens.length <= 1}
                className="p-1.5 ml-1 bg-red-950/40 hover:bg-red-900/60 border border-red-900/30 text-red-400 disabled:opacity-20 rounded transition-all cursor-pointer"
                title="删除当前屏幕"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Editor Tabs */}
          <div className="grid grid-cols-3 bg-zinc-950 text-center text-xs border-b border-zinc-800">
            <button 
              onClick={() => setActiveTab('content')}
              className={`py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'content' ? 'text-amber-400 border-amber-500 bg-zinc-900/30' : 'text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              文案内容
            </button>
            <button 
              onClick={() => setActiveTab('background')}
              className={`py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'background' ? 'text-amber-400 border-amber-500 bg-zinc-900/30' : 'text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              背景自定
            </button>
            <button 
              onClick={() => setActiveTab('presets')}
              className={`py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'presets' ? 'text-amber-400 border-amber-500 bg-zinc-900/30' : 'text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              一键精美主题
            </button>
          </div>

          {/* Tab content wrapper */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
            
            {activeTab === 'content' && (
              <div className="space-y-4">
                
                {/* PillNav Interactive Editor Controller */}
                <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3.5 shadow-inner">
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <Compass className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                      <span>第一屏 PillNav 导航配置</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">(项数可自定)</span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {pillNavItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 p-1 bg-zinc-900/60 rounded border border-zinc-850">
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => {
                            const updated = [...pillNavItems];
                            updated[idx].label = e.target.value.toUpperCase();
                            savePillNavItemsToStorage(updated);
                          }}
                          className="w-[100px] bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-white text-[11px] font-bold"
                          placeholder="模块名称"
                        />
                        
                        <select
                          value={item.href}
                          onChange={(e) => {
                            const updated = [...pillNavItems];
                            updated[idx].href = e.target.value;
                            savePillNavItemsToStorage(updated);
                          }}
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-1 py-1 text-white text-[11px] font-mono font-medium"
                        >
                          {screens.map(s => (
                            <option key={s.id} value={`#screen-${s.id}`}>
                              {s.label}
                            </option>
                          ))}
                          <option value="https://doi.org/10.1038/s41586-024-08148-8">Nature Paper</option>
                        </select>

                        <button
                          onClick={() => {
                            const updated = pillNavItems.filter((_, i) => i !== idx);
                            savePillNavItemsToStorage(updated);
                          }}
                          disabled={pillNavItems.length <= 1}
                          className="p-1 text-zinc-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-zinc-500 transition-colors"
                          title="删除当前项"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        const nextId = (pillNavItems.length % 9) + 1;
                        const labelName = `NAV ${nextId}`;
                        const targetHref = `#screen-${nextId}`;
                        const updated = [...pillNavItems, { label: labelName, href: targetHref }];
                        savePillNavItemsToStorage(updated);
                      }}
                      className="flex-1 py-1.5 px-2 border border-zinc-700/80 bg-zinc-900 text-zinc-300 hover:bg-zinc-850 hover:text-white rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                    >
                      <span>+ 增加导航项 (Add)</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        if (pillNavItems.length > 1) {
                          const updated = pillNavItems.slice(0, -1);
                          savePillNavItemsToStorage(updated);
                        }
                      }}
                      disabled={pillNavItems.length <= 1}
                      className="py-1.5 px-2.5 border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-red-400 disabled:opacity-20 disabled:hover:text-zinc-400 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                    >
                      - 减少末尾
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 block">主标题 Headlines ({activeScreen.label})</label>
                  <input 
                    type="text" 
                    value={activeScreen.title}
                    onChange={(e) => updateScreenField('title', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 block">副标题 Subtitle</label>
                  <input 
                    type="text" 
                    value={activeScreen.subtitle}
                    onChange={(e) => updateScreenField('subtitle', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 block">叙述详情段落 Description Paragraph</label>
                  <textarea 
                    rows={4}
                    value={activeScreen.description}
                    onChange={(e) => updateScreenField('description', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 block">内容版心对齐 Alignment</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['left', 'center', 'right'].map((alignOpt) => (
                      <button
                        key={alignOpt}
                        onClick={() => updateScreenField('align', alignOpt)}
                        className={`py-1.5 rounded uppercase border font-mono font-bold ${
                          activeScreen.align === alignOpt 
                            ? 'bg-amber-500 text-zinc-950 border-amber-500' 
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {alignOpt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block">按钮文案 CTA text</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 了解详情" 
                      value={activeScreen.ctaText || ''}
                      onChange={(e) => updateScreenField('ctaText', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block">按钮链接 CTA URL / Slide-ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. #screen-3" 
                      value={activeScreen.ctaUrl || ''}
                      onChange={(e) => updateScreenField('ctaUrl', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-zinc-500 leading-normal flex items-start gap-1">
                  <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                  <span>修改框内文案，左侧网站展示层将进行实时无刷新同步刷新，且保存至浏览器的 localStorage。</span>
                </div>

                {/* Logo Loop Editor removed for debugging */}
              </div>
            )}

            {activeTab === 'background' && (
              <div className="space-y-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 block">背景媒体格式 Background Media Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['image', 'video', 'gradient'].map((bt) => (
                      <button
                        key={bt}
                        onClick={() => {
                          const defaultUrls = {
                            image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000",
                            video: "https://assets.mixkit.co/videos/preview/mixkit-digital-particles-and-glowing-nodes-43031-large.mp4",
                            gradient: "linear-gradient(135deg, #1e1b4b 0%, #111827 100%)"
                          };
                          updateScreenFields({
                            bgType: bt as BackgroundType,
                            bgUrl: defaultUrls[bt as BackgroundType]
                          });
                        }}
                        className={`py-2 rounded uppercase font-mono font-bold flex items-center justify-center gap-1.5 border ${
                          activeScreen.bgType === bt 
                            ? 'bg-amber-500 text-zinc-950 border-amber-500' 
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {bt === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                        {bt === 'video' && <VideoIcon className="w-3.5 h-3.5" />}
                        {bt === 'gradient' && <Layers className="w-3.5 h-3.5" />}
                        <span>{bt}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Local Background Upload Section */}
                <div className="p-3 bg-zinc-950/80 border border-zinc-850 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold">本地媒体上传 (图片/视频)</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-indigo-950/80 border border-indigo-900/60 rounded text-indigo-400 font-mono">LOCAL UP</span>
                  </div>
                  
                  <label className="border border-dashed border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900/30 rounded-lg p-3.5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all group">
                    <UploadCloud className="w-5 h-5 text-zinc-500 group-hover:text-amber-400 transition-colors animate-pulse" />
                    <span className="text-[11px] text-zinc-300 font-medium">点击或将本地文件拖拽至此上传</span>
                    <span className="text-[9px] text-zinc-500 text-center">支持 *.mp4, *.mov, *.png, *.jpg, *.jpeg, *.gif, *.webp, *.svg</span>
                    <input 
                      type="file" 
                      accept="image/*,video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const fileType = file.type;
                        const isVideo = fileType.startsWith('video/');
                        const isImage = fileType.startsWith('image/');

                        if (!isImage && !isVideo) {
                          alert("请选择格式正确的本地图片或视频文件！");
                          return;
                        }

                        // If it is a video, ALWAYS use Object URL (Blob) because iOS & mobile Safari strictly block Base64 encoded video playback
                        if (isVideo) {
                          const objectUrl = URL.createObjectURL(file);
                          updateScreenFields({
                            bgType: 'video',
                            bgUrl: objectUrl
                          });
                          alert("已成功加载本地视频流（Blob）。由于移动端浏览器对 Base64 视频存在硬性解码限制，本地视频已使用高性能临时流（Blob）通道加载，在此浏览器窗口内可完美播放背景视频的原声轨。温馨提示：临时流仅在当前网页会话中有效，刷新后大文件背景将重置。若需跨设备或永久部署，建议在输入框中填入 MP4 在线直链。");
                        } else if (file.size < 1.5 * 1024 * 1024) {
                          // Small image: convert to base64 so it can store in localStorage
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const dataUrl = event.target?.result as string;
                            if (dataUrl) {
                              updateScreenFields({
                                bgType: 'image',
                                bgUrl: dataUrl
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        } else {
                          // Larger image: create Object URL and remind user
                          const objectUrl = URL.createObjectURL(file);
                          updateScreenFields({
                            bgType: 'image',
                            bgUrl: objectUrl
                          });
                          alert(`文件较大 (${(file.size / 1024 / 1024).toFixed(1)}MB)，已使用本地临时超链。可在当前会话中实时预览。由于浏览器 LocalStorage 限制（5MB 软限制），刷新网页后大文件背景将重置。若需跨关机或永久保存，请尽力压制媒体文件至 1.5MB 以内。`);
                        }
                      }}
                      className="hidden" 
                    />
                  </label>

                  {activeScreen.bgUrl && activeScreen.bgUrl.startsWith('blob:') && (
                    <div className="flex gap-1.5 p-1.5 bg-amber-950/20 border border-amber-900/40 rounded text-[9px] text-amber-300 leading-normal">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                      <div>
                        当前正在使用本地临时大文件缓冲链接。刷新后本屏背景将重新加载，如需跨设备或永久保存，请压制媒体文件至 1.5MB 以内。
                      </div>
                    </div>
                  )}

                  {activeScreen.bgUrl && activeScreen.bgUrl.startsWith('data:') && (
                    <div className="flex gap-1.5 p-1.5 bg-emerald-950/20 border border-emerald-900/40 rounded text-[9px] text-emerald-400 leading-normal">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
                      <div>
                        已成功将本媒体离线编码并存储。本屏背景即使拔网线或刷新也绝不丢失。
                      </div>
                    </div>
                  )}
                </div>

                {/* Music Management Section */}
                <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                    <Music className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] text-zinc-400 uppercase font-bold">音乐管理 (Audio Management)</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-zinc-900/40 border border-zinc-800">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-zinc-300">使用视频原声</span>
                      <span className="text-[9px] text-zinc-500">播放背景视频自带的音轨</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={!!activeScreen.useVideoAudio}
                        onChange={(e) => updateScreenField('useVideoAudio', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                    </label>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block">主音频链接 Music URL</label>
                    <input 
                      type="text" 
                      value={activeScreen.bgMusicUrl || ''}
                      onChange={(e) => updateScreenField('bgMusicUrl', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
                      placeholder="http://..."
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block">移动端专属音乐 Mobile Music URL</label>
                    <input 
                      type="text" 
                      value={activeScreen.mobileMusicUrl || ''}
                      onChange={(e) => updateScreenField('mobileMusicUrl', e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
                      placeholder="http://..."
                    />
                  </div>
                </div>

                {/* Background Link path */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 block">
                    {activeScreen.bgType === 'image' && "图片资源链接 Image URL"}
                    {activeScreen.bgType === 'video' && "视频 MP4 直链 Video MP4 URL"}
                    {activeScreen.bgType === 'gradient' && "CSS 渐变样式 Background Gradient Syntax"}
                  </label>
                  <textarea 
                    rows={3} 
                    value={activeScreen.bgUrl}
                    onChange={(e) => updateScreenField('bgUrl', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white text-xs font-mono select-all focus:outline-none focus:border-amber-500"
                    placeholder={activeScreen.bgType === 'gradient' ? "e.g. cubic-gradient(...) or linear-gradient(...)" : "http://..."}
                  />
                </div>

                {/* Mobile Background Overrides Section */}
                <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                      <span>移动端专属背景设定 (Mobile Background)</span>
                    </span>
                    <button
                      onClick={() => {
                        if (activeScreen.bgUrlMobile) {
                          updateScreenFields({
                            bgUrlMobile: undefined,
                            bgTypeMobile: undefined
                          });
                        } else {
                          updateScreenFields({
                            bgUrlMobile: activeScreen.bgUrl,
                            bgTypeMobile: activeScreen.bgType
                          });
                        }
                      }}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wide uppercase transition-all cursor-pointer ${
                        activeScreen.bgUrlMobile 
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500' 
                          : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
                      }`}
                    >
                      {activeScreen.bgUrlMobile ? "已开启 OVERRIDE" : "未开启 INHERIT"}
                    </button>
                  </div>

                  {activeScreen.bgUrlMobile !== undefined && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 block">移动端背景格式 Mobile Media Type</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['image', 'video', 'gradient'].map((bt) => (
                            <button
                              key={`mobile-bt-${bt}`}
                              onClick={() => {
                                updateScreenFields({
                                  bgTypeMobile: bt as BackgroundType
                                });
                              }}
                              className={`py-1 rounded uppercase font-mono text-[9px] font-bold flex items-center justify-center gap-1.5 border cursor-pointer ${
                                (activeScreen.bgTypeMobile || activeScreen.bgType) === bt 
                                  ? 'bg-indigo-600 text-white border-indigo-500' 
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                              }`}
                            >
                              <span>{bt}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 block">移动端资源链接 / 渐变代码</label>
                        <textarea 
                          rows={2} 
                          value={activeScreen.bgUrlMobile || ''}
                          onChange={(e) => updateScreenFields({ bgUrlMobile: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white text-[11px] font-mono select-all focus:outline-none focus:border-indigo-500"
                          placeholder="e.g. http://... or linear-gradient(...)"
                        />
                      </div>
                      
                      <div className="text-[9px] text-zinc-500 leading-normal flex items-start gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span>开启后，若使用手机（屏幕宽小规格）查看本屏，背景会自动变为专属背景（如竖屏版视频或轻量渐变），有效防止横屏PC大视频错位。</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preset background selector trigger based on format */}
                {activeScreen.bgType === 'image' && (
                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg space-y-2">
                    <label className="text-[10px] text-zinc-500 block uppercase font-bold">精选免版税 Unsplash 水印高清图片库 (点击秒变):</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PRESET_BG_IMAGES.map((img) => (
                        <button
                          key={img.name}
                          onClick={() => updateScreenField('bgUrl', img.url)}
                          className="px-2 py-1 bg-zinc-900 border border-zinc-700/60 hover:border-amber-400 rounded text-[10px] text-white font-medium text-left truncate"
                          title={img.name}
                        >
                          {img.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeScreen.bgType === 'video' && (
                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg space-y-2">
                    <label className="text-[10px] text-zinc-500 block uppercase font-bold">免费 looping 动效 MP4 视频直链库 (推荐演示):</label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {PRESET_BG_VIDEOS.map((vid) => (
                        <button
                          key={vid.name}
                          onClick={() => updateScreenField('bgUrl', vid.url)}
                          className="px-2 py-1 bg-zinc-900 border border-zinc-700/60 hover:border-amber-400 rounded text-[10px] text-white font-medium text-left truncate flex items-center gap-1"
                          title={vid.name}
                        >
                          <VideoIcon className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          <span>{vid.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filter sliders */}
                <div className="space-y-3 p-3 bg-zinc-950/60 border border-zinc-850 rounded-lg">
                  <div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500 mb-1">
                      <span>背景暗色遮罩亮度 (Overlay Opacity)</span>
                      <span className="text-white font-mono">{activeScreen.overlayOpacity}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="95" 
                      step="5"
                      value={activeScreen.overlayOpacity}
                      onChange={(e) => updateScreenField('overlayOpacity', parseInt(e.target.value))}
                      className="w-full accent-amber-500 bg-zinc-800"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500 mb-1">
                      <span>背景磨砂玻璃模糊 (Backdrop Blur)</span>
                      <span className="text-white font-mono">{activeScreen.overlayBlur}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="16" 
                      step="1"
                      value={activeScreen.overlayBlur}
                      onChange={(e) => updateScreenField('overlayBlur', parseInt(e.target.value))}
                      className="w-full accent-amber-500 bg-zinc-800"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500 mb-1">
                      <span>视频/背景图透明度 (Background Opacity)</span>
                      <span className="text-white font-mono">{activeScreen.bgOpacity !== undefined ? activeScreen.bgOpacity : 100}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      step="5"
                      value={activeScreen.bgOpacity !== undefined ? activeScreen.bgOpacity : 100}
                      onChange={(e) => updateScreenField('bgOpacity', parseInt(e.target.value))}
                      className="w-full accent-amber-500 bg-zinc-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block">遮罩滤镜色调 Tint Filter</label>
                    <div className="grid grid-cols-3 gap-1.5 text-[10px] uppercase font-mono font-semibold">
                      {[
                        { id: 'none', label: "无色透镜" },
                        { id: 'slate', label: "极客黑" },
                        { id: 'indigo', label: "皇家靛青" },
                        { id: 'emerald', label: "生命森林" },
                        { id: 'gold', label: "奢华琥珀" },
                        { id: 'rose', label: "玫瑰红木" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => updateScreenField('tintColor', item.id)}
                          className={`py-1 rounded border text-center ${
                            activeScreen.tintColor === item.id 
                              ? 'bg-zinc-800 border-amber-400 text-amber-400' 
                              : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'presets' && (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold">
                    <Palette className="w-4 h-4 text-amber-500 animate-bounce" />
                    <span>一键换装 9 大精细化主题模版！</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-zinc-400">
                    无需逐个编辑，一键即自动为所有 9 个分屏同步替换符合审美的情调图像、视频背景及相应的色调遮罩！
                  </p>
                </div>

                <div className="space-y-2.5">
                  {THEME_PACKS.map(tp => (
                    <div 
                      key={tp.id}
                      className="p-3 bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 rounded-xl flex flex-col justify-between gap-2.5 transition-all"
                    >
                      <div>
                        <span className="text-white font-bold tracking-wide block">{tp.name}</span>
                        <p className="text-[10px] text-zinc-500 mt-1 leading-normal">{tp.desc}</p>
                      </div>
                      <button
                        onClick={() => applyThemePack(tp.id)}
                        className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-display font-black tracking-widest text-[11px] rounded uppercase self-start hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        应用此方案
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Quick operations footer footer */}
          <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex flex-col gap-3 bg-zinc-950/90 text-[10px] font-mono">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2.5">
              <div className="flex gap-4 justify-between w-full">
                <button 
                  onClick={handleResetToDefault}
                  className="flex items-center gap-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Clears local storage and resets configuration to the hardcoded base setup"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>初始化标准模板 (RESET)</span>
                </button>

                <button 
                  onClick={() => setShowMasterBackupModal(true)}
                  className="flex items-center gap-1.5 px-2 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-md transition-all cursor-pointer hover:scale-[1.03]"
                  title="一键备份或导入全局配置，解决多端不同步"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>一键全局备份/恢复 (SYNC)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Copy JSON Fallback Overlay / 复制代码弹窗 */}
      <AnimatePresence>
        {copyToast && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                    <Check className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-sm">CONFIG CODE COPIED / 配置复制成功!</h3>
                    <p className="text-[11px] text-zinc-500">The current cards array has been copied to your clipboard and is stored below</p>
                  </div>
                </div>
                <button 
                  onClick={() => setCopyToast(null)}
                  className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                  由于浏览器沙盒权限限制，若未成功自动复制，请双击/点击下方文本框，使用快捷键 <kbd className="px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-amber-500 text-[10px] font-mono">Ctrl + C</kbd> 或 <kbd className="px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-amber-500 text-[10px] font-mono">⌘ + C</kbd> 手动复制所有内容，然后直接发送给 AI 助手：
                </p>
                <textarea
                  readOnly
                  value={copyToast}
                  onClick={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.select();
                  }}
                  className="w-full h-72 p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 selection:bg-emerald-400/20 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-550 mt-2">
                <span>Total Cards: {marqueeCards.length}</span>
                <button
                  onClick={() => setCopyToast(null)}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold font-display tracking-widest text-[10px] uppercase rounded-lg transition-all cursor-pointer"
                >
                  DONE / 我已复制，关闭
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Immersive Card Detail Simulation View / 卡片模拟量子详情弹窗 (空页面跳转完美高保真方案) */}
      <AnimatePresence>
        {activeCardDetail && (() => {
          const { glow: colorGlow } = getCardColorAndIcon(activeCardDetail.colorType);
          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-zinc-950/85 backdrop-blur-xl z-50 flex items-center justify-center p-4"
              onTouchStart={(e) => {
                if (e.touches.length === 1) {
                  appPageTouchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                }
              }}
              onTouchEnd={(e) => {
                if (!appPageTouchStartRef.current || e.changedTouches.length !== 1) return;
                const start = appPageTouchStartRef.current;
                appPageTouchStartRef.current = null;
                const deltaX = e.changedTouches[0].clientX - start.x;
                const deltaY = e.changedTouches[0].clientY - start.y;

                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('input[type="range"]')) {
                  return;
                }

                if ((deltaX > 80 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) || (deltaY > 80 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5)) {
                  setActiveCardDetail(null);
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 180 }}
                className="w-full max-w-lg bg-zinc-900/90 border border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] md:max-h-[80vh]"
              >
                {/* Background glow matching card theme */}
                <div className={`absolute -top-40 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-b ${colorGlow} rounded-full filter blur-[60px] opacity-60 pointer-events-none`} />

                {/* Close Button */}
                <button
                  onClick={() => setActiveCardDetail(null)}
                  className="absolute top-4 right-4 p-2 bg-zinc-950/40 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer shadow-md z-20"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto pr-1 md:pr-2 my-4 z-10 flex flex-col items-center text-center w-full scrollbar-thin scrollbar-thumb-zinc-800">
                  {/* Category Pill */}
                  {activeCardDetail.cat && (
                    <span className="font-mono text-amber-500 text-[10px] tracking-[0.2em] font-extrabold uppercase bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10 mb-4 block w-fit shrink-0">
                      {activeCardDetail.cat}
                    </span>
                  )}

                  {/* Main Title */}
                  <h2 className="text-2xl md:text-3xl font-display font-black text-white tracking-tight leading-snug max-w-md break-words shrink-0">
                    {activeCardDetail.title}
                  </h2>

                  {/* Subtle Divider */}
                  <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent my-5 shrink-0" />

                  {/* Subtitle / Description */}
                  <p className="text-zinc-300 text-sm md:text-base font-sans font-light leading-relaxed max-w-md mx-auto whitespace-pre-wrap break-words">
                    {activeCardDetail.desc}
                  </p>
                </div>

                {/* Close Action Trigger */}
                <div className="pt-4 border-t border-zinc-800/40 flex justify-center z-10 shrink-0">
                  <button
                    onClick={() => setActiveCardDetail(null)}
                    className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white border border-zinc-700/50 rounded-xl text-xs font-mono tracking-widest uppercase transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    Close / 关闭
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <PdfDecoderPage 
        isOpen={isPdfSecondaryPageOpen} 
        onClose={() => setIsPdfSecondaryPageOpen(false)} 
        cards={relationshipCards}
        onUpdateCards={saveRelationshipCards}
        isAiStudio={isAiStudio}
      />
      <AudioSecondaryPage 
        isOpen={isAudioSecondaryPageOpen} 
        onClose={() => setIsAudioSecondaryPageOpen(false)}
        activeCard={
          selectedCard6 && selectedSubCard
            ? {
                ...selectedCard6,
                title: `${selectedCard6.title} - ${selectedSubCard.title}`,
                audioModules: selectedSubCard.audioModules || []
              }
            : selectedCard6
        }
        onUpdateCard={(updatedCard) => {
          if (selectedCard6 && selectedSubCard) {
            const updatedSubCards = (selectedCard6.subCards || []).map(s => 
              s.id === selectedSubCard.id ? { ...s, audioModules: updatedCard.audioModules } : s
            );
            const updatedParentCard = {
              ...selectedCard6,
              subCards: updatedSubCards
            };
            saveTrialCards(trialCards.map(c => c.id === updatedParentCard.id ? updatedParentCard : c));
            setSelectedCard6(updatedParentCard);
            setSelectedSubCard({ ...selectedSubCard, audioModules: updatedCard.audioModules });
          } else {
            saveTrialCards(trialCards.map(c => c.id === updatedCard.id ? updatedCard : c));
            setSelectedCard6(updatedCard);
          }
        }}
        isAiStudio={isAiStudio}
      />
      <SubCardSelectModal
        isOpen={isSubCardModalOpen}
        onClose={() => setIsSubCardModalOpen(false)}
        parentCard={selectedCard6}
        onSelectSubCard={(subCard) => {
          setSelectedSubCard(subCard);
          setIsSubCardModalOpen(false);
          setIsAudioSecondaryPageOpen(true);
        }}
      />
      <MusicPlayer 
        musicUrl={activeScreen.useVideoAudio ? undefined : activeScreen.bgMusicUrl} 
        mobileMusicUrl={activeScreen.useVideoAudio ? undefined : activeScreen.mobileMusicUrl}
        isMobile={isMobile}
        isMuted={globalMuted}
        onToggleMute={() => saveGlobalMuted(!globalMuted)}
      />

      {/* Enlarged Card Modal for Screen 7 */}
      <AnimatePresence>
      {enlargedCard && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/80 pointer-events-auto" 
          onClick={() => setEnlargedCard(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-2xl"
          >
            <button onClick={() => setEnlargedCard(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer z-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="mb-6 relative z-10">
              <span className="text-amber-500 font-mono text-xs tracking-widest block mb-2">{enlargedCard.cat}</span>
              <h2 className="text-3xl font-display font-bold text-white">{enlargedCard.title}</h2>
            </div>
            <p className="text-zinc-300 text-lg leading-relaxed relative z-10">{enlargedCard.desc}</p>
             {enlargedCard.isLit && enlargedCard.glowEnabled !== false && (
               <>
                 <div 
                   className="lit-border-container" 
                   style={{
                     '--glow-color': enlargedCard.glowColor || '#fbbf24'
                   } as React.CSSProperties}
                 />
                 <div 
                   className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full pointer-events-none" 
                   style={{
                     backgroundColor: `${enlargedCard.glowColor || '#fbbf24'}33`
                   }}
                 />
               </>
             )}
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Global Master Config Modal / 全局配置备份与恢复 */}
      <AnimatePresence>
        {showMasterBackupModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-zinc-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4 select-text"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 text-left text-zinc-300"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
                    <Database className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-sm">一键全局数据管理 / MASTER CONFIG SYNC</h3>
                    <p className="text-[11px] text-zinc-500 font-sans">一键备份、导出、恢复或导入所有分屏背景、卡片、导航和连线</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMasterBackupModal(false)}
                  className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                {/* Export Side */}
                <div className="space-y-3 p-4 bg-zinc-950/50 border border-zinc-850 rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-white font-bold text-xs flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>第一步：备份当前页面修改</span>
                    </h4>
                    <p className="text-[10px] text-zinc-500 mt-1 leading-normal font-sans">
                      将你修改过的 9 个分屏背景、所有分析卡片、PillNav 菜单和连线，一键生成为一个唯一的 Master JSON 码并复制到剪贴板。
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleExportMasterConfig();
                      setShowMasterBackupModal(false);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-550 text-white rounded-lg text-xs font-bold tracking-widest uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    生成并复制全局 Master JSON
                  </button>
                </div>

                {/* Import Side */}
                <div className="space-y-3 p-4 bg-zinc-950/50 border border-zinc-850 rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-white font-bold text-xs flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-sky-400" />
                      <span>第二步：从 Master 备份中恢复</span>
                    </h4>
                    <p className="text-[10px] text-zinc-500 mt-1 leading-normal font-sans">
                      直接粘贴你之前备份的 Master JSON，或者从 AI 助手处获取的新配置 JSON，一键恢复至当前浏览器！
                    </p>
                  </div>
                  <div className="space-y-2">
                    <textarea
                      placeholder="在此处粘贴 Master JSON 配置..."
                      value={importJsonInput}
                      onChange={(e) => setImportJsonInput(e.target.value)}
                      className="w-full h-16 p-2 bg-zinc-900 border border-zinc-850 rounded text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-sky-500 leading-normal"
                    />
                    <button
                      onClick={() => {
                        if (!importJsonInput.trim()) {
                          alert("请先粘贴有效的 JSON 配置代码！");
                          return;
                        }
                        const success = handleImportMasterConfig(importJsonInput);
                        if (success) {
                          setImportJsonInput("");
                          setShowMasterBackupModal(false);
                        }
                      }}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-550 text-white rounded-lg text-xs font-bold tracking-widest uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      安全导入并一键恢复
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-[10px] text-zinc-500 leading-normal flex items-start gap-1.5 font-sans">
                <HelpCircle className="w-4 h-4 flex-shrink-0 text-amber-500" />
                <span>
                  💡 <b>大师提示：</b>当你需要 AI 助手同步你更改的多个模块，或者你在新电脑上打开网页时，
                  只要用这个一键全局 Master JSON 就可以了！AI 助手在接到你发给它的全局 Master JSON 后，也会一次性直接更新所有代码里的 static 默认配置，再也不用担心多页面不同步、一修改其他屏丢失或重置的烦恼！
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default App;
