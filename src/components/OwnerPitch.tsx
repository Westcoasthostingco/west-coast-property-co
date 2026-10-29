import Link from "next/link";
import { pricingTeaser } from "@/lib/pricing";

// What owners get, kept to what we actually do today. Shown on the home and About pages.
const forOwners = [
  ["Small by design", "We take on a handful of homes so each one gets our full attention. We know every home, every cleaner, and every owner by name."],
  ["A direct line to us", "Call or text Christi or Melissa. You'll hear back from one of us, not a call center or a ticket queue."],
  ["Turnovers handled", "We schedule every cleaning around your bookings. Our cleaners work from a checklist, send photos, and flag anything that needs fixing."],
];

export default function OwnerPitch() {
  return (
    <section className="bg-deep text-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <p className="caps text-xs text-wave">For homeowners</p>
        <h2 className="display mt-2 text-4xl sm:text-5xl">Why owners choose us</h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">Own a home in the Puget Sound region and thinking about renting it? Big management firms spread their attention across hundreds of homes. We&apos;d rather be your local partner.</p>
        <ul className="mt-12 grid gap-8 md:grid-cols-3">
          {forOwners.map(([t, d]) => (
            <li key={t}>
              <h3 className="display text-2xl">{t}</h3>
              <p className="mt-2 leading-relaxed text-white/80">{d}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-white/10 px-7 py-6 ring-1 ring-white/15">
          <p className="display text-2xl sm:text-3xl">Co-hosting from {pricingTeaser.cohostFrom}. Launch packages from {pricingTeaser.launchFrom}.</p>
          <Link href="/services" className="ui rounded-full border border-white px-6 py-3 text-sm font-medium transition hover:bg-white hover:text-deep">See pricing</Link>
        </div>
        <p className="mt-12 max-w-2xl text-lg leading-relaxed text-white/85">We see every home as a partnership. When your rental does well and your guests leave happy, we&apos;ve done our job.</p>
        <div className="ui mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href="/contact" className="rounded-full bg-white px-6 py-3 text-sm font-medium text-deep transition hover:bg-mist">Tell us about your home</Link>
          <a href="tel:+12532786818" className="text-sm text-white/85 hover:text-white">or call 253.278.6818</a>
        </div>
      </div>
    </section>
  );
}
