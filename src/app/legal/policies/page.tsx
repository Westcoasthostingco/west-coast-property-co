import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout, { Callout, Clauses, Section, type LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = { title: "Booking Information", description: "How booking, cancellations, refunds, damage, and late arrivals work for the homes shown on West Coast Hosting Co: all through Airbnb or Vrbo and the listing's host." };

const sections: LegalSection[] = [
  { id: "cancellation", title: "Booking, Cancellation and Refunds" },
  { id: "damage", title: "Damage and Incidents" },
  { id: "no-shows", title: "Late Arrivals and No-Shows" },
  { id: "insurance", title: "Travel Insurance" },
  { id: "accessibility", title: "Accessibility and Non-discrimination" },
];

export default function PoliciesPage() {
  return (
    <LegalLayout eyebrow="Legal" title="Booking Information" sections={sections} intro="A short guide to how booking works for the homes on this site. Each section stands on its own, so you can link straight to the one you need.">
      <Callout>
        <p><strong>Before you read on.</strong> This website is a showcase of vacation homes and does not accept reservations or payments. Every home is booked on Airbnb or Vrbo, with the host named on the listing. The platform’s terms and the listing’s house rules and cancellation policy govern your stay. This page is a plain-language summary and does not change any of them.</p>
      </Callout>

      <Section id="cancellation" kicker="1" title="Booking, Cancellation and Refunds">
        <Clauses>
          <li>Every home is listed on Airbnb, and some on Vrbo as well. Use the buttons on each home’s page to reach its listing.</li>
          <li>Your cancellation terms are the cancellation policy shown on the listing at the time you book.</li>
          <li>To change dates, cancel, or ask about a refund, use your reservation in the Airbnb or Vrbo app or website, and message your host there with any questions.</li>
          <li>Refunds are calculated and paid by the platform, to the payment method you used there, on its timeline. West Coast Hosting Co cannot issue refunds, take payment, or change a price.</li>
        </Clauses>
      </Section>

      <Section id="damage" kicker="2" title="Damage and Incidents">
        <Clauses>
          <li>Security deposits, damage, missing items, and excess cleaning are handled between you and your host through the platform you booked on, for example Airbnb’s Resolution Center or Vrbo’s damage process, under that platform’s rules.</li>
          <li>If something breaks or you find a problem during your stay, tell your host through the platform’s messages as soon as you can, with a photo if possible.</li>
          <li>For an injury, fire, or anything urgent, call 911 first, then contact your host.</li>
        </Clauses>
      </Section>

      <Section id="no-shows" kicker="3" title="Late Arrivals and No-Shows">
        <Clauses>
          <li>What happens if you do not arrive, including whether any refund is due, is governed by the platform and the cancellation policy on your listing. If your plans change, update your reservation on the platform as soon as you can.</li>
          <li>Check-in times and access details come from your host. If you expect to arrive late, message your host through the platform. Mountain roads to Randle and the stretch along Hood Canal are dark and can be slow in winter, so allow extra time.</li>
        </Clauses>
      </Section>

      <Section id="insurance" kicker="4" title="Travel Insurance">
        <Clauses>
          <li>We encourage travel insurance that covers trip cancellation, interruption, and medical costs. Cancellation policies often give little or no refund close to check-in for illness, weather, or travel disruption.</li>
          <li>Airbnb and Vrbo offer their own guest protections under their terms. Those apply to your booking, not anything on this page.</li>
        </Clauses>
      </Section>

      <Section id="accessibility" kicker="5" title="Accessibility and Non-discrimination">
        <p>Everyone is welcome to explore these homes. We do not discriminate on the basis of race, color, religion, national origin, sex, sexual orientation, gender identity, familial status, disability, age, veteran status, or any other characteristic protected by Washington or federal law.</p>
        <p>The homes are older, individually owned houses on hillsides, shorelines, and forest lots, and not all are step-free. If you have an accessibility need, check the listing’s accessibility details and message the host through the platform before booking.</p>
        <p>We aim to keep this website usable with a keyboard and a screen reader. If something gets in your way, tell us at <a href="mailto:hello@westcoasthostingco.com" className="text-deep hover:underline">hello@westcoasthostingco.com</a> and we will fix it.</p>
        <p className="text-sm text-muted">See also our <Link href="/legal/terms" className="text-deep hover:underline">Terms of Use</Link> and <Link href="/legal/privacy" className="text-deep hover:underline">Privacy Notice</Link>.</p>
      </Section>
    </LegalLayout>
  );
}
