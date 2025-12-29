import { Medicine, ProductMapping } from '../types';

// Mock database of medicines for mapping
const MOCK_MEDICINE_DB: Record<string, ProductMapping> = {
  'asp': { productName: 'Aspirin Protect 100mg', company: 'Bayer', pricePerUnit: 0.15, packSize: '30 tablets', inStock: true },
  'par': { productName: 'Paracetamol 500mg', company: 'Panadol', pricePerUnit: 0.10, packSize: '20 tablets', inStock: true },
  'lip': { productName: 'Lipitor (Atorvastatin) 20mg', company: 'Pfizer', pricePerUnit: 1.20, packSize: '30 tablets', inStock: true },
  'met': { productName: 'Metformin HCl 500mg', company: 'Glucophage', pricePerUnit: 0.05, packSize: '60 tablets', inStock: true },
  'ibu': { productName: 'Ibuprofen 400mg', company: 'Advil', pricePerUnit: 0.12, packSize: '24 softgels', inStock: false }, // Example out of stock
  'amo': { productName: 'Amoxicillin 500mg', company: 'Sandoz', pricePerUnit: 0.40, packSize: '15 capsules', inStock: true },
};

export const searchMedicines = async (query: string): Promise<ProductMapping | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const key = query.toLowerCase().slice(0, 3);
      resolve(MOCK_MEDICINE_DB[key] || null);
    }, 400); // Simulate network latency
  });
};

export const processPayment = async (amount: number): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 2000); // Simulate payment processing
  });
};