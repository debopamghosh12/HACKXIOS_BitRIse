import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Heart, Activity, Calendar, Moon, Sun,
   MessageSquare, ArrowRight, Check, Zap, Shield, TrendingUp, Pill, Plus, X, Clock, Droplets, Syringe, Circle, Pipette
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { GlassCard, Button } from './UI';
import { AppState, RoutineItem } from '../types';

// Add Routine Modal Component
const AddRoutineModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: (item: RoutineItem) => void }> = ({ isOpen, onClose, onAdd }) => {
   const [title, setTitle] = useState('');
   const [time, setTime] = useState('08:00');
   const [type, setType] = useState<RoutineItem['type']>('Tablet');

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title) return;

      onAdd({
         id: Math.random().toString(36).substr(2, 9),
         title,
         time,
         type
      });
      setTitle('');
      onClose();
   };

   const medicineTypes: { id: RoutineItem['type'], icon: any, label: string }[] = [
      { id: 'Capsule', icon: Pill, label: 'Capsule' },
      { id: 'Tablet', icon: Circle, label: 'Tablet' },
      { id: 'Syrup', icon: Droplets, label: 'Syrup' },
      { id: 'Injection', icon: Syringe, label: 'Injection' },
      { id: 'Drops', icon: Pipette, label: 'Drops' },
      { id: 'Cream', icon: Shield, label: 'Cream' },
   ];

   if (typeof document === 'undefined') return null;

   return createPortal(
      <AnimatePresence>
         {isOpen && (
            <>
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9999]"
                  onClick={onClose}
               />
               <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-[9999] border border-slate-100"
               >
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-semibold text-slate-800">Add Medicine</h3>
                     <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Medicine Type</label>
                        <div className="grid grid-cols-3 gap-2">
                           {medicineTypes.map((t) => (
                              <div
                                 key={t.id}
                                 onClick={() => setType(t.id)}
                                 className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${type === t.id
                                    ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                                    : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                                    }`}
                              >
                                 <t.icon className="w-6 h-6 mb-1" strokeWidth={1.5} />
                                 <span className="text-[10px] font-medium">{t.label}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Medicine Name</label>
                        <input
                           type="text"
                           placeholder="e.g., Vitamin D, Ibuprofen"
                           value={title}
                           onChange={(e) => setTitle(e.target.value)}
                           className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 placeholder:text-slate-400"
                           autoFocus
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                        <input
                           type="time"
                           value={time}
                           onChange={(e) => setTime(e.target.value)}
                           className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                        />
                     </div>
                     <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 active:scale-[0.98] mt-2"
                     >
                        Add to Routine
                     </button>
                  </form>
               </motion.div>
            </>
         )}
      </AnimatePresence>,
      document.body
   );
};

// 1. Wellness Widget (Deeply decoupled logic)
export const WellnessWidget: React.FC<{ state: AppState }> = ({ state }) => {

   // Calculate dynamic data based on ROUTINE ITEMS now
   const chartData = useMemo(() => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayIndex = new Date().getDay();

      // Calculate Today's Score based on ROUTINE
      const totalItems = state.routineItems.length;
      const completedCount = state.completedRoutineIds.length;
      const todayScore = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

      return days.map((day, index) => {
         let value = 0;
         // Past days: Random 'good' data to simulate history
         if (index < todayIndex) {
            value = 60 + Math.floor(Math.random() * 40);
         }
         // Today: Actual calculated score
         else if (index === todayIndex) {
            value = todayScore;
         }
         // Future: 0
         else {
            value = 0;
         }

         return {
            time: day,
            value: value,
            full: fullDays[index],
            isToday: index === todayIndex,
            status: index > todayIndex ? 'Upcoming' : (value >= 100 ? 'Completed' : 'In Progress')
         };
      });
   }, [state.routineItems, state.completedRoutineIds]);

   return (
      <GlassCard className="h-full flex flex-col justify-between overflow-hidden relative border-blue-100/50">
         <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
               <h3 className="text-2xl font-semibold text-slate-800 tracking-tight">Weekly Progress</h3>
               <p className="text-slate-500 text-sm mt-1">Daily routine accomplishment</p>
            </div>
            <div className="bg-slate-100 rounded-full p-1 flex text-xs font-medium text-slate-600">
               <span className="px-3 py-1 bg-white rounded-full shadow-sm text-slate-800">Week</span>
               <span className="px-3 py-1 text-slate-400 hover:text-slate-600 cursor-pointer">Month</span>
            </div>
         </div>

         <div className="absolute inset-x-0 bottom-0 top-[20%] pt-6">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                     <linearGradient id="colorWellness" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                     </linearGradient>
                  </defs>
                  <Tooltip
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
                     itemStyle={{ color: '#1e40af', fontWeight: 600 }}
                     labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                     cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
                     labelFormatter={(label, payload) => payload[0]?.payload.full || label}
                     formatter={(value: number, name: string, props: any) => [`${value}% Accomplished`, props.payload.status]}
                  />
                  <Area
                     type="monotone"
                     dataKey="value"
                     stroke="#3b82f6"
                     strokeWidth={4}
                     fill="url(#colorWellness)"
                     animationDuration={1500}
                     animationEasing="ease-out"
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>

         <div className="relative z-10 mt-auto flex justify-between items-end text-xs font-semibold text-slate-400 pb-6 px-4">
            {chartData.map((d, i) => (
               <span key={i} className={`rounded-md px-1.5 py-0.5 ${d.isToday ? 'bg-blue-100 text-blue-600' : 'bg-slate-50'}`}>
                  {d.time}
               </span>
            ))}
         </div>
      </GlassCard>
   );
};


// 3. Plan Progress Widget
export const PlanProgressWidget: React.FC = () => {
   return (
      <div className="bg-blue-600 rounded-[2rem] p-6 text-white h-full relative overflow-hidden flex flex-col justify-between shadow-lg shadow-blue-500/30">
         <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
         <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl -ml-10 -mb-10"></div>

         <div className="relative z-10">
            <h3 className="text-2xl font-semibold">Your Plan</h3>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-blue-200 text-sm font-medium uppercase tracking-wider">Weekly Goal</span>
            </div>
         </div>

         <div className="relative z-10 flex items-end gap-1 mt-4">
            <span className="text-6xl font-light tracking-tighter">85</span>
            <span className="text-2xl font-light text-blue-200 mb-1">%</span>
         </div>

         {/* Dots Visualization */}
         <div className="relative z-10 flex gap-1.5 mt-6">
            {[...Array(7)].map((_, i) => (
               <div
                  key={i}
                  className={`h-12 w-3 rounded-full ${i < 5 ? 'bg-white' : 'bg-white/20'}`}
               />
            ))}
         </div>
      </div>
   );
};

// 4. Daily Routine Widget (Manual + Add Functionality)
export const DailyRoutineWidget: React.FC<{
   state: AppState;
   toggleMedicine?: (id: string) => void;
   addRoutineItem?: (item: RoutineItem) => void;
   toggleRoutineItem?: (id: string) => void;
}> = ({ state, toggleRoutineItem, addRoutineItem }) => {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const hasItems = state.routineItems.length > 0;

   // Helper to get icon
   const getIcon = (type: RoutineItem['type']) => {
      switch (type) {
         case 'Capsule': return Pill;
         case 'Syrup': return Droplets;
         case 'Injection': return Syringe;
         case 'Tablet': return Circle;
         case 'Drops': return Pipette;
         case 'Cream': return Shield;
         default: return Pill;
      }
   };

   return (
      <>
         <GlassCard className="h-full flex flex-col relative overflow-hidden group/card">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-semibold text-slate-800">Daily Medications</h3>
               <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-8 h-8 rounded-full bg-blue-600 border border-blue-600 flex items-center justify-center text-white hover:bg-blue-700 hover:scale-105 transition-all shadow-lg shadow-blue-500/30"
               >
                  <Plus className="w-5 h-5" />
               </button>
            </div>

            <div className="space-y-3 relative z-10 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
               {!hasItems ? (
                  <div className="flex flex-col items-center justify-center text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                     <p className="text-slate-500 text-sm font-medium">No medicines added</p>
                     <button onClick={() => setIsModalOpen(true)} className="text-blue-600 text-xs font-bold mt-1 hover:underline">Add manually</button>
                  </div>
               ) : (
                  state.routineItems.map((item) => {
                     const isCompleted = state.completedRoutineIds.includes(item.id);
                     const Icon = getIcon(item.type);

                     return (
                        <div
                           key={item.id}
                           onClick={() => toggleRoutineItem && toggleRoutineItem(item.id)}
                           className="flex items-center gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-slate-50 transition-colors"
                        >
                           <div className="relative">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${isCompleted
                                 ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-200'
                                 : 'bg-white border-slate-200 text-slate-300 group-hover:border-blue-300 group-hover:text-blue-400'
                                 }`}>
                                 {isCompleted ? <Check className="w-5 h-5" strokeWidth={3} /> : <Icon className="w-5 h-5" strokeWidth={1.5} />}
                              </div>
                              {!isCompleted && <div className="absolute top-full left-1/2 w-px h-6 bg-slate-100 -translate-x-1/2 mt-1"></div>}
                           </div>
                           <div className={`transition-opacity ${isCompleted ? 'opacity-50' : 'opacity-100'}`}>
                              <p className="font-medium text-slate-700 group-hover:text-blue-700 transition-colors">{item.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                 <span className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                                    <Clock className="w-3 h-3" /> {item.time}
                                 </span>
                                 {item.type && (
                                    <span className="text-[10px] font-medium text-slate-400 border border-slate-100 px-1.5 py-0.5 rounded">
                                       {item.type}
                                    </span>
                                 )}
                              </div>
                           </div>
                        </div>
                     );
                  })
               )}
            </div>
         </GlassCard>

         <AddRoutineModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAdd={(item) => addRoutineItem && addRoutineItem(item)}
         />
      </>
   );
};

// 5. Quick Stat Widget
export const QuickStatWidget: React.FC<{ type: 'heart' | 'energy' }> = ({ type }) => {
   const isHeart = type === 'heart';

   return (
      <GlassCard className="h-full flex flex-col justify-between p-5 hover:scale-[1.02] transition-transform">
         <div className="flex justify-between items-start">
            <div>
               <h4 className="font-semibold text-slate-800 text-lg">{isHeart ? 'Heart Rate' : 'Energy Level'}</h4>
               <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{isHeart ? 'Avg Bpm' : 'Status'}</p>
            </div>
            {isHeart ? (
               <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-current" />
               </div>
            ) : (
               <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 fill-current" />
               </div>
            )}
         </div>

         <div className="mt-4">
            {isHeart ? (
               <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-800">72</span>
                  <span className="text-sm text-slate-400">bpm</span>
               </div>
            ) : (
               <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full w-[80%] bg-amber-400 rounded-full"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-800">High</span>
               </div>
            )}
         </div>
      </GlassCard>
   );
};
