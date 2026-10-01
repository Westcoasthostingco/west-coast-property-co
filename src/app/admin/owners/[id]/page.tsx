import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import OwnerForm from "@/components/admin/OwnerForm";
import { Card, DataTable, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { saveOwnerAction } from "@/app/admin/actions";
import { getAllProperties, getBookings, money, nameMap } from "@/lib/data";
import { fmtDate, getOwnerDetail, getPayoutsDetailed } from "@/lib/admin";

export const metadata: Metadata = { title: "Owner" };

export default async function OwnerPage({ params, searchParams }: PageProps<"/admin/owners/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [o, props, payouts, bookings] = await Promise.all([getOwnerDetail(id), getAllProperties(), getPayoutsDetailed(), getBookings()]);
  if (!o) notFound();
  const homes = props.filter((p) => p.ownerId === o.id);
  const mine = payouts.filter((x) => x.ownerId === o.id).sort((a, b) => b.releaseOn.localeCompare(a.releaseOn));
  const propertyOf = (bookingId: string) => nameMap(props)(bookings.find((b) => b.id === bookingId)?.propertyId ?? "");
  const paid = mine.filter((x) => x.status === "paid").reduce((s, x) => s + x.net, 0);
  const scheduled = mine.filter((x) => x.status === "scheduled").reduce((s, x) => s + x.net, 0);

  return (
    <>
      <PageHeader eyebrow="Owner" title={o.name} intro={`${o.email} · ${o.feePercent}% fee · ${homes.length} home${homes.length === 1 ? "" : "s"}`}
        actions={<Link href="/admin/owners" className="ui text-sm text-deep hover:underline">All owners</Link>} />
      <Notice searchParams={sp} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <OwnerForm owner={o} action={saveOwnerAction.bind(null, o.id)} />
          <section className="space-y-2">
            <h2 className="caps-tight text-[0.68rem] text-deep">Recent payouts</h2>
            <DataTable head={["Release", "Home", "Gross", "Fee", "Net", "Status"]} empty="No payouts yet."
              rows={mine.slice(0, 15).map((x) => [
                <Link key="b" href={`/admin/bookings/${x.bookingId}`} className="hover:text-deep">{fmtDate(x.releaseOn, { month: "short", day: "numeric", year: "numeric" })}</Link>,
                propertyOf(x.bookingId), money(x.gross), money(x.fee), money(x.net),
                <span key="s"><Pill value={x.status} />{x.lastError && <span className="ml-2 text-xs text-[#b6633a]">{x.lastError}</span>}</span>,
              ])} />
          </section>
        </div>

        <div className="space-y-4">
          <Card title="Stripe Connect">
            <div className="flex items-center justify-between">
              <span className="ui text-sm">{o.payoutsReady ? "Payouts enabled" : o.stripeAccountId ? "Onboarding incomplete" : "Not started"}</span>
              <Pill value={o.payoutsReady ? "configured" : "pending"} />
            </div>
            <dl className="ui mt-3 space-y-1 text-xs text-muted">
              <div className="flex justify-between"><dt>Account</dt><dd className="text-charcoal">{o.stripeAccountId ?? "—"}</dd></div>
              <div className="flex justify-between"><dt>Clerk</dt><dd className="text-charcoal">{o.clerkUserId ? "linked" : "not linked"}</dd></div>
              <div className="flex justify-between"><dt>Paid to date</dt><dd className="text-charcoal">{money(paid)}</dd></div>
              <div className="flex justify-between"><dt>Scheduled</dt><dd className="text-charcoal">{money(scheduled)}</dd></div>
            </dl>
            {!o.payoutsReady && <p className="ui mt-3 text-xs text-muted">The owner finishes Stripe onboarding from their portal (Set up payouts). Transfers hold until then and retry daily.</p>}
          </Card>
          <Card title="Homes">
            {homes.length === 0 && <p className="ui text-sm text-muted">No homes yet.</p>}
            <ul className="ui divide-y divide-line text-sm">
              {homes.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <Link href={`/admin/properties/${p.id}`} className="font-medium text-charcoal hover:text-deep">{p.name}</Link>
                  <span className="text-muted">{money(p.nightlyRate)}/nt</span>
                </li>
              ))}
            </ul>
            <Link href="/admin/properties/new" className="ui mt-3 inline-block text-sm text-deep hover:underline">+ Add a home</Link>
          </Card>
        </div>
      </div>
    </>
  );
}
