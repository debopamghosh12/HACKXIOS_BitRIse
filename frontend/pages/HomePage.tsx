import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, Zap, Moon, Heart, Shield, Sparkles, Droplet, Sun, Crown, Package, Activity } from 'lucide-react';
import { GlassCard, Button } from '../components/UI';
import { AppState, RoutineItem } from '../types';
import { WellnessWidget, PlanProgressWidget, DailyRoutineWidget } from '../components/HomeWidgets';

interface HomePageProps {
  state: AppState;
  toggleMedicine: (id: string) => void;
  addRoutineItem: (item: RoutineItem) => void;
  toggleRoutineItem: (id: string) => void;
  goToSearch: () => void;
  addToPlan: (item: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ state, toggleMedicine, addRoutineItem, toggleRoutineItem, goToSearch, addToPlan }) => {

  // Updated categories to Blue/Cool tones with NEW Icons
  const categories = [
    { name: 'Immunity', icon: Crown, color: 'bg-blue-100 text-blue-600' },
    { name: 'Sleep', icon: Moon, color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Energy', icon: Sun, color: 'bg-amber-100 text-amber-600' },
    { name: 'Heart', icon: Activity, color: 'bg-rose-100 text-rose-600' }, // Changed to Activity/Red-ish
    { name: 'Hydration', icon: Droplet, color: 'bg-cyan-100 text-cyan-600' }, // Replaced General
  ];

  const recommendations = [
    { id: 1, name: 'Daily Multi-Vitamin', desc: 'Essential nutrients for daily energy.', price: '₹1800.00', tag: 'Wellness', image: '/products/multivitamin.png' },
    { id: 2, name: 'Omega-3 Fish Oil', desc: 'Supports heart and brain health.', price: '₹1850.00', tag: 'Heart', image: '/products/omega3.png' },
    { id: 3, name: 'Melatonin Sleep Aid', desc: 'Natural support for better sleep.', price: '₹900.00', tag: 'Sleep', image: '/products/melatonin.png' },
    { id: 4, name: 'Probiotic Complex', desc: 'For a healthy digestive system.', price: '₹2400.00', tag: 'Gut Health', image: '/products/probiotic.png' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">

      {/* New Hero Section - Bento Grid Widgets */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[500px]">

        {/* Large Graph Widget (Left Main) - Spans 8 cols, 2 rows */}
        <div className="md:col-span-8 md:row-span-2 min-h-[500px]">
          <WellnessWidget state={state} />
        </div>

        {/* Plan Progress (Top Right) - Spans 4 cols */}
        <div className="md:col-span-4 min-h-[240px]">
          <PlanProgressWidget />
        </div>

        {/* Daily Routine (Bottom Right) - Spans 4 cols */}
        <div className="md:col-span-4 min-h-[240px]">
          <DailyRoutineWidget
            state={state}
            toggleMedicine={toggleMedicine}
            addRoutineItem={addRoutineItem}
            toggleRoutineItem={toggleRoutineItem}
          />
        </div>

      </section>

      {/* Categories Scroller */}
      <section>
        <div className="flex justify-between items-end mb-6 px-2">
          <h2 className="text-2xl font-light text-slate-800">Shop by Goal</h2>
          <button className="text-sm font-medium text-slate-500 hover:text-blue-600 underline decoration-1 underline-offset-4 decoration-blue-200">View all</button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide px-2">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center gap-3 min-w-[100px] cursor-pointer group"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-xl transition-all duration-300 shadow-sm group-hover:shadow-md ${cat.color}`}>
                <cat.icon className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recommendations Grid - Bento Style */}
      <section>
        <div className="flex items-center gap-2 mb-8 px-2">
          <Package className="w-5 h-5 text-blue-500" /> {/* Changed Icon */}
          <h2 className="text-xl font-light text-slate-800">Curated For You</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 flex flex-col"
            >

              <div className="relative aspect-square rounded-2xl bg-white mb-4 overflow-hidden flex items-center justify-center group-hover:bg-blue-50/30 transition-colors">
                {/* Product Image */}
                <div className="w-full h-full p-6 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {item.tag}
                </div>
              </div>

              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-slate-800 text-lg leading-tight">{item.name}</h3>
                <span className="font-serif italic text-slate-600">{item.price}</span>
              </div>

              <p className="text-sm text-slate-500 font-light mb-6 line-clamp-2">{item.desc}</p>

              <div className="mt-auto">
                <button
                  onClick={() => addToPlan(item)}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-medium flex items-center justify-center gap-2 group-hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200"
                >
                  <Plus className="w-4 h-4" /> Add to Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};