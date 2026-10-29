import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CoastToCascades from "@/components/art/CoastToCascades";
import JsonLd from "@/components/seo/JsonLd";
import { FOUNDERS, personJsonLd } from "@/lib/seo";

const description =
  "Meet Christi Young and Melissa Heckman, the Gig Harbor friends behind West Coast Hosting Co, caring for vacation homes from Hood Canal to Mount Rainier and welcoming new homeowners.";
export const metadata: Metadata = {
  title: "About Christi and Melissa",
  description,
  alternates: { canonical: "/about" },
  openGraph: { type: "website", url: "/about", title: "About | West Coast Hosting Co", description },
  twitter: { card: "summary_large_image", title: "About | West Coast Hosting Co", description },
};

// Headshots live in public/team/. A founder without one shows her initials.
// facts and favorite are optional; only add what she has said is true.
const team: { name: string; photo?: string; facts?: string[]; favorite?: string }[] = [
  { name: "Christi Young", photo: "/team/christi-young.webp", facts: ["21 years in Gig Harbor", "20 years in real estate"], favorite: "The Devoted Kiss Cafe" },
  { name: "Melissa Heckman", photo: "/team/melissa-heckman.webp" },
];

// What owners get, kept to what we actually do today.
const forOwners = [
  ["Small by design", "We take on a handful of homes so each one gets our full attention. We know every home, every cleaner, and every owner by name."],
  ["A direct line to us", "Call or text Christi or Melissa. You'll hear back from one of us, not a call center or a ticket queue."],
  ["Turnovers handled", "We schedule every cleaning around your bookings. Our cleaners work from a checklist, send photos, and flag anything that needs fixing."],
];

export default function About() {
  return (
    <main>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": FOUNDERS.map(personJsonLd) }} />
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="caps text-xs text-deep">About us</p>
          <h1 className="display mt-2 text-5xl text-deep">Meet West Coast Hosting Co.</h1>
          <div className="mt-8 space-y-5 text-lg leading-relaxed">
            <p>We&apos;re Christi Young and Melissa Heckman, the team behind West Coast Hosting Co: longtime friends, Gig Harbor locals, and business partners with more than two decades of real estate and sales experience between us, all here in the Puget Sound region.</p>
            <p>We believe a great short-term rental comes down to the people behind it. So we keep things small and hands-on. Owners and guests deal with us directly, never with a call center or a faceless corporation.</p>
            <p>Today we care for a small collection of homes across Western Washington, from the shores of Hood Canal to the foothills of Mount Rainier.</p>
            <p>For guests, that means a home that&apos;s spotless, thoughtfully styled, and ready when you arrive. Each home&apos;s page links straight to its Airbnb or Vrbo listing, where you&apos;ll find live prices and booking.</p>
          </div>
          <p className="display mt-10 text-3xl text-deep">Coast to Cascades.</p>
        </div>
        <CoastToCascades className="w-full rounded-3xl shadow-lg shadow-teal/10" />
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <p className="caps text-xs text-deep">The team</p>
        <h2 className="display mt-2 text-4xl text-deep">Christi and Melissa</h2>
        <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:max-w-4xl">
          {team.map((m) => (
            <li key={m.name}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-mist shadow-lg shadow-teal/10">
                {m.photo ? (
                  <Image src={m.photo} alt={`${m.name}, co-founder of West Coast Hosting Co`} fill sizes="(min-width: 1024px) 28rem, (min-width: 640px) 50vw, 100vw" className="object-cover object-[50%_35%]" />
                ) : (
                  <span aria-hidden className="display absolute inset-0 flex items-center justify-center text-7xl text-deep/40">
                    {m.name.split(" ").map((w) => w[0]).join("")}
                  </span>
                )}
              </div>
              <p className="display mt-4 text-2xl text-charcoal">{m.name}</p>
              <p className="text-muted">Co-founder, Gig Harbor</p>
              {m.facts && <p className="ui mt-3 text-sm text-charcoal">{m.facts.join(" · ")}</p>}
              {m.favorite && <p className="ui mt-1 text-sm text-muted">Favorite local spot: <span className="text-deep">{m.favorite}</span></p>}
            </li>
          ))}
        </ul>
      </section>
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
          <p className="mt-12 max-w-2xl text-lg leading-relaxed text-white/85">We see every home as a partnership. When your rental does well and your guests leave happy, we&apos;ve done our job.</p>
          <div className="ui mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/contact" className="rounded-full bg-white px-6 py-3 text-sm font-medium text-deep transition hover:bg-mist">Tell us about your home</Link>
            <a href="tel:+12532786818" className="text-sm text-white/85 hover:text-white">or call 253.278.6818</a>
          </div>
        </div>
      </section>
      <section className="bg-mist">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="caps text-xs text-deep">At a glance</p>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">
            {["Homes from Hood Canal to Mount Rainier", "Based in Gig Harbor, Washington", "Booked on Airbnb and Vrbo"].map((t) => (
              <li key={t} className="display text-2xl text-charcoal">{t}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
