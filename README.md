# ⚔️ Aegis Update — Dota 2 Changelog & Patch Tracker

A modern web application built to monitor, track, and display official Dota 2 gameplay updates, patch notes, and balance changelogs in real time.

---

## 🚀 Features

- **Live Valve Feed**: Automatically fetches and parses official patch releases from Valve's official datafeed.
- **Supabase Integration**: Stores historical patch archives and changelog data in PostgreSQL.
- **Modern Gaming UI**: Built with Next.js 16 (App Router), Tailwind CSS, and Lucide icons.
- **Ready for AI Summarization**: Extensible with Google Gemini to auto-summarize complex balance patches into key takeaways and hero buff/nerf lists.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React 19 + TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd dota2-tracker
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials from your [Supabase Dashboard](https://supabase.com/dashboard) (`Project Settings` > `API`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Initialize Database
In your Supabase project dashboard, open the **SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ License
Dota 2 and all related assets are registered trademarks of Valve Corporation.
