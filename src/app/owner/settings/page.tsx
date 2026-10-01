import type { Metadata } from "next";
import AlmostThere from "@/components/owner/AlmostThere";
import Card from "@/components/owner/Card";
import PageHeader from "@/components/owner/PageHeader";
import Pill from "@/components/owner/Pill";
import { getOwnerData, loadOwner } from "@/lib/owner";

export const metadata: Metadata = { title: "Settings" };

const prefs = [
  ["booking", "A guest books one of my homes", true],
  ["checkin", "Reminder the day before a check-in", false],
  ["cleaning", "A turnover is finished", false],
  ["statement", "My monthly statement is ready", true],
  ["payout", "A payout is sent", true],
] as const;

export default async function OwnerSettings() {
  const owner = await loadOwner();
  if (!owner) return <AlmostThere />;
  const { properties } = await getOwnerData(owner);

  return (
    <>
      <PageHeader eyebrow="Your account" title="Settings" intro="How we reach you and how you get paid. Anything you cannot change here, just ask us and we will update it." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Contact details">
          <dl className="ui grid gap-3 text-sm">
            <div><dt className="caps-tight text-[0.6rem] text-sky">Name</dt><dd className="mt-1 text-charcoal">{owner.name}</dd></div>
            <div><dt className="caps-tight text-[0.6rem] text-sky">Email</dt><dd className="mt-1 text-charcoal">{owner.email}</dd></div>
            <div><dt className="caps-tight text-[0.6rem] text-sky">Homes</dt><dd className="mt-1 text-charcoal">{properties.map((p) => p.name).join(", ") || "None linked yet"}</dd></div>
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-muted">Need to change your name or email? Reply to any of our emails and we will update it for you.</p>
        </Card>

        <Card title="Payouts" aside={<Pill tone={owner.payoutsReady ? "good" : "attention"}>{owner.payoutsReady ? "Ready" : "Not set up"}</Pill>}>
          {owner.payoutsReady ? (
            <p className="text-sm leading-relaxed text-charcoal">
              Your bank account is connected through Stripe. Your share of each stay is released the day after check-in and usually arrives within two business days.
            </p>
          ) : (
            <form action="/api/stripe/connect/onboard" method="post" className="space-y-3">
              <p className="text-sm leading-relaxed text-charcoal">
                Add your bank details with Stripe to receive your share of each stay. It takes about five minutes; Stripe handles identity and tax details securely.
              </p>
              <button type="submit" className="caps-tight rounded-full bg-teal px-5 py-2 text-[0.7rem] text-white transition hover:bg-teal-dark">Set up payouts</button>
            </form>
          )}
        </Card>

        <Card title="Management fee">
          <p className="display text-4xl not-italic text-charcoal">{owner.feePercent}%</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Of the nights subtotal only. Cleaning fees and lodging tax are collected from guests and are never fee-bearing. Card processing costs come out of our side, not yours.
          </p>
        </Card>

        <Card title="Notifications" aside={<span className="ui text-xs text-muted">TODO: not saved yet</span>}>
          <form className="space-y-3">
            {prefs.map(([key, label, on]) => (
              <label key={key} className="flex items-start gap-3 text-sm text-charcoal">
                <input type="checkbox" name={key} defaultChecked={on} disabled className="mt-1 accent-teal" />
                <span>{label}</span>
              </label>
            ))}
            <button type="submit" disabled className="caps-tight mt-2 cursor-not-allowed rounded-full bg-teal/40 px-5 py-2 text-[0.7rem] text-white">Save preferences</button>
            <p className="ui text-xs leading-relaxed text-muted">Email notifications arrive with the notifications step (Resend). Preferences will be saved to your owner record then.</p>
          </form>
        </Card>
      </div>
    </>
  );
}
