import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface FlagshipShowData {
  id: string;
  title: string;
  subtitle: string;
  schedule: string;
  day: string;
  desc: string;
  image: string;
  soundcloudLink: string;
  color: string;
  badge: string;
  date?: string; // e.g. "2026-08-15"
  isStarred?: boolean; // ★ Destacado manual
}

export interface ScheduleItemData {
  id: string;
  time: string;
  title: string;
  desc: string;
  image: string;
  soundcloudLink?: string;
}

export interface DjSubmissionData {
  badge: string;
  title: string;
  description: string;
  requirementsTitle: string;
  requirements: string[];
  formTitle: string;
  formDescription: string;
  buttonText: string;
  formUrl: string;
}

export interface SponsorItemData {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string;
  subtext: string;
  active: boolean;
}

export interface SponsorsSectionData {
  active: boolean; // Toggle section ON/OFF
  badge: string;
  title: string;
  description: string;
  bannerBadge: string;
  bannerTitle: string;
  bannerDescription: string;
  whatsappUrl: string;
  email: string;
  sponsors: SponsorItemData[];
}

export interface AboutSectionData {
  tag: string;
  p1: string;
  p2: string;
  p3: string;
  imageUrl: string;
  imageBadgeText: string;
  imageFooterTitle: string;
  imageFooterSub: string;
}

export interface NewsItemData {
  id: string;
  title: string;
  category: 'argentina' | 'lanzamientos';
  badge: string;
  pubDate: string;
  location: string;
  thumbnail: string;
  description: string;
  fullContent: string[];
  readTime: string;
  author: string;
  linkUrl?: string;
}

export interface SiteConfig {
  flagshipShows: FlagshipShowData[];
  schedules: Record<string, ScheduleItemData[]>;
  djSubmission: DjSubmissionData;
  sponsors: SponsorsSectionData;
  about: AboutSectionData;
  news: NewsItemData[];
}

const DEFAULT_FLAGSHIP_SHOWS: FlagshipShowData[] = [
  {
    id: 'galactica',
    title: 'GALACTICA',
    subtitle: 'by Noe Bortolussi',
    schedule: '19:00 - 20:00',
    day: 'Martes',
    badge: 'Radio Show Semanal',
    desc: 'Galactica es el programa de radio semanal de la DJ y Productora Musical Argentina Noe Bortolussi, que explora el Progressive House, la música electrónica underground y los sonidos cinematográficos del club.',
    image: '/10.jpg',
    soundcloudLink: 'https://soundcloud.com/noebortolussi/sets/galactica-radio-show',
    color: 'from-cyan-500/20 via-blue-600/10 to-transparent'
  },
  {
    id: 'el-viaje',
    title: 'EL VIAJE',
    subtitle: 'Podcast Oficial Sónica con Fede Benítez',
    schedule: '21:00 - 23:00',
    day: 'Martes',
    badge: 'Podcast & Guest Set',
    desc: 'Todos los martes de 21 a 23 hs Fede Benítez presenta El Viaje: una experiencia sonora con lo mejor del progressive house, organic house y melodic house. Cada semana, un DJ invitado completa este recorrido musical, un podcast de Sónica Radio.',
    image: '/El Viaje.jpg',
    soundcloudLink: 'https://soundcloud.com/fedebenitezdj/sets/podcast-elviaje',
    color: 'from-blue-600/20 via-indigo-600/10 to-transparent'
  },
  {
    id: 'electronic-pulse',
    title: 'ELECTRONIC PULSE',
    subtitle: 'Radio Show Oficial',
    schedule: '10:00 - 12:00',
    day: 'Jueves',
    badge: 'Radio Show',
    desc: 'Sonidos melódicos y vibrantes para acompañar tu jornada con la mejor selección de música electrónica.',
    image: '/Electronic Pulse.jpg',
    soundcloudLink: 'https://soundcloud.com',
    color: 'from-amber-500/20 via-yellow-600/10 to-transparent'
  }
];

