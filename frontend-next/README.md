# MediCare — Next.js 15 (App Router) Migration

Migration of the original Vite + React 18 MediCare frontend
(`/home/z/my-project/repos/medi-care/frontend/`) to **Next.js 15** with the
App Router, TypeScript, and Tailwind CSS v4. The legacy `/frontend` directory
is intentionally left untouched for side-by-side comparison.

## Stack

- **Framework**: Next.js 15.5.x (App Router, RSC)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) with the original
  `@theme inline { ... }` tokens ported verbatim from `src/index.css`
  (oklch color palette, `@custom-variant dark`, `chart-tab`, `.ecg-line`,
  `.bg-grid` and friends).
- **Fonts**: `next/font/google` — Space Grotesk + Inter + IBM Plex Mono.
- **Database**: Supabase via `@supabase/ssr` (server + browser clients)
- **Charts**: recharts (AdminView only)
- **Animation**: framer-motion
- **Icons**: lucide-react

## Routes created

| Route              | Type            | Purpose                              |
| ------------------ | --------------- | ------------------------------------ |
| `/`                | Server Component | Home — SSR data fetch + role switcher |
| `/robots.txt`      | Metadata route  | `app/robots.ts`                       |
| `/sitemap.xml`     | Metadata route  | `app/sitemap.ts`                      |
| `/vite.svg`        | Static          | Brand logo / favicon                  |
| `/google71c3127efde51dc2.html` | Static | Google Search Console verification |

## Architecture

```
app/
  layout.tsx     ← root layout, fonts, metadata, JSON-LD
  page.tsx       ← SERVER COMPONENT — fetches initial doctors / patients /
                  appointments / schedules via lib/supabase/server.ts.
                  Falls back to lib/data/seed.ts when env vars are missing.
  sitemap.ts     ← Next.js metadata route
  robots.ts      ← Next.js metadata route
  globals.css    ← Tailwind v4 + ported @theme inline tokens

components/
  AppClient.tsx  ← Client component — role switcher, optimistic mutations,
                  Supabase realtime subscriptions on top of SSR snapshot.
  PatientView.tsx / DoctorView.tsx / AdminView.tsx  ← view components
  Header.tsx / Footer.tsx / ThemeToggle.tsx
  ErrorBoundary.tsx  ← class component (must be client)
  ui.tsx             ← shadcn-style primitives (Button/Card/Table/...)

hooks/
  useTheme.tsx   ← client theme provider, persists to localStorage
  useToast.tsx   ← client toast provider

lib/
  types.ts                 ← Doctor / Patient / Appointment / Schedule types
  utils.ts                 ← cn() helper (clsx + tailwind-merge)
  data/seed.ts             ← FALLBACK_* seed data, colorForName, SPECIALTIES
  supabase/
    server.ts              ← createClient() async — uses cookies()
    client.ts              ← createClient() sync — uses createBrowserClient
    normalize.ts           ← row → typed record mappers

lib/utils/                  ← Vestigial utility modules ported verbatim
  medicationUtils.ts         from the Vite source. Currently ESLint-ignored
  triagePriorityEngine.ts    (see eslint.config.mjs). Not yet consumed by
  medicationSafety.ts        the UI.
  insuranceBillingUtils.ts
```

## Environment

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

When these are not set, the app runs in **DEMO mode**: the Server Component
hands the `FALLBACK_*` seed data straight to the client component, and the
client component skips Supabase realtime subscriptions / mutations. The UI
remains fully functional for browsing.

## Scripts

```bash
npm run dev      # start dev server (port 3000)
npm run build    # production build
npm run lint     # eslint
```

## SSR verification

When `.env.local` is absent, `npm run build` produces a static prerender of
`/` whose HTML contains the seed doctor roster (`Dr. Sarah Jenkins`,
`Dr. David Miller`, `Dr. Elena Rostova`, `Dr. Marcus Hale`,
`Dr. Priya Nair`) and their specializations — proof that the page is being
server-rendered with the fallback dataset rather than waiting for client-side
data fetching. Verify with:

```bash
grep -o 'Dr\. [A-Z][a-z]* [A-Z][a-z]*' .next/server/app/index.html | sort -u
```

## Known issues / TODOs

- The four vestigial utility modules in `lib/utils/` are ESLint-ignored and
  contain a syntax bug fix (the original `medicationUtils.js` had a broken
  `const edA, medB] = rule.pair;` destructure that has been corrected to
  `const [medA, medB] = rule.pair;`). They should be either properly typed
  or removed in a follow-up — they aren't imported by any UI component.
- Supabase Realtime is wired up via a single channel that refreshes the
  `doctors` and `appointments` tables on any change. End-to-end testing
  against a live Supabase project is left to the user.
- `metadataBase` is hard-coded to `https://medicare-pranav.vercel.app/`
  (mirrors the canonical in the original Vite `index.html`).
