import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';
import './DomeGallery.css';

interface ImageItem {
  src: string;
  alt?: string;
  title?: string;
  desc?: string;
}

interface Coords {
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
}

interface BuiltItem extends Coords {
  src: string;
  alt: string;
  title?: string;
  desc?: string;
}

const DEFAULT_IMAGES: ImageItem[] = [
  {
    src: 'https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Abstract art'
  },
  {
    src: 'https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=772&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Modern sculpture'
  },
  {
    src: 'https://images.unsplash.com/photo-1755497595318-7e5e3523854f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Digital artwork'
  },
  {
    src: 'https://images.unsplash.com/photo-1755353985163-c2a0fe5ac3d8?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Contemporary art'
  },
  {
    src: 'https://images.unsplash.com/photo-1745965976680-d00be7dc0377?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Geometric pattern'
  },
  {
    src: 'https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Textured surface'
  },
  { src: 'https://pbs.twimg.com/media/Gyla7NnXMAAXSo_?format=jpg&name=large', alt: 'Social media image' }
];

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35
};

const clamp = (v: number, min: number, max: number): number => Math.min(Math.max(v, min), max);
const normalizeAngle = (d: number): number => ((d % 360) + 360) % 360;
const wrapAngleSigned = (deg: number): number => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
const getDataNumber = (el: HTMLElement, name: string, fallback: number): number => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool: (string | ImageItem)[], seg: number): BuiltItem[] {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const totalSlots = coords.length;
  if (pool.length === 0) {
    return coords.map(c => ({ ...c, src: '', alt: '' }));
  }
  if (pool.length > totalSlots) {
    console.warn(
      `[DomeGallery] Provided image count (${pool.length}) exceeds available tiles (${totalSlots}). Some images will not be shown.`
    );
  }

  const normalizedImages = pool.map(image => {
    if (typeof image === 'string') {
      return { src: image, alt: '', title: '', desc: '' };
    }
    return { 
      src: image.src || '', 
      alt: image.alt || '', 
      title: image.title || '', 
      desc: image.desc || '' 
    };
  });

  const usedImages = Array.from({ length: totalSlots }, (_, i) => normalizedImages[i % normalizedImages.length]);

  for (let i = 1; i < usedImages.length; i++) {
    if (usedImages[i].src === usedImages[i - 1].src) {
      for (let j = i + 1; j < usedImages.length; j++) {
        if (usedImages[j].src !== usedImages[i].src) {
          const tmp = usedImages[i];
          usedImages[i] = usedImages[j];
          usedImages[j] = tmp;
          break;
        }
      }
    }
  }

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt || '',
    title: usedImages[i].title || '',
    desc: usedImages[i].desc || ''
  }));
}

function computeItemBaseRotation(offsetX: number, offsetY: number, sizeX: number, sizeY: number, segments: number) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

interface DomeGalleryProps {
  images?: (string | ImageItem)[];
  fit?: number;
  fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height';
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  enlargeTransitionMs?: number;
  segments?: number;
  dragDampening?: number;
  openedImageWidth?: string;
  openedImageHeight?: string;
  imageBorderRadius?: string;
  openedImageBorderRadius?: string;
  grayscale?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  active?: boolean;
}

