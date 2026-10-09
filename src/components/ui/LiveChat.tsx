import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, onSnapshot, doc, setDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import { Users, Send, LogIn, LogOut, Smile, Settings, Image as ImageIcon, CornerDownLeft, ShieldAlert, Trash2, Sparkles, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import EmojiPicker from 'emoji-picker-react';
import { filterProfanity } from '../../utils/profanityFilter';

interface Message {
  id: string;
  text: string;
  imageUrl?: string;
  nick: string;
  avatar: string;
  userId: string;
  timestamp: any;
}

interface User {
  id: string;
  nick: string;
  avatar: string;
  role: string;
}

export const LiveChat: React.FC<{ standalone?: boolean }> = ({ standalone = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(standalone);
  const [user, setUser] = useState<any>(null);
  const [nick, setNick] = useState('');
  const [avatar, setAvatar] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState<'guest' | 'google' | 'email'>('guest');
  const [guestNick, setGuestNick] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailNick, setEmailNick] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [tempNick, setTempNick] = useState('');
  const [tempAvatar, setTempAvatar] = useState('');
  const [activeTab, setActiveTab] = useState<'visitors' | 'friends'>('visitors');
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Restore saved guest profile from localStorage on startup
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sonica_chat_user');
      if (saved && !auth.currentUser) {
        const parsed = JSON.parse(saved);
        if (parsed?.nick) {
          setUser({ uid: parsed.uid || `guest_${Date.now()}`, displayName: parsed.nick, isGuest: true });
          setNick(parsed.nick);
          setAvatar(parsed.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${parsed.nick}`);
        }
      }
    } catch (e) {
      console.warn("Could not read local chat user:", e);
    }
  }, []);

  useEffect(() => {
    const usersQuery = query(collection(db, 'users'), limit(50));
    const unsubscribeUsers = onSnapshot(
      usersQuery, 
      (snapshot) => {
        const usersList: User[] = [];
        snapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() } as User);
        });
        setActiveUsers(usersList);
      },
      (error) => {
        console.warn('Firestore active users notice:', error.message);
      }
    );
    return () => unsubscribeUsers();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            const loadedNick = data.nick || `Oyente_${currentUser.uid.substring(0, 4)}`;
            const loadedAvatar = data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`;
            setNick(loadedNick);
            setAvatar(loadedAvatar);
            localStorage.setItem('sonica_chat_user', JSON.stringify({ uid: currentUser.uid, nick: loadedNick, avatar: loadedAvatar }));
          } else {
            const defaultNick = currentUser.displayName || `Oyente_${currentUser.uid.substring(0, 5)}`;
            const defaultAvatar = currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`;
            setNick(defaultNick);
            setAvatar(defaultAvatar);
            localStorage.setItem('sonica_chat_user', JSON.stringify({ uid: currentUser.uid, nick: defaultNick, avatar: defaultAvatar }));
            await setDoc(userDocRef, {
              nick: defaultNick,
              avatar: defaultAvatar,
              role: 'user',
              status: 'online',
              createdAt: serverTimestamp()
            });
          }
        } catch (error) {
          console.warn('Error reading or writing user doc in Firestore:', error);
          if (currentUser.displayName) setNick(currentUser.displayName);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestNick.trim()) return;
    setAuthError('');
    const cleanNick = guestNick.trim();
    
    try {
      let uid = '';
      try {
        const res = await signInAnonymously(auth);
        uid = res.user.uid;
      } catch (authErr) {
        // Fallback: If Anonymous Sign-in is not enabled in Firebase Console, create client-level guest session
        console.warn("Firebase anonymous auth fallback used:", authErr);
        uid = 'guest_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
      }

      const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanNick)}`;
      const guestSession = {
        uid: uid,
        displayName: cleanNick,
        isGuest: true
      };

      try {
        const userDocRef = doc(db, 'users', uid);
        await setDoc(userDocRef, {
          nick: cleanNick,
          avatar: defaultAvatar,
          role: 'user',
          status: 'online',
          createdAt: serverTimestamp()
        }, { merge: true });
      } catch (dbErr) {
        console.warn("Guest profile Firestore notice:", dbErr);
      }

      localStorage.setItem('sonica_chat_user', JSON.stringify({
        uid: uid,
        nick: cleanNick,
        avatar: defaultAvatar
      }));

      setUser(guestSession);
      setNick(cleanNick);
      setAvatar(defaultAvatar);
      setShowLoginModal(false);
    } catch (err: any) {
      console.error("Guest login fallback error:", err);
      // Absolute guarantee of entry
      const fallbackUid = 'guest_' + Date.now();
      setUser({ uid: fallbackUid, displayName: cleanNick, isGuest: true });
      setNick(cleanNick);
      setShowLoginModal(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setShowLoginModal(false);
    } catch (err: any) {
      console.error("Google login error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('La ventana de Google fue cerrada antes de completar el inicio.');
      } else if (err.code === 'auth/unauthorized-domain' || err.code === 'auth/operation-not-allowed') {
        setAuthError('El inicio con Google requiere habilitar el proveedor en la consola de Firebase. ¡Ingresá al instante con la pestaña "⚡ Apodo Rápido" sin contraseñas!');
      } else {
        setAuthError('⚠️ No se pudo conectar con Google en esta ventana. Te recomendamos ingresar al instante con la pestaña "⚡ Apodo Rápido".');
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setAuthError('');
    try {
      if (isSignUp) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const userDocRef = doc(db, 'users', res.user.uid);
        const cleanNick = emailNick.trim() || email.split('@')[0];
        const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${res.user.uid}`;
        await setDoc(userDocRef, {
          nick: cleanNick,
          avatar: defaultAvatar,
          role: 'user',
          status: 'online',
          createdAt: serverTimestamp()
        });
        localStorage.setItem('sonica_chat_user', JSON.stringify({ uid: res.user.uid, nick: cleanNick, avatar: defaultAvatar }));
        setNick(cleanNick);
        setAvatar(defaultAvatar);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowLoginModal(false);
    } catch (err: any) {
      console.error("Email auth error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setAuthError('El inicio con Email no está activado en Firebase Authentication. Podés entrar al chat ya mismo usando "⚡ Apodo Rápido".');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('Este correo electrónico ya está registrado. Elegí "Iniciar Sesión" o entrá con un Apodo Rápido.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setAuthError('Correo o contraseña incorrectos.');
      } else {
        setAuthError(err.message || 'Error en autenticación por email');
      }
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('sonica_chat_user');
      setUser(null);
      setNick('');
      setAvatar('');
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setNick('');
      setAvatar('');
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const msgs: Message[] = [];
        snapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(msgs.reverse());
      },
      (error) => {
        console.warn('Firestore live chat messages notice:', error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent, imageUrl?: string) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !imageUrl) || !user) return;

    const messageText = newMessage;
    setNewMessage('');
    setShowEmoji(false);

    // Apply profanity / bad word moderation filter
    const { cleanText, isProfane } = filterProfanity(messageText);

    try {
      await addDoc(collection(db, 'messages'), {
        text: imageUrl ? '' : cleanText,
        imageUrl: imageUrl || null,
        nick: nick,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        userId: user.uid,
        isModerated: isProfane || false,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('¿Estás seguro de reiniciar el chat de Firebase? Se borrarán todos los mensajes almacenados.')) {
      try {
        const querySnapshot = await getDocs(collection(db, 'messages'));
        const deletePromises = querySnapshot.docs.map((docSnap) => deleteDoc(doc(db, 'messages', docSnap.id)));
        await Promise.all(deletePromises);
        alert('Chat reiniciado exitosamente. La charla anterior fue eliminada.');
      } catch (error) {
        console.error('Error al reiniciar chat:', error);
        alert('Ocurrió un error al reiniciar la sala de chat.');
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const finalNick = tempNick.trim() || nick;
    const finalAvatar = tempAvatar.trim() || avatar;
    try {
      if (user.uid) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          nick: finalNick,
          avatar: finalAvatar,
        }, { merge: true });
      }
      
      localStorage.setItem('sonica_chat_user', JSON.stringify({
        uid: user.uid,
        nick: finalNick,
        avatar: finalAvatar
      }));
      
      setNick(finalNick);
      setAvatar(finalAvatar);
      setShowSettings(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      localStorage.setItem('sonica_chat_user', JSON.stringify({
        uid: user.uid,
        nick: finalNick,
        avatar: finalAvatar
      }));
      setNick(finalNick);
      setAvatar(finalAvatar);
      setShowSettings(false);
    }
  };

  const onEmojiClick = (emojiObject: any) => {
    setNewMessage(prevInput => prevInput + emojiObject.emoji);
  };

  return (
    <>
      {!standalone && (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed bottom-8 right-20 md:right-28 z-50 bg-[#1c2331] hover:bg-[#253043] border border-[#3b4c68] text-white p-3 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center ${isOpen ? 'translate-x-20 opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}
        >
          <Users className="w-6 h-6 text-cyan-400" />
        </button>
      )}

      <div className={`
        ${standalone 
          ? 'w-full h-full flex flex-col md:flex-row gap-4 p-2 md:p-6 bg-transparent' 
          : `fixed top-0 bottom-0 right-16 md:right-20 w-full sm:w-[350px] z-40 bg-[#0b0d14]/95 backdrop-blur-md border-l border-white/10 shadow-2xl transition-transform duration-300 transform flex flex-col p-2 gap-2 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
        }
      `}>
        {!standalone && (
          <div className="flex justify-between items-center px-2 py-1 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">Live Chat</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono flex items-center gap-1">
                <ShieldAlert className="w-2.5 h-2.5" /> Moderado
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white p-1">
              ✕
            </button>
          </div>
        )}

        {showSettings && user ? (
          <div className="absolute inset-0 z-50 bg-black/95 p-4 flex flex-col items-center justify-center gap-4">
            <div className="w-full max-w-md bg-neutral-900 p-4 rounded-xl border border-white/10 overflow-y-auto">
              <h4 className="text-white font-bold text-lg mb-4 text-center">Editar Perfil</h4>
              <div className="flex flex-col gap-3">
                <div className="flex justify-center mb-2">
                  <img src={tempAvatar || avatar} alt="Preview" className="w-20 h-20 rounded-full border-2 border-cyan-500/50 object-cover shadow-lg" />
                </div>
                <div>
                  <label className="block text-[10px] text-white/50 mb-1 uppercase tracking-wider">Nombre (Nick)</label>
                  <input 
                    type="text" 
                    value={tempNick || nick}
                    onChange={(e) => setTempNick(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/50 mb-1 uppercase tracking-wider">URL Foto (Avatar)</label>
                  <input 
                    type="text" 
                    value={tempAvatar || avatar}
                    onChange={(e) => setTempAvatar(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 text-sm rounded-sm transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    className="flex-1 bg-[#202938] hover:bg-[#2d3a4f] border border-[#3b4c68] text-white font-bold py-2 text-sm rounded-sm transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {showLoginModal && !user ? (
          <div className="absolute inset-0 z-50 bg-black/95 p-4 flex flex-col items-center justify-center gap-4">
            <div className="w-full max-w-md bg-neutral-900 p-5 rounded-2xl border border-cyan-500/30 overflow-y-auto shadow-2xl relative">
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-3 right-3 text-white/40 hover:text-white p-1 text-sm font-mono"
              >
                ✕
              </button>

              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h4 className="text-white font-extrabold text-lg text-center">Unirme al Chat Sónica</h4>
              </div>
              <p className="text-xs text-neutral-400 text-center mb-4">
                Elegí tu apodo o conectate para interactuar en vivo con la radio
              </p>

              {/* Tabs */}
              <div className="flex border-b border-white/10 mb-4 font-mono text-xs">
                <button 
                  type="button"
                  onClick={() => { setLoginMode('guest'); setAuthError(''); }}
                  className={`flex-1 py-2 text-center font-bold border-b-2 transition-colors ${loginMode === 'guest' ? 'border-cyan-400 text-cyan-400 bg-white/5' : 'border-transparent text-neutral-400 hover:text-white'}`}
                >
                  ⚡ Apodo Rápido
                </button>
                <button 
                  type="button"
                  onClick={() => { setLoginMode('google'); setAuthError(''); }}
                  className={`flex-1 py-2 text-center font-bold border-b-2 transition-colors ${loginMode === 'google' ? 'border-cyan-400 text-cyan-400 bg-white/5' : 'border-transparent text-neutral-400 hover:text-white'}`}
                >
                  Google
                </button>
                <button 
                  type="button"
                  onClick={() => { setLoginMode('email'); setAuthError(''); }}
                  className={`flex-1 py-2 text-center font-bold border-b-2 transition-colors ${loginMode === 'email' ? 'border-cyan-400 text-cyan-400 bg-white/5' : 'border-transparent text-neutral-400 hover:text-white'}`}
                >
                  Email
                </button>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-lg bg-red-950/70 border border-red-500/40 text-red-200 text-xs leading-relaxed">
                  {authError}
                </div>
              )}

              {/* Mode 1: Quick Guest Nickname */}
              {loginMode === 'guest' && (
                <form onSubmit={handleGuestLogin} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[10px] text-cyan-400 mb-1 uppercase font-mono tracking-wider">Tu Apodo / Nick en el Chat</label>
                    <input 
                      type="text" 
                      required
                      value={guestNick}
                      onChange={(e) => setGuestNick(e.target.value)}
                      placeholder="Ej. Oyente_Sónica o DJ_MusiK"
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20"
                  >
                    🚀 Entrar al Chat Ahora
                  </button>
                </form>
              )}

              {/* Mode 2: Google */}
              {loginMode === 'google' && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-neutral-300">
                    Iniciá sesión con tu cuenta de Google para sincronizar tu nombre y foto de perfil automáticamente.
                  </p>
                  <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    Conectar con Google
                  </button>
                </div>
              )}

              {/* Mode 3: Email / Password */}
              {loginMode === 'email' && (
                <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
                  {isSignUp && (
                    <div>
                      <label className="block text-[10px] text-cyan-400 mb-1 uppercase font-mono tracking-wider">Apodo / Nick</label>
                      <input 
                        type="text" 
                        value={emailNick}
                        onChange={(e) => setEmailNick(e.target.value)}
                        placeholder="Ej. DJ_Sónica"
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] text-cyan-400 mb-1 uppercase font-mono tracking-wider">Email</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-cyan-400 mb-1 uppercase font-mono tracking-wider">Contraseña</label>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full mt-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all"
                  >
                    {isSignUp ? 'Crear Cuenta e Ingresar' : 'Iniciar Sesión'}
                  </button>

                  <div className="text-center mt-2">
                    <button 
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-xs text-neutral-400 hover:text-white underline font-mono cursor-pointer"
                    >
                      {isSignUp ? '¿Ya tenés cuenta? Iniciar sesión' : '¿No tenés cuenta? Registrarme'}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        ) : null}

        {/* Main Chat Area (Left) */}
        <div className={`flex-1 flex flex-col relative ${standalone ? 'h-full' : 'min-h-[200px]'}`}>
          {/* Chat Output Container */}
          <div className="flex-1 rounded-sm overflow-hidden flex flex-col relative bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl">
            {/* Logo Watermark / Background overlay like xat */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none p-8 z-0">
               <img src="/logo-sonica.png" alt="Sónica" className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 relative z-10">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 items-start ${msg.userId === user?.uid ? 'flex-row-reverse' : 'flex-row'}`}>
                  <img 
                    src={msg.avatar} 
                    alt="avatar" 
                    className="w-8 h-8 rounded bg-black/50 border border-white/10 flex-shrink-0 object-cover shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.nick}`;
                    }} 
                  />
                  <div className={`flex flex-col ${msg.userId === user?.uid ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-[11px] font-bold text-white/80">{msg.nick}</span>
                      <span className="text-[9px] text-white/30">{new Date(msg.timestamp?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`px-2.5 py-1.5 rounded-sm max-w-[240px] md:max-w-[500px] text-[13px] ${msg.userId === user?.uid ? 'bg-[#1c2331] text-white border border-[#3b4c68]' : 'bg-black/60 text-white/90 border border-white/10'}`}>
                      {msg.imageUrl ? (
                        <img src={msg.imageUrl} alt="attached" className="rounded-sm max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.imageUrl, '_blank')} />
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="h-[50px] md:h-[60px] mt-2 flex gap-2 shrink-0">
             <div className="flex-1 relative">
               <form onSubmit={(e) => handleSendMessage(e)} className="h-full flex relative rounded-sm overflow-hidden bg-white/5 border border-white/10">
                  <button 
                    type="button"
                    onClick={() => setShowEmoji(!showEmoji)}
                    className="px-2 md:px-3 text-white/50 hover:text-white bg-black/30 border-r border-white/5 transition-colors"
                  >
                    <Smile className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onClick={() => { if (!user) setShowLoginModal(true); }}
                    placeholder={user ? "Escribe..." : "Haz clic para registrarte / ingresar al chat..."}
                    className="flex-1 bg-transparent px-3 text-[13px] text-white focus:outline-none cursor-pointer"
                  />
               </form>

               <AnimatePresence>
                  {showEmoji && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full left-0 mb-2 z-30 shadow-2xl rounded-2xl overflow-hidden border border-white/10 origin-bottom-left max-h-[300px]"
                    >
                      <EmojiPicker 
                        onEmojiClick={onEmojiClick}
                        theme={'dark' as any}
                        width={280}
                        height={300}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
             
             <button 
               onClick={(e) => {
                 if (!user) {
                   setShowLoginModal(true);
                 } else {
                   handleSendMessage(e as any);
                 }
               }}
               className="h-full px-4 md:px-6 flex items-center justify-center bg-[#1c2331] hover:bg-[#253043] border border-[#3b4c68] rounded-sm transition-colors cursor-pointer"
             >
               <CornerDownLeft className="w-4 h-4 md:w-5 md:h-5 text-white/70" />
             </button>
          </div>
        </div>

        {/* Users / Right Sidebar */}
        <div className={`${standalone ? 'w-full md:w-[260px] lg:w-[300px] h-full flex flex-col gap-4' : 'flex-shrink-0 h-[150px] flex flex-col gap-2 mt-2'}`}>
           {/* User List Panel */}
           <div className="flex-1 bg-white/5 border border-white/10 rounded-sm overflow-hidden flex flex-col backdrop-blur-sm min-h-0">
              {/* Tabs */}
              <div className="flex shrink-0">
                <button 
                  onClick={() => setActiveTab('visitors')}
                  className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider ${activeTab === 'visitors' ? 'bg-white/10 text-white border-b-2 border-cyan-500' : 'bg-black/30 text-white/50 border-b-2 border-transparent hover:text-white/80'}`}
                >
                  Visitors ({activeUsers.length})
                </button>
                <button 
                  onClick={() => setActiveTab('friends')}
                  className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider ${activeTab === 'friends' ? 'bg-white/10 text-white border-b-2 border-cyan-500' : 'bg-black/30 text-white/50 border-b-2 border-transparent hover:text-white/80'}`}
                >
                  Friends
                </button>
              </div>
              {/* User List */}
              <div className="flex-1 overflow-y-auto p-1 flex flex-col gap-0.5">
                {activeUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-2 p-1 rounded-sm hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="relative shrink-0">
                      <img src={u.avatar} alt={u.nick} className="w-6 h-6 rounded-sm bg-black/50 border border-white/10 object-cover" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-[#0f0f13] rounded-full" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-[11px] text-white/90 truncate font-medium">{u.nick}</div>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           {/* Action Area / Login / Controls */}
           <div className="flex flex-col gap-1.5 shrink-0">
             <div className={`flex gap-2 shrink-0 ${standalone ? 'flex-col' : 'flex-row'}`}>
               {user ? (
                 <>
                    <button 
                      onClick={() => setShowSettings(true)}
                      className={`flex-1 bg-[#1c2331] hover:bg-[#253043] border border-[#3b4c68] text-white text-[11px] py-2 rounded-sm transition-colors font-medium flex items-center justify-center gap-1.5`}
                    >
                      <Settings className="w-3.5 h-3.5" /> {standalone ? 'Profile Settings' : 'Perfil'}
                    </button>
                    <button 
                      onClick={handleLogout}
                      className={`flex-1 bg-[#1c2331] hover:bg-red-900/30 border border-[#3b4c68] text-white/70 hover:text-red-400 text-[11px] py-2 rounded-sm transition-colors font-medium flex items-center justify-center gap-1.5`}
                    >
                      <LogOut className="w-3.5 h-3.5" /> {standalone ? 'Sign Out' : 'Salir'}
                    </button>
                 </>
               ) : (
                 <button 
                    onClick={() => setShowLoginModal(true)}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 border border-cyan-400/40 text-white text-[11px] py-2 rounded-sm transition-colors font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                 >
                    <LogIn className="w-3.5 h-3.5" /> Registrarse / Ingresar
                 </button>
               )}
             </div>

             <button 
               onClick={handleClearChat}
               title="Reiniciar chat y borrar historial de la charla en Firebase"
               className="w-full bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-[10px] py-1.5 rounded-sm transition-colors font-mono font-bold flex items-center justify-center gap-1.5"
             >
               <Trash2 className="w-3 h-3 text-red-400" /> Reiniciar Chat Firebase
             </button>
           </div>
        </div>

      </div>
    </>
  );
};