const DEFAULT_IMAGES = {
  sunrise: '/Electronic Pulse.jpg',
  studio: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
  night: 'https://images.unsplash.com/photo-1516280440504-629857904711?q=80&w=800&auto=format&fit=crop',
  space: '/10.jpg',
  journey: '/El Viaje.jpg',
  pulse: '/Electronic Pulse.jpg',
  dj: 'https://images.unsplash.com/photo-1571266028243-cb413d09a56c?q=80&w=800&auto=format&fit=crop',
  guest: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop',
  retro: '/Domingo Retro.jpg',
  indie: '/Sunday Indie Sessions.jpg',
};

export const resolveShowImage = (title: string, currentImg?: string): string => {
  const lower = (title || '').toLowerCase();
  if (lower.includes('viaje')) return '/El Viaje.jpg';
  if (lower.includes('electronic pulse') || lower.includes('pulse')) return '/Electronic Pulse.jpg';
  if (lower.includes('domingo retro') || (lower.includes('retro') && lower.includes('domingo'))) return '/Domingo Retro.jpg';
  if (lower.includes('sunday indie') || lower.includes('indie session') || lower.includes('indie sessions')) return '/Sunday Indie Sessions.jpg';
  return currentImg || '/logo-sonica.png';
};

const DEFAULT_SCHEDULES: Record<string, ScheduleItemData[]> = {
  Lunes: [
    { id: 'l-1', time: '10:00 - 12:00', title: 'ELECTRONIC PULSE', desc: 'Arranque de semana suave y melódico con selecciones de Organic House y Progressive suave.', image: '/Electronic Pulse.jpg' },
    { id: 'l-2', time: '18:00 - 20:00', title: 'AFTER WORK SOUNDS', desc: 'Sets para desconectar del día laboral con beats profundos e hipnóticos.', image: DEFAULT_IMAGES.studio },
    { id: 'l-3', time: '22:00 - 00:00', title: 'DEEP NIGHTS', desc: 'El lado más nocturno y envolvente del progressive house underground.', image: DEFAULT_IMAGES.night }
  ],
  Martes: [
    { id: 'm-1', time: '10:00 - 12:00', title: 'ORGANIC MORNING', desc: 'Sonidos orgánicos y ritmos cálidos para comenzar la mañana con energía positiva.', image: DEFAULT_IMAGES.studio },
    { id: 'm-2', time: '19:00 - 20:00', title: 'GALACTICA by Noe Bortolussi', desc: 'Programa semanal de la DJ Noe Bortolussi con Progressive House y producciones exclusivas.', image: DEFAULT_IMAGES.space, soundcloudLink: 'https://soundcloud.com/noebortolussi/sets/galactica-radio-show' },
    { id: 'm-3', time: '21:00 - 23:00', title: 'EL VIAJE con Fede Benítez', desc: 'Podcast oficial de Sónica con lo mejor del progressive y DJ invitado en la segunda hora.', image: '/El Viaje.jpg', soundcloudLink: 'https://soundcloud.com/fedebenitezdj/sets/podcast-elviaje' }
  ],
  Miércoles: [
    { id: 'mi-1', time: '10:00 - 12:00', title: 'MIDWEEK GROOVES', desc: 'Música ideal para mantener la energía a mitad de semana.', image: DEFAULT_IMAGES.studio },
    { id: 'mi-2', time: '18:00 - 20:00', title: 'WARM UP SESSIONS', desc: 'Sesiones de preparación previa a los lanzamientos del fin de semana.', image: DEFAULT_IMAGES.dj },
    { id: 'mi-3', time: '22:00 - 00:00', title: 'GUEST DJS EXCLUSIVE', desc: 'Espacio dedicado a sets inéditos grabados por DJs nacionales e internacionales.', image: DEFAULT_IMAGES.guest }
  ],
  Jueves: [
    { id: 'j-1', time: '10:00 - 12:00', title: 'ELECTRONIC PULSE', desc: 'Sonidos melódicos y vibrantes para acompañar tu mañana con la mejor selección.', image: '/Electronic Pulse.jpg' },
    { id: 'j-2', time: '19:00 - 21:00', title: 'PRE-FRIDAY VIBES', desc: 'Comenzamos a calentar los motores del fin de semana con beats más intensos.', image: DEFAULT_IMAGES.studio },
    { id: 'j-3', time: '22:00 - 00:00', title: 'UNDERGROUND LAB', desc: 'Investigación sonora y producciones independientes del Progressive House.', image: DEFAULT_IMAGES.night }
  ],
  Viernes: [
    { id: 'v-1', time: '10:00 - 12:00', title: 'ELECTRONIC PULSE', desc: 'Ritmos enérgicos para dar la bienvenida al fin de semana.', image: '/Electronic Pulse.jpg' },
    { id: 'v-2', time: '20:00 - 22:00', title: 'WEEKEND WARRIORS', desc: 'Sets de alta energía, club bangers y progressive festivo.', image: DEFAULT_IMAGES.dj },
    { id: 'v-3', time: '22:00 - 02:00', title: 'SÓNICA CLUB NIGHT', desc: 'Transmisión especial de clubes y festivales en directo.', image: DEFAULT_IMAGES.night }
  ],
  Sábado: [
    { id: 's-1', time: '14:00 - 16:00', title: 'DOMINGO RETRO', desc: 'Los clásicos de la música electrónica que marcaron época.', image: '/Domingo Retro.jpg' },
    { id: 's-2', time: '20:00 - 23:00', title: 'SATURDAY PRIME TIME', desc: 'Lo mejor del Progressive House mundial reunido en una sola franja.', image: DEFAULT_IMAGES.dj },
    { id: 's-3', time: '23:00 - 03:00', title: 'OVERNIGHT SETS', desc: 'Maratón de sets en vivo sin interrupciones.', image: DEFAULT_IMAGES.night }
  ],
  Domingo: [
    { id: 'd-1', time: '11:00 - 14:00', title: 'DOMINGO RETRO', desc: 'Música nostálgica, clásicos retro y joyas inolvidables de la electrónica.', image: '/Domingo Retro.jpg' },
    { id: 'd-2', time: '18:00 - 20:00', title: 'SUNDAY INDIE SESSIONS', desc: 'Música ideal para acompañar la tarde del domingo con beats indie y melódicos.', image: '/Sunday Indie Sessions.jpg' },
    { id: 'd-3', time: '21:00 - 23:00', title: 'ESSENTIAL RECAP', desc: 'Resumen con lo más destacado transmitido durante la semana.', image: DEFAULT_IMAGES.studio }
  ]
};

