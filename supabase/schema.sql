-- West Coast Property Co: initial schema (Supabase / Postgres)
-- Auth is Clerk. Roles (admin/owner/cleaner) live in Clerk user publicMetadata.
-- Add Clerk as a third-party auth provider in Supabase so RLS can read the
-- Clerk user id from the session token: auth.jwt()->>'sub'.

create extension if not exists "pgcrypto";
create extension if not exists btree_gist;

create type booking_source as enum ('direct', 'airbnb', 'vrbo', 'booking_com');
create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type payout_status as enum ('scheduled', 'paid', 'failed');

create table owners (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique,          -- set when the owner's Clerk account is linked
  name text not null,
  email text not null,
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
  city text, region text,
  bedrooms int, bathrooms numeric(3,1), max_guests int,
  nightly_rate_cents int not null,
  cleaning_fee_cents int not null default 0,
  summary text,
  amenities text[] not null default '{}',
  ical_airbnb_url text, ical_vrbo_url text, ical_booking_url text,
  seam_device_id text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null,          -- Supabase Storage bucket: property-photos
  sort_order int not null default 0
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id),
  guest_name text not null,
  guest_email text,
  check_in date not null,
  check_out date not null,
  source booking_source not null default 'direct',
  status booking_status not null default 'pending',
  total_cents int not null,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  check (check_out > check_in),
  -- prevent double-booking of active stays
  exclude using gist (
    property_id with =,
    daterange(check_in, check_out) with &&
  ) where (status in ('pending', 'confirmed'))
);

create table payouts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id),
  booking_id uuid not null references bookings(id),
  gross_cents int not null,
  fee_cents int not null,
  net_cents int not null,
  release_on date not null,            -- typically check-in + 1 day
  status payout_status not null default 'scheduled',
  stripe_transfer_id text,
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

create table audit_log (
  id bigint generated always as identity primary key,
  actor text,
  action text not null,
  entity text, entity_id text,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- Listings with review aggregates, used by the public site and portals.
create view property_listings with (security_invoker = true) as
select p.*,
  coalesce(round(avg(r.rating) filter (where r.published), 1), 0) as rating,
  count(r.id) filter (where r.published) as review_count
from properties p
left join reviews r on r.property_id = p.id
group by p.id;

-- Row level security. Service-role (server only) bypasses RLS for admin tasks.
alter table owners enable row level security;
alter table properties enable row level security;
alter table property_photos enable row level security;
alter table bookings enable row level security;
alter table payouts enable row level security;
alter table reviews enable row level security;
alter table audit_log enable row level security;

create or replace function current_owner_id() returns uuid
language sql stable as $$
  select id from owners where clerk_user_id = (auth.jwt() ->> 'sub')
$$;

-- Public can read published listings and published reviews.
create policy "public read published properties" on properties for select using (published);
create policy "public read photos" on property_photos for select using (true);
create policy "public read published reviews" on reviews for select using (published);

-- Owners read only their own data.
create policy "owner reads own owner row" on owners for select using (id = current_owner_id());
create policy "owner reads own properties" on properties for select using (owner_id = current_owner_id());
create policy "owner reads own bookings" on bookings for select
  using (property_id in (select id from properties where owner_id = current_owner_id()));
create policy "owner reads own payouts" on payouts for select using (owner_id = current_owner_id());
create policy "owner reads own reviews" on reviews for select
  using (property_id in (select id from properties where owner_id = current_owner_id()));
-- Writes (bookings, payouts, moderation) happen server-side with the service role.
