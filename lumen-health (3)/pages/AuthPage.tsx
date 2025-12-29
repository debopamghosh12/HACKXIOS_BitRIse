import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, User } from 'lucide-react';
import { Button, GlassCard, Input } from '../components/UI';

interface AuthPageProps {
  onLogin: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="w-full max-w-md mx-auto pt-8 px-4"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-slate-800">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="text-slate-500 font-light mt-2">
          {isSignUp ? 'Start your wellness journey today.' : 'Manage your plan and schedule.'}
        </p>
      </div>

      <GlassCard className="p-8">
        {/* Toggle Switch */}
        <div className="flex p-1 bg-slate-100 rounded-full mb-8 relative">
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-out ${isSignUp ? 'left-[calc(50%+2px)]' : 'left-1'}`} 
          />
          <button 
            onClick={() => setIsSignUp(false)}
            className={`flex-1 relative z-10 text-sm font-medium py-2 text-center rounded-full transition-colors ${!isSignUp ? 'text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setIsSignUp(true)}
            className={`flex-1 relative z-10 text-sm font-medium py-2 text-center rounded-full transition-colors ${isSignUp ? 'text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Google Login Button */}
        <button 
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-full transition-all duration-200 shadow-sm mb-6 group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative bg-white/60 backdrop-blur px-3 text-xs text-slate-400 uppercase tracking-widest">
            Or continue with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
             <Input 
             label="Full Name" 
             placeholder="Jane Doe" 
             icon={<User className="w-4 h-4" />}
           />
          )}
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="jane@example.com" 
            icon={<Mail className="w-4 h-4" />}
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            icon={<Lock className="w-4 h-4" />}
          />
          
          <div className="pt-4">
            <Button className="w-full" isLoading={isLoading}>
              {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </GlassCard>
      
      <p className="text-center text-xs text-slate-400 mt-6 max-w-xs mx-auto">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </motion.div>
  );
};
