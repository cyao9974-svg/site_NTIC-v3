import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface AdminLoginProps {
  onLogin?: (email: string) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (onLogin && user.email) {
        onLogin(user.email);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        setError(`Domaine non autorisé (${window.location.hostname}). Ajoutez-le dans la console Firebase.`);
      } else {
        setError(err.message || 'Erreur lors de la connexion avec Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    if (onLogin) {
      onLogin('demo-admin@clubntic.ci');
    }
    navigate('/dashboard');
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 relative w-full">
      {/* Toast Notification */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 z-50 bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 backdrop-blur-md"
          >
            <AlertCircle size={20} className="text-red-400" />
            <span className="font-medium text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10"></div>
      
      <div className="w-full max-w-[480px] glass-card p-8 md:p-12 rounded-xl shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <ShieldCheck className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Administration</h1>
          <p className="text-slate-400 font-light">Accédez aux outils de gestion du club</p>
        </div>
        
        <div className="space-y-6">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-4 rounded-lg shadow-lg transition-all flex items-center justify-center gap-3 mt-4 cursor-pointer disabled:opacity-50" 
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>{loading ? 'Connexion...' : 'Se connecter avec Google'}</span>
          </button>

          {/* Demo Mode Bypass for localhost or Vercel preview */}
          {(window.location.hostname === 'localhost' || window.location.hostname.includes('vercel.app') || error?.includes('Domaine non autorisé')) && (
            <div className="pt-4 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 w-full text-slate-500 text-xs">
                <div className="h-px bg-white/5 flex-1"></div>
                <span>OU MODE DÉMO</span>
                <div className="h-px bg-white/5 flex-1"></div>
              </div>
              <button 
                onClick={handleDemoLogin}
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-medium py-3 rounded-lg border border-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn size={18} />
                Continuer en Mode Démo
              </button>
              <p className="text-[10px] text-slate-600 text-center leading-relaxed">
                <AlertCircle size={10} className="inline mr-1 mb-0.5" />
                Le Mode Démo simule une session admin pour contourner les restrictions de domaine Firebase.
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-slate-500 text-sm">
            Accès réservé aux membres du bureau exécutif.
            <br />
            <a className="text-primary/60 hover:text-primary underline underline-offset-4 mt-2 inline-block" href="#">Support technique</a>
          </p>
        </div>
      </div>
    </div>
  );
}
