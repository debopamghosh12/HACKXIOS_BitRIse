-- Lumen Health Database Schema
-- This schema matches your existing 'patients' table
-- Only run the parts you need (RLS policies and triggers)

-- ============================================
-- PATIENTS TABLE (Already exists in your DB)
-- ============================================
-- Your existing table structure:
-- CREATE TABLE IF NOT EXISTS public.patients (
--   id UUID PRIMARY KEY,
--   full_name TEXT,
--   phone TEXT,
--   address TEXT,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================
-- Enable RLS if not already enabled
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own patient record" ON public.patients;
DROP POLICY IF EXISTS "Users can update own patient record" ON public.patients;
DROP POLICY IF EXISTS "Users can insert own patient record" ON public.patients;

-- Allow users to read their own patient record
CREATE POLICY "Users can view own patient record"
  ON public.patients
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own patient record
CREATE POLICY "Users can update own patient record"
  ON public.patients
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to insert their own patient record
CREATE POLICY "Users can insert own patient record"
  ON public.patients
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_patient()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.patients (id, full_name, phone, address)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'address'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Patient already exists, skip
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create patient record on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_patient();

-- ============================================
-- INDEXES (Optional, for better performance)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_patients_full_name ON public.patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON public.patients(created_at);
