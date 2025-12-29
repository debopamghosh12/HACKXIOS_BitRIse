<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Lumen Health - Healthcare Management Platform

A modern healthcare management platform with prescription tracking, appointment scheduling, and secure authentication.

## ✨ Features

- 🔐 **Secure Authentication** - Powered by Supabase
- 💊 **Prescription Management** - Track and manage medications
- 📅 **Appointment Scheduling** - Book and manage healthcare appointments
- 📊 **Health Dashboard** - Visualize your health data
- 🎨 **Modern UI** - Beautiful, responsive design with Framer Motion animations

## 🚀 Run Locally

**Prerequisites:** Node.js 16+ and npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase Authentication

Follow the detailed setup guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**Quick Setup:**
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local`
3. Add your Supabase credentials to `.env.local`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the SQL from `database-schema.sql` in your Supabase SQL Editor

### 3. Run the Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Charts:** Recharts
- **Authentication:** Supabase Auth
- **Database:** Supabase (PostgreSQL)

## 📁 Project Structure

```
lumen-health/
├── components/        # Reusable UI components
├── pages/            # Page components
├── services/         # API and authentication services
│   ├── auth.ts       # Supabase authentication
│   ├── supabase.ts   # Supabase client config
│   └── api.ts        # API utilities
├── types.ts          # TypeScript type definitions
└── App.tsx           # Main application component
```

## 🔒 Security

- Row Level Security (RLS) enabled on all database tables
- Secure authentication with Supabase
- Environment variables for sensitive data
- HTTPS required in production

## 📚 Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Complete authentication setup
- [Database Schema](./database-schema.sql) - SQL schema for Supabase

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

View your app in AI Studio: https://ai.studio/apps/drive/1yFv38KV8LDzaK8LyUUjiqn-v97hwirKy
