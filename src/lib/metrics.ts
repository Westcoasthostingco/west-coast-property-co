// Monthly metrics shared by the owner portal and admin so both see identical numbers.
// Stays are prorated across month boundaries by night.
import type { Booking, Property } from "./mock";

export type MonthMetric = {
  month: string;          // YYYY-MM
  nightsBooked: number;
  nightsAvailable: number;
  occupancy: number;      // 0..1
  revenue: number;        // USD, nights subtotal (owner-side gross)
  adr: number;            // average daily rate, USD
};

const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const monthKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

export function lastMonths(n: number, from = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(monthKey(new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() - i, 1))));
  return out;
}

export function monthlyMetrics(bookings: Booking[], properties: Property[], months: string[]): MonthMetric[] {
  const propCount = Math.max(properties.length, 1);
  const rate = new Map(properties.map((p) => [p.id, p.nightlyRate]));
  return months.map((month) => {
    const [y, m] = month.split("-").map(Number);
    const days = daysInMonth(y, m - 1);
    let nights = 0, revenue = 0;
    for (const b of bookings) {
      if (b.status === "cancelled" || b.status === "pending") continue;
      // iterate nights of the stay that fall in this month
      const start = new Date(b.checkIn + "T00:00:00Z"), end = new Date(b.checkOut + "T00:00:00Z");
      const nightsTotal = Math.round((+end - +start) / 86_400_000);
      const perNight = b.total > 0 && nightsTotal > 0 ? (b.subtotal ?? b.total) / nightsTotal : (rate.get(b.propertyId) ?? 0);
      for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
        if (monthKey(d) === month) { nights += 1; revenue += perNight; }
      }
    }
    const available = days * propCount;
    return { month, nightsBooked: nights, nightsAvailable: available, occupancy: available ? nights / available : 0, revenue: Math.round(revenue), adr: nights ? Math.round(revenue / nights) : 0 };
  });
}

export const monthLabel = (month: string) => new Date(month + "-01T00:00:00Z").toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
