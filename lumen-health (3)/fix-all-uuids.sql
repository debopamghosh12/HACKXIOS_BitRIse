-- ============================================
-- FIX ALL IDs TO UUID (FINAL VERSION)
-- ============================================
-- All tables will use UUID for id (primary key) and patient_id (foreign key)

BEGIN;

-- 1. DROP AND RECREATE CHILD TABLES WITH UUID PRIMARY KEYS
-- (Since user authorized data loss, this is the cleanest approach)

DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.routines CASCADE;

-- 2. FIX PATIENTS TABLE
ALTER TABLE public.patients DROP COLUMN IF EXISTS patient_id CASCADE;
ALTER TABLE public.patients DROP COLUMN IF EXISTS old_patient_id CASCADE;

-- Add patient_id as UUID with auto-generation
ALTER TABLE public.patients 
  ADD COLUMN patient_id UUID UNIQUE DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);


-- 3. CREATE SUBSCRIPTIONS TABLE (UUID PRIMARY KEY)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(patient_id) ON DELETE CASCADE,
  medicine_id INTEGER,
  quantity_per_order INTEGER,
  dosage_per_day INTEGER,
  start_date DATE,
  next_refill_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_patient_id ON public.subscriptions(patient_id);
CREATE INDEX idx_subscriptions_medicine_id ON public.subscriptions(medicine_id);


-- 4. CREATE PAYMENTS TABLE (UUID PRIMARY KEY)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(patient_id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount NUMERIC(10,2),
  transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_patient_id ON public.payments(patient_id);
CREATE INDEX idx_payments_subscription_id ON public.payments(subscription_id);


-- 5. CREATE ROUTINES TABLE (UUID PRIMARY KEY)
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(patient_id) ON DELETE CASCADE,
  medicine_name TEXT,
  reminder_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_routines_patient_id ON public.routines(patient_id);


-- 6. ENABLE RLS ON ALL TABLES
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;


-- 7. CREATE RLS POLICIES

-- Patients Policies
DROP POLICY IF EXISTS "Users can manage their patients" ON public.patients;
CREATE POLICY "Users can manage their patients"
  ON public.patients FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Subscriptions Policies
DROP POLICY IF EXISTS "Users can manage their subscriptions" ON public.subscriptions;
CREATE POLICY "Users can manage their subscriptions"
  ON public.subscriptions FOR ALL
  USING (patient_id IN (SELECT patient_id FROM patients WHERE id = auth.uid()))
  WITH CHECK (patient_id IN (SELECT patient_id FROM patients WHERE id = auth.uid()));

-- Payments Policies
DROP POLICY IF EXISTS "Users can manage their payments" ON public.payments;
CREATE POLICY "Users can manage their payments"
  ON public.payments FOR ALL
  USING (patient_id IN (SELECT patient_id FROM patients WHERE id = auth.uid()))
  WITH CHECK (patient_id IN (SELECT patient_id FROM patients WHERE id = auth.uid()));

-- Routines Policies
DROP POLICY IF EXISTS "Users can manage their routines" ON public.routines;
CREATE POLICY "Users can manage their routines"
  ON public.routines FOR ALL
  USING (patient_id IN (SELECT patient_id FROM patients WHERE id = auth.uid()))
  WITH CHECK (patient_id IN (SELECT patient_id FROM patients WHERE id = auth.uid()));

COMMIT;
