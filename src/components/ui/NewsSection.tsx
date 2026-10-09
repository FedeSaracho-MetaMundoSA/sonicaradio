import React, { useState } from 'react';
import { 
  Rss, 
  Clock, 
  MapPin, 
  BookOpen, 
  X, 
  Share2, 
  Radio, 
  ArrowRight, 
  Check,
  Music,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminData, NewsItemData } from '../../context/AdminDataContext';

const NEWS_DATA: NewsItemData[] = [
  {
    id: 'news-1',
    title: 'Sunsetstrip 2026: Hernán Cattáneo confirma su regreso al Campo Argentino de Polo',
    category: 'argentina',
    badge: 'EVENTO ARGENTINA',
    pubDate: '26 de Julio, 2026',
    location: 'Buenos Aires, Argentina',
    thumbnail: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800&auto=format&fit=crop', // Sunset golden hour festival crowd silhouette
    description: 'El máximo referente de la música progresiva del país volverá a deleitar a decenas de miles de seguidores con su show de día icónico que se ha convertido en una cita religiosa para la escena.',
    fullContent: [
      'La espera ha terminado para los fanáticos de la música progresiva en Argentina. Hernán Cattáneo, el embajador indiscutido del género, ha anunciado oficialmente la edición 2026 de Sunsetstrip Buenos Aires. Este evento al aire libre, pionero en promover el baile bajo la luz del sol y despedir el atardecer, tendrá lugar en el emblemático Campo Argentino de Polo.',
      'A lo largo de los años, Sunsetstrip ha trascendido la etiqueta de un simple set de DJ para convertirse en una experiencia sensorial y cultural completa. Desde su inicio temprano a la tarde hasta el despliegue del ocaso, la propuesta fusiona visuales de última generación de diseño orgánico, un sistema de sonido impecable y una transición musical milimétrica que solo el maestro Cattáneo puede orquestar.',
      'Como siempre, se espera la participación de talentos nacionales e internacionales del sello discográfico Sudbeat, quienes prepararán la pista antes del set principal de Hernán. Las entradas estarán disponibles en preventa exclusiva a partir de la próxima semana, y se anticipa un Sold Out absoluto en cuestión de horas, tal como ha sucedido en cada una de sus anteriores presentaciones.'
    ],
    readTime: '5 min de lectura',
    author: 'Redacción Sónica',
  },
  {
    id: 'news-2',
    title: 'La magia de Forja: Nick Warren y Mariano Mellino encabezarán un fin de semana histórico en Córdoba',
    category: 'argentina',
    badge: 'EVENTO CÓRDOBA',
    pubDate: '20 de Julio, 2026',
    location: 'Córdoba, Argentina',
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop', // Laser lights in venue
    description: 'El pionero de Bristol y la figura más prestigiosa de la nueva escuela argentina unen fuerzas para una noche colosal en el templo de la música electrónica del país.',
    fullContent: [
      'Córdoba se prepara para ser el centro de atención del Progressive House sudamericano. La mítica locación de Forja, conocida por albergar las producciones de música electrónica más masivas e imponentes del continente, será el escenario de una fecha conjunta que marcará la agenda de este invierno.',
      'Por un lado, la leyenda de Bristol, Nick Warren, traerá la frescura y la mística de su sello The Soundgarden. Por el otro, Mariano Mellino, quien se encuentra en el mejor momento de su carrera global, representará la energía, el groove y la conexión única que tiene el público argentino con sus beats melódicos.',
      'La producción local ha prometido un despliegue audiovisual sin precedentes en Forja, utilizando más de 300 metros cuadrados de pantallas LED y sistemas de sonido de arreglo lineal L-Acoustics para garantizar que cada rincón de la nave industrial vibre con la máxima fidelidad de audio. Las mentes maestras prometen un set de larga duración de Warren que transicionará por texturas espaciales y progresivas puras.'
    ],
    readTime: '4 min de lectura',
    author: 'Redacción Sónica',
  },
  {
    id: 'news-3',
    title: 'Lost & Found llega a los viñedos: Guy J encabeza un showcase sensorial único en Mendoza',
    category: 'argentina',
    badge: 'EVENTO MENDOZA',
    pubDate: '12 de Julio, 2026',
    location: 'Mendoza, Argentina',
    thumbnail: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=800&auto=format&fit=crop', // Open air sunset event
    description: 'El fundador de Lost & Found llega a la cordillera para guiar una fecha boutique que conectará la naturaleza, el buen vino y el sonido progresivo más hipnótico.',
    fullContent: [
      'El aclamado productor y DJ israelí Guy J, considerado un arquitecto de la melodía en la música electrónica contemporánea, presentará un concepto de evento único en Mendoza. La cita se llevará a cabo en una de las bodegas más prestigiosas de la provincia, fusionando los mejores varietales locales con su característica propuesta musical de ritmos envolventes.',
      'Este formato de showcase al aire libre busca crear una conexión íntima entre la geografía montañosa de Cuyo y el sonido del sello Lost & Found. Con un aforo súper limitado, el evento se perfila como una de las propuestas boutique más esperadas del año por los melómanos más exigentes.',
      '“Mendoza siempre tiene una energía muy pura”, comentó el artista. “Poder tocar mis producciones rodeado de viñedos y con la cordillera de fondo es un sueño hecho realidad. Prepararé un set de 5 horas que acompañará la caída del sol y la llegada de la noche cuyana”. Un viaje de pura hipnosis y texturas de sintetizadores orgánicos.'
    ],
    readTime: '4 min de lectura',
    author: 'Redacción Sónica',
  },
  {
    id: 'news-4',
    title: 'Ezequiel Arias debuta su esperado EP \'Dreaming of a Horizon\' en el sello Sudbeat',
    category: 'lanzamientos',
    badge: 'NUEVA MÚSICA',
    pubDate: '08 de Julio, 2026',
    location: 'Córdoba / Sudbeat',
    thumbnail: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=800&auto=format&fit=crop', // Studio environment warm light
    description: 'El talentoso productor cordobés, un pilar ineludible de la nueva ola argentina, entrega una obra maestra melódica bajo la prestigiosa casa discográfica de Hernán Cattáneo.',
    fullContent: [
      'Sudbeat, el estandarte discográfico del Progressive House argentino y mundial, ha revelado su nuevo lanzamiento estrella. El cordobés Ezequiel Arias nos presenta “Dreaming of a Horizon”, un EP compuesto por dos tracks originales que reafirman su madurez y excelencia en el diseño de sonido.',
      'El track principal que da nombre al disco destaca por sus arpegios cristalinos, líneas de bajo profundas que avanzan con un groove firme e hipnótico, y acordes flotantes que transmiten una inmensa emotividad. El segundo track, “Mirage”, explora sonidos un poco más oscuros y bailables, perfectos para los momentos cúspide de las sesiones en clubes.',
      'El EP ya cuenta con el apoyo de las mayores luminarias globales del género y promete colocarse rápidamente en el tope de las listas de ventas de plataformas especializadas como Beatport. Ezequiel Arias continúa su imparable ascenso, demostrando por qué es uno de los compositores más respetados y con mayor proyección internacional.'
    ],
    readTime: '3 min de lectura',
    author: 'Reseñas Sónica',
  },
  {
    id: 'news-5',
    title: 'The Soundgarden presenta la compilación anual \'Summer Sessions\' compilada por Nick Warren',
    category: 'lanzamientos',
    badge: 'COMPILADOS',
    pubDate: '01 de Julio, 2026',
    location: 'Bristol / The Soundgarden',
    thumbnail: 'https://images.unsplash.com/photo-1484755560615-a4c647f38997?q=80&w=800&auto=format&fit=crop', // Vinyl record turntable detail
    description: 'Un viaje auditivo exquisito de 15 piezas inéditas y exclusivas que capturan la esencia veraniega, el sonido orgánico y el house progresivo de vanguardia.',
    fullContent: [
      'Fiel a su tradición de curaduría de altísimo nivel, Nick Warren ha desvelado la nueva edición de su esperada compilación de verano para su sello The Soundgarden. En esta ocasión, el pionero inglés reúne a talentos de diversos rincones del planeta para moldear una narrativa musical fluida y cargada de optimismo.',
      'Con un enfoque en el progressive orgánico, melódico y downtempo de alta gama, la compilación incluye producciones de artistas consolidados e introduce nuevas promesas de la escena. Los tracks transicionan con una sutileza asombrosa, ideales tanto para acompañar un atardecer relajado frente al mar como para ambientar pistas íntimas bajo las estrellas.',
      'Nick Warren ha sabido mantener a The Soundgarden a la vanguardia de la música electrónica orgánica. “Summer Sessions” no es solo un compilado de música, sino un diario de viaje sonoro que invita a desconectarse y dejarse llevar por paisajes melódicos reconfortantes.'
    ],
    readTime: '3 min de lectura',
    author: 'Reseñas Sónica',
  },
  {
    id: 'news-6',
    title: 'Simon Vuarambon deslumbra a la escena con su hipnótico EP \'Nostalgia de Luz\'',
    category: 'lanzamientos',
    badge: 'RECOMENDADO SÓNICA',
    pubDate: '25 de Junio, 2026',
    location: 'Buenos Aires / All Day I Dream',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop', // Modular synth patch wires warm tone
    description: 'Con el respaldo inmediato de los mayores exponentes internacionales, el productor argentino vuelve a demostrar por qué es considerado un maestro de las texturas profundas.',
    fullContent: [
      'El aclamado productor Simon Vuarambon regresa a la escena discográfica con un EP que roza la perfección acústica. Titulado “Nostalgia de Luz”, el lanzamiento está compuesto por tres cortes de carácter profundo, melancólico e increíblemente refinado.',
      'Conocido por su enfoque detallista y minimalista, Simon elabora paisajes sonoros donde cada elemento tiene espacio para respirar. En este lanzamiento, las sutiles percusiones de madera y las texturas de sintetizadores analógicos evocan una atmósfera cinematográfica y evocadora, característica del sello All Day I Dream de Lee Burridge, donde el artista suele ser un invitado recurrente.',
      'La crítica especializada ya ha catalogado este EP como una de las obras cumbres del año en la vertiente profunda y melódica del house progresivo. Un trabajo que confirma el tremendo nivel técnico y el extraordinario gusto musical que reside en el talento argentino.'
    ],
    readTime: '3 min de lectura',
    author: 'Reseñas Sónica',
  }
];

