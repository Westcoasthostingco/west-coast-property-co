// Sample data used when Supabase env vars are not set (local dev, previews).

export type Property = {
  id: string;
  slug: string;
  name: string;
  city: string;
  region: string;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  nightlyRate: number; // USD
  cleaningFee: number;
  summary: string;
  amenities: string[];
  ownerId: string;
  rating: number;
  reviewCount: number;
};

export type Owner = { id: string; name: string; email: string; payoutsReady: boolean; feePercent: number };

export type Booking = {
  id: string;
  propertyId: string;
  guest: string;
  checkIn: string;
  checkOut: string;
  source: "Direct" | "Airbnb" | "Vrbo" | "Booking.com" | "Owner stay" | "Manual";
  status: "confirmed" | "pending" | "completed" | "cancelled";
  total: number;
};

export type Review = { id: string; propertyId: string; guest: string; rating: number; body: string; status: "published" | "pending" };

export type Payout = { id: string; ownerId: string; bookingId: string; gross: number; fee: number; net: number; status: "scheduled" | "processing" | "paid" | "failed" | "reversed"; releaseOn: string };

export const owners: Owner[] = [
  { id: "o1", name: "Dana Whitfield", email: "dana@example.com", payoutsReady: true, feePercent: 18 },
  { id: "o2", name: "Marcus Lee", email: "marcus@example.com", payoutsReady: false, feePercent: 20 },
];

export const properties: Property[] = [
  { id: "p1", slug: "pacific-bluff-cottage", name: "Pacific Bluff Cottage", city: "Pismo Beach", region: "CA", bedrooms: 2, bathrooms: 2, guests: 5, nightlyRate: 285, cleaningFee: 120, summary: "Ocean-view cottage a short walk from the sand, with a fire pit and outdoor shower.", amenities: ["Ocean view", "Fire pit", "Wi-Fi", "Pet friendly", "Smart lock"], ownerId: "o1", rating: 4.9, reviewCount: 42 },
  { id: "p2", slug: "harbor-loft", name: "Harbor Loft", city: "San Diego", region: "CA", bedrooms: 1, bathrooms: 1, guests: 3, nightlyRate: 210, cleaningFee: 85, summary: "Bright downtown loft steps from the waterfront, dining and transit.", amenities: ["Walkable", "Wi-Fi", "Washer/dryer", "Smart lock"], ownerId: "o1", rating: 4.7, reviewCount: 28 },
  { id: "p3", slug: "redwood-retreat", name: "Redwood Retreat", city: "Santa Cruz", region: "CA", bedrooms: 3, bathrooms: 2, guests: 7, nightlyRate: 340, cleaningFee: 150, summary: "Family-sized cabin among the redwoods with a hot tub and game room.", amenities: ["Hot tub", "Game room", "Wi-Fi", "EV charger"], ownerId: "o2", rating: 4.8, reviewCount: 19 },
];

export const bookings: Booking[] = [
  { id: "b1", propertyId: "p1", guest: "A. Rivera", checkIn: "2026-10-09", checkOut: "2026-10-13", source: "Direct", status: "confirmed", total: 1260 },
  { id: "b2", propertyId: "p2", guest: "J. Chen", checkIn: "2026-10-04", checkOut: "2026-10-07", source: "Airbnb", status: "confirmed", total: 715 },
  { id: "b3", propertyId: "p3", guest: "S. Patel", checkIn: "2026-09-20", checkOut: "2026-09-25", source: "Vrbo", status: "completed", total: 1850 },
  { id: "b4", propertyId: "p1", guest: "K. Morgan", checkIn: "2026-11-02", checkOut: "2026-11-05", source: "Direct", status: "pending", total: 975 },
];

export const reviews: Review[] = [
  { id: "r1", propertyId: "p1", guest: "A. Rivera", rating: 5, body: "Spotless, great location, and check-in was effortless.", status: "published" },
  { id: "r2", propertyId: "p3", guest: "S. Patel", rating: 5, body: "Perfect for the whole family. The hot tub was a hit.", status: "pending" },
];

export const payouts: Payout[] = [
  { id: "x1", ownerId: "o2", bookingId: "b3", gross: 1850, fee: 370, net: 1480, status: "paid", releaseOn: "2026-09-26" },
  { id: "x2", ownerId: "o1", bookingId: "b2", gross: 715, fee: 129, net: 586, status: "scheduled", releaseOn: "2026-10-05" },
  { id: "x3", ownerId: "o1", bookingId: "b1", gross: 1260, fee: 227, net: 1033, status: "scheduled", releaseOn: "2026-10-10" },
];

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
