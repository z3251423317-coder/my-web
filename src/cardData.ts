
export interface MarqueeCard {
  id: number;
  title: string;
  cat: string;
  desc: string;
  url: string;
  colorType?: string;
  image?: string;
  pdfUrl?: string;
  pdfPageImages?: string[];
  imbalanceScore?: number;
  notes?: string;
  lastUpdated?: string;
  isEncrypted?: boolean;
  password?: string;
  audioModules?: {
    id: string;
    name: string;
    createdAt: string;
    status: '启用' | '禁用';
    updatedAt: string;
    user: string;
    audioUrl: string;
    duration: string;
    rating: number;
  }[];
}

export const DEFAULT_QUANTUM_CARDS: MarqueeCard[] = [
  {
    id: 1,
    title: "2222",
    cat: "HARDWARE ENGINE",
    desc: "Automated drift correction module optimizing microwave pulses.",
    url: "",
    colorType: "indigo",
    isEncrypted: true,
    password: "1111",
    audioModules: [
      {
        id: "mod-1783356448860",
        name: "1111",
        audioUrl: "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/%E5%BD%95%E9%9F%B3%E6%96%87%E4%BB%B6/%E6%9C%B1%E8%B4%B5%E5%93%B2/26.07.01.mp3",
        duration: "02:30",
        rating: 5,
        status: "启用",
        createdAt: "2026年7月7日 上午12:47:28",
        updatedAt: "2026年7月7日 上午12:47:28",
        user: "管理员"
      }
    ]
  },
  {
    id: 2,
    title: "Cosmic Event Tracker",
    cat: "METRIC ANALYZIS",
    desc: "High-density scintillation tracking mapping background radiation.",
    url: "",
    colorType: "rose"
  }
];

