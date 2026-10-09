import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

// 1. HOOK useAudio() - LÓGICA REACT ALTAMENTE PERFORMANT
const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [nowPlaying, setNowPlaying] = useState("Esperando transmisión...");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressFillRef = useRef<HTMLDivElement | null>(null);
  const volumeFillRef = useRef<HTMLDivElement | null>(null);
  const currentTimeRef = useRef<HTMLSpanElement | null>(null);
  const durationRef = useRef<HTMLSpanElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    try {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src'); // Stop buffering
        audioRef.current.load();
        setIsPlaying(false);
      } else {
        audioRef.current.src = "https://streaming5.locucionar.com/proxy/sonicaradio?mp=/stream";
        audioRef.current.load();
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (_error) {
      setIsPlaying(false);
    }
  };

  const updateVolume = (val: number) => {
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val / 100;
    }
    if (volumeFillRef.current) {
      volumeFillRef.current.style.height = `${val}%`;
    }
  };

  // Poll metadata
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchMetadata = async () => {
      const targetUrl = "https://streaming5.locucionar.com/proxy/sonicaradio?mp=/status-json.xsl";
      let data: any = null;

      // Try CorsProxy.io first
      try {
        const response = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`);
        if (response.ok) {
          data = await response.json();
        }
      } catch {
        // silent fallback
      }

      // Try AllOrigins as second option
      if (!data) {
        try {
          const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
          if (response.ok) {
            const wrapper = await response.json();
            if (wrapper && wrapper.contents) {
              data = JSON.parse(wrapper.contents);
            }
          }
        } catch {
          // silent fallback
        }
      }

      // Try direct fetch as last resort
      if (!data) {
        try {
          const response = await fetch(targetUrl);
          if (response.ok) {
            data = await response.json();
          }
        } catch {
          // silent fallback
        }
      }

      if (data && data.icestats) {
        try {
          const sourcesList = data.icestats.source;
          if (sourcesList) {
            const sources = Array.isArray(sourcesList) ? sourcesList : [sourcesList];
            
            let activeSource = sources.find((s: any) => s && s.listenurl && s.listenurl.endsWith('/live') && s.title);
            if (!activeSource) {
              activeSource = sources.find((s: any) => s && s.listenurl && s.listenurl.endsWith('/autodj') && s.title);
            }
            if (!activeSource) {
              activeSource = sources.find((s: any) => s && s.title);
            }
            if (activeSource && activeSource.title) {
              setNowPlaying(activeSource.title);
            }
          }
        } catch (_err) {
          // silent fallback
        }
      }
    };

    fetchMetadata();
    interval = setInterval(fetchMetadata, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Sync volume with audio element and UI fill on load/change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
    if (volumeFillRef.current) {
      volumeFillRef.current.style.height = `${volume}%`;
    }
  }, [volume]);

  // requestAnimationFrame Loop to avoid constant React re-renders of the play progress
  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current && isPlaying) {
        const current = audioRef.current.currentTime;
        
        // Format time to MM:SS
        const minutes = Math.floor(current / 60);
        const seconds = Math.floor(current % 60);
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (currentTimeRef.current) {
          currentTimeRef.current.innerText = timeStr;
        }

        // Infinite cyclical progress bar (0% to 100% every 60 seconds) for a live stream
        if (progressFillRef.current) {
          const progressPercent = ((current % 60) / 60) * 100;
          progressFillRef.current.style.transform = `scaleX(${progressPercent / 100})`;
        }
      }
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (currentTimeRef.current) {
        currentTimeRef.current.innerText = "0:00";
      }
      if (progressFillRef.current) {
        progressFillRef.current.style.transform = "scaleX(0)";
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return {
    isPlaying,
    togglePlay,
    volume,
    setVolume: updateVolume,
    nowPlaying,
    audioRef,
    progressFillRef,
    volumeFillRef,
    currentTimeRef,
    durationRef
  };
};

export const FooterPlayer: React.FC = () => {
  const {
    isPlaying,
    togglePlay,
    volume,
    setVolume,
    nowPlaying,
    audioRef,
    progressFillRef,
    volumeFillRef,
    currentTimeRef,
    durationRef
  } = useAudio();

  // Listen to togglePlay from external hero/components, and expose play state to the window
  useEffect(() => {
    const handleTogglePlay = () => {
      togglePlay();
    };
    window.addEventListener('togglePlay', handleTogglePlay);
    
    // Set a global reference
    (window as any).__isAudioPlaying = isPlaying;
    // Dispatch a custom event to notify other components of the state change
    window.dispatchEvent(new CustomEvent('sonicaPlayState', { detail: { isPlaying } }));

    return () => {
      window.removeEventListener('togglePlay', handleTogglePlay);
    };
  }, [isPlaying, togglePlay]);

  const [isNearBottom, setIsNearBottom] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      let scrollTop = 0;
      let scrollHeight = 0;
      let clientHeight = 0;

      if (target && target !== document as any && target.scrollTop !== undefined) {
        scrollTop = target.scrollTop;
        scrollHeight = target.scrollHeight;
        clientHeight = target.clientHeight;
      } else {
        scrollTop = window.scrollY || document.documentElement.scrollTop;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
      }

      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      // Si el usuario está a menos de 240px del fondo (cuando llega al footer)
      setIsNearBottom(distanceToBottom < 240);
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('scroll', handleScroll);
    
    // Ejecutar inicialmente para chequear estado
    handleScroll({ target: document } as any);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <style>{`
        /* Scrollbar oculta para marquee si hace falta */
        marquee { -webkit-user-select: none; user-select: none; }

        /* Fader Volume Interaction */
        #volumeFader:focus-visible #volumeFill { filter: brightness(1.2); }
      `}</style>

      <audio 
        ref={audioRef} 
        preload="none"
        crossOrigin="anonymous"
      />

      <div className={`fixed bottom-0 left-0 right-0 z-[100] w-full transition-all duration-500 ease-in-out transform origin-bottom ${
        isNearBottom 
          ? 'opacity-20 translate-y-2 hover:opacity-100 hover:translate-y-0 scale-98 hover:scale-100' 
          : 'opacity-100 translate-y-0 scale-100'
      }`}>
        {/* 1. CAPA DE CONEXIÓN GLOBAL - AURA CELESTE/TURQUESA */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-full max-w-4xl h-8 pointer-events-none overflow-hidden select-none">
          {/* Pulso de Aura central turquesa */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-4 bg-cyan-500/30 blur-md rounded-full animate-aura-breathe" />
          {/* Anillo de expansión de energía turquesa */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border border-cyan-500/20 animate-ring-expand" />
          {/* Rayos / Conectores de neón turquesa */}
          <div className="absolute bottom-0 left-1/2 w-[2px] h-8 bg-gradient-to-t from-cyan-500 to-transparent transform -translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-16 h-[1px] bg-cyan-500/40 transform -translate-x-1/2" />
        </div>

        {/* 2. LA CONSOLA (Barra Principal) - GLASSMORPHISM METÁLICO COMPACTO */}
        <div className="relative w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 bg-black/35 backdrop-blur-2xl border-t border-x border-white/10 rounded-t-2xl px-4 md:px-6 py-2 md:py-2.5 select-none">
          
          {/* ZONA IZQ: METADATA / NOW PLAYING */}
          <div className="flex items-center gap-3 w-full md:w-1/3 min-w-0">
            {/* Logo de Sónica interactivo que hace toggle play al hacer click */}
            <div 
              className="relative group cursor-pointer shrink-0 z-20 w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors"
              onClick={togglePlay}
            >
              <img src="/logo-sonica.png" alt="Sónica" className={`h-6 w-auto object-contain shrink-0 transition-transform ${isPlaying ? 'animate-pulse scale-105' : 'scale-100'}`} />
            </div>

            {/* Textos de Reproducción */}
            <div className="hidden md:flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider">SÓNICA RADIO</span>
                <span className="text-cyan-400 font-mono text-[9px] px-1.5 py-0.5 rounded border border-cyan-500/20 bg-cyan-500/5 animate-pulse uppercase shrink-0">LIVE</span>
              </div>
              {/* Tema Activo es el dato principal */}
              <div className="w-full max-w-[200px] md:max-w-[260px] overflow-hidden mt-0.5 relative">
                <div className="w-full overflow-hidden whitespace-nowrap relative">
                  <div className="inline-flex gap-8 animate-marquee whitespace-nowrap">
                    <span className="text-white font-semibold text-sm tracking-wide uppercase">
                      {nowPlaying || 'ESPERANDO TRANSMISIÓN...'}
                    </span>
                    <span className="text-white font-semibold text-sm tracking-wide uppercase">
                      {nowPlaying || 'ESPERANDO TRANSMISIÓN...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ZONA CENTRO: CONTROLES TRANSPORTE */}
          <div className="flex flex-col items-center gap-1.5 w-full md:w-1/3 justify-center z-10">
            <div className="flex items-center gap-3 justify-center">
              {/* Botón de Play Principal */}
              <div className="relative shrink-0">
                <button 
                  onClick={togglePlay}
                  className={`relative w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-lg shrink-0 ${isPlaying ? 'bg-cyan-500 text-white border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)]' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}`}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  {/* Anillo de Carga en Play */}
                  <div className={`absolute inset-0 rounded-full border-2 border-cyan-500/30 ${isPlaying ? 'animate-ring-expand' : ''}`} />
                </button>
              </div>

              {/* Monitor de Tiempo / Espectro Visualizer */}
              <div className="flex items-center gap-2.5 bg-black/60 border border-white/5 rounded-xl px-3 py-1.5 h-10 min-w-[180px]">
                <span ref={currentTimeRef} className="font-mono text-[10px] text-cyan-400/80">0:00</span>
                {/* Mini Espectro de Frecuencias animado celeste */}
                <div className="flex items-end gap-[2px] h-full flex-1 py-0.5 justify-center">
                  {[...Array(14)].map((_, i) => {
                    const dur = 0.4 + (i % 4) * 0.15;
                    const delay = (i % 3) * 0.1;
                    return (
                      <div 
                        key={i} 
                        className={`w-[2px] bg-gradient-to-t from-cyan-500 to-cyan-400/50 rounded-t transition-all ${isPlaying ? 'animate-bounce-visualizer' : ''}`}
                        style={{
                          height: isPlaying ? '100%' : '15%',
                          transformOrigin: 'bottom',
                          animationDuration: isPlaying ? `${dur}s` : undefined,
                          animationDelay: isPlaying ? `${delay}s` : undefined
                        }}
                      />
                    );
                  })}
                </div>
                <span ref={durationRef} className="font-mono text-[10px] text-cyan-400/80">LIVE</span>
              </div>
            </div>

            {/* Barra de Progreso Cíclica en la parte inferior del Centro */}
            <div className="w-full max-w-xs md:max-w-sm h-1 bg-white/5 rounded-full overflow-hidden relative">
              <div 
                ref={progressFillRef}
                className="absolute top-0 left-0 h-full w-full bg-cyan-500 origin-left transition-transform duration-100"
                style={{ transform: 'scaleX(0)' }}
              />
            </div>
          </div>

          {/* ZONA DER: GAIN / VOLUMEN (Fader Estilo Mixer Vertical Compacto) */}
          <div className="flex items-center gap-4 w-full md:w-1/3 justify-end shrink-0 z-10">
            {/* El Fader de Volumen con VU Meter estilo mixer */}
            <div className="flex items-center gap-3 bg-black/50 px-3 py-1.5 rounded-xl border border-white/5 w-full md:w-36 justify-between h-14 md:h-16">
              {/* VU meter simple de 4 LEDs al lado del fader */}
              <div className="hidden lg:flex flex-col gap-[2px] items-center shrink-0 h-10 md:h-12 justify-center">
                <div className={`w-3 h-[3px] rounded-sm ${isPlaying && volume > 85 ? 'bg-cyan-500/90 shadow-[0_0_6px_rgba(6,182,212,0.7)] animate-pulse' : 'bg-neutral-800'}`} />
                <div className={`w-3 h-[3px] rounded-sm ${isPlaying && volume > 60 ? 'bg-teal-500/80 shadow-[0_0_4px_rgba(20,184,166,0.5)]' : 'bg-neutral-800'}`} />
                <div className={`w-3 h-[3px] rounded-sm ${isPlaying && volume > 30 ? 'bg-cyan-400/80 shadow-[0_0_4px_rgba(34,211,238,0.5)]' : 'bg-neutral-800'}`} />
                <div className={`w-3 h-[3px] rounded-sm ${isPlaying ? 'bg-cyan-500/80 shadow-[0_0_4px_rgba(6,182,212,0.5)]' : 'bg-neutral-800'}`} />
              </div>

              {/* Slider de volumen vertical estilizado */}
              <div className="relative w-2 md:w-2.5 h-10 md:h-12 flex flex-col justify-end mx-1">
                <div className="absolute inset-0 w-2 md:w-2.5 bg-white/10 rounded-full" />
                <div 
                  id="volumeFill"
                  ref={volumeFillRef}
                  className="absolute bottom-0 w-2 md:w-2.5 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-full transition-all duration-100" 
                  style={{ height: `${volume}%` }} 
                />
                <input 
                  type="range" 
                  id="volumeFader"
                  min="0" 
                  max="100" 
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  style={{
                    writingMode: 'vertical-lr',
                    direction: 'rtl',
                    WebkitAppearance: 'slider-vertical',
                    width: '24px',
                    height: '48px',
                    margin: '0',
                    padding: '0',
                    opacity: 0,
                    cursor: 'pointer',
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="absolute cursor-pointer"
                />
              </div>

              <div className="flex flex-col items-center justify-between h-10 md:h-12 text-cyan-400 shrink-0">
                <Volume2 className="w-3.5 h-3.5" />
                <span className="text-[9px] font-mono font-bold">{volume}%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
