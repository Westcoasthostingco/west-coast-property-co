# West Coast Hosting Co

Short-term rental management website: public marketing and a showcase of the homes (guests book and pay on Airbnb or Vrbo), legal pages, an owner portal, an admin back office and a cleaner portal.

Stack: Next.js (App Router), TypeScript, Tailwind v4, Clerk (auth and roles), Supabase (Postgres, RLS, Storage), Resend (email). There is no payment provider: bookings and payments happen on Airbnb or Vrbo, and the platforms pay homeowners. Live-conditions widgets (NOAA tides, Open-Meteo snow) use keyless public APIs.

## What ships today
- Public site: home, `/properties` and `/properties/[slug]` with gallery, availability calendar, links to each home's Airbnb and Vrbo listings, tide or snow widget per home (`src/components/widgets`), `/services`, `/about`, `/contact`.
- Legal: `/legal/terms`, `/legal/privacy`, `/legal/policies` (content in `src/lib/legal.ts`).
- SEO: `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`, `llms.txt`, schema.org JSON-LD (`src/lib/seo.ts`, `src/components/seo/JsonLd.tsx`).
- Portals: `/owner` (trends, statements built from stays, invoices), `/admin` (calendar, bookings incl. manual entry and iCal import, cleaning board, properties, owners, accounting, reviews, integrations), `/clean` (today's jobs, checklist, photos, issue reports).

## Develop
```bash
npm install
npm run dev
```
Without env vars the site runs on sample data (`src/lib/mock.ts`). To use real services, copy `.env.example` to `.env.local` and fill in Clerk and Supabase keys. Clerk is required for `/owner` and `/admin`.

## Roles
Roles live in Clerk user **publicMetadata**: `{"role": "admin"}`, `"owner"` or `"cleaner"`. Admins can open every area; owners see only their own properties and bookings (enforced by Supabase row level security through the Clerk session token). An owner's Clerk user id goes in `owners.clerk_user_id`.

## Docs
- `docs/ARCHITECTURE.md`: product architecture, routes, data model, integrations
- `docs/SETUP-CHECKLIST.md`: accounts to create and build status
- `supabase/schema.sql`: database schema and row level security
- `.env.example`: environment variables

## Bookings and payments
Guests book and pay on Airbnb or Vrbo; the site takes no reservations or payments. Stays reach the database through iCal import (`/api/cron/ical`, run by `/api/cron/daily`, see `vercel.json`) or manual entry in `/admin/bookings/new`. The platforms pay homeowners directly under their payout rules and the Management Agreement, so the site has no payout feature. Owner statements are built from bookings: stays with recorded amounts show gross, our fee and net; iCal-imported stays show nights only.
