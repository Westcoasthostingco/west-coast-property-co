// Open-Meteo forecast for mountain homes (no API key). Units requested in
// Fahrenheit / mph / inches; hourly snow_depth arrives in meters.

export type SkiResort = { name: string; lat: number; lng: number };
export type WeatherIcon = "sun" | "cloud" | "rain" | "snow" | "fog" | "storm";
export type ConditionsSource = "live" | "sample" | "unavailable";

export type DayForecast = { date: string; label: string; icon: WeatherIcon; condition: string; hiF: number; loF: number; snowfallIn: number };
export type MountainConditions = {
  resort: SkiResort;
  now: { tempF: number; label: string; icon: WeatherIcon; windMph: number; snowingNow: boolean };
  snowDepthIn: number;
  days: DayForecast[];
  sample: boolean;
  source: ConditionsSource;
};

/** WMO weather interpretation codes -> short label + icon. */
export function describeWmo(code: number): { label: string; icon: WeatherIcon } {
  if (code === 0) return { label: "Clear", icon: "sun" };
  if (code === 1) return { label: "Mostly clear", icon: "sun" };
  if (code === 2) return { label: "Partly cloudy", icon: "cloud" };
  if (code === 3) return { label: "Overcast", icon: "cloud" };
  if (code === 45 || code === 48) return { label: "Fog", icon: "fog" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", icon: "rain" };
  if (code === 66 || code === 67) return { label: "Freezing rain", icon: "rain" };
  if (code >= 61 && code <= 65) return { label: code === 61 ? "Light rain" : "Rain", icon: "rain" };
  if (code === 71) return { label: "Light snow", icon: "snow" };
  if (code === 73) return { label: "Snow", icon: "snow" };
  if (code === 75) return { label: "Heavy snow", icon: "snow" };
  if (code === 77) return { label: "Snow grains", icon: "snow" };
  if (code >= 80 && code <= 82) return { label: "Showers", icon: "rain" };
  if (code === 85 || code === 86) return { label: "Snow showers", icon: "snow" };
  if (code >= 95) return { label: "Thunderstorm", icon: "storm" };
  return { label: "Cloudy", icon: "cloud" };
}

const dayFmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short" });
function dayLabel(date: string, index: number) {
  if (index === 0) return "Today";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  if (!m) return date;
  return dayFmt.format(new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])));
}

function pacificHourKey(d: Date) {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit" });
  const p: Record<string, string> = {};
  for (const part of f.formatToParts(d)) p[part.type] = part.value;
  return `${p.year}-${p.month}-${p.day}T${p.hour}:00`;
}

function pacificDateKey(d: Date) {
  return pacificHourKey(d).slice(0, 10);
}

type OpenMeteo = {
  current?: { temperature_2m: number; weather_code: number; wind_speed_10m: number; snowfall: number };
  hourly?: { time: string[]; snow_depth: (number | null)[] };
  daily?: { time: string[]; snowfall_sum: (number | null)[]; temperature_2m_max: number[]; temperature_2m_min: number[]; weather_code: number[] };
  reason?: string;
};

const M_TO_IN = 39.3701;

async function fetchForecast(resort: SkiResort, now: Date): Promise<Omit<MountainConditions, "sample" | "source">> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(resort.lat), longitude: String(resort.lng),
    current: "temperature_2m,weather_code,wind_speed_10m,snowfall",
    hourly: "snow_depth",
    daily: "snowfall_sum,temperature_2m_max,temperature_2m_min,weather_code",
    temperature_unit: "fahrenheit", wind_speed_unit: "mph", precipitation_unit: "inch",
    timezone: "America/Los_Angeles", forecast_days: "4",
  }).toString();
  const res = await fetch(url, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const json = (await res.json()) as OpenMeteo;
  if (!json.current || !json.daily || !json.hourly) throw new Error(json.reason ?? "Open-Meteo: incomplete response");

  const cur = describeWmo(json.current.weather_code);
  const snowCodes = [71, 73, 75, 77, 85, 86];
  const snowingNow = (json.current.snowfall ?? 0) > 0 || snowCodes.includes(json.current.weather_code);

  // Snow depth for the current hour (fall back to the nearest non-null value).
  const key = pacificHourKey(now);
  let idx = json.hourly.time.findIndex((t) => t.startsWith(key));
  if (idx < 0) idx = Math.max(0, json.hourly.time.findIndex((t) => t > key));
  let depthM = json.hourly.snow_depth[idx];
  if (depthM == null) depthM = json.hourly.snow_depth.find((v) => v != null) ?? 0;

  const days: DayForecast[] = json.daily.time.slice(0, 4).map((date, i) => {
    const d = describeWmo(json.daily!.weather_code[i]);
    return {
      date, label: dayLabel(date, i), icon: d.icon, condition: d.label,
      hiF: Math.round(json.daily!.temperature_2m_max[i]), loF: Math.round(json.daily!.temperature_2m_min[i]),
      snowfallIn: Math.round((json.daily!.snowfall_sum[i] ?? 0) * 10) / 10,
    };
  });

  return {
    resort,
    now: { tempF: Math.round(json.current.temperature_2m), label: cur.label, icon: cur.icon, windMph: Math.round(json.current.wind_speed_10m), snowingNow },
    snowDepthIn: Math.round(depthM * M_TO_IN),
    days,
  };
}

/** Wintry sample: 28°F, light snow, 42 in base. Deterministic for screenshots. */
export function sampleConditions(resort: SkiResort, now: Date): Omit<MountainConditions, "sample" | "source"> {
  const today = pacificDateKey(now);
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(today)!;
  const base = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const spec: [number, number, number, number][] = [[71, 31, 19, 4.2], [73, 29, 17, 6.5], [2, 34, 22, 0.8], [0, 37, 24, 0]];
  const days = spec.map(([code, hiF, loF, snowfallIn], i) => {
    const date = new Date(base + i * 86400_000).toISOString().slice(0, 10);
    const d = describeWmo(code);
    return { date, label: dayLabel(date, i), icon: d.icon, condition: d.label, hiF, loF, snowfallIn };
  });
  return {
    resort,
    now: { tempF: 28, label: "Light snow", icon: "snow", windMph: 9, snowingNow: true },
    snowDepthIn: 42,
    days,
  };
}

export async function getMountainConditions(resort: SkiResort, opts: { forceSample?: boolean; now?: Date } = {}): Promise<MountainConditions> {
  const now = opts.now ?? new Date();
  if (opts.forceSample || process.env.CONDITIONS_SAMPLE === "1") {
    return { ...sampleConditions(resort, now), sample: true, source: "sample" };
  }
  try {
    return { ...(await fetchForecast(resort, now)), sample: false, source: "live" };
  } catch {
    return { ...sampleConditions(resort, now), sample: true, source: "unavailable" };
  }
}
