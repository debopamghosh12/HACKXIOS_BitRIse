import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const DEFAULT_SUPABASE_URL = 'https://zoinfprgsuuzqkcejuxx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvaW5mcHJnc3V1enFrY2VqdXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzOTgzNDksImV4cCI6MjA1MDk3NDM0OX0.KxJCBhQmMPgIgVHxjdTpWGPEJjxQkqIFiMnDnFPZIjc';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Using default Supabase credentials fallback. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in env for explicit config.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types matching your existing patients table
export interface UserProfile {
  id: string;
  full_name?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  email?: string;
  allergies?: string[];
  chronic_diseases?: string[];
  created_at: string;
}
