import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout, { Bullets, Callout, Section, Sub, type LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = { title: "Privacy Notice", description: "How West Coast Hosting Co collects, uses, and protects information from website visitors and invited portal users." };

const sections: LegalSection[] = [
  { id: "who-we-are", title: "Who we are" },
  { id: "what-we-collect", title: "What we collect" },
  { id: "how-we-use-it", title: "How we use it" },
  { id: "third-parties", title: "Third parties and processors" },
  { id: "retention", title: "How long we keep it" },
  { id: "security", title: "Security" },
  { id: "your-rights", title: "Your rights" },
  { id: "children", title: "Children" },
  { id: "contact", title: "Contact" },
  { id: "changes", title: "Changes to this notice" },
];

export default function PrivacyPage() {
  return (
    <LegalLayout eyebrow="Legal" title="Privacy Notice" sections={sections} intro="We are a two-person company, and we treat your information the way we would want ours treated: we collect only what this site and our portals need, we keep it with reputable providers, and we never sell it.">
      <Section id="who-we-are" title="Who we are">
        <p>West Coast Hosting Co is based in Gig Harbor, Washington, and run by Christi Young and Melissa Heckman. We publish westcoasthostingco.com, a showcase of vacation homes in Washington, including The Grand View and The Bay House in Gig Harbor, The Leonora by the Sea on Hood Canal, and The Bedrock in Randle near Mount Rainier. This notice covers the website, the invitation-only portals, and the emails we send.</p>
        <p>Our website is a showcase only. It does not take reservations or payments, and it does not receive your booking or payment details. When you book one of the homes, Airbnb or Vrbo and the listing’s host handle your information under the platform’s privacy policy.</p>
        <p>For the purposes of privacy law, West Coast Hosting Co is the “controller” of the information described here, meaning we decide why and how it is used.</p>
      </Section>

      <Section id="what-we-collect" title="What we collect">
        <p>What we hold about you depends on how you work with us.</p>
        <Sub title="Anyone who contacts us">
          <Bullets>
            <li>What you send through the contact form or by email, text, or phone: your name, email address, phone number if you give it, what your question is about, and your message.</li>
          </Bullets>
        </Sub>
        <Sub title="Guests">
          <p>Booking and payment details are collected by Airbnb or Vrbo and shared with the listing’s host under the platform’s privacy policy (see our <Link href="/legal/policies" className="text-deep hover:underline">Booking Information</Link>). This website does not collect them, never sees your payment card, and does not require an account.</p>
        </Sub>
        <Sub title="Portal users: homeowners">
          <Bullets>
            <li>Contact details, the address and description of your home, and the terms of our written agreement.</li>
            <li>Portal sign-in details handled by Clerk, and what you view in your portal.</li>
            <li>We do not collect your bank account details. Airbnb and Vrbo pay you directly and collect what they need for that under their own privacy policies.</li>
          </Bullets>
        </Sub>
        <Sub title="Portal users: cleaners">
          <Bullets>
            <li>Name, email, phone, and the terms of our written agreement.</li>
            <li>Portal sign-in details handled by Clerk.</li>
            <li>The records and photos you add in the portal.</li>
          </Bullets>
        </Sub>
        <Sub title="Website visitors">
          <Bullets>
            <li>Anonymous usage analytics through Vercel Analytics: pages viewed, rough location by country or region, browser and device type. Vercel Analytics does not use cookies and does not track you across other sites.</li>
            <li>If you sign in to a portal, Clerk sets cookies that keep you signed in and protect against forged requests. These are strictly necessary and are not used for advertising.</li>
            <li>Standard server logs (IP address, time, page requested) kept briefly for security and troubleshooting.</li>
          </Bullets>
          <p>We do not run advertising trackers, and we do not show a cookie banner because we do not set marketing cookies.</p>
        </Sub>
        <Callout>
          <p><strong className="ui text-sm font-medium text-deep">Health data.</strong> We do not collect health information and do not want it. Washington’s My Health My Data Act regulates consumer health data; it does not apply to what this site gathers. If you choose to tell us about an accessibility need, we use it only to answer you and do not keep it afterward.</p>
        </Callout>
      </Section>

      <Section id="how-we-use-it" title="How we use it">
        <Bullets>
          <li>To answer your questions and contact form messages.</li>
          <li>To run the portals for the people we work with under written agreements.</li>
          <li>To keep the business records Washington and the IRS require, and to resolve disputes.</li>
          <li>To keep the site and portals secure and to understand, in aggregate, how the site is used.</li>
          <li>To send occasional news from the homes, only if you ask us to. Every such email has an unsubscribe link, and we stop when you ask.</li>
        </Bullets>
        <p>We rely on our written agreement with you where there is one, our legitimate interest in running a small business safely, and legal obligations around tax and record-keeping. Where consent is required, we ask for it.</p>
      </Section>

      <Section id="third-parties" title="Third parties and processors">
        <p>We use a short list of providers to run the business. Each one handles data on our instructions and under its own security program.</p>
        <Bullets>
          <li><strong>Airbnb and Vrbo</strong>: each home’s page links to its listing. Guests book and pay there, under the platform’s privacy policy. We do not use a payment processor.</li>
          <li><strong>Clerk</strong>: sign-in and account security for the owner, cleaner, and admin portals.</li>
          <li><strong>Supabase</strong>: our database, where home details and portal records live.</li>
          <li><strong>Vercel</strong>: website hosting and privacy-friendly analytics.</li>
          <li><strong>Resend</strong>: sends our emails, such as contact form messages and portal notices.</li>
          <li><strong>Cloudflare Turnstile</strong>: checks that contact form submissions come from a person, not a bot.</li>
          <li><strong>Google Workspace</strong>: our email, shared documents, and signed agreements.</li>
        </Bullets>
        <p>We also share information when the law requires it (for example, tax filings or a valid legal request), to protect a person or a home from harm, or with a buyer if the business is ever sold, in which case this notice would continue to apply.</p>
        <p className="font-medium">We do not sell personal information, and we do not share it for targeted advertising.</p>
      </Section>

      <Section id="retention" title="How long we keep it">
        <Bullets>
          <li>Portal business records: up to seven years, to match tax and accounting requirements.</li>
          <li>Contact form messages: until your question is resolved, then up to two years.</li>
          <li>Photos uploaded to a portal: twelve months, unless needed for an open question or dispute.</li>
          <li>Portal account details: for the life of our relationship, then as needed for tax reporting.</li>
          <li>Server logs and analytics: Vercel keeps raw logs briefly; analytics are aggregated and not tied to you.</li>
        </Bullets>
        <p>When we no longer need something, we delete it or strip out what identifies you.</p>
      </Section>

      <Section id="security" title="Security">
        <p>All traffic to our site is encrypted. We do not handle payment card details at all. Portal access is protected by Clerk sign-in, and our database enforces row-level rules so each portal user sees only their own records. Only Christi and Melissa have administrative access, and we review it periodically. No system is perfectly secure; if a breach ever affects you, we will tell you promptly and as the law requires.</p>
      </Section>

      <Section id="your-rights" title="Your rights">
        <p>Wherever you live, you can ask us to:</p>
        <Bullets>
          <li>Tell you what personal information we hold about you and give you a copy.</li>
          <li>Correct something that is wrong.</li>
          <li>Delete your information, subject to records we must keep for tax, accounting, or an open dispute.</li>
          <li>Stop sending you marketing email.</li>
        </Bullets>
        <p>Email <a href="mailto:hello@westcoasthostingco.com" className="text-deep hover:underline">hello@westcoasthostingco.com</a> and we will respond within 30 days. We may ask you to confirm your identity (usually by replying from the email address we have for you, or through the platform’s messages).</p>
        <Sub title="Washington residents">
          <p>Washington does not yet have a general consumer privacy law, but the rights above are available to you regardless. As noted, we collect no consumer health data under the My Health My Data Act.</p>
        </Sub>
        <Sub title="California residents">
          <p>If you live in California, you may also ask what categories of information we collect and why, request deletion, and ask us not to “sell” or “share” your information. We do not sell or share personal information as the CCPA defines those terms, and we will never treat you differently for exercising your rights. You can appoint someone to make a request for you with written permission.</p>
        </Sub>
        <Sub title="Visitors from elsewhere">
          <p>If you contact us from outside the United States, your information is processed in the United States. The rights above apply to you too, and we will honor requests under your home jurisdiction’s law to the extent it applies to a small US business.</p>
        </Sub>
      </Section>

      <Section id="children" title="Children">
        <p>Our site and portals are for adults. We do not knowingly collect information from children under 13, and if we learn we have, we delete it.</p>
      </Section>

      <Section id="contact" title="Contact">
        <p>West Coast Hosting Co, Gig Harbor, Washington.<br />Email <a href="mailto:hello@westcoasthostingco.com" className="text-deep hover:underline">hello@westcoasthostingco.com</a> or call or text 253.278.6818. You will reach Christi or Melissa directly.</p>
      </Section>

      <Section id="changes" title="Changes to this notice">
        <p>When we change this notice, we update the date at the top. If a change is significant, for example a new category of information or a new kind of recipient, we will email current portal users before it takes effect. Earlier versions are available on request.</p>
      </Section>
    </LegalLayout>
  );
}
