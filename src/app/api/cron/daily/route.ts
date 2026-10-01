import { NextResponse } from "next/server";
import { GET as ical } from "../ical/route";
import { GET as sweep } from "../sweep/route";
import { GET as payouts } from "../payouts/route";

// GET /api/cron/daily  (Vercel Cron, once a day)
// Vercel's Hobby plan allows two cron jobs that run at most daily, so this one
// route runs all scheduled work in order. On Pro, schedule the three routes
// separately in vercel.json (sweep and ical hourly) and drop this one.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const results: Record<string, unknown> = {};
  for (const [name, handler] of [["ical", ical], ["sweep", sweep], ["payouts", payouts]] as const) {
    try {
      results[name] = await (await handler(req)).json();
    } catch (e) {
      results[name] = { error: (e as Error).message };
    }
  }
  return NextResponse.json(results);
}
