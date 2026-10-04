import { getPropertiesForStaticFiles } from "@/lib/data";
import { CONTACT, FOUNDERS, SITE_NAME, SITE_URL, TAGLINE, absUrl, propertyLongDescription, propertyUrl } from "@/lib/seo";

// llms.txt (https://llmstxt.org): a plain-text map of the site for AI assistants
// and answer engines. Generated from live property data so it never goes stale.
export const revalidate = 3600;

export async function GET() {
  const properties = await getPropertiesForStaticFiles();

  const homes = properties.map((p) => {
    const facts = [
      `${p.city}, Washington`,
      `sleeps ${p.guests}`,
      `${p.bedrooms} ${p.bedrooms === 1 ? "bedroom" : "bedrooms"}`,
      `${p.bathrooms} ${p.bathrooms === 1 ? "bath" : "baths"}`,
    ].join(", ");
    return `- [${p.name}](${propertyUrl(p)}): ${facts}. ${p.amenities.join(", ")}.`;
  });

  const detail = properties.map((p) => `### ${p.name}\n\n${propertyLongDescription(p)}`);

  const text = `# ${SITE_NAME}

> ${SITE_NAME} publishes a showcase of vacation homes in Washington, from Hood Canal to Gig Harbor to Mount Rainier: The Grand View in Gig Harbor, The Leonora by the Sea on Hood Canal, and The Bedrock in Randle. ${TAGLINE}.

This website is a showcase only. It shows photos, details, and local context for each home and links to the home's listing. It does not take bookings or payments, and ${SITE_NAME} is not a party to reservations. Guests book each home with the host on Airbnb, or on Vrbo where it is listed, using the links on each home's page. The site is run by ${FOUNDERS.join(" and ")} in ${CONTACT.locality}, Washington.

## Key pages

- [Home](${absUrl("/")}): Overview of the three homes, how booking works, a search by area and guest count, and answers to common questions.
- [The homes](${absUrl("/properties")}): Every home on the site, filterable by area (Gig Harbor, Hood Canal, Randle) and guest count.
- [About](${absUrl("/about")}): Who Christi and Melissa are and why they built the site.
- [Contact](${absUrl("/contact")}): Email and phone for questions about the homes or the site. Reservation questions go to the host on Airbnb or Vrbo.
- [Privacy notice](${absUrl("/legal/privacy")}): How visitor information is handled.
- [Terms of use](${absUrl("/legal/terms")}): Terms for using the website. Reservations are governed by the Airbnb or Vrbo terms and the listing.
- [Booking information](${absUrl("/legal/policies")}): How booking, cancellations, damage, and late arrivals work through the platforms.

## Homes

${homes.join("\n")}

## Homes in detail

${detail.join("\n\n")}

## Facts

- Area: Hood Canal, Gig Harbor, and the Puget Sound region to Randle and Packwood near Mount Rainier and White Pass, Washington.
- Booking: every home is booked on Airbnb, and some also on Vrbo; each home's page links to its listings. The website does not take reservations or payments. Cancellations, changes, refunds, and damage claims go through the platform and the listing's host.
- Pricing: rates, fees, and Washington lodging taxes are shown and charged by Airbnb or Vrbo at booking.
- Who hosts a stay: the host named on the Airbnb or Vrbo listing.
- Contact for questions about the site: ${CONTACT.email}, ${CONTACT.phonesDisplay.join(" or ")}. Based in ${CONTACT.locality}, Washington.
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
