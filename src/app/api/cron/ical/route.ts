import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";
import { parseIcal } from "@/lib/ical";
import { cronAuthorized } from "@/lib/cron-auth";

// GET /api/cron/ical  (run by /api/cron/daily once a day; see vercel.json)
// Pulls each property's Airbnb / Vrbo / Booking.com feed and mirrors reserved
// ranges as bookings (source = channel, no money fields), so the public
// calendar, the master calendar and cleaning turnovers all see them.
// Events that disappear from a feed (cancelled on the channel) are cancelled here.
// Each imported stay gets a turnover on its check-out day (like a confirmed direct
// booking); a cancelled stay's open turnover is skipped. The bookings_sync_cleaning
// trigger in supabase/schema.sql does the same in the database as a backstop.
export async function GET(req: Request) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseConfigured) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const db = supabaseAdmin();
  const { data: feeds } = await db.from("ical_feeds").select("id, property_id, source, url");
  const today = new Date().toISOString().slice(0, 10);
  const report: Record<string, string> = {};
  const { data: integrations } = await db.from("property_integrations").select("property_id, default_cleaner_id");
  const cleanerFor = new Map((integrations ?? []).map((i) => [i.property_id as string, (i.default_cleaner_id as string | null) ?? null]));

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
        const { data: stay, error } = await db.from("bookings").upsert(
          { property_id: feed.property_id, source: feed.source, external_uid: e.uid, guest_name: e.summary || "Channel reservation",
            check_in: e.start, check_out: e.end, status: "confirmed", total_cents: null, subtotal_cents: null },
          { onConflict: "property_id,source,external_uid" },
        ).select("id").single();
        if (!error && stay) {
          // Turnover on the check-out day, pre-assigned to the home's default cleaner. An
          // existing open job follows the stay if the channel moves the check-out date.
          const { data: inserted } = await db.from("cleaning_jobs").upsert(
            { property_id: feed.property_id, booking_id: stay.id, scheduled_date: e.end, window_start: "11:00", window_end: "16:00",
              cleaner_id: cleanerFor.get(feed.property_id) ?? null, status: cleanerFor.get(feed.property_id) ? "assigned" : "unassigned" },
            { onConflict: "booking_id", ignoreDuplicates: true },
          ).select("id");
          if (!inserted?.length) await db.from("cleaning_jobs").update({ scheduled_date: e.end }).eq("booking_id", stay.id).in("status", ["unassigned", "assigned"]).neq("scheduled_date", e.end);
        }
        if (error) {
          // 23P01: overlaps a direct booking we hold. Leave ours; flag it for the team.
          await db.from("audit_log").insert({ actor: "ical", action: "overlap", entity: "property", entity_id: feed.property_id, detail: { source: feed.source, uid: e.uid, start: e.start, end: e.end, error: error.message } });
        } else upserts++;
      }
      // Cancel future channel stays no longer in the feed.
      const { data: existing } = await db.from("bookings").select("id, external_uid")
        .eq("property_id", feed.property_id).eq("source", feed.source).eq("status", "confirmed").gte("check_out", today);
      const gone = (existing ?? []).filter((b) => b.external_uid && !seen.has(b.external_uid)).map((b) => b.id);
      if (gone.length) {
        await db.from("bookings").update({ status: "cancelled", cancelled_at: new Date().toISOString(), notes: "removed from channel feed" }).in("id", gone);
        await db.from("cleaning_jobs").update({ status: "skipped" }).in("booking_id", gone).in("status", ["unassigned", "assigned"]);
      }
      await db.from("ical_feeds").update({ last_synced_at: new Date().toISOString(), last_error: null }).eq("id", feed.id);
      report[feed.id] = `${upserts} upserted, ${gone.length} cancelled`;
    } catch (e) {
      await db.from("ical_feeds").update({ last_error: (e as Error).message }).eq("id", feed.id);
      report[feed.id] = `error: ${(e as Error).message}`;
    }
  }
  return NextResponse.json({ feeds: report });
}
