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

    const data = await response.json();
    console.log('Search results:', data);

    if (data.status === 'success' && data.results && data.results.length > 0) {
      return {
        medicines: data.results,
        count: data.count
      };
    }
    return null;
  } catch (error) {
    console.error('Medicine search error:', error);
    return null;
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
  const subscriptionsData = medicines.map(medicine => {
    // Calculate dates
    const startDate = new Date().toISOString().split('T')[0];
    const nextRefillDate = new Date();
    nextRefillDate.setDate(nextRefillDate.getDate() + (medicine.interval || 30));

    return {
      patient_id: patientId,
      medicine_id: parseInt(medicine.id),
      quantity_per_order: parseInt(medicine.dosageQuantity) || 1,
      dosage_per_day: medicine.frequency === 'Once daily' ? 1 :
        medicine.frequency === 'Twice daily' ? 2 :
          medicine.frequency === 'Thrice daily' ? 3 : 1,
      start_date: startDate,
      next_refill_date: nextRefillDate.toISOString().split('T')[0],
      status: 'active'
    };
  });

  try {
    console.log('Creating subscriptions for patient:', patientId);

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

    // Collect all medicine IDs
    const medIds = subs.map(s => s.medicine_id).filter(Boolean);

    if (medIds.length === 0) return [];

    // Fetch medicines
    // Note: User said medicines.id changed to medicines.med_id. 
    // We try to fetch using the correct column.
    const { data: meds, error: medsError } = await supabase
      .from('medicines')
      .select('*')
      .in('med_id', medIds); // User said they changed id to med_id

    if (medsError) {
      console.error('Error fetching medicines details:', medsError);
      // Fallback: try querying 'id' if 'med_id' fails (or handling error)
    }

    const medicinesMap = new Map<number, any>((meds as any[] | null)?.map((m: any) => [m.med_id, m]) || []);

    // 3. Map back to frontend Medicine type
    const mappedMedicines: Medicine[] = subs.map(sub => {
      const medDetails = medicinesMap.get(sub.medicine_id);
      return {
        id: sub.medicine_id?.toString() || '',
        name: medDetails?.brand_name || 'Unknown Medicine',
        strength: medDetails?.net_qty || '', // Approximation
        frequency: sub.dosage_per_day === 1 ? 'Once daily' : sub.dosage_per_day === 2 ? 'Twice daily' : 'Custom',
        durationDays: 30, // Default or calculate from dates
        dosageQuantity: sub.quantity_per_order?.toString() || '1',
        status: 'In Stock',
        form: 'Tablet',
        mappedProduct: {
          productName: medDetails?.brand_name || '',
          company: '',
          pricePerUnit: medDetails?.price || 0,
          packSize: medDetails?.net_qty || '',
          inStock: true
        },
        issue_solved: medDetails?.issue_solved,
        price: medDetails?.price,
        interval: 30 // Default refill interval
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