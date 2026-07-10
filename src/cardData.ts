
export interface SubCard {
  id: string;
  title: string;
  desc?: string;
  image?: string;
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
    desc?: string;
  }[];
}

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
  isLit?: boolean;
  glowEnabled?: boolean;
  glowColor?: string;
  subCards?: SubCard[];
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
    desc?: string;
  }[];
}

export const DEFAULT_QUANTUM_CARDS: MarqueeCard[] = [
  {
    "id": 1,
    "title": "化工厂规划局",
    "cat": "HARDWARE ENGINE",
    "desc": "Automated drift correction module optimizing microwave pulses.",
    "url": "",
    "colorType": "indigo",
    "isEncrypted": true,
    "password": "1111",
    "audioModules": [
      {
        "id": "mod-1783356448860",
        "name": "1111",
        "audioUrl": "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/%E5%BD%95%E9%9F%B3%E6%96%87%E4%BB%B6/%E6%9C%B1%E8%B4%B5%E5%93%B2/26.07.01.mp3",
        "duration": "02:30",
        "rating": 5,
        "status": "启用",
        "createdAt": "2026年7月7日 上午12:47:28",
        "updatedAt": "2026年7月7日 上午12:47:28",
        "user": "管理员"
      }
    ]
  },
  {
    "id": 2,
    "title": "附件一",
    "cat": "METRIC ANALYZIS",
    "desc": "High-density scintillation tracking mapping background radiation.",
    "url": "",
    "colorType": "rose"
  },
  {
    "id": 3,
    "title": "价格库",
    "cat": "OPTIMIZER",
    "desc": "Parallel graph perfect matcher solving threshold parameters.",
    "url": "",
    "colorType": "amber"
  }
];

export const DEFAULT_MARQUEE_CARDS: MarqueeCard[] = [
  {
    "id": 1,
    "title": "化工厂规划局",
    "cat": "HARDWARE ENGINE",
    "desc": "Automated drift correction module optimizing microwave pulses.",
    "url": "",
    "colorType": "indigo",
    "isEncrypted": true,
    "password": "1111",
    "audioModules": [
      {
        "id": "mod-1783356448860",
        "name": "1111",
        "audioUrl": "https://wangzhan-1379786748.cos.ap-beijing.myqcloud.com/%E5%BD%95%E9%9F%B3%E6%96%87%E4%BB%B6/%E6%9C%B1%E8%B4%B5%E5%93%B2/26.07.01.mp3",
        "duration": "02:30",
        "rating": 5,
        "status": "启用",
        "createdAt": "2026年7月7日 上午12:47:28",
        "updatedAt": "2026年7月7日 上午12:47:28",
        "user": "管理员"
      }
    ]
  },
  {
    "id": 2,
    "title": "附件一",
    "cat": "METRIC ANALYZIS",
    "desc": "High-density scintillation tracking mapping background radiation.",
    "url": "",
    "colorType": "rose"
  },
  {
    "id": 3,
    "title": "价格库",
    "cat": "OPTIMIZER",
    "desc": "Parallel graph perfect matcher solving threshold parameters.",
    "url": "",
    "colorType": "amber"
  }
];

export const DEFAULT_DOME_CARDS: MarqueeCard[] = [
  {
    "id": 1,
    "title": "就哭敷一敷",
    "cat": "HARDWARE ENGINE",
    "desc": "Automated drift correction module optimizing microwave pulses.",
    "url": "",
    "colorType": "indigo"
  },
  {
    "id": 2,
    "title": " 明白健不健康",
    "cat": "METRIC ANALYZIS",
    "desc": "High-density scintillation tracking mapping background radiation.",
    "url": "",
    "colorType": "rose"
  }
];

export const DEFAULT_SCREEN7_CARDS: MarqueeCard[] = [
  {
    "id": 1,
    "title": "Roadmap Card 1",
    "cat": "PHASE 1",
    "desc": "Description here.",
    "url": "",
    "colorType": "indigo",
    "isLit": true
  }
];
