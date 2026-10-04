-- West Coast Hosting Co: initial schema (Supabase / Postgres)
-- Auth is Clerk. Roles (admin/owner/cleaner) live in Clerk user publicMetadata.
-- Add Clerk as a third-party auth provider in Supabase so RLS can read the
-- Clerk user id from the session token: auth.jwt()->>'sub'.
-- Money is stored in integer cents.
-- Legacy: guests book and pay on Airbnb/Vrbo, which pay homeowners directly. The app
-- no longer uses Stripe or owner payouts. The payouts and stripe_events tables, the
-- payout_status type and the stripe_* / payouts_enabled columns are kept as history
-- only; app code neither reads nor writes them.

create extension if not exists "pgcrypto";
create extension if not exists btree_gist with schema extensions;

create type booking_source as enum ('direct', 'airbnb', 'vrbo', 'booking_com', 'owner', 'manual');
create type booking_status as enum ('pending', 'confirmed', 'cancelled');
-- 'offline': the guest paid a channel (Airbnb/Vrbo) that pays the owner directly; recorded
-- for statements, never transferred by the payout cron.
create type payout_status as enum ('scheduled', 'processing', 'paid', 'failed', 'reversed', 'offline');

create table owners (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique,          -- linked by the Clerk user.created webhook (email match) or in admin
  name text not null,
  email text not null unique,
  stripe_account_id text unique,      -- Stripe Connect Express account
  payouts_enabled boolean not null default false,
  fee_percent numeric(5,2) not null default 18,
  created_at timestamptz not null default now()
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id),
  slug text unique not null,
  name text not null,
  address text, city text, region text, postal_code text,
  lat double precision, lng double precision,
  timezone text not null default 'America/Los_Angeles',
  bedrooms int, bathrooms numeric(3,1), max_guests int not null default 2,
  nightly_rate_cents int not null,
  cleaning_fee_cents int not null default 0,
  tax_rate_bps int not null default 0,          -- lodging tax (TOT) in basis points, e.g. 1050 = 10.5%
  fee_percent numeric(5,2),                     -- overrides owners.fee_percent when set
  min_nights int not null default 2,
  check_in_time time not null default '16:00',
  check_out_time time not null default '11:00',
  pets_allowed boolean not null default false,
  house_rules text,
  summary text,
  description text,
  amenities text[] not null default '{}',
  airbnb_url text,                              -- public listing page, shown on the property page
  vrbo_url text,
  tide_station_id text,                         -- NOAA CO-OPS station for the tide widget (waterfront homes)
  ski_resort_name text, ski_lat double precision, ski_lng double precision,  -- snow widget (mountain homes)
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- Secrets and device ids. No RLS policies: only the service role can read.
create table property_integrations (
  property_id uuid primary key references properties(id) on delete cascade,
  seam_device_id text,
  manual_door_code text,              -- used until Seam is connected
  default_cleaner_id uuid,            -- fk added after cleaners table exists
  updated_at timestamptz not null default now()
);

create table ical_feeds (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  source booking_source not null,
  url text not null,                  -- contains a secret token; never expose
  last_synced_at timestamptz,
  last_error text,
  unique (property_id, source)
);

create table property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null,          -- Supabase Storage bucket: property-photos
  alt text,
  sort_order int not null default 0
);

create table pricing_rules (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  label text,
  starts_on date not null,
  ends_on date not null,
  nightly_rate_cents int not null,
  min_nights int,
  check (ends_on >= starts_on),
  exclude using gist (property_id with =, daterange(starts_on, ends_on, '[]') with &&)
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id),
  guest_name text not null,
  guest_email text,
  guest_phone text,
  guest_count int not null default 1,
  check_in date not null,
  check_out date not null,
  source booking_source not null default 'direct',
  status booking_status not null default 'pending',
  subtotal_cents int,                  -- nights x rate; null for channel bookings we only see via iCal
  cleaning_fee_cents int not null default 0,
  tax_cents int not null default 0,
  total_cents int,
  external_uid text,                   -- iCal event uid for channel bookings
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  accepted_policy_version text,        -- which /legal/policies version the guest accepted at checkout
  notes text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  check (check_out > check_in),
  unique (property_id, source, external_uid),
  -- prevent double-booking of active stays
  exclude using gist (
    property_id with =,
    daterange(check_in, check_out) with &&
  ) where (status in ('pending', 'confirmed'))
);
-- 'completed' is derived: status = 'confirmed' and check_out < current_date.

