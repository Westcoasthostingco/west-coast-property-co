import { getProperties, money } from "@/lib/data";
import { CONTACT, FOUNDERS, SITE_NAME, SITE_URL, TAGLINE, absUrl, propertyLongDescription, propertyUrl } from "@/lib/seo";

// llms.txt (https://llmstxt.org): a plain-text map of the site for AI assistants
// and answer engines. Generated from live property data so it never goes stale.
export const revalidate = 3600;

export async function GET() {
  const properties = await getProperties();

  const homes = properties.map((p) => {
    const facts = [
      `${p.city}, Washington`,
      `sleeps ${p.guests}`,
      `${p.bedrooms} ${p.bedrooms === 1 ? "bedroom" : "bedrooms"}`,
      `${p.bathrooms} ${p.bathrooms === 1 ? "bath" : "baths"}`,
      `from ${money(p.nightlyRate)}/night`,
    ].join(", ");
    return `- [${p.name}](${propertyUrl(p)}): ${facts}. ${p.amenities.join(", ")}.`;
  });

  const detail = properties.map((p) => `### ${p.name}\n\n${propertyLongDescription(p)}`);

  const text = `# ${SITE_NAME}

> ${SITE_NAME} manages and co-hosts vacation rentals from Hood Canal to Mount Rainier, Washington, and books three homes direct: The Grand View in Gig Harbor, The Leonora by the Sea on Hood Canal, and The Bedrock in Randle. ${TAGLINE}.

${SITE_NAME} is a short-term rental management and co-hosting company based in Gig Harbor, Washington, run by ${FOUNDERS.join(" and ")}. Guests can book any of the homes directly on this site; homeowners can hire the company to list, price, clean, and host their property.

## Key pages

- [Home](${absUrl("/")}): Overview of the three homes, how we host, and a search by region, dates, and guests.
- [Our homes](${absUrl("/properties")}): Every vacation rental we manage, filterable by region (Gig Harbor, Hood Canal, Randle), dates, and guest count.
- [For owners](${absUrl("/services")}): What full management and co-hosting include, and how fees work.
- [About](${absUrl("/about")}): Who Christi and Melissa are and why they started the company.
- [Contact](${absUrl("/contact")}): Email and phone for stays and co-hosting inquiries.
- [Privacy policy](${absUrl("/legal/privacy")}): How guest and owner data is handled.
- [Terms of service](${absUrl("/legal/terms")}): Booking terms.
- [House policies](${absUrl("/legal/policies")}): Check-in, cancellation, and house rules.

## Homes

${homes.join("\n")}

## Homes in detail

${detail.join("\n\n")}

## Facts

- Service area: Hood Canal, Gig Harbor, and the Puget Sound region to Randle and Packwood near Mount Rainier and White Pass, Washington.
- Services: full short-term rental management (listing, pricing, guest communication, cleaning and turnovers, monthly owner statements, owner portal) and co-hosting on an owner's existing Airbnb or Vrbo accounts.
- Fees for owners: a simple percentage of nightly revenue, no setup fees; cleaning fees and lodging taxes pass through to guests.
- Booking: guests book direct on each home's page with secure payment by Stripe; the same homes are also listed on Airbnb.
- Pricing: nightly rate plus a per-stay cleaning fee; Washington lodging tax is collected at checkout. Minimum stay is two nights.
- Hosts: ${FOUNDERS.join(" and ")}, longtime friends with 22 years of combined experience in real estate, sales, and short-term rental management.
- Contact: ${CONTACT.email}, ${CONTACT.phonesDisplay.join(" or ")}. Based in ${CONTACT.locality}, Washington.
- Website: ${SITE_URL}
- Sitemap: ${SITE_URL}/sitemap.xml
`;

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
