# MediCare

[![Live demo](https://img.shields.io/badge/Live%20demo-medicare--pranav.vercel.app-2f6655?style=for-the-badge&logo=vercel)](https://medicare-pranav.vercel.app/)
[![Supabase](https://img.shields.io/badge/Supabase-data%20layer-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/license-MIT-2f6655.svg?style=for-the-badge)](LICENSE)

> A focused healthcare operations workspace for appointments, prescriptions, patient records, and clinic administration.

**[Open the live demo →](https://medicare-pranav.vercel.app/)**

## Overview

MediCare gives patients, practitioners, and clinic administrators a shared place to manage the patient journey. The current application is a **Next.js 15 App Router** project in `frontend-next/`, backed by Supabase and organized around server-rendered data, role-aware client views, and API routes inside the Next.js app.

If Supabase is not configured, the app runs in demo mode with bundled seed data so the interface can still be explored locally. Live authentication, persistence, realtime updates, and mutations require a Supabase project.

## Screenshots / Demo

![MediCare landing page](docs/screenshot-home.jpg)

The landing experience introduces the three workflows. Try the deployed build at **[medicare-pranav.vercel.app](https://medicare-pranav.vercel.app/)**.

## Features

- **Patient view** — book and manage appointments, review prescriptions, and access medical history.
- **Doctor view** — review patient information, manage consultation requests, and maintain availability.
- **Admin view** — oversee practitioners, appointments, user access, and clinic-level activity.
- **Appointment operations** — scheduling, status changes, reminders, and role-appropriate actions.
- **Clinical records** — structured prescriptions, lab reports, and medical records.
- **Supabase integration** — server/browser clients, normalized records, and realtime updates for supported workflows.
- **Public healthcare utilities** — the home experience, ESI triage, safety checker, and FAQ remain browseable in demo mode.

## Tech stack

- **Framework:** Next.js 15.5 (App Router and React Server Components)
- **Language:** TypeScript and React 19
- **Styling:** Tailwind CSS 4 with custom design tokens
- **Data and auth:** Supabase via `@supabase/ssr` and `@supabase/supabase-js`
- **UI:** Framer Motion, Recharts, Lucide React, React Hook Form, and Zod
- **Architecture:** Server-rendered homepage, client role views, and API routes under `frontend-next/app/api/`
- **Deployment:** Vercel

## Setup

The active application is in `frontend-next/`. Clone the repository, change into that directory, install dependencies, copy the root env example to `.env.local`, and start the Next.js development script. Open http://localhost:3000 when ready.

For production, use the included lint, build, and start scripts from `frontend-next/`.

## Environment variables

Copy the root [`.env.example`](.env.example) to `frontend-next/.env.local`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | For live data | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For live data | Supabase anonymous/public key |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical origin used by sitemap, robots, and Open Graph metadata |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional | Google Analytics 4 measurement ID |

Without the two Supabase variables, the app uses fallback seed data and skips live persistence/realtime behavior. Do not expose a service-role key to the Next.js app.

## Deploy

Deploy `frontend-next/` to Vercel and set it as the project root directory. Add the Supabase variables and canonical site URL in the Vercel environment settings, then use the standard project build script; Vercel manages the start process for you.

## Contributing

Please open an issue for substantial product or schema changes first. Keep role and data-access changes scoped, avoid committing secrets, and run the linter plus production build from `frontend-next/` before opening a pull request.

## License

MIT. See [LICENSE](LICENSE).
