"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { airbnbLink, nightsBetween, vrboLink } from "@/lib/platform-links";

// Guest-facing date picker. The site takes no bookings: picking dates here
// opens the home's Airbnb or Vrbo listing with those dates and guests filled
// in, where the live price and availability are shown.

type Props = {
  name: string;
  airbnbUrl?: string | null;
  vrboUrl?: string | null;
  maxGuests: number;
  minNights: number;
  today: string;
  initial?: { checkIn?: string; checkOut?: string; guests?: number };
};

const addDays = (iso: string, n: number) => new Date(Date.parse(iso) + n * 86_400_000).toISOString().slice(0, 10);
const pretty = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  );
}

export default function CheckDates({ name, airbnbUrl, vrboUrl, maxGuests, minNights, today, initial }: Props) {
  const [checkIn, setCheckIn] = useState(initial?.checkIn && initial.checkIn >= today ? initial.checkIn : "");
  const [checkOut, setCheckOut] = useState(initial?.checkOut && initial.checkIn && initial.checkOut > initial.checkIn ? initial.checkOut : "");
  const [guests, setGuests] = useState(Math.min(Math.max(initial?.guests ?? 2, 1), maxGuests));

  const nights = nightsBetween(checkIn, checkOut);
  const tooShort = nights > 0 && nights < minNights;
  const q = { checkIn, checkOut, guests };
  const links = useMemo(() => ({
    airbnb: airbnbUrl ? airbnbLink(airbnbUrl, q) : null,
    vrbo: vrboUrl ? vrboLink(vrboUrl, q) : null,
  }), [airbnbUrl, vrboUrl, checkIn, checkOut, guests]); // eslint-disable-line react-hooks/exhaustive-deps

  const field = "ui mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-3 text-sm text-charcoal outline-none transition focus:border-deep focus:ring-2 focus:ring-deep/15";
  const label = "caps-tight text-[0.6rem] text-muted";
  const btn = "ui inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-medium tracking-wide transition";

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm shadow-dusk/5">
      <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
        <div className="p-6 sm:p-8">
          <p className="caps text-xs text-deep">Dates &amp; price</p>
          <h3 className="display mt-2 text-3xl text-charcoal">When would you like to stay?</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
            Prices and availability are live on {[airbnbUrl && "Airbnb", vrboUrl && "Vrbo"].filter(Boolean).join(" and ") || "the platform"}. Pick your dates and we&apos;ll open {name} with them filled in.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <label className="block">
              <span className={label}>Check in</span>
              <input type="date" value={checkIn} min={today}
                onChange={(e) => {
                  const v = e.target.value;
                  setCheckIn(v);
                  if (v && (!checkOut || checkOut <= v)) setCheckOut(addDays(v, minNights));
                }}
                className={field} />
            </label>
            <label className="block">
              <span className={label}>Check out</span>
              <input type="date" value={checkOut} min={checkIn ? addDays(checkIn, 1) : addDays(today, 1)}
                onChange={(e) => setCheckOut(e.target.value)} className={field} />
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-line px-4 py-3">
            <div>
              <p className={label}>Guests</p>
              <p className="ui mt-0.5 text-sm text-charcoal">{guests} {guests === 1 ? "guest" : "guests"} <span className="text-muted">· sleeps {maxGuests}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Fewer guests" disabled={guests <= 1} onClick={() => setGuests((g) => Math.max(1, g - 1))}
                className="ui flex h-9 w-9 items-center justify-center rounded-full border border-line text-lg text-deep transition hover:border-deep disabled:opacity-30">−</button>
              <button type="button" aria-label="More guests" disabled={guests >= maxGuests} onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                className="ui flex h-9 w-9 items-center justify-center rounded-full border border-line text-lg text-deep transition hover:border-deep disabled:opacity-30">+</button>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 bg-mist/60 p-6 sm:p-8">
          <div aria-live="polite">
            {nights > 0 ? (
              <>
                <p className="caps-tight text-[0.6rem] text-muted">Your stay</p>
                <p className="display mt-2 text-4xl text-charcoal">{nights} {nights === 1 ? "night" : "nights"}</p>
                <p className="ui mt-1 text-sm text-charcoal">{pretty(checkIn)} to {pretty(checkOut)}</p>
                <p className="ui mt-1 text-xs text-muted">{guests} {guests === 1 ? "guest" : "guests"}</p>
                {tooShort && <p className="ui mt-3 rounded-lg bg-white px-3 py-2 text-xs text-deep">This home usually has a {minNights}-night minimum. The platform will confirm.</p>}
              </>
            ) : (
              <>
                <p className="caps-tight text-[0.6rem] text-muted">Your stay</p>
                <p className="display mt-2 text-3xl text-charcoal/70">Choose your dates</p>
                <p className="ui mt-2 text-xs text-muted">Usually a {minNights}-night minimum · times and house rules on the listing</p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {links.airbnb && (
              <a href={links.airbnb} target="_blank" rel="noopener noreferrer" className={`${btn} bg-deep text-white hover:bg-dusk`} aria-label={`See ${nights ? "price for these dates" : "availability"} for ${name} on Airbnb (opens in a new tab)`}>
                {nights ? "See price on Airbnb" : "Open on Airbnb"} <Arrow />
              </a>
            )}
            {links.vrbo && (
              <a href={links.vrbo} target="_blank" rel="noopener noreferrer" className={`${btn} ${links.airbnb ? "border border-deep text-deep hover:bg-deep hover:text-white" : "bg-deep text-white hover:bg-dusk"}`} aria-label={`See ${nights ? "price for these dates" : "availability"} for ${name} on Vrbo (opens in a new tab)`}>
                {nights ? "See price on Vrbo" : "Open on Vrbo"} <Arrow />
              </a>
            )}
            {!links.airbnb && !links.vrbo && (
              <Link href="/contact" className={`${btn} bg-deep text-white hover:bg-dusk`}>Ask about this home</Link>
            )}
            <p className="ui text-center text-[0.7rem] text-muted">You book with the host and pay on the platform. Opens in a new tab.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
