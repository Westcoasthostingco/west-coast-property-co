# Setup checklist

Status key: [ ] todo, [x] done. Use one business email as the owner of every account.

## Accounts
- [ ] Domain registrar + DNS (Cloudflare / Namecheap / Vercel Domains)
- [ ] Google Workspace (admin@, billing@)
- [x] GitHub repo: Westcoasthostingco/west-coast-property-co
- [ ] Vercel (Pro): link repo, add env vars from `.env.example`
- [ ] Supabase (Pro for PITR): run `supabase/schema.sql`; create `property-photos` bucket
- [ ] Clerk: production instance on the domain; enable Organizations/roles; connect to Supabase (native integration)
- [ ] Stripe: enable Connect (Express); test and live keys; webhook endpoint; onboarding link flow
- [ ] Resend: verify domain (SPF/DKIM)
- [ ] QuickBooks Online: developer app for API sync (keep behind an accounting interface)
- [ ] Sentry
- [ ] Business bank account (+ trust account if your state requires it)
- [ ] Twilio (SMS), Seam (door codes), Mapbox/Google Maps, Cloudflare Turnstile
- [ ] Airbnb / Vrbo / Booking.com: collect iCal URLs per property

## Build status
- [x] Marketing pages, listings, property detail (mock data)
- [x] Owner portal and admin pages (mock data)
- [x] Database schema with RLS
- [ ] Clerk auth + role-protected /owner and /admin
- [ ] Supabase data layer replacing `src/lib/data.ts`
- [ ] Availability calendar + iCal import/export
- [ ] Stripe Checkout + Connect payouts (separate charges and transfers, release after check-in)
- [ ] Contact form + transactional emails
- [ ] Reviews: collection + moderation
- [ ] Photo upload in admin
- [ ] QuickBooks sync (owner funds payable liability account)
- [ ] Legal review: broker license / trust accounting / occupancy tax
