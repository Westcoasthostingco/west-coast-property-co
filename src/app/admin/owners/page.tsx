import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, LinkButton, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { getAllProperties, getOwners, getPayouts, money } from "@/lib/data";

export const metadata: Metadata = { title: "Owners" };

export default async function AdminOwners({ searchParams }: PageProps<"/admin/owners">) {
  const sp = await searchParams;
  const [owners, props, payouts] = await Promise.all([getOwners(), getAllProperties(), getPayouts()]);
  return (
    <>
      <PageHeader eyebrow="Partners" title="Owners" intro={`${owners.length} owners · ${props.length} homes`} actions={<LinkButton href="/admin/owners/new">+ New owner</LinkButton>} />
      <Notice searchParams={sp} />
      <DataTable head={["Owner", "Email", "Homes", "Fee", "Paid to date", "Scheduled", "Stripe payouts"]}
        rows={owners.map((o) => {
          const mine = payouts.filter((x) => x.ownerId === o.id);
          return [
            <Link key="n" href={`/admin/owners/${o.id}`} className="font-medium text-charcoal hover:text-deep">{o.name}</Link>,
            o.email, props.filter((p) => p.ownerId === o.id).map((p) => p.name).join(", ") || "—", `${o.feePercent}%`,
            money(mine.filter((x) => x.status === "paid").reduce((s, x) => s + x.net, 0)),
            money(mine.filter((x) => x.status === "scheduled").reduce((s, x) => s + x.net, 0)),
            <Pill key="s" value={o.payoutsReady ? "configured" : "pending"} />,
          ];
        })} />
    </>
  );
}
