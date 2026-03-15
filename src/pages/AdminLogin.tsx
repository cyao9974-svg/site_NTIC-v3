import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface AdminLoginProps {
  onLogin?: (email: string) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Hardcoded check based on user request
    if (email === 'admin12@clubtic.ci' && password === 'admin123') {
      if (onLogin) {
        onLogin(email);
      }
      navigate('/dashboard');
    } else if (email === 'demo-admin@clubntic.ci' && password === 'demo') {
      // Keep a way for demo mode via email
      if (onLogin) {
        onLogin(email);
      }
      navigate('/dashboard');
    } else {
      setError('Identifiants invalides. Veuillez réessayer.');
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 border border-primary/20">
            <ShieldCheck className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Administration</h1>
          <p className="text-slate-400 font-light text-sm">Accédez aux outils de gestion du club</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {/* E-mail Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">E-mail Professionnel</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@clubtic.ci"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-300">Mot de passe</label>
              <button type="button" className="text-primary/70 hover:text-primary text-xs transition-colors">Oublié ?</button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg py-4 pl-12 pr-12 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-600"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer"
            />
            <label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer select-none">Rester connecté</label>
          </div>

          {/* Login Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-lg shadow-lg transition-all flex items-center justify-center gap-3 mt-4 cursor-pointer disabled:opacity-50 active:scale-[0.98]" 
          >
            <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
            <ArrowRight size={20} />
          </button>

          {/* Hidden Demo Mode Link for devs */}
          <div className="pt-2 text-center">
            <button 
              type="button"
              onClick={handleDemoLogin}
              className="text-[10px] text-slate-700 hover:text-slate-500 transition-colors"
            >
              Mode Démo (Dev)
            </button>
          </div>
        </form>
        
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