-- Legacy (unused by the app since owner payouts were removed).
create table payouts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id),
  booking_id uuid not null unique references bookings(id),
  gross_cents int not null,            -- owner-side gross: nights subtotal only
  fee_cents int not null,
  net_cents int not null,
  release_on date not null,            -- check-in + 1 day
  status payout_status not null default 'scheduled',
  stripe_transfer_id text,
  last_error text,
  attempts int not null default 0,     -- bumped by trigger each time the cron claims the row; part of the Stripe idempotency key
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id),
  booking_id uuid references bookings(id),
  guest_name text not null,
  rating int not null check (rating between 1 and 5),
  body text,
  published boolean not null default false,   -- moderated in /admin/reviews
  created_at timestamptz not null default now()
);

create table cleaners (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique,
  name text not null,
  email text unique,
  phone text,
  pay_rate_cents int not null default 0,
  active boolean not null default true
);
alter table property_integrations
  add constraint property_integrations_default_cleaner_fk
  foreign key (default_cleaner_id) references cleaners(id);

create type cleaning_status as enum ('unassigned', 'assigned', 'in_progress', 'done', 'skipped');

create table cleaning_jobs (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id),
  booking_id uuid references bookings(id),     -- the stay that just ended
  scheduled_date date not null,
  window_start time, window_end time,
  cleaner_id uuid references cleaners(id),
  status cleaning_status not null default 'unassigned',
  checklist jsonb not null default '[]',
  notes text,
  cost_cents int,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (booking_id)
);

create table cleaning_photos (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references cleaning_jobs(id) on delete cascade,
  storage_path text not null,          -- Supabase Storage bucket: cleaning-photos (private)
  created_at timestamptz not null default now()
);

create type ticket_status as enum ('open', 'in_progress', 'resolved');

create table maintenance_tickets (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id),
  cleaning_job_id uuid references cleaning_jobs(id),
  reported_by text,
  title text not null,
  detail text,
  status ticket_status not null default 'open',
  cost_cents int,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- Legacy (unused): Stripe webhook idempotency from the removed checkout.
create table stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz                 -- null until the webhook handler succeeded
);

