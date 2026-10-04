import type { Metadata } from "next";
import { Bullets, Clauses, Schedule, Section, Sub } from "@/components/legal/LegalLayout";
import { LEGAL_UPDATED, formatLegalDate } from "@/lib/legal";

// Rendered per request so the portal layout checks the role every time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Standards" };

// Working terms for cleaners. Kept inside the portal (sign-in only) rather than on
// the public site, which is a showcase of the homes. The signed agreement controls.
export default function CleanerStandards() {
  return (
    <div className="space-y-12 text-[1.05rem] leading-relaxed text-charcoal">
      <header>
        <p className="caps text-xs text-deep">Portal</p>
        <h1 className="display mt-2 text-4xl text-deep">Cleaner terms and standards</h1>
        <p className="ui mt-3 text-xs text-muted">Last updated {formatLegalDate(LEGAL_UPDATED)}. A plain-language summary, not yet reviewed by a Washington attorney.</p>
      </header>
      <Section id="cleaners" title="Cleaners">
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
            <li>Non-performance can reduce pay as set out in the <a href="#cleaner-standards" className="text-deep hover:underline">Service Standards and Penalties</a> below. Bonuses or tips may be shared with you but are never promised.</li>
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
      <Section id="cleaner-standards" title="Cleaner Service Standards and Penalties">
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

    </div>
  );
}
