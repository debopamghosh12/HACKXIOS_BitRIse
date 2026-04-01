// API Base URL - Auto-switch between Localhost and Production
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000'
  : 'https://sanvix-hacksprite.onrender.com';

import { supabase } from './supabase';
import { Medicine, SubscriptionPlan } from '../types';

const isNetworkError = (error: unknown) => {
  const message = String((error as any)?.message || error || '');
  return message.includes('Failed to fetch') ||
    message.includes('ERR_NAME_NOT_RESOLVED') ||
    message.includes('NetworkError');
};

const normalizeMedicine = (row: any) => ({
  ...row,
  id: String(row?.id ?? row?.med_id ?? ''),
  med_id: row?.med_id ?? row?.id,
  price: Number(row?.price ?? 0)
});

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Immunity: ['immunity', 'immune', 'vitamin c', 'zinc', 'multivitamin', 'probiotic', 'd3'],
  Sleep: ['sleep', 'melatonin', 'insomnia', 'calm', 'chamomile', 'magnesium'],
  Energy: ['energy', 'b-complex', 'coq10', 'fatigue', 'iron', 'folate'],
  Heart: ['heart', 'omega', 'cholesterol', 'cardio', 'bp', 'blood pressure'],
  Hydration: ['hydration', 'electrolyte', 'ors', 'fluid', 'dehydration']
};

export const getMedicinesByCategory = async (
  category: string,
  searchQuery = '',
  sortBy: 'asc' | 'desc' = 'asc'
) => {
  try {
    let builder = supabase
      .from('medicines')
      .select('med_id, brand_name, issue_solved, net_qty, price')
      .limit(250);

    if (searchQuery.trim()) {
      builder = builder.ilike('brand_name', `%${searchQuery.trim()}%`);
    }

    const { data, error } = await builder;
    if (error) throw error;

    const rows = (data || []).map(normalizeMedicine);
    const keywords = CATEGORY_KEYWORDS[category] || [];

    const filtered = rows.filter((row: any) => {
      if (keywords.length === 0) return true;
      const haystack = `${row.brand_name || ''} ${row.issue_solved || ''}`.toLowerCase();
      return keywords.some((k) => haystack.includes(k));
    });

    const sorted = filtered.sort((a: any, b: any) => {
      const pa = Number(a.price || 0);
      const pb = Number(b.price || 0);
      return sortBy === 'asc' ? pa - pb : pb - pa;
    });

    return sorted;
  } catch (error) {
    console.error('Category medicines fetch error:', error);
    return [];
  }
};

/**
 * Search medicines from database by brand name
 */
