# Security

## Reporting

Email the maintainer listed on the GitHub profile. Do not file public issues for vulnerabilities that expose PHI.

## Application controls

- Authenticated routes fail closed when Supabase env vars are missing (configuration error UI, never mock charts).
- `requireRole` / middleware isolate patient, doctor, and admin workspaces.
- `supabase_schema.sql` enables row-level security on clinical tables.
- Clinical writes emit `audit_logs` rows.
- Security headers are set in `frontend-next/next.config.ts`.

## Secrets

Never commit `.env.local`. Never put `SUPABASE_SERVICE_ROLE_KEY` in the Next.js app or in `NEXT_PUBLIC_*` variables.

## HIPAA

MediCare is HIPAA-aware, not a BAA. Covered entities need BAAs with their host (e.g. Vercel) and database (Supabase) plus their own policies.
