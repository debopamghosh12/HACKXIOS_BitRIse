import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Calendar, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { GlassCard } from '../components/UI';
import { AppState } from '../types';

export const Dashboard: React.FC<{ state: AppState }> = ({ state }) => {
  const [takenMeds, setTakenMeds] = useState<string[]>([]);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Calculate stats based on real interactions
  const totalMeds = state.medicines.length;
  const takenCount = takenMeds.length;
  const progressPercentage = totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 0;
  
  const chartData = [
    { name: 'Taken', value: takenCount || 0.1 }, // 0.1 prevents chart from disappearing entirely
    { name: 'Remaining', value: totalMeds - takenCount },
  ];
  
  // Updated Chart Colors: Blue for taken, lighter slate for remaining
  const COLORS = ['#3b82f6', '#f1f5f9'];

  const handleTakeDose = (id: string) => {
    if (takenMeds.includes(id)) return;
    setTakenMeds(prev => [...prev, id]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-6xl mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-slate-800">Hello, {state.patient.fullName.split(' ')[0]}</h1>
          <p className="text-slate-500 font-light mt-1">Here is your wellness overview for {today}.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white/50 backdrop-blur rounded-full px-4 py-2 border border-white/60">
           <div className={`w-2 h-2 rounded-full ${state.selectedPlan ? 'bg-blue-500' : 'bg-slate-300'} animate-pulse`}></div>
           <span className="text-sm text-slate-600">Status: {state.selectedPlan ? 'Active Plan' : 'No Plan'}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Column: Schedule */}
        <div className="md:col-span-2 space-y-6">
          <section>
            <h3 className="text-lg font-medium text-slate-700 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary-500" /> Today's Schedule
            </h3>
            <div className="space-y-3">
              {state.medicines.map((med) => {
                const isTaken = takenMeds.includes(med.id);
                
                return (
                  <motion.div
                    key={med.id}
                    layout
                    initial={false}
                    animate={{ 
                      rotate: isTaken ? 1 : 0, 
                      scale: isTaken ? 0.98 : 1,
                      opacity: isTaken ? 0.7 : 1
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <GlassCard className={`p-4 flex items-center justify-between group cursor-pointer transition-colors ${isTaken ? 'border-blue-200 bg-blue-50/30' : 'hover:border-primary-300'}`}>
                       <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-sm transition-colors ${isTaken ? 'bg-blue-100 border-blue-200' : 'bg-gradient-to-br from-white to-slate-50 border-slate-100'}`}>
                           <span className={`text-xs font-bold ${isTaken ? 'text-blue-600' : 'text-slate-400'}`}>08:00</span>
                         </div>
                         <div>
                           <h4 className={`font-medium transition-colors ${isTaken ? 'text-blue-800 line-through decoration-blue-300' : 'text-slate-800'}`}>{med.name}</h4>
                           <p className="text-xs text-slate-500">{med.strength} • {med.dosageQuantity} unit(s)</p>
                         </div>
                       </div>
                       
                       <motion.button 
                         onClick={() => handleTakeDose(med.id)}
                         whileTap={{ scale: 0.9 }}
                         animate={{ 
                           backgroundColor: isTaken ? '#3b82f6' : 'transparent',
                           borderColor: isTaken ? '#3b82f6' : '#e2e8f0',
                           color: isTaken ? '#ffffff' : '#cbd5e1'
                         }}
                         className="w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500"
                         disabled={isTaken}
                       >
                         {isTaken ? (
                           <motion.div
                             initial={{ scale: 0 }}
                             animate={{ scale: 1 }}
                             transition={{ type: "spring", stiffness: 400, damping: 10 }}
                           >
                             <Check className="w-5 h-5" />
                           </motion.div>
                         ) : (
                           <Check className="w-5 h-5" />
                         )}
                       </motion.button>
                    </GlassCard>
                  </motion.div>
                );
              })}
              {state.medicines.length === 0 && (
                 <GlassCard className="p-8 text-center text-slate-400 italic">No medicines scheduled for today.</GlassCard>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-medium text-slate-700 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-500" /> Upcoming Refills
            </h3>
            <GlassCard className="flex items-center gap-4 p-5">
               <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                 <AlertCircle className="w-5 h-5" />
               </div>
               <div className="flex-1">
                 <h4 className="font-medium text-slate-800">Monthly Refill</h4>
                 <p className="text-xs text-slate-500">Scheduled for {new Date(Date.now() + 25 * 86400000).toLocaleDateString()}</p>
               </div>
               <button className="text-sm text-primary-600 font-medium hover:underline">Manage</button>
            </GlassCard>
          </section>
        </div>

        {/* Right Column: Stats */}
        <div className="space-y-6">
          <GlassCard className="flex flex-col items-center justify-center text-center py-8">
            <h3 className="text-lg font-medium text-slate-700 mb-2">Daily Progress</h3>
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={75}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <motion.span 
                   key={progressPercentage}
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="text-3xl font-light text-slate-800"
                 >
                   {progressPercentage}%
                 </motion.span>
                 <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                   {progressPercentage === 100 ? 'Completed' : 'Taken'}
                 </span>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-2 px-4">
              {progressPercentage === 100 
                ? "Excellent job! You've completed your schedule." 
                : "Keep going to reach your daily goal."}
            </p>
          </GlassCard>
          
          {/* Blue Gradient Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/30">
             <h4 className="font-medium text-lg mb-2">Need Help?</h4>
             <p className="text-blue-100 text-sm mb-4">Chat with a pharmacist about your new prescription.</p>
             <button className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-medium w-full hover:bg-blue-50 transition-colors">
               Start Chat
             </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};