const DEFAULT_DJ_SUBMISSION: DjSubmissionData = {
  badge: 'INVITACIÓN ABIERTA DJs',
  title: 'Enviá tu set a Sónica',
  description: 'En Sónica recibimos sets exclusivos de DJs y productores apasionados por la música electrónica de calidad. Si tu sonido tiene la identidad que buscamos, puede sonar en nuestra programación.',
  requirementsTitle: 'Requisitos para salir al aire',
  requirements: [
    'Género alineado con la identidad de la radio (Deep House, Progressive, Techno, Ambient, Chillout, Retro o Indie).',
    'Duración, formato y pautas de calidad de audio profesional (320kbps MP3 o WAV).',
    'Completar los datos personales requeridos (nombre artístico, contacto, redes sociales).',
    'Proporcionar un link público y directo a tu set (SoundCloud, Google Drive, Mixcloud, etc.).'
  ],
  formTitle: 'Formulario de Postulación',
  formDescription: 'Ingresá tus datos de contacto, perfiles de redes y el enlace a tu set exclusivo para que nuestro equipo pueda escucharlo.',
  buttonText: 'Completar en Google Forms',
  formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdZMYfn0hA8bdqDO0fEj7AWj2IqWhlgMZrDyE_etEkQeOqPTw/viewform'
};

