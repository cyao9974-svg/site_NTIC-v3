import React, { useState, useEffect } from 'react';
import { Users, Zap, GraduationCap, Search, Filter, Download, ChevronLeft, ChevronRight, MoreVertical, TrendingUp, X, ArrowUpDown, ArrowUp, ArrowDown, Loader2, Calendar } from 'lucide-react';
import { Member, Stats } from '../types';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';

import { CurrentUser } from '../App';

interface DashboardProps {
  members: Member[];
  isAdmin?: boolean;
  onUpdateMember?: (id: string, updates: Partial<Member>) => void;
  currentUser?: CurrentUser | null;
  stats: Stats;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const getClassColor = (classe: string) => {
  if (classe.includes('1')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (classe.includes('2')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (classe.includes('3')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  return 'bg-slate-800 text-slate-300 border-slate-700';
};

const getInitials = (first: string, last: string) => {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
};

type SortColumn = 'name' | 'id' | 'classe' | 'filiere' | 'phone' | 'participation' | null;

const ParticipationInput = ({ member, onUpdate }: { member: Member, onUpdate: (id: string, updates: Partial<Member>) => void }) => {
  const [inputValue, setInputValue] = useState(member.participation.toString());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error && parseInt(inputValue, 10) !== member.participation) {
      setInputValue(member.participation.toString());
    }
  }, [member.participation, error, inputValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (val === '') {
      setError('Requis');
      return;
    }

    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setError('Invalide');
      return;
    }

    if (num < 0 || num > 100) {
      setError('0 - 100');
      return;
    }

    setError(null);
    onUpdate(member.id, { participation: num });
  };

  return (
    <div className="relative flex flex-col items-end">
      <div className="relative flex items-center">
        <input 
          type="number" 
          value={inputValue}
          onChange={handleChange}
          className={`w-16 bg-slate-800/40 border ${error ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/50 text-red-200' : 'border-slate-700/50 focus:border-primary/50 focus:ring-primary/50 text-slate-100'} focus:ring-1 rounded-md pl-2 pr-5 py-1 text-xs font-bold outline-none text-right transition-all`}
        />
        <span className={`absolute right-2 text-xs pointer-events-none ${error ? 'text-red-400/70' : 'text-slate-400'}`}>%</span>
      </div>
      {error && (
        <motion.span 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="absolute -bottom-5 right-0 text-[10px] font-medium text-red-400 whitespace-nowrap"
        >
          {error}
        </motion.span>
      )}
    </div>
  );
};

export default function Dashboard({ members, isAdmin = false, onUpdateMember, currentUser, stats }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showWelcome, setShowWelcome] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (currentUser) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsFiltering(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <ArrowUpDown size={14} className="ml-1 opacity-40 group-hover:opacity-100 transition-opacity" />;
    return sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1 text-primary" /> : <ArrowDown size={14} className="ml-1 text-primary" />;
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.lastName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
                          m.firstName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                          (isAdmin && m.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
    
    let matchesDate = true;
    if (startDate && m.registrationDate) {
      matchesDate = matchesDate && m.registrationDate >= startDate;
    }
    if (endDate && m.registrationDate) {
      matchesDate = matchesDate && m.registrationDate <= endDate;
    }

    return matchesSearch && matchesDate;
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (!sortColumn) return 0;

    let valA: any = a[sortColumn as keyof Member];
    let valB: any = b[sortColumn as keyof Member];

    if (sortColumn === 'name') {
      valA = `${a.lastName} ${a.firstName}`.toLowerCase();
      valB = `${b.lastName} ${b.firstName}`.toLowerCase();
    } else if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleExportXLSX = async () => {
    if (!isAdmin) return;
    setIsExporting(true);

    // Simulate processing time for UX feedback
    await new Promise(resolve => setTimeout(resolve, 800));

    const dataToExport = sortedMembers.map(m => ({
      'ID': m.id,
      'Nom': m.lastName,
      'Prénom': m.firstName,
      'Classe': m.classe,
      'Filière': m.filiere,
      'Téléphone': m.phone,
      'Participation (%)': m.participation
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Membres");
    
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `membres_ntic_${date}.xlsx`);
    
    setIsExporting(false);
    setShowExportConfirm(false);
  };

  return (
    <motion.div 
      className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {showWelcome && currentUser && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(43,205,238,0.15)]"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-slate-100 font-bold">Bienvenue, {currentUser.name} !</h3>
              <p className="text-slate-400 text-sm">
                {currentUser.role === 'admin' 
                  ? "Vous êtes connecté en tant qu'administrateur. Vous avez accès à toutes les fonctionnalités de gestion." 
                  : "Votre inscription a été validée. Vous êtes maintenant membre du club NTIC."}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowWelcome(false)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl flex items-center justify-between group hover:border-primary/40 transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
              <Users className="text-primary" size={28} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Total Membres</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-slate-100">{stats.activeMembers}</p>
                <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-md">
                  <TrendingUp size={12} className="mr-1" /> +12%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl flex items-center justify-between group hover:border-primary/40 transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
              <Zap className="text-primary" size={28} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Participations</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-slate-100">{stats.participations.toLocaleString()}</p>
                <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-md">
                  <TrendingUp size={12} className="mr-1" /> +5%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl flex items-center justify-between group hover:border-primary/40 transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
              <GraduationCap className="text-primary" size={28} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Classes Actives</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-slate-100">{stats.activeClasses}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto flex-1">
            <div className="relative w-full max-w-md group transition-all duration-300 focus-within:scale-[1.02]">
              {isFiltering ? (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-primary animate-spin" size={20} />
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
              )}
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/40 border border-slate-700/50 focus:border-primary/60 focus:ring-1 focus:ring-primary/60 focus:shadow-[0_0_20px_rgba(43,205,238,0.25)] rounded-xl pl-10 pr-10 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-300 shadow-inner" 
                placeholder={isAdmin ? "Rechercher un membre par nom ou ID..." : "Rechercher un membre par nom..."} 
                type="text"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/50 rounded-xl px-3 py-1.5 shadow-inner">
              <Calendar size={18} className="text-slate-500" />
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-sm text-slate-300 outline-none focus:text-primary transition-colors cursor-pointer [&::-webkit-calendar-picker-indicator]:filter-[invert(1)] [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                />
                <span className="text-slate-500 text-sm">à</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-sm text-slate-300 outline-none focus:text-primary transition-colors cursor-pointer [&::-webkit-calendar-picker-indicator]:filter-[invert(1)] [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                />
              </div>
              {(startDate || endDate) && (
                <button 
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="ml-2 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Effacer les dates"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-800/40 text-sm font-medium text-slate-300 hover:bg-slate-700/80 hover:text-white transition-all cursor-pointer shadow-sm">
              <Filter size={18} />
              Filtrer
            </button>
            {isAdmin && (
              <button 
                onClick={() => setShowExportConfirm(true)}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-primary/30 bg-primary/10 text-sm font-medium text-primary hover:bg-primary hover:text-background-dark transition-all cursor-pointer shadow-[0_0_15px_rgba(43,205,238,0.15)] hover:shadow-[0_0_20px_rgba(43,205,238,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {isExporting ? 'Exportation...' : 'Exporter XLSX'}
              </button>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden border border-slate-700/50 shadow-xl relative">
          {/* Shimmer Loading Overlay */}
          {isFiltering && (
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] transition-all duration-300" />
              <motion.div 
                className="absolute inset-y-0 w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent -skew-x-12"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              />
            </div>
          )}
          
          {/* Mobile Scroll Hint */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900/80 to-transparent pointer-events-none md:hidden z-10"></div>
          
          <div className="overflow-x-auto pb-2 custom-scrollbar relative">
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/40 border-b border-slate-700/50">
                  <th onClick={() => handleSort('name')} className="px-6 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-slate-700/30 hover:text-slate-200 transition-colors group">
                    <div className="flex items-center">Membre <SortIcon column="name" /></div>
                  </th>
                  {isAdmin && (
                    <th onClick={() => handleSort('id')} className="px-6 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-slate-700/30 hover:text-slate-200 transition-colors group">
                      <div className="flex items-center">ID <SortIcon column="id" /></div>
                    </th>
                  )}
                  <th onClick={() => handleSort('classe')} className="px-6 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center whitespace-nowrap cursor-pointer hover:bg-slate-700/30 hover:text-slate-200 transition-colors group">
                    <div className="flex items-center justify-center">Classe <SortIcon column="classe" /></div>
                  </th>
                  <th onClick={() => handleSort('filiere')} className="px-6 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-slate-700/30 hover:text-slate-200 transition-colors group">
                    <div className="flex items-center">Filière <SortIcon column="filiere" /></div>
                  </th>
                  <th className="px-6 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center">Inscription</div>
                  </th>
                  {isAdmin && (
                    <th onClick={() => handleSort('phone')} className="px-6 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-slate-700/30 hover:text-slate-200 transition-colors group">
                      <div className="flex items-center">Téléphone <SortIcon column="phone" /></div>
                    </th>
                  )}
                  <th onClick={() => handleSort('participation')} className="px-6 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-slate-700/30 hover:text-slate-200 transition-colors group">
                    <div className="flex items-center">Participation <SortIcon column="participation" /></div>
                  </th>
                  <th className="px-6 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {sortedMembers.map((member, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={
                      isFiltering 
                        ? { opacity: [0.3, 0.7, 0.3], scale: [1, 0.995, 1] } 
                        : { opacity: 1, y: 0, scale: 1 }
                    }
                    transition={
                      isFiltering
                        ? { repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: (idx % 15) * 0.08 }
                        : { delay: idx * 0.05, duration: 0.3 }
                    }
                    key={member.id} 
                    className={`even:bg-slate-800/20 hover:bg-slate-700/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_0_20px_rgba(255,255,255,0.03)] border-l-4 border-transparent hover:border-primary hover:-translate-y-[1px] transition-all duration-300 ease-out group cursor-pointer ${isFiltering ? 'pointer-events-none' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-sm font-bold text-slate-300 shadow-inner shrink-0">
                          {getInitials(member.firstName, member.lastName)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200 uppercase tracking-wide group-hover:text-primary transition-colors">{member.lastName}</p>
                          <p className="text-xs text-slate-400 capitalize">{member.firstName}</p>
                        </div>
                      </div>
                    </td>
                    {isAdmin && <td className="px-6 py-4 text-sm text-slate-500 font-mono whitespace-nowrap">{member.id}</td>}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold border ${getClassColor(member.classe)}`}>
                        {member.classe}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">{member.filiere}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 whitespace-nowrap">
                      {member.registrationDate ? new Date(member.registrationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    {isAdmin && <td className="px-6 py-4 text-sm text-slate-400 font-mono whitespace-nowrap">{member.phone}</td>}
                    <td className={`px-6 py-4 whitespace-nowrap transition-all duration-300 ${isAdmin && onUpdateMember ? 'hover:bg-slate-700/60 hover:shadow-[inset_0_0_20px_rgba(43,205,238,0.15)] relative z-10' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, Math.max(0, member.participation))}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-primary shadow-[0_0_10px_#2bcdee]" 
                          />
                        </div>
                        {isAdmin && onUpdateMember ? (
                          <ParticipationInput member={member} onUpdate={onUpdateMember} />
                        ) : (
                          <span className="text-xs font-bold text-slate-300 w-8">{member.participation}%</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button className="p-2 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
                {sortedMembers.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium text-slate-400">Aucun membre trouvé</p>
                        <p className="text-sm mt-1">Essayez de modifier vos critères de recherche.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 bg-slate-800/20 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-medium text-center sm:text-left">Affichage de <span className="text-slate-300">1</span> à <span className="text-slate-300">{Math.min(sortedMembers.length, 5)}</span> sur <span className="text-slate-300">{members.length + 1243}</span> membres</p>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-2 sm:pb-0 custom-scrollbar">
              <button className="p-2 rounded-lg hover:bg-slate-700 text-slate-500 transition-colors cursor-pointer">
                <ChevronLeft size={18} />
              </button>
              <span className="w-8 h-8 flex items-center justify-center bg-primary text-background-dark text-xs font-bold rounded-lg shadow-[0_0_10px_rgba(43,205,238,0.3)]">1</span>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 text-slate-400 text-xs font-medium rounded-lg transition-colors cursor-pointer">2</button>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 text-slate-400 text-xs font-medium rounded-lg transition-colors cursor-pointer">3</button>
              <span className="text-slate-600 px-1">...</span>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 text-slate-400 text-xs font-medium rounded-lg transition-colors cursor-pointer">12</button>
              <button className="p-2 rounded-lg hover:bg-slate-700 text-slate-500 transition-colors cursor-pointer">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Export Confirmation Modal */}
      {showExportConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-darker/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-900 border border-slate-700/50 p-6 rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
            <h3 className="text-xl font-bold text-slate-100 mb-2 flex items-center gap-2">
              <Download className="text-primary" size={20} />
              Confirmer l'exportation
            </h3>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              Are you sure you want to export the member data?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowExportConfirm(false)}
                disabled={isExporting}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleExportXLSX}
                disabled={isExporting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-primary text-background-dark hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(43,205,238,0.2)] disabled:opacity-70"
              >
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {isExporting ? 'Exportation...' : 'Confirmer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
