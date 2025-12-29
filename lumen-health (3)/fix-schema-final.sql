-- ============================================
-- FIX SCHEMA: CORRECT MULTI-PATIENT ARCHITECTURE
-- ============================================
-- Goal: patients.id = auth UUID (PK), patients.patient_id = generated UUID (UNIQUE)
-- Child tables reference patient_id (UUID)

BEGIN;

-- 1. TRUNCATE CHILD TABLES (as authorized by user)
TRUNCATE TABLE public.subscriptions, public.payments, public.routines CASCADE;

-- 2. FIX PATIENTS TABLE
-- Drop old patient_id columns (both int8 and uuid if they exist)
ALTER TABLE public.patients DROP COLUMN IF EXISTS patient_id CASCADE;
ALTER TABLE public.patients DROP COLUMN IF EXISTS old_patient_id CASCADE;

-- Add patient_id as UUID with auto-generation
ALTER TABLE public.patients 
  ADD COLUMN patient_id UUID UNIQUE DEFAULT gen_random_uuid();

-- Create index
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);

-- Ensure id remains the auth UUID primary key (should already be set)
-- ALTER TABLE public.patients ALTER COLUMN id SET NOT NULL;
-- ALTER TABLE public.patients ADD PRIMARY KEY (id) IF NOT EXISTS;


-- 3. FIX SUBSCRIPTIONS TABLE
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS patient_id CASCADE;
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS old_patient_id CASCADE;

-- Add clean UUID patient_id
ALTER TABLE public.subscriptions 
  ADD COLUMN patient_id UUID NOT NULL;

-- Add Foreign Key
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_patient_id_fkey
  FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_subscriptions_patient_id ON public.subscriptions(patient_id);


-- 4. FIX PAYMENTS TABLE
ALTER TABLE public.payments DROP COLUMN IF EXISTS patient_id CASCADE;
ALTER TABLE public.payments DROP COLUMN IF EXISTS old_patient_id CASCADE;

ALTER TABLE public.payments 
  ADD COLUMN patient_id UUID NOT NULL;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_patient_id_fkey
  FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON public.payments(patient_id);


-- 5. FIX ROUTINES TABLE
ALTER TABLE public.routines DROP COLUMN IF EXISTS patient_id CASCADE;
ALTER TABLE public.routines DROP COLUMN IF EXISTS old_patient_id CASCADE;

ALTER TABLE public.routines 
  ADD COLUMN patient_id UUID NOT NULL;

ALTER TABLE public.routines
  ADD CONSTRAINT routines_patient_id_fkey
  FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_routines_patient_id ON public.routines(patient_id);


-- 6. UPDATE RLS POLICIES
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- Patients Policies (user owns records where id matches auth.uid)
DROP POLICY IF EXISTS "Users can manage their patients" ON public.patients;
DROP POLICY IF EXISTS "Users can view their patients" ON public.patients;
DROP POLICY IF EXISTS "Users can insert their patients" ON public.patients;
DROP POLICY IF EXISTS "Users can update their patients" ON public.patients;
DROP POLICY IF EXISTS "Users can delete their patients" ON public.patients;

CREATE POLICY "Users can manage their patients"
  ON public.patients
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- Subscriptions Policies
DROP POLICY IF EXISTS "Users can manage their subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their subscriptions" ON public.subscriptions;

CREATE POLICY "Users can manage their subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (
    patient_id IN (SELECT patient_id FROM patients WHERE id = auth.uid())
  )
  WITH CHECK (
    patient_id IN (SELECT patient_id FROM patients WHERE id = auth.uid())
  );


-- Payments Policies
DROP POLICY IF EXISTS "Users can manage their payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view their payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert their payments" ON public.payments;

CREATE POLICY "Users can manage their payments"
  ON public.payments
  FOR ALL
  USING (
    patient_id IN (SELECT patient_id FROM patients WHERE id = auth.uid())
  )
  WITH CHECK (
    patient_id IN (SELECT patient_id FROM patients WHERE id = auth.uid())
  );


-- Routines Policies
DROP POLICY IF EXISTS "Users can manage their routines" ON public.routines;
DROP POLICY IF EXISTS "Users can view their routines" ON public.routines;
DROP POLICY IF EXISTS "Users can insert their routines" ON public.routines;
DROP POLICY IF EXISTS "Users can update their routines" ON public.routines;
DROP POLICY IF EXISTS "Users can delete their routines" ON public.routines;

CREATE POLICY "Users can manage their routines"
  ON public.routines
  FOR ALL
  USING (
    patient_id IN (SELECT patient_id FROM patients WHERE id = auth.uid())
  )
  WITH CHECK (
    patient_id IN (SELECT patient_id FROM patients WHERE id = auth.uid())
  );

COMMIT;
