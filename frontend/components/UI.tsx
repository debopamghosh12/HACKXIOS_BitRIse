import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Check, ChevronRight } from 'lucide-react';
import { WizardStep } from '../types';

// Utility for merging tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Glass Card Component
export const GlassCard: React.FC<{ children: React.ReactNode; className?: string; hoverEffect?: boolean }> = ({
  children,
  className,
  hoverEffect = false
}) => {
  return (
    <div className={cn(
      "bg-white/60 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl p-6 sm:p-8 transition-all duration-300 ease-out",
      hoverEffect && "hover:scale-[1.02] hover:shadow-xl hover:bg-white/70",
      className
    )}>
      {children}
    </div>
  );
};

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  isLoading,
  disabled,
  ...props
}) => {
  const baseStyles = "relative inline-flex items-center justify-center px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-500/20 focus:ring-primary-500",
    secondary: "bg-white/80 text-slate-700 hover:bg-white border border-slate-200 shadow-sm focus:ring-slate-300",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800 focus:ring-slate-200",
    outline: "bg-transparent border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </span>
      ) : children}
    </button>
  );
};

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, icon, rightIcon, required, className, ...props }) => {
  return (
    <div className="relative group mb-4">
      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          className={cn(
            "block w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 font-light",
            icon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
          {...props}
        />
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
    </div>
  );
};

// Stepper Component
export const Stepper: React.FC<{ currentStep: WizardStep }> = ({ currentStep }) => {
  const steps: WizardStep[] = ['patient', 'diagnosis', 'medicines', 'plan', 'payment'];
  const currentIndex = steps.indexOf(currentStep);

  if (currentIndex === -1) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10 rounded-full" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary-500 -z-10 transition-all duration-500 ease-out"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step} className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white",
                  isCompleted ? "border-primary-500 text-primary-500" :
                    isCurrent ? "border-primary-500 text-primary-500 ring-4 ring-primary-100" :
                      "border-slate-200 text-slate-300"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-semibold">{idx + 1}</span>}
              </div>
              <span className={cn(
                "absolute top-10 text-[10px] uppercase font-medium tracking-widest transition-colors duration-300",
                isCurrent ? "text-primary-600" : "text-transparent"
              )}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};