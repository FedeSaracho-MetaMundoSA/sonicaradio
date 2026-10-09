import React from 'react';
import { 
  Mail, 
  MessageCircle, 
  ArrowUpRight,
  Sparkles,
  PlusCircle,
  Megaphone,
  Building
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';

export const SponsorsSection: React.FC = () => {
  const { config } = useAdminData();
  const sponsorsData = config.sponsors;

  // ACTIVAR Y DESACTIVAR SECCION
  if (!sponsorsData || !sponsorsData.active) {
    return null;
  }

  const activeSponsors = sponsorsData.sponsors?.filter(s => s.active) || [];

  // If there are specific sponsor brand logos uploaded, create items for ticker
  const tickerItems = activeSponsors.length > 0
    ? activeSponsors
    : [
        { id: '1', name: "TU MARCA PUEDE ESTAR AQUÍ", subtext: "ESPACIO PUBLICITARIO", logoUrl: '', websiteUrl: '' },
        { id: '2', name: "ANUNCIÁ EN SÓNICA RADIO", subtext: "LLEGÁ A MILES DE OYENTES", logoUrl: '', websiteUrl: '' }
      ];

  const marqueeItems = [...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <section id="sponsors" className="w-full py-16 bg-[#070709] border-t border-white/5 relative overflow-hidden">
      {/* Subtle styling grids & gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.04),transparent_60%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title with premium badge */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono tracking-wider uppercase mb-3">
            <Megaphone className="w-3.5 h-3.5 text-cyan-400" />
            {sponsorsData.badge || 'ESPACIO PUBLICITARIO DISPONIBLE'}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">
            {sponsorsData.title || 'Sumá tu marca a Sónica Radio'}
          </h2>
          <p className="text-white/50 text-sm mt-2 font-light">
            {(sponsorsData.description && !sponsorsData.description.includes('94.3') && !sponsorsData.description.includes('FM'))
              ? sponsorsData.description 
              : 'Hacé que tu marca suene más fuerte, Anunciá en Sónica Radio. Desde Salta al mundo'}
          </p>
        </div>

        {/* LOGO MARQUEE / AD SLOTS TICKER */}
        <div className="relative w-full py-6 bg-black/40 border-y border-white/10 rounded-2xl overflow-hidden mb-12 shadow-inner group">
          {/* Edge fade gradient overlays */}
          <div className="absolute top-0 bottom-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#070709] to-transparent z-20 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#070709] to-transparent z-20 pointer-events-none" />

          {/* Scrolling tape wrapper */}
          <div className="relative flex overflow-x-hidden w-full">
            <div className="flex gap-8 md:gap-12 animate-marquee whitespace-nowrap items-center w-max min-w-full group-hover:[animation-play-state:paused]">
              {marqueeItems.map((item, index) => (
                <a 
                  key={index} 
                  href={item.websiteUrl || sponsorsData.whatsappUrl || '#sponsors'}
                  target={item.websiteUrl ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 shrink-0 opacity-90 hover:opacity-100 transition-all duration-300 px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-cyan-500/30 hover:border-cyan-400"
                >
                  {item.logoUrl ? (
                    <img 
                      src={item.logoUrl} 
                      alt={item.name} 
                      className="h-8 max-w-[120px] object-contain shrink-0" 
                      onError={(e) => {
                        e.currentTarget.src = "/logo-sonica.png";
                      }}
                    />
                  ) : (
                    <Building className="w-5 h-5 text-cyan-400 shrink-0" />
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-[13px] font-black tracking-[0.12em] text-white uppercase leading-none">
                      {item.name}
                    </span>
                    <span className="text-[9px] font-mono tracking-[0.2em] text-cyan-400 uppercase leading-none mt-1">
                      {item.subtext || 'SPONSOR'}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* CALL TO ACTION BANNER FOR NEW SPONSORS */}
        <div className="relative w-full max-w-4xl mx-auto bg-gradient-to-r from-[#11131b] to-[#0b0c10] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden">
          {/* Decorative glowing backdrops */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Texts */}
            <div className="md:col-span-7 space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                {sponsorsData.bannerBadge || 'TU MARCA PUEDE ESTAR AQUÍ'}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                {sponsorsData.bannerTitle || 'Anunciá tu empresa o emprendimiento'}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed font-light">
                {sponsorsData.bannerDescription || 'Llegá a miles de oyentes diarios a través de menciones en vivo, spots publicitarios y banners exclusivos en nuestra radio online.'}
              </p>
            </div>

            {/* Right Buttons CTA */}
            <div className="md:col-span-5 flex flex-col sm:flex-row md:flex-col gap-3 justify-center w-full">
              {/* WhatsApp CTA */}
              <a
                href={sponsorsData.whatsappUrl || "https://wa.me/5493872200098?text=Hola!%20Quiero%20anunciar%20mi%20marca%20en%20Sonica%20Radio."}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_4px_15px_rgba(16,185,129,0.3)] w-full text-center"
              >
                <MessageCircle className="w-4 h-4" />
                Consultar por WhatsApp
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              {/* Email CTA */}
              <a
                href={`mailto:${sponsorsData.email || 'info@sonicaradio.com.ar'}`}
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] w-full text-center"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                {sponsorsData.email || 'info@sonicaradio.com.ar'}
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
