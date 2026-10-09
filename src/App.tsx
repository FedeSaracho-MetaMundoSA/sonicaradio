/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/ui/Navbar';
import { HeroVideoSection } from './components/ui/HeroVideoSection';
import { HeroVideoBackground } from './components/ui/HeroVideoBackground';
import { FlagshipBanner } from './components/ui/FlagshipBanner';
import { About } from './components/ui/About';
import { ScheduleSection } from './components/ui/ScheduleSection';
import { Footer } from './components/ui/Footer';
import { FooterPlayer } from './components/ui/FooterPlayer';
import { LiveChat } from './components/ui/LiveChat';
import { AudioContext } from './context/AudioContext';
import { NewsSection } from './components/ui/NewsSection';
import { SponsorsSection } from './components/ui/SponsorsSection';
import { DjSubmissionSection } from './components/ui/DjSubmissionSection';
import { RadioChatSection } from './components/ui/RadioChatSection';
import { SocialNewsletterSection } from './components/ui/SocialNewsletterSection';
import { AdminProvider } from './context/AdminDataContext';
import { AdminPanel } from './components/admin/AdminPanel';

function HashScrollHandler() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        return () => clearTimeout(timer);
      }
    } else if (location.pathname === '/' && !location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return null;
}

function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full relative z-10 pb-[160px] md:pb-[180px] flex-1 flex flex-col min-h-[100vh]">
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <Footer />
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="w-screen h-screen bg-black overflow-y-auto overflow-x-hidden scroll-smooth relative font-sans text-neutral-200 selection:bg-amber-800/30 flex flex-col">
      {!isAdmin && (
        <Navbar 
          isMenuOpen={isMenuOpen}
          onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        />
      )}
      
      <Routes>
        {/* Oculto / Opciones de administración sin botón en la web */}
        <Route path="/admin" element={<AdminPanel />} />

        <Route path="/" element={
          <PageLayout>
            {/* 1. Hero / Portada de Inicio */}
            <HeroVideoSection />
            
            {/* 2. Reproductor de Radio con Chat en vivo */}
            <RadioChatSection />
            
            {/* 3. Sección Programación (with flagship show highlight) */}
            <FlagshipBanner />
            <ScheduleSection />
            
            {/* 4. Nueva sección: Envío de Sets (DJs) */}
            <DjSubmissionSection />
            
            {/* 5. Nueva sección: Novedades / Noticias */}
            <NewsSection />
            
            {/* 6. Nueva sección: Sponsors */}
            <SponsorsSection />
            
            {/* 7. Redes Sociales y Newsletter */}
            <SocialNewsletterSection />
            
            {/* 9. Sección Nosotros — Imagen institucional */}
            <About />
          </PageLayout>
        } />
        <Route path="/radio" element={<Navigate to="/" replace />} />
        
        <Route path="/programacion" element={
          <PageLayout>
            <div className="pt-24">
              <ScheduleSection />
            </div>
          </PageLayout>
        } />
        
        <Route path="/nosotros" element={
          <PageLayout>
            <div className="pt-24">
              <About />
            </div>
          </PageLayout>
        } />

        <Route path="/novedades" element={
          <PageLayout>
            <div className="pt-24">
              <NewsSection />
            </div>
          </PageLayout>
        } />
        
        <Route path="/chat" element={
          <div className="relative w-full h-[calc(100vh-100px)] overflow-hidden flex pt-24 mt-0">
             <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                <HeroVideoBackground />
             </div>
             <div className="relative z-10 w-full h-full pb-4 px-2 md:px-8 max-w-[1920px] mx-auto">
                <LiveChat standalone />
             </div>
          </div>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAdmin && <FooterPlayer />}
    </div>
  );
}

export default function App() {
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  const [audioData, setAudioData] = useState({ bass: 0, mid: 0, treble: 0 });

  return (
    <AdminProvider>
      <AudioContext.Provider value={{ audioData, dataArray }}>
        <Router>
          <HashScrollHandler />
          <AppContent />
        </Router>
      </AudioContext.Provider>
    </AdminProvider>
  );
}


