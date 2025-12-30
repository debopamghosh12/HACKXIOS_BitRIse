import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Activity, Shield, Clock, CheckCircle2, Star, Zap,
  ChevronRight, Play, Lock, Heart, Calendar, Stethoscope, Smartphone,
  Pill, Upload, Sparkles, Check
} from 'lucide-react';
import { Button, GlassCard } from '../components/UI';
import { DotLottiePlayer } from '@dotlottie/react-player';

// --- Page Sections ---

const Header = ({ onStart }: { onStart: () => void }) => (
  <motion.header
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-lg border-b border-slate-100"
  >
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
        <Shield className="w-5 h-5" />
      </div>
      <span className="font-semibold text-xl text-slate-800 tracking-tight">Sanvix</span>
    </div>

    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
      <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
      <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
      <a href="#doctors" className="hover:text-blue-600 transition-colors">For Doctors</a>
    </nav>

    <div className="flex items-center gap-4">
      <button className="text-sm font-medium text-slate-600 hover:text-blue-600 hidden sm:block">Sign In</button>
      <Button onClick={onStart} className="px-5 py-2 text-sm rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
        Get Started
      </Button>
    </div>
  </motion.header>
);

const Hero = ({ onStart }: { onStart: () => void }) => {
  return (
    <section className="relative pt-32 pb-20 px-4 flex flex-col items-center text-center max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3 h-3" /> Healthcare Reimagined
        </span>
        <h1 className="text-5xl md:text-7xl font-sans font-medium text-slate-900 mb-6 tracking-tight leading-[1.1]">
          Your Health, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
            Orchestrated.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
          Sanvix seamlessly unifies your prescriptions, schedules, and provider communication into one intuitive, secure system.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button onClick={onStart} className="px-8 py-4 text-base rounded-full shadow-xl shadow-blue-500/25 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 transition-all">
            Get Started Free
          </Button>
          <button className="flex items-center gap-2 px-8 py-4 text-base rounded-full bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all font-medium group shadow-sm hover:shadow-md">
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Play className="w-3 h-3 ml-0.5 fill-current" />
            </div>
            Watch Demo
          </button>
        </div>
      </motion.div>

      {/* Hero Lottie / Visual Placeholder */}
      <div className="mt-16 w-full max-w-4xl h-[400px] relative">
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
        {/* Simulated Floating UI */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 -translate-x-1/2 top-10 w-full max-w-[800px] h-full"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden h-full">
            <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/20"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400/20"></div>
              <div className="w-3 h-3 rounded-full bg-green-400/20"></div>
            </div>
            <div className="p-8 grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="h-8 w-1/3 bg-slate-100 rounded"></div>
                <div className="h-32 bg-blue-50/50 rounded-xl border border-blue-100 p-4">
                  <div className="w-8 h-8 rounded bg-blue-100 mb-3"></div>
                  <div className="h-2 w-1/2 bg-blue-200 rounded mb-2"></div>
                  <div className="h-2 w-1/3 bg-blue-100 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-50 rounded"></div>
                  <div className="h-2 w-5/6 bg-slate-50 rounded"></div>
                </div>
              </div>
              <div className="col-span-1 bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="h-20 w-full bg-white rounded-lg shadow-sm"></div>
                <div className="h-20 w-full bg-white rounded-lg shadow-sm opacity-60"></div>
                <div className="h-20 w-full bg-white rounded-lg shadow-sm opacity-30"></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -left-4 top-40 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 z-20"
        >
          <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase">Status</div>
            <div className="text-sm font-semibold text-slate-800">Prescription Verified</div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -15, 0], x: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute -right-8 top-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 z-20"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase">Next Refill</div>
            <div className="text-sm font-semibold text-slate-800">Shipped Today</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const SocialProof = () => (
  <section className="py-10 border-y border-slate-100/50 bg-white/30 backdrop-blur-sm">
    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 opacity-80">
      <div className="flex items-center gap-4">
        <div className="flex -space-x-3">
          {[10, 12, 15, 22, 33].map(i => (
            <img key={i} src={`https://i.pravatar.cc/100?img=${i}`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
          ))}
        </div>
        <div className="text-left">
          <div className="flex text-yellow-400 text-[10px] gap-0.5">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
          </div>
          <p className="text-xs font-semibold text-slate-600 mt-1">Trusted by 10,000+ patients</p>
        </div>
      </div>
      <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
      <div className="flex gap-8 grayscale opacity-60">
        {/* Fake Logos for SaaS feel */}
        <div className="font-bold text-xl text-slate-400 flex items-center gap-2"><Activity className="w-5 h-5" /> MEDCORE</div>
        <div className="font-bold text-xl text-slate-400 flex items-center gap-2"><Stethoscope className="w-5 h-5" /> CLINIX</div>
        <div className="font-bold text-xl text-slate-400 flex items-center gap-2"><Heart className="w-5 h-5" /> PULSE</div>
      </div>
    </div>
  </section>
);

const Features = () => {
  const features = [
    {
      title: "Smart Prescriptions",
      desc: "Direct integration with your provider ensures your dosage is always up to date.",
      icon: <Shield className="w-full h-full text-blue-600" />,
      color: "blue"
    },
    {
      title: "Proactive Vitals",
      desc: "Connect devices to track progress. We alert your doctor if things look off.",
      icon: <Activity className="w-full h-full text-cyan-500" />,
      color: "cyan"
    },
    {
      title: "Auto-Pilot Refills",
      desc: "Never run out. Validated refills arrive at your door before you need them.",
      icon: <Clock className="w-full h-full text-indigo-600" />,
      color: "indigo"
    }
  ];

  return (
    <section id="features" className="py-24 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-4">Everything you need,<br /> <span className="font-medium">Nothing you don't.</span></h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <GlassCard key={i} hoverEffect className="p-8 flex flex-col items-start bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className={`w-14 h-14 rounded-2xl bg-${f.color}-50 p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}>
              {f.icon}
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">{f.title}</h3>
            <p className="text-slate-500 leading-relaxed font-light">{f.desc}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { title: "Upload or Connect", desc: "Scan your prescription or link your doctor's portal instantly.", icon: <Upload className="w-5 h-5" /> },
    { title: "Plan Generation", desc: "AI analyzes your needs to create a perfect dosage schedule.", icon: <Zap className="w-5 h-5" /> },
    { title: "Delivery & Care", desc: "Meds arrive monthly. We track your adherence daily.", icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-6">Simple steps to <br /><span className="font-medium">better health.</span></h2>
            <div className="space-y-8 relative">
              {/* Connecting Line */}
              <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 -z-10"></div>

              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="flex gap-6 items-start bg-white/50 p-4 rounded-xl border border-transparent hover:border-blue-100 hover:bg-white transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-blue-500 text-blue-600 flex items-center justify-center shadow-sm shrink-0 z-10">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{step.title}</h3>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="md:w-1/2 relative">
            {/* Visual Representation of flow */}
            <div className="bg-white rounded-3xl shadow-2xl p-2 border border-slate-100 rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="bg-slate-50 rounded-2xl p-8 aspect-square flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white">
                  <DotLottiePlayer
                    src="/HealthLogo.lottie"
                    loop
                    autoplay
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SplitShowcase = () => {
  return (
    <section className="py-24 px-4 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 text-left">
        {/* Patient Side */}
        <div className="bg-blue-600 rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-medium mb-6 backdrop-blur-md">
              <Smartphone className="w-3 h-3" /> Patient App
            </div>
            <h3 className="text-3xl font-medium mb-4">Freedom from <br /> worry.</h3>
            <p className="text-blue-100 mb-8 leading-relaxed max-w-sm">
              Get notified only when it matters. Track your delivery in real-time and manage dosages with a tap.
            </p>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 transform group-hover:-translate-y-2 transition-transform duration-500">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-900" />
                </div>
                <div>
                  <div className="font-semibold">Morning Dose Taken</div>
                  <div className="text-xs text-blue-200">8:02 AM • On Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Side */}
        <div className="bg-slate-50 rounded-[2.5rem] p-10 md:p-14 text-slate-800 relative overflow-hidden border border-slate-200 group">
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100 rounded-full blur-[80px] -ml-20 -mb-20"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-medium mb-6">
              <Stethoscope className="w-3 h-3" /> Provider Portal
            </div>
            <h3 className="text-3xl font-medium mb-4">Complete clinical <br /> oversight.</h3>
            <p className="text-slate-500 mb-8 leading-relaxed max-w-sm">
              Monitor adherence trends and adjust prescriptions instantly without the paperwork.
            </p>

            <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 transform group-hover:-translate-y-2 transition-transform duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-medium">Adherence Rate</div>
                  <div className="text-2xl font-bold text-slate-800">98.5%</div>
                </div>
                <div className="flex gap-1">
                  {[40, 60, 50, 80, 90, 70].map((h, i) => (
                    <div key={i} style={{ height: `${h / 4}px` }} className="w-2 bg-blue-500 rounded-sm"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Security = () => (
  <section className="py-20 text-center">
    <div className="max-w-2xl mx-auto px-4">
      <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
        <Lock className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-light text-slate-800 mb-4">Uncompromising Security</h2>
      <p className="text-slate-500 leading-relaxed mb-8">
        Your health data is sensitive. That's why we use bank-level 256-bit encryption and are fully HIPAA compliant.
        We never sell your data.
      </p>
      <div className="flex justify-center gap-4 opacity-50">
        <Shield className="w-8 h-8 text-slate-300" />
        <Lock className="w-8 h-8 text-slate-300" />
        <CheckCircle2 className="w-8 h-8 text-slate-300" />
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-white border-t border-slate-100 py-12 px-6">
    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
      <div>
        <div className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-600"></div> Sanvix
        </div>
        <p className="text-sm text-slate-400">Healthcare Reimagined.</p>
      </div>
      <div>
        <h4 className="font-medium text-slate-900 mb-4">Platform</h4>
        <ul className="space-y-2 text-sm text-slate-500">
          <li><a href="#" className="hover:text-blue-600">Features</a></li>
          <li><a href="#" className="hover:text-blue-600">Security</a></li>
          <li><a href="#" className="hover:text-blue-600">Pricing</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-medium text-slate-900 mb-4">Company</h4>
        <ul className="space-y-2 text-sm text-slate-500">
          <li><a href="#" className="hover:text-blue-600">About</a></li>
          <li><a href="#" className="hover:text-blue-600">Careers</a></li>
          <li><a href="#" className="hover:text-blue-600">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-medium text-slate-900 mb-4">Legal</h4>
        <ul className="space-y-2 text-sm text-slate-500">
          <li><a href="#" className="hover:text-blue-600">Privacy</a></li>
          <li><a href="#" className="hover:text-blue-600">Terms</a></li>
        </ul>
      </div>
    </div>
    <div className="text-center text-xs text-slate-300 border-t border-slate-50 pt-8">
      © 2024 Sanvix Health Inc. All rights reserved.
    </div>
  </footer>
);

// --- Main Page ---

export const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden selection:bg-blue-100 selection:text-blue-700">
      {/* Background with subtle gradient only, no parallax */}
      <div className="absolute inset-0 -z-50 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
      </div>

      <Header onStart={onStart} />
      <main>
        <Hero onStart={onStart} />
        <SocialProof />
        <Features />
        <HowItWorks />
        <SplitShowcase />
        <Security />
      </main>
      <Footer />
    </div>
  );
};
