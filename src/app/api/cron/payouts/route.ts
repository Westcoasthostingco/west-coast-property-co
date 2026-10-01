import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { stripe, todayISO } from "@/lib/stripe";

// GET /api/cron/payouts  (Vercel Cron, daily; see vercel.json)
// Transfers each released payout to the owner's Connect account.
// Rows are claimed (status -> processing) before calling Stripe so an overlapping
// run or a crash between transfer and update cannot pay twice.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = supabaseAdmin();
  const today = todayISO();

  const { data: claimed } = await db
    .from("payouts")
    .update({ status: "processing" })
    .eq("status", "scheduled")
    .lte("release_on", today)
    .select("id, booking_id, net_cents, owners(stripe_account_id, payouts_enabled), bookings(stripe_charge_id)");

  const results: Record<string, string> = {};
  for (const p of claimed ?? []) {
    const owner = p.owners as unknown as { stripe_account_id: string | null; payouts_enabled: boolean };
    const booking = p.bookings as unknown as { stripe_charge_id: string | null };
    if (!owner?.stripe_account_id || !owner.payouts_enabled) {
      // Put it back; it is retried tomorrow once the owner finishes onboarding.
      await db.from("payouts").update({ status: "scheduled", last_error: "owner not onboarded" }).eq("id", p.id);
      results[p.id] = "owner not onboarded";
      continue;
    }
    try {
      const transfer = await stripe().transfers.create(
        {
          amount: p.net_cents, currency: "usd", destination: owner.stripe_account_id,
          transfer_group: p.booking_id, metadata: { payout_id: p.id },
          // Tie the transfer to the guest's charge so it does not need settled platform balance.
          ...(booking?.stripe_charge_id ? { source_transaction: booking.stripe_charge_id } : {}),
        },
        { idempotencyKey: `payout_${p.id}` },
      );
      await db.from("payouts").update({ status: "paid", stripe_transfer_id: transfer.id, last_error: null }).eq("id", p.id);
      results[p.id] = transfer.id;
    } catch (e) {
      await db.from("payouts").update({ status: "failed", last_error: (e as Error).message }).eq("id", p.id);
      results[p.id] = `error: ${(e as Error).message}`;
    }
  }
  return NextResponse.json({ date: today, processed: results });
}
