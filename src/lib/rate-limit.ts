import { headers } from "next/headers";

// Small in-memory sliding-window limiter. State is per server instance, so on
// serverless it is a soft cap (each warm instance has its own map); it still
// stops a single script from holding every date. Swap for Upstash/Postgres
// when traffic warrants.
const WINDOW_MS = 10 * 60_000;
const LIMIT = 10;
const hits = new Map<string, number[]>();

export function rateLimited(key: string, limit = LIMIT, windowMs = WINDOW_MS): boolean {
  const now = Date.now();
  if (hits.size > 5_000) {
    for (const [k, times] of hits) if (times.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

// Works in route handlers and server actions. Vercel sets x-forwarded-for;
// the first entry is the client.
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || h.get("x-real-ip") || "unknown";
}
