import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Check, AlertCircle, Package } from 'lucide-react';
import { GlassCard, Button } from '../components/UI';
import { AppState } from '../types';

interface SubscriptionPageProps {
    state: AppState;
    updateState?: (updates: Partial<AppState>) => void;
    goToSearch: () => void;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ state, updateState, goToSearch }) => {
  const hasPlan = state.selectedPlan !== null;

  const handleCancelPlan = () => {
      if (updateState) {
          updateState({ selectedPlan: null, wizardStep: 'plan' });
      }
  };

  if (!hasPlan) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-300">
          <Package className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-light text-slate-800 mb-2">No Active Subscriptions</h2>
        <p className="text-slate-500 mb-8 font-light">You haven't set up a medication plan yet.</p>
        <Button onClick={goToSearch}>Find your medication</Button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-slate-800">Your Subscription</h1>
          <p className="text-slate-500 font-light mt-1">Manage your deliveries and schedule.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
           <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
           Active
        </div>
      </div>

      <GlassCard className="border-blue-100 bg-white/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-medium text-slate-800 mb-1">{state.selectedPlan?.name}</h3>
            <p className="text-slate-500 text-sm">{state.selectedPlan?.description}</p>
          </div>
          <div className="text-right">
             <p className="text-sm text-slate-400 uppercase tracking-wide font-medium">Next Billing</p>
             <p className="text-lg font-semibold text-slate-800">
               {new Date(Date.now() + 30 * 86400000).toLocaleDateString()}
             </p>
          </div>
        </div>
        
        <div className="h-px bg-slate-200 my-6" />

        <div className="space-y-4">
           <h4 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Medicines in this plan</h4>
           {state.medicines.map((med) => (
             <div key={med.id} className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-white/60">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{med.name}</p>
                    <p className="text-xs text-slate-500">{med.strength} • {med.frequency}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  Refill in 25 days
                </div>
             </div>
           ))}
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50">Pause Subscription</Button>
          <Button 
            variant="ghost" 
            className="text-red-400 hover:text-red-500 hover:bg-red-50"
            onClick={handleCancelPlan}
          >
            Cancel
          </Button>
        </div>
      </GlassCard>

      {/* Adherence / Schedule Preview */}
      <section>
        <h3 className="text-lg font-medium text-slate-700 mb-4 flex items-center">
           <Calendar className="w-5 h-5 mr-2 text-primary-500" /> Daily Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.medicines.map((med) => (
             <GlassCard key={med.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">08:00</div>
                   <span className="font-medium text-slate-700">{med.name}</span>
                </div>
                <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500">
                   <Check className="w-4 h-4" />
                </button>
             </GlassCard>
          ))}
        </div>
      </section>

    </motion.div>
  );
};