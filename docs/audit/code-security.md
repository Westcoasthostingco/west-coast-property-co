# Code correctness and security audit

Date: 2026-10-01. Scope: `src/**`, `supabase/schema.sql`, `next.config.ts`, `vercel.json`, `.env.example`, read end to end; nothing executed except read-only `curl -I` against the dev server on port 3124 to confirm response headers. Findings marked **confirmed** were traced through the code path; **possible** means the mechanism is clear from the code but depends on configuration or runtime behaviour I could not exercise here.

## Verdict

The step-0 fixes from the previous audit are real and mostly sound: the fee is computed on the nights subtotal only, money is in integer cents, the exclusion constraint on `bookings` is the right primitive for double-booking, payouts are claimed before Stripe is called and use `source_transaction`, secrets live in service-role-only tables, and the cleaner portal does its own per-job authorisation. The data layer is small and legible. That said, the app is not ready to take real money or real logins yet. Two problems are severe: (1) every `/admin` page relies on the segment layout for the role check, and Next.js partial rendering means a signed-in user with no role (sign-up is open) can fetch admin RSC payloads, including guest PII, payouts and the door code, without the layout ever running; (2) the Stripe webhook records the event id *before* doing the work and treats *any* insert error as a replay, so a single transient failure permanently drops a `checkout.session.completed` (guest charged, booking swept and cancelled, no payout) or a `charge.refunded` (owner keeps a reversed stay's money). Below those are a cluster of first-month money-reporting bugs (owner stays and Airbnb blocks counted as revenue at list price, manual bookings with no payout row, statements computed with a different fee and rounding than payouts, tax base differing between checkout and manual entry), an unsafe `PREVIEW_ROLE` gate that only looks at `VERCEL_ENV`, cron routes that accept `Bearer undefined` when `CRON_SECRET` is missing, and a daily-only cron that leaves holds and channel calendars up to 24 hours stale. Fixing S1 to S12 is a few days of focused work; the rest is hardening that can ship over the first month.

## Findings

Severity: **P0** exploitable or loses money now; **P1** real bug likely in the first month; **P2** hardening.

### P0

**S1. Admin pages are authorised only in the layout; partial rendering skips it. (confirmed)**
`src/app/admin/layout.tsx:8` is the sole `requireRole("admin")` for the whole admin tree; none of the `src/app/admin/**/page.tsx` files call it (grep shows `requireRole`/`loadOwner` only in owner and clean pages). `src/proxy.ts:15` only runs `auth.protect()` (signed in, any role). `src/app/sign-up/[[...sign-in]]` is public, so anyone can create an account with no role. Next.js App Router renders only the changed segments on a soft navigation (the `Next-Router-State-Tree` request header says which layouts the client already has), so a request for `/admin/bookings` carrying a state tree that claims the `/admin` layout is already mounted executes the page but not the layout. Pages fetch with `supabaseAdmin()` (`getBookingsDetailed`, `getPayoutsDetailed`, `getPropertyDetail` which includes `manual_door_code` and feeds the form at `src/components/admin/PropertyForm.tsx:59`). The Next docs explicitly say not to rely on layouts for auth for this reason.
Reproduce: sign up as a fresh user (no role), then `fetch("/admin/bookings", { headers: { RSC: "1", "Next-Router-State-Tree": <tree claiming ["", {children: ["admin", {children: ["__PAGE__", {}]}]}]> } })` from the browser console.
Fix: enforce the role at the data layer and in the proxy, not only in the layout.
```ts
// src/lib/admin.ts (and data.ts admin section): make every service-role read/write assert the role first
async function adminDb() { await requireRole("admin"); return supabaseAdmin(); }
// src/proxy.ts: cheap role gate from session claims (set Clerk session token customization to include publicMetadata)
const withClerk = clerkMiddleware(async (auth, req) => {
  if (!isProtected(req) || previewBypass) return;
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (req.nextUrl.pathname.startsWith("/admin") && role !== "admin") return NextResponse.redirect(new URL("/unauthorized", req.url));
});
```
Also add `await requireRole("admin")` to each admin page as belt and braces (cheap; `auth()` is request-memoised).

**S2. Stripe webhook idempotency drops events on transient failure. (confirmed)**
`src/app/api/webhooks/stripe/route.ts:25-26`: `insert({ id: event.id })` runs before any processing and `if (dup) return 200 duplicate` on *any* error (DB down, RLS, network), not just `23505`. If processing then throws (e.g. `paymentIntents.retrieve` at :35, `transfers.createReversal` at :96, any Supabase error), the route 500s, Stripe retries, and the retry is acknowledged as a duplicate. Consequences: a paid `checkout.session.completed` leaves the booking `pending`, the daily sweep cancels it ("hold expired"), no payout row exists, the dates reopen: guest charged, no stay. A `charge.refunded` whose reversal fails leaves the payout `paid` and the booking `confirmed`.
Fix: record success *after* processing, or record first but mark processed, and only short-circuit on the unique violation.
```ts
const { error: ins } = await db.from("stripe_events").insert({ id: event.id, type: event.type });
if (ins && ins.code !== "23505") return NextResponse.json({ error: "db" }, { status: 500 }); // let Stripe retry
if (ins?.code === "23505") {
  const { data } = await db.from("stripe_events").select("processed_at").eq("id", event.id).single();
  if (data?.processed_at) return NextResponse.json({ received: true, duplicate: true });
}
try { /* switch ... */ } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }); }
await db.from("stripe_events").update({ processed_at: new Date().toISOString() }).eq("id", event.id);
```
```sql
alter table stripe_events add column processed_at timestamptz;
```

### P1

**S3. Cron routes accept `Authorization: Bearer undefined` when `CRON_SECRET` is unset. (confirmed)**
`src/app/api/cron/{daily,ical,sweep,payouts}/route.ts:10-11` compare the header to the template string `` `Bearer ${process.env.CRON_SECRET}` ``. With the variable missing this is the literal `"Bearer undefined"`, which anyone can send to trigger payouts, the sweep (cancels pending holds) and the iCal import. Fix: `const s = process.env.CRON_SECRET; if (!s || req.headers.get("authorization") !== \`Bearer ${s}\`) return 401;` and use a constant-time compare (`crypto.timingSafeEqual`) on equal-length buffers.

**S4. `PREVIEW_ROLE` is gated only by `VERCEL_ENV === "production"`. (confirmed)**
`src/lib/auth.ts:13` and `src/proxy.ts:10`. On any host that is not Vercel production (self-hosted, Docker, `vercel dev`, a Vercel Preview that shares production `SUPABASE_SERVICE_ROLE_KEY`/`STRIPE_SECRET_KEY`), setting `PREVIEW_ROLE=admin` gives every anonymous visitor the admin UI *and* working server actions against the real database (`actor` becomes `preview_admin`). Preview URLs are shareable and often indexed in Slack. Fix: require an explicit second opt-in that can never be set in production tooling, e.g. `process.env.PREVIEW_ROLE && process.env.NODE_ENV !== "production"`, or `VERCEL_ENV === "preview" && !process.env.SUPABASE_SERVICE_ROLE_KEY?.includes(prodRef)`; better, drop PREVIEW_ROLE entirely once Clerk is live and use Clerk's dev instance on previews. At minimum enable Vercel Deployment Protection on previews and give previews a separate Supabase project.

**S5. No rate limit or ownership on `/api/checkout`: anyone can block every date. (confirmed)**
`src/app/api/checkout/route.ts:43-55` inserts a `pending` booking before Stripe is contacted, and `pending` rows participate in the exclusion constraint (`schema.sql:118-121`) and in the public calendar (`property_unavailable_dates`). A script posting the form for every 2-night window at every property holds the whole portfolio for 30 min (Stripe `expires_at`), 45 min + until the next sweep run if the `checkout.session.expired` webhook is missed, and with the current daily cron (S6) up to 24 h. Each call also creates a Stripe Checkout Session. Fix: (a) rate limit by IP and by email (Upstash Ratelimit or a Postgres bucket: `select count(*) from bookings where status='pending' and guest_email=$1 and created_at > now()-interval '1 hour'`), cap concurrent pending holds per IP to 2 to 3; (b) create the Stripe session *first* with `expires_at`, then insert the booking with `stripe_checkout_session_id` in the same statement so there are no session-less holds; (c) add Turnstile on the booking form (the contact form already has the plumbing); (d) make the sweep expire holds at 31 min, not 45.

**S6. Sweep and iCal sync run daily, but the code assumes hourly. (confirmed)**
`vercel.json:3` schedules only `/api/cron/daily` at 17:00 UTC; `src/app/api/cron/sweep/route.ts:4` and `ical/route.ts:5` say "hourly", `src/app/admin/settings/integrations/page.tsx:44` tells admins feeds are "synced hourly". Effects: a missed `checkout.session.expired` webhook leaves dates blocked up to 24 h; Airbnb/Vrbo reservations reach the master calendar and the public calendar up to 24 h late, and a direct booking taken in that window overlaps the channel stay (the import then fails with 23P01 and only writes an `audit_log` row nobody reads: `ical/route.ts:35-38`). Fix: Vercel Pro with hourly schedules, or an external pinger (GitHub Actions `schedule: "*/30 * * * *"` calling `/api/cron/ical` and `/api/cron/sweep` with the secret). Surface `audit_log action='overlap'` on the admin dashboard and email the team.

**S7. Metrics count owner stays and channel "Not available" blocks as revenue at list price. (confirmed)**
`src/lib/metrics.ts:35`: `perNight = b.total > 0 && nightsTotal > 0 ? (b.subtotal ?? b.total)/nightsTotal : (rate.get(b.propertyId) ?? 0)`. Channel bookings are imported with `total_cents: null` (`ical/route.ts:32`) and owner stays with `total 0` (`admin.ts:333-340`); `toBooking` maps null to `0`, so both fall through to the property's nightly rate. Every Airbnb block, every owner weekend, is reported as revenue on `/owner`, `/owner/properties/[id]`, `/admin` and `/admin/accounting`, and ADR is inflated. Occupancy also counts owner nights as booked. Fix:
```ts
const isRevenue = b.source !== "Owner stay" && b.subtotal != null;
const perNight = isRevenue && nightsTotal > 0 ? b.subtotal! / nightsTotal : 0;   // channel: nights yes, revenue unknown => 0
// and track channelNights separately so the UI can label "revenue excludes channel stays"
```
If you do want channel revenue, store it (Airbnb's iCal has none; it needs the host API or manual entry).

**S8. Manual bookings have no payout row; statements compute fee differently from payouts. (confirmed)**
`createManualBooking` (`src/lib/admin.ts:323-355`) inserts a `confirmed` booking with money fields but never inserts into `payouts`; the Stripe webhook is the only place payouts are created. `/admin/payouts` and the "Payouts due this week" tile therefore omit phone bookings, and the owner is never transferred their share. Meanwhile `statementFor` (`src/lib/owner.ts:153-156`) fills the gap with `fee = Math.round(gross * owner.feePercent / 100)` in *dollars* (rounds to the dollar; payouts round in cents) and uses `owners.fee_percent`, ignoring `properties.fee_percent` which the webhook honours (`webhooks/stripe/route.ts:49`). Statements and payout rows disagree by up to $0.50 per stay and by the whole fee delta when an override exists. Fix: create the payout row in `createManualBooking` for non-owner sources (status `scheduled` if paid to the platform, or a new status `offline` if the guest paid the owner directly), compute it with the same `feeCents(gross, prop.fee_percent ?? owner.fee_percent)`, and make the statement read *only* payout rows (fall back to "no payout yet" rather than recomputing). Longer term, the architecture's `v_property_month_metrics` view is the right home for all of this.

**S9. Lodging tax base differs between checkout and manual booking. (confirmed)**
`checkout/route.ts:40`: `taxCents(subtotal + cleaning, bps)`; `admin.ts:336`: `taxCents(subtotal, bps)`. The same stay is taxed differently depending on how it was entered, and the "Lodging tax collected" series on `/admin/accounting` mixes both. Washington treats cleaning fees charged to the guest as part of the lodging charge, so checkout is right. Fix: one `quote(property, nights)` in `src/lib/stripe.ts` returning `{subtotal, cleaning, tax, total}` used by both paths (and later by `pricing_rules`).

**S10. Turnovers are never created for channel stays; cancellations do not skip jobs. (confirmed)**
`cron/ical/route.ts` upserts bookings but never touches `cleaning_jobs`, so Airbnb/Vrbo check-outs do not appear on `/admin/cleaning` or `/clean`, contrary to ARCHITECTURE §8 step 2. When a channel stay disappears from the feed (`:40-44`) or a full refund cancels a direct stay (`webhooks/stripe/route.ts:99`), the booking is cancelled but its `cleaning_jobs` row stays `assigned`; only `cancelBooking` in admin skips it (`admin.ts:288`). Fix: a Postgres trigger keeps this consistent regardless of entry point.
```sql
create or replace function sync_cleaning_job() returns trigger language plpgsql as $$
begin
  if new.status = 'confirmed' and new.source <> 'direct' or (new.status = 'confirmed' and old.status is distinct from 'confirmed') then
    insert into cleaning_jobs (property_id, booking_id, scheduled_date, window_start, window_end, cleaner_id, status)
    select new.property_id, new.id, new.check_out, '11:00', '16:00', pi.default_cleaner_id,
           case when pi.default_cleaner_id is null then 'unassigned' else 'assigned' end
    from (select 1) x left join property_integrations pi on pi.property_id = new.property_id
    on conflict (booking_id) do update set scheduled_date = excluded.scheduled_date;
  elsif new.status = 'cancelled' then
    update cleaning_jobs set status = 'skipped' where booking_id = new.id and status in ('unassigned','assigned');
  end if;
  return new;
end $$;
create trigger bookings_sync_cleaning after insert or update of status, check_out on bookings
  for each row execute function sync_cleaning_job();
```

**S11. Payouts stuck in `processing` are never recovered; requeue reuses a cached-error idempotency key. (confirmed)**
`cron/payouts/route.ts:16-21` claims rows (`scheduled` to `processing`), then calls Stripe. If the function times out or crashes between `transfers.create` (:34) and the `paid` update (:43), the row stays `processing` forever: no later run selects it, `/admin/payouts` shows "processing", the owner is paid but the books say otherwise (or not paid, and nobody retries). `retryPayout` (`admin.ts:468-474`) only requeues `failed`. Separately, a requeued payout reuses `idempotencyKey: payout_${p.id}`; Stripe caches a failed request's *error* under that key for 24 h, so "Requeue" within a day returns the same error. Fix: at the start of the run, reclaim `processing` rows older than 1 h; before transferring, list transfers with `transfer_group = booking_id` and reuse any existing one; include an attempt counter in the key.
```ts
await db.from("payouts").update({ status: "scheduled", last_error: "reclaimed stale processing" })
  .eq("status", "processing").lt("updated_at", new Date(Date.now() - 3600_000).toISOString());
const existing = await stripe().transfers.list({ transfer_group: p.booking_id, limit: 1 });
const transfer = existing.data[0] ?? await stripe().transfers.create({...}, { idempotencyKey: `payout_${p.id}_${p.attempts}` });
```
```sql
alter table payouts add column attempts int not null default 0, add column updated_at timestamptz not null default now();
```

**S12. Supabase configured without Clerk crashes every public page. (confirmed by reading, not executed)**
`src/lib/supabase.ts:16` passes `accessToken: async () => (await auth()).getToken()` for *every* Supabase request, including anonymous reads on `/`, `/properties`, `/properties/[slug]`, `/api/ical/[slug]`. When Clerk keys are absent, `src/proxy.ts:20` exports a passthrough instead of `clerkMiddleware`, and `@clerk/nextjs` 7.9.9 `auth()` throws `authAuthHeaderMissing` ("Clerk can't detect usage of clerkMiddleware()") when the `x-clerk-auth-status` header is missing (`node_modules/@clerk/nextjs/dist/esm/app-router/server/auth.js:35`). `getRole()` guards on `clerkConfigured`; `supabaseForUser()` does not. Fix: `accessToken: clerkConfigured ? async () => (await auth()).getToken() : undefined`, and for public pages use a plain anon client (`supabaseAnon()`) so public reads never depend on Clerk at all.

**S13. `account.updated` only arrives on a Connect webhook endpoint. (possible)**
`webhooks/stripe/route.ts:82-85` flips `owners.payouts_enabled` on `account.updated`. Events for Express connected accounts are delivered only to an endpoint registered with "Listen to events on Connected accounts" (which has its own signing secret); a single platform-account endpoint never receives them, so every payout is parked with "owner not onboarded" (`cron/payouts:27-31`). `SETUP-CHECKLIST.md:28` does not mention this. Fix: register two endpoints (account and Connect) or, cheaper, when the owner returns to `/owner?onboarding=done` call `stripe().accounts.retrieve(id)` and set `payouts_enabled` directly; also refresh it in the payout cron before parking.

**S14. Clerk webhook links by the first email, not the primary verified one. (possible)**
`webhooks/clerk/route.ts:17` uses `email_addresses[0]` without checking `verification.status === "verified"` or `primary_email_address_id`. If the Clerk instance allows sign-up with an unverified email (or an OAuth provider that does not assert verification), someone who knows an owner's email can pre-claim `owners.clerk_user_id`. Role still has to be granted by an admin, so this alone does not grant access, but an admin seeing "linked" is likely to set the role. Fix: pick the primary address, require `verified`, and handle `user.updated`/`user.deleted` (unlink on delete). Have the admin link page show the Clerk email and verification state before saving `clerkUserId`.

### P2

**S15. Async payment methods are never confirmed. (confirmed)**
`webhooks/stripe/route.ts:32` breaks when `payment_status !== "paid"`; `checkout.session.async_payment_succeeded`/`_failed` are not handled. If Checkout's automatic payment methods include a delayed-notification method (ACH, some BNPL), the guest completes but the booking never confirms. Fix: restrict `payment_method_types: ["card"]` or handle both async events.

**S16. Confirm-after-cancel is silent. (confirmed)**
`webhooks/stripe/route.ts:38-44`: the `update ... status='confirmed'` runs unconditionally; if the sweep (S6) already cancelled the hold and another guest took the dates, the exclusion constraint rejects it, `booking` is null, and the handler `break`s with a 200. Guest charged, no stay, no alert. Fix: check `error`, and on 23P01 refund the payment intent automatically and email the team; otherwise only update where `status in ('pending','confirmed')`.

**S17. Refund vs payout race. (possible)**
`webhooks/stripe/route.ts:94-98` reverses only when `payout.status === 'paid'`; if the cron has the row in `processing` at that moment, the webhook sets `reversed`, then the cron's `update ... status='paid'` (`cron/payouts:43`) overwrites it. Fix: cron updates `where status='processing'`; webhook treats `processing` as "retry later" (return 500 so Stripe retries) or records a `pending_reversal` flag the cron honours.

**S18. "Today" is UTC in checkout, admin and payouts; Pacific in the cleaner portal. (confirmed)**
`src/lib/stripe.ts:22 todayISO`, `data.ts:47`, `owner.ts:64`, `cron/ical:17`. From 4 or 5 pm Pacific onward, `checkout/route.ts:24` rejects same-day check-ins ("Check-in must be today or later"), `/admin` moves "today" a day early (check-ins list, calendar highlight), and `toBooking` marks stays "completed" early. `cleaner-actions.ts:20` already does it right. Fix: one `todayPacific()` in `lib/dates.ts` (per-property `timezone` column exists) used everywhere a calendar date is compared.

**S19. Internal error text leaks to guests; input not validated. (confirmed)**
`checkout/route.ts:54` returns the raw Postgres message (`error?.message`) with a 500 for anything but 23P01; `check_in`/`check_out` are not format-checked (`nightsBetween` uses `Date.parse`, which is lenient), `guest_email` is unchecked so Stripe's `customer_email` can throw after the hold is inserted (orphan hold until sweep). Fix: `/^\d{4}-\d{2}-\d{2}$/` + `Number.isNaN(Date.parse())`, an email regex, generic "Could not hold the dates" message, and create the hold only after the Stripe session (see S5).

**S20. No security headers. (confirmed via curl on :3124)**
Responses carry `X-Powered-By: Next.js` and no CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` or `Permissions-Policy`. `next.config.ts` sets none. Snippet in the "Headers" section below.

**S21. HTML injection in emails. (confirmed)**
`src/lib/email.ts:27-40` interpolates `guest`, `property`, `name`, `email`, `kind`, `message` into HTML unescaped. The contact form (`contact/actions.ts:25`) sends attacker-controlled HTML to the team inbox (phishing links styled as site content); a guest can inject into their own confirmation. Fix: `const esc = (s: string) => s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!))` on every interpolation, and send a `text` part too.

**S22. CSV formula injection. (confirmed)**
`admin.ts:514-518` quotes commas/quotes but not leading `=`, `+`, `-`, `@`, tab or CR. A guest named `=HYPERLINK("http://evil","Open")` executes when the admin opens the export in Excel. Fix: prefix such cells with `'` (or a space) in `csvCell`.

