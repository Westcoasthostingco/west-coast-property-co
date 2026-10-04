// Monthly metrics shared by the owner portal and admin so both see identical numbers.
// Stays are prorated across month boundaries by night.
import type { Booking, Property } from "./mock";
import { feeCents } from "./dates";

export type MonthMetric = {
  month: string;          // YYYY-MM
  nightsBooked: number;   // guest nights (direct, manual and channel); owner stays excluded
  nightsAvailable: number;
  occupancy: number;      // 0..1
  revenue: number;        // USD, nights subtotal of paid guest stays only (owner-side gross)
  adr: number;            // average daily rate, USD, over nights with known revenue
  channelNights: number;  // nights from iCal imports with no money on file (revenue unknown, counted as 0)
};

const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const monthKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

export function lastMonths(n: number, from = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(monthKey(new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() - i, 1))));
  return out;
}

// Owner stays and channel blocks ("Airbnb (Not available)") are not revenue. Only a
// stay with a nights subtotal (or a positive total) on file counts; everything else
// is a block whose money we do not know, so it contributes nights but $0.
export const isOwnerStay = (b: Pick<Booking, "source">) => b.source === "Owner stay";
export const isRevenueStay = (b: Pick<Booking, "source" | "status" | "subtotal" | "total">) =>
  !isOwnerStay(b) && b.status !== "cancelled" && b.status !== "pending" && ((b.subtotal ?? 0) > 0 || (b.subtotal == null && b.total > 0));

export function monthlyMetrics(bookings: Booking[], properties: Property[], months: string[]): MonthMetric[] {
  const propCount = Math.max(properties.length, 1);
  return months.map((month) => {
    const [y, m] = month.split("-").map(Number);
    const days = daysInMonth(y, m - 1);
    let nights = 0, revenueNights = 0, channelNights = 0, revenue = 0;
    for (const b of bookings) {
      if (b.status === "cancelled" || b.status === "pending" || isOwnerStay(b)) continue;
      const start = new Date(b.checkIn + "T00:00:00Z"), end = new Date(b.checkOut + "T00:00:00Z");
      const nightsTotal = Math.round((+end - +start) / 86_400_000);
      const paid = isRevenueStay(b);
      const perNight = paid && nightsTotal > 0 ? (b.subtotal ?? b.total) / nightsTotal : 0;
      for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
        if (monthKey(d) !== month) continue;
        nights += 1;
        if (paid) { revenueNights += 1; revenue += perNight; } else channelNights += 1;
      }
    }
    const available = days * propCount;
    return {
      month, nightsBooked: nights, nightsAvailable: available, occupancy: available ? nights / available : 0,
      revenue: Math.round(revenue), adr: revenueNights ? Math.round(revenue / revenueNights) : 0, channelNights,
    };
  });
}

export const monthLabel = (month: string) => new Date(month + "-01T00:00:00Z").toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });

// Owner/management split of a stay's recorded nights money, in integer cents, shared by
// owner statements and the admin dashboard and accounting pages so every surface agrees.
// The property's fee override wins over the owner's default. Gross is the nights
// subtotal only. Informational: Airbnb and Vrbo pay the homeowner, not this site.
export type FeeSplit = { grossCents: number; feeCents: number; netCents: number; feePercent: number };
export function feeSplit(grossCents: number, propertyFeePercent: number | null | undefined, ownerFeePercent: number): FeeSplit {
  const feePercent = Number(propertyFeePercent ?? ownerFeePercent);
  const fee = feeCents(grossCents, feePercent);
  return { grossCents, feeCents: fee, netCents: grossCents - fee, feePercent };
}

// Money for one stay, in dollars, or null when nothing is recorded (an iCal-imported
// channel stay, an owner stay, or a cancelled or pending one). Built on feeSplit.
export type StayMoney = { gross: number; fee: number; net: number; cleaning: number; feePercent: number };
export function stayMoney(
  b: Pick<Booking, "source" | "status" | "subtotal" | "total" | "cleaningFee">,
  propertyFeePercent: number | null | undefined,
  ownerFeePercent: number,
): StayMoney | null {
  if (!isRevenueStay(b) || b.subtotal == null) return null;
  const split = feeSplit(Math.round(b.subtotal * 100), propertyFeePercent, ownerFeePercent);
  return {
    gross: split.grossCents / 100, fee: split.feeCents / 100, net: split.netCents / 100,
    cleaning: b.cleaningFee ?? 0, feePercent: split.feePercent,
  };
}
