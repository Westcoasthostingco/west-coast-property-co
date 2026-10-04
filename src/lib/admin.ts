// Admin back office: reads that need more than the shared data layer exposes,
// plus every write the management team can make. Server only (service role).
// Writes go through supabaseAdmin() when configured and log to audit_log;
// without Supabase they return a friendly "sample mode" result and change nothing.
import * as mock from "./mock";
import type { Booking, Owner, Property } from "./mock";
import { getAllProperties, getBookings, getFeeOverrides, getOwners } from "./data";
import { feeTermsLookup, stayFees } from "./metrics";
import { mockCleaners, mockJobs, type CleaningJob, type CleaningStatus } from "./cleaning";
import { supabaseAdmin, supabaseConfigured } from "./supabase";
import { nightsBetween, taxCents, todayISO } from "./dates";

type Row = Record<string, unknown>;
export type ActionResult = { ok: boolean; message: string; id?: string };

export const SAMPLE_MODE: ActionResult = { ok: false, message: "Sample mode: Supabase is not connected, so nothing was saved." };

export const BOOKING_SOURCES = ["direct", "airbnb", "vrbo", "booking_com", "owner", "manual"] as const;
export type BookingSourceKey = (typeof BOOKING_SOURCES)[number];
export const sourceLabel: Record<BookingSourceKey, Booking["source"]> = {
  direct: "Direct", airbnb: "Airbnb", vrbo: "Vrbo", booking_com: "Booking.com", owner: "Owner stay", manual: "Manual",
};
export const ICAL_SOURCES: BookingSourceKey[] = ["airbnb", "vrbo", "booking_com"];

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------
export async function audit(actor: string, action: string, entity: string, entityId: string | null, detail?: Record<string, unknown>) {
  if (!supabaseConfigured) return;
  await supabaseAdmin().from("audit_log").insert({ actor, action, entity, entity_id: entityId, detail: detail ?? null });
}

const dbError = (e: { code?: string; message: string } | null, fallback = "Something went wrong"): ActionResult => ({
  ok: false, message: e?.message ? `${fallback}: ${e.message}` : fallback,
});

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------
export type IcalFeed = { id?: string; propertyId: string; source: BookingSourceKey; url: string; lastSyncedAt: string | null; lastError: string | null };
export type PropertyPhoto = { id: string; path: string; url: string; alt: string | null; sortOrder: number };
export type PropertyDetail = Property & {
  address: string;
  postalCode: string;
  description: string;
  taxRateBps: number;
  feePercentOverride: number | null;
  fixedFeeCentsOverride: number | null; // properties.fixed_fee_cents; null = owner's fixed fee
  minNights: number;
  published: boolean;
  doorCode: string;
  seamDeviceId: string;
  defaultCleanerId: string | null;
  icalFeeds: IcalFeed[];
  photos: PropertyPhoto[];
};

const emptyDetail = (p: Property): PropertyDetail => ({
  ...p, address: "", postalCode: "", description: p.summary, taxRateBps: 0, feePercentOverride: null, fixedFeeCentsOverride: null, minNights: 2, airbnbUrl: p.airbnbUrl ?? "", vrboUrl: p.vrboUrl ?? "",
  published: true, doorCode: "", seamDeviceId: "", defaultCleanerId: p.id === "p3" ? "c2" : "c1", icalFeeds: [], photos: [],
});

export function photoUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base ? `${base}/storage/v1/object/public/property-photos/${path}` : path;
}

