import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { feeCents, releaseDate, stripe } from "@/lib/stripe";

// POST /api/webhooks/stripe
// Register this URL in the Stripe dashboard with events:
//   checkout.session.completed, checkout.session.expired, account.updated, charge.refunded
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(await req.text(), sig, secret);
  } catch (e) {
    return NextResponse.json({ error: `Bad signature: ${(e as Error).message}` }, { status: 400 });
  }

  const db = supabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      const bookingId = s.metadata?.booking_id;
      if (!bookingId || s.payment_status !== "paid") break;

      const paymentIntent = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id;
      const { data: booking } = await db
        .from("bookings")
        .update({ status: "confirmed", stripe_payment_intent_id: paymentIntent })
        .eq("id", bookingId)
        .select("id, check_in, total_cents, properties(owner_id, owners(fee_percent))")
        .single();
      if (!booking) break;

      // Schedule the owner's share. Tax collected by Stripe Tax is not part of the owner's gross.
      const prop = booking.properties as unknown as { owner_id: string; owners: { fee_percent: number } };
      const gross = booking.total_cents;
      const fee = feeCents(gross, Number(prop.owners.fee_percent));
      await db.from("payouts").upsert(
        { owner_id: prop.owner_id, booking_id: booking.id, gross_cents: gross, fee_cents: fee, net_cents: gross - fee, release_on: releaseDate(booking.check_in), status: "scheduled" },
        { onConflict: "booking_id" },
      );
      break;
    }

    case "checkout.session.expired": {
      const bookingId = event.data.object.metadata?.booking_id;
      if (bookingId) await db.from("bookings").update({ status: "cancelled" }).eq("id", bookingId).eq("status", "pending");
      break;
    }

    case "account.updated": {
      const acct = event.data.object;
      await db.from("owners").update({ payouts_enabled: Boolean(acct.payouts_enabled) }).eq("stripe_account_id", acct.id);
      break;
    }

    case "charge.refunded": {
      // Pull back the owner's share for a refunded booking. Full refunds only here;
      // partial refunds need a manual decision in the admin.
      const charge = event.data.object;
      if (!charge.refunded || !charge.transfer_group) break;
      const { data: payout } = await db.from("payouts").select("id, status, stripe_transfer_id").eq("booking_id", charge.transfer_group).single();
      if (payout?.status === "paid" && payout.stripe_transfer_id) {
        await stripe().transfers.createReversal(payout.stripe_transfer_id);
      }
      await db.from("payouts").update({ status: "failed" }).eq("booking_id", charge.transfer_group);
      await db.from("bookings").update({ status: "cancelled" }).eq("id", charge.transfer_group);
      break;
    }
  }

  await db.from("audit_log").insert({ actor: "stripe", action: event.type, entity: "stripe_event", entity_id: event.id });
  return NextResponse.json({ received: true });
}