export default function DomeGallery({
  images = DEFAULT_IMAGES,
  fit = 0.5,
  fitBasis = 'auto',
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  overlayBlurColor = '#120F17',
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  openedImageWidth = '250px',
  openedImageHeight = '350px',
  imageBorderRadius = '30px',
  openedImageBorderRadius = '30px',
  grayscale = true,
  autoRotate = true,
  autoRotateSpeed = 0.15,
  active = true
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const focusedElRef = useRef<HTMLElement | null>(null);
  const originalTilePositionRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef<number | null>(null);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const lastDragEndAt = useRef(0);

  const longPressTimerRef = useRef<any>(null);
  const isLongPressedRef = useRef<boolean>(false);
  const hasSwipedRef = useRef<boolean>(false);
  const preventTileClickRef = useRef<boolean>(false);

  const scrollLockedRef = useRef(false);
  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add('dg-scroll-lock');
  }, []);
  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute('data-enlarging') === 'true') return;
    scrollLockedRef.current = false;
    document.body.classList.remove('dg-scroll-lock');
  }, []);

  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  const applyTransform = (xDeg: number, yDeg: number) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  };

  const lockedRadiusRef = useRef<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width),
        h = Math.max(1, cr.height);
      const minDim = Math.min(w, h),
        maxDim = Math.max(w, h),
        aspect = w / h;
      let basis: number;
      switch (fitBasis) {
        case 'min':
          basis = minDim;
          break;
        case 'max':
          basis = maxDim;
          break;
        case 'width':
          basis = w;
          break;
        case 'height':
          basis = h;
          break;
        default:
          basis = aspect >= 1.3 ? w : minDim;
      }
      let radius = basis * fit;
      const heightGuard = h * 1.35;
      radius = Math.min(radius, heightGuard);
      radius = clamp(radius, minRadius, maxRadius);
      lockedRadiusRef.current = Math.round(radius);

      const viewerPad = Math.max(8, Math.round(minDim * padFactor));
      root.style.setProperty('--radius', `${lockedRadiusRef.current}px`);
      root.style.setProperty('--viewer-pad', `${viewerPad}px`);
      root.style.setProperty('--overlay-blur-color', overlayBlurColor);
      root.style.setProperty('--tile-radius', imageBorderRadius);
      root.style.setProperty('--enlarge-radius', openedImageBorderRadius);
      root.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');
      applyTransform(rotationRef.current.x, rotationRef.current.y);

      const enlargedOverlay = viewerRef.current?.querySelector('.enlarge') as HTMLElement | null;
      if (enlargedOverlay && frameRef.current && mainRef.current) {
        const frameR = frameRef.current.getBoundingClientRect();
        const mainR = mainRef.current.getBoundingClientRect();

        const hasCustomSize = openedImageWidth && openedImageHeight;
        if (hasCustomSize) {
          const tempDiv = document.createElement('div');
          tempDiv.style.cssText = `position: absolute; width: ${openedImageWidth}; height: ${openedImageHeight}; visibility: hidden;`;
          document.body.appendChild(tempDiv);
          const tempRect = tempDiv.getBoundingClientRect();
          document.body.removeChild(tempDiv);

          const centeredLeft = frameR.left - mainR.left + (frameR.width - tempRect.width) / 2;
          const centeredTop = frameR.top - mainR.top + (frameR.height - tempRect.height) / 2;

          enlargedOverlay.style.left = `${centeredLeft}px`;
          enlargedOverlay.style.top = `${centeredTop}px`;
        } else {
          enlargedOverlay.style.left = `${frameR.left - mainR.left}px`;
          enlargedOverlay.style.top = `${frameR.top - mainR.top}px`;
          enlargedOverlay.style.width = `${frameR.width}px`;
          enlargedOverlay.style.height = `${frameR.height}px`;
        }
      }
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [
    fit,
    fitBasis,
    minRadius,
    maxRadius,
    padFactor,
    overlayBlurColor,
    grayscale,
    imageBorderRadius,
    openedImageBorderRadius,
    openedImageWidth,
    openedImageHeight
  ]);

  useEffect(() => {
    applyTransform(rotationRef.current.x, rotationRef.current.y);
  }, []);

  useEffect(() => {
    if (!autoRotate || !active) return;
    let autoRotateRAF: number | null = null;
    
    const tick = () => {
      if (!draggingRef.current && !focusedElRef.current && !openingRef.current && !inertiaRAF.current) {
        const nextY = wrapAngleSigned(rotationRef.current.y + autoRotateSpeed);
        rotationRef.current = { ...rotationRef.current, y: nextY };
        applyTransform(rotationRef.current.x, rotationRef.current.y);
      }
      autoRotateRAF = requestAnimationFrame(tick);
    };
    
    autoRotateRAF = requestAnimationFrame(tick);
    return () => {
      if (autoRotateRAF) cancelAnimationFrame(autoRotateRAF);
    };
  }, [autoRotate, autoRotateSpeed, active]);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  const startInertia = useCallback(
    (vx: number, vy: number) => {
      const MAX_V = 1.4;
      let vX = clamp(vx, -MAX_V, MAX_V) * 80;
      let vY = clamp(vy, -MAX_V, MAX_V) * 80;
      let frames = 0;
      const d = clamp(dragDampening ?? 0.6, 0, 1);
      const frictionMul = 0.94 + 0.055 * d;
      const stopThreshold = 0.015 - 0.01 * d;
      const maxFrames = Math.round(90 + 270 * d);
      const step = () => {
        vX *= frictionMul;
        vY *= frictionMul;
        if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
          inertiaRAF.current = null;
          return;
        }
        if (++frames > maxFrames) {
          inertiaRAF.current = null;
          return;
        }
        const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
        const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
        inertiaRAF.current = requestAnimationFrame(step);
      };
      stopInertia();
      inertiaRAF.current = requestAnimationFrame(step);
    },
    [dragDampening, maxVerticalRotationDeg, stopInertia]
  );

  useGesture(
    {
      onDragStart: ({ event }) => {
        if (focusedElRef.current) return;
        stopInertia();
        const evt = event as any;
        draggingRef.current = true;
        movedRef.current = false;
        startRotRef.current = { ...rotationRef.current };
        startPosRef.current = { x: evt.clientX, y: evt.clientY };

        isLongPressedRef.current = false;
        hasSwipedRef.current = false;
        preventTileClickRef.current = false;

        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = setTimeout(() => {
          isLongPressedRef.current = true;
          if (mainRef.current) {
            mainRef.current.style.cursor = 'grabbing';
          }
        }, 10);
      },
      onDrag: ({ event, last, velocity = [0, 0], direction = [0, 0], movement }) => {
        if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;
        const evt = event as any;
        const dxTotal = evt.clientX - startPosRef.current.x;
        const dyTotal = evt.clientY - startPosRef.current.y;

        const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
        if (dist2 > 64) {
          preventTileClickRef.current = true;
        }

        if (!isLongPressedRef.current) {
          if (dist2 > 100) { // dist > 10px (dist2 > 100)
            if (longPressTimerRef.current) {
              clearTimeout(longPressTimerRef.current);
              longPressTimerRef.current = null;
            }
            if (!hasSwipedRef.current) {
              const absY = Math.abs(dyTotal);
              const absX = Math.abs(dxTotal);
              if (absY > absX * 1.3 && absY > 45) {
                hasSwipedRef.current = true;
                preventTileClickRef.current = true;
                const scrollFunc = (window as any).alphaQubitScrollToScreen;
                if (scrollFunc) {
                  if (dyTotal < -45) {
                    scrollFunc(6); // swipe UP -> screen 6
                  } else if (dyTotal > 45) {
                    scrollFunc(4); // swipe DOWN -> screen 4
                  }
                }
                draggingRef.current = false;
                movedRef.current = false;
                
                // Clear preventTileClickRef after a short delay so trailing clicks/pointerups are fully swallowed
                setTimeout(() => {
                  preventTileClickRef.current = false;
                }, 350);
                return;
              }
            }
          }
        }

        if (isLongPressedRef.current) {
          if (!movedRef.current) {
            if (dist2 > 16) movedRef.current = true;
          }
          const nextX = clamp(
            startRotRef.current.x - dyTotal / dragSensitivity,
            -maxVerticalRotationDeg,
            maxVerticalRotationDeg
          );
          const nextY = wrapAngleSigned(startRotRef.current.y + dxTotal / dragSensitivity);
          if (rotationRef.current.x !== nextX || rotationRef.current.y !== nextY) {
            rotationRef.current = { x: nextX, y: nextY };
            applyTransform(nextX, nextY);
          }
        }

        if (last) {
          if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
          }
          
          const wasLongPressed = isLongPressedRef.current;
          isLongPressedRef.current = false;
          if (mainRef.current) {
            mainRef.current.style.cursor = 'grab';
          }
          
          draggingRef.current = false;
          
          if (wasLongPressed) {
            let [vMagX, vMagY] = velocity;
            const [dirX, dirY] = direction;
            let vx = vMagX * dirX;
            let vy = vMagY * dirY;
            if (Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) {
              const [mx, my] = movement;
              vx = clamp((mx / dragSensitivity) * 0.02, -1.2, 1.2);
              vy = clamp((my / dragSensitivity) * 0.02, -1.2, 1.2);
            }
            if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) startInertia(vx, vy);
            if (movedRef.current) lastDragEndAt.current = performance.now();
          }

          // Clear preventTileClickRef after a short delay so trailing clicks/pointerups are fully swallowed
          setTimeout(() => {
            preventTileClickRef.current = false;
          }, 150);

          movedRef.current = false;
        }
      }
    },
    { target: mainRef as any, eventOptions: { passive: true } }
  );

  useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return;
    const close = () => {
      if (performance.now() - openStartedAtRef.current < 250) return;
      const el = focusedElRef.current;
      if (!el) return;
      const parent = el.parentElement;
      if (!parent) return;
      const overlay = viewerRef.current?.querySelector('.enlarge') as HTMLElement | null;
      if (!overlay) return;

      const textToggleBtn = viewerRef.current?.querySelector('.dg-text-toggle-btn') as HTMLElement | null;
      if (textToggleBtn) textToggleBtn.remove();
      const refDiv = parent.querySelector('.item__image--reference') as HTMLElement | null;
      const originalPos = originalTilePositionRef.current;
      if (!originalPos || !rootRef.current) {
        overlay.remove();
        if (refDiv) refDiv.remove();
        parent.style.setProperty('--rot-y-delta', '0deg');
        parent.style.setProperty('--rot-x-delta', '0deg');
        el.style.visibility = '';
        el.style.zIndex = '0';
        focusedElRef.current = null;
        rootRef.current?.removeAttribute('data-enlarging');
        openingRef.current = false;
        unlockScroll();
        return;
      }
      const currentRect = overlay.getBoundingClientRect();
      const rootRect = rootRef.current.getBoundingClientRect();
      const originalPosRelativeToRoot = {
        left: originalPos.left - rootRect.left,
        top: originalPos.top - rootRect.top,
        width: originalPos.width,
        height: originalPos.height
      };
      const overlayRelativeToRoot = {
        left: currentRect.left - rootRect.left,
        top: currentRect.top - rootRect.top,
        width: currentRect.width,
        height: currentRect.height
      };
      const animatingOverlay = document.createElement('div');
      animatingOverlay.className = 'enlarge-closing';
      animatingOverlay.style.cssText = `position:absolute;left:${overlayRelativeToRoot.left}px;top:${overlayRelativeToRoot.top}px;width:${overlayRelativeToRoot.width}px;height:${overlayRelativeToRoot.height}px;z-index:9999;border-radius: var(--enlarge-radius, 32px);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${enlargeTransitionMs}ms ease-out;pointer-events:none;margin:0;transform:none;`;
      const originalImg = overlay.querySelector('img');
      if (originalImg) {
        const img = originalImg.cloneNode() as HTMLImageElement;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        animatingOverlay.appendChild(img);
      }
      overlay.remove();
      rootRef.current.appendChild(animatingOverlay);
      void animatingOverlay.getBoundingClientRect();
      requestAnimationFrame(() => {
        animatingOverlay.style.left = originalPosRelativeToRoot.left + 'px';
        animatingOverlay.style.top = originalPosRelativeToRoot.top + 'px';
        animatingOverlay.style.width = originalPosRelativeToRoot.width + 'px';
        animatingOverlay.style.height = originalPosRelativeToRoot.height + 'px';
        animatingOverlay.style.opacity = '0';
      });
      const cleanup = () => {
        animatingOverlay.remove();
        originalTilePositionRef.current = null;
        if (refDiv) refDiv.remove();
        parent.style.transition = 'none';
        el.style.transition = 'none';
        parent.style.setProperty('--rot-y-delta', '0deg');
        parent.style.setProperty('--rot-x-delta', '0deg');
        requestAnimationFrame(() => {
          el.style.visibility = '';
          el.style.opacity = '0';
          el.style.zIndex = '0';
          focusedElRef.current = null;
          rootRef.current?.removeAttribute('data-enlarging');
          requestAnimationFrame(() => {
            parent.style.transition = '';
            el.style.transition = 'opacity 300ms ease-out';
            requestAnimationFrame(() => {
              el.style.opacity = '1';
              setTimeout(() => {
                el.style.transition = '';
                el.style.opacity = '';
                openingRef.current = false;
                if (!draggingRef.current && rootRef.current?.getAttribute('data-enlarging') !== 'true')
                  document.body.classList.remove('dg-scroll-lock');
              }, 300);
            });
          });
        });
      };
      animatingOverlay.addEventListener('transitionend', cleanup, { once: true });
    };
    scrim.addEventListener('click', close);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      scrim.removeEventListener('click', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [enlargeTransitionMs, unlockScroll]);

  const openItemFromElement = useCallback(
    (el: HTMLElement) => {
      if (openingRef.current) return;
      openingRef.current = true;
      openStartedAtRef.current = performance.now();
      lockScroll();
      const parent = el.parentElement;
      if (!parent) return;
      focusedElRef.current = el;
      el.setAttribute('data-focused', 'true');
      const offsetX = getDataNumber(parent, 'offsetX', 0);
      const offsetY = getDataNumber(parent, 'offsetY', 0);
      const sizeX = getDataNumber(parent, 'sizeX', 2);
      const sizeY = getDataNumber(parent, 'sizeY', 2);
      const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
      const parentY = normalizeAngle(parentRot.rotateY);
      const globalY = normalizeAngle(rotationRef.current.y);
      let rotY = -(parentY + globalY) % 360;
      if (rotY < -180) rotY += 360;
      const rotX = -parentRot.rotateX - rotationRef.current.x;
      parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
      parent.style.setProperty('--rot-x-delta', `${rotX}deg`);
      const refDiv = document.createElement('div');
      refDiv.className = 'item__image item__image--reference';
      refDiv.style.opacity = '0';
      refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
      parent.appendChild(refDiv);

      void refDiv.offsetHeight;

      const tileR = refDiv.getBoundingClientRect();
      const mainR = mainRef.current?.getBoundingClientRect();
      const frameR = frameRef.current?.getBoundingClientRect();

      if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0 || !viewerRef.current) {
        openingRef.current = false;
        focusedElRef.current = null;
        parent.removeChild(refDiv);
        unlockScroll();
        return;
      }

      originalTilePositionRef.current = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
      el.style.visibility = 'hidden';
      el.style.zIndex = '0';

      const originalImgEl = el.querySelector('img');
      let ar = 1;
      if (originalImgEl && originalImgEl.naturalWidth && originalImgEl.naturalHeight) {
        ar = originalImgEl.naturalWidth / originalImgEl.naturalHeight;
      }
      if (ar <= 0 || isNaN(ar)) {
        ar = 1;
      }

      // Calculate safe fit bounding box inside the main viewport with 72px padding
      const padding = 72;
      const maxW = mainR.width - padding * 2;
      const maxH = mainR.height - padding * 2;
      
      let targetW = maxW;
      let targetH = maxW / ar;
      if (targetH > maxH) {
        targetH = maxH;
        targetW = maxH * ar;
      }
      
      const targetLeft = (mainR.width - targetW) / 2;
      const targetTop = (mainR.height - targetH) / 2;

      const overlay = document.createElement('div');
      overlay.className = 'enlarge';
      overlay.style.position = 'absolute';
      overlay.style.left = targetLeft + 'px';
      overlay.style.top = targetTop + 'px';
      overlay.style.width = targetW + 'px';
      overlay.style.height = targetH + 'px';
      overlay.style.opacity = '0';
      overlay.style.zIndex = '30';
      overlay.style.willChange = 'transform, opacity';
      overlay.style.transformOrigin = 'top left';
      overlay.style.transition = `transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease`;
      overlay.style.cursor = 'pointer';
      overlay.style.pointerEvents = 'auto';

      const rawSrc = parent.dataset.src || el.querySelector('img')?.src || '';
      const rawTitle = parent.dataset.title || '';
      const rawDesc = parent.dataset.desc || '';

      const img = document.createElement('img');
      img.src = rawSrc;
      overlay.appendChild(img);

      // Create a premium, customizable black mask overlay that shows title/desc on click
      const mask = document.createElement('div');
      mask.className = 'image-dark-mask';
      mask.style.cssText = 'position:absolute;inset:0;background-color:rgba(0,0,0,0.72);opacity:0;transition:opacity 350ms cubic-bezier(0.4, 0, 0.2, 1);pointer-events:none;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;backdrop-filter:blur(3px);border-radius:inherit;';
      
      const textContainer = document.createElement('div');
      textContainer.className = 'max-w-md w-full flex flex-col items-center overflow-y-auto pr-1.5 select-text scrollbar-thin';
      textContainer.style.maxHeight = '85%';
      textContainer.style.scrollbarWidth = 'thin';
      textContainer.style.scrollbarColor = 'rgba(245, 158, 11, 0.4) transparent';
      textContainer.addEventListener('click', (e) => {
        // Prevent clicks on text and scrollbars from closing the overlay
        e.stopPropagation();
      });
      
      const titleEl = document.createElement('h3');
      titleEl.className = 'text-white text-lg md:text-2xl font-bold tracking-tight mb-2 opacity-0 transform translate-y-3 transition-all duration-350 ease-out';
      titleEl.innerText = rawTitle || '无标题';
      titleEl.style.fontFamily = 'Inter, system-ui, sans-serif';
      titleEl.style.textShadow = '0 2px 10px rgba(0,0,0,0.8)';
      
      const descEl = document.createElement('p');
      descEl.className = 'text-zinc-300 text-xs md:text-sm leading-relaxed opacity-0 transform translate-y-3 transition-all duration-350 ease-out whitespace-pre-wrap';
      descEl.innerText = rawDesc || '未配置描述文字';
      descEl.style.fontFamily = 'Inter, system-ui, sans-serif';
      descEl.style.textShadow = '0 1px 4px rgba(0,0,0,0.8)';
      
      textContainer.appendChild(titleEl);
      textContainer.appendChild(descEl);
      mask.appendChild(textContainer);
      overlay.appendChild(mask);

      // Create a high-tech floating toggle button for mobile/desktop cues
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'dg-text-toggle-btn absolute z-[35] px-3 py-1.5 bg-zinc-950/70 hover:bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 text-zinc-400 hover:text-amber-400 text-[11px] font-medium rounded-full shadow-md transition-all duration-350 cursor-pointer flex items-center gap-1.5 backdrop-blur-md hover:scale-105 active:scale-95';
      toggleBtn.style.fontFamily = 'Inter, system-ui, sans-serif';
      toggleBtn.style.left = `calc(${targetLeft}px + ${targetW / 2}px)`;
      toggleBtn.style.top = `calc(${targetTop}px + ${targetH}px + 12px)`;
      toggleBtn.style.transform = 'translateX(-50%)';
      toggleBtn.style.pointerEvents = 'auto';
      toggleBtn.style.opacity = '0';
      toggleBtn.style.transition = 'opacity 350ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms ease, background-color 200ms ease, border-color 200ms ease, color 200ms ease';
      toggleBtn.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        <span>显示文字 (Show Notes)</span>
      `;
      viewerRef.current.appendChild(toggleBtn);

      let maskVisible = false;
      const updateMaskState = () => {
        if (maskVisible) {
          mask.style.opacity = '1';
          mask.style.pointerEvents = 'auto';
          titleEl.style.opacity = '1';
          titleEl.style.transform = 'translateY(0)';
          descEl.style.opacity = '1';
          descEl.style.transform = 'translateY(0)';
          // Reset text to the very top upon entering
          textContainer.scrollTop = 0;
          toggleBtn.innerHTML = `
            <span class="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
            <span>隐藏文字 (Hide Notes)</span>
          `;
          toggleBtn.className = 'dg-text-toggle-btn absolute z-[35] px-3 py-1.5 bg-zinc-950/85 hover:bg-zinc-900 border border-amber-500/30 text-amber-400 text-[11px] font-medium rounded-full shadow-md transition-all duration-350 cursor-pointer flex items-center gap-1.5 backdrop-blur-md hover:scale-105 active:scale-95';
        } else {
          mask.style.opacity = '0';
          mask.style.pointerEvents = 'none';
          titleEl.style.opacity = '0';
          titleEl.style.transform = 'translateY(12px)';
          descEl.style.opacity = '0';
          descEl.style.transform = 'translateY(12px)';
          toggleBtn.innerHTML = `
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>显示文字 (Show Notes)</span>
          `;
          toggleBtn.className = 'dg-text-toggle-btn absolute z-[35] px-3 py-1.5 bg-zinc-950/70 hover:bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 text-zinc-400 hover:text-amber-400 text-[11px] font-medium rounded-full shadow-md transition-all duration-350 cursor-pointer flex items-center gap-1.5 backdrop-blur-md hover:scale-105 active:scale-95';
        }
      };

      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        maskVisible = !maskVisible;
        updateMaskState();
      });

      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        maskVisible = !maskVisible;
        updateMaskState();
      });

      viewerRef.current.appendChild(overlay);

      const tileLeftInMain = tileR.left - mainR.left;
      const tileTopInMain = tileR.top - mainR.top;
      const tx0 = tileLeftInMain - targetLeft;
      const ty0 = tileTopInMain - targetTop;
      const sx0 = tileR.width / targetW;
      const sy0 = tileR.height / targetH;

      const validSx0 = isFinite(sx0) && sx0 > 0 ? sx0 : 1;
      const validSy0 = isFinite(sy0) && sy0 > 0 ? sy0 : 1;

      overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${validSx0}, ${validSy0})`;

      setTimeout(() => {
        if (!overlay.parentElement) return;
        overlay.style.opacity = '1';
        overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
        rootRef.current?.setAttribute('data-enlarging', 'true');
        
        // Beautiful fade in of the toggle button once zoom transitions begin
        setTimeout(() => {
          if (toggleBtn.parentElement) {
            toggleBtn.style.opacity = '1';
          }
        }, 150);
      }, 16);
    },
    [enlargeTransitionMs, lockScroll, segments, unlockScroll]
  );

  const onTileClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (preventTileClickRef.current) return;
      if (draggingRef.current) return;
      if (movedRef.current) return;
      if (performance.now() - lastDragEndAt.current < 80) return;
      if (openingRef.current) return;
      openItemFromElement(e.currentTarget as HTMLElement);
    },
    [openItemFromElement]
  );

  const onTilePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== 'touch') return;
      if (preventTileClickRef.current) return;
      if (draggingRef.current) return;
      if (movedRef.current) return;
      if (performance.now() - lastDragEndAt.current < 80) return;
      if (openingRef.current) return;
      openItemFromElement(e.currentTarget as HTMLElement);
    },
    [openItemFromElement]
  );

  const lastWheelTimeRef = useRef(0);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const handleWheel = (e: WheelEvent) => {
      if (document.body.classList.contains('dg-scroll-lock')) return;
      const now = Date.now();
      if (now - lastWheelTimeRef.current < 1000) return;

      const scrollFunc = (window as any).alphaQubitScrollToScreen;
      if (!scrollFunc) return;

      if (e.deltaY > 15) { // scroll down -> next screen (6)
        lastWheelTimeRef.current = now;
        scrollFunc(6);
      } else if (e.deltaY < -15) { // scroll up -> previous screen (4)
        lastWheelTimeRef.current = now;
        scrollFunc(4);
      }
    };

    main.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      main.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    return () => {
      document.body.classList.remove('dg-scroll-lock');
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="sphere-root"
      style={{
        ['--segments-x' as any]: segments,
        ['--segments-y' as any]: segments,
        ['--overlay-blur-color' as any]: overlayBlurColor,
        ['--tile-radius' as any]: imageBorderRadius,
        ['--enlarge-radius' as any]: openedImageBorderRadius,
        ['--image-filter' as any]: grayscale ? 'grayscale(1)' : 'none'
      }}
    >
      <main ref={mainRef} className="sphere-main" style={{ cursor: 'grab' }}>
        <div className="absolute top-28 md:top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-[10px] md:text-xs font-mono tracking-widest text-zinc-500/80 bg-zinc-950/40 px-3 py-1.5 rounded-full border border-zinc-900/40 backdrop-blur-sm select-none whitespace-nowrap">
          上下滑动切换页面 / 长按并拖拽旋转球体
        </div>

        <div className="stage">
          <div ref={sphereRef} className="sphere">
            {items.map((it, i) => (
              <div
                key={`${it.x},${it.y},${i}`}
                className="item"
                data-src={it.src}
                data-title={it.title || ''}
                data-desc={it.desc || ''}
                data-offset-x={it.x}
                data-offset-y={it.y}
                data-size-x={it.sizeX}
                data-size-y={it.sizeY}
                style={{
                  ['--offset-x' as any]: it.x,
                  ['--offset-y' as any]: it.y,
                  ['--item-size-x' as any]: it.sizeX,
                  ['--item-size-y' as any]: it.sizeY
                }}
              >
                <div
                  className="item__image"
                  role="button"
                  tabIndex={0}
                  aria-label={it.alt || 'Open image'}
                  onClick={onTileClick}
                  onPointerUp={onTilePointerUp}
                >
                  <img src={it.src} draggable={false} alt={it.alt} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overlay" />
        <div className="overlay overlay--blur" />
        <div className="edge-fade" style={{ top: 0, transform: 'rotate(180deg)' }} />
        <div className="edge-fade" style={{ bottom: 0 }} />

        <div className="viewer" ref={viewerRef}>
          <div ref={scrimRef} className="scrim" />
          <div ref={frameRef} className="frame" />
        </div>
      </main>
    </div>
  );
}
