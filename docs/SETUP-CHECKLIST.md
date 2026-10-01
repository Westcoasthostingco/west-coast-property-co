# Setup checklist

Status key: [ ] todo, [x] done. Use one business email as the owner of every account.

## Accounts
- [x] Domain: westcoasthostingco.com at Squarespace. Point DNS to Vercel (A @ 76.76.21.21, CNAME www cname.vercel-dns.com)
- [ ] Google Workspace (admin@, billing@)
- [x] GitHub repo: Westcoasthostingco/west-coast-property-co
- [x] Vercel (Pro): link repo, add env vars from `.env.example`
- [ ] Supabase (Pro for PITR): run `supabase/schema.sql` then `supabase/seed.sql`; create `property-photos` bucket; set each owner row's `clerk_user_id`
- [ ] Clerk: production instance on the domain; set each user's publicMetadata `{"role":"admin"}` or `"owner"`; add Clerk as a third-party auth provider in Supabase (Authentication -> Sign In / Providers -> Third-party -> Clerk)
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
- [x] Clerk auth + role-protected /owner and /admin
- [x] Supabase data layer (`src/lib/data.ts`, falls back to sample data without keys)
- [ ] Availability calendar + iCal import/export
- [x] Stripe Checkout + Connect Express payouts (separate charges and transfers, released day after check-in by daily cron)
- [ ] Stripe dashboard: enable Connect (Express), enable Stripe Tax, add webhook endpoint `/api/webhooks/stripe` (checkout.session.completed, checkout.session.expired, account.updated, charge.refunded), set `STRIPE_WEBHOOK_SECRET` and `CRON_SECRET` in Vercel
- [ ] Contact form + transactional emails
- [ ] Reviews: collection + moderation
- [ ] Photo upload in admin
- [ ] QuickBooks sync (owner funds payable liability account)
- [ ] Legal review: broker license / trust accounting / occupancy tax
