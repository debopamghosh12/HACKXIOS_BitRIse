-- ============================================
-- ADD PATIENT_ID TO PATIENTS TABLE
-- One user can have multiple patients (family members)
-- ============================================

-- 1. Add patient_id column to patients table (auto-increment)
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS patient_id SERIAL UNIQUE;

-- Create index on patient_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);

-- 2. Add user_id column to link patients to users (if not exists)
-- This allows one user to manage multiple patients
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);

-- 3. Update subscriptions table to use patient_id instead of user_id
-- First, check if column exists
DO $$ 
BEGIN
    -- Add patient_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'patient_id'
    ) THEN
        ALTER TABLE public.subscriptions
        ADD COLUMN patient_id INTEGER REFERENCES public.patients(patient_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Drop old foreign key if it exists and add new one
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_patient_id_fkey;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;

-- 4. Update payments table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'patient_id'
    ) THEN
        ALTER TABLE public.payments
        ADD COLUMN patient_id INTEGER REFERENCES public.patients(patient_id) ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_patient_id_fkey;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;

-- 5. Update routines table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'routines' AND column_name = 'patient_id'
    ) THEN
        ALTER TABLE public.routines
        ADD COLUMN patient_id INTEGER REFERENCES public.patients(patient_id) ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE public.routines
  DROP CONSTRAINT IF EXISTS routines_patient_id_fkey;

ALTER TABLE public.routines
  ADD CONSTRAINT routines_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_patient_id ON public.subscriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON public.payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_routines_patient_id ON public.routines(patient_id);

-- 7. Update RLS policies for patients table
DROP POLICY IF EXISTS "Users can view own patients" ON public.patients;
DROP POLICY IF EXISTS "Users can create own patients" ON public.patients;
DROP POLICY IF EXISTS "Users can update own patients" ON public.patients;
DROP POLICY IF EXISTS "Users can delete own patients" ON public.patients;

CREATE POLICY "Users can view own patients" 
  ON public.patients FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own patients" 
  ON public.patients FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patients" 
  ON public.patients FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own patients" 
  ON public.patients FOR DELETE 
  USING (auth.uid() = user_id);

-- 8. Update RLS policies for subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can create own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own subscriptions" 
  ON public.subscriptions FOR SELECT 
  USING (patient_id IN (SELECT patient_id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can create own subscriptions" 
  ON public.subscriptions FOR INSERT 
  WITH CHECK (patient_id IN (SELECT patient_id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own subscriptions" 
  ON public.subscriptions FOR UPDATE 
  USING (patient_id IN (SELECT patient_id FROM patients WHERE user_id = auth.uid()));

-- 9. Update RLS policies for payments
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create own payments" ON public.payments;

CREATE POLICY "Users can view own payments" 
  ON public.payments FOR SELECT 
  USING (patient_id IN (SELECT patient_id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can create own payments" 
  ON public.payments FOR INSERT 
  WITH CHECK (patient_id IN (SELECT patient_id FROM patients WHERE user_id = auth.uid()));

-- 10. Update RLS policies for routines
DROP POLICY IF EXISTS "Users can view own routines" ON public.routines;
DROP POLICY IF EXISTS "Users can create own routines" ON public.routines;
DROP POLICY IF EXISTS "Users can update own routines" ON public.routines;
DROP POLICY IF EXISTS "Users can delete own routines" ON public.routines;

CREATE POLICY "Users can view own routines" 
  ON public.routines FOR SELECT 
  USING (patient_id IN (SELECT patient_id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can create own routines" 
  ON public.routines FOR INSERT 
  WITH CHECK (patient_id IN (SELECT patient_id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own routines" 
  ON public.routines FOR UPDATE 
  USING (patient_id IN (SELECT patient_id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own routines" 
  ON public.routines FOR DELETE 
  USING (patient_id IN (SELECT patient_id FROM patients WHERE user_id = auth.uid()));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check patients table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'patients' 
-- ORDER BY ordinal_position;

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
-- WHERE tc.constraint_type = 'FOREIGN KEY' 
--   AND tc.table_name IN ('patients', 'subscriptions', 'payments', 'routines');

-- Test query: Get all patients for a user
-- SELECT patient_id, full_name, date_of_birth, gender 
-- FROM patients 
-- WHERE user_id = 'your-user-id-here';

-- Test query: Get all subscriptions for a patient
-- SELECT s.*, m.brand_name 
-- FROM subscriptions s
-- JOIN medicines m ON s.medicine_id = m.id
-- WHERE s.patient_id = 1;
