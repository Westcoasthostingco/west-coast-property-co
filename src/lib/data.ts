// Data layer. Reads from Supabase when configured, otherwise from the sample
// data in mock.ts so the site runs locally and in previews without keys.
import * as mock from "./mock";
import { supabaseAdmin, supabaseConfigured, supabaseForUser } from "./supabase";

export type { Property, Owner, Booking, Review, Payout } from "./mock";
export { money } from "./mock";
import type { Property, Owner, Booking, Review, Payout } from "./mock";

type Client = ReturnType<typeof supabaseAdmin>;

// Row mappers: the database stores money in cents and snake_case columns.
const toProperty = (r: Record<string, unknown>): Property => ({
  id: r.id as string,
  slug: r.slug as string,
  name: r.name as string,
  city: (r.city as string) ?? "",
  region: (r.region as string) ?? "",
  bedrooms: (r.bedrooms as number) ?? 0,
  bathrooms: Number(r.bathrooms ?? 0),
  guests: (r.max_guests as number) ?? 0,
  nightlyRate: (r.nightly_rate_cents as number) / 100,
  cleaningFee: (r.cleaning_fee_cents as number) / 100,
  summary: (r.summary as string) ?? "",
  amenities: (r.amenities as string[]) ?? [],
  ownerId: r.owner_id as string,
  rating: Number(r.rating ?? 0),
  reviewCount: (r.review_count as number) ?? 0,
  airbnbUrl: (r.airbnb_url as string | null) ?? null,
  taxRateBps: (r.tax_rate_bps as number) ?? 0,
  minNights: (r.min_nights as number) ?? 2,
  tideStationId: (r.tide_station_id as string | null) ?? null,
  skiResort: r.ski_resort_name && r.ski_lat != null && r.ski_lng != null
    ? { name: r.ski_resort_name as string, lat: Number(r.ski_lat), lng: Number(r.ski_lng) }
    : null,
});

const toOwner = (r: Record<string, unknown>): Owner => ({
  id: r.id as string,
  name: r.name as string,
  email: r.email as string,
  payoutsReady: Boolean(r.payouts_enabled),
  feePercent: Number(r.fee_percent),
});

const sources: Record<string, Booking["source"]> = {
  direct: "Direct", airbnb: "Airbnb", vrbo: "Vrbo", booking_com: "Booking.com", owner: "Owner stay", manual: "Manual",
};
const today = () => new Date().toISOString().slice(0, 10);

const toBooking = (r: Record<string, unknown>): Booking => ({
  id: r.id as string,
  propertyId: r.property_id as string,
  guest: r.guest_name as string,
  checkIn: r.check_in as string,
  checkOut: r.check_out as string,
  source: sources[r.source as string] ?? "Direct",
  // 'completed' is derived: a confirmed stay whose check-out has passed
  status: r.status === "confirmed" && (r.check_out as string) < today() ? "completed" : (r.status as Booking["status"]),
  subtotal: r.subtotal_cents != null ? (r.subtotal_cents as number) / 100 : undefined,
  total: ((r.total_cents as number) ?? 0) / 100,
});

const toReview = (r: Record<string, unknown>): Review => ({
  id: r.id as string,
  propertyId: r.property_id as string,
  guest: r.guest_name as string,
  rating: r.rating as number,
  body: (r.body as string) ?? "",
  status: r.published ? "published" : "pending",
});

const toPayout = (r: Record<string, unknown>): Payout => ({
  id: r.id as string,
  ownerId: r.owner_id as string,
  bookingId: r.booking_id as string,
  gross: (r.gross_cents as number) / 100,
  fee: (r.fee_cents as number) / 100,
  net: (r.net_cents as number) / 100,
  status: r.status as Payout["status"],
  releaseOn: r.release_on as string,
});

type Query = ReturnType<ReturnType<Client["from"]>["select"]>;

async function rows(client: Client, table: string, filter?: (q: Query) => Query) {
  let q = client.from(table).select("*");
  if (filter) q = filter(q);
  const { data, error } = await q;
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []) as Record<string, unknown>[];
}

// ---- Public (anon client; RLS limits to published rows) ----

export async function getProperties(): Promise<Property[]> {
  if (!supabaseConfigured) return mock.properties;
  return (await rows(supabaseForUser(), "property_listings")).map(toProperty);
}

