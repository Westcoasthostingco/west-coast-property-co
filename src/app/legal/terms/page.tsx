import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import LegalLayout, { Callout, Clauses, Section, Sub, type LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = { title: "Terms of Use", description: "Terms for guests, homeowners, and cleaners who use West Coast Hosting Co's website and portals. Reservations are made and paid on Airbnb or Vrbo." };

const sections: LegalSection[] = [
  { id: "everyone", title: "Part A: Everyone" },
  { id: "guests", title: "Part B: Guests" },
  { id: "owners", title: "Part C: Homeowners" },
  { id: "cleaners", title: "Part D: Cleaners" },
];

const P = ({ href, children }: { href: string; children: ReactNode }) => <Link href={href} className="text-deep hover:underline">{children}</Link>;

export default function TermsPage() {
  return (
    <LegalLayout eyebrow="Legal" title="Terms of Use" sections={sections} intro="These terms are in four parts. Part A applies to everyone who uses our site or portals. Parts B, C, and D add the terms that apply to you as a guest, a homeowner, or a cleaner. We have tried to write them the way we would explain them across a kitchen table.">
      <Section id="everyone" kicker="Part A" title="Everyone">
        <Callout>
          <p><strong>What we do, and what this site is.</strong> West Coast Hosting Co provides hosting and co-hosting services to homeowners. This website is informational: it shows the homes we care for and how to reach us. It does not accept reservations or payments.</p>
          <p className="mt-3">Every reservation is made, paid, changed, cancelled, and refunded through a third-party platform, Airbnb or Vrbo, under that platform’s terms and policies. Those platform terms govern the booking itself. These Terms of Use cover your use of this site and portals, and how guests are expected to treat a home while staying there.</p>
        </Callout>
        <Sub title="1. Acceptance">
          <Clauses>
            <li>By using westcoasthostingco.com, staying at one of the homes, signing in to a portal, or working with us as an owner or cleaner, you agree to these Terms of Use, our <P href="/legal/privacy">Privacy Notice</P>, and our <P href="/legal/policies">Policies</P>. If you do not agree, please do not use the site.</li>
            <li>“We,” “us,” and “West Coast Hosting Co” mean West Coast Hosting Co of Gig Harbor, Washington, run by Christi Young and Melissa Heckman. “Home” means a property we manage, such as The Grand View, The Leonora by the Sea, or The Bedrock.</li>
          </Clauses>
        </Sub>
        <Sub title="2. Eligibility">
          <Clauses start={3}>
            <li>You must be at least 18 years old and able to enter a binding agreement to open a portal account or contract with us. The platform you book on sets its own eligibility rules for guests, and the guest who books must be at least 18.</li>
          </Clauses>
        </Sub>
        <Sub title="3. Accounts and roles">
          <Clauses start={4}>
            <li>Guests do not need an account on this site; you book and manage your reservation in your Airbnb or Vrbo account. Homeowners, cleaners, and our own admins sign in through a secure portal. Each account carries one role (owner, cleaner, or admin) and sees only what that role needs.</li>
            <li>Keep your sign-in private and tell us right away if you think someone else has used it. You are responsible for activity under your account until you tell us.</li>
            <li>We may suspend or close an account that breaks these terms, puts a home or a person at risk, or has been inactive for more than a year after our relationship ends.</li>
          </Clauses>
        </Sub>
        <Sub title="4. Acceptable use">
          <Clauses start={7}>
            <li>Use the site and portals only for their purpose: learning about the homes and finding their Airbnb or Vrbo listings, managing your home, or completing cleaning jobs.</li>
            <li>Do not scrape the site, probe or overload it, upload malicious code, misrepresent who you are, or try to reach data that is not yours.</li>
            <li>Do not copy guest, owner, or cleaner information out of the portals except to do your own job.</li>
          </Clauses>
        </Sub>
        <Sub title="5. Intellectual property">
          <Clauses start={10}>
            <li>The photographs, descriptions, and other content about each home belong to that home’s owner or to West Coast Hosting Co. Our name, wordmark, wave motif, and site design belong to West Coast Hosting Co. You may view and share links freely; you may not reuse photos or text for your own listing, site, or marketing without written permission.</li>
            <li>Reviews, messages, and photos you send us may be used to run and improve the homes and, with your permission, in our marketing.</li>
          </Clauses>
        </Sub>
        <Sub title="6. Disclaimers">
          <Clauses start={12}>
            <li>The site, descriptions, calendars, and portals are provided “as is.” We work hard to keep descriptions accurate, but any price or availability shown here is for information only and may be out of date. The Airbnb or Vrbo listing at the time you book is what counts. If a stay is affected by a calendar error, the platform’s policies and Part B apply.</li>
            <li>Tide, weather, trail, and ski-area information shown on the site comes from third parties and is for planning only.</li>
          </Clauses>
        </Sub>
        <Sub title="7. Limitation of liability">
          <Clauses start={14}>
            <li>To the extent Washington law allows, West Coast Hosting Co, its owners, and the homeowners we represent are not liable for indirect, incidental, or consequential losses, such as lost vacation time, travel costs, or lost income, arising from the site or a stay.</li>
            <li>For a stay, our total liability to a guest is limited to the amount paid for that stay through the platform, less anything the platform has already refunded. For an owner or cleaner, it is limited to the fees we earned from, or the pay we owed on, the matter in dispute over the previous twelve months.</li>
            <li>Nothing here limits liability for death or personal injury caused by negligence, for fraud, or for anything that cannot lawfully be limited.</li>
          </Clauses>
        </Sub>
        <Sub title="8. Indemnity">
          <Clauses start={17}>
            <li>If your breach of these terms, your misuse of a home, or your violation of law causes a claim against us or a homeowner, you agree to cover the resulting losses and reasonable legal costs.</li>
          </Clauses>
        </Sub>
        <Sub title="9. Governing law and venue">
          <Clauses start={18}>
            <li>Washington law governs these terms. Any court action is brought in Pierce County, Washington, and you agree to that venue.</li>
          </Clauses>
        </Sub>
        <Sub title="10. Resolving disagreements">
          <Clauses start={19}>
            <li>Talk to us first. Email <a href="mailto:hello@westcoasthostingco.com" className="text-deep hover:underline">hello@westcoasthostingco.com</a> with what happened and what you would like us to do. We will reply within five business days and try in good faith to resolve it within 30 days.</li>
            <li>If that does not work, either side may bring a claim in Pierce County small claims court if it qualifies. Otherwise, either side may require binding arbitration in Pierce County before a single arbitrator under the rules of a recognized provider, with each side paying its own costs unless the arbitrator decides otherwise. Claims are brought individually, not as a class.</li>
            <li>Nothing stops either side from asking a court for an urgent order to protect a home or a person.</li>
          </Clauses>
        </Sub>
        <Sub title="11. Changes and contact">
          <Clauses start={22}>
            <li>We may update these terms. The date at the top shows the current version. For an existing booking, the terms in force when you booked apply, alongside the platform’s terms. For owners and cleaners, we will email material changes at least 30 days before they take effect.</li>
            <li>Contact us at <a href="mailto:hello@westcoasthostingco.com" className="text-deep hover:underline">hello@westcoasthostingco.com</a> or 253.278.6818.</li>
          </Clauses>
        </Sub>
      </Section>

      <Section id="guests" kicker="Part B" title="Guests">
        <Callout><p>Staying in one of our homes gives you a <strong>license to occupy</strong> it for the dates of your reservation. It is not a lease or a tenancy, and Washington landlord-tenant law does not apply. You agree to leave at check-out time on the last day of your stay.</p></Callout>
        <Sub title="1. Booking through Airbnb or Vrbo">
          <Clauses>
            <li>Every home is booked on Airbnb, and some on Vrbo too; the buttons on each home’s page take you to its listing. Your reservation is made with the platform, and the platform’s terms govern it.</li>
            <li>The price, fees, taxes, payment, changes, cancellations, and refunds are all handled by the platform under its own rules and the cancellation policy shown on the listing when you book. We do not take payment, hold your money, or issue refunds ourselves.</li>
            <li>We will never ask you to pay us directly, by wire, app, gift card, or any other way outside the platform. If anyone asks you to, it is not us; please report it to the platform and let us know.</li>
          </Clauses>
        </Sub>
        <Sub title="2. Who is staying">
          <Clauses start={4}>
            <li>The person who books must be at least 18, must stay at the home for the whole reservation, and is responsible for everyone in the party. We may ask you to confirm your identity through the platform before we send access codes.</li>
            <li>Tell us the true number of guests. Each home has a maximum, and it is there for septic systems, fire safety, and the neighbors as much as for comfort.</li>
          </Clauses>
        </Sub>
        <Sub title="3. House rules">
          <Clauses start={6}>
            <li>No parties or events. Our homes are in residential neighborhoods, on the water, and in the woods, and we want to keep the neighbors happy.</li>
            <li>Quiet hours are 10:00 pm to 8:00 am. Sound travels across water and through the trees.</li>
            <li>No smoking or vaping inside any home or within 25 feet of it. Fire season rules in Lewis County and Mason County may ban outdoor fires entirely; we will tell you if so.</li>
            <li>Pets are welcome only where the listing allows pets, with the number and type disclosed when you book. An undisclosed pet, or a pet at a home that does not allow them, may lead to a cleaning claim through the platform and may end the stay.</li>
            <li>Follow the posted instructions for the hot tub, wood stove, fire pit, and dock where a home has them. Children must be supervised near water at all times.</li>
            <li>Treat the home as you found it. Report breakages or problems within 24 hours, through the platform’s messages or by text to 253.278.6818, so we can fix them quickly and so you are not blamed for something you did not do.</li>
          </Clauses>
        </Sub>
        <Sub title="4. Check-in, check-out, and access">
          <Clauses start={12}>
            <li>Check-in is 4:00 pm and check-out is 11:00 am unless your listing or reservation says otherwise. Early check-in or late check-out is sometimes possible; ask us. Our cleaners work to a window, so please do not stay late without arranging it first.</li>
            <li>Your door code is personal to your reservation. Do not share it beyond your party, and do not let anyone who is not on the reservation stay overnight.</li>
          </Clauses>
        </Sub>
        <Sub title="5. Damage and refunds">
          <Clauses start={14}>
            <li>Damage, missing items, and excess cleaning are handled through the platform’s own process, such as Airbnb’s Resolution Center or Vrbo’s damage process. We may file a claim there on the homeowner’s behalf, with photos and costs. This is in addition to any rights the homeowner has under the law.</li>
            <li>Any refund, for any reason, is decided and paid by the platform under its rules.</li>
          </Clauses>
        </Sub>
        <Sub title="6. If we have to cancel">
          <Clauses start={16}>
            <li>Rarely, we may need to cancel: a double-booking caused by a calendar sync error, a safety issue such as a failed water system or wildfire evacuation order, or the home becoming unavailable. If so, the cancellation and your refund go through the platform under its host cancellation rules, and we will do our best to help you find a comparable stay at one of our homes or nearby.</li>
          </Clauses>
        </Sub>
        <Sub title="7. Related policies">
          <p>How cancellations and refunds work is summarized in the <P href="/legal/policies#cancellation">Booking, Cancellation and Refunds</P> policy. Damage, excess cleaning, and lost keys are covered in the <P href="/legal/policies#damage">Damage and Incidents Policy</P>. Late arrivals and no-shows are in the <P href="/legal/policies#no-shows">No-Shows and Late Arrivals</P> section. By staying at one of our homes, you accept all three.</p>
        </Sub>
      </Section>

      <Section id="owners" kicker="Part C" title="Homeowners">
        <p>This part summarizes how we work with the owners of the homes we manage. Your signed Management Agreement is the full contract, and if these terms and that agreement differ, the agreement wins.</p>
        <Sub title="1. The co-hosting relationship">
          <Clauses>
            <li>You own the home and keep the keys and the view. We market it, manage its Airbnb and Vrbo listings, accept reservations made on those platforms, talk to guests, schedule cleaning and small repairs, and report to you. We act as your agent for those tasks and nothing more; we do not take title, a lease, or any interest in the property.</li>
            <li>You authorize us to list the home on Airbnb and, if agreed, on Vrbo, either on your accounts as co-host or on ours as host, to accept reservations there on your behalf, and to send guests access codes and house information. You also allow us to feature the home on our website as an informational showcase that links to those listings. The website does not take bookings or payments.</li>
          </Clauses>
        </Sub>
        <Sub title="2. Pricing">
          <Clauses start={3}>
            <li>We set nightly rates, minimum stays, cleaning fees, and seasonal pricing on the platform listings using market data and our experience, within any floor or guardrails we agree in writing. You can ask for a change at any time and we will apply it to new bookings.</li>
          </Clauses>
        </Sub>
        <Sub title="3. Fees and money">
          <Clauses start={4}>
            <li>Our management or co-hosting fee, how it is calculated, and how it is collected are set in your Management Agreement.</li>
            <li>Guests pay the platform, not us. Neither West Coast Hosting Co nor this website collects guest payments or holds guest funds.</li>
            <li>Your payouts are paid by the platform, according to its payout rules (timing, method, and any co-host payout split the platform offers) and your Management Agreement. This website has no payout feature: we do not send, hold, or route owner payouts through it, and we do not collect your bank details.</li>
            <li>The cleaning fee shown on a listing is meant to cover the cleaner’s pay for that turnover, as your Management Agreement describes.</li>
            <li>You receive a monthly statement in the owner portal listing each stay and, where the amounts are on file, our fee and your net. It is a record of the stays, not a payment.</li>
          </Clauses>
        </Sub>
        <Sub title="4. Your own stays and blocked dates">
          <Clauses start={9}>
            <li>It is your home. Block dates for yourself, family, or friends through the portal or by asking us. Please give as much notice as you can, and avoid blocking dates that are already booked. Fees for owner stays, and for the turnover clean after one, follow your Management Agreement.</li>
          </Clauses>
        </Sub>
        <Sub title="5. Maintenance and repairs">
          <Clauses start={10}>
            <li>Repairs and replacements under $250 per item that are needed to keep a stay on track (a broken toaster, a plumber for a clog, a replacement hot tub filter) proceed without asking you, and appear on your statement with the receipt.</li>
            <li>Anything over $250, or any non-urgent improvement, we bring to you first with a quote. In a genuine emergency that threatens the home or a guest (a burst pipe, no heat in winter at The Bedrock, a failed well pump), we act first and call you immediately.</li>
            <li>We maintain a list of trusted local tradespeople, but you may name your own.</li>
          </Clauses>
        </Sub>
        <Sub title="6. Insurance">
          <Clauses start={13}>
            <li>You carry property and liability insurance that expressly covers short-term rental use, including guest injury, and you name us as an additional insured where your carrier allows. A standard homeowner policy often excludes paying guests; please check. See the <P href="/legal/policies#insurance">Insurance Policy</P> for the specifics.</li>
            <li>Platform host protections, such as Airbnb’s AirCover for Hosts, have their own limits and conditions and are not a substitute for your own insurance.</li>
            <li>We carry general liability insurance for our own operations. We are not an insurer of your home or its contents.</li>
          </Clauses>
        </Sub>
        <Sub title="7. Taxes, licenses, and permits">
          <Clauses start={16}>
            <li>Airbnb and Vrbo collect and remit Washington lodging and occupancy taxes on bookings made through them, where they are required to. We do not collect or remit lodging tax, because no bookings are made with us directly.</li>
            <li>You remain responsible for any remaining tax, licensing, and permit obligations for your home, such as income tax on your rental revenue, property tax, and any business license, short-term rental permit, or registration that the state, your city, or your county requires. We are happy to point you to the right office.</li>
          </Clauses>
        </Sub>
        <Sub title="8. Ending the relationship">
          <Clauses start={18}>
            <li>Either of us may end the relationship with 30 days’ written notice. Bookings already confirmed at the time of notice are honored and managed by us to completion, with our fee, unless you and we agree otherwise in writing. We return keys, hand over the listing accounts you own, and send a final statement within 30 days of the last managed stay.</li>
          </Clauses>
        </Sub>
      </Section>

      <Section id="cleaners" kicker="Part D" title="Cleaners">
        <p>This part applies if you clean our homes. It sits alongside your signed Independent Contractor Agreement, which controls if the two differ.</p>
        <Sub title="1. Independent contractor">
          <Clauses>
            <li>You are an independent contractor, not an employee of West Coast Hosting Co or of any homeowner. You decide which jobs to accept, how to do the work within our standards, and whether to bring helpers (whom you pay and are responsible for). You handle your own taxes, insurance, licenses, and supplies unless your agreement says we supply them.</li>
          </Clauses>
        </Sub>
        <Sub title="2. Accepting and scheduling jobs">
          <Clauses start={2}>
            <li>Jobs appear in the cleaner portal on the check-out day of each stay, with a window (usually 11:00 am to 4:00 pm) and the next check-in date. Accept or decline promptly; an accepted job is a commitment.</li>
            <li>If you cannot make an accepted job, tell us as early as possible, and no later than 24 hours before the window opens, so we can arrange cover.</li>
          </Clauses>
        </Sub>
        <Sub title="3. Service standard">
          <Clauses start={4}>
            <li>A job is complete when every checklist item is done to the standard in our guide, photos of each room and of any damage are uploaded through the portal, supplies are restocked, and the home is locked with the thermostat set, all before the window ends.</li>
            <li>Report damage, missing items, pests, safety hazards, or signs of a party or smoking the same day, with photos. This protects the owner and the next guest and keeps you clear of blame.</li>
          </Clauses>
        </Sub>
        <Sub title="4. Pay">
          <Clauses start={6}>
            <li>You are paid a set amount per job for each home, agreed in advance and shown in the portal. Larger jobs (deep cleans, post-party cleanups, linen replacement) are quoted separately. Pay is sent on the schedule in your agreement after the job is marked complete and reviewed.</li>
            <li>Non-performance can reduce pay as set out in the <P href="/legal/policies#cleaner-standards">Cleaner Service Standards and Penalties</P>. Bonuses or tips may be shared with you but are never promised.</li>
          </Clauses>
        </Sub>
        <Sub title="5. Confidentiality and safety">
          <Clauses start={8}>
            <li>Door codes, Wi-Fi passwords, alarm details, and anything you learn about guests or owners are confidential. Do not share codes, photograph guest belongings, or post about a home or a guest on social media.</li>
            <li>Work safely: use the equipment and products provided or approved, do not climb onto roofs or docks, and do not operate the wood stove or hot tub beyond what the checklist asks. If you are hurt or something goes wrong, call us the same day.</li>
          </Clauses>
        </Sub>
        <Sub title="6. Ending the arrangement">
          <Clauses start={10}>
            <li>Either side may end the arrangement at any time with written notice; accepted jobs in the next 14 days should still be completed or handed back with enough notice to cover. We may remove you from the roster immediately for a serious breach: sharing codes, theft, harassment, or two no-shows in 90 days.</li>
          </Clauses>
        </Sub>
      </Section>
    </LegalLayout>
  );
}
