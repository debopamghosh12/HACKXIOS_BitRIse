import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Bell, Shield, LogOut, ChevronRight, Star, Clock, Calendar } from 'lucide-react';
import { GlassCard, Button, Input } from '../components/UI';
import { AppState, NotificationSettings } from '../types';

interface SettingsPageProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ state, updateState }) => {
  const { notificationSettings } = state;

  const updateSettings = (key: keyof NotificationSettings, value: any) => {
    updateState({
      notificationSettings: {
        ...notificationSettings,
        [key]: value
      }
    });
  };

  const handlePushToggle = async () => {
    const newValue = !notificationSettings.pushEnabled;
    
    if (newValue === true) {
      if (!("Notification" in window)) {
        alert("This browser does not support desktop notifications");
        return;
      }
      
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        updateSettings('pushEnabled', true);
        new Notification("Notifications Enabled", {
            body: "You will now receive refill reminders.",
            icon: "/favicon.ico" // Assuming favicon exists or it will just be blank
        });
      } else {
        alert("Permission denied for notifications. Please enable them in your browser settings.");
        updateSettings('pushEnabled', false);
      }
    } else {
      updateSettings('pushEnabled', false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto space-y-8 pb-10"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-light text-slate-800">Settings</h1>
        <p className="text-slate-500 font-light mt-1">Manage your account and preferences.</p>
      </div>

      {/* Account Settings */}
      <section>
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-4 ml-2">Account</h3>
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-400 flex items-center justify-center text-xl text-white font-medium shadow-lg shadow-blue-500/20">
              {state.patient.fullName ? state.patient.fullName.charAt(0) : 'U'}
            </div>
            <div>
              <h4 className="text-lg font-medium text-slate-800">{state.patient.fullName || 'User Name'}</h4>
              <p className="text-sm text-slate-500">{state.patient.email || 'user@example.com'}</p>
            </div>
            <Button variant="ghost" className="ml-auto text-xs">Edit</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" defaultValue={state.patient.fullName} icon={<User className="w-4 h-4" />} />
            <Input label="Email" defaultValue={state.patient.email} icon={<Mail className="w-4 h-4" />} />
          </div>
        </GlassCard>
      </section>

      {/* Notification Settings */}
      <section>
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-4 ml-2">Notifications</h3>
        <GlassCard className="divide-y divide-slate-100">
          
          {/* Push Toggle */}
          <div className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Push Notifications</p>
                  <p className="text-xs text-slate-500">Receive refill & dosage reminders</p>
                </div>
              </div>
              <button 
                onClick={handlePushToggle}
                className={`w-11 h-6 rounded-full transition-colors relative ${notificationSettings.pushEnabled ? 'bg-blue-500' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notificationSettings.pushEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            {/* Custom Reminder Schedule UI - Only Visible if Push Enabled */}
            <AnimatePresence>
              {notificationSettings.pushEnabled && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Refill Reminder Schedule</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Days Before Refill */}
                      <div className="relative group">
                         <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" /> Days before refill
                         </label>
                         <select 
                           value={notificationSettings.refillReminderDays}
                           onChange={(e) => updateSettings('refillReminderDays', parseInt(e.target.value))}
                           className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                         >
                           {[1, 2, 3, 5, 7, 10].map(day => (
                             <option key={day} value={day}>{day} days before</option>
                           ))}
                         </select>
                      </div>

                      {/* Time of Day */}
                      <div className="relative group">
                         <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center">
                            <Clock className="w-3 h-3 mr-1" /> Reminder Time
                         </label>
                         <input 
                           type="time"
                           value={notificationSettings.refillReminderTime}
                           onChange={(e) => updateSettings('refillReminderTime', e.target.value)}
                           className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                         />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                       We'll send you a notification {notificationSettings.refillReminderDays} days before your medicine runs out at {notificationSettings.refillReminderTime}.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between py-3 pt-4">
             <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Email Updates</p>
                <p className="text-xs text-slate-500">Order confirmations and receipts</p>
              </div>
            </div>
            <button 
              onClick={() => updateSettings('emailEnabled', !notificationSettings.emailEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${notificationSettings.emailEnabled ? 'bg-blue-500' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notificationSettings.emailEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

           <div className="flex items-center justify-between py-3 pt-4">
             <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Marketing & Offers</p>
                <p className="text-xs text-slate-500">News about new products</p>
              </div>
            </div>
            <button 
              onClick={() => updateSettings('marketingEnabled', !notificationSettings.marketingEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${notificationSettings.marketingEnabled ? 'bg-blue-500' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notificationSettings.marketingEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </GlassCard>
      </section>

      {/* Security & Danger Zone */}
       <section>
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-4 ml-2">Security</h3>
        <GlassCard>
           <button className="w-full flex items-center justify-between text-slate-700 py-2 hover:text-blue-600 transition-colors">
             <div className="flex items-center gap-3">
               <Shield className="w-4 h-4" />
               <span className="text-sm font-medium">Change Password</span>
             </div>
             <ChevronRight className="w-4 h-4 text-slate-400" />
           </button>
           <div className="h-px bg-slate-100 my-2" />
           <button className="w-full flex items-center justify-between text-red-500 py-2 hover:text-red-600 transition-colors">
             <div className="flex items-center gap-3">
               <LogOut className="w-4 h-4" />
               <span className="text-sm font-medium">Sign Out</span>
             </div>
           </button>
        </GlassCard>
      </section>

    </motion.div>
  );
};