export const searchMedicines = async (query: string) => {
  if (query.length < 1) return null;

  console.log('Searching for:', query);

  try {
    const response = await fetch(
      `${API_BASE_URL}/search-medicine?query=${encodeURIComponent(query)}`
    );

    console.log('Response status:', response.status);

    if (!response.ok) {
      throw new Error(`Search API failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Search results:', data);

    if (data.status === 'success' && data.results && data.results.length > 0) {
      const normalizedResults = data.results.map(normalizeMedicine);
      return {
        medicines: normalizedResults,
        count: normalizedResults.length
      };
    }
    return null;
  } catch (error) {
    console.error('Medicine search API error, trying Supabase fallback:', error);

    try {
      const { data, error: supabaseError } = await supabase
        .from('medicines')
        .select('med_id, brand_name, issue_solved, net_qty, price')
        .ilike('brand_name', `%${query}%`)
        .limit(20);

      if (supabaseError) {
        console.error('Supabase medicine search error:', supabaseError);
        return null;
      }

      if (data && data.length > 0) {
        const normalizedResults = data.map(normalizeMedicine);
        console.log('Supabase fallback search results:', normalizedResults);
        return {
          medicines: normalizedResults,
          count: normalizedResults.length
        };
      }

      return null;
    } catch (fallbackError) {
      console.error('Medicine search fallback failed:', fallbackError);
      return null;
    }
  }
};

/**
 * Create subscriptions for multiple medicines in Supabase
 */
export const createSubscriptions = async (
  patientId: string,  // UUID
  medicines: Medicine[],
  plan: SubscriptionPlan
) => {
  let subscriptionsData: Array<{
    patient_id: string;
    medicine_id: number;
    quantity_per_order: number;
    dosage_per_day: number;
    start_date: string;
    next_refill_date: string;
    status: string;
  }> = [];

  const resolveMedicineId = async (medicine: Medicine): Promise<number> => {
    const directId = Number(medicine.id);
    if (Number.isFinite(directId) && directId > 0) {
      return Math.trunc(directId);
    }

    const possibleName = (medicine.name || medicine.mappedProduct?.productName || '').trim();
    if (possibleName) {
      const { data, error } = await supabase
        .from('medicines')
        .select('med_id, id, brand_name')
        .ilike('brand_name', possibleName)
        .limit(1);

      if (!error && data && data.length > 0) {
        const found = data[0] as any;
        const resolved = Number(found.med_id ?? found.id);
        if (Number.isFinite(resolved) && resolved > 0) {
          return Math.trunc(resolved);
        }
      }
    }

    throw new Error(`Could not map medicine ID for \"${medicine.name || 'Unnamed medicine'}\". Please re-add from search results.`);
  };

  try {
    console.log('Creating subscriptions for patient:', patientId);

    subscriptionsData = await Promise.all(medicines.map(async (medicine) => {
      // Calculate dates
      const startDate = new Date().toISOString().split('T')[0];
      const nextRefillDate = new Date();
      nextRefillDate.setDate(nextRefillDate.getDate() + (medicine.interval || 30));
      const resolvedMedicineId = await resolveMedicineId(medicine);

      return {
        patient_id: patientId,
        medicine_id: resolvedMedicineId,
        quantity_per_order: parseInt(medicine.dosageQuantity) || 1,
        dosage_per_day: medicine.frequency === 'Once daily' ? 1 :
          medicine.frequency === 'Twice daily' ? 2 :
            medicine.frequency === 'Thrice daily' ? 3 : 1,
        start_date: startDate,
        next_refill_date: nextRefillDate.toISOString().split('T')[0],
        status: 'active'
      };
    }));

    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionsData)
      .select();

    if (error) {
      console.error('Subscription creation error:', error);
      throw new Error(error.message);
    }

    console.log('Subscriptions created:', data);
    return data;
  } catch (error) {
    if (!isNetworkError(error)) {
      console.error('Subscription error:', error);
      throw error;
    }

    console.warn('Supabase network failed, using backend fallback for subscriptions...');

    for (const sub of subscriptionsData) {
      const response = await fetch(`${API_BASE_URL}/create-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: sub.patient_id,
          medicine_id: sub.medicine_id,
          quantity: sub.quantity_per_order,
          dosage_per_day: sub.dosage_per_day
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fallback subscription failed: ${errorText}`);
      }
    }

    const dashboardResponse = await fetch(`${API_BASE_URL}/my-dashboard/${encodeURIComponent(patientId)}`);
    if (!dashboardResponse.ok) {
      const errorText = await dashboardResponse.text();
      throw new Error(`Fallback dashboard fetch failed: ${errorText}`);
    }

    const dashboardData = await dashboardResponse.json();
    const activeSubs = dashboardData?.active_subscriptions || [];

    const matchedSubs = subscriptionsData.map((sub, index) => {
      const match = activeSubs.find((item: any) => item.medicine_id === sub.medicine_id && item.patient_id === sub.patient_id);
      return {
        id: match?.id || index + 1,
        medicine_id: sub.medicine_id
      };
    });

    console.log('Subscriptions created via fallback:', matchedSubs);
    return matchedSubs;
  }
};

/**
 * Process payment and save to Supabase
 */
