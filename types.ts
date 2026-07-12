/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BackgroundType = 'image' | 'video' | 'gradient';

export interface ScreenData {
  id: number;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  bgType: BackgroundType;
  bgUrl: string;
  overlayOpacity: number; // 0 to 100
  overlayBlur: number; // in pixels
  tintColor: string; // 'none' | 'slate' | 'indigo' | 'emerald' | 'gold' | 'rose'
  align: 'left' | 'center' | 'right';
  ctaText?: string;
  ctaUrl?: string;
  
  // Mobile background overrides
  bgTypeMobile?: BackgroundType;
  bgUrlMobile?: string;
  bgOpacity?: number; // 0 to 100 for background (video/image/gradient) opacity override
  
  // Temperature and its background
  temperature?: number;
  tempBgUrl?: string;
  tempBgType?: BackgroundType;
  
  // Custom interactive contents depending on the screen sequence
  features?: { title: string; desc: string; icon: string }[];
  metrics?: { value: string; label: string; progress: number }[];
  timeline?: { phase: string; title: string; desc: string; active?: boolean }[];
  gallery?: { title: string; subtitle: string; imageUrl: string }[];
  testimonial?: { quote: string; author: string; role: string; avatarUrl: string };
  logoLoopLogos?: { src: string; alt: string; href?: string }[];
  bgMusicUrl?: string;
  mobileMusicUrl?: string;
  useVideoAudio?: boolean;
}

export interface AudioModule {
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
}

export interface RelationshipCard {
  id: string | number;
  title: string;
  cat: string;
  desc: string;
  imageUrl: string;
  pdfUrl?: string;
  pdfPageImages?: string[];
  imbalanceScore?: number;
  notes?: string;
  lastUpdated?: string;
  audioModules?: AudioModule[];
  colorType?: string;
  isEncrypted?: boolean;
  password?: string;
}
