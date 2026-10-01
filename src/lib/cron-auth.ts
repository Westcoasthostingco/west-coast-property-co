import { timingSafeEqual } from "node:crypto";

// Shared check for the Vercel Cron routes. Rejects when CRON_SECRET is unset
// (otherwise "Bearer undefined" would match) and compares in constant time.
export function cronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  return expected.length === given.length && timingSafeEqual(expected, given);
}
