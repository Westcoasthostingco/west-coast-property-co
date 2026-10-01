import type { Metadata } from "next";
import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import PropertyImage from "@/components/PropertyImage";
import SearchBar from "@/components/SearchBar";
import SectionHeading from "@/components/SectionHeading";
import CoastToCascades from "@/components/art/CoastToCascades";
import JsonLd from "@/components/seo/JsonLd";
import { getProperties, money, type Property } from "@/lib/data";
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
  const names = properties.map((p) => p.name);
  const joinNames = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}` : xs.join(""));
  const petFriendly = properties.filter((p) => p.amenities.some((a) => /pet[- ]friendly|pets? (allowed|welcome)/i.test(a))).map((p) => p.name);
  const cheapest = properties.reduce<Property | undefined>((m, p) => (!m || p.nightlyRate < m.nightlyRate ? p : m), undefined);
  const where = properties.map((p) => `${p.name} is in ${p.city}, Washington and sleeps ${p.guests}`).join("; ");
  return [
    {
      question: "How do I book one of your homes?",
      answer: `Book direct on each home's page: choose your dates and number of guests, then pay securely with Stripe. Christi or Melissa will be in touch before you arrive. ${joinNames(names)} are also listed on Airbnb if you prefer to book there.`,
    },
    {
      question: "What is included in the price?",
      answer: `The nightly rate plus one cleaning fee per stay${cheapest ? `; rates start at ${money(cheapest.nightlyRate)} a night` : ""}. Washington lodging tax is added at checkout. There is no separate booking fee when you reserve direct with us.`,
    },
    {
      question: "Is there a minimum stay?",
      answer: "Yes, two nights. The availability calendar on each home's page shows open dates, and you can search all homes at once by region, dates, and guest count.",
    },
    {
      question: "Are pets allowed?",
      answer:
        petFriendly.length > 0
          ? `${joinNames(petFriendly)} ${petFriendly.length > 1 ? "are" : "is"} pet friendly. For the other homes, email hello@westcoasthostingco.com before booking and we will let you know what is possible.`
          : "Email hello@westcoasthostingco.com before booking and we will let you know what is possible for the home you have in mind.",
    },
    {
      question: "Where are the homes, and who will I be dealing with?",
      answer: `${where}. Every stay is hosted by Christi Young and Melissa Heckman, the two owners of West Coast Hosting Co, who answer their own phones: 253.278.6818 or 503.860.8115.`,
    },
  ];
}

const pillars = [
  ["Genuinely reachable", "Two owners, real phone numbers. Guests and owners talk to the people who manage the home."],
  ["Hands-on with every home", "Inspections, turnovers, and little fixes handled before anyone notices."],
  ["22 years of combined experience", "Real estate, sales, and short-term rental management, all rooted in Puget Sound."],
];

export default async function Home() {
  const properties = await getProperties();
  const hero = properties[0];
  const questions = faqs(properties);
  return (
    <main>
      <JsonLd data={[webSiteJsonLd(), faqJsonLd(questions)]} />
      {/* Hero: full-bleed, short headline, search strip (Wander layout) */}
      <section className="relative isolate">
        <PropertyImage slug="hero" name="The deck at The Grand View over Puget Sound" priority sizes="100vw" className="absolute inset-0 -z-10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/45 via-ink/15 to-ink/70" />
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
          <Link href="/properties" className="caps-tight text-[0.7rem] text-deep hover:text-deep">See all homes →</Link>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* How we host */}
      <section className="bg-mist">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
          <CoastToCascades className="w-full rounded-3xl shadow-lg shadow-teal/10" />
          <div>
          <SectionHeading eyebrow="How we host" title="Two friends, real homes, no faceless platform" />
          <div className="mt-10 grid gap-8 sm:grid-cols-3 lg:grid-cols-1">
            {pillars.map(([t, d]) => (
              <div key={t}>
                <h3 className="display text-2xl text-deep">{t}</h3>
                <p className="mt-2 leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* Owner CTA */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-deep text-white md:grid-cols-2">
          <div className="px-8 py-14 sm:px-14">
            <p className="caps text-xs text-white/75">For homeowners</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">Your home, hosted with care.</h2>
            <p className="mt-4 max-w-md text-white/85">
              Listing, pricing, guest messaging, cleaning, and transparent monthly statements. You keep the keys, and the view.
            </p>
            <Link href="/services" className="caps-tight mt-8 inline-block rounded-full bg-white px-6 py-3 text-[0.7rem] text-deep hover:bg-cream">What we handle</Link>
          </div>
          <PropertyImage slug="the-bedrock" name="The Bedrock" className="h-full min-h-72" />
        </div>
      </section>

      {/* FAQ: the questions guests ask before booking */}
      <section className="bg-mist">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <SectionHeading eyebrow="Good to know" title="Questions before you book" intro="Short answers to what guests ask us most. Anything else, just call." />
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
