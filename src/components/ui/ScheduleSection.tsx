import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle, 
  FileText, 
  CheckCircle2, 
  Headphones, 
  Sparkles, 
  Layers, 
  Radio, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminData, resolveShowImage } from '../../context/AdminDataContext';

const DAYS = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];

export const ScheduleSection: React.FC = () => {
  const { config } = useAdminData();
  const [activeDay, setActiveDay] = useState(DAYS[0]);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Convert DAY UPPERCASE key to schedule config key or fallback
  const getDaySchedule = (dayUpper: string) => {
    // try exact key, or Title Case key
    const titleCaseDay = dayUpper.charAt(0) + dayUpper.slice(1).toLowerCase();
    const shows = config.schedules?.[titleCaseDay] || config.schedules?.[dayUpper] || [];
    return shows;
  };

  const scheduleForActiveDay = getDaySchedule(activeDay);

  // Reset scroll on day change
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [activeDay]);

  // Auto-scroll carousel every 3.5 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (!carouselRef.current) return;

      const container = carouselRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (maxScroll <= 0) return;

      if (container.scrollLeft >= maxScroll - 15) {
        // Switch to next day or loop to start
        const currentIdx = DAYS.indexOf(activeDay);
        const nextDay = DAYS[(currentIdx + 1) % DAYS.length];
        setActiveDay(nextDay);
      } else {
        container.scrollBy({ left: 340, behavior: 'smooth' });
      }
    }, 3800);

    return () => clearInterval(interval);
  }, [isPaused, activeDay]);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 15) {
        const currentIdx = DAYS.indexOf(activeDay);
        const nextDay = DAYS[(currentIdx + 1) % DAYS.length];
        setActiveDay(nextDay);
      } else {
        container.scrollBy({ left: 340, behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="programacion" className="bg-[#050507] min-h-screen py-24 px-4 md:px-12 lg:px-24 flex flex-col items-center overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full mb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-4">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          ON AIR PROGRAMACIÓN
        </div>
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
          Nuestra Grilla
        </h2>
        <p className="text-white/50 max-w-2xl mx-auto text-base md:text-lg font-light">
          Descubrí los horarios, programas de culto y las sesiones exclusivas de sónica que musicalizan tus días.
        </p>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Day Selector */}
        <div className="flex overflow-x-auto hide-scrollbar gap-4 md:gap-8 mb-12 border-b border-white/5 pb-2 justify-start md:justify-center">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`font-mono text-[10px] md:text-xs font-bold tracking-[0.25em] pb-4 px-2 whitespace-nowrap transition-all duration-300 relative ${
                activeDay === day
                  ? 'text-cyan-400 scale-105 font-extrabold'
                  : 'text-white/30 hover:text-white/70'
              }`}
            >
              {day}
              {activeDay === day && (
                <motion.div 
                  layoutId="activeDay"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500" 
                  style={{ marginBottom: '-1px' }} 
                />
              )}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div className="relative group/carousel">
          {/* Controls */}
          <button 
            onClick={scrollLeft}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white/80 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hover:text-cyan-400 hover:border-cyan-500/50 hover:scale-110 hidden md:flex"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={scrollRight}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white/80 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hover:text-cyan-400 hover:border-cyan-500/50 hover:scale-110 hidden md:flex"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel container */}
          <div 
            ref={carouselRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 hide-scrollbar scroll-smooth"
          >
            <AnimatePresence mode="wait">
              {scheduleForActiveDay.map((prog) => (
                <div 
                  key={prog.id} 
                  className="snap-start shrink-0 w-[290px] md:w-[370px] group relative rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-b from-[#111216] to-[#0a0b0d] shadow-2xl transition-all duration-500 hover:border-cyan-500/40 hover:shadow-[0_15px_35px_rgba(6,182,212,0.12)] hover:-translate-y-2 flex flex-col h-full"
                >
                  {/* SMART ADAPTATIVE IMAGE CONTAINER
                      blurred copy as background + contained full banner in front
                      Esto asegura que las portadas 1300x500 (2.6:1) de Galactica y El Viaje 
                      queden 100% legibles, sin recortar sus textos, logrando máxima adaptabilidad. */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/80 border-b border-white/5 shrink-0">
                    {/* Blurred backing */}
                    <img 
                      src={resolveShowImage(prog.title, prog.image)} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover filter blur-md opacity-45 scale-110 select-none pointer-events-none" 
                      onError={(e) => {
                        e.currentTarget.src = "/logo-sonica.png";
                      }}
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
                    
                    {/* Sharp contained banner */}
                    <img 
                      src={resolveShowImage(prog.title, prog.image)} 
                      alt={prog.title} 
                      className="relative z-10 w-full h-full object-contain mx-auto transition-transform duration-700 group-hover:scale-[1.03]" 
                      onError={(e) => {
                        e.currentTarget.src = "/logo-sonica.png";
                      }}
                    />
                    
                    {/* Floating schedule badge */}
                    <div className="absolute bottom-3 left-3 z-20 bg-black/60 backdrop-blur-md text-cyan-400 border border-cyan-500/20 font-mono font-bold text-[10px] tracking-wider px-3 py-1.5 rounded-lg shadow-lg">
                      {prog.time}
                    </div>
                  </div>

                  {/* Body text content */}
                  <div className="p-6 flex flex-col justify-between flex-1 min-h-[190px]">
                    <div>
                      <h3 className="text-white font-bold text-lg md:text-xl tracking-tight mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                        {prog.title}
                      </h3>
                      <p className="text-white/50 text-sm leading-relaxed font-light min-h-[48px]">
                        {prog.desc}
                      </p>
                    </div>

                    {/* SoundCloud link button */}
                    {prog.soundcloudLink && (
                      <div className="mt-5 pt-4 border-t border-white/5">
                        <a
                          href={prog.soundcloudLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#ff5500]/90 hover:bg-[#ff5500] text-white px-4 py-2 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_4px_15px_rgba(255,85,0,0.3)] w-full justify-center"
                        >
                          <Headphones className="w-3.5 h-3.5" />
                          Escuchar en SoundCloud
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