export async function getPropertyDetail(id: string): Promise<PropertyDetail | undefined> {
  if (!supabaseConfigured) {
    const p = mock.properties.find((x) => x.id === id);
    return p ? emptyDetail(p) : undefined;
  }
  const db = supabaseAdmin();
  const [{ data: p }, { data: integ }, { data: feeds }, { data: photos }, { data: listing }] = await Promise.all([
    db.from("properties").select("*").eq("id", id).maybeSingle(),
    db.from("property_integrations").select("*").eq("property_id", id).maybeSingle(),
    db.from("ical_feeds").select("*").eq("property_id", id),
    db.from("property_photos").select("*").eq("property_id", id).order("sort_order"),
    db.from("property_listings").select("rating, review_count").eq("id", id).maybeSingle(),
  ]);
  if (!p) return undefined;
  const r = p as Row;
  return {
    id: r.id as string, slug: r.slug as string, name: r.name as string, city: (r.city as string) ?? "", region: (r.region as string) ?? "",
    bedrooms: (r.bedrooms as number) ?? 0, bathrooms: Number(r.bathrooms ?? 0), guests: (r.max_guests as number) ?? 0,
    nightlyRate: (r.nightly_rate_cents as number) / 100, cleaningFee: ((r.cleaning_fee_cents as number) ?? 0) / 100,
    summary: (r.summary as string) ?? "", amenities: (r.amenities as string[]) ?? [], ownerId: r.owner_id as string, airbnbUrl: (r.airbnb_url as string) ?? "", vrboUrl: (r.vrbo_url as string) ?? "",
    rating: Number(listing?.rating ?? 0), reviewCount: (listing?.review_count as number) ?? 0,
    address: (r.address as string) ?? "", postalCode: (r.postal_code as string) ?? "", description: (r.description as string) ?? "",
    taxRateBps: (r.tax_rate_bps as number) ?? 0, feePercentOverride: r.fee_percent == null ? null : Number(r.fee_percent),
    fixedFeeCentsOverride: r.fixed_fee_cents == null ? null : Number(r.fixed_fee_cents),
    minNights: (r.min_nights as number) ?? 2, published: Boolean(r.published),
    tideStationId: (r.tide_station_id as string | null) ?? null,
    skiResort: r.ski_resort_name && r.ski_lat != null && r.ski_lng != null ? { name: r.ski_resort_name as string, lat: Number(r.ski_lat), lng: Number(r.ski_lng) } : null,
    doorCode: ((integ as Row | null)?.manual_door_code as string) ?? "", seamDeviceId: ((integ as Row | null)?.seam_device_id as string) ?? "",
    defaultCleanerId: ((integ as Row | null)?.default_cleaner_id as string | null) ?? null,
    icalFeeds: ((feeds ?? []) as Row[]).map(toFeed),
    photos: ((photos ?? []) as Row[]).map((x) => ({ id: x.id as string, path: x.storage_path as string, url: photoUrl(x.storage_path as string), alt: (x.alt as string) ?? null, sortOrder: (x.sort_order as number) ?? 0 })),
  };
}

const toFeed = (x: Row): IcalFeed => ({
  id: x.id as string, propertyId: x.property_id as string, source: x.source as BookingSourceKey, url: x.url as string,
  lastSyncedAt: (x.last_synced_at as string) ?? null, lastError: (x.last_error as string) ?? null,
});

export async function getAllIcalFeeds(): Promise<IcalFeed[]> {
  if (!supabaseConfigured) return [];
  const { data } = await supabaseAdmin().from("ical_feeds").select("*").order("property_id");
  return ((data ?? []) as Row[]).map(toFeed);
}

export type PropertyInput = {
  name: string; slug: string; city: string; region: string; address: string; postalCode: string; ownerId: string;
  bedrooms: number; bathrooms: number; maxGuests: number; nightlyRate: number; cleaningFee: number; taxRatePercent: number;
  minNights: number; feePercentOverride: number | null; fixedFeeOverride: number | null; amenities: string[]; summary: string; description: string; published: boolean; airbnbUrl: string; vrboUrl: string;
  icalUrls: Partial<Record<BookingSourceKey, string>>; doorCode: string; seamDeviceId: string; defaultCleanerId: string | null;
  tideStationId: string; skiResortName: string; skiLat: number | null; skiLng: number | null;
};