create table audit_log (
  id bigint generated always as identity primary key,
  actor text,
  action text not null,
  entity text, entity_id text,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- Triggers that keep derived rows consistent regardless of which code path writes.

-- payouts: track updated_at (the payout cron reclaims rows stuck in 'processing' for
-- over two hours) and count claims so each Stripe attempt gets a fresh idempotency key.
create or replace function payouts_touch() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.status = 'processing' and old.status is distinct from 'processing' then
    new.attempts := old.attempts + 1;
  end if;
  return new;
end $$;
create trigger payouts_touch before update on payouts
  for each row execute function payouts_touch();

-- bookings -> cleaning_jobs: every confirmed stay (direct, manual or imported from a
-- channel feed) has a turnover on its check-out day; a cancelled stay (admin, channel
-- feed removal) has its open turnover skipped. App code does the
-- same inline; this makes it hold for any path that forgets.
create or replace function sync_cleaning_job() returns trigger language plpgsql as $$
begin
  if new.status = 'confirmed' then
    insert into cleaning_jobs (property_id, booking_id, scheduled_date, window_start, window_end, cleaner_id, status)
    select new.property_id, new.id, new.check_out, '11:00', '16:00', pi.default_cleaner_id,
           case when pi.default_cleaner_id is null then 'unassigned'::cleaning_status else 'assigned'::cleaning_status end
    from (select 1) x left join property_integrations pi on pi.property_id = new.property_id
    on conflict (booking_id) do update set scheduled_date = excluded.scheduled_date
      where cleaning_jobs.status in ('unassigned', 'assigned');
  elsif new.status = 'cancelled' then
    update cleaning_jobs set status = 'skipped' where booking_id = new.id and status in ('unassigned', 'assigned');
  end if;
  return new;
end $$;
create trigger bookings_sync_cleaning after insert or update of status, check_out on bookings
  for each row execute function sync_cleaning_job();

-- Public listing view: explicit columns only, never secrets or internal ids.
create view property_listings with (security_invoker = true) as
select p.id, p.owner_id, p.slug, p.name, p.city, p.region, p.lat, p.lng,
  p.bedrooms, p.bathrooms, p.max_guests, p.nightly_rate_cents, p.cleaning_fee_cents,
  p.tax_rate_bps, p.min_nights, p.check_in_time, p.check_out_time, p.pets_allowed,
  p.summary, p.description, p.amenities, p.published, p.airbnb_url, p.vrbo_url,
  p.tide_station_id, p.ski_resort_name, p.ski_lat, p.ski_lng,
  coalesce(round(avg(r.rating) filter (where r.published), 1), 0) as rating,
  count(r.id) filter (where r.published) as review_count
from properties p
left join reviews r on r.property_id = p.id
group by p.id;

-- Dates guests cannot book: active stays from any source. No guest details.
-- Runs as the caller; anon gets a column-level grant on bookings (below) so only
-- the three date columns of active stays are ever readable.
create view property_unavailable_dates with (security_invoker = true) as
select property_id, check_in, check_out from bookings where status in ('pending', 'confirmed');

-- Privileges. New Supabase projects grant nothing to the API roles by default,
-- so RLS alone is not enough: each role also needs explicit GRANTs.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all routines in schema public to service_role;
grant select on all tables in schema public to authenticated;
grant select on properties, property_photos, pricing_rules, reviews, property_listings, property_unavailable_dates to anon;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant select on tables to authenticated;

-- Row level security. The service role (server only) bypasses RLS.
alter table owners enable row level security;
alter table properties enable row level security;
alter table property_integrations enable row level security;
alter table ical_feeds enable row level security;
alter table property_photos enable row level security;
alter table pricing_rules enable row level security;
alter table bookings enable row level security;
alter table payouts enable row level security;
alter table reviews enable row level security;
alter table cleaners enable row level security;
alter table cleaning_jobs enable row level security;
alter table cleaning_photos enable row level security;
alter table maintenance_tickets enable row level security;
alter table stripe_events enable row level security;
alter table audit_log enable row level security;

-- security definer so the owners policy does not recurse through this function.
create or replace function current_owner_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from owners where clerk_user_id = (auth.jwt() ->> 'sub')
$$;
create or replace function current_cleaner_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from cleaners where clerk_user_id = (auth.jwt() ->> 'sub')
$$;

-- Public (anon) reads.
create policy "public read published properties" on properties for select using (published);
create policy "public read photos" on property_photos for select using (true);
create policy "public read pricing" on pricing_rules for select using (true);
create policy "public read published reviews" on reviews for select using (published);
-- Anonymous visitors may read only the dates of active stays (for the availability view).
grant select (property_id, check_in, check_out, status) on bookings to anon;
create policy "anon sees active stay dates" on bookings for select to anon
  using (status in ('pending', 'confirmed'));
grant select on property_unavailable_dates to anon, authenticated;

-- Helper functions are only meaningful for signed-in users.
revoke execute on function current_owner_id() from public, anon;
revoke execute on function current_cleaner_id() from public, anon;
grant execute on function current_owner_id() to authenticated;
grant execute on function current_cleaner_id() to authenticated;

-- Owners read only their own data.
create policy "owner reads own owner row" on owners for select to authenticated using (clerk_user_id = (auth.jwt() ->> 'sub'));
create policy "owner reads own properties" on properties for select to authenticated using (owner_id = current_owner_id());
create policy "owner reads own bookings" on bookings for select to authenticated
  using (property_id in (select id from properties where owner_id = current_owner_id()));
create policy "owner reads own payouts" on payouts for select to authenticated using (owner_id = current_owner_id());
create policy "owner reads own reviews" on reviews for select to authenticated
  using (property_id in (select id from properties where owner_id = current_owner_id()));
create policy "owner reads own tickets" on maintenance_tickets for select to authenticated
  using (property_id in (select id from properties where owner_id = current_owner_id()));

-- Cleaners read their own jobs and the property basics for them. Door codes are
-- not in any readable table; a server action reveals them on the job day only.
create policy "cleaner reads own row" on cleaners for select to authenticated using (clerk_user_id = (auth.jwt() ->> 'sub'));
create policy "cleaner reads own jobs" on cleaning_jobs for select to authenticated using (cleaner_id = current_cleaner_id());
create policy "cleaner reads own job photos" on cleaning_photos for select to authenticated
  using (job_id in (select id from cleaning_jobs where cleaner_id = current_cleaner_id()));
create policy "cleaner reads job properties" on properties for select to authenticated
  using (id in (select property_id from cleaning_jobs where cleaner_id = current_cleaner_id()));
-- Writes (bookings, payouts, job status, moderation) happen server-side with the service role.

-- Security advisor hardening (applied to the live project 2026-10-03).
-- Trigger functions get a fixed search_path.
alter function payouts_touch() set search_path = public;
alter function sync_cleaning_job() set search_path = public;
-- The SECURITY DEFINER helpers used by the RLS policies above live in a schema
-- the Data API does not expose, so signed-in users cannot call them directly.
-- Policies reference functions by OID, so moving them keeps the policies intact.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;
alter function current_owner_id() set schema private;
alter function current_cleaner_id() set schema private;
