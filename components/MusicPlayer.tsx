import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface MusicPlayerProps {
  musicUrl?: string;
  mobileMusicUrl?: string;
  isMobile?: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  musicUrl, 
  mobileMusicUrl, 
  isMobile,
  isMuted,
  onToggleMute
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const activeMusicUrl = (isMobile && mobileMusicUrl) ? mobileMusicUrl : musicUrl;

  useEffect(() => {
    if (audioRef.current) {
      if (activeMusicUrl) {
        audioRef.current.src = activeMusicUrl;
        audioRef.current.load();
        audioRef.current.muted = isMuted;
        audioRef.current.play().catch(e => console.log('Autoplay blocked', e));
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [activeMusicUrl]);

  // Sync muted state dynamically when isMuted changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

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
