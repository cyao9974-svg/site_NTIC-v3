import React, { useState, useEffect } from 'react';
import { UserPlus, IdCard, User, GraduationCap, Network, ChevronDown, Phone, ArrowRight, Users, CalendarCheck, Code, Award, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Member, Stats } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface HomeProps {
  onAddMember: (member: Omit<Member, 'id' | 'participation' | 'registrationDate'>) => void;
  stats: Stats;
}

export default function Home({ onAddMember, stats }: HomeProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    classe: '',
    filiere: '',
    phone: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.lastName && formData.firstName && formData.classe && formData.filiere && formData.phone) {
      onAddMember(formData);
      navigate('/dashboard');
    } else {
      setError('Veuillez remplir tous les champs obligatoires.');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative w-full">
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
      
      <div className="text-center mb-12 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          Rejoignez le <span className="text-primary">Futur</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Inscrivez-vous dès maintenant pour accéder aux ressources exclusives, ateliers tech et projets innovants du Club NTIC.
        </p>
      </div>

      <div className="glass-card w-full max-w-2xl rounded-2xl p-8 md:p-12 glow-shadow">
        <div className="flex items-center gap-3 mb-8">
          <UserPlus className="text-primary" size={28} />
          <h3 className="text-2xl font-bold text-white">Adhésion Membre</h3>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Nom</label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-slate-custom/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-600" 
                  placeholder="Ex: DOSSO" 
                  type="text"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Prénom</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-slate-custom/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-600" 
                  placeholder="Ex: Jean-Marc" 
                  type="text"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Classe</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <select 
                  required
                  value={formData.classe}
                  onChange={(e) => setFormData({...formData, classe: e.target.value})}
                  className="w-full bg-slate-custom/50 border border-white/10 rounded-xl py-3 pl-11 pr-10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                >
                  <option disabled value="">Choisir une classe</option>
                  <option value="BTS 1">BTS 1</option>
                  <option value="BTS 2">BTS 2</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={20} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Filière</label>
              <div className="relative">
                <Network className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <select 
                  required
                  value={formData.filiere}
                  onChange={(e) => setFormData({...formData, filiere: e.target.value})}
                  className="w-full bg-slate-custom/50 border border-white/10 rounded-xl py-3 pl-11 pr-10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                >
                  <option disabled value="">Choisir une filière</option>
                  <option value="IDA">IDA (Informatique développeur d'Application)</option>
                  <option value="FCGE">FCGE (Finance Comptabilité et Gestion d'Entreprise)</option>
                  <option value="TH">TH (Tourisme et Hôtellerie)</option>
                  <option value="AD">AD (Assistance de Direction)</option>
                  <option value="GC">GC (Gestion Commerciale)</option>
                  <option value="LOG">LOG (Logistique)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={20} />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-slate-custom/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-600" 
                placeholder="+225 00 00 00 00 00" 
                type="tel"
              />
            </div>
          </div>
          
          <div className="pt-4">
            <button 
              className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-2 group cursor-pointer" 
              type="submit"
            >
              Valider mon adhésion
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </div>
          <p className="text-center text-xs text-slate-500 mt-4">
            En validant votre adhésion, vous acceptez la charte du club TIC.
          </p>
        </form>
      </div>

      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl px-4">
        <div className="flex flex-col items-center text-center gap-2">
          <Users className="text-primary" size={32} />
          <span className="text-white font-bold text-xl">{stats.activeMembers}</span>
          <span className="text-slate-500 text-sm">Membres Actifs</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <CalendarCheck className="text-primary" size={32} />
          <span className="text-white font-bold text-xl">{stats.eventsPerYear}</span>
          <span className="text-slate-500 text-sm">Événements / an</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <Code className="text-primary" size={32} />
          <span className="text-white font-bold text-xl">{stats.openSourceProjects}+</span>
          <span className="text-slate-500 text-sm">Projets Open Source</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <Award className="text-primary" size={32} />
          <span className="text-white font-bold text-xl">Certifié</span>
          <span className="text-slate-500 text-sm">Partenariats Tech</span>
        </div>
      </div>
    </div>
  );
}
