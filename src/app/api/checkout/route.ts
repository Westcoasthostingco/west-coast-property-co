import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";
import { appUrl, nightsBetween, stripe } from "@/lib/stripe";

// POST /api/checkout  (form: slug, check_in, check_out, guest_name, guest_email)
// 1. Inserts a pending booking. The database exclusion constraint rejects dates
//    that overlap a pending or confirmed stay, so double-booking fails here.
// 2. Opens Stripe Checkout. The guest pays the platform; the owner's share is
//    transferred later by the payouts cron (separate charges and transfers).
export async function POST(req: Request) {
  const form = await req.formData();
  const slug = String(form.get("slug") ?? "");
  const checkIn = String(form.get("check_in") ?? "");
  const checkOut = String(form.get("check_out") ?? "");
  const guestName = String(form.get("guest_name") ?? "").trim();
  const guestEmail = String(form.get("guest_email") ?? "").trim();

  const nights = nightsBetween(checkIn, checkOut);
  if (!slug || !guestName || !guestEmail || !Number.isFinite(nights) || nights < 1 || nights > 90) {
    return NextResponse.json({ error: "Check the dates and guest details" }, { status: 400 });
  }
  if (!supabaseConfigured) return NextResponse.json({ error: "Booking is not live yet" }, { status: 503 });

  const db = supabaseAdmin();
  const { data: property } = await db
    .from("properties")
    .select("id, name, nightly_rate_cents, cleaning_fee_cents, max_guests, published")
    .eq("slug", slug).single();
  if (!property?.published) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  const totalCents = property.nightly_rate_cents * nights + property.cleaning_fee_cents;

  const { data: booking, error } = await db
    .from("bookings")
    .insert({
      property_id: property.id, guest_name: guestName, guest_email: guestEmail,
      check_in: checkIn, check_out: checkOut, source: "direct", status: "pending", total_cents: totalCents,
    })
    .select("id").single();
  if (error || !booking) {
    // 23P01 = exclusion_violation: dates overlap another stay
    const taken = error?.code === "23P01";
    return NextResponse.json({ error: taken ? "Those dates are no longer available" : error?.message }, { status: taken ? 409 : 500 });
  }

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: guestEmail,
    line_items: [
      {
        quantity: nights,
        price_data: {
          currency: "usd", unit_amount: property.nightly_rate_cents,
          product_data: { name: `${property.name}: nightly rate`, description: `${checkIn} to ${checkOut}` },
          // Stripe Tax product code for lodging; confirm with your accountant
          tax_behavior: "exclusive",
        },
      },
      ...(property.cleaning_fee_cents > 0 ? [{
        quantity: 1,
        price_data: {
          currency: "usd", unit_amount: property.cleaning_fee_cents,
          product_data: { name: "Cleaning fee" }, tax_behavior: "exclusive" as const,
        },
      }] : []),
    ],
    automatic_tax: { enabled: true },
    payment_intent_data: {
      transfer_group: booking.id,
      metadata: { booking_id: booking.id, property_id: property.id },
    },
    metadata: { booking_id: booking.id },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // hold the dates for 30 minutes
    success_url: `${appUrl()}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/book/cancelled?booking=${booking.id}`,
  });

  await db.from("bookings").update({ stripe_checkout_session_id: session.id }).eq("id", booking.id);
  return NextResponse.redirect(session.url!, { status: 303 });
}