export const processPayment = async (
  patientId: string, // UUID
  subscriptionIds: number[],
  amount: number,
  plan: SubscriptionPlan
) => {
  try {
    console.log('Processing payment for patient:', patientId);

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment records for each subscription
    const paymentsData = subscriptionIds.map(subscriptionId => ({
      patient_id: patientId, // UUID
      subscription_id: subscriptionId,
      amount: amount / subscriptionIds.length,
      transaction_id: transactionId,
      status: 'completed'
    }));

    const { supabase } = await import('./supabase');
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentsData)
      .select();

    if (error) {
      console.error('Payment creation error:', error);
      throw new Error(error.message);
    }

    console.log('Payments created:', data);
    return {
      success: true,
      transactionId,
      payments: data
    };
  } catch (error) {
    if (!isNetworkError(error)) {
      console.error('Payment error:', error);
      throw error;
    }

    console.warn('Supabase network failed, using backend fallback for payments...');

    const eachAmount = subscriptionIds.length > 0 ? amount / subscriptionIds.length : amount;
    const fallbackResults: any[] = [];

    for (const subscriptionId of subscriptionIds) {
      const response = await fetch(`${API_BASE_URL}/process-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: patientId,
          subscription_id: subscriptionId,
          amount: eachAmount
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fallback payment failed: ${errorText}`);
      }

      fallbackResults.push(await response.json());
    }

    return {
      success: true,
      transactionId: fallbackResults[0]?.txn_id || `TXN_${Date.now()}_FALLBACK`,
      payments: fallbackResults
    };
  }
};

/**
 * Quick buy payment for direct purchases (without creating subscriptions)
 */
