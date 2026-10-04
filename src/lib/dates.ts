// Small pure helpers shared by admin, metrics and cron code. No server-only imports.

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const nightsBetween = (checkIn: string, checkOut: string) =>
  Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000);

// Management fee, taken on the nights subtotal only (not cleaning or tax). Integer cents.
export const feeCents = (subtotalCents: number, feePercent: number) => Math.round((subtotalCents * feePercent) / 100);

// Lodging tax on a taxable amount in cents, at a rate in basis points.
export const taxCents = (taxableCents: number, rateBps: number) => Math.round((taxableCents * rateBps) / 10_000);
