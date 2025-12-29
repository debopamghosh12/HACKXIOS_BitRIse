import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  User, Mail, Phone, FileText, Upload, Plus, Trash2, Calendar, 
  Clock, Pill, CreditCard, ShieldCheck, ArrowRight, Activity, Check, Building2, AlertTriangle
} from 'lucide-react';
import { GlassCard, Button, Input } from '../components/UI';
import { AppState, Medicine, SubscriptionPlan } from '../types';
import { searchMedicines, processPayment } from '../services/api';

interface WizardProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToDashboard: () => void;
}

const fadeVariants: Variants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)', transition: { duration: 0.3 } }
};

// 1. Patient Form
const PatientStep: React.FC<WizardProps> = ({ state, updateState, nextStep }) => {
  const isValid = state.patient.fullName && state.patient.email;

  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md mx-auto">
      <GlassCard>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-light text-slate-800">Who is this for?</h2>
          <p className="text-slate-500 font-light mt-2">Let's get your profile set up.</p>
        </div>
        <div className="space-y-4">
          <Input 
            label="Full Name" 
            placeholder="e.g. Jane Doe" 
            value={state.patient.fullName}
            onChange={(e) => updateState({ patient: { ...state.patient, fullName: e.target.value } })}
            icon={<User className="w-4 h-4" />}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Age" 
              type="number" 
              placeholder="e.g. 32" 
              value={state.patient.age || ''}
              onChange={(e) => updateState({ patient: { ...state.patient, age: parseInt(e.target.value) || undefined } })}
            />
            
            {/* Gender Dropdown */}
            <div className="relative group mb-4">
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider ml-1">
                    Gender
                </label>
                <div className="relative">
                    <select
                        className="block w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-light appearance-none"
                        value={state.patient.gender || ''}
                        onChange={(e) => updateState({ patient: { ...state.patient, gender: e.target.value } })}
                    >
                        <option value="" disabled>Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>
          </div>
          <Input 
            label="Email" 
            type="email" 
            placeholder="jane@example.com" 
            value={state.patient.email}
            onChange={(e) => updateState({ patient: { ...state.patient, email: e.target.value } })}
            icon={<Mail className="w-4 h-4" />}
          />
          <Input 
            label="Phone" 
            type="tel" 
            placeholder="(555) 123-4567" 
            value={state.patient.phone}
            onChange={(e) => updateState({ patient: { ...state.patient, phone: e.target.value } })}
            icon={<Phone className="w-4 h-4" />}
          />
        </div>
        <div className="mt-8">
          <Button onClick={nextStep} disabled={!isValid} className="w-full">
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
};

