import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, User, MapPin, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, GlassCard, Input } from '../components/UI';
import { signUp, signIn } from '../services/auth';

interface AuthPageProps {
  onLogin: () => void;
}

interface FormData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  address: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    address: '',
  });

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setError(null); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        // Sign up new user
        const { user, error: signUpError } = await signUp({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
        });

        if (signUpError) {
          setError(signUpError.message);
          setIsLoading(false);
          return;
        }

        if (user) {
          setSuccess('Account created successfully! Please check your email to verify your account.');
          // Optionally auto-login after a delay
          setTimeout(() => {
            onLogin();
          }, 2000);
        }
      } else {
        // Sign in existing user
        const { user, error: signInError } = await signIn({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          setError(signInError.message);
          setIsLoading(false);
          return;
        }

        if (user) {
          setSuccess('Signed in successfully!');
          setTimeout(() => {
            onLogin();
          }, 500);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
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



        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}

          {isSignUp && (
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              icon={<User className="w-4 h-4" />}
              value={formData.fullName}
              onChange={handleInputChange('fullName')}
              required
            />
          )}
          {isSignUp && (
            <Input
              label="Address"
              type="text"
              placeholder="Maple Street, 12345"
              icon={<MapPin className="w-4 h-4" />}
              value={formData.address}
              onChange={handleInputChange('address')}
            />
          )}
          <Input
            label="Email Address"
            type="email"
            placeholder="jane@example.com"
            icon={<Mail className="w-4 h-4" />}
            value={formData.email}
            onChange={handleInputChange('email')}
            required
          />
          {isSignUp && (
            <Input
              label="Phone Number"
              type="tel"
              placeholder="1234567890"
              icon={<Phone className="w-4 h-4" />}
              value={formData.phoneNumber}
              onChange={handleInputChange('phoneNumber')}
            />
          )}
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            value={formData.password}
            onChange={handleInputChange('password')}
            required
          />

          <div className="pt-4">
            <Button className="w-full" isLoading={isLoading} type="submit">
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
