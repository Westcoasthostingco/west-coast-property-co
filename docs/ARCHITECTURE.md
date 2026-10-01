# West Coast Hosting Co: product architecture plan

Status: audited 2026-10-01; step 0 fixes applied in code and schema. Four audiences, one Next.js app, one Postgres database, roles enforced by Clerk metadata and Supabase row level security.

## 1. Audiences and entrances

| Audience | Entrance | Role (Clerk publicMetadata.role) | Sees |
| --- | --- | --- | --- |
| Guests | `/` public site | none | Listings, availability, booking, reviews |
| Owners | `/owner` | `owner` | Their properties only: trends, occupancy, billing, fees, invoices from the management team |
| Property management team | `/admin` | `admin` | Everything: accounting trends, master calendar, cleaning scheduling, owners, invoicing, integrations |
| Cleaners | `/clean` | `cleaner` | Their assignments and a calendar of turnovers assigned to them |

One header component switches by role: public nav for guests, a portal nav for signed-in users with links only to the areas their role allows.

## 2. Public site (Wander-style layout, West Coast Hosting Co brand)

Routes:
- `/` Hero (full-bleed photo, short headline, search: where / dates / guests), featured properties row, "How we host" strip, owner call to action, reviews strip, footer.
- `/properties` Filterable grid: location, dates (available only), guests, amenities. Server-rendered with URL search params so results are shareable and indexable.
- `/properties/[slug]` Gallery (grid of 5, lightbox), title + location, facts (beds, baths, sleeps), description, amenities grid, availability calendar (blocked dates from bookings and iCal feeds), map, reviews, sticky booking panel (dates, guests, price breakdown, Book and pay).
- `/book/success`, `/book/cancelled`
- `/services` (for owners: what management includes, fee structure), `/about`, `/contact`.
- `/legal/terms`, `/legal/privacy`, `/legal/policies` (booking, cancellation and house policies). Copy lives in `src/lib/legal.ts`, rendered by `src/components/legal/LegalLayout.tsx`, linked from the footer and the booking panel.

Shipped pieces that live outside the route tree:
- **Booking panel and checkout lib.** `src/app/properties/[slug]/BookingPanel.tsx` posts to a server action; `src/lib/checkout.ts` validates dates, guests and `min_nights`, prices nights + cleaning fee + lodging tax (`tax_rate_bps`), creates the Stripe Checkout session and a `pending` booking hold.
- **Conditions widgets.** `src/components/widgets` (`TideWidget`, `SnowWidget`, `ConditionsBadge`, scenes) read `src/lib/tides.ts` (NOAA CO-OPS, keyed by `properties.tide_station_id`) and `src/lib/weather.ts` (Open-Meteo, keyed by `ski_resort_name`, `ski_lat`, `ski_lng`). Both APIs are keyless; `CONDITIONS_SAMPLE=1` forces sample data. The admin property form sets these columns under "Local conditions".
- **SEO files.** `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/opengraph-image.tsx`, `src/app/llms.txt`, and schema.org JSON-LD (`LodgingBusiness`, `VacationRental`, breadcrumbs) from `src/lib/seo.ts` via `src/components/seo/JsonLd.tsx`. Street addresses stop at locality.
- **Hardening.** Security headers (HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame-ancestors) are set centrally in `next.config.ts` `headers()`; public POST surfaces (`/api/checkout`, contact form) are rate limited per IP, and the contact form is behind Cloudflare Turnstile. Cron and webhook routes authenticate with `CRON_SECRET` and the Stripe/Clerk signing secrets respectively.

Data needed beyond today: `property_photos` (exists), `blocked_dates` (from iCal sync), `property_rules` (check-in time, pets, minimum nights), `pricing_rules` (seasonal rates, weekend uplift, minimum stay). Pricing stays simple at launch: nightly rate + cleaning fee + seasonal overrides.

## 3. Owner portal

Routes and what each answers:
- `/owner` Overview: this month vs last month revenue, occupancy rate, average nightly rate, upcoming stays. One line chart (revenue by month, 12 months) and one bar chart (occupancy by month).
- `/owner/properties/[id]` Per-property trends: same four numbers, calendar of stays, reviews.
- `/owner/statements` Monthly statements: gross bookings, management fee, cleaning passed through, net paid out, Stripe transfer ids. Download as PDF.
- `/owner/invoices` Invoices from the management team (repairs, supplies, extra services) with Pay button (Stripe Invoicing, hosted invoice page) and status.
- `/owner/settings` Payout setup (Stripe Connect), contact details, notification preferences.

Metrics are computed in SQL views so the admin and owner see identical numbers:
- `v_property_month_metrics(property_id, month, nights_booked, nights_available, occupancy, gross_cents, fee_cents, net_cents, adr_cents)`

## 4. Admin (management team)

- `/admin` Dashboard: portfolio revenue, occupancy, fees earned, payouts due, upcoming check-ins and check-outs, cleanings unassigned, open maintenance.
- `/admin/calendar` Master calendar: every property as a row, stays as bars, turnovers marked, iCal blocks shaded. Click a stay for detail. Month and 2-week views.
- `/admin/properties` CRUD, photo upload (Supabase Storage), pricing rules, iCal URLs, lock device id, cleaner default assignment.
- `/admin/bookings` List and detail, manual booking entry (phone bookings), refund button (Stripe), notes.
- `/admin/owners` CRUD, link Clerk user, fee percent, Connect status, statements per owner.
- `/admin/cleaning` Turnover board: each checkout creates a `cleaning_job` (property, date, window, assigned cleaner, status, checklist, photos). Assign and reassign cleaners; auto-assign by property default. Cleaner pay rate per job for cost tracking.
- `/admin/invoices` Create invoice to an owner (line items), send via Stripe Invoicing, track paid or overdue.
- `/admin/accounting` Trends: revenue, fees, payouts, cleaning cost, tax collected, by month and by property. Export CSV. QuickBooks sync status and last run.
- `/admin/reviews` Moderate.
- `/admin/settings/integrations` Stripe, iCal feeds per property, Seam, Twilio, Resend, QuickBooks: status and keys present or missing (never shows secrets).

