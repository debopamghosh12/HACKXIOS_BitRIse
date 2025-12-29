# Supabase Setup Guide for Lumen Health

This guide will walk you through setting up Supabase authentication for your Lumen Health application.

## 📋 Prerequisites

- A Supabase account (sign up at [https://supabase.com](https://supabase.com))
- Node.js and npm installed
- The Supabase client library (already installed)

## 🚀 Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: `lumen-health` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select the closest region to your users
4. Click **"Create new project"** and wait for it to initialize (~2 minutes)

### 2. Get Your API Credentials

1. In your Supabase project dashboard, click on the **Settings** icon (⚙️) in the left sidebar
2. Navigate to **API** section
3. You'll find two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### 3. Configure Environment Variables

1. Create a `.env.local` file in your project root (it's already in `.gitignore`)
2. Copy the template from `.env.example`:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Replace the placeholder values with your actual credentials from Step 2

### 4. Set Up Database Tables

Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New Query):

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone_number, address)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'address'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

### 5. Configure Email Authentication (Optional but Recommended)

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable **Email** provider (should be enabled by default)
3. Configure email templates:
   - Go to **Authentication** → **Email Templates**
   - Customize the confirmation email, reset password email, etc.

### 6. Configure Site URL (Important!)

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your development URL: `http://localhost:5173`
3. Add **Redirect URLs**:
   - `http://localhost:5173/**`
   - Add your production URL when you deploy

### 7. Test Your Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open your app in the browser
3. Try signing up with a test email
4. Check your email for the confirmation link
5. Verify the user appears in Supabase Dashboard → Authentication → Users

## 🔧 Troubleshooting

### "Invalid API credentials"
- Double-check your `.env.local` file has the correct URL and anon key
- Make sure you restarted the dev server after creating `.env.local`

### "User already registered"
- Check Supabase Dashboard → Authentication → Users
- Delete the test user or use a different email

### Email not received
- Check your spam folder
- Verify email provider is enabled in Supabase
- For development, you can disable email confirmation:
  - Go to Authentication → Settings
  - Disable "Enable email confirmations"

### Database errors
- Make sure you ran all the SQL commands in Step 4
- Check the Supabase logs: Dashboard → Logs

## 📚 Additional Features

### Password Reset
The auth service includes a `resetPassword` function. To implement it:

1. Create a password reset page
2. Add a "Forgot Password?" link to your auth form
3. Create a reset password confirmation page

### Social Login (Google, GitHub, etc.)
1. Go to Authentication → Providers
2. Enable the provider you want (e.g., Google)
3. Follow the setup instructions for OAuth credentials
4. Update your auth service to include social login buttons

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use Row Level Security (RLS)** - Already configured in the SQL above
3. **Validate on the backend** - Always validate user input
4. **Use HTTPS in production** - Supabase requires it
5. **Rotate keys if exposed** - You can regenerate keys in Supabase settings

## 📖 Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## ✅ Checklist

- [ ] Created Supabase project
- [ ] Got API credentials
- [ ] Created `.env.local` with credentials
- [ ] Ran database setup SQL
- [ ] Configured site URL
- [ ] Tested sign up
- [ ] Tested sign in
- [ ] Verified user in Supabase dashboard

---

**Need help?** Check the Supabase Discord or documentation at [supabase.com/docs](https://supabase.com/docs)
