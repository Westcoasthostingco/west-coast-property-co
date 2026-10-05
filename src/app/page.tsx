import type { Metadata } from "next";
import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import PropertyImage from "@/components/PropertyImage";
import SearchBar from "@/components/SearchBar";
import SectionHeading from "@/components/SectionHeading";
import CoastToCascades from "@/components/art/CoastToCascades";
import Testimonials from "@/components/Testimonials";
import { getListingContent } from "@/lib/listing-content";
import JsonLd from "@/components/seo/JsonLd";
import { getProperties, type Property } from "@/lib/data";
import { DEFAULT_DESCRIPTION, SITE_NAME, TAGLINE, faqJsonLd, webSiteJsonLd, type Faq } from "@/lib/seo";

const homeTitle = `${SITE_NAME} | ${TAGLINE} Vacation Rentals`;
export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", title: homeTitle, description: DEFAULT_DESCRIPTION },
  twitter: { card: "summary_large_image", title: homeTitle, description: DEFAULT_DESCRIPTION },
};

// Answers are built from live property data so they stay true as homes change.
function faqs(properties: Property[]): Faq[] {
  const joinNames = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}` : xs.join(""));
  const onVrbo = properties.filter((p) => p.vrboUrl).map((p) => p.name);
  const petFriendly = properties.filter((p) => p.amenities.some((a) => /pet[- ]friendly|pets? (allowed|welcome)/i.test(a))).map((p) => p.name);
  const where = properties.map((p) => `${p.name} is in ${p.city}, Washington and sleeps ${p.guests}`).join("; ");
  return [
    {
      question: "How do I book one of these homes?",
      answer: `Each home's page links to its listing on Airbnb${onVrbo.length > 0 ? `, and ${joinNames(onVrbo)} ${onVrbo.length > 1 ? "are" : "is"} also on Vrbo` : ""}. You book with the host, pay, and manage your reservation on the platform, under its terms. This website does not take bookings or payments.`,
    },
    {
      question: "What is included in the price?",
      answer: "Prices, fees, and taxes are set and shown on each home's Airbnb or Vrbo listing, and you pay them there when you book. Check the listing for the full total for your dates.",
    },
    {
      question: "Who hosts my stay?",
      answer: "The host named on the Airbnb or Vrbo listing. Check-in details, house rules, the cancellation policy, and help during your stay all come from your host through the platform's messages.",
    },
    {
      question: "Are pets allowed?",
      answer:
        petFriendly.length > 0
          ? `${joinNames(petFriendly)} ${petFriendly.length > 1 ? "list" : "lists"} pets as welcome. For the others, check the house rules on the listing or message the host on the platform before booking.`
          : "Check the house rules on the listing, or message the host on the platform before booking.",
    },
    {
      question: "Where are the homes?",
      answer: `${where}. Use the search above to filter by area and guest count, then open a home to see its listing.`,
    },
    {
      question: "Who runs this website?",
      answer: "West Coast Hosting Co, Christi Young and Melissa Heckman of Gig Harbor. Questions about the site or a home's details: hello@westcoasthostingco.com or 253.278.6818. For anything about a reservation, message your host on Airbnb or Vrbo.",
    },
  ];
}

const steps = [
  ["Explore", "Photos, the view, the neighborhood, and what's nearby, all in one place for each home."],
  ["Open the listing", "Each home links to its Airbnb or Vrbo listing, where the live calendar and prices are."],
  ["Book with the host", "Check the house rules and cancellation policy, then book with the host on the platform."],
];

const regions = [
  { name: "Gig Harbor", slug: "the-grand-view", blurb: "Waterfront shops and restaurants, with Puget Sound and Mount Rainier on the horizon." },
  { name: "Hood Canal", slug: "the-leonora-by-the-sea", blurb: "Oyster beaches, Olympic Mountain views, and trailheads into Olympic National Park." },
  { name: "Randle", slug: "the-bedrock", blurb: "Mountain air and quiet forest near Packwood, Mount Rainier, and White Pass." },
];

export default async function Home() {
  const properties = await getProperties();
  const questions = faqs(properties);
  const leo = properties.find((p) => p.slug === "the-leonora-by-the-sea");
  const listing = leo ? getListingContent(leo.slug) : undefined;
  const leonoraRating = leo && listing?.listingRating && leo.airbnbUrl
    ? { ...listing.listingRating, home: leo.name, href: leo.airbnbUrl }
    : undefined;
  return (
    <main>
      <JsonLd data={[webSiteJsonLd(), faqJsonLd(questions)]} />
      {/* Hero: full-bleed, short headline, search strip (Wander layout) */}
      <section className="relative isolate">
        <PropertyImage slug="hero" name="The deck at The Grand View over Puget Sound" priority sizes="100vw" className="absolute inset-0 -z-10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/45 via-ink/15 to-ink/70" />
        <div className="mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-end px-4 pb-14 pt-32 text-white sm:px-6">
          <p className="caps text-xs text-white/80">Vacation homes in Washington</p>
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
          <SectionHeading eyebrow="The homes" title="Coast to Cascades" intro="Three homes, three very different views of Washington. Explore them here, then book on Airbnb or Vrbo." />
          <Link href="/properties" className="caps-tight text-[0.7rem] text-deep hover:text-deep">See all homes →</Link>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-mist">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
          <CoastToCascades className="w-full rounded-3xl shadow-lg shadow-teal/10" />
          <div>
          <SectionHeading eyebrow="How it works" title="Explore here, book on the platform" />
          <div className="mt-10 grid gap-8 sm:grid-cols-3 lg:grid-cols-1">
            {steps.map(([t, d], i) => (
              <div key={t}>
                <h3 className="display text-2xl text-deep"><span className="ui mr-2 text-sm text-wave">{i + 1}</span>{t}</h3>
                <p className="mt-2 leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* Regions */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <SectionHeading eyebrow="Find your corner" title="Shoreline, harbor, or mountains" />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {regions.map((r) => (
            <Link key={r.name} href={`/properties?region=${encodeURIComponent(r.name)}`} className="group block overflow-hidden rounded-3xl bg-deep text-white">
              <PropertyImage slug={r.slug} name={r.name} className="aspect-[4/3] transition group-hover:opacity-90" />
              <div className="px-7 py-7">
                <h3 className="display text-3xl">{r.name}</h3>
                <p className="mt-2 text-white/85">{r.blurb}</p>
                <p className="caps-tight mt-5 text-[0.7rem] text-wave">See homes →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Owner reviews, plus the guest rating from the platform listing */}
      <Testimonials rating={leonoraRating} />

      {/* FAQ: what visitors ask before booking */}
      <section className="bg-mist">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <SectionHeading eyebrow="Good to know" title="Questions before you book" intro="Short answers to the questions we hear most." />
          <dl className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {questions.map((f) => (
              <div key={f.question}>
                <dt className="display text-2xl text-deep">{f.question}</dt>
                <dd className="mt-2 leading-relaxed text-muted">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
