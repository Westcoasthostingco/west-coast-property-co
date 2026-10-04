import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, LinkButton, Notice, PageHeader } from "@/components/admin/ui";
import { getAllProperties, getBookings, getFeeOverrides, getOwners, money } from "@/lib/data";
import { addDays, todayISO } from "@/lib/admin";
import { feeTermsLabel, feeTermsLookup, isOwnerStay, stayFees } from "@/lib/metrics";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Owners" };

export default async function AdminOwners({ searchParams }: PageProps<"/admin/owners">) {
  await requireRole("admin"); // S1: pages must not rely on the layout for auth
  const sp = await searchParams;
  const [owners, props, bookings, feeOverrides] = await Promise.all([getOwners(), getAllProperties(), getBookings(), getFeeOverrides()]);
  // Last 12 months of guest stays by check-in. Management fees: fixed fee per stay plus the
  // percentage where the nights subtotal is recorded.
  const termsFor = feeTermsLookup(props, owners, feeOverrides);
  const today = todayISO();
  const since = addDays(today, -365);
  const recent = bookings.filter((b) => b.checkIn >= since && b.checkIn <= today && b.status !== "cancelled" && b.status !== "pending" && !isOwnerStay(b));
  return (
    <>
      <PageHeader eyebrow="Partners" title="Owners" intro={`${owners.length} owners · ${props.length} homes`} actions={<LinkButton href="/admin/owners/new">+ New owner</LinkButton>} />
      <Notice searchParams={sp} />
      <DataTable head={["Owner", "Email", "Homes", "Fee", "Stays, 12 mo", "Fees, 12 mo"]}
        rows={owners.map((o) => {
          const homeIds = new Set(props.filter((p) => p.ownerId === o.id).map((p) => p.id));
          const mine = recent.filter((b) => homeIds.has(b.propertyId));
          return [
            <Link key="n" href={`/admin/owners/${o.id}`} className="font-medium text-charcoal hover:text-deep">{o.name}</Link>,
            o.email, props.filter((p) => p.ownerId === o.id).map((p) => p.name).join(", ") || "—", feeTermsLabel(o),
            mine.length,
            money(mine.reduce((s, b) => s + (stayFees(b, termsFor(b.propertyId))?.managementFeeCents ?? 0), 0) / 100),
          ];
        })} />
    </>
  );
}
