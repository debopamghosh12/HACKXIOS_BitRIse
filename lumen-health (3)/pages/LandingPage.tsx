import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Shield, Clock, Heart, CheckCircle2 } from 'lucide-react';
import { Button, GlassCard } from '../components/UI';

export const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 w-full">
      
      {/* Background Imagery with Soft Overlay */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=2979&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-20 scale-105 blur-[2px]"
          alt="Abstract minimalist medical background" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-blue-50/80 backdrop-blur-sm" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl w-full flex flex-col items-center text-center z-10 pt-10"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/70 border border-white/80 backdrop-blur-md mb-8 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">New: Smart Schedules</span>
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-thin text-slate-800 mb-6 tracking-tight leading-[1.1]">
          Wellness, <br />
          <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400">
            Simplified.
          </span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-600 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
          Manage your prescriptions, automate refills, and track your health journey in one calm, secure space.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
          <Button onClick={onStart} className="px-8 py-4 text-base rounded-full shadow-xl shadow-blue-500/20 w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            Start Your Plan <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <button className="text-slate-500 font-medium text-sm hover:text-blue-600 transition-colors px-6 py-4">
            How it works
          </button>
        </motion.div>

        {/* Graphical Features Grid */}
        <motion.div variants={containerVariants} className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
           <GlassCard hoverEffect className="flex flex-col items-start p-6 bg-white/40">
             <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
               <Shield className="w-5 h-5" />
             </div>
             <h3 className="text-lg font-medium text-slate-800 mb-2">Secure & Private</h3>
             <p className="text-sm text-slate-500 leading-relaxed">
               Bank-level encryption for your health data. Your diagnosis and prescriptions stay between you and your doctor.
             </p>
           </GlassCard>

           <GlassCard hoverEffect className="flex flex-col items-start p-6 bg-white/40">
             <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center mb-4">
               <Activity className="w-5 h-5" />
             </div>
             <h3 className="text-lg font-medium text-slate-800 mb-2">Trusted Specialists</h3>
             <p className="text-sm text-slate-500 leading-relaxed">
               Verified medications mapped instantly from your prescription to trusted pharmacy partners.
             </p>
           </GlassCard>

           <GlassCard hoverEffect className="flex flex-col items-start p-6 bg-white/40">
             <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
               <Clock className="w-5 h-5" />
             </div>
             <h3 className="text-lg font-medium text-slate-800 mb-2">Smart Adherence</h3>
             <p className="text-sm text-slate-500 leading-relaxed">
               Automated schedules and gentle reminders ensure you never miss a dose or a refill.
             </p>
           </GlassCard>
        </motion.div>
        
        <motion.div variants={itemVariants} className="mt-12 flex items-center gap-2 text-sm text-slate-400 font-medium">
          <CheckCircle2 className="w-4 h-4 text-blue-500" /> 
          <span>HIPAA Compliant Platform</span>
        </motion.div>

      </motion.div>
    </div>
  );
};