export async function getProperty(slug: string): Promise<Property | undefined> {
  if (!supabaseConfigured) return mock.properties.find((p) => p.slug === slug);
  const r = await rows(supabaseForUser(), "property_listings", (q) => q.eq("slug", slug));
  return r[0] ? toProperty(r[0]) : undefined;
}

export async function getPublishedReviews(propertyId: string): Promise<Review[]> {
  if (!supabaseConfigured) return mock.reviews.filter((r) => r.propertyId === propertyId && r.status === "published");
  return (await rows(supabaseForUser(), "reviews", (q) => q.eq("property_id", propertyId).eq("published", true))).map(toReview);
}

export type Stay = { propertyId: string; checkIn: string; checkOut: string };
export async function getUnavailableDates(propertyId?: string): Promise<Stay[]> {
  if (!supabaseConfigured) {
    return mock.bookings
      .filter((b) => (b.status === "pending" || b.status === "confirmed") && (!propertyId || b.propertyId === propertyId))
      .map((b) => ({ propertyId: b.propertyId, checkIn: b.checkIn, checkOut: b.checkOut }));
  }
  const r = await rows(supabaseForUser(), "property_unavailable_dates", (q) => (propertyId ? q.eq("property_id", propertyId) : q));
  return r.map((x) => ({ propertyId: x.property_id as string, checkIn: x.check_in as string, checkOut: x.check_out as string }));
}

// ---- Owner portal (user client; RLS scopes to the signed-in owner) ----

export async function getOwnerForClerkUser(clerkUserId: string): Promise<Owner | undefined> {
  if (!supabaseConfigured) return mock.owners[0]; // demo owner
  const r = await rows(supabaseForUser(), "owners", (q) => q.eq("clerk_user_id", clerkUserId));
  return r[0] ? toOwner(r[0]) : undefined;
}

export async function getOwnerDashboard(owner: Owner) {
  if (!supabaseConfigured) {
    const props = mock.properties.filter((p) => p.ownerId === owner.id);
    const ids = new Set(props.map((p) => p.id));
    return {
      properties: props,
      bookings: mock.bookings.filter((b) => ids.has(b.propertyId)),
      payouts: mock.payouts.filter((x) => x.ownerId === owner.id),
    };
  }
  const db = supabaseForUser();
  const properties = (await rows(db, "property_listings", (q) => q.eq("owner_id", owner.id))).map(toProperty);
  const ids = properties.map((p) => p.id);
  const [bookings, payouts] = await Promise.all([
    ids.length ? rows(db, "bookings", (q) => q.in("property_id", ids).order("check_in")) : [],
    rows(db, "payouts", (q) => q.eq("owner_id", owner.id).order("release_on")),
  ]);
  return { properties, bookings: bookings.map(toBooking), payouts: payouts.map(toPayout) };
}

// ---- Admin (service role; server only) ----

export async function getAllProperties(): Promise<Property[]> {
  if (!supabaseConfigured) return mock.properties;
  return (await rows(supabaseAdmin(), "property_listings")).map(toProperty);
}
export async function getOwners(): Promise<Owner[]> {
  if (!supabaseConfigured) return mock.owners;
  return (await rows(supabaseAdmin(), "owners", (q) => q.order("name"))).map(toOwner);
}
export async function getBookings(): Promise<Booking[]> {
  if (!supabaseConfigured) return mock.bookings;
  return (await rows(supabaseAdmin(), "bookings", (q) => q.order("check_in", { ascending: false }))).map(toBooking);
}
export async function getReviews(): Promise<Review[]> {
  if (!supabaseConfigured) return mock.reviews;
  return (await rows(supabaseAdmin(), "reviews", (q) => q.order("created_at", { ascending: false }))).map(toReview);
}
export async function getPayouts(): Promise<Payout[]> {
  if (!supabaseConfigured) return mock.payouts;
  return (await rows(supabaseAdmin(), "payouts", (q) => q.order("release_on", { ascending: false }))).map(toPayout);
}

// Lookup helpers for tables that join by id.
export const nameMap = <T extends { id: string; name: string }>(list: T[]) =>
  (id: string) => list.find((x) => x.id === id)?.name ?? id;
