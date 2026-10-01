import { getProperty, getUnavailableDates } from "@/lib/data";
import { buildIcal } from "@/lib/ical";

// GET /api/ical/[slug]  Export feed for Airbnb / Vrbo / Booking.com "import calendar".
// Lists only date ranges, never guest details.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProperty(slug);
  if (!p) return new Response("Not found", { status: 404 });
  const stays = await getUnavailableDates(p.id);
  const body = buildIcal(`${p.name} (West Coast Hosting Co)`, stays.map((s, i) => ({ uid: `${p.id}-${s.checkIn}-${i}`, start: s.checkIn, end: s.checkOut, summary: "Reserved" })));
  return new Response(body, { headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "public, max-age=900" } });
}
