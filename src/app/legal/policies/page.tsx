import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout, { Bullets, Callout, Clauses, Schedule, Section, Sub, type LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = { title: "Policies", description: "How booking, cancellation and refunds work through Airbnb and Vrbo, plus damage and incidents, insurance, cleaner service standards, no-shows and late arrivals, and accessibility at West Coast Hosting Co." };

const sections: LegalSection[] = [
  { id: "cancellation", title: "Booking, Cancellation and Refunds" },
  { id: "damage", title: "Damage and Incidents" },
  { id: "insurance", title: "Insurance" },
  { id: "cleaner-standards", title: "Cleaner Service Standards and Penalties" },
  { id: "no-shows", title: "Guest No-Shows and Late Arrivals" },
  { id: "accessibility", title: "Accessibility and Non-discrimination" },
];

export default function PoliciesPage() {
  return (
    <LegalLayout eyebrow="Legal" title="Policies" sections={sections} intro="The specific rules that sit behind our Terms of Use. Each section stands on its own, so you can link straight to the one you need.">
      <Callout>
        <p><strong>Before you read on.</strong> West Coast Hosting Co provides hosting and co-hosting services to homeowners. Our website is informational and does not accept reservations or payments. All reservations are made, paid, changed, cancelled, and refunded through Airbnb or Vrbo, under that platform’s terms and policies, which govern the booking. The policies below explain how we work alongside those platforms.</p>
      </Callout>

      <Section id="cancellation" kicker="Policy A" title="Booking, Cancellation and Refunds">
        <p>Every home is booked through Airbnb, and some through Vrbo as well. Use the buttons on each home’s page to reach its listing.</p>
        <Clauses>
          <li>Your cancellation terms are the cancellation policy shown on the platform listing at the time you book. We set which of the platform’s standard policies a home uses, but the platform applies it.</li>
          <li>To change dates, cancel, or ask about a refund, use your reservation in the Airbnb or Vrbo app or website. You are welcome to message us there first if you are unsure; we will help where the platform allows.</li>
          <li>Refunds are calculated and paid by the platform, to the payment method you used there, on its timeline. We cannot issue refunds, take payment, or change a price ourselves.</li>
          <li>If we ever have to cancel for safety or force majeure (wildfire or an evacuation order, flooding or storm damage, loss of water or power that cannot be fixed in time, a road closure that makes the home unreachable, such as State Route 12 near Randle or the Hood Canal Bridge, or a double-booking from a calendar sync error), the cancellation goes through the platform under its host cancellation rules. We will help you find a comparable stay with us or nearby. Travel costs are not covered, which is one reason we recommend travel insurance.</li>
          <li>We may end a stay early for a serious breach of the house rules, such as a party, smoking inside, an undisclosed pet, or more people than booked. We do this through the platform and under its rules, and any refund decision is the platform’s.</li>
        </Clauses>
      </Section>

      <Section id="damage" kicker="Policy B" title="Damage and Incidents">
        <Callout><p>We never collect a security deposit or charge a guest ourselves. Damage and excess cleaning are handled through the platform you booked on, for example Airbnb’s Resolution Center, or Vrbo’s damage process (including any damage deposit Vrbo holds for a listing), under that platform’s rules.</p></Callout>
        <Sub title="What guests are responsible for">
          <Clauses>
            <li>Damage to the home, furnishings, hot tub, dock, or grounds beyond normal wear and tear, caused by you or anyone in your party, including pets. Normal wear is a scuffed wall or a worn towel; a burn in a countertop or a broken window is not.</li>
            <li>Missing items, and the cost of replacing lost keys, fobs, or parking passes, or of reprogramming a lock because a code was shared.</li>
            <li>Excess cleaning when a home is left in a condition our regular clean cannot handle in the window: smoking or vaping inside, an undisclosed pet or a pet at a home that does not allow them, trash or food left out, or stained linens that need replacing.</li>
            <li>Fines or fees charged by a city, county, or HOA because of your conduct, such as a noise citation.</li>
          </Clauses>
        </Sub>
        <Sub title="Reporting a problem">
          <Clauses start={5}>
            <li>If something breaks or you find a problem, tell us through the platform’s messages within 24 hours, with a photo if you can. Where you reported a pre-existing problem within 24 hours of check-in, we will not claim for it.</li>
          </Clauses>
        </Sub>
        <Sub title="How we document and claim">
          <Clauses start={6}>
            <li>Our cleaner photographs every room at each turnover and notes damage in the portal. We review within 24 hours of check-out.</li>
            <li>If we find damage, we message you through the platform with photos and a description, and give you a chance to respond.</li>
            <li>If it is not resolved between us, we file a claim through the platform’s process on the homeowner’s behalf, within the platform’s deadlines, with photos and an itemized estimate from a repair quote, a replacement price, or the cleaner’s extra time. We claim only the actual cost, never a penalty.</li>
            <li>The platform decides the claim under its rules, and you can respond through the platform. This does not limit any other rights the homeowner has under the law.</li>
          </Clauses>
        </Sub>
        <Sub title="Incidents during a stay">
          <Clauses start={10}>
            <li>For an injury, fire, or anything urgent, call 911 first, then us at 253.278.6818. For anything else that goes wrong (a leak, a broken appliance, a hot tub that is not heating), text or call us the same day. Most issues are fixed within a few hours. Where a home becomes unusable, we will work with you and the platform on rebooking or a refund of the unused nights.</li>
          </Clauses>
        </Sub>
        <Sub title="For homeowners">
          <Clauses start={11}>
            <li>Amounts a platform pays on a damage claim go to the homeowner, either directly from the platform or passed on by us as the Management Agreement provides, and appear on the monthly statement.</li>
          </Clauses>
        </Sub>
      </Section>

      <Section id="insurance" kicker="Policy C" title="Insurance">
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

      <Section id="cleaner-standards" kicker="Policy D" title="Cleaner Service Standards and Penalties">
        <p>This schedule is referenced by every cleaner’s Independent Contractor Agreement. It exists so expectations are the same for everyone, and so a guest never walks into a home that is not ready.</p>
        <Sub title="Definitions">
          <Bullets>
            <li><strong>Job window</strong>: the start and end time shown on the job in the cleaner portal, normally 11:00 am to 4:00 pm on check-out day. The window end is the latest the home may be unready.</li>
            <li><strong>Checklist</strong>: the list of tasks on the job in the portal, adjusted per home (for example, the hot tub and wood stove at The Bedrock, the fire pit and oyster beach shower at The Leonora).</li>
            <li><strong>Photo proof</strong>: at least one photo of each room and of any damage or issue, uploaded through the portal before marking the job done.</li>
            <li><strong>Notice</strong>: a call or text to us. The earlier the better; at least 24 hours before the window opens is expected.</li>
            <li><strong>Job pay</strong>: the set amount for one standard turnover at that home.</li>
          </Bullets>
        </Sub>
        <Sub title="Standards">
          <Clauses>
            <li>Arrive within the window and finish, with the checklist complete and photos uploaded, before the window ends.</li>
            <li>Clean to the standard in our guide: beds made hotel-style, bathrooms and kitchen sanitized, floors done, trash and recycling out, supplies restocked, damage checked, thermostat set, and the home locked.</li>
            <li>Report anything unusual the same day.</li>
          </Clauses>
        </Sub>
        <Sub title="Penalty schedule">
          <Schedule head={["Event", "Consequence"]} rows={[
            ["Late completion past the window end, without notice", "25% deducted from that job’s pay"],
            ["Job not completed and no notice given (no-show)", "No pay for the job, plus the cost of emergency cover", "Emergency cover is what we pay another cleaner or a service to get the home ready."],
            ["Two no-shows within 90 days", "Removal from the roster"],
            ["Damage caused during a clean", "Repair cost deducted, up to one job’s pay", "Anything above one job’s pay is settled by agreement."],
            ["Missed checklist items found by the next guest", "15% deducted from that job’s pay", "Based on a guest report or our inspection with photos."],
          ]} />
          <Clauses start={4}>
            <li>Only one deduction applies per job, the larger one if more than one event occurs.</li>
            <li>Late completion <em>with</em> notice before the window ends is not penalized when we can still have the home ready for the guest; we track it, and a pattern of lateness is addressed in a conversation.</li>
            <li>Bonuses and guest tips are not promised. When a guest leaves a tip or praises a clean, we pass it on.</li>
          </Clauses>
        </Sub>
        <Sub title="Appeals">
          <Clauses start={7}>
            <li>If you think a deduction is wrong, email <a href="mailto:hello@westcoasthostingco.com" className="text-deep hover:underline">hello@westcoasthostingco.com</a> within 7 days of the pay statement with what happened and any photos or messages. We respond within 5 business days, and a deduction found to be unfair is paid in full with the next payment.</li>
          </Clauses>
        </Sub>
      </Section>

      <Section id="no-shows" kicker="Policy E" title="Guest No-Shows and Late Arrivals">
        <Clauses>
          <li>What happens if you do not arrive, including whether any refund is due, is governed by the platform you booked on and the cancellation policy on your listing. If your plans change, update your reservation on the platform as soon as you can.</li>
          <li>Access codes activate at check-in time (4:00 pm unless your reservation says otherwise) and stop working at check-out time on your last day. You can arrive at any hour after check-in time; the code works the same at 4:00 pm or midnight.</li>
          <li>If you expect to arrive after 10:00 pm, please message or text us so we know you are on your way and not stranded. Mountain roads to Randle and the stretch along Hood Canal are dark and can be slow in winter, and we would rather hear from you than worry.</li>
          <li>If you are delayed by a day or more, tell us as soon as you know, so we can make sure the home is ready when you do arrive.</li>
        </Clauses>
      </Section>

      <Section id="accessibility" kicker="Policy F" title="Accessibility and Non-discrimination">
        <p>Everyone is welcome at our homes. We do not discriminate on the basis of race, color, religion, national origin, sex, sexual orientation, gender identity, familial status, disability, age, veteran status, or any other characteristic protected by Washington or federal law, and we expect the same of the owners we work with and the guests who stay.</p>
        <p>Our homes are older, individually owned houses on hillsides, shorelines, and forest lots, and not all are step-free. Each listing describes stairs, bathroom layout, parking, and paths honestly. If you have an accessibility need, email, call, or message us on the platform before booking and we will tell you plainly whether a home will work for you and what we can arrange. Service animals are welcome at every home, regardless of pet policy, at no charge.</p>
        <p>We aim to keep this website usable with a keyboard and a screen reader. If something gets in your way, tell us at <a href="mailto:hello@westcoasthostingco.com" className="text-deep hover:underline">hello@westcoasthostingco.com</a> and we will fix it or help you by phone.</p>
        <p className="text-sm text-muted">See also our <Link href="/legal/terms" className="text-deep hover:underline">Terms of Use</Link> and <Link href="/legal/privacy" className="text-deep hover:underline">Privacy Notice</Link>.</p>
      </Section>
    </LegalLayout>
  );
}