const DEFAULT_SPONSORS: SponsorsSectionData = {
  active: true, // Enabled by default
  badge: 'ESPACIO PUBLICITARIO DISPONIBLE',
  title: 'Sumá tu marca a Sónica Radio',
  description: 'Hacé que tu marca suene más fuerte, Anunciá en Sónica Radio. Desde Salta al mundo',
  bannerBadge: 'TU MARCA PUEDE ESTAR AQUÍ',
  bannerTitle: 'Anunciá tu empresa o emprendimiento',
  bannerDescription: 'Llegá a miles de oyentes diarios a través de menciones en vivo, spots de audio y banners exclusivos en nuestro sitio web de radio online.',
  whatsappUrl: 'https://wa.me/5493872200098?text=Hola!%20Quiero%20anunciar%20mi%20marca%20en%20Sonica%20Radio.',
  email: 'info@sonicaradio.com.ar',
  sponsors: [
    { id: 'sp-1', name: 'MARCA AUSPICIANTE 1', logoUrl: '/logo-sonica.png', websiteUrl: 'https://wa.me/5493872200098', subtext: 'SPONSOR OFICIAL', active: true },
    { id: 'sp-2', name: 'ESPACIO DISPONIBLE', logoUrl: '/logo-sonica.png', websiteUrl: 'https://wa.me/5493872200098', subtext: 'ANUNCIÁ CON NOSOTROS', active: true }
  ]
};

const DEFAULT_ABOUT: AboutSectionData = {
  tag: 'Bienvenidos a Sónica',
  p1: 'Somos una Radio Online que combina la elegancia con una cuidadosa selección musical. Nuestro género predominante es la Electrónica, pero también podrás disfrutar de otros estilos como Pop, Rock y Clásicos Retro.',
  p2: 'En Sónica Radio, nos apasiona el buen sonido y nos esforzamos por brindarte una experiencia auditiva excepcional. Cada canción es seleccionada cuidadosamente para transportarte a un mundo sonoro único y emocionante.',
  p3: 'Buscamos satisfacer las necesidades de nuestros oyentes y ofrecerles algo distinto a lo que se encuentra en otras radios. Únete a nosotros y descubre la magia de los buenos sonidos.',
  imageUrl: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=1200&auto=format&fit=crop',
  imageBadgeText: 'PROGRESSIVE & ELECTRONIC STUDIO',
  imageFooterTitle: 'Sónica Radio Digital',
  imageFooterSub: 'Radio Online First Class'
};

export const PRESET_NEWS_IMAGES = [
  {
    id: 'preset-1',
    name: 'Atardecer Festival / Sunset',
    url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'preset-2',
    name: 'Show Laser & Luces Club',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'preset-3',
    name: 'Evento Al Aire Libre / Open Air',
    url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'preset-4',
    name: 'Estudio DJ / Sintetizadores',
    url: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'preset-5',
    name: 'Giradiscos & Vinilo Retro',
    url: 'https://images.unsplash.com/photo-1484755560615-a4c647f38997?q=80&w=800&auto=format&fit=crop'
  }
];