## 5. Cleaner portal

- `/clean` Today and next 7 days: jobs assigned to me, each with property, address, door code (revealed only on job day), check-out time, next check-in time, checklist.
- `/clean/calendar` Month view of my jobs.
- `/clean/jobs/[id]` Start job, checklist, upload photos, report issue (creates maintenance ticket), mark done. Done triggers owner-visible status and unlocks the next guest's door code generation.
- Mobile first: cleaners use phones.

## 6. Data model additions

```
cleaners(id, clerk_user_id, name, phone, pay_rate_cents, active)
cleaning_jobs(id, property_id, booking_id, scheduled_date, window_start, window_end,
              cleaner_id, status[unassigned|assigned|in_progress|done|skipped],
              checklist jsonb, notes, completed_at, cost_cents)
cleaning_photos(id, job_id, storage_path, created_at)
maintenance_tickets(id, property_id, reported_by, source[cleaner|guest|owner|admin],
                    title, detail, status[open|in_progress|resolved], cost_cents, invoice_id)
invoices(id, owner_id, stripe_invoice_id, status, total_cents, due_on, issued_on, paid_on)
invoice_items(id, invoice_id, description, qty, unit_cents, maintenance_ticket_id)
blocked_dates(id, property_id, source[airbnb|vrbo|booking_com|manual], starts_on, ends_on, external_uid)
pricing_rules(id, property_id, starts_on, ends_on, nightly_rate_cents, min_nights, label)
property_rules(property_id, check_in_time, check_out_time, min_nights, pets_allowed, max_guests, house_rules)
notifications(id, to_role, to_id, channel[email|sms], template, payload, sent_at)
```

Row level security:
- Owners: select on rows where property.owner_id = current_owner_id(); invoices where owner_id matches.
- Cleaners: select on cleaning_jobs where cleaner_id = current_cleaner_id(); update limited to status, checklist, notes, completed_at via a security-definer function.
- Admin writes go through server actions with the service role; every write logs to audit_log.

## 7. Integrations

| Integration | Direction | Mechanism |
| --- | --- | --- |
| Airbnb, Vrbo, Booking.com | in | Hourly cron fetches each property's iCal, upserts blocked_dates; export our bookings as an iCal feed per property at `/api/ical/[property]` |
| Stripe Checkout and Connect | both | Built. Add Stripe Invoicing for owner invoices |
| Seam | out | On booking confirm, create a time-boxed access code; reveal to guest 48h before, to cleaner on job day |
| Twilio | out | Arrival reminder with code, cleaner job reminder |
| Resend | out | Booking confirmation, statements, invoice sent, review request after checkout |
| QuickBooks | out | Nightly: post journal entries per booking (gross to owner funds payable, fee to revenue, tax to liability) and per payout |
| Sentry | out | Errors |

## 8. Build order

0. Done: security and correctness fixes from the audit. RLS recursion in `current_owner_id()` (security definer), secrets moved out of the public view into `property_integrations` and `ical_feeds`, `stripe_events` idempotency, cron claims rows before transferring and uses `source_transaction`, lodging tax as a line item from `tax_rate_bps`, fee on nights subtotal only, hourly sweep of stale holds, `/clean` protected, full-refund-only reversal with idempotency key, Clerk `user.created` webhook links owners and cleaners by email.
1. Design system from the brand guide: tokens, type scale, buttons, cards, nav, charts palette. Replace current placeholder theme.
2. Availability: iCal import cron creates channel stays as `bookings` (source airbnb/vrbo/booking_com) so turnovers and the calendar see them; iCal export per property; shared calendar component.
3. Public site rebuild in the Wander layout: home, listings with filters, property detail with gallery, calendar and sticky booking panel. Booking confirmation email (Resend) ships here.
4. Admin operations first: bookings list, manual and owner-stay entry, refund, properties CRUD with photo upload, owners. Statements are wrong until refunds flow.
5. Owner portal: metrics views (prorated across month boundaries), overview charts, statements as printable HTML, settings.
6. Cleaning: cleaning_jobs auto-created on booking confirm, admin board, cleaner portal, photos, maintenance tickets.
7. Invoicing: at launch, repairs net against the next payout and show on the statement; Stripe Invoicing for owners comes after.
8. Accounting trends with CSV export. QuickBooks sync after launch.
9. Notifications: Resend templates first; Twilio and Seam after launch (manual door code with date-gated reveal until then).

Each step ships as its own PR with the build green and a Vercel preview.

## 9. Decisions taken in code (change if wrong) and open questions

Taken:
- Fee is a percent of the nights subtotal only; cleaning fee and lodging tax are not owner revenue and not fee-bearing. `properties.fee_percent` overrides `owners.fee_percent`.
- Lodging tax is a per-property rate (`tax_rate_bps`) charged to the guest as a line item. Stripe Tax is off.
- Stripe processing fees are absorbed by the platform (they come out of the fee, not the owner's share).
- Minimum nights per property exists now (default 2). Seasonal `pricing_rules` table exists; checkout does not apply it yet.
- Guests stay email-only; no guest accounts.

Open:
- Cleaning cost: passed through to owners at cost, marked up, or included in the fee?
- Refund policy wording (drives what the admin refund button does for partial refunds).
- Who is the 1099 filer for owner rents: enable Stripe's Connect 1099 tool, or your accountant?
