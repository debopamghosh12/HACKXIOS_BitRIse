import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  User, Mail, Phone, FileText, Upload, Plus, Trash2, Calendar,
  Clock, Pill, CreditCard, ShieldCheck, ArrowRight, Activity, Check, Building2, AlertTriangle
} from 'lucide-react';
import { GlassCard, Button, Input } from '../components/UI';
import { AppState, Medicine, SubscriptionPlan } from '../types';
import { searchMedicines, processPayment, createSubscriptions, addRoutines } from '../services/api';

interface WizardProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  refreshProfiles?: () => void;
  goToDashboard: () => void;
}

const fadeVariants: Variants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)', transition: { duration: 0.3 } }
};

// 1. Patient Form
const PatientStep: React.FC<WizardProps> = ({ state, updateState, nextStep, refreshProfiles, goToDashboard }) => {
  const [showAllergyOther, setShowAllergyOther] = useState(false);
  const [showDiseaseOther, setShowDiseaseOther] = useState(false);
  const [customAllergy, setCustomAllergy] = useState('');
  const [customDisease, setCustomDisease] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(state.patient.allergies || []);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>(state.patient.chronicDiseases || []);
  const [isSaving, setIsSaving] = useState(false);

  const isValid =
    state.patient.fullName.trim() !== '' &&
    state.patient.email.trim() !== '' &&
    state.patient.phone?.trim() !== '' &&
    state.patient.dateOfBirth?.trim() !== '' &&
    state.patient.gender &&
    state.patient.bloodGroup;

  const handleContinue = async () => {
    if (!isValid) return;

    setIsSaving(true);
    try {
      // Get current user
      const { supabase } = await import('../services/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('You must be logged in to save profile.');
        setIsSaving(false);
        return;
      }

      // Prepare patient data
      const patientPayload = {
        owner_id: user.id, // Link to Auth User
        // If we have a patientId, use it to update. If not, don't send it (let DB generate)
        ...(state.patient.patientId ? { patient_id: state.patient.patientId } : {}),
        full_name: state.patient.fullName,
        email: state.patient.email,
        phone: state.patient.phone,
        date_of_birth: state.patient.dateOfBirth,
        gender: state.patient.gender,
        blood_group: state.patient.bloodGroup,
        allergies: selectedAllergies,
        chronic_diseases: selectedDiseases,
        address: state.patient.address
      };

      console.log('Upserting patient profile:', patientPayload);

      const { data: patientData, error: upsertError } = await supabase
        .from('patients')
        .upsert(patientPayload, {
          onConflict: 'patient_id' // Primary Key
        })
        .select()
        .single();

      if (upsertError || !patientData) {
        console.error('CRITICAL: Failed to create/update patient profile.', upsertError);
        alert('Failed to save patient profile. Please try again. ' + (upsertError?.message || ''));
        setIsSaving(false); // Stop here
        return;
      }

      if (patientData) {
        console.log('Patient information saved successfully', patientData);
        console.log('Generated patient_id:', patientData.patient_id);

        // Store the generated patient_id UUID for FK relationships
        updateState({
          patient: {
            ...state.patient,
            id: patientData.patient_id, // Main ID for frontend
            patientId: patientData.patient_id, // Explicit
            ownerId: user.id
          }
        });

        // REFRESH PROFILES LIST
        if (refreshProfiles) {
          console.log('Refreshing profiles list...');
          await refreshProfiles();
        }

        console.log('Updated state with patientId:', patientData.patient_id);
      }

      nextStep();
    } catch (error: any) {
      console.error('Error saving patient info:', error);
      alert('An error occurred: ' + error.message);
      setIsSaving(false);
    }
  };


  const allergyOptions = ['None', 'Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Penicillin', 'Dust', 'Pollen', 'Other'];
  const diseaseOptions = ['None', 'Diabetes', 'Hypertension', 'Asthma', 'Thyroid', 'Heart Disease', 'Arthritis', 'Other'];

  const handleAllergyChange = (value: string) => {
    if (value === 'None') {
      setSelectedAllergies([]);
      setShowAllergyOther(false);
      setCustomAllergy('');
      updateState({ patient: { ...state.patient, allergies: [] } });
    } else if (value === 'Other') {
      setShowAllergyOther(true);
    } else {
      const newAllergies = selectedAllergies.includes(value)
        ? selectedAllergies.filter(a => a !== value)
        : [...selectedAllergies.filter(a => a !== 'None'), value];
      setSelectedAllergies(newAllergies);
      updateState({ patient: { ...state.patient, allergies: newAllergies } });
    }
  };

  const handleDiseaseChange = (value: string) => {
    if (value === 'None') {
      setSelectedDiseases([]);
      setShowDiseaseOther(false);
      setCustomDisease('');
      updateState({ patient: { ...state.patient, chronicDiseases: [] } });
    } else if (value === 'Other') {
      setShowDiseaseOther(true);
    } else {
      const newDiseases = selectedDiseases.includes(value)
        ? selectedDiseases.filter(d => d !== value)
        : [...selectedDiseases.filter(d => d !== 'None'), value];
      setSelectedDiseases(newDiseases);
      updateState({ patient: { ...state.patient, chronicDiseases: newDiseases } });
    }
  };

  const handleCustomAllergyAdd = () => {
    if (customAllergy.trim()) {
      const newAllergies = [...selectedAllergies, customAllergy.trim()];
      setSelectedAllergies(newAllergies);
      updateState({ patient: { ...state.patient, allergies: newAllergies } });
      setCustomAllergy('');
      setShowAllergyOther(false);
    }
  };

  const handleCustomDiseaseAdd = () => {
    if (customDisease.trim()) {
      const newDiseases = [...selectedDiseases, customDisease.trim()];
      setSelectedDiseases(newDiseases);
      updateState({ patient: { ...state.patient, chronicDiseases: newDiseases } });
      setCustomDisease('');
      setShowDiseaseOther(false);
    }
  };

  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-2xl mx-auto">
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

          {/* Date of Birth */}
          <Input
            label="Date of Birth"
            type="date"
            value={state.patient.dateOfBirth || ''}
            onChange={(e) => updateState({ patient: { ...state.patient, dateOfBirth: e.target.value } })}
            icon={<User className="w-4 h-4" />}
            rightIcon={state.patient.fullName.length > 2 ? <Check className="w-4 h-4 text-green-500" /> : undefined}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Gender Dropdown */}
            <div className="relative group">
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider ml-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  className="block w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-light appearance-none"
                  value={state.patient.gender || ''}
                  onChange={(e) => updateState({ patient: { ...state.patient, gender: e.target.value as any } })}
                >
                  <option value="" disabled>Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Blood Group Dropdown */}
            <div className="relative group">
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider ml-1">
                Blood Group <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  className="block w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-light appearance-none"
                  value={state.patient.bloodGroup || ''}
                  onChange={(e) => updateState({ patient: { ...state.patient, bloodGroup: e.target.value as any } })}
                >
                  <option value="" disabled>Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
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
            required
          />

          {/* Allergies Multi-Select */}
          <div className="relative group">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider ml-1">
              Allergies
            </label>
            <div className="relative">
              <select
                className="block w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-light appearance-none"
                onChange={(e) => handleAllergyChange(e.target.value)}
                value=""
              >
                <option value="" disabled>Select allergies</option>
                {allergyOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            {/* Selected Allergies */}
            {selectedAllergies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedAllergies.map((allergy, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {allergy}
                    <button
                      onClick={() => {
                        const newAllergies = selectedAllergies.filter((_, i) => i !== idx);
                        setSelectedAllergies(newAllergies);
                        updateState({ patient: { ...state.patient, allergies: newAllergies } });
                      }}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* Custom Allergy Input */}
            {showAllergyOther && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Enter custom allergy"
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <Button onClick={handleCustomAllergyAdd} className="px-4">Add</Button>
              </motion.div>
            )}
          </div>

          {/* Chronic Diseases Multi-Select */}
          <div className="relative group">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider ml-1">
              Chronic Diseases
            </label>
            <div className="relative">
              <select
                className="block w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-light appearance-none"
                onChange={(e) => handleDiseaseChange(e.target.value)}
                value=""
              >
                <option value="" disabled>Select diseases</option>
                {diseaseOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            {/* Selected Diseases */}
            {selectedDiseases.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedDiseases.map((disease, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                    {disease}
                    <button
                      onClick={() => {
                        const newDiseases = selectedDiseases.filter((_, i) => i !== idx);
                        setSelectedDiseases(newDiseases);
                        updateState({ patient: { ...state.patient, chronicDiseases: newDiseases } });
                      }}
                      className="hover:text-red-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* Custom Disease Input */}
            {showDiseaseOther && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Enter custom disease"
                  value={customDisease}
                  onChange={(e) => setCustomDisease(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <Button onClick={handleCustomDiseaseAdd} className="px-4">Add</Button>
              </motion.div>
            )}
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <Button variant="ghost" onClick={goToDashboard} className="text-slate-400 hover:text-slate-600">Cancel</Button>
          <Button onClick={handleContinue} disabled={!isValid} isLoading={isSaving} className="flex-1">
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </GlassCard>
    </motion.div >
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
              required
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Editable fields
  const [interval, setInterval] = useState(30); // Days between refills
  const [duration, setDuration] = useState(30); // Total days to use medicine

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchMedicines(query);
      if (result && result.medicines) {
        setSearchResults(result.medicines);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMedicine = (medicine: any) => {
    console.log('🔍 Medicine selected:', medicine);
    setSelectedMedicine(medicine);
    setSearchQuery(medicine.brand_name);
    setSearchResults([]);
    console.log('✅ Selected medicine state updated');
  };

  const handleAddMedicine = () => {
    console.log('🔘 Add Medicine button clicked');
    console.log('Selected medicine:', selectedMedicine);

    if (!selectedMedicine) {
      console.error('❌ No medicine selected!');
      return;
    }

    // Calculate dosage_per_day from duration and interval
    const dosage_per_day = Math.ceil(interval / duration);

    const newMedicine: Medicine = {
      id: selectedMedicine.med_id?.toString() || selectedMedicine.id?.toString(),
      name: selectedMedicine.brand_name,
      company: '', // Not in DB
      status: 'In Stock',
      form: 'Tablet',
      strength: selectedMedicine.net_qty || 'N/A',
      dosageQuantity: '1',
      frequency: 'Once daily',
      durationDays: duration,
      mappedProduct: {
        productName: selectedMedicine.brand_name,
        company: '',
        pricePerUnit: selectedMedicine.price || 0,
        packSize: selectedMedicine.net_qty || '',
        inStock: true,
      },
      // Store additional info
      issue_solved: selectedMedicine.issue_solved,
      net_qty: selectedMedicine.net_qty,
      price: selectedMedicine.price,
      interval: interval,
    };

    console.log('✅ New medicine object created:', newMedicine);
    updateState({ medicines: [...state.medicines, newMedicine] });
    console.log('✅ State updated with new medicine');

    // Reset form
    setSelectedMedicine(null);
    setSearchQuery('');
    setInterval(30);
    setDuration(30);
    setIsAdding(false);
    console.log('✅ Form reset complete');
  };

  const removeMed = (id: string) => {
    updateState({ medicines: state.medicines.filter(m => m.id !== id) });
  };

  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-light text-slate-800">Your Medication</h2>
          <p className="text-slate-500 font-light mt-1">Search and add your prescribed medicines.</p>
        </div>
        {!isAdding && (
          <Button variant="outline" onClick={() => setIsAdding(true)} className="rounded-full px-4 py-2 h-10 border-blue-200 text-blue-600 hover:bg-blue-50">
            <Plus className="w-4 h-4 mr-2" /> Add Medicine
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Display Added Medicines */}
        {state.medicines.map(med => (
          <GlassCard key={med.id} className="p-4 sm:p-5 flex items-center justify-between group hover:border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-slate-800">{med.name}</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-green-50 text-green-600 border-green-100 uppercase tracking-wide">
                    In Stock
                  </span>
                </div>

                <p className="text-sm text-slate-500 mt-1">{(med as any).issue_solved || 'General medication'}</p>

                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{(med as any).net_qty || med.strength}</span>
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {med.durationDays} days</span>
                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> Every {(med as any).interval || 30} days</span>
                  <span className="font-medium text-blue-600">₹{(med as any).price || 0}</span>
                </div>
              </div>
            </div>
            <button onClick={() => removeMed(med.id)} className="text-slate-300 hover:text-red-400 transition-colors p-2">
              <Trash2 className="w-5 h-5" />
            </button>
          </GlassCard>
        ))}

        {/* Add New Medicine Form */}
        {isAdding && (
          <GlassCard className="border-blue-200 ring-4 ring-blue-50">
            <div className="space-y-4">
              {/* Medicine Search */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider ml-1">
                  Medicine Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search medicine..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="block w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-light"
                    autoFocus
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-3">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Search Results - Inline within card with smooth expansion */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between px-2 py-1">
                          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                            {searchResults.length} medicine{searchResults.length > 1 ? 's' : ''} found
                          </p>
                          <button
                            onClick={() => {
                              setSearchResults([]);
                              setSearchQuery('');
                            }}
                            className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                          {searchResults.map((medicine, index) => (
                            <motion.button
                              key={medicine.id}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05, duration: 0.2 }}
                              onClick={() => handleSelectMedicine(medicine)}
                              className="w-full p-4 text-left bg-white hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 border-2 border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors text-base">
                                    {medicine.brand_name}
                                  </div>
                                  <div className="text-sm text-slate-600 mt-1.5 line-clamp-2">
                                    {medicine.issue_solved}
                                  </div>
                                  <div className="flex items-center gap-3 mt-3">
                                    <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                      {medicine.net_qty}
                                    </span>
                                    <span className="text-base font-bold text-blue-600">
                                      ₹{medicine.price}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ArrowRight className="w-5 h-5 text-blue-500" />
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Selected Medicine Details (Read-only, grayed out) */}
              {selectedMedicine && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                      Treats
                    </label>
                    <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed">
                      {selectedMedicine.issue_solved || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                      Available Qty
                    </label>
                    <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed">
                      {selectedMedicine.net_qty || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                      Price
                    </label>
                    <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium">
                      ₹{selectedMedicine.price || 0}
                    </div>
                  </div>
                </div>
              )}

              {/* Editable Fields: Interval and Duration */}
              {selectedMedicine && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider ml-1">
                      Interval (Days)
                    </label>
                    <input
                      type="number"
                      placeholder="30"
                      value={interval}
                      onChange={(e) => setInterval(parseInt(e.target.value) || 30)}
                      className="block w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    />
                    <p className="text-xs text-slate-400 mt-1 ml-1">Refill every X days</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider ml-1">
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      placeholder="30"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                      className="block w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    />
                    <p className="text-xs text-slate-400 mt-1 ml-1">Total treatment period</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" onClick={() => {
                  setIsAdding(false);
                  setSelectedMedicine(null);
                  setSearchQuery('');
                  setSearchResults([]);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddMedicine} disabled={!selectedMedicine}>
                  Add Medicine
                </Button>
              </div>
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
  // Calculate Total Base Price from sum of medicines
  const totalBasePrice = state.medicines.reduce((sum, med) => sum + (med.price || 0), 0);

  const plans: SubscriptionPlan[] = [
    {
      id: 'single',
      name: 'Single Refill',
      billingInterval: 'One-time',
      discountPercentage: 10,
      description: 'One-time purchase. Good for trying out.'
    },
    {
      id: 'smart',
      name: 'Smart Refill',
      billingInterval: 'Monthly',
      discountPercentage: 3,
      description: 'Auto-refills every month. Best value & convenience.'
    },
    {
      id: 'quarterly',
      name: 'Quarterly Saver',
      billingInterval: 'Quarterly',
      discountPercentage: 5,
      description: 'Bulk savings. Refills every 3 months.'
    },
  ];

  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-light text-slate-800">Choose your plan</h2>
        <p className="text-slate-500 font-light mt-2">Flexible options designed for adherence.</p>
        <p className="text-xs font-semibold text-slate-400 mt-4 uppercase tracking-widest">
          Total Medicine Value: <span className="text-slate-700">₹{totalBasePrice.toFixed(2)}</span>
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map(plan => {
          const isSelected = state.selectedPlan?.id === plan.id;
          const discountedPrice = totalBasePrice * (1 - plan.discountPercentage / 100);

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
                  ₹{discountedPrice.toFixed(0)}
                </span>
                <span className="text-slate-400 text-sm"> / shipment</span>
                {plan.discountPercentage > 0 && (
                  <div className="text-xs text-slate-400 line-through mt-1">₹{totalBasePrice.toFixed(0)}</div>
                )}
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
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    console.log('=== Payment Debug Info ===');
    console.log('Patient ID (auth):', state.patient.id);
    console.log('Patient ID (database):', state.patient.patientId);
    console.log('Patient Email:', state.patient.email);
    console.log('Patient Full Name:', state.patient.fullName);
    console.log('Selected Plan:', state.selectedPlan);
    console.log('Medicines Count:', state.medicines.length);
    console.log('========================');

    // FALBACK: If patientId is missing but id exists (and is a UUID), use id.
    const effectivePatientId = state.patient.patientId || state.patient.id;

    if (!effectivePatientId || !state.selectedPlan) {
      const errorMsg = !effectivePatientId
        ? 'Missing patient ID - Please complete patient information first'
        : 'Missing plan selection';
      setError(errorMsg);
      console.error('Payment validation failed:', errorMsg);
      return;
    }

    setLoading(true);
    setError(null);
    updateState({ paymentStatus: 'processing' });

    try {
      // Step 1: Create subscriptions in Supabase
      console.log('Creating subscriptions...');
      const subscriptions = await createSubscriptions(
        state.patient.patientId!,  // Use generated patient UUID
        state.medicines,
        state.selectedPlan
      );

      if (!subscriptions || subscriptions.length === 0) {
        throw new Error('Failed to create subscriptions');
      }

      const subscriptionIds = subscriptions.map((sub: any) => sub.id);
      console.log('Subscriptions created:', subscriptionIds);

      // Step 2: Process payment and save to Supabase
      console.log('Processing payment...');
      const totalBasePrice = state.medicines.reduce((sum, med) => sum + (med.price || 0), 0);
      const totalAmount = totalBasePrice * (1 - (state.selectedPlan.discountPercentage || 0) / 100);

      const paymentResult = await processPayment(
        state.patient.patientId!,  // Use generated patient UUID
        subscriptionIds,
        totalAmount,
        state.selectedPlan
      );

      console.log('Payment processed:', paymentResult);

      // Step 3: Add medicine routines/reminders
      console.log('Adding routines...');
      await addRoutines(state.patient.patientId, state.medicines);  // Use patientId (number)

      // Success!
      updateState({ paymentStatus: 'success' });
      setLoading(false);

      setTimeout(() => {
        goToDashboard();
      }, 1500); // Wait for success animation
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      updateState({ paymentStatus: 'error' });
      setLoading(false);
    }
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

  // Calculate totals for render
  const totalBasePrice = state.medicines.reduce((sum, med) => sum + (med.price || 0), 0);
  const totalDue = totalBasePrice * (1 - (state.selectedPlan?.discountPercentage || 0) / 100);

  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
      {/* Summary Column */}
      <div className="space-y-6">
        <h3 className="text-xl font-light text-slate-800">Order Summary</h3>
        <GlassCard className="space-y-4">
          {state.medicines.map(m => (
            <div key={m.id} className="flex justify-between text-sm">
              <span className="text-slate-700">{m.name} <span className="text-slate-400">x {m.durationDays} days</span></span>
              <span className="font-medium text-slate-900">₹{m.price?.toFixed(0) || 0}</span>
            </div>
          ))}
          <div className="h-px bg-slate-200 my-2" />
          <div className="flex justify-between text-base font-medium">
            <span>Total due today</span>
            <span>₹{totalDue.toFixed(0)}</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 mt-2">
            Plan: {state.selectedPlan?.name} ({state.selectedPlan?.billingInterval})
            {state.selectedPlan?.discountPercentage ? ` - ${state.selectedPlan.discountPercentage}% Savings Applied` : ''}
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
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Payment Failed</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="ghost" onClick={prevStep} disabled={loading} className="flex-1">
                Back
              </Button>
              <Button onClick={handlePay} isLoading={loading} className="flex-[2]">
                Pay & Subscribe
              </Button>
            </div>
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