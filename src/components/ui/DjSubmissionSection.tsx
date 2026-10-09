import React from 'react';
import { Headphones, Radio, ExternalLink, Send } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';

export const DjSubmissionSection: React.FC = () => {
  const { config } = useAdminData();
  const dj = config.djSubmission;

  return (
    <section id="convocatoria" className="py-24 bg-[#050507] border-t border-white/5 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-4">
            <Headphones className="w-3.5 h-3.5" />
            {dj.badge || 'INVITACIÓN ABIERTA DJs'}
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
            {dj.title || 'Enviá tu set a Sónica'}
          </h2>
          <p className="text-base md:text-lg text-white/60 leading-relaxed font-light">
            {dj.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch">
          <div className="bg-gradient-to-b from-[#111216] to-[#0a0b0d] border border-white/5 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                {dj.requirementsTitle || 'Requisitos para salir al aire'}
              </h3>
              
              <ul className="space-y-4 text-white/70 text-sm">
                {dj.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                    <p>{req}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 text-xs text-white/40">
              * Todos los detalles y especificaciones técnicas completas están detallados dentro del formulario.
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#111216] to-[#0a0b0d] border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/10 mb-6">
              <Send className="w-7 h-7 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
              {dj.formTitle || 'Formulario de Postulación'}
            </h3>
            <p className="text-white/50 text-sm mb-8 leading-relaxed max-w-sm">
              {dj.formDescription}
            </p>

            <a 
              href={dj.formUrl || 'https://docs.google.com/forms/d/e/1FAIpQLSdZMYfn0hA8bdqDO0fEj7AWj2IqWhlgMZrDyE_etEkQeOqPTw/viewform'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 text-sm w-full"
            >
              {dj.buttonText || 'Completar en Google Forms'}
              <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-[10px] text-white/30 mt-4 font-mono uppercase tracking-widest">
              Redirección a Google Forms seguro
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
