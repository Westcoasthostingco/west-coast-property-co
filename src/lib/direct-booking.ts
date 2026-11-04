// Homes that also take bookings on their own website, by slug. Shown as the
// first "Book direct" button on the home's page, ahead of Airbnb and Vrbo.
const directBooking: Record<string, string> = {
  "the-leonora-by-the-sea": "https://leonorabythesea.com/",
};

export function directBookingUrl(slug: string): string | undefined {
  return directBooking[slug];
}

/** The direct site's name for copy, e.g. "leonorabythesea.com". */
export function directBookingName(slug: string): string | undefined {
  const url = directBooking[slug];
  return url ? new URL(url).hostname.replace(/^www\./, "") : undefined;
}
