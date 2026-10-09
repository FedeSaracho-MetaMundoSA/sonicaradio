import React, { useState, useEffect } from 'react';
import { Play, Pause, Radio, Headphones, Activity, Users, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { LiveChat } from './LiveChat';

export const RadioChatSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [streamInfo, setStreamInfo] = useState({
    listeners: 142,
    bitrate: '320 kbps',
    quality: 'HD Stereo',
    latency: '1.2s'
  });

  useEffect(() => {
    // Check initial state from global player
    if (typeof window !== 'undefined') {
      setIsPlaying(!!(window as any).__isAudioPlaying);
    }

    const handlePlayStateChange = (e: any) => {
      if (e.detail) {
        setIsPlaying(e.detail.isPlaying);
      }
    };

    window.addEventListener('sonicaPlayState', handlePlayStateChange);
    
    // Simulate minor dynamic changes in live listeners for high-fidelity immersion
    const interval = setInterval(() => {
      setStreamInfo(prev => ({
        ...prev,
        listeners: prev.listeners + (Math.random() > 0.5 ? 1 : -1)
      }));
    }, 12000);

    return () => {
      window.removeEventListener('sonicaPlayState', handlePlayStateChange);
      clearInterval(interval);
    };
  }, []);

  const handlePlayToggle = () => {
    window.dispatchEvent(new CustomEvent('togglePlay'));
  };

  return (
    <section id="reproductor-chat" className="w-full py-20 bg-[#070709] border-t border-white/5 relative overflow-hidden">
      {/* Background radial gradient glow matching electronic music vibe */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.03),transparent_50%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono tracking-wider uppercase mb-3">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Sintonía Digital HD
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Señal En Vivo & Comunidad Sónica
          </h2>
          <p className="mt-2 text-neutral-400 text-sm max-w-md mx-auto">
            Escuchá la transmisión oficial en tiempo real y chateá en vivo con otros oyentes y DJs de la escena.
          </p>
        </div>

        {/* Dynamic Split Grid (Player on Left, Chat on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Premium Radio Deck Player */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-b from-[#0f1118] to-[#0a0b0e] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* Upper Deck Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-red-500 animate-ping' : 'bg-neutral-600'}`} />
                <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase font-bold">
                  {isPlaying ? 'ON AIR' : 'OFFLINE'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-neutral-300 text-[10px] font-mono">
                <Headphones className="w-3 h-3 text-cyan-400" />
                {streamInfo.quality}
              </div>
            </div>

            {/* Middle Deck: Vinyl/Visualizer Center */}
            <div className="flex flex-col items-center justify-center my-6 space-y-6">
              {/* Spinning/pulsing vinyl ring wrapper */}
              <div className="relative">
                <div className={`w-36 h-36 rounded-full border-4 border-neutral-800 flex items-center justify-center bg-black shadow-[0_15px_30px_rgba(0,0,0,0.5)] relative overflow-hidden ${
                  isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''
                }`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.8)_100%)] z-10" />
                  <img src="/logo-sonica.png" alt="Sónica" className="w-20 h-auto z-0 opacity-80" />
                  
                  {/* Central spindle hole */}
                  <div className="w-3 h-3 rounded-full bg-[#070709] border border-white/20 z-20" />
                </div>

                {/* Outer interactive pulsating glow ring */}
                <div className={`absolute -inset-3 rounded-full border border-cyan-500/10 transition-all duration-1000 ${
                  isPlaying ? 'scale-105 opacity-100 animate-pulse' : 'scale-95 opacity-0'
                }`} />
              </div>

              {/* Title & Freq info */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-white tracking-wide uppercase">Sónica Radio</h3>
                <p className="text-xs font-mono text-cyan-400 tracking-widest uppercase mt-1">Radio Online First Class</p>
              </div>
            </div>

            {/* Lower Deck: Play Trigger & Broadcast Metrics */}
            <div className="space-y-6">
              {/* Toggle Trigger Button */}
              <button
                onClick={handlePlayToggle}
                className={`w-full py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 ${
                  isPlaying
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_20px_rgba(239,68,68,0.3)]'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-black shadow-[0_4px_20px_rgba(6,182,212,0.3)]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    Pausar Transmisión
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Escuchar En Vivo
                  </>
                )}
              </button>

              {/* Transmission stats grid */}
              <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">Bitrate</span>
                  <span className="text-xs font-bold text-white mt-1">{streamInfo.bitrate}</span>
                </div>
                <div className="flex flex-col border-x border-white/5">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">Latencia</span>
                  <span className="text-xs font-bold text-white mt-1">{streamInfo.latency}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">Oyentes Web</span>
                  <span className="text-xs font-bold text-cyan-400 mt-1 flex items-center justify-center gap-1">
                    <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                    {streamInfo.listeners}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Embedded Standalone Live Chat */}
          <div className="lg:col-span-7 flex flex-col h-[520px] bg-gradient-to-b from-[#0f1118] to-[#0a0b0e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Embedded LiveChat in standalone mode takes exact control of this card space */}
            <div className="w-full h-full relative z-10">
              <LiveChat standalone />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
