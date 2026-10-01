"use client";
import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { startCheckout, type BookingState } from "./actions";
import type { Property } from "@/lib/data";

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const nightsBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
const addDays = (iso: string, d: number) => { const x = new Date(iso + "T00:00:00Z"); x.setUTCDate(x.getUTCDate() + d); return x.toISOString().slice(0, 10); };

export default function BookingPanel({ p, today, minNights, taxRateBps }: { p: Property; today: string; minNights: number; taxRateBps: number }) {
  const [state, action, pending] = useActionState<BookingState, FormData>(startCheckout, {});
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;

  const quote = useMemo(() => {
    if (!(nights > 0)) return null;
    const subtotal = p.nightlyRate * nights;
    const tax = Math.round(((subtotal + p.cleaningFee) * taxRateBps) / 10_000);
    return { subtotal, tax, total: subtotal + p.cleaningFee + tax };
  }, [nights, p.nightlyRate, p.cleaningFee, taxRateBps]);

  const field = (name: string) =>
    `ui mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-deep/40 ${state.field === name ? "border-deep ring-2 ring-deep/30" : "border-line"}`;
  const label = "caps-tight block text-[0.6rem] text-deep";

  return (
    <>
      <aside id="book" className="h-fit scroll-mt-24 rounded-3xl border border-line bg-white p-6 shadow-lg shadow-dusk/10 lg:sticky lg:top-24">
        <p className="display text-3xl text-charcoal">{money(p.nightlyRate)} <span className="ui text-sm not-italic text-muted">/ night</span></p>
        <p className="ui mt-1 text-xs text-muted">+ {money(p.cleaningFee)} cleaning · {minNights}-night minimum · lodging tax added below</p>

        <form action={action} className="mt-5 space-y-3 text-sm" aria-describedby="booking-note">
          <input type="hidden" name="slug" value={p.slug} />
          <div className="grid grid-cols-2 gap-3">
            <label className={label}>Check in
              <input required name="check_in" type="date" min={today} value={checkIn}
                onChange={(e) => { setCheckIn(e.target.value); if (checkOut && e.target.value && nightsBetween(e.target.value, checkOut) < minNights) setCheckOut(addDays(e.target.value, minNights)); }}
                className={field("check_in")} />
            </label>
            <label className={label}>Check out
              <input required name="check_out" type="date" min={checkIn ? addDays(checkIn, minNights) : addDays(today, minNights)} value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)} className={field("check_out")} />
            </label>
          </div>
          <label className={label}>Guests<input required name="guests" type="number" min={1} max={p.guests} defaultValue={2} className={field("guests")} /></label>
          <label className={label}>Name<input required name="guest_name" autoComplete="name" className={field("guest_name")} /></label>
          <label className={label}>Email<input required name="guest_email" type="email" autoComplete="email" className={field("guest_email")} /></label>

          {quote && (
            <dl className="ui mt-2 space-y-1 rounded-xl bg-mist p-3 text-xs text-charcoal">
              <div className="flex justify-between"><dt>{money(p.nightlyRate)} × {nights} night{nights > 1 ? "s" : ""}</dt><dd>{money(quote.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Cleaning fee</dt><dd>{money(p.cleaningFee)}</dd></div>
              <div className="flex justify-between"><dt>Lodging tax</dt><dd>{money(quote.tax)}</dd></div>
              <div className="flex justify-between border-t border-line pt-1 font-medium"><dt>Total</dt><dd>{money(quote.total)}</dd></div>
            </dl>
          )}

          <label className={`flex items-start gap-2 text-xs leading-snug text-charcoal ${state.field === "accept_policies" ? "rounded-lg ring-2 ring-deep/30 p-1" : ""}`}>
            <input type="checkbox" name="accept_policies" required className="mt-0.5 h-4 w-4 accent-[#2f6f86]" />
            <span>
              I agree to the <Link href="/legal/policies#cancellation" className="text-deep underline" target="_blank">cancellation policy</Link>, the{" "}
              <Link href="/legal/policies#damage" className="text-deep underline" target="_blank">damage policy</Link> and the{" "}
              <Link href="/legal/terms#guests" className="text-deep underline" target="_blank">guest terms</Link>.
            </span>
          </label>

          {state.error && (
            <p role="alert" className="ui rounded-lg border border-deep/30 bg-mist px-3 py-2 text-xs text-charcoal">{state.error}</p>
          )}

          <button type="submit" disabled={pending} className="caps-tight mt-2 w-full rounded-full bg-deep py-3 text-[0.7rem] text-white transition hover:bg-dusk disabled:opacity-60">
            {pending ? "Opening secure checkout" : quote ? `Book for ${money(quote.total)}` : "Book and pay"}
          </button>
          <p id="booking-note" className="text-center text-xs text-muted">Secure payment by Stripe. You&apos;ll hear from Christi or Melissa before you arrive.</p>
        </form>
        {p.airbnbUrl && (
          <p className="ui mt-4 border-t border-line pt-4 text-center text-xs text-muted">
            Prefer Airbnb? <a href={p.airbnbUrl} target="_blank" rel="noopener" className="text-deep underline">See this home on Airbnb</a>
          </p>
        )}
      </aside>

      {/* Phone: sticky bar so the price and Book button are always one tap away */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur lg:hidden">
        <p className="ui text-sm"><span className="font-medium">{money(p.nightlyRate)}</span> <span className="text-muted">/ night</span></p>
        <a href="#book" className="caps-tight rounded-full bg-deep px-5 py-2.5 text-[0.7rem] text-white">Check dates</a>
      </div>
    </>
  );
}
