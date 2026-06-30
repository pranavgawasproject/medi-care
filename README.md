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

## 🛠️ Tech Stack

**Frontend:** React, Vite, ESLint
**Backend:** Node.js, Express, Supabase PostgreSQL


## 📁 Project Structure

```
.
├── backend/
│   ├── db/                 # Supabase client connection
│   └── server.js
└── frontend/               # React app (Vite)
    └── src/
```

## 🚀 Getting Started

```bash
# Backend (from root directory)
npm install
cp .env.example .env  # configure with your Supabase keys
npm run server

# Frontend
cd frontend
npm install
npm run dev
```

## 📜 License

[MIT](LICENSE) © 2026 Pranav Gawas
