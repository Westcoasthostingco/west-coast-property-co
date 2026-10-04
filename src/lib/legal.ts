// Legal and policy page metadata, shared by the footer, the legal pages themselves, and anything that records which policy version was shown.
// The site is a showcase only: bookings, payments, cancellations and refunds happen on Airbnb or Vrbo, never here.
export const LEGAL_UPDATED = "2026-10-04";
export const POLICY_VERSION = "2026-10b";

export type LegalLink = { href: string; label: string };

export const legalLinks: LegalLink[] = [
  { href: "/legal/privacy", label: "Privacy Notice" },
  { href: "/legal/terms", label: "Terms of Use" },
  { href: "/legal/policies", label: "Policies" },
  { href: "/legal/policies#cancellation", label: "Booking and Cancellation Policy" },
  { href: "/legal/policies#damage", label: "Damage and Incidents Policy" },
];

export const LEGAL_CONTACT = { email: "hello@westcoasthostingco.com", phone: "253.278.6818", company: "West Coast Hosting Co", location: "Gig Harbor, Washington" };

// Formats an ISO date (YYYY-MM-DD) as "October 1, 2026" without timezone drift.
export const formatLegalDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
};
