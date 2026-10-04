import { NextResponse } from "next/server";
import { cronAuthorized } from "@/lib/cron-auth";
import { submitToIndexNow } from "@/lib/indexnow";
import sitemap from "@/app/sitemap";

// GET /api/cron/indexnow  (run weekly by /api/cron/daily)
// Submits every public URL in the sitemap to IndexNow.
export async function GET(req: Request) {
  if (!cronAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const urls = (await sitemap()).map((e) => e.url);
  try {
    return NextResponse.json(await submitToIndexNow(urls));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