// 2. Diagnosis Step
const DiagnosisStep: React.FC<WizardProps> = ({ state, updateState, nextStep, prevStep }) => {
  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-2xl mx-auto">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Context Card */}
        <GlassCard className="md:col-span-1 h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center mb-3">
              <span className="text-xl font-medium text-blue-600">
                {state.patient.fullName.charAt(0)}
              </span>
            </div>
            <h3 className="font-medium text-slate-800">{state.patient.fullName}</h3>
            <p className="text-xs text-slate-500 mt-1">Patient</p>
          </div>
        </GlassCard>

        {/* Form Card */}
        <GlassCard className="md:col-span-2">
          <div className="mb-6">
            <h2 className="text-2xl font-light text-slate-800">Clinical Context</h2>
            <p className="text-slate-500 font-light mt-2">Help us understand your needs.</p>
          </div>
          
          <div className="space-y-4">
             <Input 
              label="Primary Diagnosis / Reason" 
              placeholder="e.g. Hypertension, Diabetes Type 2" 
              value={state.diagnosis.primaryDiagnosis}
              onChange={(e) => updateState({ diagnosis: { ...state.diagnosis, primaryDiagnosis: e.target.value } })}
              icon={<Activity className="w-4 h-4" />}
            />
            
            <div className="relative group mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider ml-1">
                Doctor's Notes (Optional)
              </label>
              <textarea
                className="block w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-light h-24 resize-none"
                placeholder="Any specific instructions..."
                value={state.diagnosis.notes || ''}
                onChange={(e) => updateState({ diagnosis: { ...state.diagnosis, notes: e.target.value } })}
              />
            </div>

            <div className="mt-6 p-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center hover:border-blue-300 transition-colors cursor-pointer bg-white/30">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 font-medium">Upload Prescription</p>
              <p className="text-xs text-slate-400 mt-1">Drag & drop or click to browse</p>
              <input type="file" className="hidden" />
            </div>
            
            <p className="flex items-center text-xs text-slate-400 mt-2">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Your health data is encrypted and secure.
            </p>
          </div>

          <div className="mt-8 flex gap-3">
             <Button variant="ghost" onClick={prevStep}>Back</Button>
             <Button onClick={nextStep} disabled={!state.diagnosis.primaryDiagnosis} className="flex-1">
              Next Step
            </Button>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

// 3. Medicines Step
const MedicinesStep: React.FC<WizardProps> = ({ state, updateState, nextStep, prevStep }) => {
  const [newMed, setNewMed] = useState<Partial<Medicine>>({ durationDays: 30, frequency: 'Once daily' });
  const [isAdding, setIsAdding] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);

  const handleAdd = () => {
    if (!newMed.name) return;
    const medicine: Medicine = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMed.name,
      company: newMed.company,
      status: suggestions?.inStock ? 'In Stock' : (suggestions ? 'Out of Stock' : 'In Stock'),
      form: (newMed.form as any) || 'Tablet',
      strength: newMed.strength || 'N/A',
      dosageQuantity: newMed.dosageQuantity || '1',
      frequency: newMed.frequency || 'Once daily',
      durationDays: newMed.durationDays || 30,
      mappedProduct: suggestions // Attach the mapped product if found
    };
    updateState({ medicines: [...state.medicines, medicine] });
    setNewMed({ durationDays: 30, frequency: 'Once daily' });
    setSuggestions(null);
    setIsAdding(false);
  };

  const handleNameChange = async (val: string) => {
    setNewMed({ ...newMed, name: val });
    if (val.length >= 3) {
      const result = await searchMedicines(val);
      setSuggestions(result);
      if(result) {
        setNewMed(prev => ({...prev, company: result.company, name: result.productName }));
      }
    } else {
      setSuggestions(null);
    }
  };

  const removeMed = (id: string) => {
    updateState({ medicines: state.medicines.filter(m => m.id !== id) });
  };

  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
           <h2 className="text-2xl font-light text-slate-800">Your Medication</h2>
           <p className="text-slate-500 font-light mt-1">Add your prescribed medicines below.</p>
        </div>
        {!isAdding && (
          <Button variant="outline" onClick={() => setIsAdding(true)} className="rounded-full px-4 py-2 h-10 border-blue-200 text-blue-600 hover:bg-blue-50">
            <Plus className="w-4 h-4 mr-2" /> Add Medicine
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {state.medicines.map(med => (
          <GlassCard key={med.id} className="p-4 sm:p-5 flex items-center justify-between group hover:border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                   <h4 className="font-medium text-slate-800">{med.name} <span className="text-slate-400 font-light text-sm">| {med.strength}</span></h4>
                   {/* Status Badge */}
                   <span className={cn(
                     "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide",
                     med.status === 'Out of Stock' ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"
                   )}>
                     {med.status}
                   </span>
                </div>
                
                <p className="text-sm text-slate-500 font-medium">{med.company || 'Generic'}</p>

                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{med.form}</span>
                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {med.frequency}</span>
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {med.durationDays} days</span>
                </div>
                {med.mappedProduct && (
                  <div className="mt-2 text-xs text-blue-600 flex items-center">
                    <Check className="w-3 h-3 mr-1" /> Matches: {med.mappedProduct.productName}
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => removeMed(med.id)} className="text-slate-300 hover:text-red-400 transition-colors p-2">
              <Trash2 className="w-5 h-5" />
            </button>
          </GlassCard>
        ))}

        {/* Add New Form */}
        {isAdding && (
          <GlassCard className="border-blue-200 ring-4 ring-blue-50">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               {/* Name Input - Full Width */}
               <div className="md:col-span-2 relative">
                 <Input 
                  label="Medicine Name" 
                  placeholder="Start typing..." 
                  value={newMed.name || ''} 
                  onChange={(e) => handleNameChange(e.target.value)}
                  autoFocus
                 />
                 {suggestions && (
                   <div className="absolute top-16 right-0 bg-white shadow-xl border border-blue-100 rounded-lg p-3 z-10 flex items-center gap-3 animate-fade-in">
                     <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">Rx</div>
                     <div>
                       <p className="text-xs font-semibold text-blue-700">Suggestion found</p>
                       <p className="text-xs text-slate-500">{suggestions.productName}</p>
                       <div className="flex items-center gap-1 mt-1">
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            suggestions.inStock ? "bg-green-500" : "bg-red-500"
                          )}/>
                          <span className="text-[10px] text-slate-400">{suggestions.inStock ? 'Available' : 'Out of Stock'}</span>
                       </div>
                     </div>
                   </div>
                 )}
               </div>

               {/* New Company Input */}
               <Input 
                 label="Company Name" 
                 placeholder="e.g. Pfizer" 
                 value={newMed.company || ''} 
                 onChange={e => setNewMed({...newMed, company: e.target.value})} 
                 icon={<Building2 className="w-4 h-4" />}
               />

               <Input label="Strength" placeholder="e.g. 500mg" value={newMed.strength || ''} onChange={e => setNewMed({...newMed, strength: e.target.value})} />
               
               <div className="relative group mb-4">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider ml-1">Form</label>
                  <select 
                    className="block w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    value={newMed.form}
                    onChange={(e) => setNewMed({...newMed, form: e.target.value as any})}
                  >
                    {['Tablet', 'Capsule', 'Syrup', 'Injection'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
               </div>
               <Input label="Dosage Qty" type="text" placeholder="e.g. 1" value={newMed.dosageQuantity || ''} onChange={e => setNewMed({...newMed, dosageQuantity: e.target.value})} />
               <Input label="Duration (Days)" type="number" placeholder="30" value={newMed.durationDays || ''} onChange={e => setNewMed({...newMed, durationDays: parseInt(e.target.value)})} />
             </div>
             
             {/* Status Info (Auto-generated for visual feedback) */}
             <div className="flex items-center gap-2 mb-4 px-1">
                 <span className="text-xs text-slate-400">Status:</span>
                 {suggestions ? (
                   suggestions.inStock ? (
                      <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                         <Check className="w-3 h-3 mr-1" /> Available in stock
                      </span>
                   ) : (
                      <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                         <AlertTriangle className="w-3 h-3 mr-1" /> Currently out of stock
                      </span>
                   )
                 ) : (
                    <span className="text-xs text-slate-400 italic">Enter name to check availability</span>
                 )}
             </div>

             <div className="flex gap-3 justify-end">
               <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
               <Button onClick={handleAdd}>Save Medicine</Button>
             </div>
          </GlassCard>
        )}
      </div>

      <div className="mt-8 flex gap-3">
         <Button variant="ghost" onClick={prevStep}>Back</Button>
         <Button onClick={nextStep} disabled={state.medicines.length === 0} className="flex-1">
          Review Plan
        </Button>
      </div>
    </motion.div>
  );
};

// 4. Plan Selection
const PlanStep: React.FC<WizardProps> = ({ state, updateState, nextStep, prevStep }) => {
  const plans: SubscriptionPlan[] = [
    { id: 'p1', name: 'Single Fill', billingInterval: 'One-time', discountPercentage: 0, description: 'One-time delivery for the specified duration.' },
    { id: 'p2', name: 'Smart Refill', billingInterval: 'Monthly', discountPercentage: 15, description: 'Auto-refills every 30 days. Pause anytime.' },
    { id: 'p3', name: 'Quarterly Saver', billingInterval: 'Quarterly', discountPercentage: 25, description: 'Best value. Refills every 90 days.' },
  ];

  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-10">
         <h2 className="text-3xl font-light text-slate-800">Choose your plan</h2>
         <p className="text-slate-500 font-light mt-2">Flexible options designed for adherence.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map(plan => {
          const isSelected = state.selectedPlan?.id === plan.id;
          return (
            <div 
              key={plan.id}
              onClick={() => updateState({ selectedPlan: plan })}
              className={cn(
                "cursor-pointer relative overflow-hidden rounded-3xl transition-all duration-300 border-2 p-6 flex flex-col h-full",
                isSelected 
                  ? "bg-white border-blue-500 shadow-xl scale-105 z-10" 
                  : "bg-white/40 border-transparent hover:bg-white/60 hover:border-blue-200 hover:shadow-lg"
              )}
            >
              {plan.discountPercentage > 0 && (
                <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-bl-xl">
                  SAVE {plan.discountPercentage}%
                </div>
              )}
              <h3 className="text-lg font-semibold text-slate-800">{plan.name}</h3>
              <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wide">{plan.billingInterval}</p>
              
              <div className="my-6">
                <span className="text-3xl font-light text-slate-900">
                  ${(50 * (1 - plan.discountPercentage/100)).toFixed(0)}
                </span>
                <span className="text-slate-400 text-sm"> / shipment</span>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-grow">
                {plan.description}
              </p>

              <div className={cn(
                "w-full py-2 rounded-full text-center text-sm font-medium transition-colors",
                isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
              )}>
                {isSelected ? 'Selected' : 'Select Plan'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center gap-4">
         <Button variant="ghost" onClick={prevStep}>Back</Button>
         <Button onClick={nextStep} disabled={!state.selectedPlan} className="min-w-[200px]">
          Proceed to Checkout
        </Button>
      </div>
    </motion.div>
  );
};

// 5. Payment Step
const PaymentStep: React.FC<WizardProps> = ({ state, updateState, goToDashboard, prevStep }) => {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    updateState({ paymentStatus: 'processing' });
    await processPayment(100);
    updateState({ paymentStatus: 'success' });
    setLoading(false);
    setTimeout(() => {
        goToDashboard();
    }, 1500); // Wait for success animation
  };

  if (state.paymentStatus === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-6"
        >
          <Check className="w-12 h-12" />
        </motion.div>
        <h2 className="text-3xl font-light text-slate-800 mb-2">You're all set!</h2>
        <p className="text-slate-500">Your plan has been activated.</p>
      </div>
    );
  }

  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
      {/* Summary Column */}
      <div className="space-y-6">
        <h3 className="text-xl font-light text-slate-800">Order Summary</h3>
        <GlassCard className="space-y-4">
          {state.medicines.map(m => (
            <div key={m.id} className="flex justify-between text-sm">
              <span className="text-slate-700">{m.name} <span className="text-slate-400">x {m.durationDays} days</span></span>
              <span className="font-medium text-slate-900">$15.00</span>
            </div>
          ))}
          <div className="h-px bg-slate-200 my-2" />
          <div className="flex justify-between text-base font-medium">
            <span>Total due today</span>
            <span>${(50 * (1 - (state.selectedPlan?.discountPercentage || 0)/100)).toFixed(2)}</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 mt-2">
            Plan: {state.selectedPlan?.name} ({state.selectedPlan?.billingInterval})
          </div>
        </GlassCard>
      </div>

      {/* Payment Form */}
      <div className="space-y-6">
        <h3 className="text-xl font-light text-slate-800">Secure Payment</h3>
        <GlassCard>
          <div className="flex gap-4 mb-6">
             <div className="border border-blue-500 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center">
               <CreditCard className="w-4 h-4 mr-2" /> Card
             </div>
             <div className="border border-slate-200 text-slate-500 px-4 py-2 rounded-lg text-sm font-medium flex items-center">
               Apple Pay
             </div>
          </div>
          
          <div className="space-y-4">
            <Input label="Card Number" placeholder="0000 0000 0000 0000" icon={<CreditCard className="w-4 h-4" />} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Expiry" placeholder="MM/YY" />
              <Input label="CVC" placeholder="123" />
            </div>
            <Input label="Cardholder Name" placeholder="Name on card" />
          </div>

          <div className="mt-8">
            <Button onClick={handlePay} isLoading={loading} className="w-full">
              Pay & Subscribe
            </Button>
            <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 mr-1" /> SSL Secure Transaction
            </p>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

// Main Export
export const Wizard: React.FC<WizardProps> = (props) => {
  const { state } = props;
  
  return (
    <AnimatePresence mode="wait">
      {state.wizardStep === 'patient' && <PatientStep key="patient" {...props} />}
      {state.wizardStep === 'diagnosis' && <DiagnosisStep key="diagnosis" {...props} />}
      {state.wizardStep === 'medicines' && <MedicinesStep key="medicines" {...props} />}
      {state.wizardStep === 'plan' && <PlanStep key="plan" {...props} />}
      {state.wizardStep === 'payment' && <PaymentStep key="payment" {...props} />}
    </AnimatePresence>
  );
};

// Simple utility function for class names
function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}