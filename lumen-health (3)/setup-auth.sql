-- ============================================
-- QUICK SETUP FOR EXISTING PATIENTS TABLE
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own patient record" ON public.patients;
DROP POLICY IF EXISTS "Users can update own patient record" ON public.patients;
DROP POLICY IF EXISTS "Users can insert own patient record" ON public.patients;

-- 3. Create RLS Policies
CREATE POLICY "Users can view own patient record"
  ON public.patients
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own patient record"
  ON public.patients
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own patient record"
  ON public.patients
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. Create function to auto-create patient record on signup
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
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_patient();

-- Done! Your authentication is now set up.