**S23. Upload validation is client-trusted. (confirmed)**
`admin.ts:185` and `cleaner-actions.ts:173` accept any `file.type.startsWith("image/")` (client-supplied). `image/svg+xml` into the *public* `property-photos` bucket is a script-bearing document served from the Supabase origin; the admin page promises "under 1 MB" (`admin/properties/[id]/page.tsx:49`) but only the 10 MB server-action body limit applies. Fix: allowlist `jpeg|png|webp|heic`, sniff magic bytes (`file-type` package), cap property photos at 5 MB, set bucket-level `allowed_mime_types` and `file_size_limit` in Supabase Storage.

**S24. SSRF and unbounded fetch in iCal import. (confirmed)**
`cron/ical/route.ts:22` fetches any URL an admin saved (`admin.ts:174-178` does no validation), with redirects, no timeout, no size limit; the response body is parsed and the error text stored and shown in admin. Admin-only input, so low risk, but on Vercel the function can reach the Supabase REST endpoint and other internal services. Fix: require `https:`, allowlist hosts (`airbnb.com`, `vrbo.com`, `homeaway.com`, `booking.com`, `admin.booking.com`, `ical.booking.com`), `redirect: "manual"`, `AbortSignal.timeout(10_000)`, and reject bodies over 2 MB or not starting with `BEGIN:VCALENDAR`.

