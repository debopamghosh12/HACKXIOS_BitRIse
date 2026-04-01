import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Moon, Droplet, Sun, Crown, Package, Activity, ArrowLeft } from 'lucide-react';
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
  type CategoryName = 'Immunity' | 'Sleep' | 'Energy' | 'Heart' | 'Hydration';

  const [selectedCategory, setSelectedCategory] = useState<CategoryName | null>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [sortByPrice, setSortByPrice] = useState<'asc' | 'desc'>('asc');

  const categories = [
    { name: 'Immunity' as CategoryName, icon: Crown, color: 'bg-blue-100 text-blue-600', pageBg: 'from-blue-50 to-sky-50', accent: 'text-blue-700' },
    { name: 'Sleep' as CategoryName, icon: Moon, color: 'bg-indigo-100 text-indigo-600', pageBg: 'from-indigo-50 to-violet-50', accent: 'text-indigo-700' },
    { name: 'Energy' as CategoryName, icon: Sun, color: 'bg-amber-100 text-amber-600', pageBg: 'from-amber-50 to-orange-50', accent: 'text-amber-700' },
    { name: 'Heart' as CategoryName, icon: Activity, color: 'bg-rose-100 text-rose-600', pageBg: 'from-rose-50 to-red-50', accent: 'text-rose-700' },
    { name: 'Hydration' as CategoryName, icon: Droplet, color: 'bg-cyan-100 text-cyan-600', pageBg: 'from-cyan-50 to-teal-50', accent: 'text-cyan-700' },
  ];

  const categoryMedicines: Record<CategoryName, Array<{ id: number; name: string; desc: string; price: string; tag: string }>> = {
    Immunity: [
      { id: 101, name: 'Vitamin C + Zinc', desc: 'Daily immune support and antioxidant protection.', price: '₹650.00', tag: 'Immune Care' },
      { id: 102, name: 'Elderberry Gummies', desc: 'Seasonal wellness support with natural extracts.', price: '₹740.00', tag: 'Daily Shield' },
      { id: 103, name: 'Probiotic + D3', desc: 'Gut-health based immunity and bone support.', price: '₹990.00', tag: 'Core Health' },
    ],
    Sleep: [
      { id: 201, name: 'Melatonin Sleep Aid', desc: 'Supports natural sleep onset and rhythm.', price: '₹900.00', tag: 'Night Routine' },
      { id: 202, name: 'Magnesium Glycinate', desc: 'Calming mineral support for deep rest.', price: '₹1120.00', tag: 'Relaxation' },
      { id: 203, name: 'Chamomile Complex', desc: 'Plant-based support for stress and sleep quality.', price: '₹780.00', tag: 'Herbal Sleep' },
    ],
    Energy: [
      { id: 301, name: 'B-Complex Boost', desc: 'Cellular energy metabolism and fatigue support.', price: '₹820.00', tag: 'Daily Energy' },
      { id: 302, name: 'CoQ10 Active', desc: 'Mitochondrial support for sustained energy.', price: '₹1350.00', tag: 'Performance' },
      { id: 303, name: 'Iron + Folate', desc: 'Helps maintain healthy oxygen transport.', price: '₹690.00', tag: 'Vitality' },
    ],
    Heart: [
      { id: 401, name: 'Omega-3 Fish Oil', desc: 'Supports heart and brain health.', price: '₹1850.00', tag: 'Cardio Support' },
      { id: 402, name: 'Plant Sterols', desc: 'Supports healthy cholesterol levels.', price: '₹1260.00', tag: 'Lipid Balance' },
      { id: 403, name: 'CoQ10 Cardio', desc: 'Heart muscle support and antioxidant care.', price: '₹1480.00', tag: 'Heart Function' },
    ],
    Hydration: [
      { id: 501, name: 'Electrolyte Restore', desc: 'Hydration salts for active recovery.', price: '₹540.00', tag: 'Replenish' },
      { id: 502, name: 'ORS Daily Pack', desc: 'Fluid and mineral balance support.', price: '₹420.00', tag: 'Hydrate' },
      { id: 503, name: 'Coconut Mineral Mix', desc: 'Natural hydration with key minerals.', price: '₹610.00', tag: 'Mineral Care' },
    ],
  };

  const activeCategoryConfig = categories.find((cat) => cat.name === selectedCategory) || null;

  const categoryItems = useMemo(() => {
    if (!selectedCategory) return [];

    const base = categoryMedicines[selectedCategory] || [];
    const filtered = base.filter((item) => {
      const q = categorySearch.trim().toLowerCase();
      return !q || item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.tag.toLowerCase().includes(q);
    });

    return filtered.sort((a, b) => {
      const pa = parseFloat(a.price.replace(/[^0-9.]/g, ''));
      const pb = parseFloat(b.price.replace(/[^0-9.]/g, ''));
      return sortByPrice === 'asc' ? pa - pb : pb - pa;
    });
  }, [selectedCategory, categorySearch, sortByPrice]);

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
          <button
            className="text-sm font-medium text-slate-500 hover:text-blue-600 underline decoration-1 underline-offset-4 decoration-blue-200"
            onClick={() => setSelectedCategory(null)}
          >
            View all
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide px-2">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedCategory(cat.name)}
              className="flex flex-col items-center gap-3 min-w-[100px] cursor-pointer group"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-xl transition-all duration-300 shadow-sm group-hover:shadow-md ${cat.color} ${selectedCategory === cat.name ? 'ring-4 ring-blue-100' : ''}`}>
                <cat.icon className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <span className={`text-sm font-medium group-hover:text-slate-900 ${selectedCategory === cat.name ? 'text-blue-700' : 'text-slate-600'}`}>{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {selectedCategory && activeCategoryConfig && (
        <section>
          <div className={`rounded-3xl border border-white/70 bg-gradient-to-r ${activeCategoryConfig.pageBg} p-6 md:p-8 shadow-sm`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Category Page</p>
                <h3 className={`text-2xl md:text-3xl font-light ${activeCategoryConfig.accent}`}>{selectedCategory} Essentials</h3>
                <p className="text-slate-600 mt-2">Curated products for your {selectedCategory.toLowerCase()} goals.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={goToSearch}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Open Full Search
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <input
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder={`Search within ${selectedCategory}`}
                className="md:col-span-2 px-4 py-3 rounded-xl border border-slate-200 bg-white/90 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <select
                value={sortByPrice}
                onChange={(e) => setSortByPrice(e.target.value as 'asc' | 'desc')}
                className="px-4 py-3 rounded-xl border border-slate-200 bg-white/90 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm hover:shadow-md transition-all">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">{item.tag}</p>
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-base font-medium text-slate-800 leading-snug">{item.name}</h4>
                    <span className="text-sm font-semibold text-slate-700">{item.price}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 mb-4">{item.desc}</p>
                  <button
                    onClick={() => addToPlan(item)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add to Plan
                  </button>
                </div>
              ))}
            </div>

            {categoryItems.length === 0 && (
              <div className="mt-4 rounded-xl border border-blue-100 bg-white/80 p-4 text-sm text-slate-600">
                No medicines matched your filter. Try another search term.
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recommendations Grid - Bento Style */}
      {!selectedCategory && (
      <section>
        <div className="flex items-center gap-2 mb-8 px-2">
          <Package className="w-5 h-5 text-blue-500" />
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
      )}

    </div>
  );
};