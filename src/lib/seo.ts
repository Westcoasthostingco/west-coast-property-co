// Site-wide SEO constants and schema.org JSON-LD builders.
// Everything here is derived from Property data or the public facts about the
// site. Street addresses are not public, so addresses stop at locality.
// The site is a showcase only: guests book on Airbnb (and Vrbo where listed), so
// nothing here advertises an on-site reservation, offer, or payment.
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Property } from "./mock";
import { getListingContent } from "./listing-content";

export const SITE_URL = "https://www.westcoasthostingco.com";
export const SITE_NAME = "West Coast Hosting Co";
export const TAGLINE = "Coast to Cascades";
export const DEFAULT_DESCRIPTION =
  "A showcase of vacation homes from Hood Canal to Gig Harbor to Mount Rainier, Washington. Explore each home here, then book on Airbnb or Vrbo.";

export const CONTACT = {
  email: "hello@westcoasthostingco.com",
  phones: ["+1-253-278-6818", "+1-503-860-8115"],
  phonesDisplay: ["253.278.6818", "503.860.8115"],
  locality: "Gig Harbor",
  region: "WA",
  country: "US",
};

export const FOUNDERS = ["Christi Young", "Melissa Heckman"] as const;

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

/** Booking platform listings for a home, in display order. Every home has an Airbnb listing; Vrbo only where a link exists. */
export function bookingPlatforms(p: Pick<Property, "airbnbUrl" | "vrboUrl">): { name: "Airbnb" | "Vrbo"; url: string }[] {
  const out: { name: "Airbnb" | "Vrbo"; url: string }[] = [];
  if (p.airbnbUrl) out.push({ name: "Airbnb", url: p.airbnbUrl });
  if (p.vrboUrl) out.push({ name: "Vrbo", url: p.vrboUrl });
  return out;
}

/** "Airbnb" or "Airbnb or Vrbo", for copy. Falls back to Airbnb, where every home is listed. */
export const bookingPlatformNames = (p: Pick<Property, "airbnbUrl" | "vrboUrl">) =>
  bookingPlatforms(p).map((x) => x.name).join(" or ") || "Airbnb";

/** A 140 to 160 character description for a property page, written for people. */
export function propertyDescription(p: Property): string {
  const base = `${p.name} is a ${p.bedrooms}-bedroom, ${p.bathrooms}-bath vacation rental in ${p.city}, WA sleeping ${p.guests}.`;
  const rate = `Book on ${bookingPlatformNames(p)}.`;
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
    ...(getListingContent(p.slug)?.about.slice(1) ?? []),
    `Amenities include ${list(p.amenities)}.`,
    `Prices, fees, and Washington lodging taxes are shown and charged by ${bookingPlatformNames(p)} when you book, and the listing sets the house rules and cancellation policy. Minimum stay is usually ${p.minNights ?? 2} nights.`,
    p.reviewCount > 0 ? `Guests rate it ${p.rating.toFixed(1)} out of 5 across ${p.reviewCount} reviews.` : "",
    p.tideStationId ? "It is a waterfront home." : "",
    p.skiResort ? `The nearest ski area is ${p.skiResort.name}.` : "",
    bookingPlatforms(p).length > 0
      ? `Book on ${bookingPlatforms(p).map((x) => `${x.name} at ${x.url}`).join(", or on ")}.`
      : "Book on Airbnb.",
    `The home's page at ${propertyUrl(p)} is a showcase with photos and details; it links to the listing, where you book with the host. This website does not take bookings or payments.`,
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
    description: "Vacation homes showcased by West Coast Hosting Co in Gig Harbor, Hood Canal, and Randle near Mount Rainier, Washington.",
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
  const content = getListingContent(p.slug);
  const images = [...(photo ? [absUrl(photo)] : []), ...(content?.photos ?? []).slice(0, 11).map((ph) => absUrl(ph.src))];
  const beds = (content?.sleeping ?? []).flatMap((s) =>
    s.beds.split(/,\s*/).map((b) => b.match(/^(\d+)\s+(.+?)\s+beds?$/i)).filter((m): m is RegExpMatchArray => Boolean(m))
      .map((m) => ({ "@type": "BedDetails", numberOfBeds: Number(m[1]), typeOfBed: m[2].replace(/^\w/, (x) => x.toUpperCase()) })),
  );
  const petsAllowed = p.amenities.some((a) => PET_AMENITY.test(a));
  const geo =
    typeof p.lat === "number" && typeof p.lng === "number"
      ? { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng }
      : undefined;

  const out: Thing = {
    ...(opts.context === false ? {} : { "@context": "https://schema.org" }),
    "@type": ["VacationRental", "LodgingBusiness"],
    additionalType: "House",
    "@id": `${propertyUrl(p)}#rental`,
    identifier: p.slug,
    name: p.name,
    description: p.summary,
    url: propertyUrl(p),
    ...(images.length ? { image: images } : {}),
    address: postalAddress(p.city, p.region),
    ...(geo ? { geo, latitude: geo.latitude, longitude: geo.longitude } : {}),
    brand: { "@id": ORG_ID },
    numberOfRooms: p.bedrooms,
    numberOfBedrooms: p.bedrooms,
    numberOfBathroomsTotal: p.bathrooms,
    occupancy: { "@type": "QuantitativeValue", minValue: 1, maxValue: p.guests, unitText: "guests" },
    ...(petsAllowed ? { petsAllowed: true } : {}),
    amenityFeature: p.amenities.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
    // No price, offer, payment or reservation action: the platform listing sets prices and takes bookings.
    containsPlace: {
      "@type": "Accommodation",
      additionalType: "EntirePlace",
      name: p.name,
      numberOfBedrooms: p.bedrooms,
      numberOfBathroomsTotal: p.bathrooms,
      occupancy: { "@type": "QuantitativeValue", value: p.guests, maxValue: p.guests },
      ...(beds.length ? { bed: beds } : {}),
      amenityFeature: p.amenities.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
    },
    ...(p.reviewCount > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount, bestRating: 5, worstRating: 1 } }
      : {}),
    ...(bookingPlatforms(p).length > 0 ? { sameAs: bookingPlatforms(p).map((x) => x.url) } : {}),
  };
  return out;
}