export const DEFAULT_MARQUEE_CARDS: MarqueeCard[] = [
  {
    "id": 1782974086095,
    "title": "11",
    "cat": "自定义分析 / Custom",
    "desc": "自定义创建的情感供需分析卡片。",
    "url": "",
    "image": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
    "pdfUrl": "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/1.%E6%AD%A4%E4%B8%BA%E7%94%98%E9%A5%B4%EF%BC%8C%E5%BD%BC%E4%B9%8B%E8%8B%A6%E8%8D%AF%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E8%AE%BA%E4%B8%8D%E5%90%88%E9%80%82%E7%9A%84%E8%83%8C%E5%90%8E%E4%BA%B2%E5%AF%86%E5%85%B3%E7%B3%BB%E4%B8%AD%E6%83%85%E6%84%9F%E4%BE%9B%E9%9C%80%E7%9A%84%E7%BB%93%E6%9E%84%E6%80%A7%E5%A4%B1%E8%A1%A1%EF%BC%88WXJB-2663-001%EF%BC%89.pdf",
    "pdfPageImages": [
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200&auto=format&fit=crop"
    ],
    "imbalanceScore": 50,
    "notes": "可编辑深度论文研读笔记或分析心得...",
    "lastUpdated": "2026-07-02 06:34",
    "audioModules": [
      {
        "id": "mod-1783061786526",
        "name": "11",
        "audioUrl": "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/%E5%BD%95%E9%9F%B3%E6%96%87%E4%BB%B6/%E6%9C%B1%E8%B4%B5%E5%93%B2/26.07.01.mp3",
        "duration": "02:30",
        "rating": 5,
        "status": "启用",
        "createdAt": "2026年7月3日 下午2:56:26",
        "updatedAt": "2026年7月3日 下午2:56:26",
        "user": "管理员"
      }
    ]
  },
  {
    "id": 4,
    "title": "安全感逆差下的零和博弈",
    "cat": "深层代偿机制 / Compensation",
    "desc": "双方试图在对方身上填补童年或过往体验中遗留的匮乏感，最终将本应滋养彼此的避风港扭曲为不断透支能耗的战场。",
    "url": "",
    "image": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=800&auto=format&fit=crop",
    "pdfUrl": "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/1.%E6%AD%A4%E4%B8%BA%E7%94%98%E9%A5%B4%EF%BC%8C%E5%BD%BC%E4%B9%8B%E8%8B%A6%E8%8D%AF%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E8%AE%BA%E4%B8%8D%E5%90%88%E9%80%82%E7%9A%84%E8%83%8C%E5%90%8E%E4%BA%B2%E5%AF%86%E5%85%B3%E7%B3%BB%E4%B8%AD%E6%83%85%E6%84%9F%E4%BE%9B%E9%9C%80%E7%9A%84%E7%BB%93%E6%9E%84%E6%80%A7%E5%A4%B1%E8%A1%A1%EF%BC%88WXJB-2663-001%EF%BC%89.pdf",
    "pdfPageImages": [
      "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200&auto=format&fit=crop"
    ],
    "imbalanceScore": 82,
    "notes": "为了满足自我安全感，过度迎合或冷酷防御都是代偿行为。唯有认清结构失衡，才能从博弈走向成熟和解。本章深度剖析代偿心理解析。",
    "lastUpdated": "2026-07-01 10:45",
    "audioModules": [
      {
        "id": "m3",
        "name": "代偿机制深度调研",
        "createdAt": "2026-07-01 09:00",
        "status": "启用",
        "updatedAt": "2026-07-01 09:00",
        "user": "系统管理员",
        "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        "duration": "12:15",
        "rating": 5
      },
      {
        "id": "m4",
        "name": "避风港向战场的演变",
        "createdAt": "2026-07-01 10:30",
        "status": "启用",
        "updatedAt": "2026-07-01 10:30",
        "user": "系统管理员",
        "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        "duration": "07:30",
        "rating": 3
      }
    ],
    "isEncrypted": true,
    "password": "1111"
  },
  {
    "id": 1783354202244,
    "title": "2.基于日常吵架原因与深度聊天之间的几种可能性研究（WXJB-2668-002）",
    "cat": "自定义分析 / Custom",
    "desc": "自定义创建的情感供需分析卡片。",
    "url": "",
    "image": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
    "pdfUrl": "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/%E6%9E%84%E7%9F%B3%E6%96%87%E6%A1%A3/2.%E5%9F%BA%E4%BA%8E%E6%97%A5%E5%B8%B8%E5%90%B5%E6%9E%B6%E5%8E%9F%E5%9B%A0%E4%B8%8E%E6%B7%B1%E5%BA%A6%E8%81%8A%E5%A4%A9%E4%B9%8B%E9%97%B4%E7%9A%84%E5%87%A0%E7%A7%8D%E5%8F%AF%E8%83%BD%E6%80%A7%E7%A0%94%E7%A9%B6%EF%BC%88WXJB-2668-002%EF%BC%89.docx",
    "pdfPageImages": [
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200&auto=format&fit=crop"
    ],
    "imbalanceScore": 50,
    "notes": "可编辑深度论文研读笔记或分析心得...",
    "lastUpdated": "2026-07-06 16:10"
  },
  {
    "id": 1783354155744,
    "title": "1.此为甘饴，彼之苦药——论不合适的背后亲密关系中情感供需的结构性失衡（WXJB-2663-001）",
    "cat": "自定义分析 / Custom",
    "desc": "自定义创建的情感供需分析卡片。",
    "url": "",
    "image": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
    "pdfUrl": "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/%E6%9E%84%E7%9F%B3%E6%96%87%E6%A1%A3/1.%E6%AD%A4%E4%B8%BA%E7%94%98%E9%A5%B4%EF%BC%8C%E5%BD%BC%E4%B9%8B%E8%8B%A6%E8%8D%AF%E2%80%94%E2%80%94%E8%AE%BA%E4%B8%8D%E5%90%88%E9%80%82%E7%9A%84%E8%83%8C%E5%90%8E%E4%BA%B2%E5%AF%86%E5%85%B3%E7%B3%BB%E4%B8%AD%E6%83%85%E6%84%9F%E4%BE%9B%E9%9C%80%E7%9A%84%E7%BB%93%E6%9E%84%E6%80%A7%E5%A4%B1%E8%A1%A1%EF%BC%88WXJB-2663-001%EF%BC%89.pdf",
    "pdfPageImages": [
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200&auto=format&fit=crop"
    ],
    "imbalanceScore": 50,
    "notes": "可编辑深度论文研读笔记或分析心得...",
    "lastUpdated": "2026-07-06 16:09"
  }
];