**S25. Signed-in non-owners see an empty public availability calendar. (confirmed)**
`schema.sql:284-285` grants the stay-dates policy `to anon` only; `authenticated` users (admins, cleaners, owners of *other* homes) hit "owner reads own bookings" and get nothing from `property_unavailable_dates`. An admin previewing `/properties/[slug]` while signed in sees every date open. Fix: `create policy "anyone sees active stay dates" on bookings for select to anon, authenticated using (status in ('pending','confirmed'))` plus the same column-level grant to `authenticated` (or read public data through a dedicated anon client, which also fixes S12).

**S26. UI expects columns and values the schema lacks. (confirmed)**
`cleaning.ts:64` and `cleaner-actions.ts:30` read `next_check_in`, which `cleaning_jobs` does not have; in DB mode "Next check-in" is always "open"/"Nobody yet" on `/admin/cleaning` and `/clean/jobs/[id]`. `properties/[slug]/page.tsx:60` hardcodes `minNights={2}` although `property_listings.min_nights` exists and `toProperty` drops it. `property_listings` exposes `owner_id` to anon (`schema.sql:221`). `cleaning-photos` insert tolerates "does not exist" (`cleaner-actions.ts:182`), hiding a missing-table deployment. Fix: compute next check-in in SQL (`lateral (select min(check_in) from bookings b2 where b2.property_id = j.property_id and b2.check_in >= j.scheduled_date and b2.status in ('pending','confirmed'))`) in a `v_cleaning_jobs` view; map `min_nights`; drop `owner_id` from the public view; remove the tolerance.

