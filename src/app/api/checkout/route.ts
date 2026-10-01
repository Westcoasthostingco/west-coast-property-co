import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";
import { appUrl, nightsBetween, stripe, taxCents, todayISO } from "@/lib/stripe";

// POST /api/checkout  (form: slug, check_in, check_out, guests, guest_name, guest_email)
// 1. Inserts a pending booking. The database exclusion constraint rejects dates
//    that overlap a pending or confirmed stay, so double-booking fails here.
// 2. Opens Stripe Checkout. The guest pays the platform; the owner's share is
//    transferred later by the payouts cron (separate charges and transfers).
// Lodging tax (TOT) is charged as a line item from properties.tax_rate_bps,
// because Stripe Tax does not file city or county occupancy taxes.
export async function POST(req: Request) {
  const form = await req.formData();
  const slug = String(form.get("slug") ?? "");
  const checkIn = String(form.get("check_in") ?? "");
  const checkOut = String(form.get("check_out") ?? "");
  const guests = Number(form.get("guests") ?? 1);
  const guestName = String(form.get("guest_name") ?? "").trim();
  const guestEmail = String(form.get("guest_email") ?? "").trim();

  const nights = nightsBetween(checkIn, checkOut);
  const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
  if (!slug || !guestName || !guestEmail || !Number.isFinite(nights) || nights < 1 || nights > 90) return bad("Check the dates and guest details");
  if (checkIn < todayISO()) return bad("Check-in must be today or later");
  if (!Number.isInteger(guests) || guests < 1) return bad("Guest count is required");
  if (!supabaseConfigured) return bad("Booking is not live yet", 503);

  const db = supabaseAdmin();
  const { data: property } = await db
    .from("properties")
    .select("id, name, nightly_rate_cents, cleaning_fee_cents, tax_rate_bps, max_guests, min_nights, published")
    .eq("slug", slug).single();
  if (!property?.published) return bad("Property not found", 404);
  if (guests > property.max_guests) return bad(`This property sleeps up to ${property.max_guests}`);
  if (nights < property.min_nights) return bad(`Minimum stay is ${property.min_nights} nights`);

  // TODO: apply pricing_rules for seasonal rates.
  const subtotal = property.nightly_rate_cents * nights;
  const cleaning = property.cleaning_fee_cents;
  const tax = taxCents(subtotal + cleaning, property.tax_rate_bps);
  const total = subtotal + cleaning + tax;

  const { data: booking, error } = await db
    .from("bookings")
    .insert({
      property_id: property.id, guest_name: guestName, guest_email: guestEmail, guest_count: guests,
      check_in: checkIn, check_out: checkOut, source: "direct", status: "pending",
      subtotal_cents: subtotal, cleaning_fee_cents: cleaning, tax_cents: tax, total_cents: total,
    })
    .select("id").single();
  if (error || !booking) {
    // 23P01 = exclusion_violation: dates overlap another stay
    const taken = error?.code === "23P01";
    return bad(taken ? "Those dates are no longer available" : (error?.message ?? "Could not hold the dates"), taken ? 409 : 500);
  }

  const line = (name: string, unit_amount: number, quantity = 1, description?: string) => ({
    quantity, price_data: { currency: "usd", unit_amount, product_data: { name, description } },
  });
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: guestEmail,
    line_items: [
      line(`${property.name}: nightly rate`, property.nightly_rate_cents, nights, `${checkIn} to ${checkOut}, ${guests} guest${guests > 1 ? "s" : ""}`),
      ...(cleaning > 0 ? [line("Cleaning fee", cleaning)] : []),
      ...(tax > 0 ? [line("Lodging tax", tax)] : []),
    ],
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
