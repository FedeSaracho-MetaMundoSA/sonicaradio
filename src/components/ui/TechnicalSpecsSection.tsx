import React from 'react';
import { Cpu, Wifi, Zap, Music, Radio, Shield, Server, Laptop } from 'lucide-react';

interface TechCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const TechCard: React.FC<TechCardProps> = ({ icon, title, desc }) => (
  <div className="bg-[#0f1118]/80 border border-white/5 rounded-xl p-6 hover:border-cyan-500/20 transition-all duration-300">
    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
      {icon}
    </div>
    <h3 className="text-white text-sm font-bold tracking-wide uppercase mb-2">{title}</h3>
    <p className="text-neutral-400 text-xs leading-relaxed font-light">{desc}</p>
  </div>
);

export const TechnicalSpecsSection: React.FC = () => {
  return (
    <section id="tecnica" className="w-full py-20 bg-[#070709] border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(6,182,212,0.03),transparent_50%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono tracking-wider uppercase mb-3">
            <Cpu className="w-3.5 h-3.5" />
            FICHA TÉCNICA
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Consideraciones Técnicas Generales
          </h2>
          <p className="mt-2 text-neutral-400 text-sm max-w-md mx-auto font-light">
            Nuestra infraestructura digital está diseñada bajo los máximos estándares de calidad internacional para música electrónica.
          </p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <TechCard 
            icon={<Music className="w-5 h-5" />}
            title="Audio HD 320 Kbps"
            desc="Stream de audio codificado en MP3/AAC de alta fidelidad, optimizado para equipos de sonido profesionales, parlantes inteligentes y auriculares premium."
          />

          <TechCard 
            icon={<Wifi className="w-5 h-5" />}
            title="Icecast Low Latency"
            desc="Nodos de retransmisión Icecast optimizados que garantizan una latencia de transmisión menor a 1.5 segundos respecto al estudio de aire de la radio."
          />

          <TechCard 
            icon={<Server className="w-5 h-5" />}
            title="Distribución CDN"
            desc="Alojamiento redundante con balanceo de carga continuo. Soporta picos masivos de oyentes simultáneos sin ningún tipo de cortes o pérdida de paquetes."
          />

          <TechCard 
            icon={<Radio className="w-5 h-5" />}
            title="Transmisión Digital En Vivo"
            desc="Planta transmisora digital de alta fidelidad para una óptima cobertura de audio estéreo sin interferencias."
          />

          <TechCard 
            icon={<Zap className="w-5 h-5" />}
            title="Fast Fourier Transform"
            desc="Analizadores FFT integrados en tiempo real en la interfaz del reproductor web, entregando respuestas visuales fluidas sincronizadas al ritmo del audio."
          />

          <TechCard 
            icon={<Laptop className="w-5 h-5" />}
            title="PWA / Compatibilidad"
            desc="Diseño adaptativo PWA compatible con sistemas Android Auto, Apple CarPlay, y navegadores de consolas inteligentes o Smart TVs."
          />

          <TechCard 
            icon={<Shield className="w-5 h-5" />}
            title="Audio Seguro SSL"
            desc="Protocolo cifrado HTTPS integral de punta a punta para el flujo de streaming, evitando interferencias locales o inyecciones externas de paquetes."
          />

          <TechCard 
            icon={<Cpu className="w-5 h-5" />}
            title="Consumo Eficiente"
            desc="Algoritmos de renderizado por GPU mediante Motion/React para animaciones fluidas de 60fps sin sobrecargar la CPU del dispositivo móvil u ordenador."
          />

        </div>

      </div>
    </section>
  );
};
