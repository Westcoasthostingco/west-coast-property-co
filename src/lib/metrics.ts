// Monthly metrics shared by the owner portal and admin so both see identical numbers.
// Stays are prorated across month boundaries by night.
import type { Booking, Owner, Property } from "./mock";
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

// ---- Fees ----
// Per guest stay the homeowner is charged, in integer cents:
//   percent fee = fee percent of the nights subtotal (only when the subtotal is recorded)
//   fixed fee   = fixed management fee per stay (always, for guest stays)
//   cleaning    = the stay's recorded cleaning fee, else the home's cleaning fee (always)
//   total fees  = percent fee + fixed fee + cleaning
// Gross is the nights subtotal only. Where it is recorded, net to owner = gross - percent fee
// - fixed fee. Cleaning is not part of gross: it passes through to cover the turnover, so it
// is shown beside net and never reduces it. iCal-imported stays usually carry no money, so
// they have no gross, percent fee or net, but the fixed fee and cleaning still apply. Owner
// stays and cancelled or pending stays carry no fees. The home's overrides
// (properties.fee_percent, properties.fixed_fee_cents) win over the owner's defaults.
// Shared by owner statements, admin pages and the CSV export so every surface agrees.
// Informational: Airbnb and Vrbo pay the homeowner, not this site.

// Per-home overrides; null means "use the owner's default".
export type FeeOverride = { feePercent: number | null; fixedFeeCents: number | null };
export type FeeOverrides = Record<string, FeeOverride>;

// The terms that apply to one home.
export type FeeTerms = { feePercent: number; fixedFeeCents: number; cleaningCents: number };

export function feeTerms(
  owner: Pick<Owner, "feePercent" | "fixedFeeCents"> | undefined,
  override: FeeOverride | undefined,
  property: Pick<Property, "cleaningFee"> | undefined,
): FeeTerms {
  return {
    feePercent: Number(override?.feePercent ?? owner?.feePercent ?? 0),
    fixedFeeCents: Math.round(override?.fixedFeeCents ?? owner?.fixedFeeCents ?? 0),
    cleaningCents: Math.round((property?.cleaningFee ?? 0) * 100),
  };
}

// Builds a propertyId -> FeeTerms lookup from the lists pages already load.
export function feeTermsLookup(properties: Property[], owners: Pick<Owner, "id" | "feePercent" | "fixedFeeCents">[], overrides: FeeOverrides) {
  return (propertyId: string): FeeTerms => {
    const p = properties.find((x) => x.id === propertyId);
    return feeTerms(owners.find((o) => o.id === p?.ownerId), overrides[propertyId], p);
  };
}

// "18% + $50/stay", "18%", "$50/stay"
export function feeTermsLabel(t: Pick<FeeTerms, "feePercent" | "fixedFeeCents">): string {
  const fixed = t.fixedFeeCents > 0 ? `${centsLabel(t.fixedFeeCents)}/stay` : "";
  if (t.feePercent > 0 && fixed) return `${t.feePercent}% + ${fixed}`;
  return fixed || `${t.feePercent}%`;
}

// Whole dollars when even, otherwise cents: "$50", "$49.50".
export const centsLabel = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: cents % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 });

export const isGuestStay = (b: Pick<Booking, "source" | "status">) => !isOwnerStay(b) && b.status !== "cancelled" && b.status !== "pending";

export type StayFees = {
  feePercent: number;
  grossCents: number | null;  // nights subtotal; null when not recorded
  percentFeeCents: number;    // 0 when gross is not recorded
  fixedFeeCents: number;
  cleaningCents: number;      // passed through to cover the turnover
  managementFeeCents: number; // percent + fixed: our fee
  totalFeesCents: number;     // percent + fixed + cleaning: everything charged to the homeowner
  netCents: number | null;    // gross - percent - fixed; null when gross is not recorded
};

// Fees for one stay, or null when the stay carries none (owner, cancelled or pending stay).
export function stayFees(b: Pick<Booking, "source" | "status" | "subtotal" | "total" | "cleaningFee">, terms: FeeTerms): StayFees | null {
  if (!isGuestStay(b)) return null;
  const grossCents = isRevenueStay(b) && b.subtotal != null ? Math.round(b.subtotal * 100) : null;
  const percentFeeCents = grossCents != null ? feeCents(grossCents, terms.feePercent) : 0;
  // A booking's own cleaning fee counts when it has money on file (or a non-zero fee was
  // recorded); otherwise, as for iCal imports, the home's cleaning fee applies.
  const ownCleaning = b.cleaningFee != null && (b.subtotal != null || b.cleaningFee > 0);
  const cleaningCents = ownCleaning ? Math.round((b.cleaningFee as number) * 100) : terms.cleaningCents;
  const fixedFeeCents = terms.fixedFeeCents;
  const managementFeeCents = percentFeeCents + fixedFeeCents;
  return {
    feePercent: terms.feePercent, grossCents, percentFeeCents, fixedFeeCents, cleaningCents, managementFeeCents,
    totalFeesCents: managementFeeCents + cleaningCents,
    netCents: grossCents != null ? grossCents - managementFeeCents : null,
  };
}

// The same figures in dollars for display (money()), converted once from cents.
export type StayMoney = {
  feePercent: number;
  gross: number | null;
  percentFee: number;
  fixedFee: number;
  cleaning: number;
  managementFee: number;
  totalFees: number;
  net: number | null;
};
export function stayMoney(b: Pick<Booking, "source" | "status" | "subtotal" | "total" | "cleaningFee">, terms: FeeTerms): StayMoney | null {
  const f = stayFees(b, terms);
  if (!f) return null;
  return {
    feePercent: f.feePercent, gross: f.grossCents == null ? null : f.grossCents / 100,
    percentFee: f.percentFeeCents / 100, fixedFee: f.fixedFeeCents / 100, cleaning: f.cleaningCents / 100,
    managementFee: f.managementFeeCents / 100, totalFees: f.totalFeesCents / 100, net: f.netCents == null ? null : f.netCents / 100,
  };
}
