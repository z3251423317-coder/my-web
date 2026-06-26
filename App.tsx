/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroScene, QuantumComputerScene } from './components/QuantumScene';
import { SurfaceCodeDiagram, TransformerDecoderDiagram, PerformanceMetricDiagram } from './components/Diagrams';
import { 
  ArrowDown, Menu, X, BookOpen, Settings, Layers, Eye, EyeOff, RotateCcw, 
  HelpCircle, Monitor, Compass, LayoutGrid, Check, Image as ImageIcon, 
  Video as VideoIcon, Sparkles, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Send, MapPin, 
  Phone, Globe, Copy, RefreshCw, Palette, UploadCloud, AlertTriangle, CheckCircle,
  Trash2, Plus, Minus, ExternalLink, Code, GripVertical
} from 'lucide-react';
import { ScreenData, BackgroundType } from './types';
import PillNav, { PillNavItem } from './components/PillNav';
import LogoLoop from './components/LogoLoop';
import ErrorBoundary from './components/ErrorBoundary';
import InfiniteMenu from './components/InfiniteMenu';
import DomeGallery from './components/DomeGallery';
import ProfileCard from './components/ProfileCard';
import { PdfDecoderPage } from './components/PdfDecoderPage';

export interface MarqueeCard {
  id: number;
  title: string;
  cat: string;
  desc: string;
  url: string;
  colorType?: string;
  image?: string;
}

