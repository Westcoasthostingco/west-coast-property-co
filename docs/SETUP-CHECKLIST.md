# Setup checklist

Status key: [ ] todo, [x] done. Use one business email as the owner of every account.

## Accounts
- [x] Domain: westcoasthostingco.com at Squarespace. Point DNS to Vercel (A @ 76.76.21.21, CNAME www cname.vercel-dns.com)
- [ ] Google Workspace (admin@, billing@)
- [x] GitHub repo: Westcoasthostingco/west-coast-property-co
- [x] Vercel: linked, env vars from `.env.example`. Currently Hobby plan (max 2 cron jobs, daily): a single `/api/cron/daily` runs iCal sync, hold sweep and payouts at 17:00 UTC. On Pro, schedule `/api/cron/ical` and `/api/cron/sweep` hourly and `/api/cron/payouts` daily in vercel.json
- [ ] Supabase (Pro for PITR): run `supabase/schema.sql` then `supabase/seed.sql`; create `property-photos` (public) and `cleaning-photos` (private) buckets; set each owner row's `clerk_user_id`
- [ ] Clerk: production instance on the domain; add Clerk as a third-party auth provider in Supabase (Authentication -> Sign In / Providers -> Third-party -> Clerk)
- [ ] Clerk admin role: in the Clerk dashboard open Users -> the business owner's account -> Metadata -> Public, and set `{"role": "admin"}`. Repeat with `"owner"` or `"cleaner"` for each owner and cleaner (the `user.created` webhook sets these automatically when the email matches an `owners` or `cleaners` row). Without the role, `/admin` returns the unauthorized page.
- [ ] Stripe: enable Connect (Express); test and live keys; onboarding link flow
- [ ] Stripe webhook endpoint: Developers -> Webhooks -> Add endpoint, URL `https://<domain>/api/webhooks/stripe`, events `checkout.session.completed`, `checkout.session.expired`, `account.updated`, `charge.refunded`; copy the signing secret into `STRIPE_WEBHOOK_SECRET` in Vercel. Do this for test and live mode separately.
- [ ] `CRON_SECRET` (required): set any long random string in Vercel for every environment. Vercel sends it as a bearer token to `/api/cron/daily`; the admin "Run payouts now" button and the payout job refuse to run without it.
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
