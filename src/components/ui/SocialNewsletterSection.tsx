import React, { useState } from 'react';
import { Mail, Instagram, Youtube, Facebook, MessageCircle, Send, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SocialNewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    // Simulate real high-contrast subscription experience
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
      setEmail('');
    }, 1500);
  };

  return (
    <section id="comunidad" className="w-full py-20 bg-black border-t border-white/5 relative overflow-hidden">
      {/* Light subtle grid overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(217,119,6,0.03),transparent_40%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Premium Newsletter Subscribe form */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-mono tracking-wider uppercase">
              <Mail className="w-3.5 h-3.5" />
              BOLETÍN QUINCENAL
            </div>
            
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Suscribite a nuestro Newsletter Sónico
            </h2>
            
            <p className="text-neutral-400 text-sm leading-relaxed max-w-md font-light">
              Enterate de los nuevos lanzamientos, fechas de transmisiones especiales en vivo, cronogramas de shows internacionales y playlists exclusivas antes que nadie.
            </p>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form 
                  key="subscribe-form"
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row gap-3 w-full max-w-md pt-2"
                >
                  <div className="relative flex-1">
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Tu dirección de email..."
                      required
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-12 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-widest px-6 rounded-xl flex items-center justify-center gap-2 transition-all shrink-0 hover:scale-[1.02]"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Suscribirse
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success-message"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl max-w-md flex items-center gap-3"
                >
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-white text-sm font-bold">¡Suscripción exitosa!</h4>
                    <p className="text-neutral-400 text-xs mt-0.5">Te agregamos a nuestra lista de DJs y oyentes VIP.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: High-contrast responsive social networks grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            
            {/* Instagram Widget */}
            <a 
              href="https://www.instagram.com/radio_sonica" 
              target="_blank" 
              rel="noreferrer"
              className="group flex flex-col justify-between p-5 bg-white/5 hover:bg-gradient-to-br hover:from-purple-900/20 hover:to-pink-900/20 border border-white/10 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-pink-600/10 group-hover:bg-pink-600/20 flex items-center justify-center text-pink-500 transition-colors">
                  <Instagram className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-mono font-bold text-neutral-500 group-hover:text-pink-400 transition-colors">@RADIO_SONICA</span>
              </div>
              <div className="mt-6">
                <span className="text-white text-sm font-bold block">Instagram Oficial</span>
                <span className="text-neutral-500 text-[11px] font-mono mt-1 block">Conectá con la escena</span>
              </div>
            </a>

            {/* YouTube Widget */}
            <a 
              href="https://youtube.com/@sonicaradioonline" 
              target="_blank" 
              rel="noreferrer"
              className="group flex flex-col justify-between p-5 bg-white/5 hover:bg-gradient-to-br hover:from-red-950/20 hover:to-red-900/10 border border-white/10 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-red-600/10 group-hover:bg-red-600/20 flex items-center justify-center text-red-500 transition-colors">
                  <Youtube className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-mono font-bold text-neutral-500 group-hover:text-red-400 transition-colors">YOUTUBE LIVE</span>
              </div>
              <div className="mt-6">
                <span className="text-white text-sm font-bold block">Canal YouTube</span>
                <span className="text-neutral-500 text-[11px] font-mono mt-1 block">Sets & Streaming HD</span>
              </div>
            </a>

            {/* SoundCloud Widget */}
            <a 
              href="https://soundcloud.com/" 
              target="_blank" 
              rel="noreferrer"
              className="group flex flex-col justify-between p-5 bg-white/5 hover:bg-gradient-to-br hover:from-amber-950/20 hover:to-amber-900/10 border border-white/10 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#ff5500]/10 group-hover:bg-[#ff5500]/20 flex items-center justify-center text-[#ff5500] transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.23,13.72l0-4.71c0-0.4-0.12-0.78-0.34-1.12c0.23,0.3,0.36,0.67,0.36,1.06v4.77H11.23z M9.16,13.72l0-5.8 c0-0.37-0.1-0.73-0.29-1.04c0.2,0.28,0.31,0.61,0.31,0.96v5.88H9.16z M7.09,13.72l0-4.63c0-0.3-0.08-0.59-0.23-0.84 c0.15,0.23,0.23,0.49,0.23,0.77v4.7H7.09z M5.02,13.72l0-3.32c0-0.24-0.06-0.47-0.18-0.67c0.12,0.18,0.18,0.39,0.18,0.61v3.38H5.02z M2.95,13.72l0-1.84c0-0.16-0.04-0.32-0.12-0.46c0.08,0.12,0.12,0.27,0.12,0.42v1.88H2.95z M13.3,13.72l0-2.8 c0-0.46-0.15-0.89-0.42-1.25c0.27,0.33,0.42,0.76,0.42,1.2v2.85H13.3z M24,10.63c0,1.72-1.4,3.12-3.12,3.12h-6.52l0-7.39 c2.8,0.06,5.13,1.96,5.82,4.55C20.48,10.65,20.81,10.5,21.17,10.5C22.74,10.5,24,11.76,24,10.63z" />
                  </svg>
                </div>
                <span className="text-[9px] font-mono font-bold text-neutral-500 group-hover:text-amber-500 transition-colors">AUDIO ARCHIVE</span>
              </div>
              <div className="mt-6">
                <span className="text-white text-sm font-bold block">SoundCloud Archive</span>
                <span className="text-neutral-500 text-[11px] font-mono mt-1 block">Grabaciones bajo demanda</span>
              </div>
            </a>

            {/* WhatsApp Group Widget */}
            <a 
              href="https://wa.me/5493872200098" 
              target="_blank" 
              rel="noreferrer"
              className="group flex flex-col justify-between p-5 bg-white/5 hover:bg-gradient-to-br hover:from-emerald-950/20 hover:to-emerald-900/10 border border-white/10 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-emerald-600/10 group-hover:bg-emerald-600/20 flex items-center justify-center text-emerald-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-mono font-bold text-neutral-500 group-hover:text-emerald-400 transition-colors">WA DIRECTO</span>
              </div>
              <div className="mt-6">
                <span className="text-white text-sm font-bold block">Contacto Comercial</span>
                <span className="text-neutral-500 text-[11px] font-mono mt-1 block">Auspicios & Consultas</span>
              </div>
            </a>

          </div>
          
        </div>

      </div>
    </section>
  );
};
