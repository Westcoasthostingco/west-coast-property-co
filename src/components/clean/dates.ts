// Small date helpers for the cleaner portal. All job dates are YYYY-MM-DD
// strings; we never let the browser's local timezone shift them.

export const PORTFOLIO_TZ = "America/Los_Angeles";

// Today's calendar date where the houses are (Gig Harbor, WA). The database
// stores scheduled_date as a plain date, so comparing against the Pacific date
// is the right call; a UTC compare would flip to "tomorrow" at 4 or 5pm local.
export function todayPacific(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: PORTFOLIO_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function addDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// "2026-10-03" -> "Sat, Oct 3"
export function formatDay(ymd: string, opts: { year?: boolean } = {}): string {
  const d = new Date(`${ymd}T12:00:00Z`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", ...(opts.year ? { year: "numeric" } : {}), timeZone: "UTC" });
}

// "11:00" or "11:00:00" -> "11:00 AM"
export function formatTime(t?: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return t;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m ?? 0).padStart(2, "0")} ${suffix}`;
}

// "2026-10" -> { year, month } and friendly label
export function parseMonth(s?: string | null): { year: number; month: number } {
  const m = s?.match(/^(\d{4})-(\d{2})$/);
  if (m) {
    const year = Number(m[1]), month = Number(m[2]);
    if (month >= 1 && month <= 12) return { year, month };
  }
  const t = todayPacific();
  return { year: Number(t.slice(0, 4)), month: Number(t.slice(5, 7)) };
}

export const monthKey = (year: number, month: number) => `${year}-${String(month).padStart(2, "0")}`;

export function shiftMonth(year: number, month: number, by: number): { year: number; month: number } {
  const idx = year * 12 + (month - 1) + by;
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

export function monthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 15)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();
// 0 = Sunday
export const firstWeekday = (year: number, month: number) => new Date(Date.UTC(year, month - 1, 1)).getUTCDay();

export function relativeDay(ymd: string): string {
  const today = todayPacific();
  if (ymd === today) return "Today";
  if (ymd === addDays(today, 1)) return "Tomorrow";
  return formatDay(ymd);
}
