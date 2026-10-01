import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";
import { parseIcal } from "@/lib/ical";

// GET /api/cron/ical  (Vercel Cron, hourly)
// Pulls each property's Airbnb / Vrbo / Booking.com feed and mirrors reserved
// ranges as bookings (source = channel, no money fields), so the public
// calendar, the master calendar and cleaning turnovers all see them.
// Events that disappear from a feed (cancelled on the channel) are cancelled here.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseConfigured) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const db = supabaseAdmin();
  const { data: feeds } = await db.from("ical_feeds").select("id, property_id, source, url");
  const today = new Date().toISOString().slice(0, 10);
  const report: Record<string, string> = {};

  for (const feed of feeds ?? []) {
    try {
      const res = await fetch(feed.url, { headers: { "user-agent": "WestCoastHostingCo/1.0" }, cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const events = parseIcal(await res.text()).filter((e) => e.end > e.start);
      const seen = new Set<string>();
      let upserts = 0;
      for (const e of events) {
        seen.add(e.uid);
        // Channel summaries are "Reserved" or "Airbnb (Not available)"; never a guest name.
        const { error } = await db.from("bookings").upsert(
          { property_id: feed.property_id, source: feed.source, external_uid: e.uid, guest_name: e.summary || "Channel reservation",
            check_in: e.start, check_out: e.end, status: "confirmed", total_cents: null, subtotal_cents: null },
          { onConflict: "property_id,source,external_uid" },
        );
        if (error) {
          // 23P01: overlaps a direct booking we hold. Leave ours; flag it for the team.
          await db.from("audit_log").insert({ actor: "ical", action: "overlap", entity: "property", entity_id: feed.property_id, detail: { source: feed.source, uid: e.uid, start: e.start, end: e.end, error: error.message } });
        } else upserts++;
      }
      // Cancel future channel stays no longer in the feed.
      const { data: existing } = await db.from("bookings").select("id, external_uid")
        .eq("property_id", feed.property_id).eq("source", feed.source).eq("status", "confirmed").gte("check_out", today);
      const gone = (existing ?? []).filter((b) => b.external_uid && !seen.has(b.external_uid)).map((b) => b.id);
      if (gone.length) await db.from("bookings").update({ status: "cancelled", cancelled_at: new Date().toISOString(), notes: "removed from channel feed" }).in("id", gone);
      await db.from("ical_feeds").update({ last_synced_at: new Date().toISOString(), last_error: null }).eq("id", feed.id);
      report[feed.id] = `${upserts} upserted, ${gone.length} cancelled`;
    } catch (e) {
      await db.from("ical_feeds").update({ last_error: (e as Error).message }).eq("id", feed.id);
      report[feed.id] = `error: ${(e as Error).message}`;
    }
  }
  return NextResponse.json({ feeds: report });
}
