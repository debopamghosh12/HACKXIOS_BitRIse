import React, { useState } from 'react';
import { Pill, Home, Search, Package, Settings, LogOut } from 'lucide-react';
import { AppState, INITIAL_STATE, Step, WizardStep, ActiveTab, Medicine, RoutineItem } from './types';
import { Wizard } from './pages/Wizard';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { Dashboard } from './pages/Dashboard';
import { SettingsPage } from './pages/SettingsPage';
import { Stepper } from './components/UI';

const App: React.FC = () => {
    const [state, setState] = useState<AppState>(INITIAL_STATE);

    const updateState = (updates: Partial<AppState>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

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

    const handleLogin = () => {
        updateState({ step: 'app', activeTab: 'home' });
    };

    const handleTabChange = (tab: ActiveTab) => {
        updateState({ activeTab: tab });
    };

    const handleAddRecommendation = (rec: any) => {
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
            mappedProduct: {
                productName: rec.name,
                company: 'Wellness Inc.',
                pricePerUnit: parseFloat(rec.price.replace('$', '')) || 10,
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

    return (
        <div className="min-h-screen relative overflow-hidden font-sans text-slate-800 pb-20 md:pb-0">
            {/* Background Decor */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-200/30 rounded-full blur-[100px] -z-10 animate-pulse-slow" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] -z-10" />

            {/* Navbar - Shows only when authenticated (step === 'app') */}
            {state.step === 'app' ? (
                <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-4 flex justify-between items-center backdrop-blur-md bg-white/40 border-b border-white/30 transition-all duration-300">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleTabChange('home')}>
                        <div className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <Pill className="w-5 h-5 -rotate-45" />
                        </div>
                        <span className="font-semibold text-lg tracking-tight text-slate-800 hidden md:block">Lumen</span>
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
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-teal-400 p-0.5 shadow-md cursor-pointer hover:scale-105 transition-transform" onClick={() => handleTabChange('settings')}>
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-primary-600">
                                {state.patient.fullName ? state.patient.fullName.charAt(0) : 'JD'}
                            </div>
                        </div>
                    </div>
                </nav>
            ) : (
                /* Landing/Auth Navbar */
                <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-sm bg-white/10 border-b border-white/20">
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => updateState({ step: 'landing' })}>
                        <div className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
                            <Pill className="w-5 h-5 -rotate-45" />
                        </div>
                        <span className="font-semibold text-lg tracking-tight text-slate-800">Lumen</span>
                    </div>
                    {state.step === 'landing' && (
                        <button
                            onClick={() => updateState({ step: 'auth' })}
                            className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
                        >
                            Sign In
                        </button>
                    )}
                </nav>
            )}

            {/* Main Content Area */}
            <main className="pt-24 md:pt-28 px-4 min-h-screen flex flex-col max-w-7xl mx-auto">

                {state.step === 'landing' && <LandingPage onStart={() => updateState({ step: 'auth' })} />}

                {state.step === 'auth' && <AuthPage onLogin={handleLogin} />}

                {state.step === 'app' && (
                    <>
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
                                />
                            </div>
                        )}

                        {state.activeTab === 'subscription' && (
                            // Now passing updateState to SubscriptionPage
                            <SubscriptionPage
                                state={state}
                                updateState={updateState}
                                goToSearch={() => handleTabChange('search')}
                            />
                        )}

                        {state.activeTab === 'settings' && (
                            <SettingsPage state={state} updateState={updateState} />
                        )}
                    </>
                )}
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