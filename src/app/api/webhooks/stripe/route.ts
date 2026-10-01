import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { feeCents, releaseDate, stripe } from "@/lib/stripe";
import { bookingConfirmation, sendEmail } from "@/lib/email";
import { money } from "@/lib/mock";

// POST /api/webhooks/stripe
// Register this URL in the Stripe dashboard with events:
//   checkout.session.completed, checkout.session.expired, account.updated, charge.refunded
// Every event id is recorded in stripe_events first and processed_at is set once the
// handler succeeds. A replay of a processed event is acknowledged and skipped; a replay
// of an unprocessed one (earlier attempt failed) is handled again. Any other failure
// returns 500 so Stripe retries.
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
  const { error: ins } = await db.from("stripe_events").insert({ id: event.id, type: event.type });
  if (ins && ins.code !== "23505") return NextResponse.json({ error: "Could not record event" }, { status: 500 });
  if (ins?.code === "23505") {
    const { data: prior } = await db.from("stripe_events").select("processed_at").eq("id", event.id).maybeSingle();
    if (prior?.processed_at) return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    await handleEvent(db, event);
  } catch (e) {
    await db.from("audit_log").insert({ actor: "stripe", action: "handler_failed", entity: "stripe_event", entity_id: event.id, detail: { type: event.type, error: (e as Error).message } });
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  await db.from("stripe_events").update({ processed_at: new Date().toISOString() }).eq("id", event.id);
  await db.from("audit_log").insert({ actor: "stripe", action: event.type, entity: "stripe_event", entity_id: event.id });
  return NextResponse.json({ received: true });
}

async function handleEvent(db: ReturnType<typeof supabaseAdmin>, event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      const bookingId = s.metadata?.booking_id;
      if (!bookingId || s.payment_status !== "paid") break;

      const piId = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id;
      const pi = piId ? await stripe().paymentIntents.retrieve(piId) : null;
      const chargeId = typeof pi?.latest_charge === "string" ? pi.latest_charge : pi?.latest_charge?.id ?? null;

      const { data: booking } = await db
        .from("bookings")
        .update({ status: "confirmed", stripe_payment_intent_id: piId, stripe_charge_id: chargeId })
        .eq("id", bookingId)
        .select("id, property_id, check_in, check_out, guest_name, guest_email, guest_count, total_cents, subtotal_cents, properties(name, check_in_time, owner_id, fee_percent, owners(fee_percent))")
        .single();
      if (!booking) break;

      // Owner's share: nights subtotal minus the management fee. Cleaning and tax are not owner revenue.
      const prop = booking.properties as unknown as { name: string; check_in_time: string; owner_id: string; fee_percent: number | null; owners: { fee_percent: number } };
      const gross = booking.subtotal_cents ?? 0;
      const fee = feeCents(gross, Number(prop.fee_percent ?? prop.owners.fee_percent));
      await db.from("payouts").upsert(
        { owner_id: prop.owner_id, booking_id: booking.id, gross_cents: gross, fee_cents: fee, net_cents: gross - fee, release_on: releaseDate(booking.check_in), status: "scheduled" },
        { onConflict: "booking_id", ignoreDuplicates: true },
      );
      // Turnover for the check-out day; the admin board assigns a cleaner.
      const { data: integ } = await db.from("property_integrations").select("default_cleaner_id").eq("property_id", booking.property_id).maybeSingle();
      await db.from("cleaning_jobs").upsert(
        { property_id: booking.property_id, booking_id: booking.id, scheduled_date: booking.check_out, window_start: "11:00", window_end: "16:00", cleaner_id: integ?.default_cleaner_id ?? null, status: integ?.default_cleaner_id ? "assigned" : "unassigned" },
        { onConflict: "booking_id", ignoreDuplicates: true },
      );
      if (booking.guest_email) {
        try {
          await sendEmail(booking.guest_email, `You're booked: ${prop.name}`, bookingConfirmation({
            guest: booking.guest_name, property: prop.name, checkIn: booking.check_in, checkOut: booking.check_out,
            guests: booking.guest_count, total: money((booking.total_cents ?? 0) / 100), checkInTime: String(prop.check_in_time).slice(0, 5),
          }));
        } catch (e) {
          await db.from("audit_log").insert({ actor: "stripe", action: "email_failed", entity: "booking", entity_id: booking.id, detail: { error: (e as Error).message } });
        }
      }
      break;
    }

    case "checkout.session.expired": {
      const bookingId = event.data.object.metadata?.booking_id;
      if (bookingId) {
        await db.from("bookings").update({ status: "cancelled", cancelled_at: new Date().toISOString() })
          .eq("id", bookingId).eq("status", "pending");
      }
      break;
    }

    case "account.updated": {
      const acct = event.data.object;
      await db.from("owners").update({ payouts_enabled: Boolean(acct.payouts_enabled) }).eq("stripe_account_id", acct.id);
      break;
    }

    case "charge.refunded": {
      // Full refunds only: pull back the owner's share and cancel the stay.
      // Partial refunds are left for a manual decision in the admin.
      const charge = event.data.object;
      if (charge.amount_refunded !== charge.amount || !charge.transfer_group) break;
      const bookingId = charge.transfer_group;
      const { data: payout } = await db.from("payouts").select("id, status, stripe_transfer_id").eq("booking_id", bookingId).single();
      if (payout?.status === "paid" && payout.stripe_transfer_id) {
        await stripe().transfers.createReversal(payout.stripe_transfer_id, {}, { idempotencyKey: `reverse_${charge.id}` });
      }
      await db.from("payouts").update({ status: "reversed" }).eq("booking_id", bookingId);
      await db.from("bookings").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", bookingId);
      break;
    }
  }
}
