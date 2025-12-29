-- ========================================================
-- ENABLE MULTI-PATIENT SUPPORT
-- ========================================================
-- 1. patients table: id -> owner_id (FK), patient_id (PK)
-- 2. owner_id can be DUPLICATE (One user -> Many patients)
-- 3. patient_id is UNIQUE (PK)

BEGIN;

-- 1. DROP EXISTING TABLES (Clean Slate as authorized)
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.routines CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;


-- 2. CREATE PATIENTS TABLE (Multi-Patient Supported)
CREATE TABLE public.patients (
    patient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- The unique profile ID
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- The User (Auth ID)
    
    -- Profile Data
    full_name TEXT NOT NULL,
    email TEXT, -- Can be null for family members (children)
    phone TEXT,
    date_of_birth DATE,
    gender TEXT,
    blood_group TEXT,
    address TEXT,
    allergies JSONB DEFAULT '[]'::jsonb,
    chronic_diseases JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by owner
CREATE INDEX idx_patients_owner_id ON public.patients(owner_id);


-- 3. CREATE SUBSCRIPTIONS TABLE
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    
    medicine_id INTEGER, -- Links to medicines table
    quantity_per_order INTEGER,
    dosage_per_day INTEGER,
    start_date DATE,
    next_refill_date DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_subscriptions_patient_id ON public.subscriptions(patient_id);


-- 4. CREATE PAYMENTS TABLE
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    
    amount NUMERIC(10,2),
    transaction_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_payments_patient_id ON public.payments(patient_id);


-- 5. CREATE ROUTINES TABLE
CREATE TABLE public.routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    
    medicine_name TEXT,
    reminder_time TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_routines_patient_id ON public.routines(patient_id);


-- 6. ENABLE RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;


-- 7. RLS POLICIES

-- Patients: Owner can do everything with their profiles
CREATE POLICY "Users can manage their own patient profiles"
  ON public.patients FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Subscriptions: Access via patient ownership
CREATE POLICY "Users can manage subscriptions for their patients"
  ON public.subscriptions FOR ALL
  USING (patient_id IN (SELECT patient_id FROM patients WHERE owner_id = auth.uid()))
  WITH CHECK (patient_id IN (SELECT patient_id FROM patients WHERE owner_id = auth.uid()));

-- Payments: Access via patient ownership
CREATE POLICY "Users can manage payments for their patients"
  ON public.payments FOR ALL
  USING (patient_id IN (SELECT patient_id FROM patients WHERE owner_id = auth.uid()))
  WITH CHECK (patient_id IN (SELECT patient_id FROM patients WHERE owner_id = auth.uid()));

-- Routines: Access via patient ownership
CREATE POLICY "Users can manage routines for their patients"
  ON public.routines FOR ALL
  USING (patient_id IN (SELECT patient_id FROM patients WHERE owner_id = auth.uid()))
  WITH CHECK (patient_id IN (SELECT patient_id FROM patients WHERE owner_id = auth.uid()));

COMMIT;
