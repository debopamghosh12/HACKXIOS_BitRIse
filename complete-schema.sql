-- ============================================
-- COMPLETE DATABASE SCHEMA WITH PATIENT ID CONNECTIONS
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. USERS TABLE (Already exists, but let's ensure it's correct)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own record" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own record" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. PATIENTS TABLE (Extended profile with medical info)
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
  blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  allergies JSONB DEFAULT '[]'::jsonb,
  chronic_diseases JSONB DEFAULT '[]'::jsonb,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients
CREATE POLICY "Patients can view own record" ON public.patients FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Patients can update own record" ON public.patients FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Patients can insert own record" ON public.patients FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. MEDICINES TABLE (Already exists)
-- Assuming this already exists with: id, brand_name, issue_solved, net_qty, price

-- 4. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id SERIAL PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  medicine_id INTEGER NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  quantity_per_order INTEGER NOT NULL,
  dosage_per_day INTEGER NOT NULL,
  next_refill_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Users can create own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "Users can delete own subscriptions" ON public.subscriptions FOR DELETE USING (auth.uid() = patient_id);

-- 5. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id SERIAL PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Users can create own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- 6. ROUTINES TABLE
CREATE TABLE IF NOT EXISTS public.routines (
  id SERIAL PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  reminder_time TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for routines
CREATE POLICY "Users can view own routines" ON public.routines FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Users can create own routines" ON public.routines FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Users can update own routines" ON public.routines FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "Users can delete own routines" ON public.routines FOR DELETE USING (auth.uid() = patient_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_patient_id ON public.subscriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_medicine_id ON public.subscriptions(medicine_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_refill ON public.subscriptions(next_refill_date);

CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON public.payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON public.payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);

CREATE INDEX IF NOT EXISTS idx_routines_patient_id ON public.routines(patient_id);
CREATE INDEX IF NOT EXISTS idx_routines_active ON public.routines(is_active);

-- ============================================
-- TRIGGER: Auto-create user record on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check foreign key relationships
-- SELECT
--   tc.table_name, 
--   kcu.column_name, 
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name 
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY';
