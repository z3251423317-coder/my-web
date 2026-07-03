
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

export const DEFAULT_MARQUEE_CARDS: MarqueeCard[] = [
  {
    "id": 1782974086095,
    "title": "11",
    "cat": "自定义分析 / Custom",
    "desc": "自定义创建的情感供需分析卡片。",
    "url": "",
    "image": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
    "pdfUrl": "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/1.%E6%AD%A4%E4%B8%BA%E7%94%98%E9%A5%B4%EF%BC%8C%E5%BD%BC%E4%B9%8B%E8%8B%A6%E8%8D%AF%E2%80%94%E2%80%94%E2%80%94%E8%AE%BA%E4%B8%8D%E5%90%88%E9%80%82%E7%9A%84%E8%83%8C%E5%90%8E%E4%BA%B2%E5%AF%86%E5%85%B3%E7%B3%BB%E4%B8%AD%E6%83%85%E6%84%9F%E4%BE%9B%E9%9C%80%E7%9A%84%E7%BB%93%E6%9E%84%E6%80%A7%E5%A4%B1%E8%A1%A1%EF%BC%88WXJB-2663-001%EF%BC%89.pdf",
    "pdfPageImages": [
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200&auto=format&fit=crop"
    ],
    "imbalanceScore": 50,
    "notes": "可编辑深度论文研读笔记或分析心得...",
    "lastUpdated": "2026-07-02 06:34",
    "audioModules": [
      {
        "id": "m1",
        "name": "结构性失衡导论",
        "createdAt": "2026-07-02 10:00",
        "status": "启用",
        "updatedAt": "2026-07-02 10:00",
        "user": "系统管理员",
        "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "duration": "05:20",
        "rating": 5
      },
      {
        "id": "m2",
        "name": "情感供需模型解析",
        "createdAt": "2026-07-02 11:30",
        "status": "启用",
        "updatedAt": "2026-07-02 11:30",
        "user": "系统管理员",
        "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "duration": "08:45",
        "rating": 4
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
    "pdfUrl": "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/1.%E6%AD%A4%E4%B8%BA%E7%94%98%E9%A5%B4%EF%BC%8C%E5%BD%BC%E4%B9%8B%E8%8B%A6%E8%8D%AF%E2%80%94%E2%80%94%E2%80%94%E8%AE%BA%E4%B8%8D%E5%90%88%E9%80%82%E7%9A%84%E8%83%8C%E5%90%8E%E4%BA%B2%E5%AF%86%E5%85%B3%E7%B3%BB%E4%B8%AD%E6%83%85%E6%84%9F%E4%BE%9B%E9%9C%80%E7%9A%84%E7%BB%93%E6%9E%84%E6%80%A7%E5%A4%B1%E8%A1%A1%EF%BC%88WXJB-2663-001%EF%BC%89.pdf",
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
    ]
  }
];
