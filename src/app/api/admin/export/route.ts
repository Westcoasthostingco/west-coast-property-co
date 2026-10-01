import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { bookingsCsv, payoutsCsv } from "@/lib/admin";

// GET /api/admin/export?kind=bookings|payouts&from=YYYY-MM-DD&to=YYYY-MM-DD
// Admin only. Streams CSV so large ranges never buffer in memory.
export async function GET(req: Request) {
  await requireRole("admin");
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const isDate = (s: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const from = isDate(url.searchParams.get("from")) ? url.searchParams.get("from")! : "0000-01-01";
  const to = isDate(url.searchParams.get("to")) ? url.searchParams.get("to")! : "9999-12-31";
  if (kind !== "bookings" && kind !== "payouts") return NextResponse.json({ error: "kind must be bookings or payouts" }, { status: 400 });

  const gen = kind === "bookings" ? bookingsCsv(from, to) : payoutsCsv(from, to);
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await gen.next();
      if (done) controller.close();
      else controller.enqueue(encoder.encode(value));
    },
  });
  return new Response(stream, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="wchc-${kind}-${from}-to-${to}.csv"`,
      "cache-control": "no-store",
    },
  });
}
