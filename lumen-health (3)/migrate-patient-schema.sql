-- ============================================
-- PATIENT PROFILE SCHEMA MIGRATION
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add new columns to existing patients table
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
  ADD COLUMN IF NOT EXISTS blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS allergies JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS chronic_diseases JSONB DEFAULT '[]'::jsonb;

-- Add comment to document the schema
COMMENT ON COLUMN public.patients.allergies IS 'Array of allergy strings, e.g. ["Peanuts", "Dust"] or custom values';
COMMENT ON COLUMN public.patients.chronic_diseases IS 'Array of chronic disease strings, e.g. ["Diabetes", "Hypertension"] or custom values';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_date_of_birth ON public.patients(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_patients_blood_group ON public.patients(blood_group);

-- Add GIN index for JSONB columns to enable efficient searching
CREATE INDEX IF NOT EXISTS idx_patients_allergies ON public.patients USING GIN (allergies);
CREATE INDEX IF NOT EXISTS idx_patients_chronic_diseases ON public.patients USING GIN (chronic_diseases);

-- ============================================
-- UPDATE TRIGGER FUNCTION
-- ============================================

-- Update the trigger function to handle new fields from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_patient()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.patients (
    id, 
    full_name, 
    phone, 
    address,
    date_of_birth,
    gender,
    blood_group,
    email,
    allergies,
    chronic_diseases
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'address',
    (NEW.raw_user_meta_data->>'date_of_birth')::date,
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'blood_group',
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'allergies')::jsonb, '[]'::jsonb),
    COALESCE((NEW.raw_user_meta_data->>'chronic_diseases')::jsonb, '[]'::jsonb)
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Patient already exists, skip
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Update Patient Medical Info
-- ============================================

-- Function to update patient medical information
CREATE OR REPLACE FUNCTION public.update_patient_medical_info(
  patient_id UUID,
  p_date_of_birth DATE DEFAULT NULL,
  p_gender TEXT DEFAULT NULL,
  p_blood_group TEXT DEFAULT NULL,
  p_allergies JSONB DEFAULT NULL,
  p_chronic_diseases JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.patients
  SET
    date_of_birth = COALESCE(p_date_of_birth, date_of_birth),
    gender = COALESCE(p_gender, gender),
    blood_group = COALESCE(p_blood_group, blood_group),
    allergies = COALESCE(p_allergies, allergies),
    chronic_diseases = COALESCE(p_chronic_diseases, chronic_diseases)
  WHERE id = patient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_patient_medical_info TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check the updated schema
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'patients' 
-- ORDER BY ordinal_position;

-- Check existing data
-- SELECT id, full_name, date_of_birth, gender, blood_group, allergies, chronic_diseases 
-- FROM public.patients 
-- LIMIT 5;
