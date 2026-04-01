import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Minus, Trash2, ShoppingBag, CreditCard, ShieldCheck } from 'lucide-react';
import { AppState } from '../types';
import { GlassCard, Button, Input } from '../components/UI';
import { processQuickBuyPayment, searchMedicines } from '../services/api';

interface QuickBuyPageProps {
  state: AppState;
}

interface QuickMedicine {
  id: string;
  name: string;
  issue: string;
  netQty: string;
  price: number;
  quantity: number;
}

export const QuickBuyPage: React.FC<QuickBuyPageProps> = ({ state }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [cart, setCart] = useState<QuickMedicine[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const totalAmount = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const isPaymentFormValid = cardNumber.replace(/\D/g, '').length >= 13 && /^\d{2}\/\d{2}$/.test(expiry) && /^\d{3,4}$/.test(cvc);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      const response = await searchMedicines(value);
      setResults(response?.medicines || []);
    } catch (e: any) {
      setError(e?.message || 'Search failed');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addToCart = (medicine: any) => {
    const id = String(medicine.id ?? medicine.med_id ?? '');
    if (!id) return;

    const price = Number(medicine.price || 0);

    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [
        ...prev,
        {
          id,
          name: medicine.brand_name || medicine.name || 'Medicine',
          issue: medicine.issue_solved || 'General use',
          netQty: medicine.net_qty || 'N/A',
          price,
          quantity: 1
        }
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const increaseQuantity = (id: string) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
  };

  const decreaseQuantity = (id: string) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item));
  };

  const handleQuickPay = async () => {
    setError(null);
    setSuccessMessage(null);

    if (cart.length === 0) {
      setError('Add at least one medicine to cart.');
      return;
    }

    if (!isPaymentFormValid) {
      setError('Enter valid payment details.');
      return;
    }

    const patientId = state.patient.patientId || state.patient.id;
    if (!patientId) {
      setError('No patient profile selected. Please complete profile setup first.');
      return;
    }

    setIsPaying(true);
    try {
      const result = await processQuickBuyPayment(patientId, totalAmount);
      setSuccessMessage(`Payment successful! Transaction ID: ${result.transactionId}`);
      setCart([]);
      setCardNumber('');
      setExpiry('');
      setCvc('');
      setQuery('');
      setResults([]);
    } catch (e: any) {
      setError(e?.message || 'Payment failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-light text-slate-800">Quick Buy</h2>
        <p className="text-slate-500 mt-2">Search, add to cart, and pay instantly without full plan setup.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500" /> Search Medicines
          </h3>

          <div className="relative mb-4">
            <Input
              label="Medicine Name"
              placeholder="Type medicine name..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
            {isSearching && <p className="text-xs text-slate-500 -mt-2">Searching...</p>}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {results.map((med) => (
              <div key={String(med.id ?? med.med_id)} className="border border-slate-200 rounded-xl p-3 bg-white/70">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-800">{med.brand_name}</p>
                    <p className="text-xs text-slate-500">{med.issue_solved || 'General use'}</p>
                    <p className="text-xs text-slate-500 mt-1">{med.net_qty || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-700 font-semibold">₹{Number(med.price || 0).toFixed(2)}</p>
                    <button
                      onClick={() => addToCart(med)}
                      className="mt-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-blue-600 transition-colors inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!isSearching && query && results.length === 0 && (
              <p className="text-sm text-slate-500">No medicines found.</p>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-500" /> Quick Checkout
          </h3>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1 mb-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500">Unit ₹{item.price.toFixed(2)} • Subtotal ₹{(item.price * item.quantity).toFixed(2)}</p>
                  <div className="mt-2 inline-flex items-center rounded-lg border border-slate-200 bg-white">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="px-2 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-l-lg transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1 text-xs font-semibold text-slate-700 border-x border-slate-200">{item.quantity}</span>
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="px-2 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-r-lg transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {cart.length === 0 && <p className="text-sm text-slate-500">Cart is empty.</p>}
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 mb-4 flex justify-between">
            <span className="text-sm font-medium text-slate-700">Total</span>
            <span className="text-sm font-semibold text-blue-700">₹{totalAmount.toFixed(2)}</span>
          </div>

          <div className="space-y-3">
            <Input
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              icon={<CreditCard className="w-4 h-4" />}
              value={cardNumber}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 19);
                const groups = digits.match(/.{1,4}/g) || [];
                setCardNumber(groups.join(' '));
              }}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Expiry"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
                }}
              />
              <Input
                label="CVC"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          {successMessage && <p className="text-sm text-green-600 mt-3">{successMessage}</p>}

          <div className="mt-5">
            <Button onClick={handleQuickPay} isLoading={isPaying} disabled={cart.length === 0 || !isPaymentFormValid} className="w-full">
              Pay & Buy Now
            </Button>
            <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 mr-1" /> Secure instant checkout
            </p>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};