**S27. Errors swallowed in reads and multi-step writes. (confirmed)**
`getJob`, `getCleanerForClerkUser` (`cleaning.ts:88,99`), `getPropertyDetail`, `getBookingDetail`, `getAllIcalFeeds`, `getOwnerDetail`, `addBookingNote` (`admin.ts:72-78,252,104,367,272`) ignore `error`, so a DB outage renders as "not found"/"not linked" rather than an error page. `cancelBooking` (`admin.ts:287-288`) ignores failures of the payout hold and the job skip, then reports success. `audit()` is awaited unguarded so a logging failure fails an otherwise-complete action. Fix: `if (error) throw`, run the cancel steps in one RPC/transaction, wrap `audit()` in try/catch with console.error.

**S28. Dashboard "Management fees" counts unpaid payouts. (confirmed)**
`admin/page.tsx:23` sums `fee` over payouts with `release_on` this month and `status !== 'reversed'`, so `scheduled`/`failed`/`processing` are counted as earned; `admin/accounting/page.tsx:18-20` does the same for "released in month". Fix: `status === 'paid'` for earned, a separate "due" number for scheduled.

**S29. Stripe `expires_at` is exactly the 30-minute minimum. (possible)**
`checkout/route.ts:73` sets `now + 1800 s`; Stripe requires at least 30 minutes *at receipt*, so latency or clock skew can produce "expires_at must be at least 30 minutes in the future" and a 500 after the hold is inserted. Fix: 35 to 40 minutes, with the sweep cutoff a few minutes later.

