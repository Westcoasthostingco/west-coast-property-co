// Owner portal data helpers. Reads from Supabase when configured (user client,
// RLS scopes rows to the signed-in owner), otherwise from the sample data in
// mock.ts. Statement math lives here so every owner page agrees with itself.
import * as mock from "./mock";
import { requireRole } from "./auth";
import { getFeeOverrides, getOwnerDashboard, getOwnerForClerkUser, getPublishedReviews, type FeeOverrides } from "./data";
import type { Booking, Owner, Property, Review } from "./mock";
import { centsLabel, feeTerms, lastMonths, monthlyMetrics, stayFees, type FeeTerms, type MonthMetric } from "./metrics";
import { supabaseConfigured } from "./supabase";

export type { Booking, Owner, Property, Review };

export type OwnerData = {
  properties: Property[];
  bookings: Booking[];
  feeOverrides: FeeOverrides; // per-home fee percent and fixed fee overrides (null = owner default)
};

// Gate the page to the owner role and find the owner row for the signed-in
// user. Returns undefined when the login is not linked yet.
export async function loadOwner(): Promise<Owner | undefined> {
  const { userId } = await requireRole("owner");
  return getOwnerForClerkUser(userId);
}

// Everything the portal needs for one owner: their homes, every stay at those
// homes, and any per-home fee overrides for statements.
export async function getOwnerData(owner: Owner): Promise<OwnerData> {
  const [base, feeOverrides] = await Promise.all([getOwnerDashboard(owner), getFeeOverrides(owner.id)]);
  return { ...base, feeOverrides };
}

// Published reviews across all of an owner's homes.
export async function getOwnerReviews(propertyIds: string[]): Promise<Review[]> {
  if (!propertyIds.length) return [];
  if (!supabaseConfigured) {
    const ids = new Set(propertyIds);
    return mock.reviews.filter((r) => ids.has(r.propertyId) && r.status === "published");
  }
  const lists = await Promise.all(propertyIds.map((id) => getPublishedReviews(id)));
  return lists.flat();
}

// ---- Dates ----

export const todayIso = () => new Date().toISOString().slice(0, 10);
export const thisMonth = () => todayIso().slice(0, 7);

export const nightsBetween = (checkIn: string, checkOut: string) =>
  Math.max(0, Math.round((+new Date(checkOut + "T00:00:00Z") - +new Date(checkIn + "T00:00:00Z")) / 86_400_000));

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });

export const fmtRange = (checkIn: string, checkOut: string) => `${fmtDate(checkIn)} to ${fmtDate(checkOut)}`;

export const monthTitle = (month: string) =>
  new Date(month + "-01T00:00:00Z").toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

export const isMonthKey = (s: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(s);

// ---- Headline stats (this month vs last month) ----

export type Headline = {
  current: MonthMetric;
  previous: MonthMetric;
  revenueDelta: number;    // percent
  occupancyDelta: number;  // percentage points
  adrDelta: number;        // percent
  nightsDelta: number;     // nights
};

const pct = (now: number, before: number) => (before > 0 ? Math.round(((now - before) / before) * 100) : 0);

export function headline(bookings: Booking[], properties: Property[]): Headline {
  const [previous, current] = monthlyMetrics(bookings, properties, lastMonths(2));
  return {
    current,
    previous,
    revenueDelta: pct(current.revenue, previous.revenue),
    occupancyDelta: Math.round((current.occupancy - previous.occupancy) * 100),
    adrDelta: pct(current.adr, previous.adr),
    nightsDelta: current.nightsBooked - previous.nightsBooked,
  };
}

export const percent = (v: number) => `${Math.round(v * 100)}%`;

// Active stays that have not ended yet (in house now or arriving later), soonest first.
// 'completed' is derived from the check-out date, so it never appears here.
export function upcomingStays(bookings: Booking[], limit = 10): Booking[] {
  const today = todayIso();
  return bookings
    .filter((b) => b.checkOut > today && (b.status === "confirmed" || b.status === "pending"))
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, limit);
}

// ---- Statements ----
// Built from bookings. A stay belongs to the statement for the month it checks in.
// Trend charts prorate by night instead; the two views answer different questions
// and are labelled as such. Guests pay Airbnb or Vrbo, and the platform pays the
// homeowner on its own payout schedule under the Management Agreement, so these
// figures are a record of the stays, not money sent from this site.

export type StatementLine = {
  booking: Booking;
  propertyName: string;
  nights: number;
  recorded: boolean;   // false: no nights money on file (e.g. an iCal-imported channel stay)
  feePercent: number;  // the home's percent (override, else owner)
  gross: number;       // nights subtotal (0 when not recorded)
  percentFee: number;  // percent of gross (0 when not recorded)
  fixedFee: number;    // fixed management fee per stay
  cleaning: number;    // cleaning fee per stay, passed through to cover the turnover
  totalFees: number;   // percent fee + fixed fee + cleaning
  net: number;         // gross minus percent and fixed fee (0 when not recorded)
};

export type Statement = {
  month: string;
  lines: StatementLine[];
  stays: number;
  nights: number;
  recordedStays: number;
  gross: number;       // recorded stays only
  percentFee: number;  // recorded stays only
  fixedFee: number;    // every guest stay
  cleaning: number;    // every guest stay
  totalFees: number;
  net: number;         // recorded stays only
};

type FeeOwner = Pick<Owner, "feePercent" | "fixedFeeCents">;
const termsFor = (data: OwnerData, owner: FeeOwner, propertyId: string): FeeTerms =>
  feeTerms(owner, data.feeOverrides[propertyId], data.properties.find((p) => p.id === propertyId));