const DEFAULT_MARQUEE_CARDS: MarqueeCard[] = [
  { id: 1, title: "精彩的人生是奋斗出来的，但幸福的人生不是", cat: "生活哲学", desc: "阿斯兰还v哈落地v哈定律ID死哦急急急急急急急急急急急急急急急急急急急急急急急急急急急斤斤计较急急急急急急急急急急急急急急急急急急急急急急阿斯兰还v哈落地v哈定律ID死哦急急急急急急急急急急急急急急急急急急急急急急急急急急急斤斤计较急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急积极斤斤计较急急急急急急急急急急急急嘿嘿嘿嘿阿斯兰还v哈落地v哈定律ID死哦急急急急急急急急急急急急急急急急急急急急急急急急急急急斤斤计较急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急积极斤斤计较急急急急急急急急急急急急嘿嘿嘿嘿阿斯兰还v哈落地v哈定律ID死哦急急急急急急急急急急急急急急急急急急急急急急急急急急急斤斤计较急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急积极斤斤计较急急急急急急急急急急急急嘿嘿嘿嘿阿斯兰还v哈落地v哈定律ID死哦急急急急急急急急急急急急急急急急急急急急急急急急急急急斤斤计较急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急积极斤斤计较急急急急急急急急急急急急嘿嘿嘿嘿急急急急急急急急急急急急急急急急急急急急急急急急急急积极斤斤计较急急急急急急急急急急急急嘿嘿嘿嘿阿斯兰还v哈落地v哈定律ID死哦急急急急急急急急急急急急急急急急急急急急急急急急急急急斤斤计较急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急急积极斤斤计较急急急急急急急急急急急急嘿嘿嘿嘿", url: "https://huaban.com/discovery", colorType: "teal", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000&auto=format&fit=crop" },
  { id: 2, title: "Primal Syndrome", cat: "DECODER GATE", desc: "Dynamic error location extraction pipelines in real-time.", url: "", colorType: "teal", image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=600&auto=format&fit=crop" },
  { id: 3, title: "Stabilizer Parity", cat: "X-Z MEASURE", desc: "Continuous quantum parity watchdog capturing local leakage.", url: "", colorType: "amber", image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=600&auto=format&fit=crop" },
  { id: 4, title: "Decoder Mesh", cat: "TRANSFORMER", desc: "High-throughput neural block predicting complex noise.", url: "", colorType: "rose", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop" },
  { id: 5, title: "Cosmic Ray Shield", cat: "ENVIRONMENT", desc: "Mapping historical, highly correlated multi-qubit events.", url: "", colorType: "purple", image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop" },
  { id: 6, title: "Synergy Routing", cat: "ROUTING LAYER", desc: "Active syndrome routing grids updating at micro-second scale.", url: "", colorType: "emerald", image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600&auto=format&fit=crop" },
  { id: 7, title: "Coherent Decay", cat: "LOGICAL COHERENCE", desc: "Physical leakage mitigation with strict fault-tolerance limits.", url: "", colorType: "pink", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop" },
  { id: 8, title: "MWPM Solver", cat: "HEURISTICS", desc: "Optimal graph matching comparison validating error bounds.", url: "", colorType: "sky", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop" },
  { id: 9, title: "Decoder Latency", cat: "PERFORMANCE", desc: "Tracking neural response constraints against physical T1 times.", url: "", colorType: "fuchsia", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop" },
  { id: 10, title: "Weight Distribution", cat: "ATTENTION MAP", desc: "Multi-head attention maps focusing on key noise correlations.", url: "", colorType: "blue", image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop" }
];

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
    case "blue":
    default: return { style: "border-blue-500/30 text-blue-400 bg-blue-500/10 hover:border-blue-400/50 hover:shadow-blue-500/10", glow: "from-blue-500/25 to-transparent", icon: Palette };
  }
};

/// Default Screen Templates
const DEFAULT_SCREENS: ScreenData[] = [
  {
    id: 1,
    label: "01. Title Hero",
    title: "塑造",
    subtitle: "我不在执迷寻找\n我是谁由我自己塑造",
    description: "A state-of-the-art recurrent, transformer-based neural network model that learns to decode surface code errors with unprecedented reliability on real quantum processors.",
    bgType: "image",
    bgUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop",
    overlayOpacity: 45,
    overlayBlur: 0,
    tintColor: "slate",
    align: "left",
    ctaText: "Discover the Science",
    ctaUrl: "#screen-2"
  },
  {
    id: 2,
    label: "02. Syndrome Map",
    title: "Interactive Syndrome Logic",
    subtitle: "Real-time Parity Checks Across Qubit Grids",
    description: "Interspersed stabilizer watchdogs constantly measure X and Z parity grids inside the processor. Adjust the interactive grid below to observe error propagation and watch stabilizers activate as syndrome signals.",
    bgType: "gradient",
    bgUrl: "linear-gradient(to right, #0f172a, #050b14)",
    overlayOpacity: 20,
    overlayBlur: 0,
    tintColor: "none",
    align: "left",
    ctaText: "Trigger Error Cycles",
    ctaUrl: "#screen-3"
  },
  {
    id: 3,
    label: "03. Recursive Brain",
    title: "无限进步",
    subtitle: "Parsing complex spatial & temporal error clusters",
    description: "以矛盾观审视生活，用实践完成自我迭代",
    bgType: "image",
    bgUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000&auto=format&fit=crop",
    overlayOpacity: 70,
    overlayBlur: 3,
    tintColor: "indigo",
    align: "right",
    ctaText: "Explore Architecture",
    ctaUrl: "#screen-4"
  },
  {
    id: 4,
    label: "04. Benchmarks",
    title: "Empirical Precision Gains",
    subtitle: "Lower logical error rates across code distances",
    description: "AlphaQubit outscores modern industry-standard algorithms, like Minimum-Weight Perfect Matching (MWPM), on all standard scales. Click the dynamic distances (3, 5, or 11) to study absolute error decay.",
    bgType: "image",
    bgUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=2000&auto=format&fit=crop",
    overlayOpacity: 40,
    overlayBlur: 0,
    tintColor: "none",
    align: "center",
    ctaText: "See Live Data Sheets",
    ctaUrl: "#screen-5"
  },
  {
    id: 5,
    label: "05. Hardware Lab",
    title: "Deep In-Processor Trial",
    subtitle: "Sycamore Superconducting Processor Deployment",
    description: "We validate our model against real physical data generated directly on Google's Sycamore quantum computer, yielding pristine predictions even on highly complex, asymmetric error signals.",
    bgType: "image",
    bgUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2000&auto=format&fit=crop",
    overlayOpacity: 50,
    overlayBlur: 0,
    tintColor: "none",
    align: "left",
    ctaText: "Hardware Specs",
    ctaUrl: "#screen-6"
  },
  {
    id: 6,
    label: "06. Interactive Trial Deck",
    title: "Sycamore Syndrome Diagnostic Suite",
    subtitle: "Real-time spatial error patterns and physical latency metrics",
    description: "Click any card in the continuous right-to-left feed to lock onto the signal, analyze real-time spatial error patterns, and review physical latency metrics.",
    bgType: "image",
    bgUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000",
    overlayOpacity: 30,
    overlayBlur: 0,
    tintColor: "none",
    align: "center",
    ctaText: "Launch Diagnostics",
    ctaUrl: "#screen-7"
  },
  {
    id: 7,
    label: "07. Global Roadmap",
    title: "Evolution of Quantum Systems",
    subtitle: "Timeline of the fault-tolerance horizon",
    description: "Our blueprint stretches over key functional eras—from initial noisy hardware calibration (Phase 1) to scalable error correction (Phase 3) and full multi-thousand physical cubyte computational systems (Phase 4).",
    bgType: "image",
    bgUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000",
    overlayOpacity: 75,
    overlayBlur: 1,
    tintColor: "slate",
    align: "center",
    ctaText: "Join Team Pathway",
    ctaUrl: "#screen-8"
  },
  {
    id: 8,
    label: "08. Perspective",
    title: "Revolutionary Foundations",
    subtitle: "The word from our leadership team",
    description: "By utilizing direct machine-learned patterns over simulated templates, we break past theoretical algorithm boundaries, making physical quantum computers appear substantially cleaner than their physical components indicate.",
    bgType: "image",
    bgUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop",
    overlayOpacity: 80,
    overlayBlur: 2,
    tintColor: "gold",
    align: "left",
    ctaText: "Read Joint Publication",
    ctaUrl: "#screen-9"
  },
  {
    id: 9,
    label: "09. Access Point",
    title: "Connect with AlphaQubit",
    subtitle: "Enter the fault-tolerant era today",
    description: "Be the first to access our open-source research code pipelines, test your customs models, or initiate corporate research partnerships with our high-performance simulation grid.",
    bgType: "image",
    bgUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2000",
    overlayOpacity: 65,
    overlayBlur: 4,
    tintColor: "slate",
    align: "center",
    ctaText: "Subscribe to Bulletins",
    ctaUrl: "#"
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
      bgType: idx % 2 === 0 ? "video" : "gradient",
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
      bgType: "image",
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
      bgType: idx % 3 === 0 ? "video" : "image",
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

const App: React.FC = () => {
  const [screens, setScreens] = useState<ScreenData[]>(() => {
    const saved = localStorage.getItem("alphaqubit_custom_screens_v10");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.some((s: any) => s.id === 9)) {
          localStorage.removeItem("alphaqubit_custom_screens_v10");
          return DEFAULT_SCREENS;
        }
        // Force update screen 3 to new values
        const migrated = parsed.map((s: any) => {
          if (s.id === 3) {
            return {
              ...s,
              title: "无限进步",
              description: "以矛盾观审视生活，用实践完成自我迭代"
            };
          }
          return s;
        });
        return migrated;
      } catch (e) { console.error(e); }
    }
    return DEFAULT_SCREENS;
  });

  const [activeId, setActiveId] = useState<number>(1);

  const [pillNavItems, setPillNavItems] = useState<PillNavItem[]>(() => {
    const saved = localStorage.getItem("alphaqubit_pill_nav_items_v4");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.some((item: any) => item.href === "#screen-6")) {
          localStorage.removeItem("alphaqubit_pill_nav_items_v4");
          // return default below
        } else {
          return parsed;
        }
      } catch (e) { console.error(e); }
    }
    return [
      { label: "Home", href: "#screen-1" },
      { label: "Decoder", href: "#screen-3" },
      { label: "Gallery", href: "#screen-5" },
      { label: "Trial Deck", href: "#screen-6" },
      { label: "Roadmap", href: "#screen-7" },
    ];
  });

  const savePillNavItemsToStorage = (updated: PillNavItem[]) => {
    setPillNavItems(updated);
    localStorage.setItem("alphaqubit_pill_nav_items_v4", JSON.stringify(updated));
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

  // Dynamic Marquee Cards State for Screen 4 (which is the 3rd screen, index 2)
  const [marqueeCards, setMarqueeCards] = useState<MarqueeCard[]>(() => {
    const saved = localStorage.getItem("alphaqubit_marquee_cards");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: any) => c.id === 1 ? DEFAULT_MARQUEE_CARDS[0] : c);
        }
      } catch (e) {
        console.error("Failed to parse saved marquee cards", e);
      }
    }
    return DEFAULT_MARQUEE_CARDS;
  });

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
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: any) => c.id === 1 ? DEFAULT_MARQUEE_CARDS[0] : c);
        }
      } catch (e) {
        console.error("Failed to parse saved sphere cards", e);
      }
    }
    // Deep clone DEFAULT_MARQUEE_CARDS so changes are fully independent
    return JSON.parse(JSON.stringify(DEFAULT_MARQUEE_CARDS));
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: any) => c.id === 1 ? DEFAULT_MARQUEE_CARDS[0] : c);
        }
      } catch (e) {
        console.error("Failed to parse saved dome cards", e);
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_MARQUEE_CARDS));
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: any) => c.id === 1 ? DEFAULT_MARQUEE_CARDS[0] : c);
        }
      } catch (e) {
        console.error("Failed to parse saved trial cards", e);
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_MARQUEE_CARDS));
  });

  const saveTrialCards = (updated: MarqueeCard[]) => {
    setTrialCards(updated);
    localStorage.setItem("alphaqubit_trial_cards", JSON.stringify(updated));
  };

  const [isConsoleOpen3, setIsConsoleOpen3] = useState<boolean>(import.meta.env.DEV); // Open by default for Screen 3 editing discovery
  const [isConsoleOpen4, setIsConsoleOpen4] = useState<boolean>(import.meta.env.DEV); // Open by default for Screen 4 editing discovery
  const [isConsoleOpen6, setIsConsoleOpen6] = useState<boolean>(import.meta.env.DEV); // Open by default for Screen 6 (DomeGallery) editing discovery
  const [isConsoleOpen10, setIsConsoleOpen10] = useState<boolean>(import.meta.env.DEV); // Open by default for Screen 10 (Interactive Trial Deck) editing discovery
  const [domeAutoRotate, setDomeAutoRotate] = useState<boolean>(true);
  const [domeAutoRotateSpeed, setDomeAutoRotateSpeed] = useState<number>(0.15);
  const [activeCardDetail, setActiveCardDetail] = useState<MarqueeCard | null>(null);
  const [selectedCard6, setSelectedCard6] = useState<MarqueeCard | null>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [activeBgConsoleId, setActiveBgConsoleId] = useState<number | null>(null);

  useEffect(() => {
    if (copyToast) {
      const t = setTimeout(() => setCopyToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [copyToast]);

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
      alert("System constraint: At least 1 console card must remain initialized.");
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
      alert("System constraint: At least 1 console card must remain initialized.");
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
    localStorage.setItem("alphaqubit_custom_screens_v10", JSON.stringify(updated));
  };

  const updateScreenField = (field: keyof ScreenData, value: any) => {
    setScreens(prev => {
      const updated = prev.map(s => s.id === activeId ? { ...s, [field]: value } : s);
      localStorage.setItem("alphaqubit_custom_screens_v10", JSON.stringify(updated));
      return updated;
    });
  };

  const updateScreenFields = (fields: Partial<ScreenData>) => {
    setScreens(prev => {
      const updated = prev.map(s => s.id === activeId ? { ...s, ...fields } : s);
      localStorage.setItem("alphaqubit_custom_screens_v10", JSON.stringify(updated));
      return updated;
    });
  };

  const handleResetToDefault = () => {
    if (window.confirm("确定要重置当前的所有自定义文案、图片、视频背景以及导航选项吗？")) {
      saveToStorage(DEFAULT_SCREENS);
      localStorage.removeItem("alphaqubit_pill_nav_items_v4");
      setPillNavItems([
        { label: "Home", href: "#screen-1" },
        { label: "Decoder", href: "#screen-3" },
        { label: "Gallery", href: "#screen-5" },
        { label: "Trial Deck", href: "#screen-6" },
        { label: "Roadmap", href: "#screen-7" },
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // Syndrome Deck Console for Marquee Cards (Screen 3)
  const renderMarqueeConsole = () => {
    return (
      <AnimatePresence>
        {isConsoleOpen3 && (
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
                    MARQUEE CONSOLE / 走马灯卡片控制台
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-light font-sans">
                    Configure sliding noise matrices on Screen 3 (Third Slide)
                  </p>
                </div>
              </div>
              <div 
                role="button"
                id="close-console-3"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsConsoleOpen3(false);
                }}
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all cursor-pointer relative z-[999] pointer-events-auto flex items-center justify-center min-w-[32px] min-h-[32px]"
              >
                <X className="w-4 h-4" />
              </div>
            </div>

            {/* Console Quick Toolbar Actions */}
            <div className="p-4 bg-zinc-900/30 border-b border-zinc-850/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={addMarqueeCard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:border-amber-500/50 rounded-lg text-[10px] font-mono tracking-widest uppercase transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>ADD CARD / 增加卡片</span>
                </button>
                
                <button
                  onClick={removeLastMarqueeCard}
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
                      const codeStr = JSON.stringify(marqueeCards, null, 2);
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
                  <span>COPY CONFIG / 用于发给AI</span>
                </button>

                <button
                  onClick={resetMarqueeCards}
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
                💡 <span className="font-semibold text-zinc-200">走马灯卡片编辑：</span>这些修改仅对第三屏的走马灯滑动卡片生效。编辑完成后，可复制卡片配置发给 AI 写入代码。
              </div>

              {marqueeCards.map((card, idx) => {
                return (
                  <div 
                    key={card.id}
                    className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-850 hover:border-zinc-800 transition-all space-y-3 relative group"
                  >
                    {/* Item Header */}
                    <div className="flex items-center justify-between border-b border-zinc-800/40 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 font-mono text-[9px] rounded uppercase font-bold">
                          CHASSIS UNIT {idx + 1}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-600">ID: {card.id}</span>
                      </div>
                      <button
                        onClick={() => deleteMarqueeCard(card.id)}
                        className="text-zinc-600 hover:text-rose-500 p-1 opacity-60 group-hover:opacity-100 transition-all rounded hover:bg-rose-500/10 cursor-pointer"
                        title="Delete card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Title & Category Form Rows */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                          Card Title / 标题
                        </label>
                        <input 
                          type="text" 
                          value={card.title}
                          onChange={(e) => updateMarqueeCard(card.id, { title: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                          placeholder="Qubit Topology..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                          Category / 类别
                        </label>
                        <input 
                          type="text" 
                          value={card.cat}
                          onChange={(e) => updateMarqueeCard(card.id, { cat: e.target.value.toUpperCase() })}
                          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white uppercase focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                          placeholder="HARDWARE..."
                        />
                      </div>
                    </div>

                    {/* Description Form Row */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                        Description / 简述
                      </label>
                      <textarea 
                        value={card.desc}
                        onChange={(e) => updateMarqueeCard(card.id, { desc: e.target.value })}
                        rows={2}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20 resize-none leading-normal font-sans"
                        placeholder="Configure details..."
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
                        onChange={(e) => updateMarqueeCard(card.id, { url: e.target.value })}
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
                        onChange={(e) => updateMarqueeCard(card.id, { image: e.target.value })}
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
                              onClick={() => updateMarqueeCard(card.id, { colorType: color.name })}
                              className={`h-4.5 w-4.5 rounded-full ${color.bg} border transition-transform duration-200 cursor-pointer ${
                                isSelected ? 'scale-125 ring-2 ring-white/50 border-white' : 'scale-100 hover:scale-110 border-transparent opacity-80'
                              }`}
                              title={color.name.toUpperCase()}
                            />
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // Syndrome Deck Console for 3D Sphere Cards (Screen 4)
  const renderSphereConsole = () => {
    return (
      <AnimatePresence>
        {isConsoleOpen4 && (
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
                    3D SPHERE CONSOLE / 3D球形卡片控制台
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-light font-sans">
                    Configure spherical noise matrices on Screen 4 (Fourth Slide)
                  </p>
                </div>
              </div>
              <div 
                role="button"
                id="close-console-4"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsConsoleOpen4(false);
                }}
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all cursor-pointer relative z-[999] pointer-events-auto flex items-center justify-center min-w-[32px] min-h-[32px]"
              >
                <X className="w-4 h-4" />
              </div>
            </div>

            {/* Console Quick Toolbar Actions */}
            <div className="p-4 bg-zinc-900/30 border-b border-zinc-850/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={addSphereCard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:border-amber-500/50 rounded-lg text-[10px] font-mono tracking-widest uppercase transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>ADD CARD / 增加卡片</span>
                </button>
                
                <button
                  onClick={removeLastSphereCard}
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
                      const codeStr = JSON.stringify(sphereCards, null, 2);
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
                  <span>COPY CONFIG / 用于发给AI</span>
                </button>

                <button
                  onClick={resetSphereCards}
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
                💡 <span className="font-semibold text-zinc-200">3D球形卡片编辑：</span>这些修改仅对第四屏的3D旋转球形卡片生效。
              </div>

              {sphereCards.map((card, idx) => {
                return (
                  <div 
                    key={card.id}
                    className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-850 hover:border-zinc-800 transition-all space-y-3 relative group"
                  >
                    {/* Item Header */}
                    <div className="flex items-center justify-between border-b border-zinc-800/40 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 font-mono text-[9px] rounded uppercase font-bold">
                          SPHERE UNIT {idx + 1}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-600">ID: {card.id}</span>
                      </div>
                      <button
                        onClick={() => deleteSphereCard(card.id)}
                        className="text-zinc-600 hover:text-rose-500 p-1 opacity-60 group-hover:opacity-100 transition-all rounded hover:bg-rose-500/10 cursor-pointer"
                        title="Delete card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Title & Category Form Rows */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                          Card Title / 标题
                        </label>
                        <input 
                          type="text" 
                          value={card.title}
                          onChange={(e) => updateSphereCard(card.id, { title: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                          placeholder="Qubit Topology..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                          Category / 类别
                        </label>
                        <input 
                          type="text" 
                          value={card.cat}
                          onChange={(e) => updateSphereCard(card.id, { cat: e.target.value.toUpperCase() })}
                          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white uppercase focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                          placeholder="HARDWARE..."
                        />
                      </div>
                    </div>

                    {/* Description Form Row */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                        Description / 简述
                      </label>
                      <textarea 
                        value={card.desc}
                        onChange={(e) => updateSphereCard(card.id, { desc: e.target.value })}
                        rows={2}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20 resize-none leading-normal font-sans"
                        placeholder="Configure details..."
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
                        onChange={(e) => updateSphereCard(card.id, { url: e.target.value })}
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
                        onChange={(e) => updateSphereCard(card.id, { image: e.target.value })}
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
                              onClick={() => updateSphereCard(card.id, { colorType: color.name })}
                              className={`h-4.5 w-4.5 rounded-full ${color.bg} border transition-transform duration-200 cursor-pointer ${
                                isSelected ? 'scale-125 ring-2 ring-white/50 border-white' : 'scale-100 hover:scale-110 border-transparent opacity-80'
                              }`}
                              title={color.name.toUpperCase()}
                            />
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderGenericConsole = (
    isOpen: boolean, 
    setIsOpen: (open: boolean) => void, 
    consoleTitle: string,
    screenLabel: string,
    cards: MarqueeCard[] | null,
    saveCards: ((updated: MarqueeCard[]) => void) | null,
    showRotateControls: boolean,
    currentScreen: ScreenData,
    onUpdateScreen: (updated: ScreenData) => void
  ) => {
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

    const deleteCard = (id: number) => {
      if (!cards || !saveCards) return;
      if (cards.length > 1) {
        saveCards(cards.filter(c => c.id !== id));
      } else {
        alert("System constraint: At least 1 console card must remain initialized.");
      }
    };

    const updateCard = (id: number, fields: Partial<MarqueeCard>) => {
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isTemp: boolean = false) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          if (isTemp) {
            onUpdateScreen({ ...currentScreen, tempBgUrl: reader.result as string, tempBgType: file.type.startsWith('video') ? 'video' : 'image' });
          } else {
            onUpdateScreen({ ...currentScreen, bgUrl: reader.result as string, bgType: file.type.startsWith('video') ? 'video' : 'image' });
          }
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <AnimatePresence>
        {isOpen && (
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
                  setIsOpen(false);
                }}
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all cursor-pointer relative z-[999] pointer-events-auto flex items-center justify-center min-w-[32px] min-h-[32px]"
              >
                <X className="w-4 h-4" />
              </div>
            </div>

            {/* Background & Temperature Control Panels (Only in BG Settings Console) */}
            {consoleTitle.startsWith("BACKGROUND & TEMP SETTINGS") && (
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
                        <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleFileChange(e, false)} />
                     </label>
                  </div>
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
                        <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleFileChange(e, true)} />
                     </label>
                  </div>
                </div>
              </>
            )}

            {cards && saveCards && (
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
                  <span>COPY CONFIG / 用于发给AI</span>
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
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-zinc-950"></div>
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
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 font-mono text-[9px] rounded uppercase font-bold">
                          CARD UNIT {idx + 1}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-600">ID: {card.id}</span>
                      </div>
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="text-zinc-600 hover:text-rose-500 p-1 opacity-60 group-hover:opacity-100 transition-all rounded hover:bg-rose-500/10 cursor-pointer"
                        title="Delete card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 select-none flex flex-col font-sans">
      
      {/* PillNav centered navigation header - only displayed on the first screen */}
      {activeId === 1 ? (
        <PillNav 
          logo="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=100&h=100&fit=crop"
          logoAlt="α"
          items={pillNavItems}
          activeHref="#screen-1"
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
          baseColor="#09090b"
          pillColor="#18181b"
          pillTextColor="#e4e4e7"
          hoveredPillTextColor="#f59e0b"
        />
      ) : (
        /* Floating Brand Badge (Minimal & Floating) - Only on other screens to keep focus clean */
        <div 
          onClick={() => scrollToScreen(1)} 
          className="fixed top-6 left-6 z-40 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-950/40 hover:bg-zinc-900/60 border border-zinc-850/40 backdrop-blur-md cursor-pointer transition-all select-none"
        >
          <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-serif font-black text-sm pb-px shadow">α</div>
          <span className="font-display font-semibold tracking-widest text-[11px] text-zinc-200">ALPHAQUBIT</span>
        </div>
      )}

      {/* Elegant, Minimalist Page-Level Navigation Suite (Fixed on Display Page) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2 pointer-events-auto">
        {/* Screen Counter Badge */}
        <div className="px-2.5 py-1 bg-zinc-950/80 border border-zinc-800/80 rounded-full font-mono text-[9px] tracking-widest text-zinc-400 font-bold backdrop-blur-md shadow-lg select-none">
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
          className="p-2.5 bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 rounded-full backdrop-blur-md text-zinc-400 hover:text-white transition-all cursor-pointer shadow-lg disabled:opacity-30 disabled:pointer-events-none active:scale-90"
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
          className="p-2.5 bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 rounded-full backdrop-blur-md text-zinc-400 hover:text-white transition-all cursor-pointer shadow-lg disabled:opacity-30 disabled:pointer-events-none active:scale-90"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Developer Settings Control Panel (Only visible in DEV, draggable, clean and elegant) */}
      {import.meta.env.DEV && (
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
            onClick={() => setActiveBgConsoleId(activeBgConsoleId === activeId ? null : activeId)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-mono tracking-widest uppercase transition-all shadow-md cursor-pointer ${
              activeBgConsoleId !== null
                ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-550 font-bold' 
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-700 hover:bg-zinc-850'
            }`}
          >
            <Settings className={`w-3.5 h-3.5 ${activeBgConsoleId !== null ? 'animate-spin' : ''}`} />
            <span>{activeBgConsoleId !== null ? 'HIDE BG SETTINGS' : 'BG SETTINGS'}</span>
          </button>

          {/* Deploy to Git */}
          <button
            onClick={() => {
              const appState = {
                screens,
                marqueeCards,
                sphereCards,
                domeCards,
                trialCards
              };
              const codeStr = JSON.stringify(appState, null, 2);
              const prompt = `Please deploy my app to Git. Here is my current application state:\n\n${codeStr}\n\nPlease apply this configuration to the app and deploy.`;
              if (navigator.clipboard) {
                navigator.clipboard.writeText(prompt).then(() => {
                  alert("App state copied! Paste it in the chat for the AI to deploy to git.");
                });
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl border border-emerald-500/50 text-[10px] font-mono tracking-widest uppercase transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Code className="w-3.5 h-3.5" />
            <span>DEPLOY TO GIT</span>
          </button>
        </motion.div>
      )}

      {/* Global Background Settings Console */}
      {renderGenericConsole(
        activeBgConsoleId !== null,
        (open) => setActiveBgConsoleId(open ? activeId : null),
        `BACKGROUND & TEMP SETTINGS (SCREEN ${activeBgConsoleId || activeId} / 第 ${activeBgConsoleId || activeId} 屏)`,
        `Configure background layers and ambient temperature for Screen ${activeBgConsoleId || activeId}`,
        null,
        null,
        false,
        screens.find(s => s.id === (activeBgConsoleId || activeId)) || screens[0],
        (updated) => setScreens(prev => prev.map(s => s.id === updated.id ? updated : s))
      )}

      {/* Global Animated Background Container */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <AnimatePresence>
          <motion.div
            key={`global-bg-${activeScreen.id}-${activeScreen.bgUrl}-${activeScreen.bgType}-${activeScreen.tintColor}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            className="absolute inset-0 w-full h-full"
          >
            {activeScreen.bgType === 'image' && (
              <img 
                src={activeScreen.bgUrl} 
                alt={`bg-${activeScreen.id}`} 
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-transform duration-[6000ms] scale-100 filter brightness-95" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000";
                }}
              />
            )}
            
            {activeScreen.bgType === 'video' && (
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                key={activeScreen.bgUrl}
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={activeScreen.bgUrl} type="video/mp4" />
              </video>
            )}

            {activeScreen.bgType === 'gradient' && (
              <div 
                className="absolute inset-0 w-full h-full filter brightness-90" 
                style={{ background: activeScreen.bgUrl }}
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
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                key={`temp-vid-${activeScreen.tempBgUrl}`}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 mix-blend-screen"
                style={{ opacity: (activeScreen.temperature ?? 25) / 100 }}
              >
                <source src={activeScreen.tempBgUrl} type="video/mp4" />
              </video>
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
      </div>

      {/* Primary vertical scroll presenter with snapping behavior */}
      <div 
        id="slides-container"
        className="flex-1 w-full h-full overflow-y-auto lg:snap-y lg:snap-mandatory scroll-smooth relative z-10 bg-transparent"
      >
        {screens.map((s, idx) => {
          const isSelected = s.id === activeId;
          
          if (s.id === 4) {
            return (
              <section 
                key={s.id}
                id={`screen-${s.id}`}
                className="snap-start lg:snap-always relative w-full h-screen overflow-hidden flex items-center justify-center bg-transparent"
              >
                {/* Floating controls specifically for Screen 4 to toggle the drawer */}
                {import.meta.env.DEV && (
                  <div className="absolute top-20 right-6 lg:top-6 lg:right-44 z-50 pointer-events-auto flex items-center gap-3">
                    <button
                      onClick={() => setIsConsoleOpen4(!isConsoleOpen4)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-mono tracking-widest uppercase transition-all duration-300 shadow-lg cursor-pointer backdrop-blur-md ${
                        isConsoleOpen4 
                          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-550 font-bold' 
                          : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-700 hover:bg-zinc-850'
                      }`}
                    >
                      <Settings className={`w-3.5 h-3.5 ${isConsoleOpen4 ? 'animate-spin' : ''}`} />
                      <span>{isConsoleOpen4 ? "HIDE CONSOLE / 隐藏控制台" : "CARD CONSOLE / 打开控制台"}</span>
                    </button>
                  </div>
                )}

                <div className="absolute inset-0 w-full h-full pointer-events-auto">
                  <InfiniteMenu
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
                        if (originalCard.url) {
                          window.open(originalCard.url, '_blank', 'noopener,noreferrer');
                        } else {
                          handleCardClick(originalCard);
                        }
                      }
                    }}
                  />
                </div>

                {/* Reusable Syndrome Deck Console drawer */}
                {renderGenericConsole(isConsoleOpen4, setIsConsoleOpen4, "3D SPHERE CONSOLE (SCREEN 4) / 3D球形控制台 (第4屏)", "Configure spherical noise matrices on Screen 4 (Fourth Slide)", sphereCards, saveSphereCards, false, screens.find(s => s.id === 4) || screens[0], (updated) => setScreens(prev => prev.map(s => s.id === updated.id ? updated : s)))}
              </section>
            );
          }

          if (s.id === 5) {
            return (
              <section 
                key={s.id}
                id={`screen-${s.id}`}
                className="snap-start lg:snap-always relative w-full h-screen overflow-hidden flex items-center justify-center bg-transparent"
              >
                {/* Floating controls specifically for Screen 5 to toggle the dome drawer */}
                {import.meta.env.DEV && (
                  <div className="absolute top-24 right-6 lg:top-6 lg:right-6 z-50 pointer-events-auto flex items-center gap-3">
                    <button
                      onClick={() => setIsConsoleOpen6(!isConsoleOpen6)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-mono tracking-widest uppercase transition-all duration-300 shadow-lg cursor-pointer backdrop-blur-md ${
                        isConsoleOpen6 
                          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-550 font-bold' 
                          : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-700 hover:bg-zinc-850'
                      }`}
                    >
                      <Settings className={`w-3.5 h-3.5 ${isConsoleOpen6 ? 'animate-spin' : ''}`} />
                      <span>{isConsoleOpen6 ? "HIDE CONSOLE / 隐藏控制台" : "DOME CONSOLE / 打开画廊控制台"}</span>
                    </button>
                  </div>
                )}

                <div className="absolute inset-0 w-full h-full pointer-events-auto">
                  <DomeGallery
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
                      alt: card.title
                    }))}
                    grayscale={false}
                    autoRotate={domeAutoRotate}
                    autoRotateSpeed={domeAutoRotateSpeed}
                  />
                </div>

                {/* Reusable Dome Console drawer */}
                {renderGenericConsole(isConsoleOpen6, setIsConsoleOpen6, "3D DOME GALLERY CONSOLE (SCREEN 5) / 穹顶画廊控制台 (第5屏)", "Configure 3D Dome Gallery and cards metadata on Screen 5", domeCards, saveDomeCards, true, screens.find(s => s.id === 5) || screens[0], (updated) => setScreens(prev => prev.map(s => s.id === updated.id ? updated : s)))}
              </section>
            );
          }

          if (s.id === 6) {
            const activeCard6 = selectedCard6 ? (trialCards.find(c => c.id === selectedCard6.id) || selectedCard6) : null;
            return (
              <section 
                key={s.id}
                id={`screen-${s.id}`}
                className="snap-start lg:snap-always relative w-full h-screen overflow-hidden flex items-center justify-center bg-transparent"
              >
                {/* Floating controls specifically for Screen 6 to toggle the console drawer */}
                {import.meta.env.DEV && (
                  <div className="absolute top-24 right-6 lg:top-6 lg:right-6 z-50 pointer-events-auto flex items-center gap-3">
                    <button
                      onClick={() => setIsConsoleOpen10(!isConsoleOpen10)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-mono tracking-widest uppercase transition-all duration-300 shadow-lg cursor-pointer backdrop-blur-md ${
                        isConsoleOpen10 
                          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-550 font-bold' 
                          : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-700 hover:bg-zinc-850'
                      }`}
                    >
                      <Settings className={`w-3.5 h-3.5 ${isConsoleOpen10 ? 'animate-spin' : ''}`} />
                      <span>{isConsoleOpen10 ? "HIDE CONSOLE / 隐藏控制台" : "CARD CONSOLE / 打开卡片控制台"}</span>
                    </button>
                  </div>
                )}

                {/* Main Content Area */}
                <div className="relative z-10 w-full h-full max-w-[1700px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col justify-center text-white pointer-events-auto">
                  <AnimatePresence mode="wait">
                    {!selectedCard6 ? (
                      // State 1: Horizontal Sliding Marquee List of Cards (From Right to Left)
                      <motion.div
                        key="marquee-list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="w-full flex flex-col gap-6 mt-4 md:mt-8"
                      >
                        {/* Title and Instruction Header */}
                        <div className="text-center space-y-2 mb-4">
                          <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-mono tracking-widest uppercase font-semibold border border-amber-500/20">
                            INTERACTIVE TRIAL DECK / 纠错算法看板
                          </span>
                          <h2 className="text-2xl md:text-4xl font-display font-bold tracking-tight text-white uppercase">
                            Sycamore Syndrome Diagnostic Suite
                          </h2>
                          <p className="text-xs md:text-sm text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed">
                            Click any card in the continuous right-to-left feed to lock onto the signal, analyze real-time spatial error patterns, and review physical latency metrics.
                          </p>
                        </div>

                        {/* Infinite Right-to-Left Scrolling Track */}
                        <div className="relative w-full overflow-hidden py-10 select-none bg-zinc-900/20 rounded-3xl border border-zinc-900 backdrop-blur-sm">
                          {/* Left & Right fading shadow masks */}
                          <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
                          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

                          {/* Horizontal flex track with animation */}
                          {(() => {
                            const minCardsRequired6 = 12;
                            const repeats6 = Math.ceil(minCardsRequired6 / Math.max(1, trialCards.length));
                            const singleGroupCards6: typeof trialCards = [];
                            for (let r = 0; r < repeats6; r++) {
                              singleGroupCards6.push(...trialCards);
                            }

                            return (
                              <div className="flex gap-6 overflow-hidden">
                                <div 
                                  className="flex gap-6 animate-marquee-forward hover:[animation-play-state:paused]"
                                  style={{
                                    animationPlayState: !domeAutoRotate ? 'paused' : undefined,
                                    animationDuration: `${35 / (domeAutoRotateSpeed * 6 || 1)}s`
                                  }}
                                >
                                  {[...Array(2)].map((_, groupIdx) => (
                                    <React.Fragment key={groupIdx}>
                                      {singleGroupCards6.map((card, idx) => {
                                        const defaultImage = [
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
                                        ][(card.id - 1) % 10];
                                        
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
                                            key={`clone-${card.id}-${groupIdx}-${idx}`}
                                            className="flex-shrink-0 cursor-pointer pointer-events-auto"
                                            style={{ width: '272px' }}
                                            onClickCapture={() => setSelectedCard6(card)}
                                          >
                                            <ProfileCard
                                              name={card.title}
                                              title={card.desc}
                                              handle={card.cat || "TELEMETRY"}
                                              status="DIAGNOSTIC ACTIVE"
                                              contactText="Analyze / 诊断"
                                              avatarUrl={card.image || defaultImage}
                                              showUserInfo={true}
                                              enableTilt={true}
                                              behindGlowEnabled={true}
                                              behindGlowColor={glowColor}
                                              onContactClick={() => setSelectedCard6(card)}
                                            />
                                          </div>
                                        );
                                      })}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </motion.div>
                    ) : (
                      // State 2: Split Detailed View (Card moves to Left, text displays on the Right)
                      <motion.div
                        key="split-detail"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full flex flex-col justify-center h-full max-h-[85vh] mt-4 md:mt-8"
                      >
                        {/* Go back Button at Top Left */}
                        <div className="mb-6 flex">
                          <button
                            onClick={() => setSelectedCard6(null)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-mono tracking-widest text-zinc-300 hover:text-white transition-all cursor-pointer shadow-lg"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>BACK TO DECK / 返回卡片组</span>
                          </button>
                        </div>

                        {/* Split columns layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
                          {/* Left Column: The clicked card itself with floating presentation */}
                          <div className="lg:col-span-5 flex justify-center lg:justify-end pr-0 lg:pr-8">
                            <motion.div
                              initial={{ x: 100, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ type: "spring", damping: 20 }}
                              className="relative w-80 h-[430px] rounded-2xl overflow-hidden border border-zinc-700/60 bg-zinc-950 p-6 flex flex-col justify-between shadow-2xl"
                            >
                              {/* Accent top glow */}
                              <div className={`absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r ${getCardColorAndIcon(activeCard6.colorType).glow}`} />

                              {/* Background Image */}
                              <div className="absolute inset-0 z-0 opacity-40">
                                <img
                                  src={activeCard6.image || [
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
                                  ][(activeCard6.id - 1) % 10]}
                                  alt={activeCard6.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/30 via-zinc-950/60 to-zinc-950" />
                              </div>

                              {/* Top */}
                              <div className="relative z-10 flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-md bg-zinc-900/90 text-zinc-400 text-[10px] font-mono tracking-widest border border-zinc-800">
                                  {activeCard6.cat || "DIAGNOSTIC CARD"}
                                </span>
                                <div className={`p-1.5 rounded-lg border ${getCardColorAndIcon(activeCard6.colorType).style}`}>
                                  {React.createElement(getCardColorAndIcon(activeCard6.colorType).icon || Sparkles, { className: "w-4 h-4" })}
                                </div>
                              </div>

                              {/* Bottom */}
                              <div className="relative z-10 space-y-3">
                                <span className="text-[10px] font-mono text-amber-500 font-bold block tracking-widest">ACTIVE DIAGNOSTIC SLOT</span>
                                <h3 className="text-xl font-display font-bold text-white tracking-tight">
                                  {activeCard6.title}
                                </h3>
                                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                                  {activeCard6.desc}
                                </p>
                                <div className="pt-2 flex items-center justify-between border-t border-zinc-900/80 text-[10px] font-mono text-zinc-500">
                                  <span>SYS ID: {activeCard6.id.toString().padStart(4, '0')}</span>
                                  <span className="text-emerald-500 animate-pulse">● SIGNAL ESTABLISHED</span>
                                </div>
                              </div>
                            </motion.div>
                          </div>

                          {/* Right Column: Detailed narrative & Text info */}
                          <div className="lg:col-span-7 space-y-6">
                            <motion.div
                              initial={{ x: -50, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ type: "spring", damping: 20, delay: 0.1 }}
                              className="space-y-5"
                            >
                              <div className="space-y-2">
                                <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-md text-[10px] font-mono tracking-widest uppercase">
                                  MODULE CONFIG: {activeCard6.cat || "GENERAL PROTOCOL"}
                                </span>
                                <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white uppercase leading-none">
                                  {activeCard6.title}
                                </h1>
                              </div>

                              <div className="p-5 bg-zinc-900/30 border border-zinc-900 backdrop-blur-md rounded-2xl space-y-3">
                                <h4 className="text-xs font-mono font-bold tracking-widest text-zinc-500 uppercase">
                                  ANALYSIS SUMMARY / 诊断摘要
                                </h4>
                                <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                                  {activeCard6.desc} This quantum module represents a core logical structure within AlphaQubit's decoders. Physical calibration data demonstrates optimized microwave parameters and high coherence maintenance.
                                </p>
                              </div>

                              {/* Realistic Telemetry Subgrid to make it look exceptionally polished */}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-1">
                                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Syndrome Rate</span>
                                  <span className="text-sm font-mono text-white font-bold block">12.44 KHz</span>
                                </div>
                                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-1">
                                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Active Qubits</span>
                                  <span className="text-sm font-mono text-amber-500 font-bold block">72 Physical</span>
                                </div>
                                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-1 col-span-2 md:col-span-1">
                                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Calculated Latency</span>
                                  <span className="text-sm font-mono text-emerald-400 font-bold block">2.34 ms</span>
                                </div>
                              </div>

                              {/* Interactive Actions */}
                              <div className="flex flex-wrap items-center gap-4 pt-4">
                                {activeCard6.url && (
                                  <a
                                    href={activeCard6.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl text-xs font-mono tracking-widest uppercase transition-all shadow-lg cursor-pointer"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>LAUNCH DIAGNOSTIC / 运行诊断</span>
                                  </a>
                                )}
                                <button
                                  onClick={() => setSelectedCard6(null)}
                                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-mono tracking-widest uppercase transition-all cursor-pointer"
                                >
                                  CLOSE ANALYSIS / 关闭
                                </button>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Reusable Dome Console drawer */}
                {renderGenericConsole(isConsoleOpen10, setIsConsoleOpen10, "SLIDER CARD CONSOLE (SCREEN 6) / 移动卡片控制台 (第6屏)", "Configure sliding diagnostic cards and metadata on Screen 6", trialCards, saveTrialCards, false, screens.find(s => s.id === 6) || screens[0], (updated) => setScreens(prev => prev.map(s => s.id === updated.id ? updated : s)))}
              </section>
            );
          }

          return (
            <section 
              key={s.id}
              id={`screen-${s.id}`}
              className="snap-start lg:snap-always relative w-full min-h-screen lg:h-screen lg:min-h-[600px] overflow-visible lg:overflow-hidden flex items-center justify-center bg-transparent py-12 lg:py-0"
            >
              {/* 1700px Content Core ("版心控制在 1700px 左右") */}
              <div className="relative z-10 w-full h-auto lg:h-full max-w-[1700px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col justify-center text-white pointer-events-auto">
                {s.id === 3 ? (
                  /* Disabled Marquee Screen */
                  <div className="relative w-full py-12 flex flex-col justify-between h-auto min-h-[500px]">
                    
                    {/* Header Info + Controls Button */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.1 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-3 max-w-3xl"
                      >
                        <span className="font-mono text-amber-500 text-[10px] tracking-widest font-bold uppercase block bg-amber-500/10 px-2.5 py-1 rounded w-fit border border-amber-500/20">
                          {s.label} • SYSTEM CHASSIS ARCHITECTURE
                        </span>
                        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-none">
                          {s.title}
                        </h1>
                        <p className="text-zinc-400 text-xs md:text-sm font-sans font-light leading-relaxed max-w-2xl">
                          {s.description}
                        </p>
                      </motion.div>

                      {/* Controls Toggle Trigger (Visible only on this screen, fulfilling user's '控制台只在该页显示') */}
                      {import.meta.env.DEV && (
                        <div className="flex items-center gap-3">
                          <button
                            id="console-toggle-btn"
                            onClick={() => setIsConsoleOpen3(!isConsoleOpen3)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-mono tracking-widest uppercase transition-all duration-300 shadow-md cursor-pointer ${
                              isConsoleOpen3 
                                ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-550 font-bold' 
                                : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-700 hover:bg-zinc-850'
                            }`}
                          >
                            <Settings className={`w-3.5 h-3.5 ${isConsoleOpen3 ? 'animate-spin' : ''}`} />
                            <span>{isConsoleOpen3 ? "HIDE CONSOLE / 隐藏控制台" : "CARD CONSOLE / 打开控制台"}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Infinite Marquee Left to Right Container */}
                    <div className="relative w-[100vw] left-1/2 -translate-x-1/2 py-8 overflow-hidden select-none my-2 bg-transparent">
                      
                      {/* Flex track running marquee animation. Hovering pauses the animation as requested. */}
                      {(() => {
                        // Ensure there are enough cards to span the viewport width (at least 10 cards per group)
                        // This allows seamless infinite scrolling loop even when only 1 or 2 cards exist in the console
                        const minCardsRequired = 10;
                        const repeats = Math.ceil(minCardsRequired / Math.max(1, marqueeCards.length));
                        const singleGroupCards: typeof marqueeCards = [];
                        for (let r = 0; r < repeats; r++) {
                          singleGroupCards.push(...marqueeCards);
                        }

                        return (
                          <div className="animate-marquee-reverse flex gap-6 py-2 hover:[animation-play-state:paused]">
                            {[...Array(2)].map((_, groupIdx) => (
                              <React.Fragment key={groupIdx}>
                                {singleGroupCards.map((card, idx) => {
                                  const { style: colorStyle, icon: CardIcon } = getCardColorAndIcon(card.colorType);
                                  return (
                                    <div 
                                      key={`${groupIdx}-${idx}-${card.id}`}
                                      onClick={() => handleCardClick(card)}
                                      className={`w-[270px] shrink-0 p-5 rounded-2xl glassmorphism-card hover:-translate-y-1.5 hover:scale-[1.01] flex flex-col justify-between text-left group/card cursor-pointer ${colorStyle}`}
                                    >
                                      <div>
                                        <div className="flex items-center justify-between mb-4">
                                          <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
                                            {card.cat || "GENERAL"}
                                          </span>
                                          <div className="p-1.5 rounded-lg border border-current opacity-85">
                                            <CardIcon className="w-3.5 h-3.5" />
                                          </div>
                                        </div>
                                        <h3 className="font-display font-bold text-white text-sm md:text-base group-hover/card:text-amber-400 transition-colors mb-2">
                                          {card.title.length > 20 ? card.title.substring(0, 20) + "..." : card.title}
                                        </h3>
                                        <p className="text-zinc-400 text-[10.5px] leading-relaxed font-sans font-light line-clamp-3 h-auto">
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
                                })}
                              </React.Fragment>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Bottom Action Footer for Screen 4 */}
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

                    {/* ⚙️ Interactive Card Syndrome Console (Only visible on Screen 3, slide-over layout) */}
                    {renderGenericConsole(isConsoleOpen3, setIsConsoleOpen3, "MARQUEE CONSOLE (SCREEN 3) / 走马灯控制台 (第3屏)", "Configure sliding noise matrices on Screen 3 (Third Slide)", marqueeCards, saveMarqueeCards, false, screens.find(s => s.id === 3) || screens[0], (updated) => setScreens(prev => prev.map(s => s.id === updated.id ? updated : s)))}

                  </div>
                ) : (
                  <div className={`w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center py-12 ${
                    (s.align === 'center' && s.id !== 9) ? 'text-center' : s.align === 'right' ? 'text-right' : 'text-left'
                  }`}>
                    
                    {/* Left Column Content - Standard Layouts */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.15 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className={`${
                      s.align === 'center' && s.id !== 9
                        ? 'lg:col-span-12 max-w-5xl mx-auto' 
                        : s.align === 'right' 
                          ? 'lg:col-span-7 lg:col-start-6 order-1' 
                          : s.id === 1
                            ? 'lg:col-span-7 order-1 lg:order-1 z-50 relative pointer-events-auto'
                            : 'lg:col-span-7 order-1 lg:order-1'
                    } space-y-6 md:space-y-8`}
                  >
                    
                    {/* Highly polished headline */}
                    <h1 className={`${s.id === 1 ? 'font-mono text-[86px] leading-[61px]' : 'font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl'} font-extrabold tracking-tight leading-none text-white drop-shadow-md`}>
                      {s.title}
                    </h1>

                    {/* Subheading */}
                    {s.subtitle && (
                      <h2 className="font-serif italic text-[18px] text-zinc-300 font-light max-w-4xl tracking-wide drop-shadow-sm whitespace-pre-line">
                        {s.subtitle}
                      </h2>
                    )}

                    {/* Core narrative description paragraph */}
                    {s.description && (
                      <p className={`text-zinc-300 text-sm md:text-base leading-relaxed font-sans font-light max-w-3xl ${
                        (s.align === 'center' && s.id !== 9) ? 'mx-auto' : s.align === 'right' ? 'ml-auto text-right' : 'text-left'
                      }`}>
                        {s.description}
                      </p>
                    )}

                    {/* Render custom integrated interactive widgets depending on the screen index */}
                    
                    {/* Screen 7: Dynamic Operations/Roadmap Milestone timeline steps */}
                    {s.id === 7 && (
                      <div className="pt-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto lg:mx-0">
                          {[
                            { phase: 1, name: "Phase 1: Hybrid Probe", desc: "Evaluate real-time diagnostic stream logic on simple distance 3 surface setups." },
                            { phase: 2, name: "Phase 2: Deep Align", desc: "Introduce temporal recurrent layers to trace complex crosstalk signals." },
                            { phase: 3, name: "Phase 3: Fault Shield", desc: "Achieve logical LER below matching hardware thresholds at scale." },
                            { phase: 4, name: "Phase 4: Full-Engine", desc: "Integrate multi-thousand physical qubit matrices securely." }
                          ].map((milestone) => (
                            <button
                              key={milestone.phase}
                              onClick={() => setActiveTimelinePhase(milestone.phase)}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                activeTimelinePhase === milestone.phase
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md scale-[1.02]'
                                  : 'bg-zinc-900/40 border-zinc-700/60 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800/40'
                              }`}
                            >
                              <div className="text-[10px] uppercase tracking-wider font-bold mb-1 opacity-70">Step 0{milestone.phase}</div>
                              <div className="text-xs font-bold leading-tight line-clamp-1 mb-1">{milestone.name}</div>
                              <p className="text-[10px] leading-snug line-clamp-2 opacity-80 font-sans font-light">{milestone.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Screen 9: Footer Input form & metadata cards */}
                    {s.id === 9 && (
                      <div className="w-full max-w-xl pt-3">
                        {subscribeStatus === 'success' ? (
                          <div className="p-4 bg-emerald-950/40 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs font-medium flex items-center gap-2">
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
                            className="flex items-center gap-2 p-1.5 bg-zinc-900/80 border border-zinc-700 rounded-xl max-w-lg shadow-lg backdrop-blur-md"
                          >
                            <input 
                              type="email" 
                              placeholder="输入您的电子邮箱加入邮件简讯..."
                              value={subscriberMail}
                              onChange={(e) => setSubscriberMail(e.target.value)}
                              className="bg-transparent text-xs text-white placeholder-zinc-500 px-3 py-2.5 focus:outline-none flex-1 font-sans"
                              required
                            />
                            <button 
                              type="submit"
                              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold font-display rounded-lg tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                            >
                              <span>立即订阅</span>
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    {/* Primary Button */}
                    {s.ctaText && (
                      <div className={`flex ${(s.align === 'center' && s.id !== 9) ? 'justify-center' : s.align === 'right' ? 'justify-end' : 'justify-start'} pt-3`}>
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
                      s.align === 'center' && s.id !== 9
                        ? 'hidden' 
                        : s.align === 'right' 
                          ? 'lg:col-span-5 order-2 lg:order-1 z-30' 
                          : s.id === 1 
                            ? 'lg:col-span-5 order-2 lg:order-2 z-40' 
                            : 'lg:col-span-5 order-2 lg:order-2 z-50'
                    } w-full flex justify-center py-4 relative pointer-events-auto`}
                  >
                    
                    {/* Render unique live visualizations on selected sections */}

                    {/* Screen 2: Embed SurfaceCodeDiagram inside the grid */}
                    {s.id === 2 && (
                      <div className="w-full max-w-md scale-[1.02] transition-transform duration-300">
                        <SurfaceCodeDiagram />
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
                        <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-zinc-950/90 to-zinc-900/90 border border-zinc-800 p-3 rounded-xl backdrop-blur-sm z-10">
                          <code className="text-[10px] text-zinc-400 font-mono block">SUITE SYCAMORE ENVIRONMENT</code>
                          <p className="text-xs text-zinc-300 font-sans mt-0.5 leading-normal">Interactive 3D cryostat chandelier executing qubit operations at millivelvin degrees.</p>
                        </div>
                      </div>
                    )}

                    {/* Screen 7: Dynamic selected step text detail inside frame */}
                    {s.id === 7 && (
                      <div className="w-full max-w-md aspect-[4/3] glassmorphism-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                        <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            <span className="text-xs text-zinc-300 font-mono font-bold">MILESTONE SPECIFICATION</span>
                          </div>
                          <span className="text-xs text-zinc-500 font-mono">0{activeTimelinePhase} / 04</span>
                        </div>

                        <div className="py-4 space-y-3">
                          <p className="text-3xl font-display font-black text-amber-400">
                            {activeTimelinePhase === 1 && "Hybrid Calibrations"}
                            {activeTimelinePhase === 2 && "Recurrent Tracking"}
                            {activeTimelinePhase === 3 && "Breaching LER Limits"}
                            {activeTimelinePhase === 4 && "Production Grid"}
                          </p>
                          <blockquote className="text-sm text-zinc-300 font-serif italic border-l-2 border-amber-500 pl-3 py-1 bg-white/5 rounded-r">
                            {activeTimelinePhase === 1 && "\"Deploy experimental decoders directly in alignment with real time hardware fluxes.\""}
                            {activeTimelinePhase === 2 && "\"Translate temporal diagnostic sequences to predict leakage before logical memory flips.\""}
                            {activeTimelinePhase === 3 && "\"Leverage machine learning to establish active control limits below human benchmarks.\""}
                            {activeTimelinePhase === 4 && "\"Enable thousands of coordinated sub-processes securely inside distributed datacenters.\""}
                          </blockquote>
                          <p className="text-xs text-zinc-400 leading-relaxed font-sans font-light">
                            {activeTimelinePhase === 1 && "This phase establishes baseline integration between standard ML networks and live physical processors. We verify input formats & channel security."}
                            {activeTimelinePhase === 2 && "By training neural frameworks on full chronological syndromes, the decoder maps previous noise footprints, predicting subsequent actions. "}
                            {activeTimelinePhase === 3 && "We demonstrate lower error trends at scale. Results published in journals show physical fidelity improvements."}
                            {activeTimelinePhase === 4 && "Final full system. Connecting fault-tolerant clusters to support real-world scientific processing."}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                          <span>SYSTEM ACCESS: RESTRICTED</span>
                          <span>ACTIVE: {activeTimelinePhase * 25}% READY</span>
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
                      <div className="w-full max-w-md glassmorphism-card text-zinc-300 rounded-2xl p-6 space-y-4">
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
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
                  <button 
                    onClick={() => {
                      const nextScreen = screens[idx + 1];
                      if (nextScreen) scrollToScreen(nextScreen.id);
                    }}
                    className="flex flex-col items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors"
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
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 hidden md:flex flex-col gap-3 p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-full backdrop-blur-md shadow-lg">
        {screens.map(s => (
          <button 
            key={s.id}
            onClick={() => scrollToScreen(s.id)}
            className="group relative flex items-center justify-center p-1"
            title={s.label}
          >
            {/* Tooltip trigger name */}
            <span className="absolute right-8 px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-white tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap uppercase">
              {s.label}
            </span>
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              activeId === s.id ? 'bg-amber-400 scale-125 ring-2 ring-amber-500/50' : 'bg-zinc-600 hover:bg-zinc-300'
            }`} />
          </button>
        ))}
      </div>

      {/* Interactive Editor Floating Drawer Control Panel */}
      {false && (
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

                        // If the file is smaller than 1.5MB, convert to base64 so it can store in localStorage
                        if (file.size < 1.5 * 1024 * 1024) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const dataUrl = event.target?.result as string;
                            if (dataUrl) {
                              updateScreenFields({
                                bgType: isVideo ? 'video' : 'image',
                                bgUrl: dataUrl
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        } else {
                          // Larger file: create Object URL and remind user
                          const objectUrl = URL.createObjectURL(file);
                          updateScreenFields({
                            bgType: isVideo ? 'video' : 'image',
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
              <div className="flex gap-4">
                <button 
                  onClick={handleResetToDefault}
                  className="flex items-center gap-1 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Clears local storage and resets configuration to the hardcoded base setup"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>初始化标准模板 (RESET)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Copy JSON Fallback Overlay / 复制代码弹窗 */}
      <AnimatePresence>
        {copyToast && (
          <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
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
          </div>
        )}
      </AnimatePresence>

      {/* Immersive Card Detail Simulation View / 卡片模拟量子详情弹窗 (空页面跳转完美高保真方案) */}
      <AnimatePresence>
        {activeCardDetail && (() => {
          const { glow: colorGlow } = getCardColorAndIcon(activeCardDetail.colorType);
          return (
            <div className="fixed inset-0 bg-zinc-950/85 backdrop-blur-xl z-50 flex items-center justify-center p-4">
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
                  <p className="text-zinc-300 text-sm md:text-base font-sans font-light leading-relaxed max-w-sm mx-auto whitespace-pre-wrap break-words">
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
            </div>
          );
        })()}
      </AnimatePresence>

      <PdfDecoderPage isOpen={isPdfSecondaryPageOpen} onClose={() => setIsPdfSecondaryPageOpen(false)} />

    </div>
  );
};

export default App;
