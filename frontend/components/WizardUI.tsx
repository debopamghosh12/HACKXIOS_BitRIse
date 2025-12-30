import React from 'react';
import { motion } from 'framer-motion';
import { User, Activity, Pill, CreditCard, Check, Clock, Calendar } from 'lucide-react';
import { GlassCard } from './UI';
import { AppState } from '../types';

// --- Wizard Stepper ---
interface StepperProps {
  currentStep: number;
}

export const WizardStepper: React.FC<StepperProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Profile', icon: User },
    { id: 2, label: 'Health', icon: Activity },
    { id: 3, label: 'Medicines', icon: Pill },
    { id: 4, label: 'Plan', icon: CreditCard },
  ];

  return (
    <div className="flex items-center justify-between relative mb-8 max-w-3xl mx-auto px-4">
      {/* Background Line */}
      <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2 rounded-full" />

      {/* Active Line Progress */}
      <div
        className="absolute left-0 top-1/2 h-0.5 bg-blue-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
      />

      {steps.map((step) => {
        const isActive = currentStep >= step.id;
        const isCurrent = currentStep === step.id;

        return (
          <div key={step.id} className="flex flex-col items-center gap-2 bg-white/50 backdrop-blur-sm p-2 rounded-xl">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110' : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
            >
              <step.icon className="w-5 h-5" />
            </div>
            <span className={`text-xs font-semibold tracking-wide transition-colors ${isActive ? 'text-blue-700' : 'text-slate-400'
              }`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// --- Summary Sidebar ---
interface SidebarProps {
  state: AppState;
}

export const SummarySidebar: React.FC<SidebarProps> = ({ state }) => {
  const medicineCount = state.medicines.length;

  // Calculate Base Price
  const totalBasePrice = state.medicines.reduce((sum, med) => sum + (med.price || 0), 0);

  // Calculate Final Price with Discount
  const planCost = state.selectedPlan
    ? (totalBasePrice * (1 - state.selectedPlan.discountPercentage / 100)).toFixed(0)
    : totalBasePrice.toFixed(0);

  return (
    <div className="sticky top-8 space-y-4">
      <GlassCard className="p-5 border-blue-100">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Live Summary</h3>

        {/* Patient Short Info */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
            {state.patient.fullName ? state.patient.fullName.charAt(0) : 'G'}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{state.patient.fullName || 'Guest'}</p>
            <p className="text-xs text-slate-500">{state.patient.gender || 'Profile not set'}</p>
          </div>
        </div>

        {/* Medicines List */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center text-xs font-medium text-slate-500">
            <span>Medicines</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded-full">{medicineCount}</span>
          </div>

          {medicineCount === 0 ? (
            <div className="text-center py-4 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
              <p className="text-xs text-slate-400 italic">No medicines yet</p>
            </div>
          ) : (
            <div className="max-h-[200px] overflow-y-auto pr-1 custom-scrollbar space-y-2">
              {state.medicines.map(med => (
                <div key={med.id} className="flex items-center justify-between p-2 rounded-lg bg-white/50 border border-slate-100">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Pill className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-700 truncate">{med.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">₹{med.price?.toFixed(0) || 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plan Preview */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-blue-700">Estimated Total</span>
            <span className="text-lg font-bold text-blue-800">₹{planCost}<span className="text-xs font-normal opacity-70"> / mo</span></span>
          </div>
          {state.selectedPlan && (
            <div className="flex justify-between items-center text-[10px] text-blue-500 mt-1">
              <span>{state.selectedPlan.name}</span>
              {state.selectedPlan.discountPercentage > 0 && <span className="text-green-600 font-bold">-{state.selectedPlan.discountPercentage}%</span>}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 justify-center">
          <Check className="w-3 h-3" /> Secure SSL Encryption
        </div>
      </GlassCard>
    </div>
  );
};
