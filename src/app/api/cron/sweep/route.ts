import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/cron/sweep  (Vercel Cron, hourly)
// Releases date holds whose Checkout session expired but whose webhook never arrived.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cutoff = new Date(Date.now() - 45 * 60_000).toISOString();
  const { data } = await supabaseAdmin()
    .from("bookings")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString(), notes: "hold expired" })
    .eq("status", "pending").eq("source", "direct").lt("created_at", cutoff)
    .select("id");
  return NextResponse.json({ released: data?.length ?? 0 });
}
