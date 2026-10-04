import type { Metadata } from "next";
import { Clauses, Section, Sub } from "@/components/legal/LegalLayout";
import { LEGAL_UPDATED, formatLegalDate } from "@/lib/legal";

// Rendered per request so the portal layout checks the role every time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Owner terms" };

// Working terms for homeowners. Kept inside the portal (sign-in only) rather than on
// the public site, which is a showcase of the homes. The signed agreement controls.
export default function OwnerTerms() {
  return (
    <div className="space-y-12 text-[1.05rem] leading-relaxed text-charcoal">
      <header>
        <p className="caps text-xs text-deep">Portal</p>
        <h1 className="display mt-2 text-4xl text-deep">Owner terms</h1>
        <p className="ui mt-3 text-xs text-muted">Last updated {formatLegalDate(LEGAL_UPDATED)}. A plain-language summary, not yet reviewed by a Washington attorney.</p>
      </header>
      <Section id="owners" title="Homeowners">
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
            <li>You carry property and liability insurance that expressly covers short-term rental use, including guest injury, and you name us as an additional insured where your carrier allows. A standard homeowner policy often excludes paying guests; please check. See the <a href="#insurance" className="text-deep hover:underline">Insurance</a> section below for the specifics.</li>
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

      <Section id="insurance" title="Insurance">
        <Sub title="What homeowners carry">
          <Clauses>
            <li>Each homeowner we work with must hold a property policy that expressly covers short-term rental use, with contents cover for furnishings and, where applicable, the hot tub, dock, and outbuildings.</li>
            <li>Liability cover of at least $1,000,000 per occurrence for guest injury on the property, naming West Coast Hosting Co as an additional insured where the carrier allows.</li>
            <li>Loss-of-income cover is recommended but optional. Owners send us a current certificate each year and tell us if the policy changes or lapses.</li>
            <li>Platform host protections, such as Airbnb’s AirCover for Hosts, have their own limits and conditions and are not a substitute for the homeowner’s own insurance.</li>
          </Clauses>
        </Sub>
        <Sub title="What West Coast Hosting Co carries">
          <Clauses start={5}>
            <li>General liability insurance covering our own operations as a property manager and co-host. Our cover does not extend to the homes themselves, their contents, or the homeowner’s liability as a property owner.</li>
          </Clauses>
        </Sub>
        <Sub title="Guests">
          <Clauses start={6}>
            <li>We strongly encourage travel insurance that covers trip cancellation, interruption, and medical costs. Platform cancellation policies often give little or no refund close to check-in for illness, weather, or travel disruption, and travel insurance is designed for exactly those cases.</li>
            <li>West Coast Hosting Co is not an insurer. We do not cover your belongings, vehicles, or travel costs.</li>
            <li>Airbnb and Vrbo offer their own guest protections under their terms. Those apply to your booking, not anything on this page.</li>
          </Clauses>
        </Sub>
      </Section>

    </div>
  );
}
