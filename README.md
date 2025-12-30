<div align="center">
  <img src="public/logo.png" alt="Sanvix Logo" width="120" />
  <h1>Sanvix Health</h1>
  
  <p>
    <strong>Healthcare Reimagined. Your Health, Orchestrated.</strong>
  </p>
  
  <p>
    <a href="https://react.dev/">
      <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
    </a>
    <a href="https://supabase.com/">
      <img src="https://img.shields.io/badge/Supabase-Auth-green?style=for-the-badge&logo=supabase" alt="Supabase" />
    </a>
    <a href="https://lottiefiles.com/">
      <img src="https://img.shields.io/badge/Lottie-Animations-orange?style=for-the-badge&logo=lottiefiles" alt="Lottie" />
    </a>
  </p>

  <p>
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-deployment">Deployment</a>
  </p>
</div>

<br />

## 🌟 Overview

**Sanvix** is a next-generation healthcare management platform designed to unify prescriptions, doctor communication, and vital tracking into one seamless experience. Built with a focus on calmness and trust, Sanvix uses a premium, clean aesthetic to make managing health feel effortless.

> **Note**: This project uses **React 19 RC** and **Framer Motion** for state-of-the-art interactivity.

---

## ✨ Features

### 🎨 Visual Excellence
- **Premium Landing Page**: A fully responsive, SaaS-grade landing page with scroll-driven animations (reverted for stability, parallax ready).
- **Lottie Animations**: High-quality, scalable vector animations (e.g., the "Why Sanvix" pill flow) powered by `@dotlottie/react-player`.
- **Glassmorphism**: Modern UI components with frosted glass effects.

### 🔐 Security & Core
- **Multi-Patient Support**: Manage multiple family members under a single auth account.
- **Supabase Auth**: Enterprise-grade security handling sign-ups, logins, and sessions.
- **HIPAA Compliant Design**: structured to support secure data handling (Row Level Security enabled).

### 🛠️ Developer Experience
- **Vite Powered**: Lightning-fast HMR and build times.
- **TypeScript**: Fully typed codebase for robustness.
- **Tailwind CSS**: Utility-first styling with a custom design system token set.

---

## 🏗 Tech Stack

| Category | Technology | Description |
|----------|------------|-------------|
| **Frontend** | React 19, TypeScript | The latest in component-based UI |
| **Styling** | Tailwind CSS, PostCSS | Utility-first, responsive design |
| **Motion** | Framer Motion, Lottie | Complex layout transitions and vector animations |
| **Backend** | Supabase | Postgres Database, Auth, and Edge Functions |
| **Icons** | Lucide React | Clean, consistent SVG icons |
| **Build** | Vite | Next-gen frontend tooling |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sanvix-health.git
   cd sanvix-health
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```
   *(Note: Use `--legacy-peer-deps` due to React 19 RC peer dependency conflicts)*

3. **Set up Environment**
   Copy `.env.example` to `.env.local` and add your Supabase keys:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

---

## 📦 Deployment

This project is configured for **Vercel**.

1. **Push to GitHub**: Ensure the `.npmrc` file is included to handle React 19 dependencies.
2. **Import in Vercel**: Select the repository.
3. **Environment Variables**: Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel dashboard.
4. **Deploy**: Vercel will automatically detect Vite and build the project.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ by the Sanvix Team</sub>
</div>
