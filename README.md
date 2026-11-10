# ⚔️ Aegis Update — Dota 2 Changelog & Patch Tracker

[![Live Demo](https://img.shields.io/badge/Demo-dota2--tracker--chi.vercel.app-red?style=for-the-badge&logo=vercel)](https://dota2-tracker-chi.vercel.app)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-emerald?style=for-the-badge&logo=supabase)](https://supabase.com/dashboard)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

A modern, real-time web application built to monitor, track, and archive official Valve Dota 2 gameplay updates, patch notes, and balance changelogs.

---

## 🌐 Quick Access Links

| Service | Link | Purpose |
| :--- | :--- | :--- |
| **Live Web App** | 🔗 [**dota2-tracker-chi.vercel.app**](https://dota2-tracker-chi.vercel.app) | View live patch changelogs and sync updates |
| **Vercel Dashboard** | 🔗 [**vercel.com/login**](https://vercel.com/login) | Manage deployments, domains, and environment variables |
| **Supabase Dashboard** | 🔗 [**supabase.com/dashboard**](https://supabase.com/dashboard) | View PostgreSQL tables, SQL editor, and database records |
| **GitHub Repository** | 🔗 [**github.com/nazrisyahmi97/dota2-tracker**](https://github.com/nazrisyahmi97/dota2-tracker) | Source code and commit history |

---

## 🚀 Key Features

- **Live Valve Feed**: Fetches real-time official patch data directly from Valve's Dota 2 network feed.
- **Supabase PostgreSQL Integration**: Persists historical patch notes and archives changelogs into a cloud database.
- **1-Click Sync**: Interactive dashboard control to pull newly released Dota 2 balance updates into Supabase.
- **100% Free Stack**: Runs entirely on permanent free tiers (Vercel Hobby, Supabase Free, GitHub Free).
- **Modern Gaming UI**: Built with Next.js 16, Tailwind CSS, and Lucide icons.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React 19 + TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Deployment**: [Vercel](https://vercel.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Local Development

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/nazrisyahmi97/dota2-tracker.git
cd dota2-tracker
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your credentials from [Supabase Dashboard > Project Settings > API](https://supabase.com/dashboard):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Initialize Database Table
In your Supabase project, navigate to the **SQL Editor** and execute the queries in [`supabase/schema.sql`](./supabase/schema.sql).

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ License & Trademarks
Dota 2 and all game assets are registered trademarks of Valve Corporation. This project is a community-built open-source tracker.
