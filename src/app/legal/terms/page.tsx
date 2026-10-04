import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import LegalLayout, { Callout, Clauses, Section, Sub, type LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = { title: "Terms of Use", description: "Terms for using West Coast Hosting Co's website, a showcase of vacation homes in Washington. Reservations are made with the host and paid on Airbnb or Vrbo." };

const sections: LegalSection[] = [
  { id: "everyone", title: "Part A: Using this site" },
  { id: "guests", title: "Part B: Booking a home" },
  { id: "portals", title: "Part C: Portal accounts" },
];

const P = ({ href, children }: { href: string; children: ReactNode }) => <Link href={href} className="text-deep hover:underline">{children}</Link>;

export default function TermsPage() {
  return (
    <LegalLayout eyebrow="Legal" title="Terms of Use" sections={sections} intro="These terms are in three parts. Part A applies to everyone who visits the site. Part B explains how booking one of the homes works. Part C applies only to people we have invited to a portal account. We have tried to write them the way we would explain them across a kitchen table.">
      <Section id="everyone" kicker="Part A" title="Using this site">
        <Callout>
          <p><strong>What this site is.</strong> westcoasthostingco.com is a showcase of vacation homes in Washington. It shows photos, descriptions, and local details for each home, and links to the home’s listing on Airbnb or Vrbo. It does not accept reservations or payments, and West Coast Hosting Co is not a party to any reservation made through those links.</p>
          <p className="mt-3">Every reservation is made with the host named on the listing and is booked, paid, changed, cancelled, and refunded on Airbnb or Vrbo, under that platform’s terms and policies and the listing’s own house rules and cancellation policy. These Terms of Use cover only your use of this website.</p>
        </Callout>
        <Sub title="1. Acceptance">
          <Clauses>
            <li>By using westcoasthostingco.com you agree to these Terms of Use, our <P href="/legal/privacy">Privacy Notice</P>, and our <P href="/legal/policies">Booking Information</P>. If you do not agree, please do not use the site.</li>
            <li>“We,” “us,” and “West Coast Hosting Co” mean West Coast Hosting Co of Gig Harbor, Washington, run by Christi Young and Melissa Heckman. “Home” means a property shown on this site, such as The Grand View, The Leonora by the Sea, or The Bedrock. “Listing” means that home’s page on Airbnb or Vrbo, and “host” means the host named on the listing.</li>
          </Clauses>
        </Sub>
        <Sub title="2. Acceptable use">
          <Clauses start={3}>
            <li>Use the site for its purpose: learning about the homes and finding their listings.</li>
            <li>Do not scrape the site, probe or overload it, upload malicious code, or misrepresent who you are.</li>
          </Clauses>
        </Sub>
        <Sub title="3. Intellectual property">
          <Clauses start={5}>
            <li>The photographs, descriptions, and other content about each home belong to that home’s owner or to West Coast Hosting Co. Our name, wordmark, wave motif, and site design belong to West Coast Hosting Co. You may view and share links freely; you may not reuse photos or text for your own listing, site, or marketing without written permission.</li>
          </Clauses>
        </Sub>
        <Sub title="4. Accuracy and third-party information">
          <Clauses start={6}>
            <li>The site is provided “as is.” We work to keep descriptions accurate, but details such as amenities, check-in times, minimum stays, and house rules can change. The listing on Airbnb or Vrbo at the time you book is what counts, and it controls if it differs from this site.</li>
            <li>Tide, weather, trail, and ski-area information comes from third parties and is for planning only.</li>
            <li>Links to Airbnb, Vrbo, and other sites take you to services we do not run. Their terms and privacy policies apply there.</li>
          </Clauses>
        </Sub>
        <Sub title="5. Limitation of liability">
          <Clauses start={9}>
            <li>To the extent Washington law allows, West Coast Hosting Co and its owners are not liable for indirect, incidental, or consequential losses arising from your use of this website. Because we are not a party to your reservation, questions and claims about a booking or a stay go to the host and the platform you booked on.</li>
            <li>Nothing here limits liability for death or personal injury caused by negligence, for fraud, or for anything that cannot lawfully be limited.</li>
          </Clauses>
        </Sub>
        <Sub title="6. Governing law and venue">
          <Clauses start={11}>
            <li>Washington law governs these terms. Any court action about this website is brought in Pierce County, Washington, and you agree to that venue.</li>
          </Clauses>
        </Sub>
        <Sub title="7. Changes and contact">
          <Clauses start={12}>
            <li>We may update these terms. The date at the top shows the current version.</li>
            <li>Questions about this website: <a href="mailto:hello@westcoasthostingco.com" className="text-deep hover:underline">hello@westcoasthostingco.com</a> or 253.278.6818.</li>
          </Clauses>
        </Sub>
      </Section>

      <Section id="guests" kicker="Part B" title="Booking a home">
        <Sub title="1. Booking on Airbnb or Vrbo">
          <Clauses>
            <li>Every home is listed on Airbnb, and some on Vrbo too; the buttons on each home’s page take you to its listing. Your reservation is with the host on that listing, made through the platform, and governed by the platform’s terms.</li>
            <li>The price, fees, taxes, payment, changes, cancellations, refunds, and any damage claims are all handled through the platform, under its rules and the cancellation policy and house rules shown on the listing when you book. We do not take payment, hold money, or issue refunds.</li>
            <li>We will never ask you to pay us directly, by wire, app, gift card, or any other way. If anyone asks you to pay outside Airbnb or Vrbo, it is not us; please report it to the platform and let us know.</li>
          </Clauses>
        </Sub>
        <Sub title="2. During your stay">
          <Clauses start={4}>
            <li>Check-in instructions, the exact address, access, house rules, and help during your stay come from your host through the platform’s messages.</li>
            <li>For an emergency, call 911 first, then contact your host.</li>
          </Clauses>
        </Sub>
        <Sub title="3. More detail">
          <p>A short summary of how booking, cancellations, damage, and late arrivals work on the platforms is in our <P href="/legal/policies">Booking Information</P>.</p>
        </Sub>
      </Section>

      <Section id="portals" kicker="Part C" title="Portal accounts">
        <Clauses>
          <li>Portal accounts are by invitation only. Guests do not need an account.</li>
          <li>If we have given you a portal account, keep your sign-in private and tell us right away if you think someone else has used it. Use the portal only for its purpose, and do not copy information out of it except as your role requires.</li>
          <li>Your use of a portal is also governed by your separate written agreement with us and the terms shown inside the portal. If they differ from these Terms of Use, your written agreement controls.</li>
          <li>We may suspend or close a portal account that breaks these terms or puts a home or a person at risk.</li>
        </Clauses>
      </Section>
    </LegalLayout>
  );
}
