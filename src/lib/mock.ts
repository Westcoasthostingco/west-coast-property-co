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
  airbnbUrl?: string | null;
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
  subtotal?: number; // nights only
  total: number;
};

export type Review = { id: string; propertyId: string; guest: string; rating: number; body: string; status: "published" | "pending" };

export type Payout = { id: string; ownerId: string; bookingId: string; gross: number; fee: number; net: number; status: "scheduled" | "processing" | "paid" | "failed" | "reversed"; releaseOn: string };

export const owners: Owner[] = [
  { id: "o1", name: "Dana Whitfield", email: "dana@example.com", payoutsReady: true, feePercent: 18 },
  { id: "o2", name: "Marcus Lee", email: "marcus@example.com", payoutsReady: false, feePercent: 20 },
];

export const properties: Property[] = [
  { id: "p1", slug: "the-grand-view", name: "The Grand View", city: "Gig Harbor", region: "WA", bedrooms: 3, bathrooms: 2, guests: 6, nightlyRate: 325, cleaningFee: 150, summary: "Just steps from the shops, restaurants, and waterfront of downtown Gig Harbor, The Grand View offers stunning views of Puget Sound, Mount Rainier, and Gig Harbor itself.", amenities: ["Puget Sound views", "Walk to downtown", "Wi-Fi", "Full kitchen", "Deck", "Parking"], ownerId: "o1", rating: 4.9, reviewCount: 48, airbnbUrl: "https://www.airbnb.com/rooms/1669272090087857131" },
  { id: "p2", slug: "the-leonora-by-the-sea", name: "The Leonora by the Sea", city: "Hood Canal", region: "WA", bedrooms: 2, bathrooms: 2, guests: 5, nightlyRate: 285, cleaningFee: 135, summary: "Set on the shores of Hood Canal, The Leonora greets you with Olympic Mountain views, known for its oysters, and access to trails in Olympic National Park and the wider Olympic Peninsula.", amenities: ["Waterfront", "Olympic Mountain views", "Oyster beach", "Fire pit", "Wi-Fi", "Pet friendly"], ownerId: "o1", rating: 5.0, reviewCount: 36, airbnbUrl: "https://www.airbnb.com/rooms/1250729879856529802" },
  { id: "p3", slug: "the-bedrock", name: "The Bedrock", city: "Randle", region: "WA", bedrooms: 3, bathrooms: 2, guests: 7, nightlyRate: 240, cleaningFee: 140, summary: "Located in Randle and just minutes from Packwood, The Bedrock offers mountain air, quiet forest, and easy access to some of the best adventures the Cascades have to offer.", amenities: ["Mountain air", "Near Mount Rainier", "Hot tub", "Wood stove", "Wi-Fi", "EV charger"], ownerId: "o2", rating: 4.8, reviewCount: 22, airbnbUrl: "https://www.airbnb.com/rooms/1780528394795968142" },
];

// ~12 months of sample stays so trends have shape. Generated deterministically.
function sampleBookings(): Booking[] {
  const out: Booking[] = [];
  const guests = ["A. Rivera", "J. Chen", "S. Patel", "K. Morgan", "T. Nguyen", "M. Okafor", "L. Brooks", "R. Silva"];
  const sources: Booking["source"][] = ["Direct", "Airbnb", "Vrbo", "Direct", "Airbnb"];
  const today = new Date();
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  properties.forEach((p, pi) => {
    for (let m = 11; m >= -2; m--) {
      const base = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - m, 1));
      const month = base.getUTCMonth();
      const stays = month >= 5 && month <= 8 ? 4 : month === 11 || month === 0 ? 2 : 3; // summer peak
      let day = 1 + Math.floor(rnd() * 3);
      for (let k = 0; k < stays && day < 26; k++) {
        const nights = 2 + Math.floor(rnd() * 4);
        const checkIn = new Date(Date.UTC(base.getUTCFullYear(), month, day));
        const checkOut = new Date(Date.UTC(base.getUTCFullYear(), month, day + nights));
        const iso = (d: Date) => d.toISOString().slice(0, 10);
        const future = checkIn > today;
        const subtotal = nights * p.nightlyRate;
        out.push({
          id: `b${pi}${m + 2}${k}`, propertyId: p.id, guest: guests[Math.floor(rnd() * guests.length)],
          checkIn: iso(checkIn), checkOut: iso(checkOut), source: sources[Math.floor(rnd() * sources.length)],
          status: future ? (rnd() < 0.15 ? "pending" : "confirmed") : "completed",
          subtotal, total: subtotal + p.cleaningFee,
        });
        day += nights + 1 + Math.floor(rnd() * 3);
      }
    }
  });
  return out;
}
export const bookings: Booking[] = sampleBookings();

export const reviews: Review[] = [
  { id: "r1", propertyId: "p1", guest: "A. Rivera", rating: 5, body: "Woke up to Mount Rainier over the harbor. Christi and Melissa thought of everything.", status: "published" },
  { id: "r2", propertyId: "p3", guest: "S. Patel", rating: 5, body: "Quiet, cozy, and the hot tub after a day at Rainier was perfect.", status: "pending" },
];

// One payout per completed or confirmed sample stay, so statements line up with bookings.
export const payouts: Payout[] = bookings
  .filter((b) => b.status !== "pending" && b.status !== "cancelled")
  .map((b, i) => {
    const owner = owners.find((o) => o.id === properties.find((p) => p.id === b.propertyId)?.ownerId)!;
    const gross = b.subtotal ?? b.total;
    const fee = Math.round((gross * owner.feePercent) / 100);
    const release = new Date(b.checkIn + "T00:00:00Z"); release.setUTCDate(release.getUTCDate() + 1);
    const releaseOn = release.toISOString().slice(0, 10);
    return { id: `x${i}`, ownerId: owner.id, bookingId: b.id, gross, fee, net: gross - fee, status: releaseOn <= new Date().toISOString().slice(0, 10) ? "paid" : "scheduled", releaseOn };
  });

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