**S30. Contact form spam controls are optional and unmetered. (confirmed)**
`contact/actions.ts:8` returns `true` when `TURNSTILE_SECRET_KEY` is unset; there is a honeypot but no rate limit, and `kind` is unvalidated. Fine before launch; add the same rate limiter as S5 and fail closed in production.

**S31. Connect onboarding `GET = POST` is not idempotent. (confirmed)**
`stripe/connect/onboard/route.ts:19-30,42`: two concurrent calls (double click, refresh link) create two Express accounts; the second `update` wins and the first is orphaned at Stripe. Fix: `insert ... where stripe_account_id is null` guard (`update ... .is("stripe_account_id", null).select()` and re-read on zero rows), and pass `{ idempotencyKey: \`acct_${owner.id}\` }` to `accounts.create`.

**S32. Manual booking input is under-validated. (confirmed)**
`admin.ts:313-336`: `nightlyRate` may be negative (`num` keeps `-`), `guestCount` is not checked against `max_guests`, `checkIn` has no format check, past dates are allowed (the form's `min` is client-side). Fix: same validator as checkout.

**S33. Public listing page freshness depends on an incidental dynamic call. (possible)**
`properties/[slug]/page.tsx:9` has `generateStaticParams` and no `dynamic`/`revalidate`; the page is only rendered per request because `supabaseForUser()` calls `auth()` (reads headers). In mock mode or if the client is swapped for an anon client (S12/S25 fix), availability and reviews freeze at build time. Same for `/api/ical/[slug]`. Fix: `export const revalidate = 300` (or `dynamic = "force-dynamic"`) on both, explicitly.

**S34. iCal export escaping bug. (confirmed, low impact)**
`ical.ts:25`: `"\;"` in a JS string is just `";"`, so semicolons in the calendar name are not escaped. Only admin-controlled text reaches it today. Fix: `"\\;"`.

**S35. Open sign-up with no role. (confirmed)**
`/sign-up` is public and `requireRole` sends role-less users to `/unauthorized`, which is fine on its own, but it is the precondition for S1 and makes S14 easier. Consider disabling public sign-up in Clerk and inviting owners/cleaners (Clerk invitations carry `publicMetadata`, which also removes the email-matching webhook).

**S36. PII and secrets handling, minor. (confirmed)**
`audit_log.detail` stores free-text booking notes (`admin.ts:277`) and `ical_feeds.last_error` can contain the feed URL (with its token) when `fetch` fails with a URL in the message, which `/admin/settings/integrations` then renders. `runPayoutsNow` (`admin.ts:455`) sends `CRON_SECRET` to whatever `NEXT_PUBLIC_APP_URL` points at. Fix: redact URLs in `last_error`, call the payout function directly instead of over HTTP.

## Suggested indexes

`schema.sql` has only PK/unique/exclusion indexes. The queries in `src/lib/*` and the cron routes need these:

```sql
-- payouts: cron claim (status, release_on), owner portal (owner_id), admin lists
create index payouts_status_release_idx on payouts (status, release_on);
create index payouts_owner_release_idx on payouts (owner_id, release_on);

-- bookings: sweep, iCal reconcile, owner/admin lists, calendar range scans
create index bookings_pending_sweep_idx on bookings (created_at) where status = 'pending' and source = 'direct';
create index bookings_channel_recon_idx on bookings (property_id, source, status, check_out);
create index bookings_property_checkin_idx on bookings (property_id, check_in);
create index bookings_checkin_idx on bookings (check_in desc);
create index bookings_session_idx on bookings (stripe_checkout_session_id);

-- cleaning: cleaner portal, admin board, per-property lookups
create index cleaning_jobs_cleaner_date_idx on cleaning_jobs (cleaner_id, scheduled_date);
create index cleaning_jobs_date_idx on cleaning_jobs (scheduled_date);
create index cleaning_jobs_property_idx on cleaning_jobs (property_id);
create index cleaning_photos_job_idx on cleaning_photos (job_id);

-- properties / reviews / photos / tickets
create index properties_owner_idx on properties (owner_id);
create index properties_published_idx on properties (published) where published;
create index reviews_property_published_idx on reviews (property_id, published);
create index property_photos_property_sort_idx on property_photos (property_id, sort_order);
create index maintenance_tickets_status_idx on maintenance_tickets (status) where status in ('open','in_progress');
create index audit_log_entity_idx on audit_log (entity, entity_id, created_at desc);
```

RLS policy subqueries (`property_id in (select id from properties where owner_id = current_owner_id())`) also benefit from `properties_owner_idx`.

## Security headers

Add to `next.config.ts` (tighten the CSP once Mapbox/Turnstile are in; Clerk needs its own hosts):

```ts
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://clerk.westcoasthostingco.com https://challenges.cloudflare.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.supabase.co https://img.clerk.com",
  "connect-src 'self' https://*.clerk.accounts.dev https://clerk.westcoasthostingco.com https://*.supabase.co https://api.stripe.com https://challenges.cloudflare.com",
  "frame-src https://checkout.stripe.com https://js.stripe.com https://challenges.cloudflare.com https://*.clerk.accounts.dev",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com https://connect.stripe.com",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: csp },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=(self \"https://checkout.stripe.com\")" },
      ],
    }];
  },
  // ...existing config
};
```

Pair this with: `Cache-Control: private, no-store` on `/owner`, `/admin`, `/clean` responses (set in the proxy for `isProtected(req)`), and `Vercel Deployment Protection` on previews.

## Fix order

1. S1, S2, S3 (one afternoon; no schema change except `stripe_events.processed_at`).
2. S4, S5, S6, S12 before the first real deploy with keys.
3. S7, S8, S9, S10, S11 before the first owner statement goes out.
4. S20 headers and indexes any time; the rest as hardening tickets.
