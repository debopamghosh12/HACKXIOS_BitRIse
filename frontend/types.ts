export type Step = 'landing' | 'auth' | 'app';
export type WizardStep = 'patient' | 'diagnosis' | 'medicines' | 'plan' | 'payment' | 'confirmation';
export type ActiveTab = 'home' | 'search' | 'quickbuy' | 'subscription' | 'settings';

export interface Patient {
  id?: string; // The Profille ID (PK: patient_id) - kept as 'id' for frontend compatibility or standard
  patientId?: string; // Explicit alias for clarity (matches DB column patient_id)
  ownerId?: string; // The Auth User ID (FK: owner_id)
  email: string;
  fullName: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  conditions?: string;
  address?: string; // Added address
}

export interface Diagnosis {
  primaryDiagnosis: string;
  notes?: string;
  prescriptionFile?: File | null;
  doctorName?: string;
}

export interface Medicine {
  id: string;
  name: string;
  company?: string;
  status?: 'In Stock' | 'Low Stock' | 'Out of Stock';
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Cream';
  strength: string;
  dosageQuantity: string;
  frequency: 'Once daily' | 'Twice daily' | 'Thrice daily' | 'Custom';
  durationDays: number;
  mappedProduct?: ProductMapping;
  // Database fields
  issue_solved?: string;
  net_qty?: string;
  price?: number;
  interval?: number; // Refill interval in days
  isPendingPurchase?: boolean; // True until payment succeeds
}

export interface ProductMapping {
  productName: string;
  company: string; // New field
  pricePerUnit: number;
  packSize: string;
  imageUrl?: string;
  inStock: boolean; // New field
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  billingInterval: 'One-time' | 'Monthly' | 'Quarterly';
  discountPercentage: number;
  description: string;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  marketingEnabled: boolean;
  refillReminderDays: number;
  refillReminderTime: string;
}

export interface AppState {
  step: Step; // Controls high-level flow (Landing -> Auth -> Main App)
  activeTab: ActiveTab; // Controls the 4 main tabs
  wizardStep: WizardStep; // Controls the form flow inside Search tab
  patient: Patient;
  diagnosis: Diagnosis;
  medicines: Medicine[];
  selectedPlan: SubscriptionPlan | null;
  paymentStatus: 'idle' | 'processing' | 'success' | 'error';
  notificationSettings: NotificationSettings;
  medicineReminderTimes: Record<string, string>; // medicineId -> HH:mm
  takenMeds: string[]; // Keep for backward compatibility if needed, or remove later
  routineItems: RoutineItem[];
  completedRoutineIds: string[];
  routineCompletionLog: Record<string, string>; // key: YYYY-MM-DD:medicineId, value: ISO timestamp
  profiles: Patient[]; // Store all user profiles
}

export interface RoutineItem {
  id: string;
  title: string; // "Medicine Name"
  time: string;
  type: 'Capsule' | 'Tablet' | 'Syrup' | 'Injection' | 'Cream' | 'Drops' | 'Other';
}

export const INITIAL_STATE: AppState = {
  step: 'landing',
  activeTab: 'home',
  wizardStep: 'patient',
  patient: {
    fullName: '',
    email: '',
    phone: '',
  },
  diagnosis: {
    primaryDiagnosis: '',
  },
  medicines: [],
  selectedPlan: null,
  paymentStatus: 'idle',
  notificationSettings: {
    pushEnabled: false,
    emailEnabled: true,
    marketingEnabled: false,
    refillReminderDays: 3,
    refillReminderTime: '09:00',
  },
  medicineReminderTimes: {},
  takenMeds: [],
  routineItems: [],
  completedRoutineIds: [],
  routineCompletionLog: {},
  profiles: [],
};