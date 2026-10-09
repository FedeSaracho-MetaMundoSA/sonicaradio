import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, isMenuOpen }) => {
  const [showNav, setShowNav] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNav(true);
    }, 10000); // 10 seconds delay as requested
    return () => clearTimeout(timer);
  }, []);

  const getLinkClass = (path: string, hash?: string) => {
    const isActive = hash 
      ? location.pathname === path && location.hash === hash
      : location.pathname === path && !location.hash;

    return `font-mono text-[10px] tracking-[0.2em] uppercase transition-colors ${
      isActive ? 'text-cyan-400 font-bold' : 'text-white/50 hover:text-white'
    }`;
  };

  const getMobileLinkClass = (path: string, hash?: string) => {
    const isActive = hash
      ? location.pathname === path && location.hash === hash
      : location.pathname === path && !location.hash;

    return `block text-center font-mono text-[12px] tracking-[0.2em] uppercase ${
      isActive ? 'text-cyan-400 font-bold' : 'text-white/50 hover:text-white'
    }`;
  };

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: showNav ? 1 : 0, y: showNav ? 0 : -100 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} // smooth spring-like ease for parallax feel
      className="absolute top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo-sonica.png" alt="Sónica Radio" className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity" />
              <span className="hidden sm:inline-block font-mono text-[9px] text-cyan-400 tracking-[0.2em] uppercase border-l border-white/20 pl-2">
                Radio Online First Class
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 px-8 py-3 rounded-full">
            <Link to="/" className={getLinkClass('/')}>Inicio</Link>
            <Link to="/#programacion" className={getLinkClass('/', '#programacion')}>Programación</Link>
            <Link to="/#nosotros" className={getLinkClass('/', '#nosotros')}>Nosotros</Link>
            <Link to="/#novedades" className={getLinkClass('/', '#novedades')}>Novedades</Link>
            <Link to="/#reproductor-chat" className={`font-mono text-[10px] tracking-[0.2em] uppercase transition-colors ${location.hash === '#reproductor-chat' ? 'text-green-300 font-bold' : 'text-green-400 hover:text-green-300'}`}>
              Chat En Vivo
            </Link>
          </div>

          {/* Right Action */}
          <div className="hidden md:flex items-center w-20">
            {/* Empty space for balance since EN VIVO was removed */}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={onMenuToggle}
              className="text-white/50 hover:text-white p-2"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-black/90 backdrop-blur-xl border-b border-white/5"
        >
          <div className="px-4 pt-4 pb-6 space-y-4">
            <Link to="/" onClick={onMenuToggle} className={getMobileLinkClass('/')}>Inicio</Link>
            <Link to="/#programacion" onClick={onMenuToggle} className={getMobileLinkClass('/', '#programacion')}>Programación</Link>
            <Link to="/#nosotros" onClick={onMenuToggle} className={getMobileLinkClass('/', '#nosotros')}>Nosotros</Link>
            <Link to="/#novedades" onClick={onMenuToggle} className={getMobileLinkClass('/', '#novedades')}>Novedades</Link>
            <Link 
              to="/#reproductor-chat" 
              onClick={onMenuToggle} 
              className={`block text-center font-mono text-[12px] tracking-[0.2em] uppercase ${location.hash === '#reproductor-chat' ? 'text-green-300 font-bold' : 'text-green-400 hover:text-green-300'}`}
            >
              Chat En Vivo
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};
