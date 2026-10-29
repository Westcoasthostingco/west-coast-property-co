import type { Metadata } from "next";
import Image from "next/image";
import CoastToCascades from "@/components/art/CoastToCascades";
import JsonLd from "@/components/seo/JsonLd";
import { FOUNDERS, personJsonLd } from "@/lib/seo";

const description =
  "Meet Christi Young and Melissa Heckman, the Gig Harbor friends behind West Coast Hosting Co, a showcase of vacation homes from Hood Canal to Mount Rainier.";
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
  { name: "Christi Young", photo: "/team/christi-young.webp", facts: ["21 years in Gig Harbor", "22 years in real estate"], favorite: "The Devoted Kiss Cafe" },
  { name: "Melissa Heckman", photo: "/team/melissa-heckman.webp" },
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
            <p>We are Christi and Melissa, longtime friends and business partners from Gig Harbor, with 22 years of combined experience in real estate and sales, all rooted here in the Puget Sound region.</p>
            <p>We built this site to show off four Washington homes the way a listing page can&apos;t: bigger photos, the neighborhood, the view, and what&apos;s worth doing nearby, from the shores of Hood Canal to the heart of downtown Gig Harbor to the foothills near Mount Rainier.</p>
            <p>When you find the one you want, each home&apos;s page takes you straight to its Airbnb or Vrbo listing, where you see live prices and book with the host.</p>
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
      <section className="bg-mist">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="caps text-xs text-deep">At a glance</p>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">
            {["Four homes, from Hood Canal to Mount Rainier", "Based in Gig Harbor, Washington", "Booked on Airbnb and Vrbo"].map((t) => (
              <li key={t} className="display text-2xl text-charcoal">{t}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
