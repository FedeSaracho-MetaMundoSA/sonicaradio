import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Clock, 
  Headphones, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminData, FlagshipShowData, resolveShowImage } from '../../context/AdminDataContext';

export const FlagshipBanner: React.FC = () => {
  const { config } = useAdminData();
  const rawShows: FlagshipShowData[] = config.flagshipShows && config.flagshipShows.length > 0 
    ? config.flagshipShows 
    : [];

  // Smart Event Detection & Ordering Algorithm
  const FLAGSHIP_SHOWS = React.useMemo(() => {
    if (rawShows.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parsedShows = rawShows.map((show, originalIndex) => {
      let showDate: Date | null = null;
      if (show.date) {
        showDate = new Date(show.date);
      }
      
      const isUpcoming = showDate ? showDate.getTime() >= today.getTime() : false;
      const diffDays = showDate ? (showDate.getTime() - today.getTime()) / (1000 * 3600 * 24) : Infinity;

      return {
        show,
        originalIndex,
        isUpcoming,
        diffDays,
        isStarred: !!show.isStarred
      };
    });

    const upcomingShows = parsedShows
      .filter(item => item.isUpcoming)
      .sort((a, b) => a.diffDays - b.diffDays);

    if (upcomingShows.length > 0) {
      const rest = parsedShows.filter(item => !item.isUpcoming);
      return [...upcomingShows.map(i => i.show), ...rest.map(i => i.show)];
    }

    const starredShows = parsedShows.filter(item => item.isStarred);
    if (starredShows.length > 0) {
      const rest = parsedShows.filter(item => !item.isStarred);
      return [...starredShows.map(i => i.show), ...rest.map(i => i.show)];
    }

    return rawShows;
  }, [rawShows]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const SLIDE_DURATION = 6000; // 6 seconds per slide

  // Reset current index if shows change
  useEffect(() => {
    if (currentIndex >= FLAGSHIP_SHOWS.length && FLAGSHIP_SHOWS.length > 0) {
      setCurrentIndex(0);
    }
  }, [FLAGSHIP_SHOWS.length, currentIndex]);

  // Auto-rotate and timer progress bar
  useEffect(() => {
    if (isPaused || FLAGSHIP_SHOWS.length === 0) return;

    const intervalStep = 50; // update progress every 50ms
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((current) => (current + 1) % FLAGSHIP_SHOWS.length);
          return 0;
        }
        return prev + (intervalStep / SLIDE_DURATION) * 100;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isPaused, FLAGSHIP_SHOWS.length]);

  if (FLAGSHIP_SHOWS.length === 0) return null;

  // Reset progress bar on slide change
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  const handleNext = () => {
    goToSlide((currentIndex + 1) % FLAGSHIP_SHOWS.length);
  };

  const handlePrev = () => {
    goToSlide((currentIndex - 1 + FLAGSHIP_SHOWS.length) % FLAGSHIP_SHOWS.length);
  };

  // Touch Swipe handlers for mobile responsiveness
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const distance = touchStartX.current - touchEndX.current;
      if (distance > 40) {
        handleNext();
      } else if (distance < -40) {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setIsPaused(false);
  };

  const activeShow = FLAGSHIP_SHOWS[currentIndex];

  return (
    <section 
      id="destacados"
      className="w-full py-12 md:py-20 px-4 sm:px-6 lg:px-12 bg-[#060709] relative overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Soft ambient radial background color */}
      <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-1000">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 rounded-full blur-[140px] opacity-30 bg-gradient-to-r ${activeShow.color}`} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-10 gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-mono tracking-widest uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              PROGRAMACIÓN EXCLUSIVA
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
              Programas Destacados
            </h2>
          </div>

          {/* Program Switcher Tabs */}
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
            {FLAGSHIP_SHOWS.map((show, idx) => (
              <button
                key={show.id}
                onClick={() => goToSlide(idx)}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 ${
                  currentIndex === idx
                    ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {show.title}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Responsive Slide Display */}
        <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#11131a]/90 via-[#0a0b0f]/90 to-[#07080b]/95 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden p-5 sm:p-8 lg:p-12">
          
          {/* Top Auto-play Progress Bar Indicator */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeShow.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center"
            >
              
              {/* Flyer Showcase (Top on Mobile, Right on Desktop) */}
              <div className="lg:col-span-7 order-1 lg:order-2 w-full">
                <div className="relative w-full aspect-[16/9] sm:aspect-[2.1/1] lg:aspect-[2.3/1] rounded-2xl overflow-hidden border border-white/10 bg-black/90 shadow-2xl group/flyer">
                  
                  {/* Ambient Blurred Background Filler */}
                  <img 
                    src={resolveShowImage(activeShow.title, activeShow.image)} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover filter blur-xl opacity-40 scale-110 pointer-events-none select-none"
                    onError={(e) => {
                      e.currentTarget.src = "/logo-sonica.png";
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-10" />

                  {/* Main High-Res Flyer */}
                  <img 
                    src={resolveShowImage(activeShow.title, activeShow.image)} 
                    alt={activeShow.title} 
                    className="relative z-10 w-full h-full object-contain mx-auto transition-transform duration-700 group-hover/flyer:scale-[1.02]"
                    onError={(e) => {
                      e.currentTarget.src = "/logo-sonica.png";
                    }}
                  />

                  {/* Top-Right Badge */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase shadow-md">
                    <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                    {activeShow.badge}
                  </div>
                </div>
              </div>

              {/* Information & Description Section */}
              <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-between h-full space-y-4 sm:space-y-6">
                
                {/* Schedule & Day Tag */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs font-mono font-extrabold text-cyan-400 uppercase">
                    {activeShow.day}
                  </span>
                  <div className="flex items-center gap-1.5 text-white/70 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{activeShow.schedule} HS</span>
                  </div>
                </div>

                {/* Show Main Title & Subtitle */}
                <div>
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-none">
                    {activeShow.title}
                  </h3>
                  <p className="text-base sm:text-lg font-semibold text-cyan-400/90 mt-1">
                    {activeShow.subtitle}
                  </p>
                </div>

                {/* Description Text */}
                <p className="text-white/70 text-sm sm:text-base leading-relaxed font-light">
                  {activeShow.desc}
                </p>

                {/* SoundCloud & Listen CTA Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <a
                    href={activeShow.soundcloudLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 bg-[#ff5500] hover:bg-[#e04b00] text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-orange-950/40"
                  >
                    <Headphones className="w-4 h-4 animate-bounce" />
                    Escuchar en SoundCloud
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>

                  <a
                    href="#programacion"
                    className="inline-flex items-center justify-center gap-1 text-white/50 hover:text-cyan-400 font-mono text-xs uppercase tracking-wider py-3 px-4 transition-colors hover:underline"
                  >
                    Ver Grilla Completa
                  </a>
                </div>

              </div>

            </motion.div>
          </AnimatePresence>

          {/* Footer Controls: Progress Dots & Prev/Next Arrows */}
          <div className="flex items-center justify-between mt-6 sm:mt-8 pt-4 border-t border-white/5">
            
            {/* Slide Dots */}
            <div className="flex items-center gap-2">
              {FLAGSHIP_SHOWS.map((show, idx) => (
                <button
                  key={show.id}
                  onClick={() => goToSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx 
                      ? 'w-8 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]' 
                      : 'w-2.5 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Ver ${show.title}`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-cyan-400 transition-all flex items-center justify-center active:scale-95"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-cyan-400 transition-all flex items-center justify-center active:scale-95"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
