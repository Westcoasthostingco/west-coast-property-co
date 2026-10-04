import { NextResponse } from "next/server";
import { cronAuthorized } from "@/lib/cron-auth";
import { GET as ical } from "../ical/route";
import { GET as sweep } from "../sweep/route";

// GET /api/cron/daily  (Vercel Cron, once a day)
// Vercel's Hobby plan allows two cron jobs that run at most daily, so this one
// route runs all scheduled work in order: iCal import from Airbnb/Vrbo, then the
// hold sweep. On Pro, schedule the two routes separately in vercel.json (both
// hourly) and drop this one. There is no payout step: the platforms pay owners.
export async function GET(req: Request) {
  if (!cronAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const results: Record<string, unknown> = {};
  for (const [name, handler] of [["ical", ical], ["sweep", sweep]] as const) {
    try {
      results[name] = await (await handler(req)).json();
    } catch (e) {
      results[name] = { error: (e as Error).message };
    }
  }
  return NextResponse.json(results);
}
