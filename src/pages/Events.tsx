import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  parseISO,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, Plus, X } from 'lucide-react';
import { ClubEvent } from '../types';
import { CurrentUser } from '../App';

interface EventsProps {
  events: ClubEvent[];
  isAdmin?: boolean;
  onAddEvent?: (event: Omit<ClubEvent, 'id'>) => void;
  currentUser?: CurrentUser | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const getEventTypeColor = (type: string) => {
  switch (type) {
    case 'workshop': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'meeting': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'hackathon': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'social': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

const getEventTypeName = (type: string) => {
  switch (type) {
    case 'workshop': return 'Atelier';
    case 'meeting': return 'Réunion';
    case 'hackathon': return 'Hackathon';
    case 'social': return 'Social';
    default: return 'Événement';
  }
};

export default function Events({ events, isAdmin, onAddEvent }: EventsProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<ClubEvent>>({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '12:00',
    location: '',
    type: 'workshop'
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddEvent && newEvent.title && newEvent.date && newEvent.time && newEvent.location && newEvent.type) {
      onAddEvent(newEvent as Omit<ClubEvent, 'id'>);
      setShowAddModal(false);
      setNewEvent({
        title: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '12:00',
        location: '',
        type: 'workshop'
      });
    }
  };

  const selectedDateEvents = selectedDate 
    ? events.filter(event => isSameDay(parseISO(event.date), selectedDate))
    : [];

  return (
    <motion.div 
      className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 flex flex-col gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <CalendarIcon className="text-primary" size={32} />
            Événements
          </h1>
          <p className="text-slate-400 mt-1">Gérez et consultez le calendrier des activités du club.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary/90 text-background-dark px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(43,205,238,0.2)] flex items-center gap-2"
          >
            <Plus size={18} />
            Nouvel Événement
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-700/50 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-100 capitalize">
              {format(currentDate, dateFormat, { locale: fr })}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-primary hover:bg-slate-700/50 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-primary hover:bg-slate-700/50 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              const dayEvents = events.filter(e => isSameDay(parseISO(e.date), day));
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isTodayDate = isToday(day);

              return (
                <div 
                  key={day.toString()} 
                  onClick={() => setSelectedDate(day)}
                  className={`
                    min-h-[80px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1
                    ${!isCurrentMonth ? 'opacity-40 bg-slate-800/20 border-transparent' : 'bg-slate-800/40 border-slate-700/30 hover:border-primary/50'}
                    ${isSelected ? 'ring-2 ring-primary border-transparent bg-primary/5' : ''}
                    ${isTodayDate ? 'border-primary/50 bg-primary/10' : ''}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-bold ${isTodayDate ? 'text-primary' : 'text-slate-300'} ${isSelected ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map(evt => (
                      <div key={evt.id} className={`text-[10px] font-medium px-1.5 py-0.5 rounded truncate border ${getEventTypeColor(evt.type)}`}>
                        {evt.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-slate-500 font-medium pl-1">
                        +{dayEvents.length - 2} autres
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Selected Date Details */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 border border-slate-700/50 shadow-xl flex flex-col h-full min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            {selectedDate ? (
              <>
                <CalendarIcon size={18} className="text-primary" />
                {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </>
            ) : (
              'Sélectionnez une date'
            )}
          </h3>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-4">
            {!selectedDate ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
                <CalendarIcon size={48} className="opacity-20" />
                <p className="text-sm text-center">Cliquez sur un jour du calendrier pour voir les événements prévus.</p>
              </div>
            ) : selectedDateEvents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
                <p className="text-sm">Aucun événement prévu à cette date.</p>
              </div>
            ) : (
              selectedDateEvents.map(evt => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={evt.id} 
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-slate-200 leading-tight">{evt.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border whitespace-nowrap ${getEventTypeColor(evt.type)}`}>
                      {getEventTypeName(evt.type)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-400 leading-relaxed">{evt.description}</p>
                  
                  <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Clock size={14} className="text-primary" />
                      {evt.time}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <MapPin size={14} className="text-primary" />
                      {evt.location}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddModal && isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background-darker/80 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-card rounded-2xl p-6 border border-slate-700/50 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-100">Nouvel Événement</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="flex flex-col gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Titre de l'événement</label>
                  <input 
                    required
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Ex: Atelier React.js"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Date</label>
                    <input 
                      type="date"
                      required
                      value={newEvent.date}
                      onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Heure</label>
                    <input 
                      type="time"
                      required
                      value={newEvent.time}
                      onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Lieu</label>
                    <input 
                      required
                      value={newEvent.location}
                      onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="Ex: Salle Info 1"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Type</label>
                    <select 
                      required
                      value={newEvent.type}
                      onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                    >
                      <option value="workshop">Atelier</option>
                      <option value="meeting">Réunion</option>
                      <option value="hackathon">Hackathon</option>
                      <option value="social">Social</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Description</label>
                  <textarea 
                    required
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[100px] resize-none"
                    placeholder="Description de l'événement..."
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-background-dark px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(43,205,238,0.2)]"
                  >
                    Créer l'événement
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
