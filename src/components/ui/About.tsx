import React from 'react';
import { motion } from 'motion/react';
import { useAdminData } from '../../context/AdminDataContext';

export const About: React.FC = () => {
  const { config } = useAdminData();
  const ab = config.about || {};

  const tag = ab.tag || 'Bienvenidos a Sónica';
  const p1 = ab.p1;
  const p2 = ab.p2;
  const p3 = ab.p3;
  const badgeText = ab.imageBadgeText || 'PROGRESSIVE & ELECTRONIC STUDIO';
  const footerTitle = ab.imageFooterTitle || 'Sónica Radio Digital';
  const footerSub = ab.imageFooterSub || 'RADIO ONLINE FIRST CLASS';

  return (
    <section id="nosotros" className="bg-black min-h-screen py-32 px-4 md:px-12 lg:px-24 flex items-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-left"
          >
            <h2 className="font-mono text-sm text-cyan-400 tracking-widest mb-8 uppercase">
              {tag}
            </h2>
            
            <div className="space-y-6 text-white/70 text-lg font-light leading-relaxed">
              {p1 && <p>{p1}</p>}
              {p2 && <p>{p2}</p>}
              {p3 && <p>{p3}</p>}
            </div>
          </motion.div>

          {/* Visual Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="relative aspect-square md:aspect-[4/5] lg:aspect-square border border-white/10 rounded-2xl overflow-hidden group shadow-2xl bg-[#090a0f]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 z-10" />
              <img 
                src={ab.imageUrl || "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=1200&auto=format&fit=crop"} 
                alt="Estudio Sónica Radio" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-out group-hover:scale-105 z-0"
                onError={(e) => {
                  e.currentTarget.src = "/logo-sonica.png";
                }}
              />

              {/* Sónica Radio Logo Overlay */}
              <div className="absolute top-6 left-6 z-20 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 backdrop-blur-md shadow-lg">
                <img 
                  src="/logo-sonica.png" 
                  alt="Sónica Radio" 
                  className="h-8 w-auto object-contain filter drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                />
                <div className="flex flex-col text-left border-l border-white/10 pl-3">
                  <span className="text-white text-xs font-bold tracking-widest uppercase">SÓNICA RADIO</span>
                  <span className="text-cyan-400 text-[10px] font-mono tracking-wider uppercase">ESTUDIO CENTRAL</span>
                </div>
              </div>

              <div className="absolute bottom-8 left-8 right-8 z-20 space-y-1">
                 <div className="inline-block text-[10px] font-mono tracking-[0.2em] text-cyan-400 uppercase bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20 mb-1">
                   {badgeText}
                 </div>
                 <p className="text-white text-sm font-semibold tracking-wide">{footerTitle}</p>
                 <p className="text-white/50 text-xs font-mono tracking-wider">{footerSub}</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

