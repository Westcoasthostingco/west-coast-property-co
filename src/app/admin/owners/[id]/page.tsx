import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import OwnerForm from "@/components/admin/OwnerForm";
import { Card, DataTable, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { saveOwnerAction } from "@/app/admin/actions";
import { getAllProperties, getBookings, getFeeOverrides, money, nameMap } from "@/lib/data";
import { fmtDate, getOwnerDetail, nightsBetween } from "@/lib/admin";
import { feeTerms, feeTermsLabel, isOwnerStay, stayMoney } from "@/lib/metrics";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Owner" };

export default async function OwnerPage({ params, searchParams }: PageProps<"/admin/owners/[id]">) {
  await requireRole("admin"); // S1: pages must not rely on the layout for auth
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [o, props, bookings, feeOverrides] = await Promise.all([getOwnerDetail(id), getAllProperties(), getBookings(), getFeeOverrides()]);
  if (!o) notFound();
  const homes = props.filter((p) => p.ownerId === o.id);
  const homeIds = new Set(homes.map((p) => p.id));
  const propertyName = nameMap(props);
  // Guest stays at this owner's homes, newest first. Fixed fee and cleaning on every guest
  // stay; gross, % fee and net only where the nights subtotal is recorded.
  const stays = bookings
    .filter((b) => homeIds.has(b.propertyId) && b.status !== "cancelled" && b.status !== "pending" && !isOwnerStay(b))
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
    .map((b) => ({ b, m: stayMoney(b, feeTerms(o, feeOverrides[b.propertyId], props.find((p) => p.id === b.propertyId))) }));
  const feesToDate = stays.reduce((s, x) => s + Math.round((x.m?.managementFee ?? 0) * 100), 0) / 100;

  return (
    <>
      <PageHeader eyebrow="Owner" title={o.name} intro={`${o.email} · ${feeTermsLabel(o)} fee · ${homes.length} home${homes.length === 1 ? "" : "s"}`}
        actions={<Link href="/admin/owners" className="ui text-sm text-deep hover:underline">All owners</Link>} />
      <Notice searchParams={sp} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <OwnerForm owner={o} action={saveOwnerAction.bind(null, o.id)} />
          <section className="space-y-2">
            <h2 className="caps-tight text-[0.68rem] text-deep">Recent stays</h2>
            <DataTable head={["Check-in", "Home", "Source", "Nights", "Gross", "% fee", "Fixed fee", "Cleaning", "Net", "Status"]} empty="No stays yet."
              rows={stays.slice(0, 15).map(({ b, m }) => [
                <Link key="b" href={`/admin/bookings/${b.id}`} className="hover:text-deep">{fmtDate(b.checkIn, { month: "short", day: "numeric", year: "numeric" })}</Link>,
                propertyName(b.propertyId), b.source, nightsBetween(b.checkIn, b.checkOut),
                m?.gross != null ? money(m.gross) : "Paid by platform", m?.gross != null ? money(m.percentFee) : "", m ? money(m.fixedFee) : "", m ? money(m.cleaning) : "", m?.net != null ? money(m.net) : "",
                <Pill key="s" value={b.status} />,
              ])} />
          </section>
        </div>

        <div className="space-y-4">
          <Card title="Account">
            <dl className="ui space-y-1 text-xs text-muted">
              <div className="flex justify-between"><dt>Portal login (Clerk)</dt><dd className="text-charcoal">{o.clerkUserId ? "linked" : "not linked"}</dd></div>
              <div className="flex justify-between"><dt>Stays on record</dt><dd className="text-charcoal">{stays.length}</dd></div>
              <div className="flex justify-between"><dt>Management fees (% + fixed)</dt><dd className="text-charcoal">{money(feesToDate)}</dd></div>
            </dl>
            <p className="ui mt-3 text-xs text-muted">Airbnb and Vrbo pay the owner directly under their payout rules and the Management Agreement.</p>
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
