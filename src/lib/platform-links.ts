// Deep links into the platform listings with dates and guests filled in, so a
// guest who picks dates here lands on Airbnb or Vrbo looking at the live price
// for exactly those dates. Pure functions: safe on the server and in the browser.

export type StayQuery = { checkIn?: string; checkOut?: string; guests?: number };

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const validRange = (q: StayQuery) => Boolean(q.checkIn && q.checkOut && ISO.test(q.checkIn) && ISO.test(q.checkOut) && q.checkOut > q.checkIn);

function withParams(base: string, set: Record<string, string>, drop: string[]): string {
  try {
    const url = new URL(base);
    for (const k of drop) url.searchParams.delete(k);
    for (const [k, v] of Object.entries(set)) url.searchParams.set(k, v);
    return url.toString();
  } catch {
    return base;
  }
}

/** Airbnb room links accept check_in, check_out and adults. */
export function airbnbLink(base: string, q: StayQuery = {}): string {
  const set: Record<string, string> = {};
  if (validRange(q)) { set.check_in = q.checkIn!; set.check_out = q.checkOut!; }
  if (q.guests && q.guests > 0) set.adults = String(q.guests);
  return withParams(base, set, ["check_in", "check_out", "adults"]);
}

/** Vrbo listing links read chkin/chkout (and the older startDate/endDate) plus adults. */
export function vrboLink(base: string, q: StayQuery = {}): string {
  const set: Record<string, string> = {};
  if (validRange(q)) {
    set.chkin = q.checkIn!; set.chkout = q.checkOut!;
    set.startDate = q.checkIn!; set.endDate = q.checkOut!;
  }
  if (q.guests && q.guests > 0) set.adults = String(q.guests);
  return withParams(base, set, ["dateless", "chkin", "chkout", "startDate", "endDate", "adults"]);
}

export function nightsBetween(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut || !ISO.test(checkIn) || !ISO.test(checkOut)) return 0;
  const n = Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000);
  return n > 0 ? n : 0;
}
