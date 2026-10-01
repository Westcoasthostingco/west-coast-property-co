import { NextResponse } from "next/server";
import { cronAuthorized } from "@/lib/cron-auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/cron/sweep  (run by /api/cron/daily once a day; see vercel.json)
// Releases date holds whose Checkout session expired but whose webhook never arrived.
export async function GET(req: Request) {
  if (!cronAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cutoff = new Date(Date.now() - 45 * 60_000).toISOString();
  const { data } = await supabaseAdmin()
    .from("bookings")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString(), notes: "hold expired" })
    .eq("status", "pending").eq("source", "direct").lt("created_at", cutoff)
    .select("id");
  return NextResponse.json({ released: data?.length ?? 0 });
}