export const NewsSection: React.FC = () => {
  const { config } = useAdminData();
  const newsList = config.news && config.news.length > 0 ? config.news : NEWS_DATA;

  const [filter, setFilter] = useState<'all' | 'argentina' | 'lanzamientos'>('all');
  const [selectedNews, setSelectedNews] = useState<NewsItemData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredNews = newsList.filter(item => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  const handleShare = (news: NewsItemData) => {
    const text = `Leé "${news.title}" en Sónica Radio Web`;
    const url = window.location.href;
    
    // Copy to clipboard fallback
    navigator.clipboard.writeText(`${text} - ${url}`);
    setCopiedId(news.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="novedades" className="py-24 bg-[#050507] min-h-screen relative overflow-hidden">
      {/* Decorative Blur Background Elements */}
      <div className="absolute top-[20%] left-1/4 w-96 h-96 bg-cyan-950/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[25%] right-1/4 w-[500px] h-[500px] bg-blue-950/15 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-4">
            <Rss className="w-3.5 h-3.5" />
            ESCENA PROGRESSIVE HOUSE
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
            Novedades & Lanzamientos
          </h2>
          <p className="text-base md:text-lg text-white/50 leading-relaxed font-light">
            Descubrí las últimas noticias, lanzamientos discográficos de culto y la cobertura completa de los mejores eventos de progressive house en Argentina.
          </p>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-12 border-b border-white/5 pb-4 justify-start md:justify-center">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-mono tracking-widest uppercase border transition-all duration-300 ${
              filter === 'all'
                ? 'bg-cyan-500 text-black border-cyan-500 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-[#111216] text-white/60 border-white/5 hover:text-white hover:border-white/15'
            }`}
          >
            Todas las Noticias
          </button>
          <button
            onClick={() => setFilter('argentina')}
            className={`px-5 py-2.5 rounded-full text-xs font-mono tracking-widest uppercase border transition-all duration-300 flex items-center gap-1.5 ${
              filter === 'argentina'
                ? 'bg-cyan-500 text-black border-cyan-500 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-[#111216] text-white/60 border-white/5 hover:text-white hover:border-white/15'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Eventos Argentina
          </button>
          <button
            onClick={() => setFilter('lanzamientos')}
            className={`px-5 py-2.5 rounded-full text-xs font-mono tracking-widest uppercase border transition-all duration-300 flex items-center gap-1.5 ${
              filter === 'lanzamientos'
                ? 'bg-cyan-500 text-black border-cyan-500 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-[#111216] text-white/60 border-white/5 hover:text-white hover:border-white/15'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Lanzamientos & Música
          </button>
        </div>

        {/* News Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredNews.map((item) => (
              <motion.article
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                key={item.id}
                onClick={() => setSelectedNews(item)}
                className="group cursor-pointer flex flex-col bg-gradient-to-b from-[#111216] to-[#0a0b0d] rounded-2xl overflow-hidden border border-white/5 hover:border-cyan-500/40 transition-all duration-500 hover:shadow-[0_15px_30px_rgba(6,182,212,0.08)] hover:-translate-y-1.5"
              >
                {/* Thumbnail image container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-black shrink-0">
                  <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/logo-sonica.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-black/65 backdrop-blur-md text-cyan-400 border border-cyan-500/20 font-mono font-bold text-[9px] tracking-wider px-2.5 py-1 rounded-md">
                    {item.badge}
                  </div>
                </div>

                {/* Card Body content */}
                <div className="p-6 flex flex-col flex-1 justify-between min-h-[220px]">
                  <div>
                    {/* Metadata Header */}
                    <div className="flex items-center gap-4 text-white/40 text-xs font-mono mb-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400/70" />
                        <span>{item.pubDate}</span>
                      </div>
                      {item.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400/50" />
                          <span className="truncate max-w-[120px]">{item.location}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-white font-bold text-lg leading-snug group-hover:text-cyan-400 transition-colors duration-300 mb-3 line-clamp-3">
                      {item.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed font-light line-clamp-3 mb-4">
                      {item.description}
                    </p>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <span className="text-[11px] font-mono font-bold text-cyan-400/80 group-hover:text-cyan-300 flex items-center gap-1.5 transition-colors">
                      <BookOpen className="w-3.5 h-3.5" />
                      Leer Artículo
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-white/30 text-[10px] font-mono">
                      {item.readTime}
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ARTICLE READER MODAL OVERLAY */}
      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNews(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-4xl bg-[#0e1013] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col"
            >
              {/* Close Button floating */}
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/60 border border-white/10 text-white/80 hover:text-white hover:bg-black/90 hover:scale-105 transition-all flex items-center justify-center"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Scrollable content container */}
              <div className="overflow-y-auto flex-1 hide-scrollbar">
                
                {/* Hero Banner inside Modal */}
                <div className="relative aspect-[21/9] w-full bg-black overflow-hidden">
                  <img 
                    src={selectedNews.thumbnail} 
                    alt={selectedNews.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/logo-sonica.png";
                      e.currentTarget.className = "w-1/4 h-1/4 m-auto object-contain opacity-55";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e1013] via-[#0e1013]/30 to-transparent" />
                  
                  {/* Category floating badge */}
                  <div className="absolute bottom-6 left-6 md:left-10 bg-cyan-500 text-black font-mono font-bold text-[10px] tracking-widest px-3 py-1.5 rounded-md shadow-lg">
                    {selectedNews.badge}
                  </div>
                </div>

                {/* Content body */}
                <div className="px-6 md:px-10 py-8">
                  
                  {/* Header Metadata */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/40 text-xs font-mono mb-6 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span>{selectedNews.pubDate}</span>
                    </div>
                    {selectedNews.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span>{selectedNews.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/20">|</span>
                      <span>Por: {selectedNews.author}</span>
                    </div>
                    <div className="ml-auto text-cyan-400/80">
                      <span>{selectedNews.readTime}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-6 tracking-tight">
                    {selectedNews.title}
                  </h1>

                  {/* Article description as abstract */}
                  <p className="text-white/80 text-base md:text-lg font-light leading-relaxed mb-6 border-l-2 border-cyan-500 pl-4 italic">
                    {selectedNews.description}
                  </p>

                  {/* Detailed paragraphs */}
                  <div className="space-y-5 text-white/60 text-sm md:text-base font-light leading-relaxed mb-10">
                    {selectedNews.fullContent.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Interactive Action Bar inside modal */}
                  <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row flex-wrap gap-3 items-center justify-between">
                    
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      {/* Share Button copy to clipboard */}
                      <button
                        onClick={() => handleShare(selectedNews)}
                        className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 w-full sm:w-auto justify-center cursor-pointer ${
                          copiedId === selectedNews.id
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                        }`}
                      >
                        {copiedId === selectedNews.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            ¡Copiado al Portapapeles!
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4" />
                            Compartir Noticia
                          </>
                        )}
                      </button>

                      {/* Original Link Button if available */}
                      {selectedNews.linkUrl && selectedNews.linkUrl.startsWith('http') && (
                        <a
                          href={selectedNews.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 w-full sm:w-auto justify-center bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Ver Fuente / Nota Original
                        </a>
                      )}
                    </div>

                    {/* Radio CTA Tune-in */}
                    <a
                      href="#home"
                      onClick={() => setSelectedNews(null)}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 w-full sm:w-auto justify-center"
                    >
                      <Radio className="w-4 h-4" />
                      Escuchar Sónica Online en Vivo
                    </a>
                  </div>

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