const num = (v: FormDataEntryValue | null, fallback = 0) => {
  const n = Number(String(v ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) && String(v ?? "").trim() !== "" ? n : fallback;
};
const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function propertyInputFromForm(fd: FormData): PropertyInput {
  const name = str(fd.get("name"));
  const feeRaw = str(fd.get("feePercentOverride"));
  const fixedRaw = str(fd.get("fixedFeeOverride"));
  const icalUrls: Partial<Record<BookingSourceKey, string>> = {};
  for (const s of ICAL_SOURCES) icalUrls[s] = str(fd.get(`ical_${s}`));
  return {
    name, slug: slugify(str(fd.get("slug")) || name), city: str(fd.get("city")), region: str(fd.get("region")) || "WA",
    address: str(fd.get("address")), postalCode: str(fd.get("postalCode")), ownerId: str(fd.get("ownerId")),
    bedrooms: num(fd.get("bedrooms")), bathrooms: num(fd.get("bathrooms")), maxGuests: num(fd.get("maxGuests"), 2),
    nightlyRate: num(fd.get("nightlyRate")), cleaningFee: num(fd.get("cleaningFee")), taxRatePercent: num(fd.get("taxRatePercent")),
    minNights: num(fd.get("minNights"), 2), feePercentOverride: feeRaw === "" ? null : num(fd.get("feePercentOverride")),
    fixedFeeOverride: fixedRaw === "" ? null : num(fd.get("fixedFeeOverride")),
    amenities: str(fd.get("amenities")).split(",").map((a) => a.trim()).filter(Boolean),
    summary: str(fd.get("summary")), description: str(fd.get("description")), published: fd.get("published") === "on", airbnbUrl: str(fd.get("airbnb_url")), vrboUrl: str(fd.get("vrbo_url")),
    icalUrls, doorCode: str(fd.get("doorCode")), seamDeviceId: str(fd.get("seamDeviceId")),
    defaultCleanerId: str(fd.get("defaultCleanerId")) || null,
    tideStationId: str(fd.get("tideStationId")), skiResortName: str(fd.get("skiResortName")),
    skiLat: str(fd.get("skiLat")) === "" ? null : num(fd.get("skiLat")), skiLng: str(fd.get("skiLng")) === "" ? null : num(fd.get("skiLng")),
  };
}

export function validateProperty(i: PropertyInput): string | null {
  if (!i.name) return "Name is required.";
  if (!i.slug) return "Slug is required.";
  if (!i.ownerId) return "Pick an owner.";
  if (i.nightlyRate <= 0) return "Nightly rate must be above zero.";
  if (i.feePercentOverride != null && (i.feePercentOverride < 0 || i.feePercentOverride > 100)) return "Fee override must be between 0 and 100%.";
  if (i.fixedFeeOverride != null && i.fixedFeeOverride < 0) return "Fixed fee override cannot be negative.";
  const ski = [i.skiResortName !== "", i.skiLat != null, i.skiLng != null];
  if (ski.some(Boolean) && !ski.every(Boolean)) return "Mountain conditions needs the resort name, latitude and longitude together (or leave all three blank).";
  return null;
}

export async function saveProperty(actor: string, id: string | null, input: PropertyInput): Promise<ActionResult> {
  const invalid = validateProperty(input);
  if (invalid) return { ok: false, message: invalid };
  if (!supabaseConfigured) return SAMPLE_MODE;
  const db = supabaseAdmin();
  const row = {
    name: input.name, slug: input.slug, city: input.city, region: input.region, address: input.address || null, postal_code: input.postalCode || null,
    owner_id: input.ownerId, bedrooms: input.bedrooms, bathrooms: input.bathrooms, max_guests: input.maxGuests,
    nightly_rate_cents: Math.round(input.nightlyRate * 100), cleaning_fee_cents: Math.round(input.cleaningFee * 100),
    tax_rate_bps: Math.round(input.taxRatePercent * 100), min_nights: input.minNights, fee_percent: input.feePercentOverride,
    fixed_fee_cents: input.fixedFeeOverride == null ? null : Math.round(input.fixedFeeOverride * 100),
    amenities: input.amenities, summary: input.summary || null, description: input.description || null, published: input.published, airbnb_url: input.airbnbUrl || null, vrbo_url: input.vrboUrl || null,
    tide_station_id: input.tideStationId || null, ski_resort_name: input.skiResortName || null, ski_lat: input.skiLat, ski_lng: input.skiLng,
  };
  let propertyId = id;
  if (propertyId) {
    const { error } = await db.from("properties").update(row).eq("id", propertyId);
    if (error) return dbError(error, error.code === "23505" ? "That slug is already in use" : "Could not save");
  } else {
    const { data, error } = await db.from("properties").insert(row).select("id").single();
    if (error || !data) return dbError(error, error?.code === "23505" ? "That slug is already in use" : "Could not create");
    propertyId = data.id as string;
  }
  const { error: integErr } = await db.from("property_integrations").upsert({
    property_id: propertyId, manual_door_code: input.doorCode || null, seam_device_id: input.seamDeviceId || null,
    default_cleaner_id: input.defaultCleanerId, updated_at: new Date().toISOString(),
  });
  if (integErr) return dbError(integErr, "Saved the home but not its door code or cleaner");
  for (const source of ICAL_SOURCES) {
    const url = input.icalUrls[source];
    if (url) await db.from("ical_feeds").upsert({ property_id: propertyId, source, url }, { onConflict: "property_id,source" });
    else await db.from("ical_feeds").delete().eq("property_id", propertyId).eq("source", source);
  }
  await audit(actor, id ? "property.update" : "property.create", "property", propertyId, { name: input.name, slug: input.slug });
  return { ok: true, message: id ? "Saved." : "Home created.", id: propertyId };
}

export async function uploadPropertyPhoto(actor: string, propertyId: string, file: File, alt: string): Promise<ActionResult> {
  if (!file || file.size === 0) return { ok: false, message: "Choose a photo first." };
  if (!file.type.startsWith("image/")) return { ok: false, message: "Only image files are accepted." };
  if (!supabaseConfigured) return SAMPLE_MODE;
  const db = supabaseAdmin();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${propertyId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await db.storage.from("property-photos").upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (upErr) return { ok: false, message: `Upload failed: ${upErr.message}` };
  const { count } = await db.from("property_photos").select("id", { count: "exact", head: true }).eq("property_id", propertyId);
  const { error } = await db.from("property_photos").insert({ property_id: propertyId, storage_path: path, alt: alt || null, sort_order: count ?? 0 });
  if (error) return dbError(error, "Uploaded but could not record the photo");
  await audit(actor, "property.photo.add", "property", propertyId, { path });
  return { ok: true, message: "Photo added." };
}

export async function deletePropertyPhoto(actor: string, photoId: string): Promise<ActionResult> {
  if (!supabaseConfigured) return SAMPLE_MODE;
  const db = supabaseAdmin();
  const { data } = await db.from("property_photos").select("property_id, storage_path").eq("id", photoId).maybeSingle();
  if (!data) return { ok: false, message: "Photo not found." };
  await db.storage.from("property-photos").remove([data.storage_path as string]);
  const { error } = await db.from("property_photos").delete().eq("id", photoId);
  if (error) return dbError(error, "Could not remove the photo");
  await audit(actor, "property.photo.remove", "property", data.property_id as string, { path: data.storage_path });
  return { ok: true, message: "Photo removed." };
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------
export type BookingDetail = Booking & {
  guestEmail: string | null; guestPhone: string | null; guestCount: number;
  cleaningFee: number; tax: number; notes: string | null;
  createdAt: string | null; cancelledAt: string | null;
};

const mockDetail = (b: Booking): BookingDetail => {
  const p = mock.properties.find((x) => x.id === b.propertyId);
  return { ...b, guestEmail: `${b.guest.toLowerCase().replace(/[^a-z]/g, "")}@example.com`, guestPhone: null, guestCount: 2,
    cleaningFee: p?.cleaningFee ?? 0, tax: 0, notes: null, createdAt: null, cancelledAt: null };
};

const toDetail = (r: Row): BookingDetail => {
  const today = todayISO();
  return {
    id: r.id as string, propertyId: r.property_id as string, guest: r.guest_name as string, checkIn: r.check_in as string, checkOut: r.check_out as string,
    source: sourceLabel[(r.source as BookingSourceKey) ?? "direct"] ?? "Direct",
    status: r.status === "confirmed" && (r.check_out as string) < today ? "completed" : (r.status as Booking["status"]),
    subtotal: r.subtotal_cents != null ? (r.subtotal_cents as number) / 100 : undefined, total: ((r.total_cents as number) ?? 0) / 100,
    guestEmail: (r.guest_email as string) ?? null, guestPhone: (r.guest_phone as string) ?? null, guestCount: (r.guest_count as number) ?? 1,
    cleaningFee: ((r.cleaning_fee_cents as number) ?? 0) / 100, tax: ((r.tax_cents as number) ?? 0) / 100, notes: (r.notes as string) ?? null,
    createdAt: (r.created_at as string) ?? null, cancelledAt: (r.cancelled_at as string) ?? null,
  };
};

export async function getBookingsDetailed(): Promise<BookingDetail[]> {
  if (!supabaseConfigured) return mock.bookings.map(mockDetail);
  const { data, error } = await supabaseAdmin().from("bookings").select("*").order("check_in", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(toDetail);
}

export async function getBookingDetail(id: string): Promise<BookingDetail | undefined> {
  if (!supabaseConfigured) {
    const b = mock.bookings.find((x) => x.id === id);
    return b ? mockDetail(b) : undefined;
  }
  const { data } = await supabaseAdmin().from("bookings").select("*").eq("id", id).maybeSingle();
  return data ? toDetail(data as Row) : undefined;
}

export async function addBookingNote(actor: string, bookingId: string, note: string): Promise<ActionResult> {
  if (!note.trim()) return { ok: false, message: "Write a note first." };
  if (!supabaseConfigured) return SAMPLE_MODE;
  const db = supabaseAdmin();
  const { data } = await db.from("bookings").select("notes").eq("id", bookingId).maybeSingle();
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const notes = [data?.notes, `[${stamp} ${actor}] ${note.trim()}`].filter(Boolean).join("\n");
  const { error } = await db.from("bookings").update({ notes }).eq("id", bookingId);
  if (error) return dbError(error, "Could not add the note");
  await audit(actor, "booking.note", "booking", bookingId, { note: note.trim() });
  return { ok: true, message: "Note added." };
}

export async function cancelBooking(actor: string, bookingId: string): Promise<ActionResult> {
  if (!supabaseConfigured) return SAMPLE_MODE;
  const db = supabaseAdmin();
  const { error } = await db.from("bookings").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", bookingId).in("status", ["pending", "confirmed"]);
  if (error) return dbError(error, "Could not cancel");
  await db.from("cleaning_jobs").update({ status: "skipped" }).eq("booking_id", bookingId).in("status", ["unassigned", "assigned"]);
  await audit(actor, "booking.cancel", "booking", bookingId);
  return { ok: true, message: "Stay cancelled here and the turnover skipped. Cancel it on Airbnb or Vrbo too if it was booked there." };
}

export type ManualBookingInput = {
  propertyId: string; guest: string; guestEmail: string; guestPhone: string; guestCount: number;
  checkIn: string; checkOut: string; source: BookingSourceKey; nightlyRate: number | null; notes: string;
};

export function manualBookingFromForm(fd: FormData): ManualBookingInput {
  const rateRaw = str(fd.get("nightlyRate"));
  const source = str(fd.get("source")) as BookingSourceKey;
  return {
    propertyId: str(fd.get("propertyId")), guest: str(fd.get("guest")), guestEmail: str(fd.get("guestEmail")), guestPhone: str(fd.get("guestPhone")),
    guestCount: num(fd.get("guestCount"), 1), checkIn: str(fd.get("checkIn")), checkOut: str(fd.get("checkOut")),
    source: BOOKING_SOURCES.includes(source) ? source : "manual", nightlyRate: rateRaw === "" ? null : num(fd.get("nightlyRate")), notes: str(fd.get("notes")),
  };
}

export async function createManualBooking(actor: string, input: ManualBookingInput): Promise<ActionResult> {
  if (!input.propertyId) return { ok: false, message: "Pick a home." };
  if (!input.guest) return { ok: false, message: "Guest name is required." };
  if (!input.checkIn || !input.checkOut || input.checkOut <= input.checkIn) return { ok: false, message: "Check-out must be after check-in." };
  const nights = nightsBetween(input.checkIn, input.checkOut);
  if (!supabaseConfigured) return SAMPLE_MODE;
  const db = supabaseAdmin();
  const { data: p } = await db.from("properties").select("owner_id, nightly_rate_cents, cleaning_fee_cents, tax_rate_bps, fee_percent, owners(fee_percent)")
    .eq("id", input.propertyId).maybeSingle();
  if (!p) return { ok: false, message: "That home no longer exists." };
  const ownerStay = input.source === "owner";
  const rateCents = ownerStay ? 0 : Math.round((input.nightlyRate ?? (p.nightly_rate_cents as number) / 100) * 100);
  const subtotal = rateCents * nights;
  const cleaning = ownerStay ? 0 : (p.cleaning_fee_cents as number);
  // Tax base: nights subtotal plus cleaning fee (recorded for statements; guests pay on the platform).
  const tax = ownerStay ? 0 : taxCents(subtotal + cleaning, p.tax_rate_bps as number);
  const { data: b, error } = await db.from("bookings").insert({
    property_id: input.propertyId, guest_name: input.guest, guest_email: input.guestEmail || null, guest_phone: input.guestPhone || null,
    guest_count: input.guestCount, check_in: input.checkIn, check_out: input.checkOut, source: input.source, status: "confirmed",
    subtotal_cents: subtotal, cleaning_fee_cents: cleaning, tax_cents: tax, total_cents: subtotal + cleaning + tax, notes: input.notes || null,
  }).select("id").single();
  if (error || !b) {
    if (error?.code === "23P01") return { ok: false, message: "Those dates overlap another stay at this home. Check the calendar and try again." };
    return dbError(error, "Could not create the booking");
  }
  // Turnover on the check-out day, pre-assigned to the home's default cleaner when one is set.
  const { data: integ } = await db.from("property_integrations").select("default_cleaner_id").eq("property_id", input.propertyId).maybeSingle();
  const cleanerId = (integ?.default_cleaner_id as string | null) ?? null;
  await db.from("cleaning_jobs").upsert({
    property_id: input.propertyId, booking_id: b.id, scheduled_date: input.checkOut, window_start: "11:00", window_end: "16:00",
    cleaner_id: cleanerId, status: cleanerId ? "assigned" : "unassigned", checklist: [],
  }, { onConflict: "booking_id", ignoreDuplicates: true });
  await audit(actor, "booking.create_manual", "booking", b.id as string, { source: input.source, check_in: input.checkIn, check_out: input.checkOut });
  return { ok: true, message: "Booking added.", id: b.id as string };
}

// ---------------------------------------------------------------------------
// Owners
// ---------------------------------------------------------------------------
export type OwnerDetail = Owner & { clerkUserId: string | null; createdAt: string | null };

export async function getOwnerDetail(id: string): Promise<OwnerDetail | undefined> {
  if (!supabaseConfigured) {
    const o = mock.owners.find((x) => x.id === id);
    return o ? { ...o, clerkUserId: null, createdAt: null } : undefined;
  }
  const { data } = await supabaseAdmin().from("owners").select("*").eq("id", id).maybeSingle();
  if (!data) return undefined;
  const r = data as Row;
  return { id: r.id as string, name: r.name as string, email: r.email as string, feePercent: Number(r.fee_percent),
    fixedFeeCents: Number(r.fixed_fee_cents ?? 0), clerkUserId: (r.clerk_user_id as string) ?? null, createdAt: (r.created_at as string) ?? null };
}

export type OwnerInput = { name: string; email: string; feePercent: number; fixedFee: number; clerkUserId: string | null }; // fixedFee in dollars
export const ownerInputFromForm = (fd: FormData): OwnerInput => ({
  name: str(fd.get("name")), email: str(fd.get("email")).toLowerCase(), feePercent: num(fd.get("feePercent"), 18), fixedFee: num(fd.get("fixedFee"), 0), clerkUserId: str(fd.get("clerkUserId")) || null,
});

export async function saveOwner(actor: string, id: string | null, input: OwnerInput): Promise<ActionResult> {
  if (!input.name) return { ok: false, message: "Name is required." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email)) return { ok: false, message: "Enter a valid email." };
  if (input.feePercent < 0 || input.feePercent > 100) return { ok: false, message: "Fee percent must be between 0 and 100." };
  if (input.fixedFee < 0) return { ok: false, message: "Fixed fee cannot be negative." };
  if (!supabaseConfigured) return SAMPLE_MODE;
  const db = supabaseAdmin();
  const row = { name: input.name, email: input.email, fee_percent: input.feePercent, fixed_fee_cents: Math.round(input.fixedFee * 100), clerk_user_id: input.clerkUserId };
  let ownerId = id;
  if (ownerId) {
    const { error } = await db.from("owners").update(row).eq("id", ownerId);
    if (error) return dbError(error, error.code === "23505" ? "That email or Clerk user is already linked to another owner" : "Could not save");
  } else {
    const { data, error } = await db.from("owners").insert(row).select("id").single();
    if (error || !data) return dbError(error, error?.code === "23505" ? "That email is already an owner" : "Could not create");
    ownerId = data.id as string;
  }
  await audit(actor, id ? "owner.update" : "owner.create", "owner", ownerId, { email: input.email, fee_percent: input.feePercent, fixed_fee_cents: Math.round(input.fixedFee * 100) });
  return { ok: true, message: id ? "Saved." : "Owner created.", id: ownerId };
}

// ---------------------------------------------------------------------------
// Cleaning
// ---------------------------------------------------------------------------
export async function assignCleaner(actor: string, jobId: string, cleanerId: string | null): Promise<ActionResult> {
  if (!supabaseConfigured) return SAMPLE_MODE;
  const db = supabaseAdmin();
  const { data: job } = await db.from("cleaning_jobs").select("status").eq("id", jobId).maybeSingle();
  if (!job) return { ok: false, message: "Job not found." };
  const status: CleaningStatus = job.status === "done" || job.status === "skipped" || job.status === "in_progress" ? job.status : cleanerId ? "assigned" : "unassigned";
  const { error } = await db.from("cleaning_jobs").update({ cleaner_id: cleanerId, status }).eq("id", jobId);
  if (error) return dbError(error, "Could not assign");
  await audit(actor, "cleaning.assign", "cleaning_job", jobId, { cleaner_id: cleanerId });
  return { ok: true, message: cleanerId ? "Cleaner assigned." : "Cleaner removed." };
}

export async function setJobStatus(actor: string, jobId: string, status: CleaningStatus): Promise<ActionResult> {
  if (!supabaseConfigured) return SAMPLE_MODE;
  const db = supabaseAdmin();
  const patch: Row = { status };
  if (status === "done") {
    const { data: job } = await db.from("cleaning_jobs").select("cleaner_id, cost_cents, cleaners(pay_rate_cents)").eq("id", jobId).maybeSingle();
    const rate = (job?.cleaners as unknown as { pay_rate_cents: number } | null)?.pay_rate_cents;
    patch.completed_at = new Date().toISOString();
    if (job && job.cost_cents == null && rate != null) patch.cost_cents = rate;
  }
  const { error } = await db.from("cleaning_jobs").update(patch).eq("id", jobId);
  if (error) return dbError(error, "Could not update");
  await audit(actor, "cleaning.status", "cleaning_job", jobId, { status });
  return { ok: true, message: "Job updated." };
}

export const cleanerName = (id: string | null | undefined, cleaners: { id: string; name: string }[]) =>
  id ? cleaners.find((c) => c.id === id)?.name ?? "Unknown" : "Unassigned";

export const jobsInRange = (jobs: CleaningJob[], from: string, to: string) => jobs.filter((j) => j.scheduledDate >= from && j.scheduledDate <= to);

// Keep the mock fixtures reachable for pages that need a cleaner list without a DB.
export { mockCleaners, mockJobs };

// ---------------------------------------------------------------------------
// Maintenance
// ---------------------------------------------------------------------------
export async function getOpenMaintenanceCount(): Promise<number> {
  if (!supabaseConfigured) return 0;
  const { count } = await supabaseAdmin().from("maintenance_tickets").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]);
  return count ?? 0;
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export async function setReviewPublished(actor: string, reviewId: string, published: boolean): Promise<ActionResult> {
  if (!supabaseConfigured) return SAMPLE_MODE;
  const { error } = await supabaseAdmin().from("reviews").update({ published }).eq("id", reviewId);
  if (error) return dbError(error, "Could not update the review");
  await audit(actor, published ? "review.publish" : "review.unpublish", "review", reviewId);
  return { ok: true, message: published ? "Review published." : "Review hidden." };
}

// ---------------------------------------------------------------------------
// Integrations status (presence only; values are never read into the UI)
// ---------------------------------------------------------------------------
export type IntegrationStatus = { name: string; purpose: string; vars: { name: string; present: boolean }[]; configured: boolean };
const present = (name: string) => Boolean(process.env[name]);
export function integrationStatuses(): IntegrationStatus[] {
  const def: [string, string, string[]][] = [
    ["Clerk", "Sign-in and roles", ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY", "CLERK_WEBHOOK_SIGNING_SECRET"]],
    ["Supabase", "Database and photo storage", ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]],
    ["Resend", "Email: confirmations, statements", ["RESEND_API_KEY", "EMAIL_FROM"]],
    ["Twilio", "SMS reminders to guests and cleaners", ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"]],
    ["Seam", "Smart lock codes", ["SEAM_API_KEY"]],
    ["Mapbox", "Maps on listings", ["NEXT_PUBLIC_MAPBOX_TOKEN"]],
    ["Turnstile", "Contact form spam protection", ["NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"]],
    ["QuickBooks", "Accounting sync (after launch)", ["QUICKBOOKS_CLIENT_ID", "QUICKBOOKS_CLIENT_SECRET"]],
    ["Vercel Cron", "Daily iCal sync and hold sweep", ["CRON_SECRET"]],
  ];
  return def.map(([name, purpose, vars]) => {
    const v = vars.map((n) => ({ name: n, present: present(n) }));
    return { name, purpose, vars: v, configured: v.every((x) => x.present) };
  });
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------
const csvCell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const csvLine = (cells: unknown[]) => cells.map(csvCell).join(",") + "\n";

export async function* bookingsCsv(from: string, to: string): AsyncGenerator<string> {
  const [bookings, props, owners, overrides] = await Promise.all([getBookingsDetailed(), getAllProperties(), getOwners(), getFeeOverrides()]);
  const name = (id: string) => props.find((p) => p.id === id)?.name ?? id;
  const ownerOf = (id: string) => owners.find((o) => o.id === props.find((p) => p.id === id)?.ownerId);
  const termsFor = feeTermsLookup(props, owners, overrides);
  const usd = (cents: number | null | undefined) => (cents == null ? "" : (cents / 100).toFixed(2));
  // guest_* columns are what was recorded on the booking; the fee columns are what the
  // homeowner is charged (shared math in metrics.ts). owner_net is blank without a recorded subtotal.
  yield csvLine(["id", "property", "owner", "guest", "email", "check_in", "check_out", "nights", "source", "status",
    "guest_subtotal", "guest_cleaning_fee", "guest_tax", "guest_total", "fee_percent", "percent_fee", "fixed_fee", "cleaning_fee", "total_fees", "owner_net"]);
  for (const b of bookings) {
    if (b.checkIn < from || b.checkIn > to) continue;
    const owner = ownerOf(b.propertyId);
    // Blank fee columns: owner, cancelled or pending stays (no fees).
    const f = stayFees(b, termsFor(b.propertyId));
    yield csvLine([b.id, name(b.propertyId), owner?.name ?? "", b.guest, b.guestEmail, b.checkIn, b.checkOut, nightsBetween(b.checkIn, b.checkOut), b.source, b.status,
      b.subtotal != null ? b.subtotal.toFixed(2) : "", b.cleaningFee.toFixed(2), b.tax.toFixed(2), b.total.toFixed(2),
      f ? f.feePercent : "", f && f.grossCents != null ? usd(f.percentFeeCents) : "", usd(f?.fixedFeeCents), usd(f?.cleaningCents), usd(f?.totalFeesCents), usd(f?.netCents)]);
  }
}

// ---------------------------------------------------------------------------
// Small shared helpers for pages
// ---------------------------------------------------------------------------
export const addDays = (iso: string, n: number) => {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const fmtDate = (iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) =>
  iso ? new Date(iso.slice(0, 10) + "T00:00:00Z").toLocaleDateString("en-US", { ...opts, timeZone: "UTC" }) : "";
export const fmtDateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" }) : "";
export { getBookings, nightsBetween, todayISO };
