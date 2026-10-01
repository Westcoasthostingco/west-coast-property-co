# West Coast Hosting Co

Short-term rental management website: public marketing and listings with direct booking, legal pages, an owner portal, an admin back office and a cleaner portal.

Stack: Next.js (App Router), TypeScript, Tailwind v4, Clerk (auth and roles), Supabase (Postgres, RLS, Storage), Stripe Checkout and Connect (payments and owner payouts), Resend (email). Live-conditions widgets (NOAA tides, Open-Meteo snow) use keyless public APIs.

## What ships today
- Public site: home, `/properties` and `/properties/[slug]` with gallery, availability calendar, a booking panel that quotes nights + cleaning + lodging tax and hands off to Stripe Checkout (`src/lib/checkout.ts`), tide or snow widget per home (`src/components/widgets`), `/services`, `/about`, `/contact`.
- Legal: `/legal/terms`, `/legal/privacy`, `/legal/policies` (content in `src/lib/legal.ts`).
- SEO: `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`, `llms.txt`, schema.org JSON-LD (`src/lib/seo.ts`, `src/components/seo/JsonLd.tsx`).
- Portals: `/owner` (trends, statements, invoices, payout setup), `/admin` (calendar, bookings, cleaning board, properties, owners, payouts, accounting, reviews, integrations), `/clean` (today's jobs, checklist, photos, issue reports).

## Develop
```bash
npm install
npm run dev
```
Without env vars the site runs on sample data (`src/lib/mock.ts`). To use real services, copy `.env.example` to `.env.local` and fill in Clerk and Supabase keys. Clerk is required for `/owner` and `/admin`.

## Roles
Roles live in Clerk user **publicMetadata**: `{"role": "admin"}`, `"owner"` or `"cleaner"`. Admins can open every area; owners see only their own properties, bookings and payouts (enforced by Supabase row level security through the Clerk session token). An owner's Clerk user id goes in `owners.clerk_user_id`.

## Docs
- `docs/ARCHITECTURE.md`: product architecture, routes, data model, integrations
- `docs/SETUP-CHECKLIST.md`: accounts to create and build status
- `supabase/schema.sql`: database schema and row level security
- `.env.example`: environment variables

## Payments (Stripe Connect)
Guests pay the platform through Stripe Checkout (`/api/checkout`). Owners onboard as Connect Express accounts from the owner portal (`/api/stripe/connect/onboard`). A daily cron (`/api/cron/payouts`, see `vercel.json`) transfers each owner's share the day after check-in; the management fee stays on the platform. Webhooks at `/api/webhooks/stripe` confirm bookings, track onboarding and reverse transfers on refunds.

Stripe dashboard setup: enable Connect with Express accounts, enable Stripe Tax, and add a webhook endpoint for the four events listed in `docs/SETUP-CHECKLIST.md`.
