import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Terminal, ShieldCheck, Menu, UserCircle, X, LogIn, LogOut, LayoutDashboard, Home, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CurrentUser } from '../App';
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface LayoutProps {
  currentUser?: CurrentUser | null;
}

export default function Layout({ currentUser }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isDashboard = location.pathname === '/dashboard';
  const isAdmin = location.pathname === '/admin';

  const bgClass = isDashboard || isAdmin ? 'circuit-bg-alt' : 'circuit-bg';

  return (
    <div className={`min-h-screen flex flex-col relative overflow-x-hidden ${bgClass}`}>
      {isDashboard && <div className="fixed inset-0 pointer-events-none opacity-5 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBONdzr2tFCmmATIqOk6Pcsj1w957b4BbrAmEqx0rlIQ6hh7p_B5nfcUOnSq6hoX1wv1eiYpQZhgTkVgOb3Q5Qk_HQxRWrYL_KcDeBL-1XrJl54Xh-3wANApRcH2fWG-WUcjjHJNc3YR341hGFSM1haz-wRAinZwHNddBQzdvqPBdjLH60CtSIP0lK-Dhxsbi-Qu40xfA4PlCbyjUyMvz8yZB1-zkgssmfQYo9Taoi6OvAZvFJl0lJ7KcuZu9B3S-HI8L0du4USsEpw')] bg-cover bg-center mix-blend-overlay"></div>}
      
      {isAdmin && <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 z-50"></div>}

      <header className={`w-full px-6 lg:px-20 py-4 flex items-center justify-between border-b border-white/10 relative z-10 ${isDashboard ? 'bg-background-darker/80' : 'bg-background-dark/80'} backdrop-blur-md sticky top-0`}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group relative">
            <div className="relative">
              {/* Pulsing background glow */}
              <motion.div
                className={`absolute inset-0 rounded-lg ${isDashboard || isAdmin ? 'bg-primary' : 'bg-primary/50'}`}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ filter: 'blur(10px)' }}
              />
              <motion.div 
                className={`relative flex items-center justify-center rounded-lg z-10 ${isDashboard || isAdmin ? 'bg-primary p-1.5 shadow-[0_0_15px_rgba(43,205,238,0.5)]' : 'w-10 h-10 text-primary'}`}
                initial={{ rotate: -180, opacity: 0, scale: 0 }}
                animate={{ rotate: 0, opacity: 1, scale: 1, y: [0, -3, 0] }}
                transition={{ 
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  default: { type: "spring", stiffness: 200, damping: 12 }
                }}
                whileHover={{ scale: 1.15, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <Terminal className={isDashboard || isAdmin ? "text-background-dark" : ""} size={isDashboard || isAdmin ? 24 : 32} strokeWidth={2.5} />
              </motion.div>
            </div>
            <motion.div 
              className="flex items-center gap-2"
              initial={{ x: -20, opacity: 0, filter: 'blur(8px)' }}
              animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
            >
              <h2 className="text-xl font-black tracking-tight text-slate-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">NTIC CLUB</h2>
              <motion.span 
                className="text-primary/90 text-xs font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md"
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 15 }}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(43,205,238,0.2)" }}
              >
                2025-2026
              </motion.span>
            </motion.div>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-400 hover:text-primary'}`}>Accueil</Link>
            <Link to="/dashboard" className={`text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-400 hover:text-primary'}`}>Tableau de bord</Link>
            <Link to="/events" className={`text-sm font-medium transition-colors ${location.pathname === '/events' ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-400 hover:text-primary'}`}>Événements</Link>
            <Link to="/admin" className={`text-sm font-medium transition-colors ${location.pathname === '/admin' ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-400 hover:text-primary'}`}>Administration</Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -mr-2 text-slate-100 hover:text-primary transition-colors cursor-pointer"
              >
                <Menu size={24} />
              </button>
            </div>
            <div className="hidden md:flex items-center gap-4">
              {currentUser ? (
                <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 px-3 py-1.5 rounded-full">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-200 leading-tight">{currentUser.name}</span>
                    <span className="text-[10px] font-medium text-primary uppercase tracking-wider">{currentUser.role === 'admin' ? 'Administrateur' : 'Membre'}</span>
                  </div>
                  <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                    <UserCircle size={20} />
                  </div>
                  <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors ml-2" title="Déconnexion">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : isDashboard ? (
                <>
                  <Link to="/admin" className="bg-primary hover:bg-primary/90 text-background-dark px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-[0_0_20px_rgba(43,205,238,0.2)] flex items-center gap-2">
                    <ShieldCheck size={18} />
                    Login Admin
                  </Link>
                </>
              ) : (
                <Link to="/admin" className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-5 py-2 rounded-lg text-sm font-bold transition-all">
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative">
        <Outlet />
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background-darker/95 backdrop-blur-xl md:hidden flex flex-col border-l border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3 text-primary">
                  <Terminal size={24} strokeWidth={2.5} />
                  <span className="font-black tracking-tight text-slate-100">NTIC CLUB</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors cursor-pointer bg-white/5 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
                {currentUser && (
                  <div className="flex items-center gap-4 bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl mb-4 relative">
                    <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shrink-0">
                      <UserCircle size={28} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-slate-100">{currentUser.name}</span>
                      <span className="text-xs font-medium text-primary uppercase tracking-wider">{currentUser.role === 'admin' ? 'Administrateur' : 'Membre'}</span>
                    </div>
                    <button onClick={handleLogout} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400 transition-colors p-2 bg-white/5 rounded-full">
                      <LogOut size={18} />
                    </button>
                  </div>
                )}

                <nav className="flex flex-col gap-2">
                  <Link to="/" className={`flex items-center gap-3 p-4 rounded-xl font-medium transition-all ${location.pathname === '/' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-300 hover:bg-white/5'}`}>
                    <Home size={20} />
                    Accueil
                  </Link>
                  <Link to="/dashboard" className={`flex items-center gap-3 p-4 rounded-xl font-medium transition-all ${location.pathname === '/dashboard' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-300 hover:bg-white/5'}`}>
                    <LayoutDashboard size={20} />
                    Tableau de bord
                  </Link>
                  <Link to="/events" className={`flex items-center gap-3 p-4 rounded-xl font-medium transition-all ${location.pathname === '/events' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-300 hover:bg-white/5'}`}>
                    <Calendar size={20} />
                    Événements
                  </Link>
                  <Link to="/admin" className={`flex items-center gap-3 p-4 rounded-xl font-medium transition-all ${location.pathname === '/admin' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-300 hover:bg-white/5'}`}>
                    <ShieldCheck size={20} />
                    Administration
                  </Link>
                </nav>

                <div className="mt-auto pt-6">
                  {!currentUser && (
                    <Link to="/admin" className="w-full bg-primary hover:bg-primary/90 text-background-dark py-4 rounded-xl text-base font-bold transition-all shadow-[0_0_20px_rgba(43,205,238,0.2)] flex items-center justify-center gap-2">
                      <LogIn size={20} />
                      Connexion
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className={`w-full py-6 px-6 md:px-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 relative z-10 ${isAdmin ? 'uppercase tracking-widest' : ''} ${isDashboard ? 'bg-background-darker mt-auto' : 'bg-background-dark/50'}`}>
        <p>© 2025 NTIC CLUB{isAdmin ? ' - Ivory Coast' : '. Tous droits réservés.'}</p>
        <div className="flex gap-6 font-medium">
          <a className="hover:text-primary transition-colors" href="#">{isAdmin ? 'Confidentialité' : 'Privacy Policy'}</a>
          <a className="hover:text-primary transition-colors" href="#">{isAdmin ? 'Conditions' : 'Terms of Service'}</a>
          <a className="hover:text-primary transition-colors" href="#">{isAdmin ? 'Status' : 'Contact Support'}</a>
        </div>
      </footer>
    </div>
  );
}
