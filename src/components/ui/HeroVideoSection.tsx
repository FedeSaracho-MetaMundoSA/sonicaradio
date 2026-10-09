import React, { useContext, useState, useEffect } from 'react';
import { Play, Pause, Radio, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HeroVideoBackground } from './HeroVideoBackground';
import { AudioContext } from '../../context/AudioContext';

export const HeroVideoSection: React.FC = () => {
  const { dataArray } = useContext(AudioContext);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Check initial state
    if (typeof window !== 'undefined') {
      setIsPlaying(!!(window as any).__isAudioPlaying);
    }

    // Listen to play state changes from the footer player
    const handlePlayStateChange = (e: any) => {
      if (e.detail) {
        setIsPlaying(e.detail.isPlaying);
      }
    };

    window.addEventListener('sonicaPlayState', handlePlayStateChange);
    return () => {
      window.removeEventListener('sonicaPlayState', handlePlayStateChange);
    };
  }, []);

  const handlePlay = () => {
    window.dispatchEvent(new CustomEvent('togglePlay'));
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Video with a rich dark aesthetic tint overlay */}
      <div className="absolute inset-0 z-0">
        <HeroVideoBackground />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10" />
      </div>

      {/* Main Front Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 text-center flex flex-col items-center justify-center select-none">
        <div className="mt-40 animate-pulse flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono tracking-[0.5em] text-white/40 uppercase">
            DESPLAZAR PARA EXPLORAR LA PROGRAMACIÓN ONLINE
          </span>
          <span className="text-white/30 text-xs font-light">↓</span>
        </div>
      </div>
    </section>
  );
};

