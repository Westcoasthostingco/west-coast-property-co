// Site-wide SEO constants and schema.org JSON-LD builders.
// Everything here is derived from Property data or the public facts about the
// business. Street addresses are not public, so addresses stop at locality.
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Property } from "./mock";
import { money } from "./mock";

export const SITE_URL = "https://www.westcoasthostingco.com";
export const SITE_NAME = "West Coast Hosting Co";
export const TAGLINE = "Coast to Cascades";
export const DEFAULT_DESCRIPTION =
  "Short-term rental management, co-hosting, and three vacation homes from Hood Canal to Mount Rainier. Gig Harbor, WA. Book direct with Christi and Melissa.";

export const CONTACT = {
  email: "hello@westcoasthostingco.com",
  phones: ["+1-253-278-6818", "+1-503-860-8115"],
  phonesDisplay: ["253.278.6818", "503.860.8115"],
  locality: "Gig Harbor",
  region: "WA",
  country: "US",
};

export const FOUNDERS = ["Christi Young", "Melissa Heckman"] as const;

export const SERVICE_AREA = ["Gig Harbor", "Hood Canal", "Randle", "Puget Sound", "Olympic Peninsula", "Mount Rainier", "Washington"];

export const absUrl = (path = "/") => new URL(path, SITE_URL).toString();
export const propertyUrl = (p: Pick<Property, "slug">) => absUrl(`/properties/${p.slug}`);

/** Public path of the first real photo for a home, when one exists on disk. */
export function propertyPhoto(slug: string): string | null {
  const rel = `/photos/${slug}-1.webp`;
  try {
    return existsSync(join(process.cwd(), "public", rel)) ? rel : null;
  } catch {
    return null;
  }
}

const list = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;

/** A 140 to 160 character description for a property page, written for people. */
export function propertyDescription(p: Property): string {
  const base = `${p.name} is a ${p.bedrooms}-bedroom, ${p.bathrooms}-bath vacation rental in ${p.city}, WA sleeping ${p.guests}.`;
  const rate = `From ${money(p.nightlyRate)} a night, book direct.`;
  for (let n = Math.min(3, p.amenities.length); n >= 1; n--) {
    const s = `${base} ${p.amenities.slice(0, n).join(", ")}. ${rate}`;
    if (s.length <= 160) return s;
  }
  const short = `${base} ${rate}`;
  return short.length <= 160 ? short : short.slice(0, 157).replace(/\s+\S*$/, "") + "...";
}

/** Longer prose for llms.txt and AI answer engines; no character limit. */
export function propertyLongDescription(p: Property): string {
  const bits = [
    `${p.name} is a ${p.bedrooms}-bedroom, ${p.bathrooms}-bathroom vacation home in ${p.city}, Washington that sleeps up to ${p.guests} guests.`,
    p.summary,
    `Amenities include ${list(p.amenities)}.`,
    `Rates start at ${money(p.nightlyRate)} per night plus a ${money(p.cleaningFee)} cleaning fee; Washington lodging tax is added at checkout. Minimum stay is two nights.`,
    p.reviewCount > 0 ? `Guests rate it ${p.rating.toFixed(1)} out of 5 across ${p.reviewCount} reviews.` : "",
    p.tideStationId ? "It is a waterfront home; the listing page shows local tide times." : "",
    p.skiResort ? `The nearest ski area is ${p.skiResort.name}.` : "",
    `Book direct at ${propertyUrl(p)} (secure payment by Stripe)${p.airbnbUrl ? `, or on Airbnb at ${p.airbnbUrl}` : ""}.`,
  ];
  return bits.filter(Boolean).join(" ");
}

// ---- JSON-LD builders ----

type Thing = Record<string, unknown>;

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

const postalAddress = (locality: string, region = "WA") => ({
  "@type": "PostalAddress",
  addressLocality: locality,
  addressRegion: region,
  addressCountry: "US",
});

export function personJsonLd(name: string): Thing {
  return {
    "@type": "Person",
    name,
    jobTitle: "Co-founder",
    worksFor: { "@id": ORG_ID },
    url: absUrl("/about"),
  };
}

export function organizationJsonLd(): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absUrl("/opengraph-image"),
    slogan: TAGLINE,
    description: DEFAULT_DESCRIPTION,
    email: CONTACT.email,
    telephone: CONTACT.phones[0],
    address: postalAddress(CONTACT.locality, CONTACT.region),
    founder: FOUNDERS.map(personJsonLd),
    contactPoint: CONTACT.phones.map((telephone) => ({
      "@type": "ContactPoint",
      telephone,
      email: CONTACT.email,
      contactType: "customer service",
      areaServed: "US",
      availableLanguage: "English",
    })),
  };
}

