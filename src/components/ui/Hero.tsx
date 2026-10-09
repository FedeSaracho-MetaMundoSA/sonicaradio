import React from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import { VisualizerScene } from '../3d/VisualizerScene';

interface HeroProps {
  onPlay: () => void;
  isPlaying: boolean;
  dataArray: Uint8Array | null;
}

export const Hero: React.FC<HeroProps> = ({ onPlay, isPlaying, dataArray }) => {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop"
          alt="DJ Deck Background"
          className="w-full h-full object-cover opacity-30"
          onError={(e) => {
            e.currentTarget.src = "/logo-sonica.png";
            e.currentTarget.className = "w-1/3 h-1/3 m-auto object-contain opacity-20";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/50 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex-1 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-800/50 border border-neutral-700 backdrop-blur-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-widest">Transmisión 24/7</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Siente la <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-800 to-amber-600">
                Radio Online
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-neutral-400 mb-8 max-w-lg leading-relaxed">
              La mejor música, noticias de actualidad y los programas más escuchados. Conéctate con el sonido que te acompaña todo el día.
            </p>

            <button 
              onClick={onPlay}
              className="group flex items-center gap-4 px-8 py-4 bg-white text-neutral-950 rounded-full font-bold text-lg hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-amber-800 flex items-center justify-center text-neutral-950 group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-current ml-1" />
              </div>
              {isPlaying ? 'Escuchando' : 'Escuchar Ahora'}
            </button>
          </motion.div>
        </div>

        {/* Visualizer Graphic */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 hidden md:flex justify-end"
        >
          <div className="relative w-96 h-96 flex items-center justify-center">
            <div className="absolute inset-0">
               <VisualizerScene dataArray={dataArray} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