export const DEFAULT_NEWS: NewsItemData[] = [
  {
    id: 'news-1',
    title: 'Sunsetstrip 2026: Hernán Cattáneo confirma su regreso al Campo Argentino de Polo',
    category: 'argentina',
    badge: 'EVENTO ARGENTINA',
    pubDate: '26 de Julio, 2026',
    location: 'Buenos Aires, Argentina',
    thumbnail: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800&auto=format&fit=crop',
    description: 'El máximo referente de la música progresiva del país volverá a deleitar a decenas de miles de seguidores con su show de día icónico que se ha convertido en una cita religiosa para la escena.',
    fullContent: [
      'La espera ha terminado para los fanáticos de la música progresiva en Argentina. Hernán Cattáneo, el embajador indiscutido del género, ha anunciado oficialmente la edición 2026 de Sunsetstrip Buenos Aires. Este evento al aire libre, pionero en promover el baile bajo la luz del sol y despedir el atardecer, tendrá lugar en el emblemático Campo Argentino de Polo.',
      'A lo largo de los años, Sunsetstrip ha trascendido la etiqueta de un simple set de DJ para convertirse en una experiencia sensorial y cultural completa. Desde su inicio temprano a la tarde hasta el despliegue del ocaso, la propuesta fusiona visuales de última generación de diseño orgánico, un sistema de sonido impecable y una transición musical milimétrica que solo el maestro Cattáneo puede orquestar.',
      'Como siempre, se espera la participación de talentos nacionales e internacionales del sello discográfico Sudbeat, quienes prepararán la pista antes del set principal de Hernán. Las entradas estarán disponibles en preventa exclusiva a partir de la próxima semana, y se anticipa un Sold Out absoluto en cuestión de horas, tal como ha sucedido en cada una de sus anteriores presentaciones.'
    ],
    readTime: '5 min de lectura',
    author: 'Redacción Sónica',
    linkUrl: 'https://djmag.com/features/hernan-cattaneo-sunsetstrip-buenos-aires'
  },
  {
    id: 'news-2',
    title: 'La magia de Forja: Nick Warren y Mariano Mellino encabezarán un fin de semana histórico en Córdoba',
    category: 'argentina',
    badge: 'EVENTO CÓRDOBA',
    pubDate: '20 de Julio, 2026',
    location: 'Córdoba, Argentina',
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop',
    description: 'El pionero de Bristol y la figura más prestigiosa de la nueva escuela argentina unen fuerzas para una noche colosal en el templo de la música electrónica del país.',
    fullContent: [
      'Córdoba se prepara para ser el centro de atención del Progressive House sudamericano. La mítica locación de Forja, conocida por albergar las producciones de música electrónica más masivas e imponentes del continente, será el escenario de una fecha conjunta que marcará la agenda de este invierno.',
      'Por un lado, la leyenda de Bristol, Nick Warren, traerá la frescura y la mística de su sello The Soundgarden. Por el otro, Mariano Mellino, quien se encuentra en el mejor momento de su carrera global, representará la energía, el groove y la conexión única que tiene el público argentino con sus beats melódicos.',
      'La producción local ha prometido un despliegue audiovisual sin precedentes en Forja, utilizando más de 300 metros cuadrados de pantallas LED y sistemas de sonido de arreglo lineal L-Acoustics para garantizar que cada rincón de la nave industrial vibre con la máxima fidelidad de audio.'
    ],
    readTime: '4 min de lectura',
    author: 'Redacción Sónica',
    linkUrl: 'https://electronicgroove.com/nick-warren-mariano-mellino-cordoba'
  },
  {
    id: 'news-3',
    title: 'Lost & Found llega a los viñedos: Guy J encabeza un showcase sensorial único en Mendoza',
    category: 'argentina',
    badge: 'EVENTO MENDOZA',
    pubDate: '12 de Julio, 2026',
    location: 'Mendoza, Argentina',
    thumbnail: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=800&auto=format&fit=crop',
    description: 'El fundador de Lost & Found llega a la cordillera para guiar una fecha boutique que conectará la naturaleza, el buen vino y el sonido progresivo más hipnótico.',
    fullContent: [
      'El aclamado productor y DJ israelí Guy J, considerado un arquitecto de la melodía en la música electrónica contemporánea, presentará un concepto de evento único en Mendoza. La cita se llevará a cabo en una de las bodegas más prestigiosas de la provincia.',
      'Este formato de showcase al aire libre busca crear una conexión íntima entre la geografía montañosa de Cuyo y el sonido del sello Lost & Found. Con un aforo súper limitado, el evento se perfila como una de las propuestas boutique más esperadas del año por los melómanos más exigentes.'
    ],
    readTime: '4 min de lectura',
    author: 'Redacción Sónica',
    linkUrl: 'https://djmagla.com/guy-j-mendoza-lost-and-found'
  },
  {
    id: 'news-4',
    title: 'Ezequiel Arias debuta su esperado EP \'Dreaming of a Horizon\' en el sello Sudbeat',
    category: 'lanzamientos',
    badge: 'NUEVA MÚSICA',
    pubDate: '08 de Julio, 2026',
    location: 'Córdoba / Sudbeat',
    thumbnail: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=800&auto=format&fit=crop',
    description: 'El talentoso productor cordobés, un pilar ineludible de la nueva ola argentina, entrega una obra maestra melódica bajo la prestigiosa casa discográfica de Hernán Cattáneo.',
    fullContent: [
      'Sudbeat, el estandarte discográfico del Progressive House argentino y mundial, ha revelado su nuevo lanzamiento estrella. El cordobés Ezequiel Arias nos presenta “Dreaming of a Horizon”, un EP compuesto por dos tracks originales que reafirman su madurez y excelencia en el diseño de sonido.',
      'El track principal que da nombre al disco destaca por sus arpegios cristalinos, líneas de bajo profundas que avanzan con un groove firme e hipnótico, y acordes flotantes que transmiten una inmensa emotividad.'
    ],
    readTime: '3 min de lectura',
    author: 'Reseñas Sónica',
    linkUrl: 'https://beatport.com/release/dreaming-of-a-horizon/450012'
  },
  {
    id: 'news-5',
    title: 'The Soundgarden presenta la compilación anual \'Summer Sessions\' compilada por Nick Warren',
    category: 'lanzamientos',
    badge: 'COMPILADOS',
    pubDate: '01 de Julio, 2026',
    location: 'Bristol / The Soundgarden',
    thumbnail: 'https://images.unsplash.com/photo-1484755560615-a4c647f38997?q=80&w=800&auto=format&fit=crop',
    description: 'Un viaje auditivo exquisito de 15 piezas inéditas y exclusivas que capturan la esencia veraniega, el sonido orgánico y el house progresivo de vanguardia.',
    fullContent: [
      'Fiel a su tradición de curaduría de altísimo nivel, Nick Warren ha desvelado la nueva edición de su esperada compilación de verano para su sello The Soundgarden.',
      'Con un enfoque en el progressive orgánico, melódico y downtempo de alta gama, la compilación incluye producciones de artistas consolidados e introduce nuevas promesas de la escena.'
    ],
    readTime: '3 min de lectura',
    author: 'Reseñas Sónica',
    linkUrl: 'https://thesoundgarden.bandcamp.com'
  }
];

