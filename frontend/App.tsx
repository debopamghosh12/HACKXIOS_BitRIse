import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Home, Search, Package, Settings, LogOut, User, Plus, Check, Users } from 'lucide-react';
import { AppState, INITIAL_STATE, Step, WizardStep, ActiveTab, Medicine, RoutineItem } from './types';
import { Wizard } from './pages/Wizard';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { Dashboard } from './pages/Dashboard';
import { SettingsPage } from './pages/SettingsPage';
import { Stepper } from './components/UI';

const APP_STATE_STORAGE_KEY = 'sanvix_app_state_v1';

const App: React.FC = () => {
    const [state, setState] = useState<AppState>(INITIAL_STATE);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [showProfileMenu, setShowProfileMenu] = useState(false); // Local state for dropdown

    const updateState = (updates: Partial<AppState>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    // Check for existing session on app load
    useEffect(() => {
        const checkSession = async () => {
            try {
                const { supabase } = await import('./services/supabase');
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    console.log('✅ Existing session found, auto-logging in...');

                    // Fetch ALL user profiles
                    const { data: profiles } = await supabase
                        .from('patients')
                        .select('*')
                        .eq('owner_id', session.user.id);

                    // Default to first profile if exists
                    const activeProfile = profiles && profiles.length > 0 ? profiles[0] : null;

                    // Fetch active subscriptions for auto-login
                    const { getUserSubscriptions } = await import('./services/api');
                    const patientId = activeProfile?.patient_id;
                    let fetchedMedicines: any[] = [];
                    let activePlan = null;

                    if (patientId) {
                        fetchedMedicines = await getUserSubscriptions(patientId);
                        if (fetchedMedicines.length > 0) {
                            activePlan = {
                                id: 'active-plan',
                                name: 'My Medication Plan',
                                billingInterval: 'Monthly',
                                discountPercentage: 0,
                                description: 'Active subscription plan'
                            };
                        }
                    }

                    const mappedProfiles = profiles?.map(p => ({
                        ...p,
                        id: p.patient_id,
                        patientId: p.patient_id,
                        ownerId: p.owner_id,
                        fullName: p.full_name,
                        dateOfBirth: p.date_of_birth,
                        bloodGroup: p.blood_group,
                        chronicDiseases: p.chronic_diseases,
                    })) || [];

                    const baseAutoState: Partial<AppState> = {
                        step: 'app',
                        activeTab: 'home',
                        medicines: fetchedMedicines,
                        selectedPlan: activePlan,
                        profiles: mappedProfiles,
                        patient: {
                            fullName: activeProfile?.full_name || '',
                            email: session.user.email || '',
                            phone: activeProfile?.phone || '',
                            id: activeProfile?.patient_id || '',
                            patientId: activeProfile?.patient_id,
                            ownerId: session.user.id,
                            dateOfBirth: activeProfile?.date_of_birth,
                            gender: activeProfile?.gender,
                            bloodGroup: activeProfile?.blood_group,
                            allergies: activeProfile?.allergies || [],
                            chronicDiseases: activeProfile?.chronic_diseases || []
                        }
                    };

                    // Restore local draft/progress state (per user) after refresh.
                    let restoredState: Partial<AppState> = {};
                    try {
                        const persistedRaw = localStorage.getItem(APP_STATE_STORAGE_KEY);
                        if (persistedRaw) {
                            const persisted = JSON.parse(persistedRaw) as AppState;
                            if (persisted?.patient?.ownerId === session.user.id) {
                                restoredState = {
                                    activeTab: persisted.activeTab,
                                    wizardStep: persisted.wizardStep,
                                    diagnosis: persisted.diagnosis,
                                    medicines: persisted.medicines,
                                    selectedPlan: persisted.selectedPlan,
                                    notificationSettings: persisted.notificationSettings,
                                    takenMeds: persisted.takenMeds,
                                    routineItems: persisted.routineItems,
                                    completedRoutineIds: persisted.completedRoutineIds,
                                    paymentStatus: persisted.paymentStatus === 'processing' ? 'idle' : persisted.paymentStatus,
                                    patient: {
                                        ...baseAutoState.patient,
                                        ...persisted.patient,
                                        ownerId: session.user.id,
                                    }
                                };
                            }
                        }
                    } catch (persistErr) {
                        console.warn('Could not restore persisted app state:', persistErr);
                    }

                    // Auto-login the user
                    updateState({
                        ...baseAutoState,
                        ...restoredState,
                        step: 'app',
                        profiles: mappedProfiles,
                    });

                    console.log('✅ Auto-login successful!');
                } else {
                    console.log('ℹ️ No existing session found');
                }
            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                setIsCheckingSession(false);
            }
        };

        checkSession();
    }, []); // Empty dependency array - only run once on mount

    // Persist authenticated app progress so refresh doesn't reset wizard/tab/medicines.
    useEffect(() => {
        if (state.step !== 'app' || !state.patient?.ownerId) return;

        const persistableState: AppState = {
            ...state,
            paymentStatus: state.paymentStatus === 'processing' ? 'idle' : state.paymentStatus,
        };

        try {
            localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(persistableState));
        } catch (err) {
            console.warn('Could not persist app state:', err);
        }
    }, [state]);



    const wizardSteps: WizardStep[] = ['patient', 'diagnosis', 'medicines', 'plan', 'payment', 'confirmation'];

    const nextWizardStep = () => {
        const currentIndex = wizardSteps.indexOf(state.wizardStep);
        if (currentIndex < wizardSteps.length - 1) {
            updateState({ wizardStep: wizardSteps[currentIndex + 1] });
        } else {
            // Finished wizard
            updateState({
                wizardStep: 'patient', // reset for next time
                activeTab: 'subscription',
                paymentStatus: 'idle'
            });
        }
    };

    const prevWizardStep = () => {
        const currentIndex = wizardSteps.indexOf(state.wizardStep);
        if (currentIndex > 0) {
            updateState({ wizardStep: wizardSteps[currentIndex - 1] });
        }
    };

    const finishWizard = () => {
        updateState({
            activeTab: 'subscription',
            wizardStep: 'patient' // Reset
        });
    };

    const handleLogin = async () => {
        // Get the current user from Supabase
        const { supabase } = await import('./services/supabase');
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Fetch ALL user profiles (where owner_id = auth.uid)
            const { data: profiles, error } = await supabase
                .from('patients')
                .select('*')
                .eq('owner_id', user.id);

            // Default to first profile if exists
            const activeProfile = profiles && profiles.length > 0 ? profiles[0] : null;

            if (profiles && profiles.length > 0) {
                console.log('Found profiles:', profiles.length, 'Active:', activeProfile?.full_name);
            } else {
                console.log('No patient profiles found for user. Wizard will create one.');
            }

            // Fetch active subscriptions for the active profile
            const { getUserSubscriptions } = await import('./services/api');
            const patientId = activeProfile?.patient_id; // UUID from DB
            let fetchedMedicines: any[] = [];
            let activePlan = null;

            if (patientId) {
                fetchedMedicines = await getUserSubscriptions(patientId);
                if (fetchedMedicines.length > 0) {
                    activePlan = {
                        id: 'active-plan',
                        name: 'My Medication Plan',
                        billingInterval: 'Monthly',
                        discountPercentage: 0,
                        description: 'Active subscription plan'
                    };
                }
            }

            updateState({
                step: 'app',
                activeTab: 'home',
                medicines: fetchedMedicines,
                selectedPlan: activePlan,
                profiles: profiles?.map(p => ({
                    ...p,
                    id: p.patient_id, // Map DB generic ID to frontend ID
                    patientId: p.patient_id,
                    ownerId: p.owner_id,
                    fullName: p.full_name,
                    dateOfBirth: p.date_of_birth,
                    bloodGroup: p.blood_group,
                    chronicDiseases: p.chronic_diseases,
                    // Map other fields as needed
                })) || [],
                patient: {
                    ...state.patient,
                    id: activeProfile?.patient_id || '', // Current Profile ID
                    patientId: activeProfile?.patient_id || '',
                    ownerId: user.id, // Auth ID
                    email: user.email || state.patient.email,
                    fullName: activeProfile?.full_name || state.patient.fullName,
                    phone: activeProfile?.phone || state.patient.phone,
                    dateOfBirth: activeProfile?.date_of_birth,
                    gender: activeProfile?.gender,
                    bloodGroup: activeProfile?.blood_group,
                    address: activeProfile?.address,
                    allergies: activeProfile?.allergies || [],
                    chronicDiseases: activeProfile?.chronic_diseases || []
                }
            });
        } else {
            updateState({ step: 'app', activeTab: 'home' });
        }
    };


    const handleTabChange = (tab: ActiveTab) => {
        updateState({ activeTab: tab });
    };

    const handleAddRecommendation = (rec: any) => {
        const parsedPrice = typeof rec.price === 'number'
            ? rec.price
            : parseFloat(String(rec.price).replace(/[^0-9.]/g, ''));
        const safePrice = Number.isFinite(parsedPrice) ? parsedPrice : 0;

        const newMedicine: Medicine = {
            id: Math.random().toString(36).substr(2, 9),
            name: rec.name,
            company: 'Wellness Inc.',
            status: 'In Stock',
            form: 'Tablet',
            strength: 'Standard',
            dosageQuantity: '1',
            frequency: 'Once daily',
            durationDays: 30,
            price: safePrice,
            isPendingPurchase: true,
            mappedProduct: {
                productName: rec.name,
                company: 'Wellness Inc.',
                pricePerUnit: safePrice,
                packSize: '30 count',
                inStock: true
            }
        };

        updateState({
            medicines: [...state.medicines, newMedicine],
            activeTab: 'search',
            wizardStep: 'plan'
        });
    };

    const handleLogout = async () => {
        try {
            const { supabase } = await import('./services/supabase');
            await supabase.auth.signOut();

            localStorage.removeItem(APP_STATE_STORAGE_KEY);

            // Reset state to initial
            setState(INITIAL_STATE);
            setShowProfileMenu(false);

            console.log('✅ Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleSwitchProfile = async (profileId: string) => {
        const targetProfile = state.profiles.find(p => p.patientId === profileId);
        if (!targetProfile) return;

        console.log('Switching to profile:', targetProfile.fullName);

        // Fetch subscriptions for this profile
        const { getUserSubscriptions } = await import('./services/api');
        let fetchedMedicines: any[] = [];
        try {
            fetchedMedicines = await getUserSubscriptions(profileId);
        } catch (e) {
            console.error('Error fetching subs for switched profile:', e);
        }

        updateState({
            activeTab: 'home',
            medicines: fetchedMedicines,
            patient: targetProfile, // Set active patient
            wizardStep: 'patient' // Reset wizard
        });
        setShowProfileMenu(false);
    };

    const handleAddNewProfile = () => {
        console.log('Adding new profile...');
        // Reset patient state to partial empty (keep ownerId/Email if needed, or clear all)
        // We need to keep ownerId so we know who it belongs to, but mostly the Wizard should handle it.
        // Actually, Wizard uses auth.user.id for ownerId.

        updateState({
            activeTab: 'search', // Go to Wizard
            wizardStep: 'patient',
            medicines: [], // Clear medicines
            patient: {
                ...INITIAL_STATE.patient, // Reset to empty
                email: state.patient.email, // Keep email for convenience? Or clear. Let's keep email.
                // IMPORTANT: Ensure ID is NULL so wizard upsert creates NEW
                id: undefined,
                patientId: undefined,
                ownerId: state.patient.ownerId
            }
        });
        setShowProfileMenu(false);
    };


    const toggleMedicine = (id: string) => {
        const isTaken = state.takenMeds.includes(id);
        const newTaken = isTaken
            ? state.takenMeds.filter(m => m !== id)
            : [...state.takenMeds, id];
        updateState({ takenMeds: newTaken });
    };

    const addRoutineItem = (item: RoutineItem) => {
        updateState({ routineItems: [...state.routineItems, item] });
    };

    const toggleRoutineItem = (id: string) => {
        const isCompleted = state.completedRoutineIds.includes(id);
        const newCompleted = isCompleted
            ? state.completedRoutineIds.filter(i => i !== id)
            : [...state.completedRoutineIds, id];
        updateState({ completedRoutineIds: newCompleted });
    };

    // Show loading screen while checking session
    if (isCheckingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    {/* Lottie Animation */}
                    <div className="w-32 h-32 mx-auto mb-6">
                        {/* @ts-ignore - dotlottie-player is a web component */}
                        <dotlottie-player
                            src="/Health Logo.lottie"
                            background="transparent"
                            speed="1"
                            style={{ width: '100%', height: '100%' }}
                            loop
                            autoplay
                        ></dotlottie-player>
                    </div>
                    <h2 className="text-2xl font-light text-slate-800 mb-2">Loading Sanvix Health...</h2>
                    <p className="text-sm text-slate-500">Checking your session</p>
                    <div className="mt-4 flex justify-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden font-sans text-slate-800 pb-20 md:pb-0">
            {/* Background Decor */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-200/30 rounded-full blur-[100px] -z-10 animate-pulse-slow" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] -z-10" />

            {/* Navbar - Shows only when authenticated (step === 'app') */}
            {state.step === 'app' ? (
                <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-4 flex justify-between items-center backdrop-blur-md bg-white/40 border-b border-white/30 transition-all duration-300">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleTabChange('home')}>
                        <img src="/logo.png" alt="Sanvix Logo" className="w-8 h-8 object-contain" />
                        <span className="font-semibold text-lg tracking-tight text-slate-800 hidden md:block">Sanvix</span>
                    </div>

                    {/* Desktop Center Nav */}
                    <div className="hidden md:flex items-center bg-white/50 rounded-full p-1 border border-white/50 shadow-sm backdrop-blur-xl">
                        {(['home', 'search', 'subscription', 'settings'] as ActiveTab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${state.activeTab === tab
                                    ? 'bg-white text-primary-600 shadow-md scale-105'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* User Profile / Logout */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLogout}
                            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                        <div className="relative">
                            <div
                                className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-teal-400 p-0.5 shadow-md cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-primary-600">
                                    {state.patient.fullName ? state.patient.fullName.charAt(0) : 'JD'}
                                </div>
                            </div>

                            {/* Profile Dropdown Menu */}
                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-3 border-b border-slate-50">
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2 px-2">Switch Profile</p>
                                        <div className="space-y-1">
                                            {state.profiles.map(profile => (
                                                <button
                                                    key={profile.patientId}
                                                    onClick={() => handleSwitchProfile(profile.patientId!)}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${state.patient.patientId === profile.patientId
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'hover:bg-slate-50 text-slate-600'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${state.patient.patientId === profile.patientId ? 'bg-blue-200 text-blue-700' : 'bg-slate-200 text-slate-500'
                                                            }`}>
                                                            {profile.fullName.charAt(0)}
                                                        </div>
                                                        <span className="truncate max-w-[120px]">{profile.fullName}</span>
                                                    </div>
                                                    {state.patient.patientId === profile.patientId && <Check className="w-3 h-3" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-2">
                                        <button
                                            onClick={handleAddNewProfile}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add New Profile
                                        </button>
                                        <div className="h-px bg-slate-100 my-1"></div>
                                        <button
                                            onClick={() => { handleTabChange('settings'); setShowProfileMenu(false); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Settings
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            ) : null}

            {/* Main Content Area */}
            <main className={state.step === 'app' ? "pt-24 md:pt-28 px-4 min-h-screen flex flex-col max-w-7xl mx-auto" : "w-full"}>

                <AnimatePresence mode="wait">
                    {state.step === 'landing' && (
                        <motion.div
                            key="landing"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            <LandingPage onStart={() => updateState({ step: 'auth' })} />
                        </motion.div>
                    )}

                    {state.step === 'auth' && (
                        <motion.div
                            key="auth"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            <AuthPage onLogin={handleLogin} onBack={() => updateState({ step: 'landing' })} />
                        </motion.div>
                    )}

                    {state.step === 'app' && (
                        <motion.div
                            key="app"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="w-full"
                        >
                            {state.activeTab === 'home' && (
                                <HomePage
                                    state={state}
                                    toggleMedicine={toggleMedicine}
                                    addRoutineItem={addRoutineItem}
                                    toggleRoutineItem={toggleRoutineItem}
                                    goToSearch={() => handleTabChange('search')}
                                    addToPlan={handleAddRecommendation}
                                />
                            )}

                            {state.activeTab === 'search' && (
                                <div className="w-full">
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-light text-slate-800">Start a New Plan</h2>
                                        <p className="text-slate-500 mt-2 font-light">Tell us about your needs.</p>
                                    </div>
                                    <Stepper currentStep={state.wizardStep as any} />
                                    <Wizard
                                        state={{ ...state, step: state.wizardStep as any }} // Adapter to make Wizard work with new types implicitly
                                        updateState={updateState}
                                        nextStep={nextWizardStep}
                                        prevStep={prevWizardStep}
                                        goToDashboard={finishWizard}
                                        refreshProfiles={async () => {
                                            const { supabase } = await import('./services/supabase');
                                            const { data: { user } } = await supabase.auth.getUser();
                                            if (user) {
                                                const { data: profiles } = await supabase
                                                    .from('patients')
                                                    .select('*')
                                                    .eq('owner_id', user.id);

                                                if (profiles) {
                                                    updateState({
                                                        profiles: profiles.map(p => ({
                                                            ...p,
                                                            id: p.patient_id,
                                                            patientId: p.patient_id,
                                                            ownerId: p.owner_id,
                                                            fullName: p.full_name,
                                                            dateOfBirth: p.date_of_birth,
                                                            bloodGroup: p.blood_group,
                                                            chronicDiseases: p.chronic_diseases,
                                                        }))
                                                    });
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            )}

                            {state.activeTab === 'subscription' && (
                                <SubscriptionPage
                                    state={state}
                                    updateState={updateState}
                                    goToSearch={() => handleTabChange('search')}
                                />
                            )}

                            {state.activeTab === 'settings' && (
                                <SettingsPage
                                    state={state}
                                    updateState={updateState}
                                    onSwitchProfile={handleSwitchProfile}
                                    onAddProfile={handleAddNewProfile}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Mobile Bottom Nav */}
            {state.step === 'app' && (
                <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-200 py-3 px-6 flex justify-between items-center z-50">
                    {(['home', 'search', 'subscription', 'settings'] as ActiveTab[]).map((tab) => {
                        const Icon = tab === 'home' ? Home : tab === 'search' ? Search : tab === 'subscription' ? Package : Settings;
                        return (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`flex flex-col items-center gap-1 transition-colors ${state.activeTab === tab ? 'text-primary-600' : 'text-slate-400'}`}
                            >
                                <Icon className="w-6 h-6" strokeWidth={state.activeTab === tab ? 2.5 : 2} />
                                <span className="text-[10px] font-medium uppercase tracking-wider">{tab.slice(0, 4)}</span>
                            </button>
                        )
                    })}
                </div>
            )}

        </div>
    );
};

export default App;