# Contributing

1. Work in `frontend-next/` — that is the application.
2. Do not reintroduce a Vite `frontend/` app, Express `backend/`, or mock `seed` data.
3. Public pages must render without Supabase. Authenticated pages must show `ConfigError`, not fake patients.
4. Run `npm test`, `npm run lint`, and `npm run build` from `frontend-next/` before opening a PR.
5. Keep clinical engines (`lib/utils/triage.ts`, `lib/utils/medication-safety.ts`, `lib/utils/specialty.ts`) covered by unit tests.
6. Care Compass, ESI, and the safety checker are decision support — keep the emergency disclaimer visible.
