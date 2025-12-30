import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, User, Phone, AlertCircle, CheckCircle, Smartphone, ArrowLeft, Eye, EyeOff, Check, X } from 'lucide-react';
import { Button, GlassCard, Input } from '../components/UI';
import { signUp, signIn } from '../services/auth';

interface AuthPageProps {
  onLogin: () => void;
  onBack: () => void;
}

interface FormData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  address?: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [section, setSection] = useState<'signin' | 'signup'>('signin');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: ''
  });

  // Calculate Password Strength
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 6) score += 1;
    if (pass.length > 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(score, 4);
  };

  const strength = getPasswordStrength(formData.password);

  const getStrengthColor = (s: number) => {
    if (s === 0) return 'bg-slate-200';
    if (s < 2) return 'bg-red-400';
    if (s < 4) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const VALID_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const VALID_PHONE_REGEX = /^\+?[0-9]{10,15}$/;

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setError(null);
    setShake(false);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Basic Validation
    if (isSignUp && !agreedToTerms) {
      setError('You must agree to the Terms & Privacy Policy.');
      triggerShake();
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign up
        const { user, error: signUpError } = await signUp({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
        });

        if (signUpError) {
          setError(signUpError.message);
          triggerShake();
          setIsLoading(false);
          return;
        }

        if (user) {
          setSuccess('Account created! Verification email sent.');
          setTimeout(() => onLogin(), 2000);
        }
      } else {
        // Sign in
        const { user, error: signInError } = await signIn({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          setError(signInError.message);
          triggerShake();
          setIsLoading(false);
          return;
        }

        if (user) {
          setSuccess('Welcome back!');
          setTimeout(() => onLogin(), 600);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      triggerShake();
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (mode: boolean) => {
    setIsSignUp(mode);
    setError(null);
    setSuccess(null);
    setFormData({ email: '', password: '', fullName: '', phoneNumber: '' });
  };

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center p-4 relative">
      <div className="w-full max-w-5xl bg-white/50 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-white/60 relative">

        {/* Left Side - Visuals (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-between p-12 text-white">
          {/* Back Button Desktop */}
          <button onClick={onBack} className="absolute top-8 left-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors z-20 group">
            <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Back to Home</span>
          </button>

          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/90 to-blue-500/80"></div>

          <div className="relative z-10 mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain brightness-0 invert" />
              </div>
              <span className="text-2xl font-semibold tracking-tight">Sanvix</span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-light leading-tight mb-4"
            >
              Healthcare <br />
              <span className="font-semibold">Reimagined.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-blue-100 font-light text-lg"
            >
              Your personal health journey starts here. Secure, simple, and smart.
            </motion.p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4 text-sm text-blue-100/80">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-primary-500 bg-slate-200" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`, backgroundSize: 'cover' }}></div>
                ))}
              </div>
              <p>Join 10,000+ users today</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white/60 relative flex flex-col justify-center">

          {/* Back Button Mobile */}
          <button onClick={onBack} className="md:hidden absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors z-20 p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="max-w-md mx-auto w-full">
            <div className="text-center md:text-left mb-8 mt-6 md:mt-0">
              <h2 className="text-3xl font-light text-slate-800 mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-slate-500">
                {isSignUp ? 'Enter your details to get started.' : 'Please enter your details to sign in.'}
              </p>
            </div>

            {/* Custom Toggle */}
            <div className="flex p-1 bg-slate-100/80 rounded-xl mb-8 w-fit mx-auto md:mx-0">
              <button
                onClick={() => toggleMode(false)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${!isSignUp ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => toggleMode(true)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isSignUp ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign Up
              </button>
            </div>

            <motion.div
              layout
              className="overflow-hidden"
              animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">

                <AnimatePresence mode="popLayout">
                  {error && (
                    <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2 border border-red-100">
                      <AlertCircle className="w-4 h-4" /> {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-3 rounded-lg bg-green-50 text-green-600 text-sm flex items-center gap-2 border border-green-100">
                      <CheckCircle className="w-4 h-4" /> {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="popLayout">
                  {isSignUp && (
                    <motion.div
                      key="signup-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 pb-1">
                        <Input
                          label="Full Name"
                          placeholder="Palak Biswas"
                          icon={<User className="w-4 h-4" />}
                          rightIcon={formData.fullName.length > 2 ? <Check className="w-4 h-4 text-green-500" /> : null}
                          value={formData.fullName}
                          onChange={handleInputChange('fullName')}
                          required
                          minLength={2}
                          autoComplete="name"
                        />
                        <Input
                          label="Phone Number"
                          type="tel"
                          placeholder="1234567890"
                          icon={<Smartphone className="w-4 h-4" />}
                          rightIcon={VALID_PHONE_REGEX.test(formData.phoneNumber) ? <Check className="w-4 h-4 text-green-500" /> : null}
                          value={formData.phoneNumber}
                          onChange={handleInputChange('phoneNumber')}
                          pattern="[0-9]{10,15}"
                          title="Please enter a valid phone number (10-15 digits)"
                          autoComplete="tel"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div layout>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    icon={<Mail className="w-4 h-4" />}
                    rightIcon={VALID_EMAIL_REGEX.test(formData.email) ? <Check className="w-4 h-4 text-green-500" /> : null}
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    required
                    autoComplete="email"
                  />

                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      icon={<Lock className="w-4 h-4" />}
                      rightIcon={
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-blue-600 transition-colors">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      required
                      minLength={6}
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                    />

                    {/* Password Strength Meter (Only on Signup) */}
                    <AnimatePresence>
                      {isSignUp && formData.password.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-1 mb-4 flex flex-col gap-1"
                        >
                          <div className="flex gap-1 h-1 w-full mt-1">
                            {[0, 1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className={`h-full flex-1 rounded-full transition-all duration-300 ${i < strength ? getStrengthColor(strength) : 'bg-slate-100'}`}
                              />
                            ))}
                          </div>
                          <div className="text-[10px] text-right text-slate-400 font-medium">
                            {strength < 2 ? 'Weak' : strength < 3 ? 'Medium' : strength < 4 ? 'Strong' : 'Very Strong'}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Forgot Password Link (Only Sign In) */}
                  {!isSignUp && (
                    <div className="flex justify-end mb-4 -mt-2">
                      <button type="button" className="text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium">
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  {/* Terms Checkbox (Only Sign Up) */}
                  {isSignUp && (
                    <div className="flex items-start gap-2 mb-6 px-1">
                      <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="terms"
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="w-4 h-4 border border-slate-300 rounded bg-slate-50 focus:ring-3 focus:ring-blue-300"
                          />
                        </div>
                      </div>
                      <label htmlFor="terms" className="text-xs text-slate-500 md:text-sm">
                        I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                      </label>
                    </div>
                  )}

                  <Button className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/20 py-3 text-lg" isLoading={isLoading} type="submit">
                    {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>

              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
