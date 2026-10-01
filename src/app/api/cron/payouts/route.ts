import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

// GET /api/cron/payouts  (Vercel Cron, daily; see vercel.json)
// Transfers each released payout to the owner's Connect account.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = supabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const { data: due } = await db
    .from("payouts")
    .select("id, booking_id, net_cents, owners(stripe_account_id, payouts_enabled)")
    .eq("status", "scheduled")
    .lte("release_on", today);

  const results: Record<string, string> = {};
  for (const p of due ?? []) {
    const owner = p.owners as unknown as { stripe_account_id: string | null; payouts_enabled: boolean };
    if (!owner?.stripe_account_id || !owner.payouts_enabled) { results[p.id] = "owner not onboarded"; continue; }
    try {
      const transfer = await stripe().transfers.create(
        { amount: p.net_cents, currency: "usd", destination: owner.stripe_account_id, transfer_group: p.booking_id, metadata: { payout_id: p.id } },
        { idempotencyKey: `payout_${p.id}` },
      );
      await db.from("payouts").update({ status: "paid", stripe_transfer_id: transfer.id }).eq("id", p.id);
      results[p.id] = transfer.id;
    } catch (e) {
      results[p.id] = `error: ${(e as Error).message}`;
    }
  }
  return NextResponse.json({ date: today, processed: results });
}
