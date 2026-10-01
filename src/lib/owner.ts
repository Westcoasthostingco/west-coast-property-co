// Owner portal data helpers. Reads from Supabase when configured (user client,
// RLS scopes rows to the signed-in owner), otherwise from the sample data in
// mock.ts. Statement math lives here so every owner page agrees with itself.
import * as mock from "./mock";
import { requireRole } from "./auth";
import { getOwnerDashboard, getOwnerForClerkUser, getPublishedReviews } from "./data";
import type { Booking, Owner, Payout, Property, Review } from "./mock";
import { lastMonths, monthlyMetrics, type MonthMetric } from "./metrics";
import { supabaseConfigured, supabaseForUser } from "./supabase";

export type { Booking, Owner, Payout, Property, Review };

// A payout plus the Stripe transfer id, which the shared Payout type leaves out.
export type OwnerPayout = Payout & { stripeTransferId?: string };

export type OwnerData = {
  properties: Property[];
  bookings: Booking[];
  payouts: OwnerPayout[];
};

const toOwnerPayout = (r: Record<string, unknown>): OwnerPayout => ({
  id: r.id as string,
  ownerId: r.owner_id as string,
  bookingId: r.booking_id as string,
  gross: (r.gross_cents as number) / 100,
  fee: (r.fee_cents as number) / 100,
  net: (r.net_cents as number) / 100,
  status: r.status as Payout["status"],
  releaseOn: r.release_on as string,
  stripeTransferId: (r.stripe_transfer_id as string | null) ?? undefined,
});

// Gate the page to the owner role and find the owner row for the signed-in
// user. Returns undefined when the login is not linked yet.
export async function loadOwner(): Promise<Owner | undefined> {
  const { userId } = await requireRole("owner");
  return getOwnerForClerkUser(userId);
}

// Everything the portal needs for one owner: their homes, every stay at those
// homes, and their payouts (with transfer ids when the database is live).
export async function getOwnerData(owner: Owner): Promise<OwnerData> {
  const base = await getOwnerDashboard(owner);
  if (!supabaseConfigured) return base;
  const { data, error } = await supabaseForUser().from("payouts").select("*").eq("owner_id", owner.id).order("release_on");
  if (error) throw new Error(`payouts: ${error.message}`);
  return { ...base, payouts: ((data ?? []) as Record<string, unknown>[]).map(toOwnerPayout) };
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

// Stays that have not started yet, soonest first.
export function upcomingStays(bookings: Booking[], limit = 10): Booking[] {
  const today = todayIso();
  return bookings
    .filter((b) => b.checkIn >= today && b.status !== "cancelled")
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, limit);
}

export const scheduledPayoutTotal = (payouts: Payout[]) =>
  payouts.filter((x) => x.status === "scheduled" || x.status === "processing").reduce((s, x) => s + x.net, 0);

// ---- Statements ----
// A stay belongs to the statement for the month it checks in, because that is
// when the payout releases (check-in + 1 day). Trend charts prorate by night
// instead; the two views answer different questions and are labelled as such.

export type StatementLine = {
  booking: Booking;
  propertyName: string;
  nights: number;
  gross: number;      // nights subtotal
  fee: number;        // management fee on gross
  cleaning: number;   // passed through: total minus subtotal
  net: number;        // gross minus fee
  payout?: OwnerPayout;
};

export type Statement = {
  month: string;
  lines: StatementLine[];
  stays: number;
  gross: number;
  fee: number;
  cleaning: number;
  net: number;
};

export function statementFor(month: string, data: OwnerData, owner: Owner): Statement {
  const names = new Map(data.properties.map((p) => [p.id, p.name]));
  const payoutByBooking = new Map(data.payouts.map((x) => [x.bookingId, x]));
  const lines: StatementLine[] = data.bookings
    .filter((b) => b.checkIn.startsWith(month) && b.status !== "cancelled" && b.status !== "pending")
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .map((b) => {
      const payout = payoutByBooking.get(b.id);
      const gross = payout?.gross ?? b.subtotal ?? b.total;
      const fee = payout?.fee ?? Math.round((gross * owner.feePercent) / 100);
      const cleaning = b.subtotal != null ? Math.max(0, b.total - b.subtotal) : 0;
      return { booking: b, propertyName: names.get(b.propertyId) ?? b.propertyId, nights: nightsBetween(b.checkIn, b.checkOut), gross, fee, cleaning, net: payout?.net ?? gross - fee, payout };
    });
  const sum = (k: "gross" | "fee" | "cleaning" | "net") => lines.reduce((s, l) => s + l[k], 0);
  return { month, lines, stays: lines.length, gross: sum("gross"), fee: sum("fee"), cleaning: sum("cleaning"), net: sum("net") };
}

export const statements = (data: OwnerData, owner: Owner, months = lastMonths(12)) =>
  months.map((m) => statementFor(m, data, owner)).reverse(); // newest first

// ---- Invoices ----
// There is no invoices table yet (architecture step 7). At launch, repairs and
// supplies net against the owner's next payout and appear on the statement;
// these samples show the shape the page will take once Stripe Invoicing lands.

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
    ], note: "Nets against your next payout." }),
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
