import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import PropertyImage from "@/components/PropertyImage";
import SearchBar from "@/components/SearchBar";
import SectionHeading from "@/components/SectionHeading";
import { getProperties } from "@/lib/data";

const pillars = [
  ["Genuinely reachable", "Two owners, real phone numbers. Guests and owners talk to the people who manage the home."],
  ["Hands-on with every home", "Inspections, turnovers, and little fixes handled before anyone notices."],
  ["22 years in the region", "Real estate, sales, and short-term rental management, all rooted in Puget Sound."],
];

export default async function Home() {
  const properties = await getProperties();
  const hero = properties[0];
  return (
    <main>
      {/* Hero: full-bleed, short headline, search strip (Wander layout) */}
      <section className="relative isolate">
        <PropertyImage slug="hero" name={hero?.name ?? "West Coast Hosting Co"} className="absolute inset-0 -z-10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-charcoal/20 via-transparent to-charcoal/55" />
        <div className="mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-end px-4 pb-14 pt-32 text-white sm:px-6">
          <p className="caps text-xs text-white/80">Short-term rental management &amp; co-hosting</p>
          <h1 className="display mt-3 max-w-4xl text-5xl leading-[1.05] sm:text-7xl">
            Three homes. Three views.<br />One unforgettable Washington.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            From the shores of Hood Canal to downtown Gig Harbor to the foothills near Mount Rainier.
          </p>
          <div className="mt-10"><SearchBar /></div>
        </div>
      </section>

      {/* Homes */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Our homes" title="Coast to Cascades" intro="Each home is one we know personally, cared for like our own." />
          <Link href="/properties" className="caps-tight text-[0.7rem] text-teal hover:text-teal-dark">See all homes →</Link>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* How we host */}
      <section className="bg-mist">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <SectionHeading eyebrow="How we host" title="Two friends, real homes, no faceless platform" align="center" />
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {pillars.map(([t, d]) => (
              <div key={t} className="text-center">
                <h3 className="display text-2xl text-teal">{t}</h3>
                <p className="mt-3 leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Owner CTA */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-teal text-white md:grid-cols-2">
          <div className="px-8 py-14 sm:px-14">
            <p className="caps text-xs text-white/75">For homeowners</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">Your home, hosted with care.</h2>
            <p className="mt-4 max-w-md text-white/85">
              Listing, pricing, guest messaging, cleaning, and transparent monthly statements. You keep the keys, and the view.
            </p>
            <Link href="/services" className="caps-tight mt-8 inline-block rounded-full bg-white px-6 py-3 text-[0.7rem] text-teal hover:bg-cream">What we handle</Link>
          </div>
          <PropertyImage slug="the-bedrock" name="The Bedrock" className="h-full min-h-72" />
        </div>
      </section>
    </main>
  );
}
