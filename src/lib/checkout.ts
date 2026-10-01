// Shared checkout logic used by the booking panel (server action) and /api/checkout.
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";
import { appUrl, nightsBetween, stripe, taxCents, todayISO } from "@/lib/stripe";
import { POLICY_VERSION } from "@/lib/legal";

export type CheckoutInput = {
  slug: string; checkIn: string; checkOut: string; guests: number;
  guestName: string; guestEmail: string; acceptedPolicies: boolean;
};
export type CheckoutResult = { url: string } | { error: string; status: number; field?: string };

export function parseCheckoutForm(form: FormData): CheckoutInput {
  return {
    slug: String(form.get("slug") ?? ""),
    checkIn: String(form.get("check_in") ?? ""),
    checkOut: String(form.get("check_out") ?? ""),
    guests: Number(form.get("guests") ?? 1),
    guestName: String(form.get("guest_name") ?? "").trim(),
    guestEmail: String(form.get("guest_email") ?? "").trim(),
    acceptedPolicies: form.get("accept_policies") === "on",
  };
}

// 1. Validates. 2. Inserts a pending booking (the exclusion constraint rejects
//    overlapping stays). 3. Opens Stripe Checkout. Lodging tax is a line item from
//    properties.tax_rate_bps; the owner's share transfers after check-in.
export async function createCheckout(i: CheckoutInput): Promise<CheckoutResult> {
  const bad = (error: string, field?: string, status = 400): CheckoutResult => ({ error, status, field });
  const nights = nightsBetween(i.checkIn, i.checkOut);
  if (!i.slug) return bad("We couldn't tell which home you're booking. Reload and try again.");
  if (!i.checkIn || !i.checkOut || !Number.isFinite(nights)) return bad("Pick a check-in and check-out date.", "check_in");
  if (nights < 1) return bad("Check-out needs to be after check-in.", "check_out");
  if (nights > 90) return bad("For stays over 90 nights, email us and we'll set it up by hand.", "check_out");
  if (i.checkIn < todayISO()) return bad("Check-in can't be in the past.", "check_in");
  if (!Number.isInteger(i.guests) || i.guests < 1) return bad("How many guests are coming?", "guests");
  if (!i.guestName) return bad("Add the name the booking is under.", "guest_name");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.guestEmail)) return bad("That email doesn't look right.", "guest_email");
  if (!i.acceptedPolicies) return bad("Please accept the booking policies to continue.", "accept_policies");
  if (!supabaseConfigured) return bad("Online booking isn't switched on yet. Email hello@westcoasthostingco.com and we'll book you in.", undefined, 503);

  const db = supabaseAdmin();
  const { data: property } = await db
    .from("properties")
    .select("id, name, nightly_rate_cents, cleaning_fee_cents, tax_rate_bps, max_guests, min_nights, published")
    .eq("slug", i.slug).single();
  if (!property?.published) return bad("That home isn't bookable right now.", undefined, 404);
  if (i.guests > property.max_guests) return bad(`This home sleeps up to ${property.max_guests}.`, "guests");
  if (nights < property.min_nights) return bad(`Minimum stay here is ${property.min_nights} nights.`, "check_out");

  // TODO: apply pricing_rules for seasonal rates.
  const subtotal = property.nightly_rate_cents * nights;
  const cleaning = property.cleaning_fee_cents;
  const tax = taxCents(subtotal + cleaning, property.tax_rate_bps);
  const total = subtotal + cleaning + tax;

  const { data: booking, error } = await db
    .from("bookings")
    .insert({
      property_id: property.id, guest_name: i.guestName, guest_email: i.guestEmail, guest_count: i.guests,
      check_in: i.checkIn, check_out: i.checkOut, source: "direct", status: "pending",
      subtotal_cents: subtotal, cleaning_fee_cents: cleaning, tax_cents: tax, total_cents: total,
      accepted_policy_version: POLICY_VERSION,
    })
    .select("id").single();
  if (error || !booking) {
    // 23P01 = exclusion_violation: dates overlap another stay
    if (error?.code === "23P01") return bad("Those dates were just taken. Pick different dates and try again.", "check_in", 409);
    return bad("We couldn't hold those dates. Try again in a moment or email us.", undefined, 500);
  }

  const line = (name: string, unit_amount: number, quantity = 1, description?: string) => ({
    quantity, price_data: { currency: "usd", unit_amount, product_data: { name, description } },
  });
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: i.guestEmail,
      line_items: [
        line(`${property.name}: nightly rate`, property.nightly_rate_cents, nights, `${i.checkIn} to ${i.checkOut}, ${i.guests} guest${i.guests > 1 ? "s" : ""}`),
        ...(cleaning > 0 ? [line("Cleaning fee", cleaning)] : []),
        ...(tax > 0 ? [line("Lodging tax", tax)] : []),
      ],
      payment_intent_data: { transfer_group: booking.id, metadata: { booking_id: booking.id, property_id: property.id } },
      metadata: { booking_id: booking.id },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // hold the dates for 30 minutes
      success_url: `${appUrl()}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/book/cancelled?booking=${booking.id}`,
    });
    await db.from("bookings").update({ stripe_checkout_session_id: session.id }).eq("id", booking.id);
    if (!session.url) throw new Error("Stripe returned no checkout URL");
    return { url: session.url };
  } catch (e) {
    // Release the hold so the dates are not blocked by a failed checkout.
    await db.from("bookings").update({ status: "cancelled", cancelled_at: new Date().toISOString(), notes: "checkout failed to start" }).eq("id", booking.id);
    await db.from("audit_log").insert({ actor: "checkout", action: "stripe_error", entity: "booking", entity_id: booking.id, detail: { message: (e as Error).message } });
    return bad("Payment couldn't start. Nothing was charged. Try again or email us.", undefined, 502);
  }
}
