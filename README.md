# 🏥 Medi-Care

> A healthcare appointment & patient management platform — schedule consultations, manage doctors & patients, and streamline clinic operations.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-Backend-000)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB)](https://react.dev)

## ✨ Features

- 👨‍⚕️ **Doctor Management** — profiles, specialties, availability
- 🧑‍🤝‍🧑 **Patient Records** — registration, history, contact info
- 📅 **Appointment Scheduling** — book, reschedule, and track visits
- ⏰ **Schedule Management** — weekly availability templates
- 🔐 **Auth & Sessions** — protected routes, JWT
- 🩺 **MongoDB Models** — `Doctor`, `Patient`, `Appointment`, `Schedules`

## 🛠️ Tech Stack

**Frontend:** React, Vite, ESLint
**Backend:** Node.js, Express, Mongoose, MongoDB

## 📁 Project Structure

```
.
├── backend/
│   ├── db/                 # MongoDB connection
│   ├── models/             # doctor / patient / appointment / schedules
│   └── server.js
└── frontend/               # React app (Vite)
    └── src/
```

## 🚀 Getting Started

```bash
# Backend
cd backend
npm install
echo "MONGO_URI=..." > .env
npm start

# Frontend
cd frontend
npm install
npm run dev
```

## 📜 License

[MIT](LICENSE) © 2026 Pranav Gawas