export function localBusinessJsonLd(): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    url: SITE_URL,
    image: absUrl("/opengraph-image"),
    description:
      "Short-term rental management and co-hosting for vacation homes in Gig Harbor, Hood Canal, and the Mount Rainier area of Washington. Listing, pricing, guest messaging, cleaning, and monthly owner statements.",
    email: CONTACT.email,
    telephone: CONTACT.phones[0],
    address: postalAddress(CONTACT.locality, CONTACT.region),
    areaServed: SERVICE_AREA.map((name) => ({ "@type": "Place", name })),
    parentOrganization: { "@id": ORG_ID },
    knowsAbout: ["Short-term rental management", "Airbnb co-hosting", "Vacation rentals", "Gig Harbor", "Hood Canal", "Mount Rainier"],
    makesOffer: [
      "Short-term rental management",
      "Co-hosting on Airbnb and Vrbo",
      "Guest communication",
      "Cleaning and turnover coordination",
      "Owner statements and payouts",
    ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name, provider: { "@id": ORG_ID } } })),
  };
}

export function webSiteJsonLd(): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: SITE_NAME,
    alternateName: `${SITE_NAME} | ${TAGLINE}`,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/properties?region={region}` },
      "query-input": "required name=region",
    },
  };
}

export type Faq = { question: string; answer: string };

export function faqJsonLd(faqs: Faq[]): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function itemListJsonLd(properties: Property[]): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} vacation homes`,
    description: "Vacation rentals managed by West Coast Hosting Co in Gig Harbor, Hood Canal, and Randle near Mount Rainier, Washington.",
    url: absUrl("/properties"),
    numberOfItems: properties.length,
    itemListOrder: "https://schema.org/ItemListUnordered",
    itemListElement: properties.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: propertyUrl(p),
      item: vacationRentalJsonLd(p, { context: false }),
    })),
  };
}

const PET_AMENITY = /\bpet[- ]friendly\b|\bpets? (allowed|welcome)\b/i;

export function vacationRentalJsonLd(p: Property, opts: { context?: boolean } = {}): Thing {
  const photo = propertyPhoto(p.slug);
  const petsAllowed = p.amenities.some((a) => PET_AMENITY.test(a));
  // Coordinates are not part of the Property type today; use them if the data layer adds them.
  const maybe = p as Property & { lat?: number | null; lng?: number | null };
  const geo =
    typeof maybe.lat === "number" && typeof maybe.lng === "number"
      ? { "@type": "GeoCoordinates", latitude: maybe.lat, longitude: maybe.lng }
      : undefined;

  const out: Thing = {
    ...(opts.context === false ? {} : { "@context": "https://schema.org" }),
    "@type": ["VacationRental", "LodgingBusiness"],
    "@id": `${propertyUrl(p)}#rental`,
    name: p.name,
    description: p.summary,
    url: propertyUrl(p),
    ...(photo ? { image: [absUrl(photo)] } : {}),
    address: postalAddress(p.city, p.region),
    ...(geo ? { geo } : {}),
    brand: { "@id": ORG_ID },
    numberOfRooms: p.bedrooms,
    numberOfBedrooms: p.bedrooms,
    numberOfBathroomsTotal: p.bathrooms,
    occupancy: { "@type": "QuantitativeValue", minValue: 1, maxValue: p.guests, unitText: "guests" },
    ...(petsAllowed ? { petsAllowed: true } : {}),
    amenityFeature: p.amenities.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
    priceRange: `From ${money(p.nightlyRate)} per night`,
    currenciesAccepted: "USD",
    paymentAccepted: "Credit card",
    containsPlace: {
      "@type": "Accommodation",
      name: p.name,
      numberOfBedrooms: p.bedrooms,
      numberOfBathroomsTotal: p.bathrooms,
      occupancy: { "@type": "QuantitativeValue", maxValue: p.guests },
      amenityFeature: p.amenities.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
    },
    ...(p.reviewCount > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount, bestRating: 5, worstRating: 1 } }
      : {}),
    ...(p.airbnbUrl ? { sameAs: [p.airbnbUrl] } : {}),
  };
  return out;
}
