import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout, { Bullets, Callout, Clauses, Schedule, Section, Sub, type LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = { title: "Policies", description: "Booking and cancellation, damage and incidents, insurance, cleaner service standards, no-shows and late arrivals, and accessibility at West Coast Hosting Co." };

const sections: LegalSection[] = [
  { id: "cancellation", title: "Booking and Cancellation" },
  { id: "damage", title: "Damage, Deposits and Incidents" },
  { id: "insurance", title: "Insurance" },
  { id: "cleaner-standards", title: "Cleaner Service Standards and Penalties" },
  { id: "no-shows", title: "Guest No-Shows and Late Arrivals" },
  { id: "accessibility", title: "Accessibility and Non-discrimination" },
];

export default function PoliciesPage() {
  return (
    <LegalLayout eyebrow="Legal" title="Policies" sections={sections} intro="The specific rules that sit behind our Terms of Use. Each section stands on its own, so you can link straight to the one you need.">
      <Section id="cancellation" kicker="Policy A" title="Booking and Cancellation">
        <p>This policy applies to stays booked directly with us on westcoasthostingco.com. If you booked through Airbnb, Vrbo, or Booking.com, that platform’s cancellation terms apply instead, and you cancel through the platform.</p>
        <Sub title="Refund tiers">
          <Schedule head={["When you cancel", "Refund"]} rows={[
            ["14 or more days before check-in", "Full refund", "Including cleaning fee and tax. We absorb the card processing cost."],
            ["7 to 13 days before check-in", "50% refund", "Half of the nightly total; the cleaning fee and tax are refunded in full."],
            ["Fewer than 7 days before check-in", "No refund"],
            ["No-show, or early departure", "No refund"],
          ]} />
          <p>Days are counted to 4:00 pm Pacific on your check-in date. A cancellation received at 3:00 pm fourteen days before check-in is in the free tier; one received the next morning is not.</p>
        </Sub>
        <Sub title="How to cancel">
          <Clauses>
            <li>Reply to your booking confirmation email, or email <a href="mailto:hello@westcoasthostingco.com" className="text-deep hover:underline">hello@westcoasthostingco.com</a> from the address on the booking, with the home and dates. A text to 253.278.6818 works too; we will confirm by email.</li>
            <li>Your cancellation is effective when we receive it, and we confirm by email within one business day.</li>
          </Clauses>
        </Sub>
        <Sub title="How refunds are issued">
          <Clauses start={3}>
            <li>Refunds go back to the card you paid with, through Stripe. We issue them within two business days of confirming the cancellation; your bank usually shows the credit within 5 to 10 business days.</li>
            <li>We cannot refund to a different card or by other means, except where the original card has been closed, in which case Stripe routes the refund to the replacement account.</li>
          </Clauses>
        </Sub>
        <Sub title="Changing dates">
          <Clauses start={5}>
            <li>If you need to move your stay, ask us. Where the home is available we will move the booking once without charge up to 7 days before check-in, with any price difference paid or refunded. Moving a stay inside 7 days is treated as a cancellation of the original dates.</li>
          </Clauses>
        </Sub>
        <Sub title="If we cancel">
          <Clauses start={6}>
            <li>We may cancel a booking for safety or force majeure: wildfire or evacuation order, flooding or storm damage, loss of water or power that cannot be fixed in time, a road closure that makes the home unreachable (State Route 12 near Randle and the Hood Canal Bridge are the ones we watch), or a double-booking from a calendar sync error. You receive a full refund of everything you paid, and we will help you rebook with us or find a comparable stay nearby. Travel costs are not covered, which is one reason we recommend travel insurance.</li>
            <li>We may also end a stay early, without refund, for a serious breach of the house rules: a party, smoking inside, an undisclosed pet, or more people than booked.</li>
          </Clauses>
        </Sub>
      </Section>

      <Section id="damage" kicker="Policy B" title="Damage, Deposits and Incidents">
        <Callout><p>We do not take a cash security deposit for direct bookings. Instead, by booking you authorize us to charge the card used at checkout for damage and the other costs below, up to <strong>$1,500</strong>, after written notice. For platform bookings, the platform’s damage process applies.</p></Callout>
        <Sub title="What you are responsible for">
          <Clauses>
            <li>Damage to the home, furnishings, hot tub, dock, or grounds beyond normal wear and tear, caused by you or anyone in your party, including pets. Normal wear is a scuffed wall or a worn towel; a burn in a countertop or a broken window is not.</li>
            <li>Missing items, and the cost of replacing lost keys, fobs, or parking passes. If a lock code must be changed because it was shared, a $75 reprogramming fee applies.</li>
            <li>Excess cleaning of <strong>$150 or more</strong> when a home is left in a condition our regular clean cannot handle in the window: smoking or vaping inside, an undisclosed pet or a pet at a home that does not allow them, trash or food left out, or stained linens requiring replacement. We charge the actual extra cleaner time and any replacement cost.</li>
            <li>Fines or fees charged by a city, county, or HOA because of your conduct, such as a noise citation.</li>
          </Clauses>
        </Sub>
        <Sub title="How we document and tell you">
          <Clauses start={5}>
            <li>Our cleaner photographs every room at the start of each turnover and notes damage in the portal. We review within 24 hours of your check-out.</li>
            <li>If we find damage, we email you within 7 days of check-out with photos and an itemized estimate from a repair quote, a replacement price, or the cleaner’s extra time. You have 5 days to respond before we charge the card.</li>
            <li>We charge only the actual cost of repair or replacement, never a penalty, and we send the receipt when the work is done. If the final cost is lower than the estimate, we refund the difference.</li>
            <li>If the damage exceeds $1,500, we will ask you to pay the balance directly and may pursue it through the dispute process in our Terms of Use or through the owner’s insurance.</li>
          </Clauses>
        </Sub>
        <Sub title="Disputes">
          <Clauses start={9}>
            <li>If you disagree with a charge, reply in writing within 14 days of our notice with your reasons and any photos of your own. We will review and respond within 10 business days. Where you reported a pre-existing problem within 24 hours of check-in, you will not be charged for it.</li>
          </Clauses>
        </Sub>
        <Sub title="Incidents during a stay">
          <Clauses start={10}>
            <li>For an injury, fire, or anything urgent, call 911 first, then us at 253.278.6818. For anything else that goes wrong (a leak, a broken appliance, a hot tub that is not heating), text or call us the same day. Most issues are fixed within a few hours; where a home becomes unusable we will rebook or refund the unused nights.</li>
          </Clauses>
        </Sub>
        <Sub title="Owner reimbursement">
          <Clauses start={11}>
            <li>Amounts we recover for damage are paid to the homeowner within 10 business days of collection, less any repair we have already paid for on their behalf, and appear on the monthly statement.</li>
          </Clauses>
        </Sub>
      </Section>

      <Section id="insurance" kicker="Policy C" title="Insurance">
        <Sub title="What homeowners carry">
          <Clauses>
            <li>Each homeowner we work with must hold a property policy that expressly covers short-term rental use, with contents cover for furnishings and, where applicable, the hot tub, dock, and outbuildings.</li>
            <li>Liability cover of at least $1,000,000 per occurrence for guest injury on the property, naming West Coast Hosting Co as an additional insured where the carrier allows.</li>
            <li>Loss-of-income cover is recommended but optional. Owners send us a current certificate each year and tell us if the policy changes or lapses.</li>
          </Clauses>
        </Sub>
        <Sub title="What West Coast Hosting Co carries">
          <Clauses start={4}>
            <li>General liability insurance covering our own operations as a property manager and co-host. Our cover does not extend to the homes themselves, their contents, or the homeowner’s liability as a property owner.</li>
          </Clauses>
        </Sub>
        <Sub title="Guests">
          <Clauses start={5}>
            <li>We strongly encourage travel insurance that covers trip cancellation, interruption, and medical costs. Our cancellation policy does not refund inside 7 days for illness, weather, or travel disruption, and travel insurance is designed for exactly those cases.</li>
            <li>West Coast Hosting Co is not an insurer. We do not cover your belongings, vehicles, or travel costs.</li>
            <li>Bookings made through Airbnb, Vrbo, or Booking.com are covered by that platform’s host and guest protections, which apply instead of this policy to the extent the two differ.</li>
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
          <li>If you do not arrive and do not tell us by 11:00 am the day after check-in, the booking is treated as a no-show. No refund is given, and the home may be released for other guests from that point.</li>
          <li>Access codes activate at check-in time (4:00 pm unless your confirmation says otherwise) and stop working at check-out time on your last day. You can arrive at any hour after check-in time; the code works the same at 4:00 pm or midnight.</li>
          <li>If you expect to arrive after 10:00 pm, please text us so we know you are on your way and not stranded. Mountain roads to Randle and the stretch along Hood Canal are dark and can be slow in winter, and we would rather hear from you than worry.</li>
          <li>If you are delayed by a day or more, tell us as soon as you know. We cannot refund the missed nights, but we will make sure the home is ready when you do arrive.</li>
        </Clauses>
      </Section>

      <Section id="accessibility" kicker="Policy F" title="Accessibility and Non-discrimination">
        <p>Everyone is welcome at our homes. We do not discriminate on the basis of race, color, religion, national origin, sex, sexual orientation, gender identity, familial status, disability, age, veteran status, or any other characteristic protected by Washington or federal law, and we expect the same of the owners we work with and the guests who stay.</p>
        <p>Our homes are older, individually owned houses on hillsides, shorelines, and forest lots, and not all are step-free. Each listing describes stairs, bathroom layout, parking, and paths honestly. If you have an accessibility need, email or call us before booking and we will tell you plainly whether a home will work for you and what we can arrange. Service animals are welcome at every home, regardless of pet policy, at no charge.</p>
        <p>We aim to keep this website usable with a keyboard and a screen reader. If something gets in your way, tell us at <a href="mailto:hello@westcoasthostingco.com" className="text-deep hover:underline">hello@westcoasthostingco.com</a> and we will fix it or help you by phone.</p>
        <p className="text-sm text-muted">See also our <Link href="/legal/terms" className="text-deep hover:underline">Terms of Use</Link> and <Link href="/legal/privacy" className="text-deep hover:underline">Privacy Notice</Link>.</p>
      </Section>
    </LegalLayout>
  );
}
