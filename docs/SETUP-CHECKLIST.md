# Setup checklist

Status key: [ ] todo, [x] done. Use one business email as the owner of every account.

## Accounts
- [x] Domain: westcoasthostingco.com at Squarespace. Point DNS to Vercel (A @ 76.76.21.21, CNAME www cname.vercel-dns.com)
- [ ] Google Workspace (admin@, billing@)
- [x] GitHub repo: Westcoasthostingco/west-coast-property-co
- [x] Vercel: linked, env vars from `.env.example`. Currently Hobby plan (max 2 cron jobs, daily): a single `/api/cron/daily` runs iCal sync and the hold sweep at 17:00 UTC. On Pro, schedule `/api/cron/ical` and `/api/cron/sweep` hourly in vercel.json
- [ ] Supabase (Pro for PITR): run `supabase/schema.sql` then `supabase/seed.sql`; create `property-photos` (public) and `cleaning-photos` (private) buckets; set each owner row's `clerk_user_id`
- [ ] Clerk: production instance on the domain; add Clerk as a third-party auth provider in Supabase (Authentication -> Sign In / Providers -> Third-party -> Clerk)
- [ ] Clerk admin role: in the Clerk dashboard open Users -> the business owner's account -> Metadata -> Public, and set `{"role": "admin"}`. Repeat with `"owner"` or `"cleaner"` for each owner and cleaner (the `user.created` webhook sets these automatically when the email matches an `owners` or `cleaners` row). Without the role, `/admin` returns the unauthorized page.
- [ ] `CRON_SECRET` (required): set any long random string in Vercel for every environment. Vercel sends it as a bearer token to `/api/cron/daily`, which refuses to run without it.
- No payment provider to set up: guests book and pay on Airbnb or Vrbo, and the platforms pay homeowners under their payout rules and the Management Agreement.
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
- [x] Showcase-only public site: bookings and payments on Airbnb/Vrbo (no checkout, no owner payouts, no Stripe)
- [x] Owner statements built from bookings (recorded amounts where available, nights only for iCal-imported stays)
- [ ] Contact form + transactional emails
- [ ] Reviews: collection + moderation
- [ ] Photo upload in admin
- [ ] QuickBooks sync (management fee revenue per recorded booking)
- [ ] Legal review: broker license / trust accounting / occupancy tax