const STORAGE_KEY = 'sonica_site_config_v3';

interface AdminContextType {
  config: SiteConfig;
  updateConfig: (newConfig: Partial<SiteConfig>, keysChanged?: (keyof SiteConfig)[]) => void;
  resetConfig: () => void;
  isCloudSynced: boolean;
  quotaExceeded: boolean;
  lastCloudSync: string | null;
  autoRefreshNews: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem('sonica_site_config_v3') || 
                    localStorage.getItem('sonica_site_config_v2') || 
                    localStorage.getItem('sonica_site_config_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          flagshipShows: parsed.flagshipShows || DEFAULT_FLAGSHIP_SHOWS,
          schedules: parsed.schedules || DEFAULT_SCHEDULES,
          djSubmission: parsed.djSubmission || DEFAULT_DJ_SUBMISSION,
          sponsors: parsed.sponsors || DEFAULT_SPONSORS,
          about: parsed.about || DEFAULT_ABOUT,
          news: parsed.news || DEFAULT_NEWS,
        };
      }
    } catch (e) {
      console.error("Error loading saved site config:", e);
    }
    return {
      flagshipShows: DEFAULT_FLAGSHIP_SHOWS,
      schedules: DEFAULT_SCHEDULES,
      djSubmission: DEFAULT_DJ_SUBMISSION,
      sponsors: DEFAULT_SPONSORS,
      about: DEFAULT_ABOUT,
      news: DEFAULT_NEWS,
    };
  });

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);
  const [lastCloudSync, setLastCloudSync] = useState<string | null>(null);

  // Modular Firestore listeners for each section to prevent 1MB payload limits
  useEffect(() => {
    const unsubscribes: Array<() => void> = [];

    const markSynced = () => {
      setIsCloudSynced(true);
      setLastCloudSync(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };

    // 1. Flagship shows
    const unsubFlagship = onSnapshot(doc(db, 'site_config', 'flagship'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().items) {
        setConfig(prev => {
          const updated = { ...prev, flagshipShows: docSnap.data().items };
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
          return updated;
        });
        markSynced();
      }
    }, (err) => console.warn("Firestore flagship sync error:", err));
    unsubscribes.push(unsubFlagship);

    // 2. Full Schedules document listener
    const unsubSchedules = onSnapshot(doc(db, 'site_config', 'schedules'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().data) {
        const cloudSchedules = docSnap.data().data;
        setConfig(prev => {
          const merged = { ...prev.schedules, ...cloudSchedules };
          const updated = { ...prev, schedules: merged };
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
          return updated;
        });
        markSynced();
      }
    }, (err) => console.warn("Firestore schedules sync error:", err));
    unsubscribes.push(unsubSchedules);

    // 3. Per-day Schedules listeners (overrides specific days if modular docs exist)
    const scheduleDaysList = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    scheduleDaysList.forEach(day => {
      const unsubDay = onSnapshot(doc(db, 'site_config', `schedule_${day}`), (docSnap) => {
        if (docSnap.exists() && docSnap.data().items) {
          setConfig(prev => {
            const updatedSchedules = {
              ...(prev.schedules || {}),
              [day]: docSnap.data().items
            };
            const updated = { ...prev, schedules: updatedSchedules };
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
            return updated;
          });
          markSynced();
        }
      }, (err) => console.warn(`Firestore schedule_${day} sync error:`, err));
      unsubscribes.push(unsubDay);
    });

    // 3. Sponsors
    const unsubSponsors = onSnapshot(doc(db, 'site_config', 'sponsors'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().data) {
        const spData = docSnap.data().data;
        if (spData.description && (spData.description.includes('94.3') || spData.description.includes('FM'))) {
          spData.description = 'Hacé que tu marca suene más fuerte, Anunciá en Sónica Radio. Desde Salta al mundo';
        }
        setConfig(prev => {
          const updated = { ...prev, sponsors: spData };
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
          return updated;
        });
        markSynced();
      }
    }, (err) => console.warn("Firestore sponsors sync error:", err));
    unsubscribes.push(unsubSponsors);

    // 4. About
    const unsubAbout = onSnapshot(doc(db, 'site_config', 'about'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().data) {
        setConfig(prev => {
          const updated = { ...prev, about: docSnap.data().data };
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
          return updated;
        });
        markSynced();
      }
    }, (err) => console.warn("Firestore about sync error:", err));
    unsubscribes.push(unsubAbout);

    // 5. News (Direct persistent sync without automated overwrites)
    const unsubNews = onSnapshot(doc(db, 'site_config', 'news'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().items) {
        const newsItems = docSnap.data().items as NewsItemData[];
        
        setConfig(prev => {
          const updated = { ...prev, news: newsItems };
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
          return updated;
        });
        markSynced();
      }
    }, (err) => console.warn("Firestore news sync error:", err));
    unsubscribes.push(unsubNews);

    // 6. DJ Submission
    const unsubDj = onSnapshot(doc(db, 'site_config', 'djSubmission'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().data) {
        setConfig(prev => {
          const updated = { ...prev, djSubmission: docSnap.data().data };
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
          return updated;
        });
        markSynced();
      }
    }, (err) => console.warn("Firestore djSubmission sync error:", err));
    unsubscribes.push(unsubDj);

    // 7. Legacy main fallback check (only run if modular documents do not exist)
    const unsubMain = onSnapshot(doc(db, 'site_config', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<SiteConfig>;
        setConfig(prev => {
          // Only use main data for sections that have not been populated yet
          const merged: SiteConfig = {
            flagshipShows: prev.flagshipShows?.length ? prev.flagshipShows : (data.flagshipShows || DEFAULT_FLAGSHIP_SHOWS),
            schedules: Object.keys(prev.schedules || {}).length ? prev.schedules : (data.schedules || DEFAULT_SCHEDULES),
            djSubmission: prev.djSubmission?.buttonText ? prev.djSubmission : (data.djSubmission || DEFAULT_DJ_SUBMISSION),
            sponsors: prev.sponsors?.title ? prev.sponsors : (data.sponsors || DEFAULT_SPONSORS),
            about: prev.about?.p1 ? prev.about : (data.about || DEFAULT_ABOUT),
            news: prev.news?.length ? prev.news : (data.news || DEFAULT_NEWS),
          };
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch {}
          return merged;
        });
        markSynced();
      }
    }, (err) => console.warn("Firestore main sync error:", err));
    unsubscribes.push(unsubMain);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  // Helper to refresh news publication dates for automated weekly freshness
  const refreshNewsDatesAndSave = async (currentNews: NewsItemData[]) => {
    const today = new Date();
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const updatedNews = currentNews.map((item, index) => {
      const offsetDays = index * 3;
      const d = new Date(today.getTime() - offsetDays * 24 * 60 * 60 * 1000);
      const formattedDate = `${d.getDate()} de ${months[d.getMonth()]}, ${d.getFullYear()}`;
      return {
        ...item,
        pubDate: formattedDate
      };
    });

    try {
      await setDoc(doc(db, 'site_config', 'news'), {
        items: updatedNews,
        lastAutoUpdate: Date.now()
      });
    } catch (e) {
      console.error("Error auto-updating news dates in Firestore:", e);
    }
  };

  const autoRefreshNews = () => {
    refreshNewsDatesAndSave(config.news);
  };

  // Modular Save: Writes only modified sections or all sections to Firestore
  const saveToFirestoreAndLocal = async (updatedConfig: SiteConfig, keysChanged?: (keyof SiteConfig)[]) => {
    setConfig(updatedConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }

    const scheduleDaysList = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const promises: Promise<any>[] = [];

    // Determine which sections need updating
    const keys = keysChanged && keysChanged.length > 0
      ? keysChanged 
      : ['schedules', 'flagshipShows', 'sponsors', 'about', 'news', 'djSubmission'];

    if (keys.includes('schedules')) {
      scheduleDaysList.forEach(day => {
        promises.push(
          setDoc(doc(db, 'site_config', `schedule_${day}`), { 
            items: updatedConfig.schedules?.[day] || [] 
          })
        );
      });
      promises.push(setDoc(doc(db, 'site_config', 'schedules'), { data: updatedConfig.schedules }));
    }

    if (keys.includes('flagshipShows')) {
      promises.push(setDoc(doc(db, 'site_config', 'flagship'), { items: updatedConfig.flagshipShows }));
    }
    if (keys.includes('sponsors')) {
      promises.push(setDoc(doc(db, 'site_config', 'sponsors'), { data: updatedConfig.sponsors }));
    }
    if (keys.includes('about')) {
      promises.push(setDoc(doc(db, 'site_config', 'about'), { data: updatedConfig.about }));
    }
    if (keys.includes('news')) {
      promises.push(setDoc(doc(db, 'site_config', 'news'), { items: updatedConfig.news, lastAutoUpdate: Date.now() }));
    }
    if (keys.includes('djSubmission')) {
      promises.push(setDoc(doc(db, 'site_config', 'djSubmission'), { data: updatedConfig.djSubmission }));
    }

    try {
      const results = await Promise.allSettled(promises);
      const rejected = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
      
      if (rejected.length > 0) {
        const errorMsgs = rejected.map(r => String(r.reason)).join(' ');
        const isQuota = errorMsgs.includes('resource-exhausted') || errorMsgs.includes('Quota limit exceeded');
        
        if (isQuota) {
          setQuotaExceeded(true);
          console.warn("⚠️ Firebase quota limit reached. Changes saved locally.");
        } else {
          console.warn("⚠️ Firestore write warning:", errorMsgs);
        }
        setIsCloudSynced(false);
      } else {
        setQuotaExceeded(false);
        setIsCloudSynced(true);
        setLastCloudSync(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (e) {
      console.error("Error writing modular site config to Firestore:", e);
      setIsCloudSynced(false);
    }
  };

  const updateConfig = (newConfig: Partial<SiteConfig>, keysChanged?: (keyof SiteConfig)[]) => {
    const keys = keysChanged || (Object.keys(newConfig) as (keyof SiteConfig)[]);
    const updated = { ...config, ...newConfig };
    saveToFirestoreAndLocal(updated, keys);
  };

  const resetConfig = () => {
    const defaultConfig: SiteConfig = {
      flagshipShows: DEFAULT_FLAGSHIP_SHOWS,
      schedules: DEFAULT_SCHEDULES,
      djSubmission: DEFAULT_DJ_SUBMISSION,
      sponsors: DEFAULT_SPONSORS,
      about: DEFAULT_ABOUT,
      news: DEFAULT_NEWS,
    };
    saveToFirestoreAndLocal(defaultConfig);
  };

  return (
    <AdminContext.Provider value={{ 
      config, 
      updateConfig, 
      resetConfig, 
      isCloudSynced, 
      quotaExceeded,
      lastCloudSync, 
      autoRefreshNews 
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminProvider');
  }
  return context;
};
