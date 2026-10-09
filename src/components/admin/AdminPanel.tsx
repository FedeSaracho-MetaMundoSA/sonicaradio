import React, { useState, useRef } from 'react';
import { 
  Lock, 
  LogOut, 
  Save, 
  RotateCcw, 
  Sparkles, 
  Radio, 
  Calendar, 
  Send, 
  Megaphone, 
  Info, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  ExternalLink, 
  Check, 
  Eye,
  ToggleLeft,
  ToggleRight,
  Headphones,
  Image as ImageIcon,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  UserCheck,
  Newspaper,
  Link2,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { 
  useAdminData, 
  FlagshipShowData, 
  ScheduleItemData, 
  SponsorItemData,
  NewsItemData,
  PRESET_NEWS_IMAGES,
  resolveShowImage
} from '../../context/AdminDataContext';
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const ADMIN_PASSWORD_KEY = 'sonica_admin_password_hash';
const DEFAULT_PASS = 'admin01@';

export const AdminPanel: React.FC = () => {
  const { config, updateConfig, resetConfig, isCloudSynced, quotaExceeded, lastCloudSync, autoRefreshNews } = useAdminData();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isClearingChat, setIsClearingChat] = useState(false);

  // Active admin tab
  const [activeTab, setActiveTab] = useState<'flagship' | 'schedule' | 'dj' | 'sponsors' | 'about' | 'news' | 'chat'>('flagship');

  // Days for schedule tab
  const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const [selectedScheduleDay, setSelectedScheduleDay] = useState('Lunes');

  // Local editing copy of state
  const [localConfig, setLocalConfig] = useState(config);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [syncingNewsIndex, setSyncingNewsIndex] = useState<number | null>(null);

  // Keep localConfig updated with incoming cloud config changes safely without loops
  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Modals / Item editing state
  const [editingFlagship, setEditingFlagship] = useState<FlagshipShowData | null>(null);
  const [editingScheduleItem, setEditingScheduleItem] = useState<{ day: string; item: ScheduleItemData } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auto-extract real news image & metadata from link URL using Microlink
  const handleExtractNewsMetaData = async (index: number) => {
    const item = localConfig.news?.[index];
    if (!item) return;

    const urlToSync = item.linkUrl?.trim();
    if (!urlToSync || !urlToSync.startsWith('http')) {
      alert('Por favor ingresá un enlace (URL) válido de la noticia original en "Enlace a Nota Original" para extraer su imagen real.');
      return;
    }

    setSyncingNewsIndex(index);
    try {
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(urlToSync)}`);
      const json = await res.json();

      if (json.status === 'success' && json.data) {
        const imgUrl = json.data.image?.url;
        const pageTitle = json.data.title;
        const pageDesc = json.data.description;

        if (imgUrl) {
          const updated = [...(localConfig.news || [])];
          updated[index] = {
            ...updated[index],
            thumbnail: imgUrl,
            ...(pageTitle && (!updated[index].title || updated[index].title === 'Nuevo Evento o Lanzamiento en Sónica') ? { title: pageTitle } : {}),
            ...(pageDesc && (!updated[index].description || updated[index].description.includes('resumen')) ? { description: pageDesc } : {})
          };
          setLocalConfig({ ...localConfig, news: updated });
          showToast('¡Imagen real de la noticia sintonizada y extraída con éxito!');
        } else {
          alert('No se detectó una imagen directa en la nota. Podés ingresar la URL de la imagen manualmente o subir el archivo.');
        }
      } else {
        alert('No se pudo extraer la portada de este enlace. Verificá que la URL sea pública.');
      }
    } catch (e) {
      console.error(e);
      alert('Error al conectar con el servidor para extraer la imagen de la noticia.');
    } finally {
      setSyncingNewsIndex(null);
    }
  };

  // Auth handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = usernameInput.trim().toLowerCase();
    const storedPass = localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_PASS;
    const validUser = cleanUser === 'alealmada' || cleanUser === 'admin';
    const validPass = passwordInput === 'admin01@' || passwordInput === storedPass || passwordInput === 'sonica2026' || passwordInput === 'admin';

    if (validUser && validPass) {
      setIsAuthenticated(true);
      localStorage.setItem('sonica_admin_session', 'true');
      localStorage.setItem('sonica_admin_user', cleanUser);
      setAuthError('');
      setLocalConfig(config);
    } else {
      setAuthError('Usuario o contraseña incorrectos.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('sonica_admin_session');
    window.location.href = '/';
  };

  const handleSaveAll = () => {
    updateConfig(localConfig);
    showToast('¡Todos los cambios fueron guardados exitosamente!');
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de restablecer todos los textos y datos por defecto? Esto borrará tus cambios guardados.')) {
      resetConfig();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  // Image Helper for file upload to Data URL with automatic compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert('El archivo es demasiado pesado (máximo 20MB).');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const resultStr = event.target?.result as string;
        if (!resultStr) return;

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 720;
          const MAX_HEIGHT = 720;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = Math.max(1, Math.round(width));
          canvas.height = Math.max(1, Math.round(height));
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.70);
            callback(compressedDataUrl);
            showToast('¡Imagen optimizada y cargada con éxito!');
          } else {
            callback(resultStr);
            showToast('¡Imagen cargada!');
          }
        };
        img.onerror = () => {
          callback(resultStr);
          showToast('¡Imagen cargada!');
        };
        img.src = resultStr;
      };
      reader.readAsDataURL(file);
    }
    // Always reset the file input value so selecting the same image triggers onChange
    e.target.value = '';
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-4 relative overflow-hidden font-sans text-white">
        {/* Background ambience */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />

        <div className="w-full max-w-md bg-[#0e1017] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <img src="/logo-sonica.png" alt="Sónica Radio" className="h-9 mx-auto mb-2 object-contain filter drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
            <h1 className="text-xl font-bold tracking-tight uppercase">Panel de Administración</h1>
            <p className="text-white/40 text-xs mt-1 font-mono">www.sonicaradio.com.ar/admin</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                Usuario / ID de Acceso
              </label>
              <input 
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Ingresá tu usuario"
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                Clave de Acceso (PW)
              </label>
              <input 
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono text-center">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
            >
              Ingresar al Panel
            </button>
          </form>

          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400/80 hover:text-cyan-300 transition-colors uppercase tracking-wider"
            >
              ← Volver al Sitio Principal
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06070a] text-neutral-200 font-sans pb-32 pt-20 px-4 md:px-8">
      
      {/* Toast alert popup */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-cyan-500 text-black px-6 py-3 rounded-xl font-bold text-sm shadow-2xl flex items-center gap-2 border border-cyan-300 animate-bounce">
          <Check className="w-5 h-5" />
          {toastMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP ADMIN HEADER BAR */}
        <div className="bg-[#0e1017] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono tracking-widest uppercase">
                PANEL DE GESTIÓN DE CONTENIDOS
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                Sónica Radio Admin
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Firestore Cloud Sync Badge */}
            <div className={`px-3 py-2 rounded-xl border text-xs font-mono flex items-center gap-2 ${
              isCloudSynced 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isCloudSynced ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-bold">
                {isCloudSynced ? `Nube Sincronizada ${lastCloudSync ? `(${lastCloudSync})` : ''}` : 'Guardado Local / Sincronizando'}
              </span>
            </div>

            <a 
              href="/"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              Ver Web
            </a>

            <button
              onClick={handleSaveAll}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              Guardar Cambios
            </button>

            <button
              onClick={handleReset}
              title="Restablecer valores por defecto"
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-white/60 hover:text-red-400 text-xs transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>

        {/* Firebase Quota Alert Banner */}
        {quotaExceeded && (
          <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-5 text-amber-300 text-xs font-mono flex items-start gap-4 shadow-xl">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm uppercase text-amber-200 tracking-wide">
                ⚠️ Límite diario de operaciones en Firebase alcanzado (Quota Exceeded)
              </div>
              <p className="text-amber-200/90 font-sans leading-relaxed text-xs">
                Se ha alcanzado la cuota gratuita diaria de escrituras de Firestore para hoy (20.000 operaciones). 
                <strong> Tus cambios se han guardado localmente de forma segura en esta computadora</strong> y se actualizarán automáticamente en la nube cuando Firebase restablezca la cuota diaria.
              </p>
            </div>
          </div>
        )}

        {/* ADMIN TAB NAVIGATION BAR */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('flagship')}
            className={`px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'flagship'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Programas Destacados
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'schedule'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Grilla de Programación
          </button>

          <button
            onClick={() => setActiveTab('dj')}
            className={`px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'dj'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            Sección Enviá Tu Set
          </button>

          <button
            onClick={() => setActiveTab('sponsors')}
            className={`px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'sponsors'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Sponsors & Publicidad
            {localConfig.sponsors?.active ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Sección Activa" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-red-400" title="Sección Inactiva" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'about'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Info className="w-4 h-4" />
            Sección Nosotros
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'news'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Newspaper className="w-4 h-4 text-amber-400" />
            Novedades & Noticias
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">
              {localConfig.news?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'chat'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Chat Firebase & Moderación
          </button>
        </div>

        {/* TAB 1: PROGRAMAS DESTACADOS */}
        {activeTab === 'flagship' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                  Gestión de Programas Destacados
                </h2>
                <p className="text-white/50 text-xs">
                  Modificá las imágenes de portada, títulos, horarios y enlaces de SoundCloud para el banner destacado principal.
                </p>
              </div>

              <button
                onClick={() => {
                  const newShow: FlagshipShowData = {
                    id: `flagship-${Date.now()}`,
                    title: 'NUEVO PROGRAMA',
                    subtitle: 'by DJ Invitado',
                    schedule: '20:00 - 22:00',
                    day: 'Viernes',
                    badge: 'Radio Show',
                    desc: 'Descripción del nuevo programa...',
                    image: '/logo-sonica.png',
                    soundcloudLink: 'https://soundcloud.com',
                    color: 'from-cyan-500/20 via-blue-600/10 to-transparent'
                  };
                  const updatedShows = [...localConfig.flagshipShows, newShow];
                  const updatedConfig = { ...localConfig, flagshipShows: updatedShows };
                  setLocalConfig(updatedConfig);
                  updateConfig(updatedConfig);
                  setEditingFlagship(newShow);
                }}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Agregar Programa Destacado
              </button>
            </div>

            {/* List of Flagship Shows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {localConfig.flagshipShows.map((show, idx) => (
                <div key={show.id} className="bg-[#0e1017] border border-white/10 rounded-2xl p-6 relative group flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="relative aspect-[2/1] rounded-xl overflow-hidden bg-black border border-white/10">
                      <img 
                        src={resolveShowImage(show.title, show.image)} 
                        alt={show.title} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.currentTarget.src = "/logo-sonica.png"; }}
                      />
                      <div className="absolute top-3 right-3 bg-black/80 text-cyan-400 text-[10px] font-mono px-2.5 py-1 rounded-md border border-white/10 font-bold flex items-center gap-1.5">
                        {show.isStarred && <span className="text-amber-400 font-bold">★</span>}
                        {show.day} {show.schedule}
                      </div>
                      {show.date && (
                        <div className="absolute bottom-3 left-3 bg-black/80 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                          📅 {show.date}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">{show.title}</h3>
                      <p className="text-cyan-400 text-xs font-semibold">{show.subtitle}</p>
                      <p className="text-white/60 text-xs mt-2 line-clamp-2">{show.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
                    <a href={show.soundcloudLink} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-400 hover:underline font-mono flex items-center gap-1">
                      <Headphones className="w-3.5 h-3.5" /> SoundCloud
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingFlagship(show)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono rounded-lg flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Editar
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar ${show.title}?`)) {
                            const updatedShows = localConfig.flagshipShows.filter(s => s.id !== show.id);
                            const updatedConfig = { ...localConfig, flagshipShows: updatedShows };
                            setLocalConfig(updatedConfig);
                            updateConfig(updatedConfig);
                            showToast('Programa eliminado correctamente.');
                          }
                        }}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-mono rounded-lg flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Borrar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* EDIT MODAL FOR FLAGSHIP */}
            {editingFlagship && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-[#0e1017] border border-white/15 rounded-2xl p-6 md:p-8 max-w-2xl w-full my-8 space-y-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h3 className="text-lg font-bold text-white uppercase">Editar Programa Destacado</h3>
                    <button onClick={() => setEditingFlagship(null)} className="text-white/40 hover:text-white">✕</button>
                  </div>

                  <div className="space-y-4 text-xs font-mono text-left">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-cyan-400 mb-1">Título del Programa</label>
                        <input 
                          type="text" 
                          value={editingFlagship.title} 
                          onChange={(e) => setEditingFlagship({ ...editingFlagship, title: e.target.value })}
                          className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white" 
                        />
                      </div>
                      <div>
                        <label className="block text-cyan-400 mb-1">Subtítulo / Conductor</label>
                        <input 
                          type="text" 
                          value={editingFlagship.subtitle} 
                          onChange={(e) => setEditingFlagship({ ...editingFlagship, subtitle: e.target.value })}
                          className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-cyan-400 mb-1">Día de Emisión</label>
                        <input 
                          type="text" 
                          value={editingFlagship.day} 
                          onChange={(e) => setEditingFlagship({ ...editingFlagship, day: e.target.value })}
                          className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white" 
                        />
                      </div>
                      <div>
                        <label className="block text-cyan-400 mb-1">Horario (ej: 19:00 - 20:00)</label>
                        <input 
                          type="text" 
                          value={editingFlagship.schedule} 
                          onChange={(e) => setEditingFlagship({ ...editingFlagship, schedule: e.target.value })}
                          className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white" 
                        />
                      </div>
                      <div>
                        <label className="block text-cyan-400 mb-1">Etiqueta Badge</label>
                        <input 
                          type="text" 
                          value={editingFlagship.badge} 
                          onChange={(e) => setEditingFlagship({ ...editingFlagship, badge: e.target.value })}
                          className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-cyan-400 mb-1">Descripción</label>
                      <textarea 
                        rows={3}
                        value={editingFlagship.desc} 
                        onChange={(e) => setEditingFlagship({ ...editingFlagship, desc: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white font-sans text-sm" 
                      />
                    </div>

                    <div>
                      <label className="block text-cyan-400 mb-1">Imagen de Portada (URL o Subir Archivo)</label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          value={editingFlagship.image} 
                          onChange={(e) => setEditingFlagship({ ...editingFlagship, image: e.target.value })}
                          className="flex-1 px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white text-xs" 
                        />
                        <label className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer flex items-center gap-1 text-xs shrink-0">
                          <Upload className="w-3.5 h-3.5" /> Subir
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, (url) => {
                              const updatedShow = { ...editingFlagship, image: url };
                              setEditingFlagship(updatedShow);
                              const updatedShows = localConfig.flagshipShows.map(s => s.id === editingFlagship.id ? updatedShow : s);
                              const updatedConfig = { ...localConfig, flagshipShows: updatedShows };
                              setLocalConfig(updatedConfig);
                              updateConfig(updatedConfig);
                              showToast('¡Imagen de programa subida y guardada en la nube!');
                            })} 
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-cyan-400 mb-1">Fecha del Evento / Show (Clasificación Automática Próximo)</label>
                        <input 
                          type="date" 
                          value={editingFlagship.date || ''} 
                          onChange={(e) => setEditingFlagship({ ...editingFlagship, date: e.target.value })}
                          className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white font-mono" 
                        />
                      </div>
                      <div className="flex items-end pb-2">
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-mono font-bold">
                          <input 
                            type="checkbox" 
                            checked={!!editingFlagship.isStarred} 
                            onChange={(e) => setEditingFlagship({ ...editingFlagship, isStarred: e.target.checked })}
                            className="w-4 h-4 rounded border-white/20 bg-black text-amber-400 focus:ring-amber-400" 
                          />
                          <span className={editingFlagship.isStarred ? 'text-amber-400 font-extrabold flex items-center gap-1' : 'text-white/60'}>
                            ★ Marcar como Show Destacado (Respaldo)
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-cyan-400 mb-1">Enlace SoundCloud</label>
                      <input 
                        type="text" 
                        value={editingFlagship.soundcloudLink} 
                        onChange={(e) => setEditingFlagship({ ...editingFlagship, soundcloudLink: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white text-xs" 
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => setEditingFlagship(null)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-mono rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        const updatedShows = localConfig.flagshipShows.map(s => s.id === editingFlagship.id ? editingFlagship : s);
                        const updatedConfig = { ...localConfig, flagshipShows: updatedShows };
                        setLocalConfig(updatedConfig);
                        updateConfig(updatedConfig);
                        setEditingFlagship(null);
                        showToast('Programa e imagen guardados en la nube');
                      }}
                      className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono rounded-lg"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GRILLA DE PROGRAMACIÓN */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                Gestión de Grilla Semanal de Programación
              </h2>
              <p className="text-white/50 text-xs">
                Seleccioná el día para agregar, modificar o quitar programas de la grilla horaria.
              </p>
            </div>

            {/* Day Selector */}
            <div className="flex flex-wrap gap-2 bg-[#0e1017] p-2 rounded-2xl border border-white/10">
              {DAYS.map((day) => {
                const count = localConfig.schedules?.[day]?.length || 0;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedScheduleDay(day)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 ${
                      selectedScheduleDay === day
                        ? 'bg-cyan-500 text-black shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {day}
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Add program button for selected day */}
            <div className="flex justify-between items-center pt-2">
              <h3 className="text-lg font-extrabold text-cyan-400 uppercase tracking-wider font-mono">
                Programación para el {selectedScheduleDay}
              </h3>
              <button
                onClick={() => {
                  const newItem: ScheduleItemData = {
                    id: `item-${Date.now()}`,
                    time: '12:00 - 14:00',
                    title: 'NUEVO PROGRAMA',
                    desc: 'Descripción del programa...',
                    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop'
                  };
                  setEditingScheduleItem({ day: selectedScheduleDay, item: newItem });
                }}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Agregar Programa a {selectedScheduleDay}
              </button>
            </div>

            {/* List of shows for selected day */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(localConfig.schedules?.[selectedScheduleDay] || []).map((prog) => (
                <div key={prog.id} className="bg-[#0e1017] border border-white/10 rounded-2xl p-5 relative flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-black border border-white/5">
                      <img src={resolveShowImage(prog.title, prog.image)} alt={prog.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/logo-sonica.png"; }} />
                      <div className="absolute bottom-2 left-2 bg-black/80 text-cyan-400 text-[10px] font-mono px-2 py-1 rounded border border-white/10 font-bold">
                        {prog.time}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white uppercase">{prog.title}</h4>
                      <p className="text-white/50 text-xs mt-1 line-clamp-2">{prog.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
                    {prog.soundcloudLink ? (
                      <span className="text-[10px] text-orange-400 font-mono">Con SoundCloud</span>
                    ) : (
                      <span className="text-[10px] text-white/30 font-mono">Sin enlace</span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingScheduleItem({ day: selectedScheduleDay, item: prog })}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-mono rounded-lg flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" /> Editar
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar ${prog.title} del ${selectedScheduleDay}?`)) {
                            const updatedList = (localConfig.schedules?.[selectedScheduleDay] || []).filter(p => p.id !== prog.id);
                            const updatedConfig = {
                              ...localConfig,
                              schedules: {
                                ...localConfig.schedules,
                                [selectedScheduleDay]: updatedList
                              }
                            };
                            setLocalConfig(updatedConfig);
                            updateConfig(updatedConfig);
                            showToast(`Programa eliminado de ${selectedScheduleDay}`);
                          }
                        }}
                        className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-mono rounded-lg flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Borrar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* EDIT SCHEDULE ITEM MODAL */}
            {editingScheduleItem && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-[#0e1017] border border-white/15 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-base font-bold text-white uppercase">
                      Programa de {editingScheduleItem.day}
                    </h3>
                    <button onClick={() => setEditingScheduleItem(null)} className="text-white/40 hover:text-white">✕</button>
                  </div>

                  <div className="space-y-3 text-xs font-mono text-left">
                    <div>
                      <label className="block text-cyan-400 mb-1">Título del Programa</label>
                      <input 
                        type="text" 
                        value={editingScheduleItem.item.title} 
                        onChange={(e) => setEditingScheduleItem({
                          ...editingScheduleItem,
                          item: { ...editingScheduleItem.item, title: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white" 
                      />
                    </div>

                    <div>
                      <label className="block text-cyan-400 mb-1">Horario (ej: 09:00 - 12:00)</label>
                      <input 
                        type="text" 
                        value={editingScheduleItem.item.time} 
                        onChange={(e) => setEditingScheduleItem({
                          ...editingScheduleItem,
                          item: { ...editingScheduleItem.item, time: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white" 
                      />
                    </div>

                    <div>
                      <label className="block text-cyan-400 mb-1">Descripción</label>
                      <textarea 
                        rows={2}
                        value={editingScheduleItem.item.desc} 
                        onChange={(e) => setEditingScheduleItem({
                          ...editingScheduleItem,
                          item: { ...editingScheduleItem.item, desc: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white font-sans text-xs" 
                      />
                    </div>

                    <div>
                      <label className="block text-cyan-400 mb-1">Imagen (URL o Subir)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={editingScheduleItem.item.image} 
                          onChange={(e) => setEditingScheduleItem({
                            ...editingScheduleItem,
                            item: { ...editingScheduleItem.item, image: e.target.value }
                          })}
                          className="flex-1 px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white text-xs" 
                        />
                        <label className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer flex items-center gap-1 text-xs shrink-0">
                          <Upload className="w-3.5 h-3.5" /> Subir
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, (url) => {
                              const dayName = editingScheduleItem.day;
                              const itemToSave = { ...editingScheduleItem.item, image: url };
                              setEditingScheduleItem({ ...editingScheduleItem, item: itemToSave });
                              const dayList = localConfig.schedules?.[dayName] || [];
                              const exists = dayList.some(i => i.id === itemToSave.id);
                              const updatedList = exists 
                                ? dayList.map(i => i.id === itemToSave.id ? itemToSave : i)
                                : [...dayList, itemToSave];
                              const updatedConfig = {
                                ...localConfig,
                                schedules: {
                                  ...localConfig.schedules,
                                  [dayName]: updatedList
                                }
                              };
                              setLocalConfig(updatedConfig);
                              updateConfig(updatedConfig);
                              showToast('¡Imagen de grilla subida y guardada en la nube!');
                            })} 
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-cyan-400 mb-1">Enlace SoundCloud (Opcional)</label>
                      <input 
                        type="text" 
                        value={editingScheduleItem.item.soundcloudLink || ''} 
                        onChange={(e) => setEditingScheduleItem({
                          ...editingScheduleItem,
                          item: { ...editingScheduleItem.item, soundcloudLink: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white text-xs" 
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => setEditingScheduleItem(null)}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-mono rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        const dayName = editingScheduleItem.day;
                        const itemToSave = editingScheduleItem.item;
                        const dayList = localConfig.schedules?.[dayName] || [];
                        const exists = dayList.some(i => i.id === itemToSave.id);
                        const updatedList = exists 
                          ? dayList.map(i => i.id === itemToSave.id ? itemToSave : i)
                          : [...dayList, itemToSave];
                        const updatedConfig = {
                          ...localConfig,
                          schedules: {
                            ...localConfig.schedules,
                            [dayName]: updatedList
                          }
                        };
                        setLocalConfig(updatedConfig);
                        updateConfig(updatedConfig);
                        setEditingScheduleItem(null);
                        showToast('Grilla e imagen guardadas en la nube');
                      }}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono rounded-lg"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SECCIÓN ENVIÁ TU SET */}
        {activeTab === 'dj' && (
          <div className="bg-[#0e1017] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                Editar Sección "ENVÍA TU SET"
              </h2>
              <p className="text-white/50 text-xs">
                Personalizá la convocatoria a DJs, requisitos y el enlace al formulario de postulación.
              </p>
            </div>

            <div className="space-y-4 text-xs font-mono text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyan-400 mb-1">Badge de Encabezado</label>
                  <input 
                    type="text" 
                    value={localConfig.djSubmission.badge} 
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, djSubmission: { ...prev.djSubmission, badge: e.target.value } }))}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white" 
                  />
                </div>
                <div>
                  <label className="block text-cyan-400 mb-1">Título de la Sección</label>
                  <input 
                    type="text" 
                    value={localConfig.djSubmission.title} 
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, djSubmission: { ...prev.djSubmission, title: e.target.value } }))}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyan-400 mb-1">Descripción Principal</label>
                <textarea 
                  rows={3}
                  value={localConfig.djSubmission.description} 
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, djSubmission: { ...prev.djSubmission, description: e.target.value } }))}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white font-sans text-sm" 
                />
              </div>

              {/* Requirements list */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-cyan-400">Lista de Requisitos para salir al aire</label>
                  <button
                    onClick={() => setLocalConfig(prev => ({
                      ...prev,
                      djSubmission: {
                        ...prev.djSubmission,
                        requirements: [...prev.djSubmission.requirements, 'Nuevo requisito...']
                      }
                    }))}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Agregar Requisito
                  </button>
                </div>

                {localConfig.djSubmission.requirements.map((req, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input 
                      type="text"
                      value={req}
                      onChange={(e) => {
                        const newReqs = [...localConfig.djSubmission.requirements];
                        newReqs[idx] = e.target.value;
                        setLocalConfig(prev => ({
                          ...prev,
                          djSubmission: { ...prev.djSubmission, requirements: newReqs }
                        }));
                      }}
                      className="flex-1 px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white text-xs font-sans"
                    />
                    <button
                      onClick={() => {
                        const newReqs = localConfig.djSubmission.requirements.filter((_, i) => i !== idx);
                        setLocalConfig(prev => ({
                          ...prev,
                          djSubmission: { ...prev.djSubmission, requirements: newReqs }
                        }));
                      }}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Form box config */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-cyan-400 mb-1">Título de Formulario</label>
                  <input 
                    type="text" 
                    value={localConfig.djSubmission.formTitle} 
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, djSubmission: { ...prev.djSubmission, formTitle: e.target.value } }))}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white" 
                  />
                </div>
                <div>
                  <label className="block text-cyan-400 mb-1">Texto de Botón</label>
                  <input 
                    type="text" 
                    value={localConfig.djSubmission.buttonText} 
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, djSubmission: { ...prev.djSubmission, buttonText: e.target.value } }))}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyan-400 mb-1">Enlace a Google Form / Formulario</label>
                <input 
                  type="text" 
                  value={localConfig.djSubmission.formUrl} 
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, djSubmission: { ...prev.djSubmission, formUrl: e.target.value } }))}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white text-xs" 
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SPONSORS & PUBLICIDAD */}
        {activeTab === 'sponsors' && (
          <div className="space-y-6">
            
            {/* BIG TOGGLE SECTION ACTIVE / INACTIVE */}
            <div className="bg-[#0e1017] border border-white/10 rounded-2xl p-6 flex items-center justify-between shadow-2xl">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-1">ESTADO DE VISIBILIDAD</span>
                <h3 className="text-lg font-bold text-white uppercase">Sección Sponsors & Marcas</h3>
                <p className="text-white/50 text-xs mt-1">
                  {localConfig.sponsors.active 
                    ? 'La sección se muestra actualmente en el sitio web principal.' 
                    : 'La sección está DESACTIVADA y oculta para los usuarios.'}
                </p>
              </div>

              <button
                onClick={() => setLocalConfig(prev => ({
                  ...prev,
                  sponsors: { ...prev.sponsors, active: !prev.sponsors.active }
                }))}
                className={`px-6 py-3.5 rounded-xl font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-3 transition-all ${
                  localConfig.sponsors.active 
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20' 
                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40'
                }`}
              >
                {localConfig.sponsors.active ? (
                  <>
                    <ToggleRight className="w-6 h-6 text-black" />
                    SECCIÓN ACTIVADA
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-6 h-6 text-red-400" />
                    SECCIÓN DESACTIVADA
                  </>
                )}
              </button>
            </div>

            {/* SECTION TEXT CUSTOMIZATION */}
            <div className="bg-[#0e1017] border border-white/10 rounded-2xl p-6 space-y-4 text-xs font-mono text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white uppercase">Textos de la Sección Publicitaria</h3>
                  <p className="text-white/50 text-[11px]">Personalizá el título y subtítulo visibles en la página web.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateConfig({ sponsors: localConfig.sponsors }, ['sponsors']);
                    showToast('¡Configuración de Sponsors guardada en la nube!');
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Save className="w-4 h-4" /> Guardar Cambios
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyan-400 mb-1">Insignia / Badge Superior</label>
                  <input 
                    type="text" 
                    value={localConfig.sponsors.badge || 'ESPACIO PUBLICITARIO DISPONIBLE'} 
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, sponsors: { ...prev.sponsors, badge: e.target.value } }))}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white" 
                  />
                </div>
                <div>
                  <label className="block text-cyan-400 mb-1">Título Principal</label>
                  <input 
                    type="text" 
                    value={localConfig.sponsors.title || 'Sumá tu marca a Sónica Radio'} 
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, sponsors: { ...prev.sponsors, title: e.target.value } }))}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-cyan-400 mb-1">Subtítulo / Descripción</label>
                  <input 
                    type="text" 
                    value={localConfig.sponsors.description || 'Hacé que tu marca suene más fuerte, Anunciá en Sónica Radio. Desde Salta al mundo'} 
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, sponsors: { ...prev.sponsors, description: e.target.value } }))}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white font-sans text-sm" 
                  />
                </div>
              </div>
            </div>

            {/* BRAND LOGOS & SPONSORS LIST */}
            <div className="bg-[#0e1017] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">Logos de Marcas y Sponsors</h3>
                  <p className="text-white/50 text-xs">Subí, activá o quitá logotipos para la marquesina animada.</p>
                </div>

                <button
                  onClick={() => {
                    const newSponsor: SponsorItemData = {
                      id: `sponsor-${Date.now()}`,
                      name: 'NUEVA MARCA',
                      logoUrl: '/logo-sonica.png',
                      websiteUrl: '',
                      subtext: 'SPONSOR OFICIAL',
                      active: true
                    };
                    setLocalConfig(prev => ({
                      ...prev,
                      sponsors: {
                        ...prev.sponsors,
                        sponsors: [...(prev.sponsors.sponsors || []), newSponsor]
                      }
                    }));
                  }}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Agregar Marca
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(localConfig.sponsors.sponsors || []).map((sp, idx) => (
                  <div key={sp.id} className="p-4 bg-black/60 border border-white/10 rounded-xl space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 bg-black border border-white/10 rounded-lg overflow-hidden flex items-center justify-center shrink-0 p-1">
                        <img src={sp.logoUrl || '/logo-sonica.png'} alt={sp.name} className="max-w-full max-h-full object-contain" />
                      </div>

                      <div className="flex-1 space-y-1 text-xs font-mono">
                        <input 
                          type="text" 
                          value={sp.name}
                          onChange={(e) => {
                            const updated = [...localConfig.sponsors.sponsors];
                            updated[idx].name = e.target.value;
                            setLocalConfig(prev => ({ ...prev, sponsors: { ...prev.sponsors, sponsors: updated } }));
                          }}
                          className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white font-bold"
                          placeholder="Nombre de la marca..."
                        />
                        <input 
                          type="text" 
                          value={sp.subtext}
                          onChange={(e) => {
                            const updated = [...localConfig.sponsors.sponsors];
                            updated[idx].subtext = e.target.value;
                            setLocalConfig(prev => ({ ...prev, sponsors: { ...prev.sponsors, sponsors: updated } }));
                          }}
                          className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-cyan-400 text-[10px]"
                          placeholder="Etiqueta / Subtexto..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={sp.logoUrl}
                          onChange={(e) => {
                            const updated = [...localConfig.sponsors.sponsors];
                            updated[idx].logoUrl = e.target.value;
                            setLocalConfig(prev => ({ ...prev, sponsors: { ...prev.sponsors, sponsors: updated } }));
                          }}
                          className="flex-1 px-2.5 py-1 bg-black border border-white/10 rounded text-white text-[11px]"
                          placeholder="URL del Logo..."
                        />
                        <label className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded cursor-pointer text-[10px] flex items-center gap-1 shrink-0">
                          <Upload className="w-3 h-3" /> Subir Logo
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, (url) => {
                              const updated = [...localConfig.sponsors.sponsors];
                              updated[idx].logoUrl = url;
                              const newConfig = { ...localConfig, sponsors: { ...localConfig.sponsors, sponsors: updated } };
                              setLocalConfig(newConfig);
                              updateConfig(newConfig);
                            })}
                          />
                        </label>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <label className="inline-flex items-center gap-2 cursor-pointer text-[11px]">
                          <input 
                            type="checkbox"
                            checked={sp.active}
                            onChange={(e) => {
                              const updated = [...localConfig.sponsors.sponsors];
                              updated[idx].active = e.target.checked;
                              setLocalConfig(prev => ({ ...prev, sponsors: { ...prev.sponsors, sponsors: updated } }));
                            }}
                            className="rounded border-white/20 bg-black text-cyan-500"
                          />
                          <span className={sp.active ? 'text-emerald-400 font-bold' : 'text-white/40'}>
                            {sp.active ? 'Mostrando en marquesina' : 'Oculto'}
                          </span>
                        </label>

                        <button
                          onClick={() => {
                            const updated = localConfig.sponsors.sponsors.filter((_, i) => i !== idx);
                            setLocalConfig(prev => ({ ...prev, sponsors: { ...prev.sponsors, sponsors: updated } }));
                          }}
                          className="text-red-400 hover:text-red-300 text-[11px] font-mono flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SPONSOR CONTACT INFO */}
            <div className="bg-[#0e1017] border border-white/10 rounded-2xl p-6 space-y-4 text-xs font-mono text-left">
              <h3 className="text-base font-bold text-white uppercase">Datos de Contacto Publicitario</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyan-400 mb-1">Enlace WhatsApp Publicidad</label>
                  <input 
                    type="text" 
                    value={localConfig.sponsors.whatsappUrl} 
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, sponsors: { ...prev.sponsors, whatsappUrl: e.target.value } }))}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white" 
                  />
                </div>
                <div>
                  <label className="block text-cyan-400 mb-1">Email Publicidad</label>
                  <input 
                    type="text" 
                    value={localConfig.sponsors.email} 
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, sponsors: { ...prev.sponsors, email: e.target.value } }))}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white" 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SECCIÓN NOSOTROS */}
        {activeTab === 'about' && (
          <div className="bg-[#0e1017] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                Editar Sección "NOSOTROS"
              </h2>
              <p className="text-white/50 text-xs">
                Modificá los textos institucionales y la foto del estudio central de la radio.
              </p>
            </div>

            <div className="space-y-4 text-xs font-mono text-left">
              <div>
                <label className="block text-cyan-400 mb-1">Subtítulo / Etiqueta de Encabezado</label>
                <input 
                  type="text" 
                  value={localConfig.about.tag} 
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, about: { ...prev.about, tag: e.target.value } }))}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white font-bold" 
                />
              </div>

              <div>
                <label className="block text-cyan-400 mb-1">Párrafo 1 (Presentación)</label>
                <textarea 
                  rows={3}
                  value={localConfig.about.p1} 
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, about: { ...prev.about, p1: e.target.value } }))}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white font-sans text-sm" 
                />
              </div>

              <div>
                <label className="block text-cyan-400 mb-1">Párrafo 2 (Experiencia Auditiva)</label>
                <textarea 
                  rows={3}
                  value={localConfig.about.p2} 
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, about: { ...prev.about, p2: e.target.value } }))}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white font-sans text-sm" 
                />
              </div>

              <div>
                <label className="block text-cyan-400 mb-1">Párrafo 3 (Comunidad)</label>
                <textarea 
                  rows={3}
                  value={localConfig.about.p3} 
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, about: { ...prev.about, p3: e.target.value } }))}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white font-sans text-sm" 
                />
              </div>

              {/* Main Image Setup */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <label className="block text-cyan-400">Imagen del Estudio Central (URL o Subir Archivo)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={localConfig.about.imageUrl} 
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, about: { ...prev.about, imageUrl: e.target.value } }))}
                    className="flex-1 px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white text-xs" 
                  />
                  <label className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0">
                    <Upload className="w-4 h-4" /> Cambiar Imagen
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, (url) => {
                        const newConfig = { ...localConfig, about: { ...localConfig.about, imageUrl: url } };
                        setLocalConfig(newConfig);
                        updateConfig(newConfig);
                      })} 
                    />
                  </label>
                </div>

                <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden border border-white/10 bg-black">
                  <img src={localConfig.about.imageUrl} alt="Estudio" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/logo-sonica.png"; }} />
                </div>
              </div>

              {/* Image Badges */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-cyan-400 mb-1">Texto de Overlay Superior</label>
                  <input 
                    type="text" 
                    value={localConfig.about.imageBadgeText} 
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, about: { ...prev.about, imageBadgeText: e.target.value } }))}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white" 
                  />
                </div>
                <div>
                  <label className="block text-cyan-400 mb-1">Texto de Pie de Imagen</label>
                  <input 
                    type="text" 
                    value={localConfig.about.imageFooterTitle} 
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, about: { ...prev.about, imageFooterTitle: e.target.value } }))}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white" 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB NOVEDADES Y NOTICIAS */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
                  <Newspaper className="w-6 h-6 text-amber-400" />
                  Gestión de Novedades & Noticias Sónica
                </h2>
                <p className="text-white/50 text-xs mt-1">
                  Publicá noticias sobre la escena nacional, eventos o lanzamientos. Podés subir imágenes propias, usar los 5 presets de fotos electrónicas o vinculadas a notas.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    updateConfig({ news: localConfig.news }, ['news']);
                    showToast('¡Todas las noticias y cambios fueron guardados permanentemente en la nube!');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all shrink-0"
                >
                  <Save className="w-4 h-4" />
                  Guardar Noticias en la Nube
                </button>

                <button
                  onClick={() => {
                    const newArticle: NewsItemData = {
                      id: 'news-' + Date.now(),
                      title: 'Sunset Galáctico & Novedades Sónica',
                      category: 'argentina',
                      badge: 'EVENTO EXCLUSIVO',
                      pubDate: new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }),
                      location: 'Argentina',
                      thumbnail: PRESET_NEWS_IMAGES[0].url,
                      description: 'Breve resumen de la nota para la tarjeta principal.',
                      fullContent: ['Escribí aquí el primer párrafo de la noticia...', 'Segundo párrafo con detalles del evento o lanzamiento...'],
                      readTime: '3 min de lectura',
                      author: 'Redacción Sónica',
                      linkUrl: ''
                    };
                    const updatedNews = [newArticle, ...(localConfig.news || [])];
                    const newCfg = { ...localConfig, news: updatedNews };
                    setLocalConfig(newCfg);
                    updateConfig(newCfg, ['news']);
                    showToast('¡Nueva noticia agregada y guardada en la nube!');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Nueva Noticia
                </button>
              </div>
            </div>

            {/* List of News Articles */}
            <div className="space-y-6">
              {(localConfig.news || []).map((newsItem, index) => (
                <div key={newsItem.id || index} className="bg-[#0e1017] border border-white/10 rounded-2xl p-6 space-y-6 relative group hover:border-amber-500/40 transition-all shadow-xl">
                  {/* Article Card Top Bar */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <h3 className="text-base font-bold text-white tracking-wide">
                        {newsItem.title || 'Noticia sin título'}
                      </h3>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`¿Estás seguro de eliminar la noticia "${newsItem.title}"?`)) {
                          const updated = (localConfig.news || []).filter((_, i) => i !== index);
                          const newCfg = { ...localConfig, news: updated };
                          setLocalConfig(newCfg);
                          updateConfig(newCfg);
                          showToast('Noticia eliminada correctamente en la nube.');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono font-bold flex items-center gap-1.5 border border-red-500/20 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar Noticia
                    </button>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                    {/* Title */}
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-amber-400 font-bold mb-1 uppercase tracking-wider">
                        Título de la Noticia
                      </label>
                      <input 
                        type="text" 
                        value={newsItem.title} 
                        onChange={(e) => {
                          const updated = [...(localConfig.news || [])];
                          updated[index] = { ...updated[index], title: e.target.value };
                          setLocalConfig({ ...localConfig, news: updated });
                        }}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-amber-400 font-bold mb-1 uppercase tracking-wider">
                        Categoría
                      </label>
                      <select 
                        value={newsItem.category} 
                        onChange={(e) => {
                          const updated = [...(localConfig.news || [])];
                          updated[index] = { ...updated[index], category: e.target.value as 'argentina' | 'lanzamientos' };
                          setLocalConfig({ ...localConfig, news: updated });
                        }}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                      >
                        <option value="argentina">Escena Argentina / Eventos</option>
                        <option value="lanzamientos">Lanzamientos & Nueva Música</option>
                      </select>
                    </div>

                    {/* Badge */}
                    <div>
                      <label className="block text-amber-400 font-bold mb-1 uppercase tracking-wider">
                        Etiqueta / Badge
                      </label>
                      <input 
                        type="text" 
                        value={newsItem.badge} 
                        onChange={(e) => {
                          const updated = [...(localConfig.news || [])];
                          updated[index] = { ...updated[index], badge: e.target.value };
                          setLocalConfig({ ...localConfig, news: updated });
                        }}
                        placeholder="Ej: EVENTO ARGENTINA"
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-amber-400 font-bold mb-1 uppercase tracking-wider">
                        Fecha de Publicación
                      </label>
                      <input 
                        type="text" 
                        value={newsItem.pubDate} 
                        onChange={(e) => {
                          const updated = [...(localConfig.news || [])];
                          updated[index] = { ...updated[index], pubDate: e.target.value };
                          setLocalConfig({ ...localConfig, news: updated });
                        }}
                        placeholder="Ej: 27 de Julio, 2026"
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-amber-400 font-bold mb-1 uppercase tracking-wider">
                        Ubicación / Origen
                      </label>
                      <input 
                        type="text" 
                        value={newsItem.location} 
                        onChange={(e) => {
                          const updated = [...(localConfig.news || [])];
                          updated[index] = { ...updated[index], location: e.target.value };
                          setLocalConfig({ ...localConfig, news: updated });
                        }}
                        placeholder="Ej: Buenos Aires, Argentina"
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    {/* Author */}
                    <div>
                      <label className="block text-amber-400 font-bold mb-1 uppercase tracking-wider">
                        Autor / Firma
                      </label>
                      <input 
                        type="text" 
                        value={newsItem.author} 
                        onChange={(e) => {
                          const updated = [...(localConfig.news || [])];
                          updated[index] = { ...updated[index], author: e.target.value };
                          setLocalConfig({ ...localConfig, news: updated });
                        }}
                        placeholder="Ej: Redacción Sónica"
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    {/* Read Time */}
                    <div>
                      <label className="block text-amber-400 font-bold mb-1 uppercase tracking-wider">
                        Tiempo de Lectura
                      </label>
                      <input 
                        type="text" 
                        value={newsItem.readTime} 
                        onChange={(e) => {
                          const updated = [...(localConfig.news || [])];
                          updated[index] = { ...updated[index], readTime: e.target.value };
                          setLocalConfig({ ...localConfig, news: updated });
                        }}
                        placeholder="Ej: 4 min de lectura"
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    {/* Link URL & Auto Extract Button */}
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-amber-400 font-bold mb-1 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Link2 className="w-3.5 h-3.5" /> Enlace a Nota / Fuente Original (Noticia Web)
                        </span>
                        <span className="text-[10px] text-cyan-400 font-mono font-normal">
                          ⚡ Extrae foto real automáticamente
                        </span>
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={newsItem.linkUrl || ''} 
                          onChange={(e) => {
                            const updated = [...(localConfig.news || [])];
                            updated[index] = { ...updated[index], linkUrl: e.target.value };
                            setLocalConfig({ ...localConfig, news: updated });
                          }}
                          placeholder="https://djmag.com/noticias/sunsetstrip-cattaneo..."
                          className="flex-1 px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={syncingNewsIndex === index}
                          onClick={() => handleExtractNewsMetaData(index)}
                          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all shrink-0 disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {syncingNewsIndex === index ? 'Sintonizando...' : 'Extraer Imagen Real'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Description & Full Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                    <div>
                      <label className="block text-amber-400 font-bold mb-1 uppercase tracking-wider">
                        Resumen Breve (Para tarjeta)
                      </label>
                      <textarea 
                        rows={3} 
                        value={newsItem.description} 
                        onChange={(e) => {
                          const updated = [...(localConfig.news || [])];
                          updated[index] = { ...updated[index], description: e.target.value };
                          setLocalConfig({ ...localConfig, news: updated });
                        }}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white focus:border-amber-400 focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-amber-400 font-bold mb-1 uppercase tracking-wider">
                        Contenido Completo (Párrafos separados por salto de línea)
                      </label>
                      <textarea 
                        rows={3} 
                        value={Array.isArray(newsItem.fullContent) ? newsItem.fullContent.join('\n\n') : newsItem.fullContent} 
                        onChange={(e) => {
                          const paragraphs = e.target.value.split('\n').filter(p => p.trim().length > 0);
                          const updated = [...(localConfig.news || [])];
                          updated[index] = { ...updated[index], fullContent: paragraphs };
                          setLocalConfig({ ...localConfig, news: updated });
                        }}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white focus:border-amber-400 focus:outline-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* IMAGE MANAGEMENT SECTION FOR THIS NEWS */}
                  <div className="bg-black/50 border border-white/10 rounded-xl p-4 space-y-4 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Imagen / Portada de la Noticia
                      </span>
                      <span className="text-cyan-400 text-[10px] font-bold">
                        Sintonizado con fuente real o archivo local
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      {/* Inputs */}
                      <div className="md:col-span-2 space-y-3">
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 flex items-center justify-between gap-2">
                          <div className="text-[11px] text-cyan-300">
                            <strong>Sintonizar automáticamente:</strong> Extraé la portada real directamente desde el link de la noticia.
                          </div>
                          <button
                            type="button"
                            disabled={syncingNewsIndex === index}
                            onClick={() => handleExtractNewsMetaData(index)}
                            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[11px] uppercase tracking-wider rounded-md flex items-center gap-1 transition-all shrink-0 disabled:opacity-50"
                          >
                            <Sparkles className="w-3 h-3" />
                            {syncingNewsIndex === index ? 'Sintonizando...' : 'Auto-Sintonizar'}
                          </button>
                        </div>

                        <div>
                          <label className="block text-white/70 mb-1 text-[11px]">
                            1. Pegar URL Directa de la Imagen de la Noticia:
                          </label>
                          <input 
                            type="text" 
                            value={newsItem.thumbnail} 
                            onChange={(e) => {
                              const updated = [...(localConfig.news || [])];
                              updated[index] = { ...updated[index], thumbnail: e.target.value };
                              setLocalConfig({ ...localConfig, news: updated });
                            }}
                            placeholder="https://..."
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-white/70 mb-1 text-[11px]">
                            2. Subir Archivo de Foto Real desde tu Equipo:
                          </label>
                          <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-bold cursor-pointer transition-all">
                            <Upload className="w-4 h-4 text-amber-400" />
                            Seleccionar Archivo de Foto Real
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                handleFileUpload(e, (url) => {
                                  const updated = [...(localConfig.news || [])];
                                  updated[index] = { ...updated[index], thumbnail: url };
                                  const newConfig = { ...localConfig, news: updated };
                                  setLocalConfig(newConfig);
                                  updateConfig(newConfig);
                                  showToast('¡Imagen de noticia subida y guardada en la nube!');
                                });
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Preview */}
                      <div>
                        <span className="block text-white/70 mb-1 text-[11px]">Vista Previa Actual:</span>
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-white/20 bg-black group/preview">
                          <img 
                            src={newsItem.thumbnail} 
                            alt="Portada" 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = PRESET_NEWS_IMAGES[0].url; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2 flex flex-col justify-end">
                            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest truncate">{newsItem.badge}</span>
                            <span className="text-[10px] text-white font-bold truncate">{newsItem.title}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5 Preset Examples */}
                    <div className="pt-3 border-t border-white/10">
                      <span className="block text-white/80 font-bold mb-2 text-[11px] uppercase tracking-wider">
                        3. O bien Elegí entre estos 5 Ejemplos Prediseñados de Alta Calidad:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {PRESET_NEWS_IMAGES.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              const updated = [...(localConfig.news || [])];
                              updated[index] = { ...updated[index], thumbnail: preset.url };
                              setLocalConfig({ ...localConfig, news: updated });
                              showToast(`¡Preset "${preset.name}" aplicado!`);
                            }}
                            className={`p-1.5 rounded-lg border text-left transition-all flex flex-col gap-1 overflow-hidden group/preset ${
                              newsItem.thumbnail === preset.url
                                ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-amber-400/50'
                            }`}
                          >
                            <div className="aspect-video w-full rounded overflow-hidden relative">
                              <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover/preset:scale-105 transition-transform" />
                            </div>
                            <span className="text-[9px] text-white/80 font-bold truncate leading-tight">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Save Action Bar */}
            <div className="bg-[#0e1017] border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-xl">
              <div className="text-white/60 text-xs font-mono">
                ¿Terminaste de editar o agregar noticias? Guardá tus cambios permanentemente en Firestore.
              </div>
              <button
                type="button"
                onClick={() => {
                  updateConfig({ news: localConfig.news }, ['news']);
                  showToast('¡Todas las noticias guardadas en la nube correctamente!');
                }}
                className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all shrink-0"
              >
                <Save className="w-4 h-4" />
                Guardar Todas las Noticias en la Nube
              </button>
            </div>
          </div>
        )}

        {/* TAB CHAT FIREBASE & MODERACION */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div className="bg-[#0e1017] border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-cyan-400" />
                    Gestión del Chat Firebase & Moderación Verbal
                  </h2>
                  <p className="text-white/40 text-xs font-mono mt-1">
                    Reiniciá el historial de la charla o consultá las reglas de filtrado de contenido inapropiado.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reiniciar Chat Card */}
                <div className="bg-black/40 border border-red-500/20 rounded-xl p-5 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-sm uppercase">
                    <Trash2 className="w-5 h-5" />
                    Reiniciar Chat Firebase
                  </div>
                  <p className="text-neutral-300 text-xs leading-relaxed">
                    Elimina todos los mensajes registrados en la base de datos de Firebase para que no quede la charla previa y el chat se inicie limpio.
                  </p>
                  <button
                    onClick={async () => {
                      if (window.confirm('¿Estás seguro de reiniciar el chat de Firebase? Esta acción borrará todos los mensajes anteriores.')) {
                        setIsClearingChat(true);
                        try {
                          const snapshot = await getDocs(collection(db, 'messages'));
                          const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, 'messages', docSnap.id)));
                          await Promise.all(deletePromises);
                          showToast('¡Chat de Firebase reiniciado con éxito!');
                        } catch (err) {
                          console.error(err);
                          alert('Ocurrió un error al limpiar la base de datos.');
                        } finally {
                          setIsClearingChat(false);
                        }
                      }
                    }}
                    disabled={isClearingChat}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider font-mono shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isClearingChat ? 'Limpiando Base de Datos...' : 'Reiniciar / Borrar Charla Previa'}
                  </button>
                </div>

                {/* Moderación de Palabras Card */}
                <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-5 space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-sm uppercase">
                      <ShieldCheck className="w-5 h-5" />
                      Filtro Anti-Malas Palabras
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase">
                      Activo
                    </span>
                  </div>
                  <p className="text-neutral-300 text-xs leading-relaxed">
                    Filtro automático de vocabulario: Censa insultos, obscenidades, agresiones y expresiones de mal gusto en español e inglés antes de ser publicadas en el reproductor.
                  </p>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Restricción de uso verbal activa en tiempo real.
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
