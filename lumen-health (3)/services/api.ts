// API Base URL - Update this to match your FastAPI backend
const API_BASE_URL = 'http://localhost:8000';

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
 * Create subscription for a medicine
 */
export const createSubscription = async (subscriptionData: {
  user_id: string;
  medicine_id: number;
  quantity: number;
  dosage_per_day: number;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create-subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriptionData),
    });
    const data = await response.json();

    if (data.status === 'success') {
      return data;
    }
    throw new Error(data.message || 'Subscription creation failed');
  } catch (error) {
    console.error('Subscription error:', error);
    throw error;
  }
};

/**
 * Process payment (mock for now)
 */
export const processPayment = async (amount: number) => {
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { success: true, transactionId: `TXN_${Date.now()}` };
};