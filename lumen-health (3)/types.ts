export type Step = 'landing' | 'auth' | 'app';
export type WizardStep = 'patient' | 'diagnosis' | 'medicines' | 'plan' | 'payment' | 'confirmation';
export type ActiveTab = 'home' | 'search' | 'subscription' | 'settings';

export interface Patient {
  id: string;
  fullName: string;
  age?: number;
  gender?: string;
  email: string;
  phone: string;
  conditions?: string;
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
  company?: string; // New field
  status?: 'In Stock' | 'Low Stock' | 'Out of Stock'; // New field
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Cream';
  strength: string;
  dosageQuantity: string;
  frequency: 'Once daily' | 'Twice daily' | 'Thrice daily' | 'Custom';
  durationDays: number;
  mappedProduct?: ProductMapping;
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
  takenMeds: string[]; // Keep for backward compatibility if needed, or remove later
  routineItems: RoutineItem[];
  completedRoutineIds: string[];
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
    id: '',
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
  takenMeds: [],
  routineItems: [],
  completedRoutineIds: [],
};