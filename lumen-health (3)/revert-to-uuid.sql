-- ============================================
-- REVERT DATABASE TO UUID STANDARD
-- ============================================
-- User authorized dropping existing data to ensure a clean schema.
-- Goal: All tables use UUID foreign keys to patients(id).

BEGIN;

-- 1. CLEAN PATIENTS TABLE
-- (We keep patients data but clean columns)
ALTER TABLE public.patients DROP COLUMN IF EXISTS patient_id CASCADE;

-- 2. TRUNCATE CHILD TABLES
-- (We must remove existing rows to add a NOT NULL foreign key column)
TRUNCATE TABLE public.subscriptions, public.payments, public.routines CASCADE;

-- 3. CLEAN SUBSCRIPTIONS TABLE
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS patient_id CASCADE;
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS old_patient_id CASCADE;

-- Add clean UUID patient_id
ALTER TABLE public.subscriptions 
  ADD COLUMN patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE;

-- Index
CREATE INDEX IF NOT EXISTS idx_subscriptions_patient_id ON public.subscriptions(patient_id);


-- 3. CLEAN PAYMENTS TABLE
ALTER TABLE public.payments DROP COLUMN IF EXISTS patient_id CASCADE;
ALTER TABLE public.payments DROP COLUMN IF EXISTS old_patient_id CASCADE;

-- Add clean UUID patient_id
ALTER TABLE public.payments 
  ADD COLUMN patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE;

-- Index
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON public.payments(patient_id);


-- 4. CLEAN ROUTINES TABLE
ALTER TABLE public.routines DROP COLUMN IF EXISTS patient_id CASCADE;
ALTER TABLE public.routines DROP COLUMN IF EXISTS old_patient_id CASCADE;

-- Add clean UUID patient_id
ALTER TABLE public.routines 
  ADD COLUMN patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE;

-- Index
CREATE INDEX IF NOT EXISTS idx_routines_patient_id ON public.routines(patient_id);


-- 5. UPDATE RLS POLICIES
-- Enable RLS on all
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- Patients Policies
DROP POLICY IF EXISTS "Users can view their patients" ON public.patients;
DROP POLICY IF EXISTS "Users can update their patients" ON public.patients;
DROP POLICY IF EXISTS "Users can insert their patients" ON public.patients;
DROP POLICY IF EXISTS "Users can delete their patients" ON public.patients;

-- Allow access if user_id matches auth.uid OR if id matches auth.uid (legacy self-patient)
CREATE POLICY "Users can manage their patients"
  ON public.patients
  USING (auth.uid() = user_id OR auth.uid() = id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = id);


-- Subscriptions Policies
DROP POLICY IF EXISTS "Users can view their subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their subscriptions" ON public.subscriptions;

CREATE POLICY "Users can manage their subscriptions"
  ON public.subscriptions
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = subscriptions.patient_id
      AND (patients.user_id = auth.uid() OR patients.id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = subscriptions.patient_id
      AND (patients.user_id = auth.uid() OR patients.id = auth.uid())
    )
  );


-- Payments Policies
DROP POLICY IF EXISTS "Users can view their payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert their payments" ON public.payments;

CREATE POLICY "Users can manage their payments"
  ON public.payments
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = payments.patient_id
      AND (patients.user_id = auth.uid() OR patients.id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = payments.patient_id
      AND (patients.user_id = auth.uid() OR patients.id = auth.uid())
    )
  );


-- Routines Policies
DROP POLICY IF EXISTS "Users can view their routines" ON public.routines;
DROP POLICY IF EXISTS "Users can insert their routines" ON public.routines;
DROP POLICY IF EXISTS "Users can update their routines" ON public.routines;
DROP POLICY IF EXISTS "Users can delete their routines" ON public.routines;

CREATE POLICY "Users can manage their routines"
  ON public.routines
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = routines.patient_id
      AND (patients.user_id = auth.uid() OR patients.id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = routines.patient_id
      AND (patients.user_id = auth.uid() OR patients.id = auth.uid())
    )
  );

COMMIT;
