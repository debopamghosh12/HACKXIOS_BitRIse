import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Check, AlertCircle, Package } from 'lucide-react';
import { GlassCard, Button } from '../components/UI';
import { AppState } from '../types';
import { getNextRefillDate } from '../utils/dateUtils';

interface SubscriptionPageProps {
  state: AppState;
  updateState?: (updates: Partial<AppState>) => void;
  toggleRoutineItem?: (id: string) => void;
  setMedicineReminderTime?: (medicineId: string, time: string) => void;
  goToSearch: () => void;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ state, updateState, toggleRoutineItem, setMedicineReminderTime, goToSearch }) => {
  const hasPlan = state.selectedPlan !== null;
  const today = new Date().toISOString().split('T')[0];
  const subscribedMedicines = state.medicines.filter((med) => !med.isPendingPurchase);
  const totalRefillAmount = subscribedMedicines.reduce((sum, med) => {
    const unitPrice = Number(med.price ?? med.mappedProduct?.pricePerUnit ?? 0);
    const quantity = Math.max(1, Number(med.dosageQuantity || 1));
    const safeUnitPrice = Number.isFinite(unitPrice) ? unitPrice : 0;
    const safeQuantity = Number.isFinite(quantity) ? quantity : 1;
    return sum + (safeUnitPrice * safeQuantity);
  }, 0);
  // Calculate consistent billing date
  const nextBillingDate = getNextRefillDate(new Date(), 30);
  const getDisplayMedicineName = (med: any) => {
    const primary = String(med?.name || '').trim();
    if (primary && !/^unknown medicine$/i.test(primary)) return primary;

    const product = String(med?.mappedProduct?.productName || '').trim();
    if (product && !/^unknown medicine$/i.test(product)) return product;

    const numericId = Number(med?.id);
    if (Number.isFinite(numericId) && numericId > 0) return `Medicine #${numericId}`;

    return 'Medicine';
  };
  // ...


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
              {nextBillingDate}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Total refill amount: <span className="font-semibold text-slate-700">₹{totalRefillAmount.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div className="h-px bg-slate-200 my-6" />

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Medicines in this plan</h4>
          {subscribedMedicines.map((med) => (
            <div key={med.id} className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-white/60">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{getDisplayMedicineName(med)}</p>
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
            <GlassCard key={med.id} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <input
                    type="time"
                    value={state.medicineReminderTimes?.[med.id] || state.notificationSettings.refillReminderTime || '08:00'}
                    onChange={(e) => setMedicineReminderTime && setMedicineReminderTime(med.id, e.target.value)}
                    className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200"
                  />
                  <span className="text-[10px] text-slate-400">Set time</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">{getDisplayMedicineName(med)}</span>
                  {state.routineCompletionLog?.[`${today}:${med.id}`] && (
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-xs text-green-600">
                        Taken at {new Date(state.routineCompletionLog[`${today}:${med.id}`]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {(() => {
                        const completionAt = new Date(state.routineCompletionLog[`${today}:${med.id}`]);
                        const scheduled = state.medicineReminderTimes?.[med.id] || state.notificationSettings.refillReminderTime || '08:00';
                        const [h, m] = scheduled.split(':').map(Number);
                        const scheduledAt = new Date();
                        scheduledAt.setHours(h || 0, m || 0, 0, 0);
                        const diffMin = Math.round((completionAt.getTime() - scheduledAt.getTime()) / 60000);
                        const isOnTime = Math.abs(diffMin) <= 30;
                        return (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${isOnTime ? 'text-green-700 bg-green-50 border-green-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                            {isOnTime ? 'On time' : 'Late'}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleRoutineItem && toggleRoutineItem(med.id)}
                className={`w-8 h-8 rounded-full border flex items-center justify-center ${state.completedRoutineIds.includes(`${today}:${med.id}`)
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'border-slate-200 text-slate-300 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500'
                  }`}
              >
                <Check className="w-4 h-4" />
              </button>
            </GlassCard>
          ))}
        </div>
      </section>

    </motion.div>
  );
};