export const processQuickBuyPayment = async (
  patientId: string,
  amount: number
) => {
  try {
    const transactionId = `QBUY_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const { data, error } = await supabase
      .from('payments')
      .insert({
        patient_id: patientId,
        subscription_id: null,
        amount,
        transaction_id: transactionId,
        status: 'completed'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      transactionId,
      payment: data
    };
  } catch (error) {
    console.error('Quick buy payment error:', error);
    throw error;
  }
};

/**
 * Get user subscriptions with medicine details
 */
export const getUserSubscriptions = async (patientId: string) => {
  try {
    const { supabase } = await import('./supabase');

    // 1. Get subscriptions
    const { data: subs, error: subsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', 'active');

    if (subsError) throw subsError;
    if (!subs || subs.length === 0) return [];

    console.log('Fetched subscriptions:', subs);

    // 2. Get medicine details manually (since no FK relation might exist in Supabase types yet)
    // We assume medicine_id is stored in subscription
    // If the user changed column to med_id in medicines table, we need to handle that.
    // Based on user input, we should check `med_id` or `id`.

    // Collect numeric medicine IDs from subscriptions.
    const medIds = subs
      .map(s => Number(s.medicine_id))
      .filter((id): id is number => Number.isFinite(id) && id > 0);

    let meds: any[] = [];
    if (medIds.length > 0) {
      // Try current schema first (med_id), then legacy (id) if needed.
      const medIdQuery = await supabase
        .from('medicines')
        .select('*')
        .in('med_id', medIds);

      if (medIdQuery.error) {
        console.warn('med_id lookup failed, trying id lookup:', medIdQuery.error);
      } else {
        meds = medIdQuery.data || [];
      }

      if (meds.length < medIds.length) {
        const idQuery = await supabase
          .from('medicines')
          .select('*')
          .in('id', medIds);

        if (!idQuery.error && idQuery.data) {
          const existing = new Set(meds.map(m => Number(m.med_id ?? m.id)));
          const missingFromLegacy = idQuery.data.filter(m => !existing.has(Number(m.med_id ?? m.id)));
          meds = [...meds, ...missingFromLegacy];
        }
      }
    }

    const medicinesMap = new Map<number, any>();
    for (const med of meds) {
      const key = Number(med.med_id ?? med.id);
      if (Number.isFinite(key)) {
        medicinesMap.set(key, med);
      }
    }

    // 3. Map back to frontend Medicine type
    let routineNames: string[] = [];
    try {
      const { data: routines } = await supabase
        .from('routines')
        .select('medicine_name, created_at')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: true });

      routineNames = (routines || [])
        .map((r: any) => String(r.medicine_name || '').trim())
        .filter((name: string) => !!name);
    } catch (routineErr) {
      console.warn('Could not fetch routine-based medicine name fallbacks:', routineErr);
    }

    let routineFallbackIdx = 0;

    const mappedMedicines: Medicine[] = subs.map(sub => {
      const medId = Number(sub.medicine_id);
      const medDetails = medicinesMap.get(medId);
      const routineFallbackName = routineNames[routineFallbackIdx] || '';
      if ((!Number.isFinite(medId) || medId <= 0) && routineFallbackName) {
        routineFallbackIdx += 1;
      }

      const resolvedName =
        medDetails?.brand_name ||
        medDetails?.name ||
        sub?.medicine_name ||
        sub?.medicine?.brand_name ||
        routineFallbackName ||
        ((Number.isFinite(medId) && medId > 0) ? `Medicine #${medId}` : 'Medicine');

      const resolvedPack = medDetails?.net_qty || medDetails?.pack_size || '';
      const resolvedPrice = Number(medDetails?.price ?? sub?.price ?? 0) || 0;

      return {
        id: Number.isFinite(medId) ? medId.toString() : String(sub.medicine_id || ''),
        name: resolvedName,
        strength: resolvedPack, // Approximation
        frequency: sub.dosage_per_day === 1 ? 'Once daily' : sub.dosage_per_day === 2 ? 'Twice daily' : 'Custom',
        durationDays: 30, // Default or calculate from dates
        dosageQuantity: sub.quantity_per_order?.toString() || '1',
        status: 'In Stock',
        form: 'Tablet',
        mappedProduct: {
          productName: resolvedName,
          company: '',
          pricePerUnit: resolvedPrice,
          packSize: resolvedPack,
          inStock: true
        },
        issue_solved: medDetails?.issue_solved,
        price: resolvedPrice,
        interval: 30, // Default refill interval
        isPendingPurchase: false
      };
    });

    return mappedMedicines;

  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return [];
  }
};

/**
 * Add medicine routines/reminders to Supabase
 */
export const addRoutines = async (
  patientId: string, // UUID
  medicines: Medicine[]
) => {
  try {
    console.log('Adding routines for patient:', patientId);

    const routinesData = medicines.map(medicine => ({
      patient_id: patientId, // UUID
      medicine_name: medicine.name,
      reminder_time: '09:00 AM' // Default time, logic can be enhanced later based on frequency
    }));

    const { supabase } = await import('./supabase');
    const { data, error } = await supabase
      .from('routines')
      .insert(routinesData)
      .select();

    if (error) {
      console.error('Routine creation error:', error);
      throw new Error(error.message);
    }

    console.log('Routines created:', data);
    return data;
  } catch (error) {
    if (!isNetworkError(error)) {
      console.error('Routine error:', error);
      throw error;
    }

    console.warn('Supabase network failed, using backend fallback for routines...');

    const results: any[] = [];
    for (const medicine of medicines) {
      const response = await fetch(`${API_BASE_URL}/add-routine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: patientId,
          medicine_name: medicine.name,
          reminder_time: '09:00 AM'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fallback routine failed: ${errorText}`);
      }

      results.push(await response.json());
    }

    return results;
  }
};

/**
 * Get user's subscriptions from Supabase
 */

/**
 * Get user's payment history from Supabase
 */
export const getUserPayments = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

/**
 * Get user's routines from Supabase
 */
export const getUserRoutines = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching routines:', error);
    throw error;
  }
};