// Owner stays are not revenue and are left off, as are cancelled and pending stays.
// Every guest stay carries the fixed fee and cleaning; stays with a recorded nights
// subtotal also show gross, percent fee and net. Sums are taken in cents (metrics.ts).
export function statementFor(month: string, data: OwnerData, owner: FeeOwner): Statement {
  const names = new Map(data.properties.map((p) => [p.id, p.name]));
  const rows = data.bookings
    .filter((b) => b.checkIn.startsWith(month))
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .flatMap((b) => {
      const f = stayFees(b, termsFor(data, owner, b.propertyId));
      return f ? [{ b, f }] : [];
    });
  const sum = (pick: (f: NonNullable<ReturnType<typeof stayFees>>) => number) => rows.reduce((s, r) => s + pick(r.f), 0) / 100;
  const lines: StatementLine[] = rows.map(({ b, f }) => ({
    booking: b, propertyName: names.get(b.propertyId) ?? b.propertyId, nights: nightsBetween(b.checkIn, b.checkOut),
    recorded: f.grossCents != null, feePercent: f.feePercent, gross: (f.grossCents ?? 0) / 100, percentFee: f.percentFeeCents / 100,
    fixedFee: f.fixedFeeCents / 100, cleaning: f.cleaningCents / 100, totalFees: f.totalFeesCents / 100, net: (f.netCents ?? 0) / 100,
  }));
  return {
    month, lines, stays: lines.length, nights: lines.reduce((s, l) => s + l.nights, 0), recordedStays: lines.filter((l) => l.recorded).length,
    gross: sum((f) => f.grossCents ?? 0), percentFee: sum((f) => f.percentFeeCents), fixedFee: sum((f) => f.fixedFeeCents),
    cleaning: sum((f) => f.cleaningCents), totalFees: sum((f) => f.totalFeesCents), net: sum((f) => f.netCents ?? 0),
  };
}

export const statements = (data: OwnerData, owner: FeeOwner, months = lastMonths(12)) =>
  months.map((m) => statementFor(m, data, owner)).reverse(); // newest first

// Plain-English fee terms for the statement intros, from the owner's actual numbers:
// "Our fee is 18% of the nights subtotal plus $50 per stay; the cleaning fee of $150 per
// stay covers the turnover." Per-home overrides are mentioned generically.
export function feeSentence(data: OwnerData, owner: FeeOwner): string {
  const percent = Number(owner.feePercent), fixed = owner.fixedFeeCents;
  const fee = percent > 0 && fixed > 0 ? `${percent}% of the nights subtotal plus ${centsLabel(fixed)} per stay`
    : fixed > 0 ? `${centsLabel(fixed)} per stay` : `${percent}% of the nights subtotal`;
  const homes = data.properties;
  const cleanings = [...new Set(homes.map((p) => Math.round(p.cleaningFee * 100)))];
  const cleaning = cleanings.length === 1 ? `the cleaning fee of ${centsLabel(cleanings[0])} per stay covers the turnover`
    : homes.length ? `the cleaning fee per stay (${homes.map((p) => `${centsLabel(Math.round(p.cleaningFee * 100))} at ${p.name}`).join(", ")}) covers the turnover`
    : "the home's cleaning fee per stay covers the turnover";
  const overridden = homes.some((p) => {
    const o = data.feeOverrides[p.id];
    return (o?.feePercent != null && Number(o.feePercent) !== percent) || (o?.fixedFeeCents != null && o.fixedFeeCents !== fixed);
  });
  return `Our fee is ${fee}; ${cleaning}.${overridden ? " Some homes have their own fee terms, and each stay uses its home's terms." : ""}`;
}

// ---- Invoices ----
// There is no invoices table yet (architecture step 7). Repairs and supplies we
// handle are billed to the owner under the Management Agreement; these samples
// show the shape the page will take once invoices are stored.

export type InvoiceLine = { description: string; qty: number; unit: number };
export type Invoice = {
  id: string;
  ownerId: string;
  issuedOn: string;
  dueOn: string;
  status: "paid" | "open" | "overdue";
  total: number;
  lineItems: InvoiceLine[];
  note?: string;
};

const monthsAgo = (n: number, day: number) => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - n, day)).toISOString().slice(0, 10);
};

const withTotal = (inv: Omit<Invoice, "total">): Invoice => ({ ...inv, total: inv.lineItems.reduce((s, l) => s + l.qty * l.unit, 0) });

export const sampleInvoices = (ownerId: string): Invoice[] => [
  withTotal({ id: "inv-1041", ownerId, issuedOn: monthsAgo(0, 2), dueOn: monthsAgo(0, 16), status: "open",
    lineItems: [
      { description: "Replace deck light fixture (parts)", qty: 1, unit: 86 },
      { description: "Handyman visit", qty: 1.5, unit: 75 },
    ], note: "Billed under your Management Agreement." }),
  withTotal({ id: "inv-1033", ownerId, issuedOn: monthsAgo(1, 3), dueOn: monthsAgo(1, 17), status: "paid",
    lineItems: [
      { description: "Restock linens (2 queen sets)", qty: 2, unit: 64 },
      { description: "Guest supplies: coffee, soap, paper goods", qty: 1, unit: 48 },
    ] }),
  withTotal({ id: "inv-1019", ownerId, issuedOn: monthsAgo(3, 5), dueOn: monthsAgo(3, 19), status: "paid",
    lineItems: [
      { description: "Hot tub service and chemicals", qty: 1, unit: 140 },
    ] }),
];

export async function getInvoices(ownerId: string): Promise<Invoice[]> {
  // TODO(step 7): read from invoices + invoice_items once the tables exist.
  if (supabaseConfigured) return [];
  return sampleInvoices(ownerId);
}

export async function getInvoice(ownerId: string, id: string): Promise<Invoice | undefined> {
  return (await getInvoices(ownerId)).find((i) => i.id === id);
}
