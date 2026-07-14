import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface MusicPlayerProps {
  musicUrl?: string;
  mobileMusicUrl?: string;
  isMobile?: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  isGuidePlaying?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  musicUrl, 
  mobileMusicUrl, 
  isMobile,
  isMuted,
  onToggleMute,
  isGuidePlaying = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const activeMusicUrl = (isMobile && mobileMusicUrl) ? mobileMusicUrl : musicUrl;

  useEffect(() => {
    if (audioRef.current) {
      if (activeMusicUrl) {
        audioRef.current.src = activeMusicUrl;
        audioRef.current.load();
        
        // Setup initial volume / mute state
        if (isMuted || isGuidePlaying) {
          audioRef.current.muted = true;
          audioRef.current.volume = 0;
        } else {
          audioRef.current.muted = false;
          audioRef.current.volume = 1;
        }

        audioRef.current.play().catch(e => console.log('Autoplay blocked', e));
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [activeMusicUrl]);

  // Sync muted and volume states dynamically with smooth fade transition
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.muted = true;
      audio.volume = 0;
      return;
    }

    // Control volume fade based on isGuidePlaying
    let intervalId: any;
    const startVolume = audio.volume;
    const targetVolume = isGuidePlaying ? 0 : 1;

    if (targetVolume > 0 && audio.muted) {
      audio.muted = false;
    }

    const duration = 1200; // 1.2 seconds for smooth fade
    const steps = 24;
    const stepTime = duration / steps;
    const volumeStep = (targetVolume - startVolume) / steps;
    let currentStep = 0;

    intervalId = setInterval(() => {
      currentStep++;
      const nextVolume = Math.min(1, Math.max(0, startVolume + volumeStep * currentStep));
      audio.volume = nextVolume;

      if (nextVolume === 0 && isGuidePlaying) {
        audio.muted = true;
      }

      if (currentStep >= steps) {
        audio.volume = targetVolume;
        if (targetVolume === 0) {
          audio.muted = true;
        }
        clearInterval(intervalId);
      }
    }, stepTime);

    return () => {
      clearInterval(intervalId);
    };
  }, [isMuted, isGuidePlaying]);

  return (
    <div className="fixed top-20 right-4 mt-[-20px] mr-[10px] z-[1000] flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleMute}
        className="p-1.5 bg-zinc-900/50 backdrop-blur-md rounded-full border border-zinc-700 text-zinc-300 hover:text-white"
        title={isMuted ? "播放声音" : "静音"}
      >
        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </motion.button>
      <audio ref={audioRef} loop autoPlay playsInline muted={isMuted} />
    </div>
  );
};
