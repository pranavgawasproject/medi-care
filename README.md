# 🏥 Medi-Care

> A healthcare appointment & patient management platform — schedule consultations, manage doctors & patients, and streamline clinic operations.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E)](https://supabase.com)
[![Express](https://img.shields.io/badge/Express-Backend-000)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB)](https://react.dev)

## ✨ Features

- 👨‍⚕️ **Doctor Management** — profiles, specialties, availability
- 🧑‍🤝‍🧑 **Patient Records** — registration, history, contact info
- 📅 **Appointment Scheduling** — book, reschedule, and track visits
- ⏰ **Schedule Management** — weekly availability templates
- 🔐 **Auth & Sessions** — protected routes, JWT
- 🩺 **Supabase Tables** — `doctors`, `patients`, `appointments`, `schedules`
- 🎨 **Redesigned UI** — modern teal/emerald theme with three role-based views (Patient / Doctor / Admin)

## 🛠️ Tech Stack

**Frontend:** React 18, Vite 5, Tailwind CSS 4, Framer Motion, Recharts, lucide-react, date-fns
**Backend:** Node.js, Express, Supabase PostgreSQL

## 📁 Project Structure

```
.
├── backend/
│   ├── db/                 # Supabase client connection
│   └── server.js
└── frontend/               # React app (Vite)
    └── src/
        ├── components/     # Header, Footer, PatientView, DoctorView, AdminView, ui primitives
        ├── data/           # seed.js — fallback mock data (mirrors Supabase schema)
        ├── hooks/          # useToast
        ├── lib/            # utils (cn helper)
        ├── App.jsx         # shell with view switching + Supabase wiring
        ├── index.css       # Tailwind 4 theme tokens (teal/emerald, dark)
        └── supabaseClient.js
```

## 🚀 Getting Started

### 1. Backend (optional — the frontend works in demo mode without it)

```bash
# From the root directory
npm install
cp .env.example .env   # configure with your Supabase keys
npm run server
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # optional — only needed for live Supabase data
npm run dev
```

The app runs on http://localhost:5173.

### 3. Supabase setup (optional)

Run `supabase_schema.sql` in your Supabase SQL editor to create the tables and
seed data. Then set the following in `frontend/.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> **Demo mode:** If Supabase env vars are not configured, the frontend
> automatically falls back to bundled mock data (in `src/data/seed.js`) so the
> UI is always previewable. The header shows a "Demo mode" indicator, and
> switches to "Connected to Supabase" once valid data is returned.

## 🎨 The Redesign

The frontend UI was completely redesigned with a modern healthcare aesthetic:

- **Three role views** (Patient / Doctor / Admin) with an animated pill switcher
- **Teal/emerald palette** on a dark glassmorphism background
- **Patient view** — gradient hero, upcoming bookings, medical notes, full booking flow, consultations history
- **Doctor view** — profile header, stat cards, pending-request approvals, weekly schedule, consultation table
- **Admin view** — KPI cards, weekly bookings area chart, onboard-doctor form, practitioner roster, searchable appointment log
- **Fully responsive** (mobile-first) with toast notifications and Framer Motion transitions

The backend and Supabase schema are unchanged — the redesign is a drop-in
replacement for the frontend.

## 📜 License

[MIT](LICENSE) © 2026 Pranav Gawas
