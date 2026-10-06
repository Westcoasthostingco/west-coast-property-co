// NOAA CO-OPS tide predictions for waterfront homes.
//
// Times: NOAA returns station local time (lst_ldt). To stay independent of the
// server's timezone we work in "Pacific wall-clock" Dates: a Date whose UTC
// fields equal the Pacific local fields. Format them with timeZone "UTC".
// DST shifts inside a 2-day window are ignored (a one-hour error at most on
// two nights a year; the station's own data is already lst_ldt).

export type TideType = "H" | "L";
export type TideEvent = { type: TideType; time: number; timeLabel: string; height: number };
export type TideSource = "live" | "sample" | "unavailable";
export type TideReport = {
  station: { id: string; name: string };
  /** Pacific wall-clock "now" (UTC fields = Pacific local fields). */
  now: Date;
  /** Current level in feet MLLW, cosine-interpolated between the bracketing hi/lo. */
  level: number;
  rising: boolean;
  next: TideEvent | null;
  nextHigh: TideEvent | null;
  nextLow: TideEvent | null;
  /** Events from ~14h before now through the next 24h (for the curve and list). */
  events: TideEvent[];
  sample: boolean;
  source: TideSource;
};

export const TIDE_STATIONS: Record<string, string> = {
  "9446484": "Tacoma, Commencement Bay",
  "9445478": "Union, Hood Canal",
  "9446366": "Vaughn, Case Inlet",
};

export function stationName(id: string) {
  return TIDE_STATIONS[id] ?? `station ${id}`;
}

const HOUR = 3600_000;

/** Pacific wall-clock Date for a real instant. */
export function toPacificWallClock(d: Date): Date {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles", hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const p: Record<string, string> = {};
  for (const part of f.formatToParts(d)) p[part.type] = part.value;
  return new Date(Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second));
}

/** "2026-10-01 03:12" (station local) -> wall-clock ms. */
function parseLocal(t: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(t);
  if (!m) return NaN;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
}

export function timeLabel(ms: number): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", hour: "numeric", minute: "2-digit" })
    .format(new Date(ms)).toLowerCase().replace(" ", " ");
}

function yyyymmdd(ms: number) {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
}

/**
 * Level at time t (wall-clock ms) from a sorted list of hi/lo events, using the
 * cosine (rule-of-twelfths) approximation between the bracketing predictions.
 */
export function tideLevelAt(events: TideEvent[], t: number): { level: number; rising: boolean } | null {
  if (events.length < 2) return null;
  let i = 0;
  while (i < events.length - 1 && events[i + 1].time <= t) i++;
  if (i >= events.length - 1) i = events.length - 2;
  const a = events[i], b = events[i + 1];
  if (t < a.time) { return { level: a.height, rising: b.height > a.height }; }
  const f = (t - a.time) / (b.time - a.time);
  const level = (a.height + b.height) / 2 - ((b.height - a.height) / 2) * Math.cos(Math.PI * f);
  return { level, rising: b.height > a.height };
}

type NoaaResponse = { predictions?: { t: string; v: string; type: TideType }[]; error?: { message: string } };

async function fetchPredictions(stationId: string, beginMs: number, endMs: number): Promise<TideEvent[]> {
  const url = new URL("https://api.tidesandcurrents.noaa.gov/api/prod/datagetter");
  url.search = new URLSearchParams({
    product: "predictions", application: "westcoasthostingco",
    begin_date: yyyymmdd(beginMs), end_date: yyyymmdd(endMs),
    datum: "MLLW", station: stationId, time_zone: "lst_ldt", units: "english", interval: "hilo", format: "json",
  }).toString();
  const res = await fetch(url, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`NOAA ${res.status}`);
  const json = (await res.json()) as NoaaResponse;
  if (!json.predictions?.length) throw new Error(json.error?.message ?? "NOAA: no predictions");
  const events = json.predictions
    .map((p) => ({ type: p.type, time: parseLocal(p.t), height: Number(p.v) }))
    .filter((e) => Number.isFinite(e.time) && Number.isFinite(e.height) && (e.type === "H" || e.type === "L"))
    .sort((a, b) => a.time - b.time)
    .map((e) => ({ ...e, timeLabel: timeLabel(e.time) }));
  if (events.length < 2) throw new Error("NOAA: too few predictions");
  return events;
}

/** Deterministic semidiurnal sample tide: period 12h25m, mixed highs/lows like Puget Sound. */
export function samplePredictions(stationId: string, beginMs: number, endMs: number): TideEvent[] {
  const highs = stationId === "9445478" ? [11.2, 12.6, 10.4, 12.9] : [11.6, 12.8, 10.9, 13.1];
  const lows = stationId === "9445478" ? [1.4, -0.6, 2.9, 0.2] : [1.2, -0.8, 2.6, 0.4];
  const half = 6.2075 * HOUR; // half a lunar day
  const dayStart = Math.floor(beginMs / (24 * HOUR)) * 24 * HOUR;
  let t = dayStart + 3.2 * HOUR;
  const out: TideEvent[] = [];
  let k = 0;
  while (t < endMs) {
    const isHigh = k % 2 === 0;
    const height = isHigh ? highs[(k / 2) % 4] : lows[((k - 1) / 2) % 4];
    if (t >= beginMs) out.push({ type: isHigh ? "H" : "L", time: t, height, timeLabel: timeLabel(t) });
    t += half; k++;
  }
  return out;
}

export async function getTides(stationId: string, days = 2, opts: { forceSample?: boolean; now?: Date } = {}): Promise<TideReport> {
  const now = toPacificWallClock(opts.now ?? new Date());
  const nowMs = now.getTime();
  const beginMs = nowMs - 24 * HOUR;
  const endMs = nowMs + days * 24 * HOUR;
  const forceSample = opts.forceSample || process.env.CONDITIONS_SAMPLE === "1";

  let all: TideEvent[];
  let source: TideSource = "live";
  if (forceSample) {
    all = samplePredictions(stationId, beginMs, endMs);
    source = "sample";
  } else {
    try {
      all = await fetchPredictions(stationId, beginMs, endMs);
    } catch {
      all = samplePredictions(stationId, beginMs, endMs);
      source = "unavailable";
    }
  }

  const at = tideLevelAt(all, nowMs) ?? { level: 0, rising: true };
  const events = all.filter((e) => e.time >= nowMs - 14 * HOUR && e.time <= nowMs + 24 * HOUR);
  const upcoming = all.filter((e) => e.time > nowMs);
  return {
    station: { id: stationId, name: stationName(stationId) },
    now,
    level: Math.round(at.level * 10) / 10,
    rising: at.rising,
    next: upcoming[0] ?? null,
    nextHigh: upcoming.find((e) => e.type === "H") ?? null,
    nextLow: upcoming.find((e) => e.type === "L") ?? null,
    events,
    sample: source !== "live",
    source,
  };
}
