import React from 'react';
import { Facebook, Instagram, MessageCircle, MapPin, Phone, Mail, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="contacto" className="bg-neutral-950 pt-20 pb-64 md:pb-80 lg:pb-96 border-t border-white/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo-sonica.png" alt="Sónica Radio" className="h-14 w-auto object-contain" />
              <span className="font-mono text-[10px] text-cyan-400 tracking-[0.25em] uppercase border-l border-white/20 pl-3 py-1">
                Radio Online First Class
              </span>
            </div>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed mb-6 max-w-lg">
              Seleccionamos buenos sonidos para acompañarte en tu día a día. Amamos lo que hacemos, transmitimos online desde la Ciudad de Salta capital las 24 hs los 7 días de la semana.
            </p>
            
            {/* Social Icons */}
            <div className="flex flex-wrap items-center gap-3.5">
              <a href="https://wa.me/5493872200098" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white hover:scale-110 shadow-lg shadow-emerald-950/20 transition-all duration-300 group" title="WhatsApp">
                <MessageCircle className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://www.instagram.com/radio_sonica" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white hover:scale-110 shadow-lg shadow-pink-950/20 transition-all duration-300 group" title="Instagram">
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://youtube.com/@sonicaradioonline" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-600 hover:text-white hover:scale-110 shadow-lg shadow-red-950/20 transition-all duration-300 group" title="YouTube HD">
                <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=100063569469556" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-[#1877F2] hover:text-white hover:scale-110 shadow-lg shadow-blue-950/20 transition-all duration-300 group" title="Facebook">
                <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://soundcloud.com/" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 hover:bg-[#FF5500] hover:text-white hover:scale-110 shadow-lg shadow-orange-950/20 transition-all duration-300 group" title="SoundCloud">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.23,13.72l0-4.71c0-0.4-0.12-0.78-0.34-1.12c0.23,0.3,0.36,0.67,0.36,1.06v4.77H11.23z M9.16,13.72l0-5.8 c0-0.37-0.1-0.73-0.29-1.04c0.2,0.28,0.31,0.61,0.31,0.96v5.88H9.16z M7.09,13.72l0-4.63c0-0.3-0.08-0.59-0.23-0.84 c0.15,0.23,0.23,0.49,0.23,0.77v4.7H7.09z M5.02,13.72l0-3.32c0-0.24-0.06-0.47-0.18-0.67c0.12,0.18,0.18,0.39,0.18,0.61v3.38H5.02z M2.95,13.72l0-1.84c0-0.16-0.04-0.32-0.12-0.46c0.08,0.12,0.12,0.27,0.12,0.42v1.88H2.95z M13.3,13.72l0-2.8 c0-0.46-0.15-0.89-0.42-1.25c0.27,0.33,0.42,0.76,0.42,1.2v2.85H13.3z M24,10.63c0,1.72-1.4,3.12-3.12,3.12h-6.52l0-7.39 c2.8,0.06,5.13,1.96,5.82,4.55C20.48,10.65,20.81,10.5,21.17,10.5C22.74,10.5,24,11.76,24,10.63z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-6 bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
            <h4 className="text-white font-black uppercase tracking-wider text-xs mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Información de Contacto
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <li className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col pt-0.5">
                  <span className="text-white/60 font-mono text-[10px] uppercase tracking-wider">Ubicación</span>
                  <span className="text-sm font-semibold text-white">Salta, Argentina</span>
                </div>
              </li>
              <li className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex flex-col pt-0.5">
                  <span className="text-white/60 font-mono text-[10px] uppercase tracking-wider">WhatsApp / Teléfono</span>
                  <a href="https://wa.me/5493872200098" target="_blank" rel="noreferrer" className="text-sm font-semibold text-emerald-400 hover:underline transition-all">
                    +54 9 387 220-0098
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3.5 sm:col-span-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col pt-0.5">
                  <span className="text-white/60 font-mono text-[10px] uppercase tracking-wider">Email Oficial</span>
                  <a href="mailto:info@sonicaradio.com.ar" className="text-sm font-semibold text-amber-400 hover:underline transition-all break-all">
                    info@sonicaradio.com.ar
                  </a>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar / Copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-xs md:text-sm">
            © {new Date().getFullYear()} Sónica Radio. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-xs md:text-sm text-neutral-500">
            <a href="#" className="hover:text-amber-500 transition-colors">Términos y Condiciones</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
